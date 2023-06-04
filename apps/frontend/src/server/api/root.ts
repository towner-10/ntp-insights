import { createTRPCRouter } from "@/server/api/trpc";
import { searchRouter } from "./routers/search";
import { usersRouter } from "./routers/users";
import { pathsRouter } from "./routers/path";
import { image360Router } from "./routers/image360";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  search: searchRouter,
  users: usersRouter,
  paths: pathsRouter,
  image360: image360Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
