import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { registerRoutes } from "../server/routes";
import { db } from "../server/db";
import { plans } from "../shared/schema";
import { eq } from "drizzle-orm";

let app: express.Express;
let publishedManualId: number;
let draftId: number;
let algorithmPublishedId: number;
let aiParsedPublishedId: number;
const cleanupIds: number[] = [];

async function insertPlan(overrides: Partial<typeof plans.$inferInsert>): Promise<number> {
  const base = {
    date: "2099-01-01",
    symbol: "ES",
    tier: "pro",
    status: "draft" as const,
    source: "manual" as const,
    magnet: 5000,
    dynamicZoneTop: 5010,
    dynamicZoneBottom: 4990,
    r1: 5020, r2: 5030, r3: 5040, r4: 5050,
    s1: 4980, s2: 4970, s3: 4960, s4: 4950,
    bias: "Bullish above magnet",
  };
  const [row] = await db.insert(plans).values({ ...base, ...overrides }).returning();
  cleanupIds.push(row.id);
  return row.id;
}

beforeAll(async () => {
  app = express();
  app.use(express.json());
  app.set("trust proxy", true);
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);

  publishedManualId = await insertPlan({
    date: "2099-01-02",
    symbol: "ES",
    status: "published",
    source: "manual",
    publishedAt: new Date().toISOString(),
  });
  draftId = await insertPlan({
    date: "2099-01-03",
    symbol: "ES",
    status: "draft",
    source: "manual",
  });
  algorithmPublishedId = await insertPlan({
    date: "2099-01-04",
    symbol: "ES",
    status: "published",
    source: "algorithm",
    publishedAt: new Date().toISOString(),
  });
  // ai_parsed is still NOT in PUBLIC_PLAN_SOURCES, so it stays hidden publicly.
  aiParsedPublishedId = await insertPlan({
    date: "2099-01-05",
    symbol: "ES",
    status: "published",
    source: "ai_parsed",
    publishedAt: new Date().toISOString(),
  });
}, 30_000);

afterAll(async () => {
  for (const id of cleanupIds) {
    await db.delete(plans).where(eq(plans.id, id));
  }
});

describe("GET /api/og/plan/:id.png", () => {
  it("returns a PNG image for a published manual plan", async () => {
    const res = await request(app)
      .get(`/api/og/plan/${publishedManualId}.png`)
      .buffer(true);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/image\/png/);
    expect(res.headers["cache-control"]).toMatch(/max-age=86400/);
    // PNG magic number: 89 50 4E 47
    expect(res.body[0]).toBe(0x89);
    expect(res.body[1]).toBe(0x50);
    expect(res.body[2]).toBe(0x4e);
    expect(res.body[3]).toBe(0x47);
    expect(res.body.length).toBeGreaterThan(2000);
  }, 30_000);

  it("returns 404 with placeholder PNG for a non-existent id", async () => {
    const res = await request(app)
      .get("/api/og/plan/99999999.png")
      .buffer(true);

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/image\/png/);
    expect(res.body[0]).toBe(0x89);
  }, 30_000);

  it("returns 404 for a draft (unpublished) plan", async () => {
    const res = await request(app).get(`/api/og/plan/${draftId}.png`).buffer(true);
    expect(res.status).toBe(404);
  }, 30_000);

  it("renders a PNG for a published algorithm plan (now a public source)", async () => {
    const res = await request(app)
      .get(`/api/og/plan/${algorithmPublishedId}.png`)
      .buffer(true);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/image\/png/);
    expect(res.body[0]).toBe(0x89);
  }, 30_000);

  it("returns 404 for a non-public source (ai_parsed)", async () => {
    const res = await request(app)
      .get(`/api/og/plan/${aiParsedPublishedId}.png`)
      .buffer(true);
    expect(res.status).toBe(404);
  }, 30_000);

  it("returns 404 for a non-numeric id", async () => {
    const res = await request(app).get("/api/og/plan/abc.png").buffer(true);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/public/plans/:id", () => {
  it("returns level-only fields for a published manual plan (never bias reasoning)", async () => {
    const res = await request(app).get(`/api/public/plans/${publishedManualId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(publishedManualId);
    expect(res.body.symbol).toBe("ES");
    expect(res.body.magnet).toBe(5000);
    expect(res.body).not.toHaveProperty("biasReasoning");
    expect(res.body).not.toHaveProperty("topLongTrade");
    expect(res.body).not.toHaveProperty("setup1");
    // updatedAt is exposed (epoch ms) so the client can version the og:image URL.
    expect(typeof res.body.updatedAt).toBe("number");
  });

  it("returns 404 for a draft plan", async () => {
    const res = await request(app).get(`/api/public/plans/${draftId}`);
    expect(res.status).toBe(404);
  });

  it("returns level-only fields for a published algorithm plan (now public)", async () => {
    const res = await request(app).get(`/api/public/plans/${algorithmPublishedId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(algorithmPublishedId);
    expect(res.body.magnet).toBe(5000);
    expect(res.body).not.toHaveProperty("biasReasoning");
    expect(res.body).not.toHaveProperty("topLongTrade");
  });

  it("returns 404 for a non-public source (ai_parsed)", async () => {
    const res = await request(app).get(`/api/public/plans/${aiParsedPublishedId}`);
    expect(res.status).toBe(404);
  });
});
