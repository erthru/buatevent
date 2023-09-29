import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { generateSlug } from "@/utils/helpers";

export const eventRouter = router({
  getAllByOrganizer: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { id, db } = ctx;

      const organizer = await db.organizer.findUnique({
        where: {
          userId: id,
        },
      });

      const events = await db.event.findMany({
        where: {
          organizerId: organizer?.id,
        },
        orderBy: {
          id: "desc",
        },
      });

      return events;
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
      });
    }
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const { id: _id, db } = ctx;
        const { id } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            userId: _id,
          },
        });

        const event = await db.event.findUnique({
          include: {
            eventTickets: true,
          },
          where: {
            id,
          },
        });

        if (event?.organizerId !== organizer?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "unauthorized",
          });
        }

        return event;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  getAllByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { db } = ctx;
        const { username } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            username,
          },
        });

        if (!organizer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "not found",
          });
        }

        const events = await db.event.findMany({
          include: {
            organizer: true,
          },
          where: {
            organizerId: organizer?.id,
          },
        });

        return events;
      } catch (err: any) {
        throw new TRPCError({
          code:
            err.message === "not found" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  getByUsernameAndSlug: publicProcedure
    .input(
      z.object({
        username: z.string(),
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { db } = ctx;
        const { username, slug } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            username,
          },
        });

        if (!organizer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "not found",
          });
        }

        const event = await db.event.findUnique({
          include: {
            organizer: true,
            eventTickets: true,
          },
          where: {
            slug,
            organizerId: organizer?.id,
          },
        });

        return event;
      } catch (err: any) {
        throw new TRPCError({
          code:
            err.message === "not found" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  add: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        thumbnail: z.string(),
        body: z.string(),
        startAt: z.string(),
        endAt: z.string(),
        type: z.enum(["ONLINE", "OFFLINE", "BOTH"]),
        isPublished: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { title, thumbnail, body, startAt, endAt, type, isPublished } =
          input;

        const { db, id } = ctx;

        const organizer = await db.organizer.findUnique({
          where: {
            userId: id,
          },
        });

        let event = await db.event.create({
          data: {
            title,
            slug: generateSlug(title),
            thumbnail: "",
            body,
            startAt,
            endAt,
            type,
            isPublished,
            organizerId: organizer?.id!!,
          },
        });

        if (thumbnail) {
          const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = thumbnail.split(";")[0].split("/")[1];
          const name = `thumbnail-${unique}.${ext}`;

          const fileBuffer = Buffer.from(
            thumbnail.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );

          await writeFile(`./public/uploads/${name}`, fileBuffer);

          event = await db.event.update({
            data: {
              thumbnail: name,
            },
            where: {
              id: event.id,
            },
          });
        }

        return event;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
