import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { sendTelegramMessage } from "./telegram";
import { formatTelegramFree, formatTelegramPro, formatAll, escapeMdV2 } from "./formatter";
import { formatBySource, formatAiParsedPlan, formatManualPlan, formatAlgorithmPlan } from "./lib/telegram-format";
import { parseNewsletter, ClaudeApiKeyMissingError } from "./lib/claude";
import { generateAndPublishLevels } from "./lib/levels-algorithm";
import { PARSE_NEWSLETTER_PROMPT_VERSION } from "./lib/prompts/parse-newsletter";
import { insertPlanSchema, ingestLevelsSchema, saveParsedPlanSchema } from "@shared/schema";
import { z } from "zod";
import {
  requireAdmin,
  createSession,
  deleteSessionByToken,
  verifyLogin,
  type AdminAuthRequest,
} from "./auth";

const previewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});

const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many ingest requests, slow down." },
});

// Per-IP limiter for the unauthenticated OG render endpoint. Lenient enough
// for normal social-crawler traffic (Twitter, Facebook, LinkedIn, Slack,
// Discord, iMessage, etc. each refetch only occasionally per URL) but tight
// enough to cap CPU amplification if someone scripts it. CDN caching makes
// repeat hits cheap; this protects the cold path.
const ogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OG requests, slow down." },
});

function timingSafeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Per-admin-token rate limiter for the Claude parse endpoint (20/min/token).
// Hit logs go to console so we can spot if we're banging into the cap.
const PARSE_LIMIT_PER_MIN = 20;
const parseRateBuckets = new Map<string, number[]>();
function parseRateLimit(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const token = req.session?.token;
  const key = token || (req.ip ?? "anon");
  const now = Date.now();
  const windowStart = now - 60_000;
  const bucket = (parseRateBuckets.get(key) || []).filter((t) => t > windowStart);
  if (bucket.length >= PARSE_LIMIT_PER_MIN) {
    const retryMs = Math.max(0, bucket[0] + 60_000 - now);
    console.warn(`[parse-newsletter] rate limit hit for token ${key.slice(0, 8)}…; retry in ${Math.ceil(retryMs / 1000)}s`);
    res.set("Retry-After", String(Math.ceil(retryMs / 1000)));
    return res.status(429).json({ error: "Too many parse requests; slow down." });
  }
  bucket.push(now);
  parseRateBuckets.set(key, bucket);
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const ok = await verifyLogin(username, password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const session = await createSession();
    return res.json({
      success: true,
      token: session.token,
      expires_at: session.expiresAt.toISOString(),
    });
  });

  app.get("/api/auth/check", requireAdmin, (req: AdminAuthRequest, res) => {
    return res.json({
      authenticated: true,
      expires_at: req.session!.expiresAt.toISOString(),
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await deleteSessionByToken(token).catch(() => {});
    }
    return res.json({ success: true });
  });

  app.get("/api/plans", requireAdmin, async (_req, res) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 100;
      const plans = await storage.listPlans(limit);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.get("/api/plans/lookup", requireAdmin, async (req, res) => {
    try {
      const { date, symbol } = req.query;
      if (!date || !symbol) {
        return res.status(400).json({ error: "Date and symbol are required" });
      }
      const plan = await storage.getPlanByDateSymbol(date as string, symbol as string);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  app.get("/api/plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }
      const plan = await storage.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  app.get("/api/plans/:id/logs", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }
      const logs = await storage.listPublishLogs(id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/plans/:id/republish", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }
      
      const plan = await storage.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        await storage.insertPublishLog({
          planId: id,
          destination: "telegram",
          status: "error",
          errorMessage: "Telegram not configured"
        });
        return res.status(400).json({ error: "Telegram not configured" });
      }

      // Pass 7: dispatch formatter by plan.source so manual/algorithm/ai_parsed
      // each render with their own template. Manual rows remain byte-identical.
      const variant = plan.source === "ai_parsed" ? "ai_parsed"
        : plan.source === "algorithm" ? "algorithm"
        : "pro";
      let telegramMessage = formatBySource(plan);

      const settings = await storage.getSettings();
      if (settings.footerEnabled && settings.footerText) {
        const footer = settings.footerText.replace("{JOIN_URL}", settings.joinUrl || "");
        telegramMessage += "\n\n" + escapeMdV2(footer);
      }
      
      try {
        const telegramResult = await sendTelegramMessage({
          token: TELEGRAM_BOT_TOKEN,
          chatId: TELEGRAM_CHAT_ID,
          text: telegramMessage
        });

        const messageId = telegramResult.result?.message_id?.toString();
        
        const updatedPlan = await storage.updatePlan(id, {
          status: "published",
          publishedAt: new Date().toISOString(),
          telegramMessageId: messageId,
          telegramMessage,
          telegramMessageVariant: variant
        });

        await storage.insertPublishLog({
          planId: id,
          destination: "telegram",
          variant: variant,
          status: "success",
          responsePayload: JSON.stringify({ messageId })
        });

        res.json(updatedPlan);
      } catch (telegramError) {
        const errorMsg = telegramError instanceof Error ? telegramError.message : "Failed to send to Telegram";
        await storage.insertPublishLog({
          planId: id,
          destination: "telegram",
          status: "error",
          errorMessage: errorMsg
        });
        res.status(500).json({ error: errorMsg });
      }
    } catch (error) {
      console.error("Republish error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to republish plan" });
    }
  });

  const savePlanSchema = z.object({
    id: z.number().nullable().optional(),
    date: z.string(),
    symbol: z.string(),
    contract: z.string().nullable().optional(),
    tier: z.string().optional().default("pro"),
    dynamicZoneTop: z.number().nullable().optional(),
    dynamicZoneBottom: z.number().nullable().optional(),
    magnet: z.number().nullable().optional(),
    r1: z.number().nullable().optional(),
    r2: z.number().nullable().optional(),
    r3: z.number().nullable().optional(),
    r4: z.number().nullable().optional(),
    s1: z.number().nullable().optional(),
    s2: z.number().nullable().optional(),
    s3: z.number().nullable().optional(),
    s4: z.number().nullable().optional(),
    bias: z.string().nullable().optional(),
    setup1: z.string().nullable().optional(),
    setup2: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    action: z.string().optional()
  });

  app.post("/api/plans/save", requireAdmin, async (req, res) => {
    try {
      console.log("POST /api/plans/save - action:", req.body?.action);
      const parsed = savePlanSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("Validation error:", parsed.error.errors);
        return res.status(400).json({ error: "Invalid plan data", details: parsed.error.errors });
      }

      const data = parsed.data;
      const action = data.action || "save";
      
      if (action === "publish_free" || action === "publish_pro") {
        const isPro = action === "publish_pro";
        const variant = isPro ? "pro" : "free";
        
        const requiredFields = isPro ? [
          "date", "symbol", "dynamicZoneTop", "dynamicZoneBottom",
          "magnet", "r1", "r2", "r3", "r4", "s1", "s2", "s3", "s4",
          "bias"
        ] : [
          "date", "symbol", "dynamicZoneTop", "dynamicZoneBottom",
          "magnet", "r1", "r2", "s1", "s2", "bias"
        ];

        for (const field of requiredFields) {
          const value = data[field as keyof typeof data];
          if (value === null || value === undefined || value === "") {
            console.error(`Missing required field: ${field}`, { value });
            return res.status(400).json({ error: `Missing required field: ${field}` });
          }
        }

        const dzTop = data.dynamicZoneTop;
        const dzBottom = data.dynamicZoneBottom;
        if (dzTop !== null && dzBottom !== null && dzTop !== undefined && dzBottom !== undefined && dzTop <= dzBottom) {
          return res.status(400).json({ error: "Dynamic Zone Top must be greater than Dynamic Zone Bottom" });
        }

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
          return res.status(500).json({ error: "Telegram credentials not configured" });
        }

        let plan = await storage.upsertPlan({
          id: data.id ?? undefined,
          date: data.date,
          symbol: data.symbol,
          contract: data.contract ?? null,
          tier: data.tier ?? "pro",
          dynamicZoneTop: data.dynamicZoneTop ?? null,
          dynamicZoneBottom: data.dynamicZoneBottom ?? null,
          magnet: data.magnet ?? null,
          r1: data.r1 ?? null,
          r2: data.r2 ?? null,
          r3: data.r3 ?? null,
          r4: data.r4 ?? null,
          s1: data.s1 ?? null,
          s2: data.s2 ?? null,
          s3: data.s3 ?? null,
          s4: data.s4 ?? null,
          bias: data.bias ?? null,
          setup1: data.setup1 ?? null,
          setup2: data.setup2 ?? null,
          notes: data.notes ?? null,
          status: "draft",
          publishedAt: null,
          telegramMessageId: null,
          telegramMessage: null,
          telegramMessageVariant: null
        });

        let telegramMessage = isPro ? formatTelegramPro(plan) : formatTelegramFree(plan);
        
        const settings = await storage.getSettings();
        if (settings.footerEnabled && settings.footerText) {
          const footer = settings.footerText.replace("{JOIN_URL}", settings.joinUrl || "");
          telegramMessage += "\n\n" + escapeMdV2(footer);
        }

        try {
          const response = await sendTelegramMessage({
            token: TELEGRAM_BOT_TOKEN,
            chatId: TELEGRAM_CHAT_ID,
            text: telegramMessage
          });

          const messageId = response.result?.message_id?.toString() || "";

          plan = await storage.upsertPlan({
            ...plan,
            status: "published",
            publishedAt: new Date().toISOString(),
            telegramMessageId: messageId,
            telegramMessage: telegramMessage,
            telegramMessageVariant: variant
          });

          await storage.insertPublishLog({
            planId: plan.id,
            destination: "telegram",
            variant: variant,
            status: "success",
            errorMessage: null,
            responsePayload: JSON.stringify(response)
          });

          res.json(plan);
        } catch (telegramError: any) {
          console.error("Telegram send error:", telegramError.message);
          await storage.insertPublishLog({
            planId: plan.id,
            destination: "telegram",
            variant: variant,
            status: "error",
            errorMessage: telegramError.message,
            responsePayload: null
          });

          res.status(500).json({ error: `Telegram error: ${telegramError.message}` });
        }
        return;
      }

      const plan = await storage.upsertPlan({
        id: data.id ?? undefined,
        date: data.date,
        symbol: data.symbol,
        contract: data.contract ?? null,
        tier: data.tier ?? "pro",
        dynamicZoneTop: data.dynamicZoneTop ?? null,
        dynamicZoneBottom: data.dynamicZoneBottom ?? null,
        magnet: data.magnet ?? null,
        r1: data.r1 ?? null,
        r2: data.r2 ?? null,
        r3: data.r3 ?? null,
        r4: data.r4 ?? null,
        s1: data.s1 ?? null,
        s2: data.s2 ?? null,
        s3: data.s3 ?? null,
        s4: data.s4 ?? null,
        bias: data.bias ?? null,
        setup1: data.setup1 ?? null,
        setup2: data.setup2 ?? null,
        notes: data.notes ?? null,
        status: "draft",
        publishedAt: null,
        telegramMessageId: null,
        telegramMessage: null,
        telegramMessageVariant: null
      });

      res.json(plan);
    } catch (error) {
      console.error("Error saving plan:", error);
      res.status(500).json({ error: "Failed to save plan" });
    }
  });

  app.post("/api/plans/publish", requireAdmin, async (req, res) => {
    try {
      const parsed = savePlanSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid plan data", details: parsed.error.errors });
      }

      const data = parsed.data;

      const requiredFields = [
        "date", "symbol", "dynamicZoneTop", "dynamicZoneBottom",
        "magnet", "r1", "r2", "r3", "r4", "s1", "s2", "s3", "s4",
        "bias"
      ];

      for (const field of requiredFields) {
        const value = data[field as keyof typeof data];
        if (value === null || value === undefined || value === "") {
          console.error(`Publish: Missing required field: ${field}`);
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.status(500).json({ error: "Telegram credentials not configured" });
      }

      let plan = await storage.upsertPlan({
        id: data.id ?? undefined,
        date: data.date,
        symbol: data.symbol,
        contract: data.contract ?? null,
        dynamicZoneTop: data.dynamicZoneTop ?? null,
        dynamicZoneBottom: data.dynamicZoneBottom ?? null,
        magnet: data.magnet ?? null,
        r1: data.r1 ?? null,
        r2: data.r2 ?? null,
        r3: data.r3 ?? null,
        r4: data.r4 ?? null,
        s1: data.s1 ?? null,
        s2: data.s2 ?? null,
        s3: data.s3 ?? null,
        s4: data.s4 ?? null,
        bias: data.bias ?? null,
        setup1: data.setup1 ?? null,
        setup2: data.setup2 ?? null,
        notes: data.notes ?? null,
        status: "draft",
        publishedAt: null,
        telegramMessageId: null,
        telegramMessage: null
      });

      const telegramText = formatTelegramPro(plan);

      try {
        const response = await sendTelegramMessage({
          token: TELEGRAM_BOT_TOKEN,
          chatId: TELEGRAM_CHAT_ID,
          text: telegramText
        });

        const messageId = response.result?.message_id?.toString() || "";

        plan = await storage.upsertPlan({
          ...plan,
          status: "published",
          publishedAt: new Date().toISOString(),
          telegramMessageId: messageId,
          telegramMessage: telegramText
        });

        await storage.insertPublishLog({
          planId: plan.id,
          destination: "telegram",
          status: "success",
          errorMessage: null,
          responsePayload: JSON.stringify(response)
        });

        res.json(plan);
      } catch (telegramError: any) {
        await storage.insertPublishLog({
          planId: plan.id,
          destination: "telegram",
          status: "error",
          errorMessage: telegramError.message,
          responsePayload: null
        });

        res.status(500).json({ error: `Telegram error: ${telegramError.message}` });
      }
    } catch (error) {
      console.error("Error publishing plan:", error);
      res.status(500).json({ error: "Failed to publish plan" });
    }
  });

  app.post("/api/telegram/test", requireAdmin, async (_req, res) => {
    try {
      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.status(500).json({ error: "Telegram credentials not configured" });
      }

      await sendTelegramMessage({
        token: TELEGRAM_BOT_TOKEN,
        chatId: TELEGRAM_CHAT_ID,
        text: "Trade Levels Pro test message"
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/settings", requireAdmin, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.post("/api/preview-signup", previewLimiter, async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email().max(254),
        source: z.string().max(80).optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Please enter a valid email." });
      }
      await storage.insertPreview({
        email: parsed.data.email.toLowerCase().trim(),
        source: parsed.data.source ?? "home",
      });
      res.json({ success: true });
    } catch (err) {
      console.error("preview-signup error:", err);
      res.status(500).json({ error: "Failed to save email." });
    }
  });

  app.get("/api/plans/copy-previous", requireAdmin, async (req, res) => {
    try {
      const { date, symbol } = req.query;
      if (!date || !symbol) {
        return res.status(400).json({ error: "date and symbol required" });
      }
      const prev = await storage.getPreviousPlan(date as string, symbol as string);
      if (!prev) return res.status(404).json({ error: "No previous plan found" });
      res.json(prev);
    } catch (err) {
      res.status(500).json({ error: "Failed to load previous plan" });
    }
  });

  app.get("/api/plans/latest-published", requireAdmin, async (_req, res) => {
    try {
      const latest = await storage.getLatestPublishedPlan();
      res.json(latest ?? null);
    } catch (err) {
      res.status(500).json({ error: "Failed to load latest plan" });
    }
  });

  // ---- Pass 5 additions ----

  // TradingView webhook → creates a draft plan from a JSON alert payload.
  // Header: `X-TV-Secret: <TV_WEBHOOK_SECRET>`
  // Body example:
  // {
  //   "date": "2026-05-13",
  //   "symbol": "ES",
  //   "contract": "ESM26",
  //   "magnet": 5872, "dynamicZoneTop": 5880, "dynamicZoneBottom": 5864,
  //   "r1": 5894, "r2": 5908, "r3": 5926, "r4": 5945,
  //   "s1": 5856, "s2": 5840, "s3": 5821, "s4": 5802,
  //   "bias": "Neutral with upside lean",
  //   "setup1": "Long failed breakdown of S1",
  //   "setup2": "Short rejection at R2"
  // }
  app.post("/api/tv-webhook", async (req, res) => {
    const expected = process.env.TV_WEBHOOK_SECRET;
    const provided = req.header("X-TV-Secret") || req.header("x-tv-secret");
    if (!expected) return res.status(503).json({ error: "TV_WEBHOOK_SECRET not configured" });
    if (provided !== expected) return res.status(401).json({ error: "Unauthorized" });

    const tvSchema = z.object({
      date: z.string().transform((s) => {
        // Accept YYYY-MM-DD or any ISO-ish string; normalize to YYYY-MM-DD.
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return `${m[1]}-${m[2]}-${m[3]}`;
        const d = new Date(s);
        if (isNaN(d.getTime())) throw new Error("Invalid date");
        return d.toISOString().slice(0, 10);
      }),
      symbol: z.enum(["ES", "NQ"]),
      contract: z.string().nullable().optional(),
      tier: z.string().optional(),
      dynamicZoneTop: z.coerce.number().nullable().optional(),
      dynamicZoneBottom: z.coerce.number().nullable().optional(),
      magnet: z.coerce.number().nullable().optional(),
      r1: z.coerce.number().nullable().optional(),
      r2: z.coerce.number().nullable().optional(),
      r3: z.coerce.number().nullable().optional(),
      r4: z.coerce.number().nullable().optional(),
      s1: z.coerce.number().nullable().optional(),
      s2: z.coerce.number().nullable().optional(),
      s3: z.coerce.number().nullable().optional(),
      s4: z.coerce.number().nullable().optional(),
      bias: z.string().nullable().optional(),
      setup1: z.string().nullable().optional(),
      setup2: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    });
    const parsed = tvSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid TV payload", details: parsed.error.errors });
    }
    try {
      const d = parsed.data;
      const plan = await storage.upsertPlan({
        date: d.date,
        symbol: d.symbol,
        contract: d.contract ?? null,
        tier: d.tier ?? "pro",
        dynamicZoneTop: d.dynamicZoneTop ?? null,
        dynamicZoneBottom: d.dynamicZoneBottom ?? null,
        magnet: d.magnet ?? null,
        r1: d.r1 ?? null, r2: d.r2 ?? null, r3: d.r3 ?? null, r4: d.r4 ?? null,
        s1: d.s1 ?? null, s2: d.s2 ?? null, s3: d.s3 ?? null, s4: d.s4 ?? null,
        bias: d.bias ?? null,
        setup1: d.setup1 ?? null,
        setup2: d.setup2 ?? null,
        notes: d.notes ?? null,
        status: "draft",
        publishedAt: null,
        telegramMessageId: null,
        telegramMessage: null,
        telegramMessageVariant: null,
      });
      res.json({ success: true, planId: plan.id, status: plan.status });
    } catch (err: any) {
      console.error("tv-webhook error:", err);
      res.status(500).json({ error: err?.message || "Failed to save plan" });
    }
  });

  // Schedule a draft plan to publish later.
  app.post("/api/plans/schedule", requireAdmin, async (req, res) => {
    const schema = z.object({
      id: z.number(),
      scheduledFor: z.string(), // ISO datetime
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid schedule payload" });
    const when = new Date(parsed.data.scheduledFor);
    if (isNaN(when.getTime())) return res.status(400).json({ error: "Invalid scheduledFor datetime" });
    try {
      const updated = await storage.updatePlan(parsed.data.id, {
        status: "scheduled",
        scheduledFor: when,
      } as any);
      if (!updated) return res.status(404).json({ error: "Plan not found" });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to schedule plan" });
    }
  });

  // Paste-import: accept JSON object OR `key: value` lines; returns parsed fields.
  app.post("/api/plans/parse-paste", requireAdmin, (req, res) => {
    const raw = String(req.body?.text || "").trim();
    if (!raw) return res.status(400).json({ error: "Empty paste" });
    const numericKeys = ["dynamicZoneTop","dynamicZoneBottom","magnet","r1","r2","r3","r4","s1","s2","s3","s4"];
    const aliasMap: Record<string, string> = {
      "dz top": "dynamicZoneTop", "dztop": "dynamicZoneTop", "dynamic zone top": "dynamicZoneTop",
      "dz bottom": "dynamicZoneBottom", "dzbottom": "dynamicZoneBottom", "dynamic zone bottom": "dynamicZoneBottom",
      "magnet": "magnet",
      "r1": "r1","r2": "r2","r3": "r3","r4": "r4",
      "s1": "s1","s2": "s2","s3": "s3","s4": "s4",
      "bias": "bias", "setup1": "setup1", "setup 1": "setup1", "setup2": "setup2", "setup 2": "setup2",
      "notes": "notes", "contract": "contract", "symbol": "symbol", "date": "date",
    };
    const out: Record<string, any> = {};
    // Try JSON first
    try {
      const j = JSON.parse(raw);
      if (j && typeof j === "object") {
        for (const [k, v] of Object.entries(j)) out[k] = v;
        return res.json(out);
      }
    } catch {}
    // Fallback: line-by-line key:value
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([^:=]+)\s*[:=]\s*(.+?)\s*$/);
      if (!m) continue;
      const key = aliasMap[m[1].trim().toLowerCase()] || m[1].trim();
      let val: any = m[2].trim();
      if (numericKeys.includes(key)) {
        const n = parseFloat(val.replace(/,/g, ""));
        val = Number.isFinite(n) ? n : null;
      }
      out[key] = val;
    }
    res.json(out);
  });

  // Public archive — last 30 published plans (gated bias/setups handled client-side).
  app.get("/api/public/archive", async (_req, res) => {
    try {
      const list = await storage.listPublicPlans(30);
      const ids = list.map((p) => p.id);
      const results = await storage.listResultsForPlanIds(ids);
      const byPlan = new Map<number, boolean>();
      for (const r of results) byPlan.set(r.planId, true);
      const safe = list.map((p) => ({
        id: p.id,
        date: p.date,
        symbol: p.symbol,
        contract: p.contract,
        dynamicZoneTop: p.dynamicZoneTop,
        dynamicZoneBottom: p.dynamicZoneBottom,
        magnet: p.magnet,
        r1: p.r1, r2: p.r2, r3: p.r3, r4: p.r4,
        s1: p.s1, s2: p.s2, s3: p.s3, s4: p.s4,
        publishedAt: p.publishedAt,
        hasResult: byPlan.has(p.id),
      }));
      res.json(safe);
    } catch (err) {
      console.error("public archive error:", err);
      res.status(500).json({ error: "Failed to load archive" });
    }
  });

  // Public, read-only track record: aggregate hit rates from plan_results.
  // Powers the public "proof" page. Buckets overall + per-symbol so we can show
  // magnet hit rate, R1/S1 tag rates, and sessions counted.
  app.get("/api/public/track-record", async (_req, res) => {
    try {
      const rows = await storage.listAllPlanResults(1000);

      const emptyBucket = () => ({
        sessions: 0,
        hitMagnet: 0,
        hitR1: 0,
        hitR2: 0,
        hitS1: 0,
        hitS2: 0,
      });
      type Bucket = ReturnType<typeof emptyBucket>;
      const buckets: Record<string, Bucket> = { ALL: emptyBucket() };

      for (const r of rows) {
        const sym = r.symbol || "?";
        if (!buckets[sym]) buckets[sym] = emptyBucket();
        for (const b of [buckets.ALL, buckets[sym]]) {
          b.sessions += 1;
          b.hitMagnet += r.hitMagnet ?? 0;
          b.hitR1 += r.hitR1 ?? 0;
          b.hitR2 += r.hitR2 ?? 0;
          b.hitS1 += r.hitS1 ?? 0;
          b.hitS2 += r.hitS2 ?? 0;
        }
      }

      const rate = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);
      const summarize = (b: Bucket) => ({
        sessions: b.sessions,
        magnetHitRate: rate(b.hitMagnet, b.sessions),
        r1TagRate: rate(b.hitR1, b.sessions),
        r2TagRate: rate(b.hitR2, b.sessions),
        s1TagRate: rate(b.hitS1, b.sessions),
        s2TagRate: rate(b.hitS2, b.sessions),
      });

      const bySymbol: Record<string, ReturnType<typeof summarize>> = {};
      for (const [sym, b] of Object.entries(buckets)) {
        if (sym === "ALL") continue;
        bySymbol[sym] = summarize(b);
      }

      res.json({ overall: summarize(buckets.ALL), bySymbol });
    } catch (err) {
      console.error("public track-record error:", err);
      res.status(500).json({ error: "Failed to load track record" });
    }
  });

  // ===== Newsletter Parser (Pass 7) =====

  app.post("/api/admin/parse-newsletter", requireAdmin, parseRateLimit, async (req, res) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
    }
    const text = String(req.body?.newsletter_text || "").trim();
    if (text.length < 50) {
      return res.status(400).json({ error: "newsletter_text is required (min 50 chars)" });
    }
    try {
      const result = await parseNewsletter(text);
      return res.json({
        ok: true,
        plan: result.plan,
        prompt_version: result.promptVersion,
        claude_api_call_id: result.apiCall.id,
        cost_usd: Number(result.apiCall.estimatedCostUsd || 0),
        tokens: {
          input: result.apiCall.inputTokens,
          cache_creation: result.apiCall.cacheCreationInputTokens,
          cache_read: result.apiCall.cacheReadInputTokens,
          output: result.apiCall.outputTokens,
        },
      });
    } catch (err: any) {
      if (err instanceof ClaudeApiKeyMissingError) {
        return res.status(503).json({ error: err.message });
      }
      const status = err?.originalStatus === 404 ? 502 : 502;
      console.error("[parse-newsletter] error:", err?.message);
      return res.status(status).json({
        error: err?.message || "Claude call failed",
        claude_api_call_id: err?.apiCall?.id,
      });
    }
  });

  app.post("/api/admin/save-parsed-plan", requireAdmin, async (req, res) => {
    const parsed = saveParsedPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.errors });
    }
    const d = parsed.data;
    if (d.dynamic_zone_high <= d.dynamic_zone_low) {
      return res.status(400).json({ error: "dynamic_zone_high must be greater than dynamic_zone_low" });
    }

    const apiCall = await storage.getClaudeApiCallById(d.claude_api_call_id);
    if (!apiCall) {
      return res.status(400).json({ error: "Unknown claude_api_call_id" });
    }

    // Same-date collision check: refuse to overwrite a non-ai_parsed row unless force_overwrite.
    const existing = await storage.getPlanByDateSymbol(d.target_date, d.symbol);
    if (existing && existing.source !== "ai_parsed" && !d.force_overwrite) {
      return res.status(409).json({
        error: "collision",
        existing_plan_id: existing.id,
        existing_source: existing.source,
        existing_updated_at: existing.updatedAt,
      });
    }

    const overwriteNote = existing && existing.source !== "ai_parsed" && d.force_overwrite
      ? `overwrote ${existing.source} plan id=${existing.id} (was updated_at=${existing.updatedAt?.toISOString?.() || existing.updatedAt})`
      : null;

    const plan = await storage.upsertPlan({
      date: d.target_date,
      symbol: d.symbol,
      contract: null,
      tier: "pro",
      dynamicZoneTop: d.dynamic_zone_high,
      dynamicZoneBottom: d.dynamic_zone_low,
      magnet: d.magnet,
      r1: d.r1, r2: d.r2, r3: d.r3, r4: d.r4,
      s1: d.s1, s2: d.s2, s3: d.s3, s4: d.s4,
      bias: d.bias,
      setup1: null, setup2: null, notes: null,
      status: "draft",
      publishedAt: null,
      telegramMessageId: null,
      telegramMessage: null,
      telegramMessageVariant: null,
      source: "ai_parsed",
      biasReasoning: d.bias_reasoning,
      topLongTrade: d.top_long_trade,
      topShortTrade: d.top_short_trade,
      promptVersion: d.prompt_version,
      editedFields: d.edited_fields,
      claudeApiCallId: d.claude_api_call_id,
    } as any);

    if (overwriteNote) {
      try {
        // Annotate the audit log via claude_api_calls.notes for this call.
        const { db } = await import("./db");
        const { claudeApiCalls } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        await db
          .update(claudeApiCalls)
          .set({ notes: overwriteNote })
          .where(eq(claudeApiCalls.id, d.claude_api_call_id));
      } catch (e) {
        console.warn("[save-parsed-plan] failed to annotate overwrite note:", e);
      }
    }

    let telegramSent = false;
    let telegramError: string | null = null;
    let updatedPlan = plan;

    if (d.send_telegram) {
      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        telegramError = "Telegram credentials not configured";
        await storage.insertPublishLog({
          planId: plan.id,
          destination: "telegram",
          variant: "ai_parsed",
          status: "error",
          errorMessage: telegramError,
        });
      } else {
        const settings = await storage.getSettings();
        let text = formatAiParsedPlan(plan);
        if (settings.footerEnabled && settings.footerText) {
          const footer = settings.footerText.replace("{JOIN_URL}", settings.joinUrl || "");
          text += "\n\n" + escapeMdV2(footer);
        }
        try {
          const resp = await sendTelegramMessage({
            token: TELEGRAM_BOT_TOKEN,
            chatId: TELEGRAM_CHAT_ID,
            text,
          });
          const messageId = resp.result?.message_id?.toString() || "";
          updatedPlan = await storage.upsertPlan({
            ...plan,
            status: "published",
            publishedAt: new Date().toISOString(),
            telegramMessageId: messageId,
            telegramMessage: text,
            telegramMessageVariant: "ai_parsed",
          } as any);
          await storage.insertPublishLog({
            planId: plan.id,
            destination: "telegram",
            variant: "ai_parsed",
            status: "success",
            responsePayload: JSON.stringify({ messageId }),
          });
          telegramSent = true;
        } catch (sendErr: any) {
          telegramError = sendErr?.message || String(sendErr);
          updatedPlan = await storage.upsertPlan({ ...plan, status: "publish_failed" } as any);
          await storage.insertPublishLog({
            planId: plan.id,
            destination: "telegram",
            variant: "ai_parsed",
            status: "error",
            errorMessage: telegramError,
          });
        }
      }
    }

    return res.json({
      ok: true,
      plan: updatedPlan,
      telegramSent,
      telegramError,
      overwroteSource: overwriteNote ? existing!.source : null,
    });
  });

  app.get("/api/admin/claude-usage", requireAdmin, async (req, res) => {
    const days = Math.max(1, Math.min(365, parseInt(String(req.query.days || "30"), 10) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const usage = await storage.getClaudeUsageSince(since);
    const successRate = usage.totalCalls === 0 ? null : usage.successCalls / usage.totalCalls;
    return res.json({
      days,
      totalCalls: usage.totalCalls,
      successCalls: usage.successCalls,
      successRate,
      totalCostUsd: Number(usage.totalCostUsd.toFixed(6)),
      promptVersion: PARSE_NEWSLETTER_PROMPT_VERSION,
      anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    });
  });

  // ===== Algorithm Ingest API (Pass 6) =====

  app.get("/api/admin/ingest-key", requireAdmin, (_req, res) => {
    const key = process.env.ALGORITHM_INGEST_API_KEY || "";
    res.json({
      configured: !!key,
      key: key,
      length: key.length,
    });
  });

  app.get("/api/admin/algorithm-plans", requireAdmin, async (_req, res) => {
    try {
      const list = await storage.listAlgorithmPlans(20);
      res.json(list);
    } catch (err) {
      console.error("listAlgorithmPlans error:", err);
      res.status(500).json({ error: "Failed to load algorithm plans" });
    }
  });

  // Admin-only manual trigger: run the self-generating levels pipeline now
  // (fetch OHLC -> compute -> POST /api/levels/ingest -> Telegram), instead of
  // waiting for the 5:15pm ET cron. Handy for verifying the whole flow.
  app.post("/api/admin/generate-levels", requireAdmin, async (_req, res) => {
    try {
      await generateAndPublishLevels();
      res.json({ ok: true });
    } catch (err: any) {
      console.error("generate-levels error:", err);
      res.status(500).json({ error: err?.message || "Failed to generate levels" });
    }
  });

  app.post("/api/levels/ingest", ingestLimiter, async (req, res) => {
    const expected = process.env.ALGORITHM_INGEST_API_KEY;
    if (!expected) {
      return res.status(503).json({ error: "ALGORITHM_INGEST_API_KEY not configured" });
    }
    const auth = req.header("authorization") || req.header("Authorization") || "";
    if (!auth.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }
    const provided = auth.slice(7).trim();
    if (!timingSafeEq(provided, expected)) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const parsed = ingestLevelsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.errors });
    }
    const d = parsed.data;

    if (d.dynamic_zone_high != null && d.dynamic_zone_low != null && d.dynamic_zone_high <= d.dynamic_zone_low) {
      return res.status(400).json({ error: "dynamic_zone_high must be greater than dynamic_zone_low" });
    }

    try {
      let plan = await storage.upsertPlan({
        date: d.target_date,
        symbol: d.symbol,
        contract: d.contract ?? null,
        tier: "pro",
        dynamicZoneTop: d.dynamic_zone_high ?? null,
        dynamicZoneBottom: d.dynamic_zone_low ?? null,
        magnet: d.magnet ?? null,
        r1: d.r1 ?? null, r2: d.r2 ?? null, r3: d.r3 ?? null, r4: d.r4 ?? null,
        s1: d.s1 ?? null, s2: d.s2 ?? null, s3: d.s3 ?? null, s4: d.s4 ?? null,
        bias: d.bias ?? null,
        setup1: null, setup2: null, notes: null,
        status: "draft",
        publishedAt: null,
        telegramMessageId: null,
        telegramMessage: null,
        telegramMessageVariant: null,
        source: "algorithm",
        algorithmVersion: d.algorithm_version,
        generatedAt: new Date(),
        currentPrice: d.current_price ?? null,
      } as any);

      const settings = await storage.getSettings();
      const autoSend = settings.algorithmAutoSend !== false;

      if (!autoSend) {
        return res.status(200).json({
          ok: true,
          plan,
          telegramSent: false,
          reason: "auto-send disabled in settings",
        });
      }

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        await storage.insertPublishLog({
          planId: plan.id,
          destination: "telegram",
          variant: "algorithm",
          status: "error",
          errorMessage: "Telegram credentials not configured",
        });
        return res.status(200).json({ ok: true, plan, telegramSent: false, reason: "telegram-not-configured" });
      }

      let body = formatTelegramPro(plan);
      const tag = `🤖 Algorithm ${escapeMdV2(d.algorithm_version)}\n`;
      let text = tag + body;
      if (settings.footerEnabled && settings.footerText) {
        const footer = settings.footerText.replace("{JOIN_URL}", settings.joinUrl || "");
        text += "\n\n" + escapeMdV2(footer);
      }

      try {
        const resp = await sendTelegramMessage({
          token: TELEGRAM_BOT_TOKEN,
          chatId: TELEGRAM_CHAT_ID,
          text,
        });
        const messageId = resp.result?.message_id?.toString() || "";
        plan = await storage.upsertPlan({
          ...plan,
          status: "published",
          publishedAt: new Date().toISOString(),
          telegramMessageId: messageId,
          telegramMessage: text,
          telegramMessageVariant: "algorithm",
        } as any);
        await storage.insertPublishLog({
          planId: plan.id,
          destination: "telegram",
          variant: "algorithm",
          status: "success",
          responsePayload: JSON.stringify({ messageId }),
        });
        return res.status(200).json({ ok: true, plan, telegramSent: true });
      } catch (sendErr: any) {
        plan = await storage.upsertPlan({
          ...plan,
          status: "publish_failed",
        } as any);
        await storage.insertPublishLog({
          planId: plan.id,
          destination: "telegram",
          variant: "algorithm",
          status: "error",
          errorMessage: sendErr?.message || String(sendErr),
        });
        return res.status(200).json({
          ok: true,
          plan,
          telegramSent: false,
          reason: sendErr?.message || "telegram send failed",
        });
      }
    } catch (err: any) {
      console.error("ingest error:", err);
      return res.status(500).json({ error: err?.message || "Ingest failed" });
    }
  });

  // ===== Per-plan OG images + public detail data =====

  // Public read-only fetch for the /p/:id detail page. Same gating as the
  // archive list (status="published" AND source ∈ PUBLIC_PLAN_SOURCES) and
  // returns the same level-only shape — never bias / setups / reasoning,
  // those stay members-only inside Telegram.
  app.get("/api/public/plans/:id", async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(404).json({ error: "Plan not found" });
    }
    const plan = await storage.getPublicPlan(id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json({
      id: plan.id,
      date: plan.date,
      symbol: plan.symbol,
      contract: plan.contract,
      dynamicZoneTop: plan.dynamicZoneTop,
      dynamicZoneBottom: plan.dynamicZoneBottom,
      magnet: plan.magnet,
      r1: plan.r1, r2: plan.r2, r3: plan.r3, r4: plan.r4,
      s1: plan.s1, s2: plan.s2, s3: plan.s3, s4: plan.s4,
      bias: plan.bias,
      publishedAt: plan.publishedAt,
      // Epoch ms of last admin edit. Used by the detail page to version the
      // og:image URL (?v=…) so post-publish edits bust the social/CDN cache.
      updatedAt: plan.updatedAt ? new Date(plan.updatedAt).getTime() : null,
    });
  });

  // Per-plan OG card. Public, crawler-fetchable, 1200x630 PNG.
  // Cached aggressively — the URL itself is versioned by ?v=<updatedAt>, so
  // any plan edit produces a new URL and dodges stale cached cards.
  app.get("/api/og/plan/:id.png", ogLimiter, async (req, res) => {
    const id = Number.parseInt(String(req.params.id), 10);
    const { renderPlanOgImage, renderNotFoundOgImage } = await import("./og");

    async function send404Placeholder() {
      try {
        const buf = await renderNotFoundOgImage();
        res.status(404);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=300");
        return res.end(buf);
      } catch (err) {
        console.error("og placeholder render failed:", err);
        return res.status(404).type("text/plain").send("Plan not found");
      }
    }

    if (!Number.isFinite(id) || id <= 0) {
      return send404Placeholder();
    }
    const plan = await storage.getPublicPlan(id);
    if (!plan) return send404Placeholder();

    try {
      const image = await renderPlanOgImage(plan);
      const buf = Buffer.from(await image.arrayBuffer());
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Cache-Control",
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      );
      return res.end(buf);
    } catch (err) {
      console.error("og render failed for plan", id, err);
      return send404Placeholder();
    }
  });

  app.get("/api/public/site-config", (_req, res) => {
    res.json({ clarityProjectId: process.env.CLARITY_PROJECT_ID || null });
  });

  app.get("/api/public/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json({
        joinUrl: settings.joinUrl,
        substackUrl: settings.substackUrl,
        xUrl: settings.xUrl,
        priceText: settings.priceText
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  return httpServer;
}
