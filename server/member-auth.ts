import crypto from "crypto";
import { eq, lt, and, isNull } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { memberLoginTokens, memberSessions, type MemberSession } from "@shared/schema";
import { storage } from "./storage";

const TOKEN_BYTES = 32;
export const MEMBER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, rolling
export const LOGIN_TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutes

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

// ----- Magic-link login tokens -----

export async function createLoginToken(email: string): Promise<string> {
  const token = generateToken();
  const now = new Date();
  await db.insert(memberLoginTokens).values({
    token,
    email: email.toLowerCase(),
    createdAt: now,
    expiresAt: new Date(now.getTime() + LOGIN_TOKEN_TTL_MS),
  });
  return token;
}

/** Validates a one-time login token, marks it used, and returns its email. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(memberLoginTokens)
    .where(and(eq(memberLoginTokens.token, token), isNull(memberLoginTokens.usedAt)))
    .limit(1);
  const row = rows[0];
  if (!row || row.expiresAt.getTime() <= Date.now()) return null;
  await db
    .update(memberLoginTokens)
    .set({ usedAt: new Date() })
    .where(eq(memberLoginTokens.id, row.id));
  return row.email;
}

// ----- Member sessions -----

export async function createMemberSession(email: string): Promise<MemberSession> {
  const token = generateToken();
  const now = new Date();
  const [row] = await db
    .insert(memberSessions)
    .values({
      token,
      email: email.toLowerCase(),
      createdAt: now,
      expiresAt: new Date(now.getTime() + MEMBER_SESSION_TTL_MS),
      lastSeenAt: now,
    })
    .returning();
  return row;
}

export async function getMemberSessionByToken(token: string): Promise<MemberSession | undefined> {
  const rows = await db.select().from(memberSessions).where(eq(memberSessions.token, token)).limit(1);
  return rows[0];
}

export async function touchMemberSession(token: string): Promise<void> {
  const now = new Date();
  await db
    .update(memberSessions)
    .set({ lastSeenAt: now, expiresAt: new Date(now.getTime() + MEMBER_SESSION_TTL_MS) })
    .where(eq(memberSessions.token, token));
}

export async function deleteMemberSessionByToken(token: string): Promise<void> {
  await db.delete(memberSessions).where(eq(memberSessions.token, token));
}

export async function cleanupExpiredMemberSessions(): Promise<number> {
  const removed = await db
    .delete(memberSessions)
    .where(lt(memberSessions.expiresAt, new Date()))
    .returning();
  return removed.length;
}

// ----- Middleware -----

export interface MemberAuthRequest extends Request {
  memberEmail?: string;
}

/** Requires a valid member session AND that the member is still an active subscriber. */
export async function requireMember(
  req: MemberAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.substring(7);
  const session = await getMemberSessionByToken(token);
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await deleteMemberSessionByToken(token).catch(() => {});
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Re-check membership every request so a cancelled subscriber loses access.
  const member = await storage.getMemberByEmail(session.email);
  if (!member || member.status !== "active") {
    res.status(403).json({ error: "Membership inactive" });
    return;
  }
  touchMemberSession(token).catch((err) => console.warn("[member-auth] touch failed:", err));
  req.memberEmail = session.email;
  next();
}
