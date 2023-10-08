import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import z from "zod";
import { generateUniqueString } from "~/utils/helpers";
import { sendInvoice, sendTicket } from "~/utils/mailer";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const { paymentApiUrl, paymentSecretKey } = useRuntimeConfig();

export const eventMemberRouter = router({
  getAllByEventId: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { eventId } = input;
        const { id } = ctx;

        const [organizer, event] = await Promise.all([
          db.organizer.findUnique({
            where: {
              userId: id,
            },
          }),
          db.event.findUnique({
            where: {
              id: eventId,
            },
          }),
        ]);

        if (organizer?.id !== event?.organizerId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        const eventMembers = await db.eventMember.findMany({
          include: {
            eventTicket: true,
          },
          where: {
            eventTicket: {
              eventId,
            },
          },
        });

        return eventMembers;
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),

  buyTicket: publicProcedure
    .input(
      z.object({
        eventTicketId: z.number(),
        name: z.string(),
        phone: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
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
              OR: [
                {
                  status: "PAID",
                },
                {
                  status: "UNPAID",
                },
              ],
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
                invoice_duration: 1800,
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
          await sendInvoice(
            name,
            email,
            eventTicket.event.title,
            eventTicket.name,
            eventTicket.price,
            eventMember.invoiceLink
          );
        } else {
          await sendTicket(
            name,
            email,
            eventTicket?.event.title!!,
            eventTicket?.name!!,
            eventMember.validationCode
          );
        }

        return eventMember;
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),

  sendInvoice: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id: userId } = ctx;
        const { id } = input;

        const [organizer, eventMember] = await Promise.all([
          db.organizer.findUnique({
            where: {
              userId,
            },
          }),
          db.eventMember.findUnique({
            include: {
              eventTicket: {
                include: {
                  event: true,
                },
              },
            },
            where: {
              id,
            },
          }),
        ]);

        if (organizer?.id !== eventMember?.eventTicket.event.organizerId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        await sendInvoice(
          eventMember?.name!!,
          eventMember?.email!!,
          eventMember?.eventTicket.event.title!!,
          eventMember?.eventTicket.name!!,
          eventMember?.eventTicket.price!!,
          eventMember?.invoiceLink!!
        );
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),

  sendTicket: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id: userId } = ctx;
        const { id } = input;

        const [organizer, eventMember] = await Promise.all([
          db.organizer.findUnique({
            where: {
              userId,
            },
          }),
          db.eventMember.findUnique({
            include: {
              eventTicket: {
                include: {
                  event: true,
                },
              },
            },
            where: {
              id,
            },
          }),
        ]);

        if (organizer?.id !== eventMember?.eventTicket.event.organizerId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        await sendTicket(
          eventMember?.name!!,
          eventMember?.email!!,
          eventMember?.eventTicket.event.title!!,
          eventMember?.eventTicket.name!!,
          eventMember?.validationCode!!
        );
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["PAID", "UNPAID", "EXPIRED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id: userId } = ctx;
        const { id, status } = input;

        let [organizer, eventMember] = await Promise.all([
          db.organizer.findUnique({
            where: {
              userId,
            },
          }),
          db.eventMember.findUnique({
            include: {
              eventTicket: {
                include: {
                  event: true,
                },
              },
            },
            where: {
              id,
            },
          }),
        ]);

        if (organizer?.id !== eventMember?.eventTicket.event.organizerId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        eventMember = await db.eventMember.update({
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
            id,
          },
        });

        if (status === "PAID") {
          await sendTicket(
            eventMember.name,
            eventMember.email,
            eventMember.eventTicket.event.title,
            eventMember.eventTicket.name,
            eventMember.validationCode
          );
        }

        if (status === "UNPAID") {
          await sendInvoice(
            eventMember.name,
            eventMember.email,
            eventMember.eventTicket.event.title,
            eventMember.eventTicket.name,
            eventMember.eventTicket.price,
            eventMember.invoiceLink
          );
        }

        return eventMember;
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),
});
