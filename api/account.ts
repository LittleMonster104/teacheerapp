import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  getOrCreateWallet,
  isMemberActive,
  listTransactions,
  adjustCredits,
  findCode,
  useCode,
  upgradePlan,
} from "./queries/app";

export const accountRouter = createRouter({
  // 我的账户：钱包 + 会员状态 + 最近流水
  me: authedQuery.query(async ({ ctx }) => {
    const wallet = await getOrCreateWallet(ctx.user.id);
    const transactions = await listTransactions(ctx.user.id);
    return {
      balance: wallet.balance,
      plan: wallet.plan,
      planExpiresAt: wallet.planExpiresAt,
      member: isMemberActive(wallet),
      transactions,
    };
  }),

  // 兑换码开通会员 / 充值学分
  redeem: authedQuery
    .input(z.object({ code: z.string().min(4).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const code = await findCode(input.code.trim().toUpperCase());
      if (!code) throw new TRPCError({ code: "NOT_FOUND", message: "兑换码不存在" });
      if (code.usedBy) throw new TRPCError({ code: "BAD_REQUEST", message: "兑换码已被使用" });

      await useCode(code.id, ctx.user.id);
      if (code.kind === "credits") {
        await adjustCredits(ctx.user.id, code.credits, `兑换码充值 ${code.credits} 学分`);
        return { message: `已充值 ${code.credits} 学分` };
      }
      const months = code.kind === "member_year" ? 12 : 1;
      const expires = await upgradePlan(ctx.user.id, "member", months);
      return { message: `会员已开通，有效期至 ${expires.toLocaleDateString("zh-CN")}` };
    }),
});
