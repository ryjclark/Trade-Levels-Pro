import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { plans, publishLogs, siteSettings, type Plan, type InsertPlan, type PublishLog, type InsertPublishLog, type SiteSettingsData } from "@shared/schema";

export interface IStorage {
  getPlanById(id: number): Promise<Plan | undefined>;
  getPlanByDateSymbol(date: string, symbol: string): Promise<Plan | undefined>;
  listPlans(limit?: number): Promise<Plan[]>;
  upsertPlan(data: InsertPlan & { id?: number }): Promise<Plan>;
  insertPublishLog(log: InsertPublishLog): Promise<void>;
  listPublishLogs(planId: number): Promise<PublishLog[]>;
  getSettings(): Promise<SiteSettingsData>;
  updateSettings(data: Partial<SiteSettingsData>): Promise<SiteSettingsData>;
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
    };
    for (const row of rows) {
      if (row.key === "joinUrl") settings.joinUrl = row.value || "";
      if (row.key === "substackUrl") settings.substackUrl = row.value || "";
      if (row.key === "xUrl") settings.xUrl = row.value || "";
      if (row.key === "priceText") settings.priceText = row.value || "";
      if (row.key === "footerText") settings.footerText = row.value || "";
      if (row.key === "footerEnabled") settings.footerEnabled = row.value === "true";
    }
    return settings;
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
