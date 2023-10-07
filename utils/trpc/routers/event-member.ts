import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import z from "zod";
import { generateUniqueString } from "~/utils/helpers";
import { sendEmail } from "~/utils/mailer";

const { paymentApiUrl, paymentSecretKey } = useRuntimeConfig();

export const eventMemberRouter = router({
  buyTicket: publicProcedure
    .input(
      z.object({
        eventTicketId: z.number(),
        name: z.string(),
        phone: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { db } = ctx;
        const { eventTicketId, name, phone, email } = input;

        const eventTicket = await db.eventTicket.findUnique({
          include: {
            event: true,
          },
          where: {
            id: eventTicketId,
          },
        });

        let [eventMember, paidEventMembers] = await Promise.all([
          db.eventMember.findFirst({
            where: {
              email,
              eventTicketId,
            },
          }),
          db.eventMember.count({
            where: {
              eventTicketId: eventTicket?.id,
              status: "PAID",
            },
          }),
        ]);

        if (eventTicket?.quota!! - paidEventMembers === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "quota is full",
          });
        }

        if (eventMember && eventMember.status === "PAID") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "member registered & paid",
          });
        }

        if (eventMember && eventMember.status === "UNPAID") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "member registered & unpaid",
          });
        }

        if (eventMember && eventMember.status === "EXPIRED") {
          eventMember = await db.eventMember.update({
            data: {
              name,
              phone,
              status: "UNPAID",
            },
            where: {
              id: eventMember.id,
            },
          });
        } else {
          eventMember = await db.eventMember.create({
            data: {
              validationCode: generateUniqueString(),
              name,
              phone,
              email,
              status: eventTicket?.price ? "UNPAID" : "PAID",
              invoiceId: "",
              invoiceLink: eventTicket?.price ? "undefined" : "",
              eventTicketId,
            },
          });

          if (eventTicket?.price) {
            const res = await $fetch(`${paymentApiUrl}/v2/invoices`, {
              method: "post",
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${paymentSecretKey}:`
                ).toString("base64")}`,
              },
              body: {
                external_id: `event-member-${eventMember.id}`,
                amount: eventTicket.price,
                customer: {
                  given_names: name,
                  email,
                  mobile_number: `+62${phone}`,
                },
                invoice_duration: 84600,
                currency: "IDR",
                items: [
                  {
                    name: `${eventTicket.name} from ${eventTicket.event.title}`,
                    quantity: 1,
                    price: eventTicket.price,
                  },
                ],
              },
            });

            eventMember = await db.eventMember.update({
              data: {
                invoiceId: (res as any).id,
                invoiceLink: (res as any).invoice_url,
              },
              where: {
                id: eventMember.id,
              },
            });
          }
        }

        if (eventTicket?.price) {
          const html = `
            <p>Terima kasih ${name} telah menggunakan platform Buat Event, berikut detail pembayaran untuk tiket anda:</p>
            <p>Acara: ${eventTicket.event.title}</p>
            <p>Jenis Tiket: ${eventTicket.name}</p>
            <p>Harga: Rp ${eventTicket.price.toLocaleString()}</p>
            <p>Silahkan klik link berikut untuk masuk ke menu pembayaran: <a href="${
              eventMember.invoiceLink
            }">${eventMember.invoiceLink}</a></p>
          `;

          await sendEmail(
            email,
            `Pembayaran untuk Ticket ${eventTicket.name} dari ${eventTicket.event.title} | Buat Event`,
            html
          );
        } else {
          const html = `
            <p>Terima kasih ${name} telah menggunakan platform Buat Event, berikut detail tiket anda:</p>
            <p>Acara: ${eventTicket?.event.title}</p>
            <p>Jenis Tiket: ${eventTicket?.name}</p>
            <p>Kode Validasi: ${eventMember.validationCode}</p>
          `;

          await sendEmail(
            email,
            `Detail Ticket ${eventTicket?.name} dari ${eventTicket?.event.title} | Buat Event`,
            html
          );
        }

        return eventMember;
      } catch (err: any) {
        throw new TRPCError({
          code: err.message.includes("member")
            ? "FORBIDDEN"
            : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
