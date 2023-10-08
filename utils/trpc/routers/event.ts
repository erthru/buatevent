import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { generateSlug } from "@/utils/helpers";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const eventRouter = router({
  getAllByOrganizer: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { id } = ctx;

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
      throw new TRPCError(err);
    }
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const { id: userId } = ctx;
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
        throw new TRPCError(err);
      }
    }),

  getAllByUsername: publicProcedure
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
            _count: {
              select: {
                eventTickets: true,
              },
            },
          },
          where: {
            organizerId: organizer?.id,
          },
          orderBy: {
            id: "desc",
          },
        });

        return events.filter(
          (event) => event.isPublished === true && event._count.eventTickets > 0
        );
      } catch (err: any) {
        throw new TRPCError(err);
      }
    }),

  getByUsernameAndSlug: publicProcedure
    .input(
      z.object({
        username: z.string(),
        slug: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
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

        if (!event?.isPublished || event.eventTickets.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "not found",
          });
        }

        return event;
      } catch (err: any) {
        throw new TRPCError(err);
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

        const { id } = ctx;

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

        return event;
      } catch (err: any) {
        throw new TRPCError(err);
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

        const { id: userId } = ctx;

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
        throw new TRPCError(err);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id: userId } = ctx;
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

        if (event?._count?.eventTickets) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "cannot delete, ticket exists",
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
        throw new TRPCError(err);
      }
    }),
});
