import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq, lt, ne, and, gt, isNull } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import {
  adminCredentials,
  adminSessions,
  adminPasswordResets,
  type AdminSession,
} from "@shared/schema";

const BCRYPT_COST = 12;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, rolling
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_BYTES = 32;

export function generateOpaqueToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

// ----- Credentials -----

export async function getAdminCredential() {
  // Defensive ORDER BY id ASC LIMIT 1 in case extra rows ever land via direct SQL.
  const rows = await db.select().from(adminCredentials).orderBy(adminCredentials.id).limit(1);
  return rows[0];
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  // Single-row table by convention: always target id = 1.
  // Insert if absent, update if present.
  const existing = await getAdminCredential();
  if (existing) {
    await db
      .update(adminCredentials)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(adminCredentials.id, existing.id));
  } else {
    await db.insert(adminCredentials).values({ passwordHash: hash });
  }
}

export async function setAdminPassword(plaintext: string): Promise<void> {
  const hash = await bcrypt.hash(plaintext, BCRYPT_COST);
  await setAdminPasswordHash(hash);
}

export async function verifyAdminPassword(plaintext: string): Promise<boolean> {
  const cred = await getAdminCredential();
  if (!cred) return false;
  return bcrypt.compare(plaintext, cred.passwordHash);
}

export async function isAdminConfigured(): Promise<boolean> {
  const cred = await getAdminCredential();
  return !!cred;
}

// Seed runs once on first boot of whichever environment starts first.
// After that, ADMIN_PASSWORD env var is ignored — the DB hash wins.
export async function seedAdminPasswordIfNeeded(): Promise<void> {
  const cred = await getAdminCredential();
  if (cred) return;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && envPassword.length > 0) {
    await setAdminPassword(envPassword);
    console.log(
      "[auth] Seeded admin password from ADMIN_PASSWORD env var. " +
        "You may now unset that env var; the DB hash is the source of truth.",
    );
  } else {
    console.warn(
      "[auth] Admin password not configured. " +
        "Set ADMIN_PASSWORD in Replit Secrets and restart, " +
        "OR call POST /api/admin/reset-password/request and consume the token from server logs.",
    );
  }
}

// ----- Sessions -----

export async function createSession(opts: {
  userAgent?: string | null;
  ip?: string | null;
}): Promise<AdminSession> {
  const token = generateOpaqueToken();
  const now = new Date();
  const [row] = await db
    .insert(adminSessions)
    .values({
      token,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      lastSeenAt: now,
      userAgent: opts.userAgent || null,
      ip: opts.ip || null,
    })
    .returning();
  return row;
}

export async function getSessionByToken(token: string): Promise<AdminSession | undefined> {
  const rows = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
  return rows[0];
}

export async function touchSession(token: string): Promise<AdminSession | undefined> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const updated = await db
    .update(adminSessions)
    .set({ lastSeenAt: now, expiresAt })
    .where(eq(adminSessions.token, token))
    .returning();
  return updated[0];
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function deleteOtherSessions(keepToken: string): Promise<number> {
  const removed = await db
    .delete(adminSessions)
    .where(ne(adminSessions.token, keepToken))
    .returning();
  return removed.length;
}

export async function deleteAllSessions(): Promise<void> {
  await db.delete(adminSessions);
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

// ----- Password resets -----

export async function createPasswordResetToken(): Promise<string> {
  const token = generateOpaqueToken();
  const now = new Date();
  // Invalidate any prior active token: at most ONE active reset at a time.
  await db
    .delete(adminPasswordResets)
    .where(and(isNull(adminPasswordResets.usedAt), gt(adminPasswordResets.expiresAt, now)));
  await db.insert(adminPasswordResets).values({
    token,
    createdAt: now,
    expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
  });
  return token;
}

export async function consumePasswordResetToken(token: string): Promise<boolean> {
  const now = new Date();
  const rows = await db
    .select()
    .from(adminPasswordResets)
    .where(eq(adminPasswordResets.token, token))
    .limit(1);
  const row = rows[0];
  if (!row) return false;
  if (row.usedAt) return false;
  if (row.expiresAt.getTime() <= now.getTime()) return false;
  await db
    .update(adminPasswordResets)
    .set({ usedAt: now })
    .where(eq(adminPasswordResets.id, row.id));
  return true;
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
    res.status(401).json({ code: "NOT_AUTHENTICATED", error: "Authentication required" });
    return;
  }
  const token = authHeader.substring(7);
  const session = await getSessionByToken(token);
  if (!session) {
    res.status(401).json({ code: "SESSION_EXPIRED", error: "Session expired or invalid" });
    return;
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    await deleteSessionByToken(token);
    res.status(401).json({ code: "SESSION_EXPIRED", error: "Session expired or invalid" });
    return;
  }
  // Roll the session forward (best-effort; ignore failures).
  touchSession(token).catch((err) => console.warn("[auth] touchSession failed:", err));
  req.session = session;
  next();
}
