import { router } from "..";
import { userRouter } from "./user";
import { eventRouter } from "./event";
import { categoryRouter } from "./category";

export const appRouter = router({
  user: userRouter,
  event: eventRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
