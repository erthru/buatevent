import { PrismaClient } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const userRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    const { id } = ctx;

    try {
      const user = await prisma.user.findUnique({
        include: {
          admin: true,
          customer: true,
        },
        where: {
          id,
        },
      });

      return user;
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
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

        const user = await prisma.user.findUnique({
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
        if (err.message === "login failed") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: err.message,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message,
          });
        }
      }
    }),

  updateCustomer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { name } = input;
        const { id } = ctx;

        const user = await prisma.user.findUnique({
          include: {
            customer: true,
          },
          where: {
            id,
          },
        });

        const customer = await prisma.customer.update({
          data: {
            name,
          },
          where: {
            id: user?.customer?.id,
          },
        });

        return customer;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
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

        const user = await prisma.user.update({
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
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
