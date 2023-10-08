import { PrismaClient } from "@prisma/client";
import { sendTicket } from "~/utils/mailer";

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

    const eventMemberId = Number(externalId.replaceAll("invoice-event-member-", ""));

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

        await sendTicket(
          eventMember.name,
          eventMember.email,
          eventMember.eventTicket.event.title,
          eventMember.eventTicket.name,
          eventMember.validationCode
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
