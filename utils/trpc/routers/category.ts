import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";

export const categoryRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const { db } = ctx;

      const categories = await db.category.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return categories;
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
      });
    }
  }),
});
