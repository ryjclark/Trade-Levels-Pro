import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { plans, publishLogs, type Plan, type InsertPlan, type PublishLog, type InsertPublishLog } from "@shared/schema";

export interface IStorage {
  getPlanById(id: number): Promise<Plan | undefined>;
  getPlanByDateSymbol(date: string, symbol: string): Promise<Plan | undefined>;
  listPlans(limit?: number): Promise<Plan[]>;
  upsertPlan(data: InsertPlan & { id?: number }): Promise<Plan>;
  insertPublishLog(log: InsertPublishLog): Promise<void>;
  listPublishLogs(planId: number): Promise<PublishLog[]>;
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
}

export const storage = new DatabaseStorage();
