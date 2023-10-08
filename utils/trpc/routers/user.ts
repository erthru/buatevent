import { router, publicProcedure, protectedProcedure } from "..";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { writeFile } from "fs/promises";
import { formatPhoneNumber } from "~/utils/helpers";
import { PrismaClient } from "@prisma/client";

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
      throw new TRPCError(err);
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
              avatar: "default.png",
              phone: formatPhoneNumber(phone),
              balance: 0,
              userId: user.id,
            },
          });

          return _organizer;
        });

        return organizer;
      } catch (err: any) {
        throw new TRPCError(err);
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
        throw new TRPCError(err);
      }
    }),

  updateOrganizer: protectedProcedure
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
        throw new TRPCError(err);
      }
    }),

  updateAdmin: protectedProcedure
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
        throw new TRPCError(err);
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
        throw new TRPCError(err);
      }
    }),
});
