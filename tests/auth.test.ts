import { describe, it, expect, beforeAll, afterEach } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import bcrypt from "bcryptjs";
import { registerRoutes } from "../server/routes";
import {
  setAdminCredential,
  verifyLogin,
  createSession,
  getSessionByToken,
  cleanupExpiredSessions,
  SESSION_TTL_MS,
} from "../server/auth";
import { db } from "../server/db";
import { adminSessions } from "../shared/schema";
import { eq } from "drizzle-orm";

let app: express.Express;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  app.set("trust proxy", true);
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  await setAdminCredential("Ryan", "Ryan");
});

afterEach(async () => {
  await db.delete(adminSessions);
});

describe("bcrypt round-trip", () => {
  it("hashes and verifies", async () => {
    const hash = await bcrypt.hash("Ryan", 4);
    expect(await bcrypt.compare("Ryan", hash)).toBe(true);
    expect(await bcrypt.compare("nope", hash)).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  it("Ryan / Ryan succeeds and returns a token", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "Ryan", password: "Ryan" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBe(64);
    expect(typeof res.body.expires_at).toBe("string");
    // Session row was created in DB
    const session = await getSessionByToken(res.body.token);
    expect(session).toBeDefined();
  });

  it("wrong password returns 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "Ryan", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it("unknown username returns 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "nobody", password: "Ryan" });
    expect(res.status).toBe(401);
  });

  it("rejects non-string body fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: 1, password: 2 });
    expect(res.status).toBe(400);
  });
});

describe("verifyLogin (DB-backed source of truth)", () => {
  it("matches the seeded credential regardless of in-memory state", async () => {
    expect(await verifyLogin("Ryan", "Ryan")).toBe(true);
    expect(await verifyLogin("Ryan", "wrong")).toBe(false);
    expect(await verifyLogin("Other", "Ryan")).toBe(false);
  });
});

describe("session persistence across simulated server restart", () => {
  it("token created in process A is still valid after wiping in-memory state", async () => {
    // Log in
    const login = await request(app).post("/api/auth/login").send({ username: "Ryan", password: "Ryan" });
    const token = login.body.token as string;
    expect(token).toBeDefined();

    // Simulate server restart: build a fresh Express app with no shared closure state.
    // Only the DB persists between the two — which is the whole point of this fix.
    const app2 = express();
    app2.use(express.json());
    app2.set("trust proxy", true);
    const httpServer2 = createServer(app2);
    await registerRoutes(httpServer2, app2);

    const check = await request(app2).get("/api/auth/check").set("Authorization", `Bearer ${token}`);
    expect(check.status).toBe(200);
    expect(check.body.authenticated).toBe(true);
  });
});

describe("requireAdmin middleware", () => {
  it("rejects missing header with 401", async () => {
    const res = await request(app).get("/api/auth/check");
    expect(res.status).toBe(401);
  });

  it("rejects unknown token with 401", async () => {
    const res = await request(app).get("/api/auth/check").set("Authorization", "Bearer bogus");
    expect(res.status).toBe(401);
  });

  it("accepts valid token and rolls expires_at forward", async () => {
    const session = await createSession();
    const oldExpiry = new Date(Date.now() + 1000);
    await db.update(adminSessions).set({ expiresAt: oldExpiry }).where(eq(adminSessions.id, session.id));

    const res = await request(app).get("/api/auth/check").set("Authorization", `Bearer ${session.token}`);
    expect(res.status).toBe(200);

    // Wait for fire-and-forget touchSession
    await new Promise((r) => setTimeout(r, 100));
    const refreshed = await getSessionByToken(session.token);
    expect(refreshed!.expiresAt.getTime()).toBeGreaterThan(oldExpiry.getTime() + SESSION_TTL_MS - 5000);
  });

  it("rejects an expired token and removes it", async () => {
    const session = await createSession();
    await db
      .update(adminSessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(adminSessions.id, session.id));
    const res = await request(app).get("/api/auth/check").set("Authorization", `Bearer ${session.token}`);
    expect(res.status).toBe(401);
    expect(await getSessionByToken(session.token)).toBeUndefined();
  });
});

describe("logout", () => {
  it("deletes the session row", async () => {
    const session = await createSession();
    const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${session.token}`);
    expect(res.status).toBe(200);
    expect(await getSessionByToken(session.token)).toBeUndefined();
  });
});

describe("cleanupExpiredSessions", () => {
  it("deletes only past-expiry rows", async () => {
    const live = await createSession();
    const dead = await createSession();
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
