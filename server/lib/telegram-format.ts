import type { Plan, PlanLevels, SwingPointData } from "@shared/schema";
import { escapeMdV2, formatTelegramPro } from "../formatter";
import { pickSetupLevels, roundStepFor, pickMomentumTargets } from "./levels-algorithm";

export { escapeMdV2 };

// Manual-entry plans use the existing pro template (byte-identical to today).
export function formatManualPlan(plan: Plan): string {
  return formatTelegramPro(plan);
}

/** Rank the 3 setup levels for one side using the SAME logic as the on-site plan
 *  (nearest leads, prefer real shelves over round-number filler, guarantee the
 *  strongest major) so Telegram and the terminal never disagree. */
function rankSide(points: SwingPointData[], magnet: number, side: "below" | "above", step: number): SwingPointData[] {
  return pickSetupLevels(points as any, magnet, side, step) as SwingPointData[];
}

function num(v: number | null | undefined): string {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  return Number.isNaN(n) ? "-" : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function plainDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Capitalize the first letter (e.g. "bullish" -> "Bullish"). */
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Algorithm-sourced plans: a compact, PLAIN-TEXT message (sent with no parse mode
// so it can never render broken) that LEADS with the failed-breakdown setups from
// the ranked level data and drops the R1-R4/S1-S4 ladder. Longs target the magnet;
// shorts fade the first resistance back to the magnet, so no level is shown as both
// a long target and a short at once. Falls back to a minimal line for older plans.
// Lean plan for BOTH Telegram and email: the trader-critical essentials only —
// bias, magnet, dynamic zone, the single best long + best short, the rule, and a
// pointer to the site. The full ladder, bias reasoning, backups, POC/value area
// and the TradingView indicator all live on Today's Plan (tradelevelspro.com/terminal),
// which stays the complete source of truth. Kept deliberately short and scannable.
export function formatAlgorithmPlan(plan: Plan): string {
  const lv = (plan as any).levels as PlanLevels | null;
  const magnet = plan.magnet ?? lv?.magnet ?? null;

  // Failed-breakdown longs = supports below the magnet, rejection shorts =
  // resistances above it. Prefer the ranked swing points; if a plan has none,
  // fall back to the S1-S4 / R1-R4 levels so we ALWAYS have a best entry.
  const step = roundStepFor((plan.symbol as "ES" | "NQ") ?? "ES");
  let longPts: SwingPointData[] = [];
  let shortPts: SwingPointData[] = [];
  if (lv?.swingSupportPoints && magnet != null) longPts = rankSide(lv.swingSupportPoints, magnet, "below", step);
  if (lv?.swingResistancePoints && magnet != null) shortPts = rankSide(lv.swingResistancePoints, magnet, "above", step);
  let longVals: number[] = longPts.map((p) => p.price);
  let shortVals: number[] = shortPts.map((p) => p.price);
  if (!longVals.length && magnet != null) {
    longVals = [plan.s1, plan.s2, plan.s3, plan.s4].filter((v): v is number => v != null && v < magnet).slice(0, 3);
  }
  if (!shortVals.length && magnet != null) {
    shortVals = [plan.r1, plan.r2, plan.r3, plan.r4].filter((v): v is number => v != null && v > magnet).slice(0, 3);
  }

  const siteLine = "📊 Full plan + TradingView indicator → tradelevelspro.com/terminal";

  if (magnet == null || (longVals.length === 0 && shortVals.length === 0)) {
    return `🤖 ${plan.symbol} Trade Plan · ${plainDate(plan.date)}\n${siteLine}`;
  }

  const L: string[] = [];
  L.push(`🤖 ${plan.symbol} Trade Plan · ${plainDate(plan.date)}`);
  L.push("");
  if (plan.bias) L.push(`Bias: ${cap(plan.bias)}`);
  L.push(`Magnet: ${num(magnet)}`);
  L.push(`Dynamic Zone: ${num(lv?.dynamicZoneBottom ?? plan.dynamicZoneBottom)} – ${num(lv?.dynamicZoneTop ?? plan.dynamicZoneTop)}`);
  L.push("");

  if (lv?.regime === "momentum" && longPts.length) {
    // Momentum/breakout: patience, single A+ long, targets above the magnet.
    const priceRef = (plan as any).currentPrice ?? magnet;
    const target = pickMomentumTargets(
      (lv?.swingResistancePoints ?? []).map((p) => p.price),
      Math.max(priceRef, magnet),
      step * 0.8,
    )[0];
    L.push("⚠️ Momentum — be patient, don't chase.");
    L.push(`🟢 Long ${num(longPts[0].price)} → flush + reclaim${target != null ? `, target ${num(target)}` : ""}`);
    L.push("🔴 Shorts are scalps only up here.");
  } else {
    if (longVals.length) L.push(`🟢 Long ${num(longVals[0])} → flush + reclaim, target ${num(magnet)}`);
    if (shortVals.length) L.push(`🔴 Short ${num(shortVals[0])} → reject + fail, target ${num(magnet)}`);
  }

  L.push("");
  L.push("Wait for acceptance, then manage level to level.");
  L.push(siteLine);
  L.push("Educational only. Not investment advice.");
  return L.join("\n");
}

function tick(value: number | null | undefined): string {
  if (value === null || value === undefined) return "`-`";
  const n = Number(value);
  if (Number.isNaN(n)) return "`-`";
  return "`" + n.toString() + "`";
}

function formatDateLine(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return escapeMdV2(dateStr);
  const human = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return escapeMdV2(human);
}

// AI-parsed plans get their own template featuring bias reasoning + top long/short.
export function formatAiParsedPlan(plan: Plan): string {
  const symbol = escapeMdV2(plan.symbol);
  const datePart = formatDateLine(plan.date);
  const biasLabel = escapeMdV2(plan.bias || "");
  const biasReason = escapeMdV2(plan.biasReasoning || "");
  const topLong = escapeMdV2(plan.topLongTrade || "");
  const topShort = escapeMdV2(plan.topShortTrade || "");

  const lines: string[] = [];
  lines.push(`📊 *${symbol} Trade Plan for ${datePart}*`);
  if (biasLabel || biasReason) {
    lines.push(`*Bias:* ${biasLabel}${biasReason ? " — " + biasReason : ""}`);
  }
  lines.push("");
  lines.push(`*Dynamic Zone:* ${tick(plan.dynamicZoneBottom)} \u2013 ${tick(plan.dynamicZoneTop)}`);
  lines.push(`*Magnet:* ${tick(plan.magnet)}`);
  lines.push("");
  lines.push("*Resistance:*");
  lines.push(`R1: ${tick(plan.r1)}`);
  lines.push(`R2: ${tick(plan.r2)}`);
  lines.push(`R3: ${tick(plan.r3)}`);
  lines.push(`R4: ${tick(plan.r4)}`);
  lines.push("");
  lines.push("*Support:*");
  lines.push(`S1: ${tick(plan.s1)}`);
  lines.push(`S2: ${tick(plan.s2)}`);
  lines.push(`S3: ${tick(plan.s3)}`);
  lines.push(`S4: ${tick(plan.s4)}`);
  if (topLong) {
    lines.push("");
    lines.push(`🟢 *Top Long:* ${topLong}`);
  }
  if (topShort) {
    lines.push(`🔴 *Top Short:* ${topShort}`);
  }
  lines.push("");
  lines.push("\\—");
  lines.push("_Educational content only\\. Not investment advice\\._");
  return lines.join("\n");
}

export function formatBySource(plan: Plan): string {
  switch (plan.source) {
    case "ai_parsed":
      return formatAiParsedPlan(plan);
    case "algorithm":
      return formatAlgorithmPlan(plan);
    default:
      return formatManualPlan(plan);
  }
}
