import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import z from "zod";

export const eventTicketRouter = router({
  getAllByEventId: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { db, id } = ctx;
        const { eventId } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            userId: id,
          },
        });

        const event = await db.event.findUnique({
          where: {
            id: eventId,
          },
        });

        if (event?.organizerId !== organizer?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        const eventTickets = await db.eventTicket.findMany({
          where: {
            eventId: event?.id,
          },
          orderBy: {
            name: "desc",
          },
        });

        return eventTickets;
      } catch (err: any) {
        throw new TRPCError({
          code:
            err.message === "unauthorized"
              ? "UNAUTHORIZED"
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        quota: z.number(),
        eventId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { db, id } = ctx;
        const { name, description, price, quota, eventId } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            userId: id,
          },
        });

        const event = await db.event.findUnique({
          where: {
            id: eventId,
          },
        });

        if (event?.organizerId !== organizer?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        const eventTicket = await db.eventTicket.create({
          data: {
            name,
            description,
            price,
            quota,
            eventId,
          },
        });

        return eventTicket;
      } catch (err: any) {
        throw new TRPCError({
          code:
            err.message === "unauthorized"
              ? "UNAUTHORIZED"
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { db, id: userId } = ctx;
        const { id } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            userId,
          },
        });

        const eventTicket = await db.eventTicket.findUnique({
          include: {
            event: true,
          },
          where: {
            id,
          },
        });

        if (eventTicket?.event.organizerId !== organizer?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        await db.eventTicket.delete({
          where: {
            id,
          },
        });
      } catch (err: any) {
        throw new TRPCError({
          code:
            err.message === "unauthorized"
              ? "UNAUTHORIZED"
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
