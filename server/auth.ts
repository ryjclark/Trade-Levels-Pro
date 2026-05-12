import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq, lt } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import {
  adminCredentials,
  adminSessions,
  type AdminSession,
  type AdminCredential,
} from "@shared/schema";

const BCRYPT_COST = 12;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, rolling
const TOKEN_BYTES = 32;

const DEFAULT_USERNAME = "Ryan";
const DEFAULT_PASSWORD = "Ryan";

function generateOpaqueToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

// ----- Credentials -----

export async function findCredentialByUsername(username: string): Promise<AdminCredential | undefined> {
  const rows = await db
    .select()
    .from(adminCredentials)
    .where(eq(adminCredentials.username, username))
    .limit(1);
  return rows[0];
}

export async function setAdminCredential(username: string, plaintext: string): Promise<void> {
  const hash = await bcrypt.hash(plaintext, BCRYPT_COST);
  const existing = await findCredentialByUsername(username);
  if (existing) {
    await db
      .update(adminCredentials)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(adminCredentials.id, existing.id));
  } else {
    await db.insert(adminCredentials).values({ username, passwordHash: hash });
  }
}

export async function verifyLogin(username: string, password: string): Promise<boolean> {
  const cred = await findCredentialByUsername(username);
  if (!cred) return false;
  return bcrypt.compare(password, cred.passwordHash);
}

// Seed runs once on first boot of whichever environment starts first.
// Dev preview and prod share the same Production database, so the row gets
// created exactly once. After seeding, change the password via direct DB
// update — there is no rotation UI in this build.
export async function seedAdminIfNeeded(): Promise<void> {
  const rows = await db.select().from(adminCredentials).limit(1);
  if (rows.length > 0) return;
  await setAdminCredential(DEFAULT_USERNAME, DEFAULT_PASSWORD);
  console.log(
    `[auth] Seeded admin login: username=${DEFAULT_USERNAME}. ` +
      "Change the password in Replit Secrets and restart, or via direct DB update.",
  );
}

// ----- Sessions -----

export async function createSession(): Promise<AdminSession> {
  const token = generateOpaqueToken();
  const now = new Date();
  const [row] = await db
    .insert(adminSessions)
    .values({
      token,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      lastSeenAt: now,
    })
    .returning();
  return row;
}

export async function getSessionByToken(token: string): Promise<AdminSession | undefined> {
  const rows = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
  return rows[0];
}

export async function touchSession(token: string): Promise<void> {
  const now = new Date();
  await db
    .update(adminSessions)
    .set({ lastSeenAt: now, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) })
    .where(eq(adminSessions.token, token));
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function cleanupExpiredSessions(): Promise<number> {
  const removed = await db
    .delete(adminSessions)
    .where(lt(adminSessions.expiresAt, new Date()))
    .returning();
  if (removed.length > 0) {
    console.log(`[auth] cleaned up ${removed.length} expired session(s)`);
  }
  return removed.length;
}

// ----- Middleware -----

export interface AdminAuthRequest extends Request {
  session?: AdminSession;
}

export async function requireAdmin(
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.substring(7);
  const session = await getSessionByToken(token);
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await deleteSessionByToken(token).catch(() => {});
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Roll the session forward (best-effort).
  touchSession(token).catch((err) => console.warn("[auth] touchSession failed:", err));
  req.session = session;
  next();
}
