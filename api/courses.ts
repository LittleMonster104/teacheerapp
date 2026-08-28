import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getProgressMap, upsertProgress, getOrCreateWallet, isMemberActive, adjustCredits } from "./queries/app";
import { callLLM, LLM_API_KEY } from "./llm";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

const EVAL_SYSTEM = `你是「师语AI」教师培训平台的课程助教，负责批改教师的实操作业。
严格按课程给出的评分量规评估，输出格式固定为：
【评分】X 星（1-5 的整数）
【亮点】两条具体的优点（引用作业原文）
【建议】两条可操作的改进建议
【示范】一个简短的优秀示范要点
语气专业而鼓励，像教研员面批。总长度控制在 250 字以内。`;

export const courseRouter = createRouter({
  // 我的全部课程进度
  myProgress: authedQuery.query(({ ctx }) => getProgressMap(ctx.user.id)),

  // 更新进度（完成一节课）
  mark: authedQuery
    .input(z.object({ courseId: z.string(), completedLessons: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      await upsertProgress(ctx.user.id, input.courseId, input.completedLessons);
      return { ok: true };
    }),

  // 提交实操作业，AI 按量规批改（消耗 1 学分，会员免费）
  evaluate: authedQuery
    .input(
      z.object({
        courseId: z.string(),
        lessonIndex: z.number().int().min(0),
        lessonTitle: z.string(),
        taskPrompt: z.string(),
        rubric: z.string(),
        submission: z.string().min(10, "作业内容至少 10 个字").max(3000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);
      const member = isMemberActive(wallet);
      if (!member && wallet.balance < 1) {
        throw new TRPCError({ code: "FORBIDDEN", message: "CREDITS_EXHAUSTED" });
      }
      if (!LLM_API_KEY) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "AI_NOT_CONFIGURED" });
      }

      const userMsg = `【课程】${input.lessonTitle}\n【作业要求】${input.taskPrompt}\n【评分量规】${input.rubric}\n【教师提交的作业】\n${input.submission}`;

      try {
        const feedback = await callLLM(EVAL_SYSTEM, [{ role: "user", content: userMsg }]);
        const scoreMatch = feedback.match(/【评分】\s*(\d)/);
        const score = scoreMatch ? Math.min(5, Math.max(1, parseInt(scoreMatch[1]))) : null;

        const db = getDb();
        await db.insert(schema.lessonSubmissions).values({
          userId: ctx.user.id,
          courseId: input.courseId,
          lessonIndex: input.lessonIndex,
          lessonTitle: input.lessonTitle,
          submission: input.submission,
          feedback,
          score,
        });
        if (!member) await adjustCredits(ctx.user.id, -1, `实操作业批改（${input.lessonTitle}）`);
        const updated = await getOrCreateWallet(ctx.user.id);
        return { feedback, score, balance: updated.balance };
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `批改失败：${(e as Error).message}`,
        });
      }
    }),

  // 我的作业档案（成果档案袋）
  mySubmissions: authedQuery.query(({ ctx }) =>
    getDb()
      .select()
      .from(schema.lessonSubmissions)
      .where(eq(schema.lessonSubmissions.userId, ctx.user.id))
      .orderBy(desc(schema.lessonSubmissions.createdAt))
      .limit(100),
  ),
});
