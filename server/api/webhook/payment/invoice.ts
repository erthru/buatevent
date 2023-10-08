import { PrismaClient } from "@prisma/client";

const { paymentWebhookKey } = useRuntimeConfig();
const db = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 400,
        statusMessage: "method not allowed",
      });
    }

    const callbackToken = event.node.req.headers["x-callback-token"];

    if (callbackToken !== paymentWebhookKey) {
      throw createError({
        statusCode: 403,
        statusMessage: "forbidden",
      });
    }

    const { external_id: externalId, status } = await readBody(event);
    const eventMemberId = Number(externalId.replaceAll("event-member-", ""));

    if (eventMemberId) {
      await db.eventMember.update({
        data: {
          status,
        },
        where: {
          id: eventMemberId,
        },
      });
    }

    return {
      message: "success",
    };
  } catch (err: any) {
    throw createError(err);
  }
});
