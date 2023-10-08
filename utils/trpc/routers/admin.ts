import { router, protectedProcedure } from "..";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";

const db = new PrismaClient();
const { paymentApiUrl, paymentSecretKey } = useRuntimeConfig();

export const adminRouter = router({
  getAccumulativeBalance: protectedProcedure.query(async ({ ctx }) => {
    const { id } = ctx;

    try {
      const user = await db.user.findUnique({
        where: {
          id,
        },
      });

      if (user?.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "unauthorized",
        });
      }

      const res = await $fetch(`${paymentApiUrl}/balance?currency=IDR`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${paymentSecretKey}:`).toString(
            "base64"
          )}`,
        },
      });

      return (res as any).balance;
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

  update: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { name } = input;
        const { id } = ctx;

        const user = await db.user.findUnique({
          include: {
            admin: true,
          },
          where: {
            id,
          },
        });

        let admin = await db.admin.update({
          data: {
            name,
          },
          where: {
            id: user?.admin?.id,
          },
        });

        return admin;
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
