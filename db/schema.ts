import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  passwordHash: varchar("passwordHash", { length: 255 }), // 本地账号密码登录（Kimi 用户为空）
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== 钱包与会员 =====
export const wallets = mysqlTable("wallets", {
  userId: bigint("userId", { mode: "number", unsigned: true }).primaryKey(),
  balance: int("balance").notNull().default(20), // 免费用户赠送 20 次生成额度
  plan: mysqlEnum("plan", ["free", "member", "camp"]).notNull().default("free"),
  planExpiresAt: timestamp("planExpiresAt"),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ===== 学分流水 =====
export const creditTransactions = mysqlTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  delta: int("delta").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 智能体聊天记录 =====
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 教学资源库（UGC）=====
export const resources = mysqlTable("resources", {
  id: serial("id").primaryKey(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  authorName: varchar("authorName", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(), // 互动课件/情境题单/微课脚本...
  subject: varchar("subject", { length: 32 }).notNull(),
  stage: varchar("stage", { length: 32 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  points: int("points").notNull().default(0), // 免费=0，收费则标积分价
  downloads: int("downloads").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 资源下载记录 =====
export const resourceDownloads = mysqlTable(
  "resource_downloads",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    resourceId: bigint("resourceId", { mode: "number", unsigned: true }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("uq_dl_user_res").on(t.userId, t.resourceId)],
);

// ===== 课程学习进度 =====
export const courseProgress = mysqlTable(
  "course_progress",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    courseId: varchar("courseId", { length: 32 }).notNull(),
    completedLessons: int("completedLessons").notNull().default(0),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("uq_progress_user_course").on(t.userId, t.courseId)],
);

// ===== 课程实操作业提交（成果档案袋） =====
export const lessonSubmissions = mysqlTable("lesson_submissions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  courseId: varchar("courseId", { length: 32 }).notNull(),
  lessonIndex: int("lessonIndex").notNull(),
  lessonTitle: varchar("lessonTitle", { length: 255 }).notNull(),
  submission: text("submission").notNull(),
  feedback: text("feedback"),
  score: int("score"), // 1-5 星
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 兑换码（开通会员 / 充值学分）=====
export const redemptionCodes = mysqlTable("redemption_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  kind: mysqlEnum("kind", ["member_year", "member_month", "credits"]).notNull(),
  credits: int("credits").notNull().default(0), // kind=credits 时生效
  usedBy: bigint("usedBy", { mode: "number", unsigned: true }),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type CourseProgress = typeof courseProgress.$inferSelect;

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
