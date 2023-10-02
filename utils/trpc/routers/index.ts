import { router } from "..";
import { userRouter } from "./user";
import { eventRouter } from "./event";
import { categoryRouter } from "./category";
import { eventTicketRouter } from "./event-ticket";

export const appRouter = router({
  user: userRouter,
  event: eventRouter,
  eventTicket: eventTicketRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
