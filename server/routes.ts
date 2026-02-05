import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { sendTelegramMessage } from "./telegram";
import { formatTelegramFree, formatTelegramPro, formatAll } from "./formatter";
import { insertPlanSchema } from "@shared/schema";
import { z } from "zod";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || "insecure-dev-secret";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD is not set. Admin login will be disabled.");
}

const validTokens = new Set<string>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (validTokens.has(token)) {
      return next();
    }
  }
  return res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: "Admin password not configured" });
    }
    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      validTokens.add(token);
      return res.json({ success: true, token });
    }
    return res.status(401).json({ error: "Invalid password" });
  });

  app.get("/api/auth/check", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (validTokens.has(token)) {
        return res.json({ authenticated: true });
      }
    }
    return res.status(401).json({ authenticated: false });
  });

  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      validTokens.delete(token);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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

      const variant = (req.body.variant as string) || "pro";
      let telegramMessage = variant === "free" ? formatTelegramFree(plan) : formatTelegramPro(plan);
      
      const settings = await storage.getSettings();
      if (settings.footerEnabled && settings.footerText) {
        const footer = settings.footerText.replace("{JOIN_URL}", settings.joinUrl || "");
        telegramMessage += "\n\n" + footer;
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
      res.status(500).json({ error: "Failed to republish plan" });
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
      const parsed = savePlanSchema.safeParse(req.body);
      if (!parsed.success) {
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
          "bias", "setup1", "setup2"
        ] : [
          "date", "symbol", "dynamicZoneTop", "dynamicZoneBottom",
          "magnet", "r1", "r2", "s1", "s2", "bias"
        ];

        for (const field of requiredFields) {
          const value = data[field as keyof typeof data];
          if (value === null || value === undefined || value === "") {
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
          telegramMessage += "\n\n" + footer;
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
        "bias", "setup1", "setup2"
      ];

      for (const field of requiredFields) {
        const value = data[field as keyof typeof data];
        if (value === null || value === undefined || value === "") {
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
