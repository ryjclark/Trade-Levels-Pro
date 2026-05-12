import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";
import { setClaudeClientFactory } from "../server/lib/claude";

let app: express.Express;
let token: string;
const createdPlanIds: number[] = [];
const createdCallIds: number[] = [];

const TOOL_INPUT = {
  target_date: "2099-12-31",
  symbol: "TSTSV",
  dynamic_zone_high: 100,
  dynamic_zone_low: 90,
  magnet: 95,
  r1: 96, r2: 98, r3: 99, r4: 100,
  s1: 94, s2: 92, s3: 91, s4: 90,
  bias: "bullish",
  bias_reasoning: "Holds support, range extends.",
  top_long_trade: "Buy 95 stop 93 target 100.",
  top_short_trade: "Author does not short, no short trade provided",
};

beforeAll(async () => {
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test-admin-password";
  app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);

  const login = await request(app).post("/api/auth/login").send({ password: process.env.ADMIN_PASSWORD });
  token = login.body.token;

  setClaudeClientFactory(() => ({
    messages: {
      create: vi.fn(async () => ({
        content: [{ type: "tool_use", id: "tu_x", name: "submit_trade_plan", input: TOOL_INPUT }],
        usage: { input_tokens: 100, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 50 },
      })),
    },
  }) as any);
});

afterAll(async () => {
  setClaudeClientFactory(null);
  const { db } = await import("../server/db");
  const { plans, claudeApiCalls, publishLogs } = await import("../shared/schema");
  const { inArray } = await import("drizzle-orm");
  if (createdPlanIds.length) {
    await db.delete(publishLogs).where(inArray(publishLogs.planId, createdPlanIds));
    await db.delete(plans).where(inArray(plans.id, createdPlanIds));
  }
  if (createdCallIds.length) {
    await db.delete(claudeApiCalls).where(inArray(claudeApiCalls.id, createdCallIds));
  }
});

async function parse(): Promise<{ callId: number; plan: any }> {
  const res = await request(app)
    .post("/api/admin/parse-newsletter")
    .set("Authorization", `Bearer ${token}`)
    .send({ newsletter_text: "x".repeat(200) });
  expect(res.status).toBe(200);
  createdCallIds.push(res.body.claude_api_call_id);
  return { callId: res.body.claude_api_call_id, plan: res.body.plan };
}

describe("POST /api/admin/save-parsed-plan", () => {
  it("returns 503 when ANTHROPIC_API_KEY is unset (parse endpoint)", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const res = await request(app)
        .post("/api/admin/parse-newsletter")
        .set("Authorization", `Bearer ${token}`)
        .send({ newsletter_text: "x".repeat(200) });
      expect(res.status).toBe(503);
    } finally {
      if (prev !== undefined) process.env.ANTHROPIC_API_KEY = prev;
      else process.env.ANTHROPIC_API_KEY = "test-mock-key";
    }
  });

  it("saves an ai_parsed plan with prompt_version, edited_fields, claude_api_call_id", async () => {
    const { callId, plan } = await parse();
    const res = await request(app)
      .post("/api/admin/save-parsed-plan")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...plan,
        edited_fields: ["magnet", "r1"],
        claude_api_call_id: callId,
        prompt_version: "v1.0",
        send_telegram: false,
      });
    expect(res.status).toBe(200);
    expect(res.body.plan.source).toBe("ai_parsed");
    expect(res.body.plan.promptVersion).toBe("v1.0");
    expect(res.body.plan.editedFields).toEqual(["magnet", "r1"]);
    expect(res.body.plan.claudeApiCallId).toBe(callId);
    createdPlanIds.push(res.body.plan.id);
  });

  it("blocks with 409 when a non-ai_parsed row already exists for (date, symbol)", async () => {
    // Seed a manual row at the same date+symbol as TOOL_INPUT
    const seeded = await storage.upsertPlan({
      date: TOOL_INPUT.target_date, symbol: TOOL_INPUT.symbol, source: "manual",
      tier: "pro", contract: null,
      dynamicZoneTop: 1, dynamicZoneBottom: 0, magnet: 0.5,
      r1: 1, r2: 2, r3: 3, r4: 4, s1: -1, s2: -2, s3: -3, s4: -4,
      bias: "Manual bias", setup1: null, setup2: null, notes: null,
      status: "draft", publishedAt: null,
      telegramMessageId: null, telegramMessage: null, telegramMessageVariant: null,
    } as any);
    createdPlanIds.push(seeded.id);

    const { callId, plan } = await parse();
    const res = await request(app)
      .post("/api/admin/save-parsed-plan")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...plan, edited_fields: [], claude_api_call_id: callId, prompt_version: "v1.0", send_telegram: false });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("collision");
    expect(res.body.existing_plan_id).toBe(seeded.id);
    expect(res.body.existing_source).toBe("manual");
  });

  it("force_overwrite=true replaces the existing row and notes the overwrite", async () => {
    const { callId, plan } = await parse();
    const res = await request(app)
      .post("/api/admin/save-parsed-plan")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...plan,
        edited_fields: [],
        claude_api_call_id: callId,
        prompt_version: "v1.0",
        send_telegram: false,
        force_overwrite: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.plan.source).toBe("ai_parsed");
    expect(res.body.overwroteSource).toBe("manual");
    const callRow = await storage.getClaudeApiCallById(callId);
    expect(callRow?.notes || "").toMatch(/overwrote manual plan/);
  });
});
