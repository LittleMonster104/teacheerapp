import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getAgentSpec, AGENTS } from "@contracts/agents";
import { callLLM, LLM_API_KEY } from "./llm";
import {
  getOrCreateWallet,
  isMemberActive,
  adjustCredits,
  saveMessage,
  getHistory,
} from "./queries/app";

export const chatRouter = createRouter({
  // 各智能体会话历史
  history: authedQuery
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await getHistory(ctx.user.id, input.agentId);
      return rows.map((r) => ({ role: r.role, content: r.content, createdAt: r.createdAt }));
    }),

  // 发送消息（扣额度，真实调用模型）
  send: authedQuery
    .input(z.object({ agentId: z.string(), message: z.string().min(1).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const spec = getAgentSpec(input.agentId);
      if (!spec) throw new TRPCError({ code: "BAD_REQUEST", message: "未知智能体" });

      const wallet = await getOrCreateWallet(ctx.user.id);
      const member = isMemberActive(wallet);

      // 学科层智能体仅会员可用
      if (spec.pro && !member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "PRO_REQUIRED" });
      }
      // 免费用户扣学分
      if (!member && wallet.balance < 1) {
        throw new TRPCError({ code: "FORBIDDEN", message: "CREDITS_EXHAUSTED" });
      }
      if (!LLM_API_KEY) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "AI_NOT_CONFIGURED" });
      }

      await saveMessage(ctx.user.id, spec.id, "user", input.message);
      const history = (await getHistory(ctx.user.id, spec.id, 12)).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const reply = await callLLM(spec.systemPrompt, history);
        await saveMessage(ctx.user.id, spec.id, "assistant", reply);
        if (!member) {
          await adjustCredits(ctx.user.id, -1, `${spec.name} 对话`);
        }
        const updated = await getOrCreateWallet(ctx.user.id);
        return { reply, balance: updated.balance, member };
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `AI 服务暂时不可用：${(e as Error).message}`,
        });
      }
    }),

  // 智能体清单（含 pro 标记，供前端展示权益）
  agents: authedQuery.query(() => AGENTS.map((a) => ({ id: a.id, name: a.name, pro: a.pro }))),
});
