import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "..";
import { z } from "zod";
import dns from "dns";

export const externalRouter = router({
  resolveCname: publicProcedure
    .input(
      z.object({
        domain: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { domain } = input;

        const realDomain = await new Promise((resolve, reject) => {
          dns.resolveCname(domain, (error, addresses) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(addresses[0]);
          });
        });

        return realDomain;
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    }),
});
