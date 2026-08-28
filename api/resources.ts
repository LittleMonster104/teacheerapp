import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  listResources,
  createResource,
  findResourceById,
  recordDownload,
  listMyResources,
  getOrCreateWallet,
  isMemberActive,
  adjustCredits,
} from "./queries/app";

export const resourceRouter = createRouter({
  // 公开浏览资源库
  list: publicQuery
    .input(z.object({ subject: z.string().optional(), type: z.string().optional() }))
    .query(({ input }) => listResources(input)),

  // 发布资源（登录用户）
  publish: authedQuery
    .input(
      z.object({
        title: z.string().min(2).max(100),
        type: z.string().min(1),
        subject: z.string().min(1),
        stage: z.string().min(1),
        description: z.string().max(500).optional(),
        content: z.string().min(20, "内容至少 20 字"),
        points: z.number().int().min(0).max(100).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await createResource({ ...input, authorId: ctx.user.id, authorName: ctx.user.name });
      return { ok: true };
    }),

  // 下载：免费资源直接下载；收费资源扣积分，作者获得 70% 分成
  download: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const res = await findResourceById(input.id);
      if (!res) throw new TRPCError({ code: "NOT_FOUND", message: "资源不存在" });

      const isAuthor = res.authorId === ctx.user.id;
      const record = await recordDownload(ctx.user.id, res.id);

      if (!isAuthor && res.points > 0 && record.firstTime) {
        const wallet = await getOrCreateWallet(ctx.user.id);
        if (!isMemberActive(wallet) && wallet.balance < res.points) {
          throw new TRPCError({ code: "FORBIDDEN", message: "CREDITS_EXHAUSTED" });
        }
        await adjustCredits(ctx.user.id, -res.points, `下载资源「${res.title}」`);
        const authorShare = Math.floor(res.points * 0.7);
        if (authorShare > 0) {
          await getOrCreateWallet(res.authorId);
          await adjustCredits(res.authorId, authorShare, `资源「${res.title}」被下载分成`);
        }
      }
      return { ok: true, title: res.title, content: res.content };
    }),

  // 我发布的资源
  mine: authedQuery.query(({ ctx }) => listMyResources(ctx.user.id)),
});
