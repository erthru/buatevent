import { router } from "..";
import { userRouter } from "./user";
import { eventRouter } from "./event";
import { externalRouter } from "./external";

export const appRouter = router({
  user: userRouter,
  event: eventRouter,
  external: externalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
