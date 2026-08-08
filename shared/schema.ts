import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, serial, jsonb, numeric, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Full curated level set stored with each plan so the track record scores the
// exact levels that were published (not levels recomputed later from newer data).
export interface PlanLevels {
  magnet: number | null;
  dynamicZoneTop: number | null;
  dynamicZoneBottom: number | null;
  priorHigh: number | null;
  priorLow: number | null;
  priorClose: number | null;
  overnightHigh: number | null;
  overnightLow: number | null;
  priorWeekHigh: number | null;
  priorWeekLow: number | null;
  recentHigh: number | null;
  recentLow: number | null;
  swingSupports: number[];
  swingResistances: number[];
  // Ranked variants (with prominence + quality tier) so the terminal can render
  // the SAME levels the plan was built from, tiered. Optional: older stored plans
  // predate these and fall back to the bare number arrays above.
  swingSupportPoints?: SwingPointData[];
  swingResistancePoints?: SwingPointData[];
  // "momentum" = breakout/parabolic phase (lead with the deep A+, be patient);
  // "normal" = range day (nearest-first ladder). Set by the level generator.
  regime?: "momentum" | "normal";
}

export interface SwingPointData {
  price: number;
  prominence: number;
  tier: "major" | "minor" | "micro";
}

// Per-session scoring of those levels (which were tagged, and failed-breakdown success).
export interface LevelHits {
  magnet: 0 | 1;
  named: Record<string, 0 | 1>; // priorHigh, priorLow, overnightHigh, ...
  supports: { total: number; tagged: number; flushed: number; reclaimed: number };
  resistances: { total: number; tagged: number };
  // The flagged A+ failed-breakdown level and whether it flushed AND reclaimed
  // (the setup working), plus the first upside target and whether price hit it.
  // Optional so older scored rows (before these were tracked) still validate.
  aPlus?: number | null;
  aPlusReclaimed?: 0 | 1;
  firstTarget?: number | null;
  firstTargetHit?: 0 | 1;
}

// Zod schemas for the jsonb columns above. drizzle-zod does not infer a jsonb
// column's `$type<T>()`, so these are wired into the insert schemas via .extend()
// (same pattern as editedFields) to keep InsertPlan/InsertPlanResult types aligned
// with the Drizzle column types.
export const planLevelsSchema = z.object({
  magnet: z.number().nullable(),
  dynamicZoneTop: z.number().nullable(),
  dynamicZoneBottom: z.number().nullable(),
  priorHigh: z.number().nullable(),
  priorLow: z.number().nullable(),
  priorClose: z.number().nullable(),
  overnightHigh: z.number().nullable(),
  overnightLow: z.number().nullable(),
  priorWeekHigh: z.number().nullable(),
  priorWeekLow: z.number().nullable(),
  recentHigh: z.number().nullable(),
  recentLow: z.number().nullable(),
  swingSupports: z.array(z.number()),
  swingResistances: z.array(z.number()),
  swingSupportPoints: z
    .array(
      z.object({
        price: z.number(),
        prominence: z.number(),
        tier: z.enum(["major", "minor", "micro"]),
      }),
    )
    .optional(),
  swingResistancePoints: z
    .array(
      z.object({
        price: z.number(),
        prominence: z.number(),
        tier: z.enum(["major", "minor", "micro"]),
      }),
    )
    .optional(),
  regime: z.enum(["momentum", "normal"]).optional(),
});

