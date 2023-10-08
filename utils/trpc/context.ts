import { inferAsyncReturnType } from "@trpc/server";

/** * Creates context for an incoming request * @link https://trpc.io/docs/context */
export const createContext = (event: any) => {
  return {
    event,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
