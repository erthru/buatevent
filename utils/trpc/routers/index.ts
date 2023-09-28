import { router } from "..";
import { userRouter } from "./user";
import { eventRouter } from "./event";

export const appRouter = router({
  user: userRouter,
  event: eventRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