export const levelHitsSchema = z.object({
  magnet: z.union([z.literal(0), z.literal(1)]),
  named: z.record(z.string(), z.union([z.literal(0), z.literal(1)])),
  supports: z.object({
    total: z.number(),
    tagged: z.number(),
    flushed: z.number(),
    reclaimed: z.number(),
  }),
  resistances: z.object({ total: z.number(), tagged: z.number() }),
  aPlus: z.number().nullable().optional(),
  aPlusReclaimed: z.union([z.literal(0), z.literal(1)]).optional(),
  firstTarget: z.number().nullable().optional(),
  firstTargetHit: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  symbol: text("symbol").notNull(),
  contract: text("contract"),
  tier: text("tier").notNull().default("pro"),
  dynamicZoneTop: real("dynamic_zone_top"),
  dynamicZoneBottom: real("dynamic_zone_bottom"),
  magnet: real("magnet"),
  r1: real("r1"),
  r2: real("r2"),
  r3: real("r3"),
  r4: real("r4"),
  s1: real("s1"),
  s2: real("s2"),
  s3: real("s3"),
  s4: real("s4"),
  bias: text("bias"),
  setup1: text("setup_1"),
  setup2: text("setup_2"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  telegramMessageId: text("telegram_message_id"),
  telegramMessage: text("telegram_message"),
  telegramMessageVariant: text("telegram_message_variant"),
  scheduledFor: timestamp("scheduled_for"),
  source: text("source").notNull().default("manual"),
  algorithmVersion: text("algorithm_version"),
  generatedAt: timestamp("generated_at"),
  currentPrice: real("current_price"),
  levels: jsonb("levels").$type<PlanLevels | null>(),
  biasReasoning: text("bias_reasoning"),
  topLongTrade: text("top_long_trade"),
  topShortTrade: text("top_short_trade"),
  promptVersion: text("prompt_version"),
  editedFields: jsonb("edited_fields").$type<string[] | null>(),
  claudeApiCallId: integer("claude_api_call_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Authoritative uniqueness for the (date, symbol) pair. The 409 collision
  // path in /api/admin/save-parsed-plan does an app-level check first; this
  // index guarantees that a racing concurrent insert cannot silently corrupt
  // the row — the second writer will hit a constraint violation instead.
  dateSymbolUniq: uniqueIndex("plans_date_symbol_uniq").on(table.date, table.symbol),
}));

export const claudeApiCalls = pgTable("claude_api_calls", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  model: text("model").notNull(),
  requestType: text("request_type").notNull(),
  promptVersion: text("prompt_version"),
  inputTokens: integer("input_tokens").notNull().default(0),
  cacheCreationInputTokens: integer("cache_creation_input_tokens").notNull().default(0),
  cacheReadInputTokens: integer("cache_read_input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  estimatedCostUsd: numeric("estimated_cost_usd", { precision: 10, scale: 6 }).notNull().default("0"),
  success: boolean("success").notNull().default(false),
  errorMessage: text("error_message"),
  newsletterText: text("newsletter_text"),
  notes: text("notes"),
});

export const insertClaudeApiCallSchema = createInsertSchema(claudeApiCalls).omit({
  id: true,
  createdAt: true,
});
export type InsertClaudeApiCall = z.infer<typeof insertClaudeApiCallSchema>;
export type ClaudeApiCall = typeof claudeApiCalls.$inferSelect;

export const ingestLevelsSchema = z.object({
  symbol: z.enum(["ES", "NQ", "GC", "CL", "RTY"]),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "target_date must be YYYY-MM-DD"),
  current_price: z.number().nullable().optional(),
  dynamic_zone_high: z.number().nullable().optional(),
  dynamic_zone_low: z.number().nullable().optional(),
  magnet: z.number().nullable().optional(),
  r1: z.number().nullable().optional(),
  r2: z.number().nullable().optional(),
  r3: z.number().nullable().optional(),
  r4: z.number().nullable().optional(),
  s1: z.number().nullable().optional(),
  s2: z.number().nullable().optional(),
  s3: z.number().nullable().optional(),
  s4: z.number().nullable().optional(),
  algorithm_version: z.string().min(1).max(64),
  contract: z.string().nullable().optional(),
  bias: z.string().nullable().optional(),
  bias_reasoning: z.string().nullable().optional(),
  top_long_trade: z.string().nullable().optional(),
  top_short_trade: z.string().nullable().optional(),
  // Full curated level set for the track record to score later.
  levels: planLevelsSchema.nullable().optional(),
});
export type IngestLevelsPayload = z.infer<typeof ingestLevelsSchema>;

