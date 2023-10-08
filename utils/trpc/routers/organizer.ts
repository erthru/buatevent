import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import { formatPhoneNumber, generateUniqueString } from "~/utils/helpers";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import bcrypt from "bcrypt";

const db = new PrismaClient();
const { paymentApiUrl, paymentSecretKey } = useRuntimeConfig();

export const organizerRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { id } = ctx;

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

      const organizers = await db.organizer.findMany();
      return organizers;
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
        throw new TRPCError({
          code:
            (err?.code || "INTERNAL_SERVER_ERROR") in TRPC_ERROR_CODES_BY_KEY
              ? err.code
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  withdraw: protectedProcedure
    .input(
      z.object({
        bank: z.string(),
        accountHolder: z.string(),
        accountNumber: z.string(),
        amount: z.number(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = ctx;
        const { bank, accountHolder, accountNumber, amount, password } = input;

        const user = await db.user.findUnique({
          include: {
            organizer: true,
          },
          where: {
            id,
          },
        });

        const isPasswordValid = await bcrypt.compare(
          password,
          user?.password!!
        );

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "password invalid",
          });
        }

        await $fetch(`${paymentApiUrl}/v2/payouts`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${paymentSecretKey}:`
            ).toString("base64")}`,
            "idempotency-key": generateUniqueString(),
          },
          body: {
            reference_id: `withdraw-organizer-${user?.organizer?.id}`,
            channel_code: bank,
            channel_properties: {
              account_holder_name: accountHolder,
              account_number: accountNumber,
            },
            amount,
            currency: "IDR",
          },
        });

        await db.organizer.update({
          data: {
            balance: user?.organizer?.balance!! - amount - 6500,
          },
          where: {
            id: user?.organizer?.id,
          },
        });
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
        avatar: z.string(),
        phone: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, avatar, phone } = input;
        const { id } = ctx;

        const user = await db.user.findUnique({
          include: {
            organizer: true,
          },
          where: {
            id,
          },
        });

        let organizer = await db.organizer.update({
          data: {
            name,
            phone: formatPhoneNumber(phone),
          },
          where: {
            id: user?.organizer?.id,
          },
        });

        if (avatar) {
          const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = avatar.split(";")[0].split("/")[1];
          const name = `avatar-${unique}.${ext}`;

          const fileBuffer = Buffer.from(
            avatar.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );

          await writeFile(`./public/uploads/${name}`, fileBuffer);

          organizer = await db.organizer.update({
            data: {
              avatar: name,
            },
            where: {
              id: user?.organizer?.id,
            },
          });
        }

        return organizer;
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
