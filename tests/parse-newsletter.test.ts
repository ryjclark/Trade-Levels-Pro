import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { parseNewsletter, computeCostUsd, setClaudeClientFactory, ClaudeApiKeyMissingError } from "../server/lib/claude";
import { storage } from "../server/storage";
import { formatAiParsedPlan, formatAlgorithmPlan, formatManualPlan } from "../server/lib/telegram-format";
import { PUBLIC_PLAN_SOURCES } from "../shared/constants";
import type { Plan } from "../shared/schema";

const SAMPLE_NEWSLETTER = `
Daily ES Outlook — published Tuesday afternoon.
For Wednesday May 13, 2026 trading day.

Current price 7438.75. Major resistance overhead at 7445.75 and 7454.75.
Above that we have minor 7470 and major 7485.
Major support at 7434.75 (close), then 7427.46, then major floor 7410.
Below 7410 we open to 7345.60.

Dynamic zone today is 7410 to 7454.75 with magnet at 7438.75.

Bull case: holding above 7434.75 keeps the path open back to 7454.75.
Bear case: failure of 7427.46 invites tag of 7410.

Top long: long the failed breakdown of 7427.46, stop 7424, target 7445.75.
Top short: I do not short this market.
`.trim();

const TOOL_INPUT = {
  target_date: "2026-05-13",
  symbol: "ES",
  dynamic_zone_high: 7454.75,
  dynamic_zone_low: 7410,
  magnet: 7438.75,
  r1: 7445.75, r2: 7454.75, r3: 7470, r4: 7485,
  s1: 7434.75, s2: 7427.46, s3: 7410, s4: 7345.6,
  bias: "neutral",
  bias_reasoning: "Holding 7434.75 keeps upside open; losing 7427.46 invites a tag of 7410.",
  top_long_trade: "Long failed breakdown of 7427.46, stop 7424, target 7445.75.",
  top_short_trade: "Author does not short, no short trade provided",
};

function makeMockClient(opts: {
  toolInput?: any;
  noToolUse?: boolean;
  throwError?: any;
  usage?: any;
}) {
  return {
    messages: {
      create: vi.fn(async () => {
        if (opts.throwError) throw opts.throwError;
        const usage = opts.usage || { input_tokens: 1500, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 320 };
        if (opts.noToolUse) {
          return { content: [{ type: "text", text: "I refuse to use the tool." }], usage } as any;
        }
        return {
          content: [
            { type: "tool_use", id: "tu_1", name: "submit_trade_plan", input: opts.toolInput ?? TOOL_INPUT },
          ],
          usage,
        } as any;
      }),
    },
  };
}

describe("computeCostUsd", () => {
  it("matches the documented formula for claude-sonnet-4-6", () => {
    const cost = computeCostUsd("claude-sonnet-4-6", {
      input_tokens: 1500,
      cache_creation_input_tokens: 1000,
      cache_read_input_tokens: 200,
      output_tokens: 320,
    });
    // (1500*3 + 1000*3.75 + 200*0.30 + 320*15) / 1_000_000
    const expected = (1500 * 3 + 1000 * 3.75 + 200 * 0.3 + 320 * 15) / 1_000_000;
    expect(cost).toBeCloseTo(expected, 9);
  });

  it("falls back gracefully on unknown model", () => {
    const cost = computeCostUsd("unknown-model", { input_tokens: 100, output_tokens: 100 });
    expect(cost).toBeGreaterThan(0);
  });
});

describe("parseNewsletter (mocked Claude)", () => {
  afterEach(() => {
    setClaudeClientFactory(null);
    vi.restoreAllMocks();
  });

  it("returns structured fields and writes a successful claude_api_calls row", async () => {
    setClaudeClientFactory(() => makeMockClient({}) as any);
    const result = await parseNewsletter(SAMPLE_NEWSLETTER);
    expect(result.plan.target_date).toBe("2026-05-13");
    expect(result.plan.symbol).toBe("ES");
    expect(result.plan.bias).toBe("neutral");
    expect(result.plan.r1).toBe(7445.75);
    expect(result.promptVersion).toMatch(/^v\d/);
    expect(result.apiCall.success).toBe(true);
    expect(result.apiCall.newsletterText).toContain("Daily ES Outlook");

    const row = await storage.getClaudeApiCallById(result.apiCall.id);
    expect(row?.success).toBe(true);
    expect(Number(row!.estimatedCostUsd)).toBeGreaterThan(0);
  });

  it("throws and writes a failure row when the API rejects the call", async () => {
    const apiErr: any = new Error("overloaded");
    apiErr.status = 500;
    setClaudeClientFactory(() => makeMockClient({ throwError: apiErr }) as any);
    let caught: any;
    try {
      await parseNewsletter(SAMPLE_NEWSLETTER);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    expect(caught.apiCall?.success).toBe(false);
    const row = await storage.getClaudeApiCallById(caught.apiCall.id);
    expect(row?.success).toBe(false);
    expect(row?.errorMessage).toContain("overloaded");
  });

  it("throws when Claude returns no tool_use block", async () => {
    setClaudeClientFactory(() => makeMockClient({ noToolUse: true }) as any);
    await expect(parseNewsletter(SAMPLE_NEWSLETTER)).rejects.toThrow(/tool_use/);
  });

  it("surfaces the model-not-found message on 404", async () => {
    const apiErr: any = new Error("model not found");
    apiErr.status = 404;
    setClaudeClientFactory(() => makeMockClient({ throwError: apiErr }) as any);
    let caught: any;
    try {
      await parseNewsletter(SAMPLE_NEWSLETTER);
    } catch (e) {
      caught = e;
    }
    expect(caught.message).toMatch(/model not found/i);
  });

  it("throws ClaudeApiKeyMissingError when key is unset (default factory)", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    setClaudeClientFactory(null);
    try {
      await expect(parseNewsletter(SAMPLE_NEWSLETTER)).rejects.toBeInstanceOf(ClaudeApiKeyMissingError);
    } finally {
      if (prev !== undefined) process.env.ANTHROPIC_API_KEY = prev;
    }
  });
});

