import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";

const db = new PrismaClient();

/** * Creates context for an incoming request * @link https://trpc.io/docs/context */
export const createContext = (event: any) => {
  return {
    event,
    db,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
