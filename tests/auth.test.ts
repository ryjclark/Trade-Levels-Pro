import { describe, it, expect, beforeAll, afterEach } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import bcrypt from "bcryptjs";
import { registerRoutes } from "../server/routes";
import {
  setAdminPassword,
  verifyAdminPassword,
  createSession,
  getSessionByToken,
  cleanupExpiredSessions,
  deleteAllSessions,
  consumePasswordResetToken,
  createPasswordResetToken,
  SESSION_TTL_MS,
  RESET_TOKEN_TTL_MS,
} from "../server/auth";
import { db } from "../server/db";
import { adminCredentials, adminSessions, adminPasswordResets } from "../shared/schema";
import { eq } from "drizzle-orm";

let app: express.Express;
const TEST_PASSWORD = "test-admin-password";

beforeAll(async () => {
  app = express();
  app.use(express.json());
  // trust proxy so express-rate-limit doesn't warn / mis-key in supertest
  app.set("trust proxy", true);
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  await setAdminPassword(TEST_PASSWORD);
});

afterEach(async () => {
  await deleteAllSessions();
  await db.delete(adminPasswordResets);
});

describe("bcrypt round-trip", () => {
  it("hashes and verifies a password", async () => {
    const hash = await bcrypt.hash("hunter2-xyz", 4);
    expect(await bcrypt.compare("hunter2-xyz", hash)).toBe(true);
    expect(await bcrypt.compare("wrong", hash)).toBe(false);
  });

  it("verifyAdminPassword matches the seeded password", async () => {
    expect(await verifyAdminPassword(TEST_PASSWORD)).toBe(true);
    expect(await verifyAdminPassword("wrong-password")).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token for the correct password", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBe(64);
    expect(typeof res.body.expires_at).toBe("string");
    // Session row was created
    const session = await getSessionByToken(res.body.token);
    expect(session).toBeDefined();
  });

  it("returns 401 INVALID_PASSWORD for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "nope" });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_PASSWORD");
  });

  it("returns 503 NOT_CONFIGURED when no admin credential exists", async () => {
    await db.delete(adminCredentials);
    try {
      const res = await request(app).post("/api/auth/login").send({ password: TEST_PASSWORD });
      expect(res.status).toBe(503);
      expect(res.body.code).toBe("NOT_CONFIGURED");
    } finally {
      await setAdminPassword(TEST_PASSWORD);
    }
  });
});

describe("requireAdmin middleware", () => {
  it("returns NOT_AUTHENTICATED with no header", async () => {
    const res = await request(app).get("/api/auth/check");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("NOT_AUTHENTICATED");
  });

  it("returns SESSION_EXPIRED for unknown token", async () => {
    const res = await request(app).get("/api/auth/check").set("Authorization", "Bearer bogus");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("SESSION_EXPIRED");
  });

  it("accepts a valid token and rolls expires_at forward", async () => {
    const session = await createSession({ userAgent: "test", ip: "1.1.1.1" });
    // Force the stored expiry into the past-but-still-valid range
    const oldExpiry = new Date(Date.now() + 1000);
    await db.update(adminSessions).set({ expiresAt: oldExpiry }).where(eq(adminSessions.id, session.id));

    const res = await request(app)
      .get("/api/auth/check")
      .set("Authorization", `Bearer ${session.token}`);
    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(true);

    // Wait briefly for fire-and-forget touchSession to complete
    await new Promise((r) => setTimeout(r, 100));
    const refreshed = await getSessionByToken(session.token);
    expect(refreshed!.expiresAt.getTime()).toBeGreaterThan(oldExpiry.getTime() + SESSION_TTL_MS - 5000);
  });

  it("rejects an expired session as SESSION_EXPIRED and removes it", async () => {
    const session = await createSession({ userAgent: null, ip: null });
    await db
      .update(adminSessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(adminSessions.id, session.id));
    const res = await request(app)
      .get("/api/auth/check")
      .set("Authorization", `Bearer ${session.token}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("SESSION_EXPIRED");
    expect(await getSessionByToken(session.token)).toBeUndefined();
  });
});

describe("cleanupExpiredSessions", () => {
  it("deletes only rows past expires_at", async () => {
    const live = await createSession({ userAgent: null, ip: null });
    const dead = await createSession({ userAgent: null, ip: null });
    await db
      .update(adminSessions)
      .set({ expiresAt: new Date(Date.now() - 5000) })
      .where(eq(adminSessions.id, dead.id));
    const removed = await cleanupExpiredSessions();
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(await getSessionByToken(live.token)).toBeDefined();
    expect(await getSessionByToken(dead.token)).toBeUndefined();
  });
});

describe("change-password", () => {
  it("rotates password and can revoke other sessions", async () => {
    const keep = await createSession({ userAgent: "keep", ip: null });
    const other = await createSession({ userAgent: "other", ip: null });

    const res = await request(app)
      .post("/api/admin/change-password")
      .set("Authorization", `Bearer ${keep.token}`)
      .send({
        current_password: TEST_PASSWORD,
        new_password: "new-strong-password",
        revoke_other_sessions: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.revoked_other_sessions).toBeGreaterThanOrEqual(1);

    expect(await getSessionByToken(keep.token)).toBeDefined();
    expect(await getSessionByToken(other.token)).toBeUndefined();
    expect(await verifyAdminPassword("new-strong-password")).toBe(true);
    expect(await verifyAdminPassword(TEST_PASSWORD)).toBe(false);

    // Restore for downstream tests
    await setAdminPassword(TEST_PASSWORD);
  });

  it("rejects wrong current password", async () => {
    const session = await createSession({ userAgent: null, ip: null });
    const res = await request(app)
      .post("/api/admin/change-password")
      .set("Authorization", `Bearer ${session.token}`)
      .send({ current_password: "wrong", new_password: "another-strong-pw" });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_PASSWORD");
  });
});

describe("password reset", () => {
  it("token is single-use and replaces the prior active token", async () => {
    const t1 = await createPasswordResetToken();
    const t2 = await createPasswordResetToken();
    // Prior active token was invalidated
    expect(await consumePasswordResetToken(t1)).toBe(false);
    // New token works once
    expect(await consumePasswordResetToken(t2)).toBe(true);
    // …and cannot be replayed
    expect(await consumePasswordResetToken(t2)).toBe(false);
  });

  it("expired token cannot be consumed", async () => {
    const token = await createPasswordResetToken();
    // Backdate expiry to simulate >15 min elapsed
    await db
      .update(adminPasswordResets)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(adminPasswordResets.token, token));
    expect(await consumePasswordResetToken(token)).toBe(false);
    expect(RESET_TOKEN_TTL_MS).toBe(15 * 60 * 1000);
  });

  it("consume endpoint rotates password and kills all sessions", async () => {
    await createSession({ userAgent: "a", ip: null });
    await createSession({ userAgent: "b", ip: null });
    const token = await createPasswordResetToken();
    const res = await request(app)
      .post("/api/admin/reset-password/consume")
      .send({ reset_token: token, new_password: "reset-strong-password" });
    expect(res.status).toBe(200);
    const remaining = await db.select().from(adminSessions);
    expect(remaining.length).toBe(0);
    expect(await verifyAdminPassword("reset-strong-password")).toBe(true);
    // Restore
    await setAdminPassword(TEST_PASSWORD);
  });
});