describe("Telegram formatters", () => {
  const fakePlan: Plan = {
    id: 999,
    date: "2026-05-13",
    symbol: "ES",
    contract: null,
    tier: "pro",
    dynamicZoneTop: 7454.75,
    dynamicZoneBottom: 7410,
    magnet: 7438.75,
    r1: 7445.75, r2: 7454.75, r3: 7470, r4: 7485,
    s1: 7434.75, s2: 7427.46, s3: 7410, s4: 7345.6,
    bias: "neutral",
    setup1: null, setup2: null, notes: null,
    status: "draft",
    publishedAt: null,
    telegramMessageId: null,
    telegramMessage: null,
    telegramMessageVariant: null,
    scheduledFor: null,
    source: "ai_parsed",
    algorithmVersion: null,
    generatedAt: null,
    currentPrice: null,
    biasReasoning: "Bullish above 7434.75; bearish below 7427.46.",
    topLongTrade: "Long failed breakdown of 7427.46, stop 7424, target 7445.75.",
    topShortTrade: "Author does not short, no short trade provided",
    promptVersion: "v1.0",
    editedFields: [],
    claudeApiCallId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("formatAiParsedPlan renders all sections and escapes MarkdownV2", () => {
    const text = formatAiParsedPlan(fakePlan);
    expect(text).toMatch(/📊/);
    expect(text).toMatch(/\*Bias:\*/);
    expect(text).toMatch(/Dynamic Zone/);
    expect(text).toMatch(/R1:/);
    expect(text).toMatch(/S4:/);
    expect(text).toMatch(/🟢 \*Top Long:\*/);
    expect(text).toMatch(/🔴 \*Top Short:\*/);
    // Periods inside reasoning must be escaped
    expect(text).toMatch(/\\\.|7434\\\.75/);
  });

  it("formatAlgorithmPlan adds the 🤖 prefix", () => {
    const t = formatAlgorithmPlan({ ...fakePlan, source: "algorithm", algorithmVersion: "v1.2" });
    expect(t.startsWith("🤖 Algorithm v1\\.2\n")).toBe(true);
  });

  it("formatManualPlan stays byte-identical to formatTelegramPro", async () => {
    const { formatTelegramPro } = await import("../server/formatter");
    expect(formatManualPlan({ ...fakePlan, source: "manual" })).toBe(formatTelegramPro({ ...fakePlan, source: "manual" }));
  });
});

describe("listPublicPlans source filter", () => {
  let createdIds: number[] = [];

  beforeEach(() => {
    createdIds = [];
  });

  afterEach(async () => {
    const { db } = await import("../server/db");
    const { plans } = await import("../shared/schema");
    const { inArray } = await import("drizzle-orm");
    if (createdIds.length > 0) {
      await db.delete(plans).where(inArray(plans.id, createdIds));
    }
  });

  it("excludes ai_parsed and algorithm rows by default; flipping the constant exposes them", async () => {
    const stamp = Date.now();
    const dateStr = `2099-01-${String((stamp % 28) + 1).padStart(2, "0")}`;

    const a = await storage.upsertPlan({
      date: dateStr, symbol: "TST_M", source: "manual", status: "published",
      tier: "pro", contract: null,
      dynamicZoneTop: 1, dynamicZoneBottom: 0, magnet: 0.5,
      r1: 1, r2: 2, r3: 3, r4: 4, s1: -1, s2: -2, s3: -3, s4: -4,
      bias: null, setup1: null, setup2: null, notes: null,
      publishedAt: new Date().toISOString(),
      telegramMessageId: null, telegramMessage: null, telegramMessageVariant: null,
    } as any);
    const b = await storage.upsertPlan({
      date: dateStr, symbol: "TST_AI", source: "ai_parsed", status: "published",
      tier: "pro", contract: null,
      dynamicZoneTop: 1, dynamicZoneBottom: 0, magnet: 0.5,
      r1: 1, r2: 2, r3: 3, r4: 4, s1: -1, s2: -2, s3: -3, s4: -4,
      bias: "bullish", setup1: null, setup2: null, notes: null,
      publishedAt: new Date().toISOString(),
      telegramMessageId: null, telegramMessage: null, telegramMessageVariant: null,
    } as any);
    createdIds.push(a.id, b.id);

    const publicRows = await storage.listPublicPlans(500);
    const ids = new Set(publicRows.map((p) => p.id));
    expect(ids.has(a.id)).toBe(true);
    expect(ids.has(b.id)).toBe(false);
    expect(PUBLIC_PLAN_SOURCES).toEqual(["manual"]);
  });
});
