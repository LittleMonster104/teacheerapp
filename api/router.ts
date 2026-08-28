import { authRouter } from "./auth-router";
import { localAuthRouter } from "./auth-local";
import { createRouter, publicQuery } from "./middleware";
import { chatRouter } from "./chat";
import { accountRouter } from "./account";
import { resourceRouter } from "./resources";
import { courseRouter } from "./courses";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  chat: chatRouter,
  account: accountRouter,
  resources: resourceRouter,
  course: courseRouter,
});

export type AppRouter = typeof appRouter;
