import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import z from "zod";
import { generateUniqueString } from "~/utils/helpers";

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
          where: {
            id: eventTicketId,
          },
        });

        let eventMember = await db.eventMember.findFirst({
          where: {
            email,
            eventTicketId,
          },
        });

        const paidEventMembers = await db.eventMember.count({
          where: {
            eventTicketId: eventTicket?.id,
            status: "PAID",
          },
        });

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
              eventTicketId,
            },
          });
        }

        if (eventTicket?.price) {
          // send billing invoice to user
        } else {
          // send ticket
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
