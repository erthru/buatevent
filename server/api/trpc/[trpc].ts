import { createNuxtApiHandler } from "trpc-nuxt";
import { appRouter } from "~/utils/trpc/routers";
import { createContext } from "~/utils/trpc/context";

// export API handler
export default createNuxtApiHandler({ router: appRouter, createContext });