// ===== Admin auth (Pass 8): durable credentials + sessions =====
//
// Dev preview and prod share the same Production database, so the seed below
// runs exactly once on whichever environment boots first. After that, the
// `ADMIN_PASSWORD` env var is ignored everywhere — the bcrypt hash in
// `admin_credentials` is the source of truth. You only need ADMIN_PASSWORD
// configured in Workspace Secrets (or a single seeding context) once.
export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

// ===== Member auth (Phase 2): passwordless email magic-link login =====
// One-time tokens emailed to active subscribers; exchanged for a member session.
export const memberLoginTokens = pgTable("member_login_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

export const memberSessions = pgTable("member_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export type MemberLoginToken = typeof memberLoginTokens.$inferSelect;
export type MemberSession = typeof memberSessions.$inferSelect;

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;

export const aiParsedPlanSchema = z.object({
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  symbol: z.string().min(1).max(8),
  dynamic_zone_high: z.number(),
  dynamic_zone_low: z.number(),
  magnet: z.number(),
  r1: z.number(), r2: z.number(), r3: z.number(), r4: z.number(),
  s1: z.number(), s2: z.number(), s3: z.number(), s4: z.number(),
  bias: z.enum(["bullish", "neutral", "bearish"]),
  bias_reasoning: z.string(),
  top_long_trade: z.string(),
  top_short_trade: z.string(),
});
export type AiParsedPlan = z.infer<typeof aiParsedPlanSchema>;

export const saveParsedPlanSchema = aiParsedPlanSchema.extend({
  edited_fields: z.array(z.string()).default([]),
  claude_api_call_id: z.number().int().positive(),
  prompt_version: z.string().min(1),
  send_telegram: z.boolean().default(false),
  force_overwrite: z.boolean().default(false),
});
export type SaveParsedPlanPayload = z.infer<typeof saveParsedPlanSchema>;

export const planResults = pgTable("plan_results", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plans.id),
  date: text("date").notNull(),
  symbol: text("symbol").notNull(),
  open: real("open"),
  high: real("high"),
  low: real("low"),
  close: real("close"),
  hitR1: integer("hit_r1"),
  hitR2: integer("hit_r2"),
  hitS1: integer("hit_s1"),
  hitS2: integer("hit_s2"),
  hitMagnet: integer("hit_magnet"),
  levelHits: jsonb("level_hits").$type<LevelHits | null>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanResultSchema = createInsertSchema(planResults).omit({
  id: true,
  createdAt: true,
}).extend({
  levelHits: levelHitsSchema.nullish(),
});
export type InsertPlanResult = z.infer<typeof insertPlanResultSchema>;
export type PlanResult = typeof planResults.$inferSelect;

export const publishLogs = pgTable("publish_logs", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plans.id),
  attemptTime: timestamp("attempt_time").defaultNow().notNull(),
  destination: text("destination").notNull(),
  variant: text("variant"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  responsePayload: text("response_payload"),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  telegramInviteLink: text("telegram_invite_link"),
  telegramJoinedAt: timestamp("telegram_joined_at"),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export const previews = pgTable("previews", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPreviewSchema = createInsertSchema(previews).omit({
  id: true,
  createdAt: true,
});

export type InsertPreview = z.infer<typeof insertPreviewSchema>;
export type Preview = typeof previews.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  editedFields: z.array(z.string()).nullish(),
  levels: planLevelsSchema.nullish(),
});

export const insertPublishLogSchema = createInsertSchema(publishLogs).omit({
  id: true,
  attemptTime: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export type InsertPublishLog = z.infer<typeof insertPublishLogSchema>;
export type PublishLog = typeof publishLogs.$inferSelect;

export type SiteSetting = typeof siteSettings.$inferSelect;

export interface SiteSettingsData {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
  footerText: string;
  footerEnabled: boolean;
  algorithmAutoSend: boolean;
}
