import { storage } from "../storage";
import type { Plan, PlanResult, PlanLevels, LevelHits } from "@shared/schema";
import { escapeMdV2 } from "../formatter";

// The Daily Brief is the automated "voice" layer: a plain-English recap of how
// the prior session's plan resolved (proof), plus today's setup at a glance
// (teaser). It is assembled entirely from data the app already produces (the
// plan generator + the daily results job), so it costs no ongoing effort.

export interface BriefRecap {
  symbol: string;
  date: string;
  magnetHit: boolean;
  supportsTagged: number;
  supportsTotal: number;
  flushed: number;
  reclaimed: number;
  resistancesTagged: number;
  resistancesTotal: number;
  close: number | null;
  line: string;
}

export interface BriefToday {
  symbol: string;
  date: string;
  bias: string | null;
  magnet: number | null;
  dzTop: number | null;
  dzBottom: number | null;
  keyLevel: number | null;
  headline: string;
}

export interface DailyBrief {
  generatedForDate: string | null;
  today: BriefToday[];
  recap: BriefRecap[];
  note: string;
}

const SYMBOLS = ["ES", "NQ"] as const;
const fmt = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Best failed-breakdown long level = highest-quality swing support below the magnet. */
function keyLevelFromPlan(plan: Plan): number | null {
  const lv = (plan as any).levels as PlanLevels | null;
  const magnet = plan.magnet ?? null;
  if (lv && magnet != null) {
    const pts = (lv.swingSupportPoints ?? []).filter((p) => p.price < magnet);
    const major = pts.find((p) => p.tier === "major") ?? pts[0];
    if (major) return major.price;
    const bareBelow = (lv.swingSupports ?? []).filter((v) => v < magnet);
    if (bareBelow.length) return Math.max(...bareBelow);
  }
  return plan.s1 ?? null;
}

export async function buildDailyBrief(): Promise<DailyBrief> {
  const plans = await storage.listPublicPlans(50);
  let results: PlanResult[] = [];
  try {
    results = await storage.listAllPlanResults(50);
  } catch {
    results = [];
  }

  // Today: the latest published plan per symbol.
  const today: BriefToday[] = [];
  let generatedForDate: string | null = null;
  for (const sym of SYMBOLS) {
    const plan = plans.find((p) => p.symbol === sym);
    if (!plan) continue;
    if (!generatedForDate) generatedForDate = plan.date;
    const keyLevel = keyLevelFromPlan(plan);
    const bias = plan.bias || null;
    const magnet = plan.magnet ?? null;
    const headline =
      magnet != null
        ? `Hold ${fmt(magnet)} for the bullish case. The A+ setup is a failed-breakdown long at ${fmt(keyLevel)}: wait for the flush and reclaim, then manage level to level.`
        : `See the terminal for today's levels.`;
    today.push({
      symbol: sym,
      date: plan.date,
      bias,
      magnet,
      dzTop: plan.dynamicZoneTop ?? null,
      dzBottom: plan.dynamicZoneBottom ?? null,
      keyLevel,
      headline,
    });
  }

  // Recap: the most recent scored session per symbol.
  const recap: BriefRecap[] = [];
  for (const sym of SYMBOLS) {
    const r = results
      .filter((x) => x.symbol === sym)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!r) continue;
    const lh = (r as any).levelHits as LevelHits | null;
    const supportsTagged = lh?.supports.tagged ?? 0;
    const supportsTotal = lh?.supports.total ?? 0;
    const flushed = lh?.supports.flushed ?? 0;
    const reclaimed = lh?.supports.reclaimed ?? 0;
    const resistancesTagged = lh?.resistances.tagged ?? 0;
    const resistancesTotal = lh?.resistances.total ?? 0;
    const magnetHit = !!r.hitMagnet;
    const fbLine =
      flushed > 0
        ? `${reclaimed} of ${flushed} flushes below support reclaimed (the failed-breakdown trade)`
        : `no support flushed and reclaimed`;
    const line =
      `${sym}: the magnet ${magnetHit ? "was tagged" : "was not tagged"}, ` +
      `${supportsTagged}/${supportsTotal} supports held, ${resistancesTagged}/${resistancesTotal} resistances tagged, ` +
      `${fbLine}. Close ${fmt(r.close)}.`;
    recap.push({
      symbol: sym,
      date: r.date,
      magnetHit,
      supportsTagged,
      supportsTotal,
      flushed,
      reclaimed,
      resistancesTagged,
      resistancesTotal,
      close: r.close ?? null,
      line,
    });
  }

  const note =
    "Reactive plan. Wait for acceptance, then manage level to level. Educational only, not financial advice.";
  return { generatedForDate, today, recap, note };
}

/**
 * Short, recap-focused Telegram post (the "newsletter voice"): how yesterday's
 * plan played out. Returns null when there's nothing scored yet, so we never
 * post an empty brief. Deliberately does NOT repeat today's setup (the plan
 * message already covers that).
 */
export function formatBriefTelegram(brief: DailyBrief): string | null {
  if (!brief.recap.length) return null;
  const e = escapeMdV2;
  const lines: string[] = [];
  lines.push(`📋 *${e("Daily Brief: how yesterday's plan played out")}*`);
  lines.push("");
  for (const r of brief.recap) {
    lines.push(`*${e(r.symbol)}:* ${e(r.line.replace(new RegExp("^" + r.symbol + ":\\s*"), ""))}`);
  }
  lines.push("");
  lines.push(e("Track record: tradelevelspro.com/track-record"));
  lines.push(`_${e("Educational only. Not investment advice.")}_`);
  return lines.join("\n");
}
