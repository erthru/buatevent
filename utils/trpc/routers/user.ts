import { router, publicProcedure, protectedProcedure } from "..";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { formatPhoneNumber } from "~/utils/helpers";
import { PrismaClient } from "@prisma/client";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";

const db = new PrismaClient();

export const userRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    const { id } = ctx;

    try {
      const user = await db.user.findUnique({
        include: {
          admin: true,
          organizer: true,
        },
        where: {
          id,
        },
      });

      return user;
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

  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        username: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { name, phone, username, email, password } = input;
        const encryptedPassword = await bcrypt.hash(password, 10);

        const organizer = await db.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              password: encryptedPassword,
              role: "ORGANIZER",
              isActive: true,
            },
          });

          const _organizer = await tx.organizer.create({
            data: {
              username,
              name,
              avatar: "",
              phone: formatPhoneNumber(phone),
              balance: 0,
              userId: user.id,
            },
          });

          return _organizer;
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

  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { email, password } = input;
        const { tokenSecret } = useRuntimeConfig();
        const { event } = ctx;

        const user = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "login failed",
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "login failed",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
          },
          tokenSecret,
          {
            expiresIn: "30d",
          }
        );

        setCookie(event, "token", token, {
          maxAge: 30 * 24 * 60 * 60,
        });

        return user;
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

  updatePassword: protectedProcedure
    .input(
      z.object({
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { password } = input;
        const { id } = ctx;

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.update({
          data: {
            password: encryptedPassword,
          },
          where: {
            id,
          },
        });

        return user;
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
