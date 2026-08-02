import { eq, and, desc, lte, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { plans, publishLogs, siteSettings, previews, members, planResults, claudeApiCalls, type Plan, type InsertPlan, type PublishLog, type InsertPublishLog, type SiteSettingsData, type Preview, type InsertPreview, type Member, type InsertMember, type PlanResult, type InsertPlanResult, type ClaudeApiCall, type InsertClaudeApiCall } from "@shared/schema";
import { PUBLIC_PLAN_SOURCES } from "@shared/constants";

export interface IStorage {
  getPlanById(id: number): Promise<Plan | undefined>;
  getPlanByDateSymbol(date: string, symbol: string): Promise<Plan | undefined>;
  listPlans(limit?: number): Promise<Plan[]>;
  upsertPlan(data: InsertPlan & { id?: number }): Promise<Plan>;
  insertPublishLog(log: InsertPublishLog): Promise<void>;
  listPublishLogs(planId: number): Promise<PublishLog[]>;
  getSettings(): Promise<SiteSettingsData>;
  updateSettings(data: Partial<SiteSettingsData>): Promise<SiteSettingsData>;
  insertPreview(data: InsertPreview): Promise<Preview>;
  getPreviousPlan(beforeDate: string, symbol: string): Promise<Plan | undefined>;
  getLatestPublishedPlan(): Promise<Plan | undefined>;
  upsertMember(data: InsertMember): Promise<Member>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  markMemberInactiveBySubscription(subscriptionId: string): Promise<void>;
  listDueScheduledPlans(now: Date): Promise<Plan[]>;
  claimScheduledPlan(id: number): Promise<Plan | undefined>;
  listPublicPlans(limit?: number): Promise<Plan[]>;
  getPublicPlan(id: number): Promise<Plan | undefined>;
  listAlgorithmPlans(limit?: number): Promise<Plan[]>;
  insertClaudeApiCall(data: InsertClaudeApiCall): Promise<ClaudeApiCall>;
  getClaudeApiCallById(id: number): Promise<ClaudeApiCall | undefined>;
  getClaudeUsageSince(since: Date): Promise<{ totalCalls: number; successCalls: number; totalCostUsd: number }>;
  insertPlanResult(data: InsertPlanResult): Promise<PlanResult>;
  listResultsForPlanIds(planIds: number[]): Promise<PlanResult[]>;
  listAllPlanResults(limit?: number): Promise<PlanResult[]>;
}

export class DatabaseStorage implements IStorage {
  async getPlanById(id: number): Promise<Plan | undefined> {
    const result = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);
    return result[0];
  }

  async getPlanByDateSymbol(date: string, symbol: string): Promise<Plan | undefined> {
    const result = await db
      .select()
      .from(plans)
      .where(and(eq(plans.date, date), eq(plans.symbol, symbol)))
      .limit(1);
    return result[0];
  }

  async listPlans(limit: number = 100): Promise<Plan[]> {
    return db
      .select()
      .from(plans)
      .orderBy(desc(plans.date), plans.symbol)
      .limit(limit);
  }

  async upsertPlan(data: InsertPlan & { id?: number }): Promise<Plan> {
    const existing = data.id
      ? await this.getPlanById(data.id)
      : await this.getPlanByDateSymbol(data.date, data.symbol);

    const now = new Date();

    if (existing) {
      await db
        .update(plans)
        .set({
          date: data.date,
          symbol: data.symbol,
          contract: data.contract,
          tier: data.tier,
          dynamicZoneTop: data.dynamicZoneTop,
          dynamicZoneBottom: data.dynamicZoneBottom,
          magnet: data.magnet,
          r1: data.r1,
          r2: data.r2,
          r3: data.r3,
          r4: data.r4,
          s1: data.s1,
          s2: data.s2,
          s3: data.s3,
          s4: data.s4,
          bias: data.bias,
          setup1: data.setup1,
          setup2: data.setup2,
          notes: data.notes,
          status: data.status || "draft",
          publishedAt: data.publishedAt,
          telegramMessageId: data.telegramMessageId,
          telegramMessage: data.telegramMessage,
          telegramMessageVariant: data.telegramMessageVariant,
          ...(data.source !== undefined ? { source: data.source } : {}),
          ...(data.algorithmVersion !== undefined ? { algorithmVersion: data.algorithmVersion } : {}),
          ...(data.generatedAt !== undefined ? { generatedAt: data.generatedAt } : {}),
          ...(data.currentPrice !== undefined ? { currentPrice: data.currentPrice } : {}),
          ...(data.biasReasoning !== undefined ? { biasReasoning: data.biasReasoning } : {}),
          ...(data.topLongTrade !== undefined ? { topLongTrade: data.topLongTrade } : {}),
          ...(data.topShortTrade !== undefined ? { topShortTrade: data.topShortTrade } : {}),
          ...(data.promptVersion !== undefined ? { promptVersion: data.promptVersion } : {}),
          ...(data.editedFields !== undefined ? { editedFields: data.editedFields } : {}),
          ...(data.claudeApiCallId !== undefined ? { claudeApiCallId: data.claudeApiCallId } : {}),
          updatedAt: now
        })
        .where(eq(plans.id, existing.id));

      const updated = await this.getPlanById(existing.id);
      return updated!;
    }

    const [newPlan] = await db
      .insert(plans)
      .values({
        ...data,
        status: data.status || "draft",
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return newPlan;
  }

  async insertPublishLog(log: InsertPublishLog): Promise<void> {
    await db.insert(publishLogs).values({
      ...log,
      attemptTime: new Date()
    });
  }

  async listPublishLogs(planId: number): Promise<PublishLog[]> {
    return db
      .select()
      .from(publishLogs)
      .where(eq(publishLogs.planId, planId))
      .orderBy(desc(publishLogs.attemptTime));
  }

  async updatePlan(id: number, data: Partial<InsertPlan>): Promise<Plan | undefined> {
    await db
      .update(plans)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(plans.id, id));
    return this.getPlanById(id);
  }

  async getSettings(): Promise<SiteSettingsData> {
    const rows = await db.select().from(siteSettings);
    const settings: SiteSettingsData = {
      joinUrl: "",
      substackUrl: "",
      xUrl: "",
      priceText: "",
      footerText: "",
      footerEnabled: false,
      algorithmAutoSend: true,
    };
    for (const row of rows) {
      if (row.key === "joinUrl") settings.joinUrl = row.value || "";
      if (row.key === "substackUrl") settings.substackUrl = row.value || "";
      if (row.key === "xUrl") settings.xUrl = row.value || "";
      if (row.key === "priceText") settings.priceText = row.value || "";
      if (row.key === "footerText") settings.footerText = row.value || "";
      if (row.key === "footerEnabled") settings.footerEnabled = row.value === "true";
      if (row.key === "algorithmAutoSend") settings.algorithmAutoSend = row.value !== "false";
    }
    return settings;
  }

  async insertPreview(data: InsertPreview): Promise<Preview> {
    const [row] = await db.insert(previews).values(data).returning();
    return row;
  }

  async getPreviousPlan(beforeDate: string, symbol: string): Promise<Plan | undefined> {
    const { lt } = await import("drizzle-orm");
    const result = await db
      .select()
      .from(plans)
      .where(and(eq(plans.symbol, symbol), lt(plans.date, beforeDate)))
      .orderBy(desc(plans.date))
      .limit(1);
    return result[0];
  }

  async getLatestPublishedPlan(): Promise<Plan | undefined> {
    const result = await db
      .select()
      .from(plans)
      .where(eq(plans.status, "published"))
      .orderBy(desc(plans.publishedAt))
      .limit(1);
    return result[0];
  }

  async upsertMember(data: InsertMember): Promise<Member> {
    const [row] = await db
      .insert(members)
      .values(data)
      .onConflictDoUpdate({
        target: members.email,
        set: {
          stripeCustomerId: data.stripeCustomerId ?? null,
          stripeSubscriptionId: data.stripeSubscriptionId ?? null,
          status: data.status ?? "active",
          telegramInviteLink: data.telegramInviteLink ?? null,
          telegramJoinedAt: data.telegramJoinedAt ?? null,
        },
      })
      .returning();
    return row;
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const result = await db
      .select()
      .from(members)
      .where(eq(members.email, email))
      .limit(1);
    return result[0];
  }

  async markMemberInactiveBySubscription(subscriptionId: string): Promise<void> {
    await db
      .update(members)
      .set({ status: "inactive" })
      .where(eq(members.stripeSubscriptionId, subscriptionId));
  }

  async listDueScheduledPlans(now: Date): Promise<Plan[]> {
    return db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.status, "scheduled"),
          isNotNull(plans.scheduledFor),
          lte(plans.scheduledFor, now),
        ),
      );
  }

  async claimScheduledPlan(id: number): Promise<Plan | undefined> {
    // Atomic claim: only succeeds for the worker that flips status first.
    const [row] = await db
      .update(plans)
      .set({ status: "publishing", updatedAt: new Date() })
      .where(and(eq(plans.id, id), eq(plans.status, "scheduled")))
      .returning();
    return row;
  }

  async listPublicPlans(limit: number = 30): Promise<Plan[]> {
    // Public visibility is gated by `PUBLIC_PLAN_SOURCES` in shared/constants.ts.
    // Edit only that constant to expose `ai_parsed` or `algorithm` rows publicly.
    const { inArray } = await import("drizzle-orm");
    return db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.status, "published"),
          inArray(plans.source, PUBLIC_PLAN_SOURCES as unknown as string[]),
        ),
      )
      .orderBy(desc(plans.date), plans.symbol)
      .limit(limit);
  }

  async getPublicPlan(id: number): Promise<Plan | undefined> {
    // Same gating as listPublicPlans: must be published AND source ∈ PUBLIC_PLAN_SOURCES.
    const { inArray } = await import("drizzle-orm");
    const result = await db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.id, id),
          eq(plans.status, "published"),
          inArray(plans.source, PUBLIC_PLAN_SOURCES as unknown as string[]),
        ),
      )
      .limit(1);
    return result[0];
  }

  async insertClaudeApiCall(data: InsertClaudeApiCall): Promise<ClaudeApiCall> {
    const [row] = await db.insert(claudeApiCalls).values(data).returning();
    return row;
  }

  async getClaudeApiCallById(id: number): Promise<ClaudeApiCall | undefined> {
    const result = await db.select().from(claudeApiCalls).where(eq(claudeApiCalls.id, id)).limit(1);
    return result[0];
  }

  async getClaudeUsageSince(since: Date): Promise<{ totalCalls: number; successCalls: number; totalCostUsd: number }> {
    const { gte } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(claudeApiCalls)
      .where(gte(claudeApiCalls.createdAt, since));
    let totalCostUsd = 0;
    let successCalls = 0;
    for (const r of rows) {
      totalCostUsd += Number(r.estimatedCostUsd || 0);
      if (r.success) successCalls += 1;
    }
    return { totalCalls: rows.length, successCalls, totalCostUsd };
  }

  async listAlgorithmPlans(limit: number = 20): Promise<Plan[]> {
    return db
      .select()
      .from(plans)
      .where(eq(plans.source, "algorithm"))
      .orderBy(desc(plans.date), plans.symbol)
      .limit(limit);
  }

  async insertPlanResult(data: InsertPlanResult): Promise<PlanResult> {
    const [row] = await db.insert(planResults).values(data).returning();
    return row;
  }

  async listResultsForPlanIds(planIds: number[]): Promise<PlanResult[]> {
    if (planIds.length === 0) return [];
    const { inArray } = await import("drizzle-orm");
    return db.select().from(planResults).where(inArray(planResults.planId, planIds));
  }

  async listAllPlanResults(limit: number = 1000): Promise<PlanResult[]> {
    return db
      .select()
      .from(planResults)
      .orderBy(desc(planResults.date), planResults.symbol)
      .limit(limit);
  }

  async updateSettings(data: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
    const now = new Date();
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      const stringValue = typeof value === "boolean" ? String(value) : (value || "");
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettings).set({ value: stringValue, updatedAt: now }).where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({ key, value: stringValue, updatedAt: now });
      }
    }
    return this.getSettings();
  }
}

export const storage = new DatabaseStorage();
