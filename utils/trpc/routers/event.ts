import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";

export const eventRouter = router({
  getAllByOrganizer: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { id, db } = ctx;

      const organizer = await db.organizer.findUnique({
        where: {
          userId: id,
        },
      });

      const events = await db.event.findMany({
        where: {
          organizerId: organizer?.id,
        },
        orderBy: {
          id: "desc",
        },
      });

      return events;
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
      });
    }
  }),
});
