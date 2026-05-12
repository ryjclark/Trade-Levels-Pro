import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanResultSchema = createInsertSchema(planResults).omit({
  id: true,
  createdAt: true,
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
}
