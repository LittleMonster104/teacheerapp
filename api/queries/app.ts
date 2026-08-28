import { and, desc, eq, sql } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";
import { FREE_CREDITS } from "@contracts/agents";

// ===== 钱包 =====
export async function getOrCreateWallet(userId: number) {
  const db = getDb();
  const rows = await db.select().from(schema.wallets).where(eq(schema.wallets.userId, userId)).limit(1);
  if (rows[0]) return rows[0];
  await db.insert(schema.wallets).values({ userId, balance: FREE_CREDITS, plan: "free" });
  await db.insert(schema.creditTransactions).values({
    userId,
    delta: FREE_CREDITS,
    reason: "新用户注册赠送额度",
  });
  const created = await db.select().from(schema.wallets).where(eq(schema.wallets.userId, userId)).limit(1);
  return created[0];
}

export function isMemberActive(wallet: schema.Wallet): boolean {
  if (wallet.plan === "free") return false;
  if (!wallet.planExpiresAt) return false;
  return wallet.planExpiresAt.getTime() > Date.now();
}

export async function adjustCredits(userId: number, delta: number, reason: string) {
  const db = getDb();
  await db
    .update(schema.wallets)
    .set({ balance: sql`GREATEST(balance + ${delta}, 0)` })
    .where(eq(schema.wallets.userId, userId));
  await db.insert(schema.creditTransactions).values({ userId, delta, reason });
}

export async function listTransactions(userId: number, limit = 20) {
  return getDb()
    .select()
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.userId, userId))
    .orderBy(desc(schema.creditTransactions.createdAt))
    .limit(limit);
}

// ===== 聊天 =====
export async function saveMessage(userId: number, agentId: string, role: "user" | "assistant", content: string) {
  await getDb().insert(schema.chatMessages).values({ userId, agentId, role, content });
}

export async function getHistory(userId: number, agentId: string, limit = 50) {
  const rows = await getDb()
    .select()
    .from(schema.chatMessages)
    .where(and(eq(schema.chatMessages.userId, userId), eq(schema.chatMessages.agentId, agentId)))
    .orderBy(desc(schema.chatMessages.createdAt))
    .limit(limit);
  return rows.reverse();
}

// ===== 资源库 =====
export async function listResources(opts: { subject?: string; type?: string; limit?: number }) {
  const db = getDb();
  const conds = [];
  if (opts.subject && opts.subject !== "全部") conds.push(eq(schema.resources.subject, opts.subject));
  if (opts.type && opts.type !== "全部") conds.push(eq(schema.resources.type, opts.type));
  return db
    .select()
    .from(schema.resources)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(schema.resources.createdAt))
    .limit(opts.limit ?? 60);
}

export async function createResource(data: {
  authorId: number;
  authorName?: string | null;
  title: string;
  type: string;
  subject: string;
  stage: string;
  description?: string | null;
  content: string;
  points?: number;
}) {
  await getDb().insert(schema.resources).values(data);
}

export async function findResourceById(id: number) {
  const rows = await getDb().select().from(schema.resources).where(eq(schema.resources.id, id)).limit(1);
  return rows.at(0);
}

export async function recordDownload(userId: number, resourceId: number) {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.resourceDownloads)
    .where(and(eq(schema.resourceDownloads.userId, userId), eq(schema.resourceDownloads.resourceId, resourceId)))
    .limit(1);
  if (existing.length > 0) return { firstTime: false };
  await db.insert(schema.resourceDownloads).values({ userId, resourceId });
  await db.update(schema.resources).set({ downloads: sql`downloads + 1` }).where(eq(schema.resources.id, resourceId));
  return { firstTime: true };
}

export async function listMyResources(userId: number) {
  return getDb()
    .select()
    .from(schema.resources)
    .where(eq(schema.resources.authorId, userId))
    .orderBy(desc(schema.resources.createdAt));
}

// ===== 课程进度 =====
export async function getProgressMap(userId: number) {
  return getDb().select().from(schema.courseProgress).where(eq(schema.courseProgress.userId, userId));
}

export async function upsertProgress(userId: number, courseId: string, completedLessons: number) {
  const db = getDb();
  await db
    .insert(schema.courseProgress)
    .values({ userId, courseId, completedLessons })
    .onDuplicateKeyUpdate({ set: { completedLessons } });
}

// ===== 兑换码 =====
export async function findCode(code: string) {
  const rows = await getDb().select().from(schema.redemptionCodes).where(eq(schema.redemptionCodes.code, code)).limit(1);
  return rows.at(0);
}

export async function useCode(id: number, userId: number) {
  const db = getDb();
  await db.update(schema.redemptionCodes).set({ usedBy: userId, usedAt: new Date() }).where(eq(schema.redemptionCodes.id, id));
}

export async function upgradePlan(userId: number, plan: "member" | "camp", months: number) {
  const db = getDb();
  const wallet = await getOrCreateWallet(userId);
  const base =
    wallet.planExpiresAt && wallet.planExpiresAt.getTime() > Date.now() ? wallet.planExpiresAt : new Date();
  const expires = new Date(base.getTime() + months * 30 * 24 * 3600 * 1000);
  await db.update(schema.wallets).set({ plan, planExpiresAt: expires }).where(eq(schema.wallets.userId, userId));
  return expires;
}
