import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import z from "zod";

export const organizerRouter = router({
  getByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { username } = input;
        const { db } = ctx;

        const organizer = await db.organizer.findUnique({
          where: {
            username,
          },
        });

        return organizer;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
