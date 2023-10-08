import { router } from "..";
import { userRouter } from "./user";
import { eventRouter } from "./event";
import { categoryRouter } from "./category";
import { eventTicketRouter } from "./event-ticket";
import { eventMemberRouter } from "./event-member";
import { organizerRouter } from "./organizer";
import { adminRouter } from "./admin";

export const appRouter = router({
  user: userRouter,
  event: eventRouter,
  eventTicket: eventTicketRouter,
  eventMember: eventMemberRouter,
  category: categoryRouter,
  organizer: organizerRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
