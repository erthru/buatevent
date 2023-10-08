/** * This is your entry point to setup the root configuration for tRPC on the server. * - `initTRPC` should only be used once per app. * - We export only the functionality that we use so we can enforce which base procedures should be used * * Learn how to create protected base procedures and other things below: * @see https://trpc.io/docs/v10/router * @see https://trpc.io/docs/v10/procedures */
import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "~/utils/trpc/context";
import jwt from "jsonwebtoken";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";

const t = initTRPC.context<Context>().create(); /** * Unprotected procedure **/
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    const { tokenSecret } = useRuntimeConfig();
    const tokenCookie = getCookie(ctx.event, "token");

    if (!tokenCookie) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "token invalid",
      });
    }

    const verifiedToken = jwt.verify(tokenCookie, tokenSecret) as any;

    return next({
      ctx: {
        id: verifiedToken.id,
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
});

export const router = t.router;
