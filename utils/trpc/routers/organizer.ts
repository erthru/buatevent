import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import z from "zod";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const organizerRouter = router({
  getByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { username } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            username,
          },
        });

        return organizer;
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),
});
