import Anthropic from "@anthropic-ai/sdk";
import { storage } from "../storage";
import {
  PARSE_NEWSLETTER_PROMPT_VERSION,
  PARSE_NEWSLETTER_SYSTEM_PROMPT,
} from "./prompts/parse-newsletter";
import { aiParsedPlanSchema, type AiParsedPlan, type ClaudeApiCall } from "@shared/schema";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

// Pricing per 1M tokens, USD. Captured 2026-05-11 for claude-sonnet-4-6.
// Re-verify when bumping the model id.
const PRICING: Record<string, { input: number; cache_creation: number; cache_read: number; output: number }> = {
  "claude-sonnet-4-6": {
    input: 3.0,
    cache_creation: 3.75, // 1.25x input
    cache_read: 0.3,      // 0.10x input
    output: 15.0,
  },
};

export function computeCostUsd(model: string, usage: {
  input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  output_tokens?: number | null;
}): number {
  const p = PRICING[model];
  const input = usage.input_tokens || 0;
  const cw = usage.cache_creation_input_tokens || 0;
  const cr = usage.cache_read_input_tokens || 0;
  const out = usage.output_tokens || 0;
  if (!p) {
    console.warn(`[claude] no pricing entry for model "${model}"; falling back to flat input/output rates`);
    const fallback = { input: 3.0, output: 15.0 };
    return (input * fallback.input + cw * fallback.input + cr * fallback.input + out * fallback.output) / 1_000_000;
  }
  return (input * p.input + cw * p.cache_creation + cr * p.cache_read + out * p.output) / 1_000_000;
}

const TOOL_NAME = "submit_trade_plan";

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  required: [
    "target_date", "symbol",
    "dynamic_zone_high", "dynamic_zone_low", "magnet",
    "r1", "r2", "r3", "r4",
    "s1", "s2", "s3", "s4",
    "bias", "bias_reasoning",
    "top_long_trade", "top_short_trade",
  ],
  properties: {
    target_date: { type: "string", description: "ISO date YYYY-MM-DD for the trading day the plan applies to" },
    symbol: { type: "string", description: "Futures symbol, default 'ES'" },
    dynamic_zone_high: { type: "number" },
    dynamic_zone_low: { type: "number" },
    magnet: { type: "number" },
    r1: { type: "number" }, r2: { type: "number" }, r3: { type: "number" }, r4: { type: "number" },
    s1: { type: "number" }, s2: { type: "number" }, s3: { type: "number" }, s4: { type: "number" },
    bias: { type: "string", enum: ["bullish", "neutral", "bearish"] },
    bias_reasoning: { type: "string" },
    top_long_trade: { type: "string" },
    top_short_trade: {
      type: "string",
      description: "Use 'Author does not short, no short trade provided' if newsletter explicitly avoids shorts",
    },
  },
};

export class ClaudeApiKeyMissingError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY not configured");
    this.name = "ClaudeApiKeyMissingError";
  }
}

export class ClaudeNoToolUseError extends Error {
  constructor(message = "Claude did not return a tool_use block") {
    super(message);
    this.name = "ClaudeNoToolUseError";
  }
}

export interface ParseNewsletterResult {
  plan: AiParsedPlan;
  promptVersion: string;
  apiCall: ClaudeApiCall;
}

interface ClientFactory {
  (): Anthropic;
}

let _client: Anthropic | null = null;
const defaultClientFactory: ClientFactory = () => {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new ClaudeApiKeyMissingError();
    _client = new Anthropic({ apiKey: key, maxRetries: 3 });
  }
  return _client;
};

// Allow tests to inject a mock client.
let clientFactory: ClientFactory = defaultClientFactory;
export function setClaudeClientFactory(factory: ClientFactory | null) {
  clientFactory = factory ?? defaultClientFactory;
  _client = null;
}

