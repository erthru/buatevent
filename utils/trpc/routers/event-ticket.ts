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

        const tickets = await db.eventTicket.findMany({
          where: {
            eventId: event?.id,
          },
          orderBy: {
            name: "desc",
          },
        });

        return tickets;
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
