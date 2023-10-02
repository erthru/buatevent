import { observable } from "@trpc/server/observable";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";
import type { AppRouter } from "~/utils/trpc/routers";

export default defineNuxtPlugin(() => {
  const { setError } = useCustomError();

  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCNuxtClient<AppRouter>({
    links: [
      () =>
        ({ next, op }) => {
          return observable((observer) => {
            const unsubscribe = next(op).subscribe({
              next(value) {
                observer.next(value);
              },
              error(err) {
                observer.error(err);

                if (err.message === "token invalid") {
                  setError(401, "token invalid");
                }
              },
              complete() {
                observer.complete();
              },
            });
            return unsubscribe;
          });
        },
      httpBatchLink({
        url: "/api/trpc",
      }),
    ],
  });

  return {
    provide: {
      client,
    },
  };
});