async function backoffOnOverloaded<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      if (status !== 529 || i === attempts - 1) throw err;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export async function parseNewsletter(newsletterText: string): Promise<ParseNewsletterResult> {
  if (!process.env.ANTHROPIC_API_KEY && clientFactory === defaultClientFactory) {
    throw new ClaudeApiKeyMissingError();
  }

  const client = clientFactory();
  const startedAt = Date.now();

  let response: Anthropic.Messages.Message;
  try {
    response = await backoffOnOverloaded(() =>
      client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system: [
          {
            type: "text",
            text: PARSE_NEWSLETTER_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
          // Per-call dynamic context block reserved for future use:
          // { type: "text", text: "<dynamic context>" },
        ],
        tools: [
          {
            name: TOOL_NAME,
            description: "Submit the structured trading plan extracted from the newsletter.",
            input_schema: TOOL_INPUT_SCHEMA,
          },
        ],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [
          { role: "user", content: newsletterText },
        ],
      } as any),
    );
  } catch (err: any) {
    const usage = err?.response?.usage || { input_tokens: 0, output_tokens: 0 };
    const costUsd = computeCostUsd(CLAUDE_MODEL, usage);
    const errorMessage =
      err?.status === 404
        ? `model not found — likely SDK or API version issue (${err?.message || ""})`.trim()
        : err?.message || String(err);
    const apiCall = await storage.insertClaudeApiCall({
      model: CLAUDE_MODEL,
      requestType: "parse_newsletter",
      promptVersion: PARSE_NEWSLETTER_PROMPT_VERSION,
      inputTokens: usage.input_tokens || 0,
      cacheCreationInputTokens: usage.cache_creation_input_tokens || 0,
      cacheReadInputTokens: usage.cache_read_input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      estimatedCostUsd: costUsd.toFixed(6),
      success: false,
      errorMessage,
      newsletterText,
      notes: null,
    });
    const wrapped: any = new Error(errorMessage);
    wrapped.apiCall = apiCall;
    wrapped.originalStatus = err?.status;
    throw wrapped;
  }

  const usage = response.usage || ({ input_tokens: 0, output_tokens: 0 } as any);
  const costUsd = computeCostUsd(CLAUDE_MODEL, usage);

  const toolUse = response.content.find((b) => b.type === "tool_use") as Anthropic.Messages.ToolUseBlock | undefined;
  if (!toolUse || toolUse.name !== TOOL_NAME) {
    const apiCall = await storage.insertClaudeApiCall({
      model: CLAUDE_MODEL,
      requestType: "parse_newsletter",
      promptVersion: PARSE_NEWSLETTER_PROMPT_VERSION,
      inputTokens: usage.input_tokens || 0,
      cacheCreationInputTokens: (usage as any).cache_creation_input_tokens || 0,
      cacheReadInputTokens: (usage as any).cache_read_input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      estimatedCostUsd: costUsd.toFixed(6),
      success: false,
      errorMessage: "no tool_use block returned",
      newsletterText,
      notes: null,
    });
    const err: any = new ClaudeNoToolUseError();
    err.apiCall = apiCall;
    throw err;
  }

  const parsed = aiParsedPlanSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    const apiCall = await storage.insertClaudeApiCall({
      model: CLAUDE_MODEL,
      requestType: "parse_newsletter",
      promptVersion: PARSE_NEWSLETTER_PROMPT_VERSION,
      inputTokens: usage.input_tokens || 0,
      cacheCreationInputTokens: (usage as any).cache_creation_input_tokens || 0,
      cacheReadInputTokens: (usage as any).cache_read_input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      estimatedCostUsd: costUsd.toFixed(6),
      success: false,
      errorMessage: "tool input failed schema validation: " + JSON.stringify(parsed.error.errors),
      newsletterText,
      notes: null,
    });
    const err: any = new Error("Claude returned malformed tool input");
    err.apiCall = apiCall;
    err.zodErrors = parsed.error.errors;
    throw err;
  }

  const apiCall = await storage.insertClaudeApiCall({
    model: CLAUDE_MODEL,
    requestType: "parse_newsletter",
    promptVersion: PARSE_NEWSLETTER_PROMPT_VERSION,
    inputTokens: usage.input_tokens || 0,
    cacheCreationInputTokens: (usage as any).cache_creation_input_tokens || 0,
    cacheReadInputTokens: (usage as any).cache_read_input_tokens || 0,
    outputTokens: usage.output_tokens || 0,
    estimatedCostUsd: costUsd.toFixed(6),
    success: true,
    errorMessage: null,
    newsletterText,
    notes: null,
  });

  void startedAt;
  return { plan: parsed.data, promptVersion: PARSE_NEWSLETTER_PROMPT_VERSION, apiCall };
}
