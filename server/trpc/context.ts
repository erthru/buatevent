import { inferAsyncReturnType } from "@trpc/server";
import db from "@/utils/db";

/** * Creates context for an incoming request * @link https://trpc.io/docs/context */
export const createContext = (event: any) => {
  return {
    event,
    db,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
