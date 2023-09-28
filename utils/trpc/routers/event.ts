import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
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
