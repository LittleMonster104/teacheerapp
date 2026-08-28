// 本地账号密码登录：与 Kimi OAuth 并存，适合本地/私有化部署
// 复用同一套会话 Cookie（签名 JWT），用户表通过 unionId = "local:<username>" 区分
import { z } from "zod";
import * as cookie from "cookie";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { signSessionToken } from "./kimi/session";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";
import { env } from "./lib/env";
import { findUserByUnionId, upsertUser } from "./queries/users";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

const usernameSchema = z
  .string()
  .min(3, "用户名至少 3 位")
  .max(32, "用户名最多 32 位")
  .regex(/^[\w一-龥-]+$/, "用户名仅支持中英文、数字、下划线");

const passwordSchema = z.string().min(6, "密码至少 6 位").max(72);

async function issueSession(ctx: { req: Request; resHeaders: Headers }, unionId: string) {
  const token = await signSessionToken({ unionId, clientId: env.appId });
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

export const localAuthRouter = createRouter({
  // 是否启用本地登录（本地部署默认开启；可用 LOCAL_AUTH=0 关闭）
  enabled: publicQuery.query(() => ({ enabled: process.env.LOCAL_AUTH !== "0" })),

  register: publicQuery
    .input(z.object({ username: usernameSchema, password: passwordSchema, name: z.string().min(1).max(32) }))
    .mutation(async ({ ctx, input }) => {
      const unionId = `local:${input.username}`;
      const existing = await findUserByUnionId(unionId);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "用户名已被注册" });

      await upsertUser({
        unionId,
        name: input.name,
        passwordHash: hashPassword(input.password),
        lastSignInAt: new Date(),
      });
      await issueSession(ctx, unionId);
      return { ok: true, name: input.name };
    }),

  login: publicQuery
    .input(z.object({ username: usernameSchema, password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const unionId = `local:${input.username}`;
      const user = await findUserByUnionId(unionId);
      if (!user || !user.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
      }
      await upsertUser({ unionId, lastSignInAt: new Date() });
      await issueSession(ctx, unionId);
      return { ok: true, name: user.name };
    }),
});
