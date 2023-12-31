import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import { PrismaClient } from "@prisma/client";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import z from "zod";

const db = new PrismaClient();

export const categoryRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const categories = await db.category.findMany({
        orderBy: {
          name: "asc",
        },
      });

      const otherCategory = categories.find(
        (category) => category.name === "Lainnya"
      );

      const categoriesWithoutOther = categories.filter(
        (category) => category.name !== "Lainnya"
      );

      return [...categoriesWithoutOther, otherCategory];
    } catch (err: any) {
      throw new TRPCError({
        code:
          (err?.code || "INTERNAL_SERVER_ERROR") in TRPC_ERROR_CODES_BY_KEY
            ? err.code
            : "INTERNAL_SERVER_ERROR",
        message: err.message,
      });
    }
  }),

  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { slug } = input;

        const category = await db.category.findUnique({
          where: {
            slug,
          },
        });

        return category;
      } catch (err: any) {
        throw new TRPCError({
          code:
            (err?.code || "INTERNAL_SERVER_ERROR") in TRPC_ERROR_CODES_BY_KEY
              ? err.code
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
