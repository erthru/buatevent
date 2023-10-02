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
        const { id: userId, db } = ctx;
        const { id } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            userId,
          },
        });

        const event = await db.event.findUnique({
          include: {
            _count: {
              select: {
                eventTickets: true,
              },
            },
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
          code:
            err.message === "unauthorized"
              ? "UNAUTHORIZED"
              : "INTERNAL_SERVER_ERROR",
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
            category: true,
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
            category: true,
            organizer: true,
            eventTickets: true,
          },
          where: {
            slug,
            organizerId: organizer?.id,
          },
        });

        if (!event?.isPublished) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "not found",
          });
        }

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
        categoryId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          title,
          thumbnail,
          body,
          startAt,
          endAt,
          type,
          isPublished,
          categoryId,
        } = input;

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
            categoryId,
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

        await db.eventTicket.create({
          data: {
            name: "Free",
            description: "Initial free tickets for the first 100 members",
            price: 0,
            quota: 100,
            eventId: event.id,
          },
        });

        return event;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        thumbnail: z.string(),
        body: z.string(),
        startAt: z.string(),
        endAt: z.string(),
        type: z.enum(["ONLINE", "OFFLINE", "BOTH"]),
        isPublished: z.boolean(),
        categoryId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          id,
          title,
          thumbnail,
          body,
          startAt,
          endAt,
          type,
          isPublished,
          categoryId,
        } = input;

        const { db, id: userId } = ctx;

        const organizer = await db.organizer.findUnique({
          where: {
            userId,
          },
        });

        let event = await db.event.findUnique({
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

        event = await db.event.update({
          data: {
            title,
            slug: title !== event?.title ? generateSlug(title) : undefined,
            body,
            startAt,
            endAt,
            type,
            isPublished,
            categoryId,
          },
          where: {
            id,
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
          code:
            err.message === "unauthorized"
              ? "UNAUTHORIZED"
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { db, id: userId } = ctx;
        const { id } = input;

        const organizer = await db.organizer.findUnique({
          where: {
            userId,
          },
        });

        const event = await db.event.findUnique({
          include: {
            _count: {
              select: {
                eventMembers: true,
              },
            },
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

        if ((event?._count?.eventMembers || 0) > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "cannot delete, member exists",
          });
        }

        await db.eventTicket.deleteMany({
          where: {
            eventId: event?.id,
          },
        });

        await db.event.delete({
          where: {
            id,
          },
        });
      } catch (err: any) {
        throw new TRPCError({
          code:
            err.message === "unauthorized"
              ? "UNAUTHORIZED"
              : err.message.includes("cannot delete")
              ? "FORBIDDEN"
              : "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
