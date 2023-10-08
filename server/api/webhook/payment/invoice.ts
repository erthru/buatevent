import { PrismaClient } from "@prisma/client";
import { sendEmail } from "~/utils/mailer";

const { paymentWebhookKey } = useRuntimeConfig();
const db = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 400,
        statusMessage: "method not allowed",
      });
    }

    const callbackToken = event.node.req.headers["x-callback-token"];

    if (callbackToken !== paymentWebhookKey) {
      throw createError({
        statusCode: 403,
        statusMessage: "forbidden",
      });
    }

    const {
      external_id: externalId,
      status,
      paid_amount: paidAmount,
    } = await readBody(event);
    const eventMemberId = Number(externalId.replaceAll("event-member-", ""));

    if (eventMemberId) {
      const eventMember = await db.eventMember.update({
        include: {
          eventTicket: {
            include: {
              event: true,
            },
          },
        },
        data: {
          status,
        },
        where: {
          id: eventMemberId,
        },
      });

      if (status === "PAID" && eventMember) {
        const organizer = await db.organizer.findUnique({
          where: {
            id: eventMember.eventTicket.event.organizerId,
          },
        });

        const html = `
            <p>Terima kasih ${eventMember.name} telah menggunakan platform Buat Event, berikut detail tiket anda:</p>
            <p>Acara: ${eventMember.eventTicket?.event.title}</p>
            <p>Jenis Tiket: ${eventMember.eventTicket?.name}</p>
            <p>Kode Validasi: ${eventMember.validationCode}</p>
          `;

        await sendEmail(
          eventMember.email,
          `Detail Ticket ${eventMember.eventTicket?.name} dari ${eventMember.eventTicket?.event.title} | Buat Event`,
          html
        );

        await db.organizer.update({
          data: {
            balance: organizer?.balance + paidAmount,
          },
          where: {
            id: organizer?.id,
          },
        });
      }
    }

    return {
      message: "success",
    };
  } catch (err: any) {
    throw createError(err);
  }
});
