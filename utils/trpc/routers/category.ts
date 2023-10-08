import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const categoryRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const categories = await db.category.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return categories;
    } catch (err: any) {
      throw new TRPCError(err);
    }
  }),
});
