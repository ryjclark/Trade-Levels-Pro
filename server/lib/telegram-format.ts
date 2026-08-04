import type { Plan, PlanLevels, SwingPointData } from "@shared/schema";
import { escapeMdV2, formatTelegramPro } from "../formatter";
import { pickSetupLevels, isRoundRef, roundStepFor, pickMomentumTargets } from "./levels-algorithm";

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

// Algorithm-sourced plans: a compact, PLAIN-TEXT message (sent with no parse mode
// so it can never render broken) that LEADS with the failed-breakdown setups from
// the ranked level data and drops the R1-R4/S1-S4 ladder. Longs target the magnet;
// shorts fade the first resistance back to the magnet, so no level is shown as both
// a long target and a short at once. Falls back to a minimal line for older plans.
export function formatAlgorithmPlan(plan: Plan): string {
  const lv = (plan as any).levels as PlanLevels | null;
  const magnet = plan.magnet ?? lv?.magnet ?? null;

  // Failed-breakdown longs = supports below the magnet, rejection shorts =
  // resistances above it. Prefer the ranked swing points; if a plan has none,
  // fall back to the S1-S4 / R1-R4 levels so we ALWAYS emit the clean compact
  // plan and never the old pivot dump.
  const step = roundStepFor((plan.symbol as "ES" | "NQ") ?? "ES");
  let longVals: number[] = [];
  let shortVals: number[] = [];
  if (lv?.swingSupportPoints && magnet != null) longVals = rankSide(lv.swingSupportPoints, magnet, "below", step).map((p) => p.price);
  if (lv?.swingResistancePoints && magnet != null) shortVals = rankSide(lv.swingResistancePoints, magnet, "above", step).map((p) => p.price);
  if (!longVals.length && magnet != null) {
    longVals = [plan.s1, plan.s2, plan.s3, plan.s4].filter((v): v is number => v != null && v < magnet).slice(0, 3);
  }
  if (!shortVals.length && magnet != null) {
    shortVals = [plan.r1, plan.r2, plan.r3, plan.r4].filter((v): v is number => v != null && v > magnet).slice(0, 3);
  }

  if (magnet == null || (longVals.length === 0 && shortVals.length === 0)) {
    return `🤖 ${plan.symbol} Trade Plan · ${plainDate(plan.date)}\nLevels on the terminal: tradelevelspro.com/terminal`;
  }

  const medals = ["🥇", "🥈", "🥉"];
  const L: string[] = [];
  L.push(`🤖 ${plan.symbol} Trade Plan · ${plainDate(plan.date)}`);
  L.push("");
  if (plan.bias) L.push(`Bias: ${plan.bias}`);
  L.push(`Magnet: ${num(magnet)}`);
  L.push(`Dynamic Zone: ${num(lv?.dynamicZoneBottom ?? plan.dynamicZoneBottom)} – ${num(lv?.dynamicZoneTop ?? plan.dynamicZoneTop)}`);

  // Full level lists (nearest first, ★ = major) so the alert carries the same
  // picture as the terminal, including the deeper key levels and upside targets
  // that the ranked top-3 setups below leave out.
  if (lv && magnet != null) {
    const fmtRow = (pts: SwingPointData[] | undefined, side: "above" | "below") => {
      const filtered = (pts ?? []).filter((p) => (side === "above" ? p.price > magnet : p.price < magnet));
      filtered.sort((a, b) =>
        side === "above" ? a.price - magnet - (b.price - magnet) : magnet - a.price - (magnet - b.price),
      );
      return filtered
        .slice(0, 6)
        .map((p) => num(p.price) + (p.tier === "major" ? "★" : isRoundRef(p, step) ? "°" : ""))
        .join(", ");
    };
    const res = fmtRow(lv.swingResistancePoints, "above");
    const sup = fmtRow(lv.swingSupportPoints, "below");
    if (res || sup) {
      L.push("");
      if (res) L.push(`Resistances: ${res}`);
      if (sup) L.push(`Supports: ${sup}`);
      L.push("★ = major shelf · ° = round-number reference");
    }
  }

  // Momentum/breakout regime: patience plan — lead with the deep A+ failed-
  // breakdown, call shallow dips a chase, and mute shorts. Mirrors the on-site plan.
  // A+ = nearest DETECTED (prominence > 0) major below the magnet; fall back to a
  // structural major only if no detected one exists. Matches the on-site plan.
  const belowMajors = magnet != null
    ? (lv?.swingSupportPoints ?? []).filter((p) => p.price < magnet && p.tier === "major")
    : [];
  const nearestBelow = (arr: SwingPointData[]) =>
    [...arr].sort((a, b) => magnet! - a.price - (magnet! - b.price));
  const aPlus =
    nearestBelow(belowMajors.filter((p) => p.prominence > 0))[0] ??
    nearestBelow(belowMajors)[0] ??
    null;
  if (lv?.regime === "momentum" && aPlus) {
    const priceRef = (plan as any).currentPrice ?? magnet ?? 0;
    const targets = pickMomentumTargets(
      (lv?.swingResistancePoints ?? []).map((p) => p.price),
      priceRef,
      step * 0.8,
    ).map((v) => num(v));
    L.push("");
    L.push("⚠️ Momentum/breakout — be patient. Don't chase up here.");
    L.push("");
    L.push(`🟢 ⭐ Best long (A+): ${num(aPlus.price)}`);
    L.push("Wait for a flush that loses it and reclaims (enter on strength, don't knife-catch).");
    if (targets.length) L.push(`Targets: ${targets.join(", ")}`);
    L.push(`Shallow dips toward ${num(magnet)} are chases — no trade unless it flushes and recovers.`);
    L.push("");
    L.push("🔴 Rejection shorts (not the edge here — scalps only, if at all)");
    const shortLvls = (lv?.swingResistancePoints ?? [])
      .map((p) => p.price)
      .filter((v) => v > priceRef)
      .sort((a, b) => a - b)
      .slice(0, 3);
    if (shortLvls.length) shortLvls.forEach((v, i) => L.push(`${medals[i]} ${num(v)} → reject and fail, small scalp`));
    else L.push("Small level-to-level scalps only.");
  } else {
    if (longVals.length) {
      L.push("");
      L.push("🟢 Failed-breakdown longs (best first)");
      longVals.forEach((v, i) => {
        if (i === 0) L.push(`${medals[0]} ${num(v)} → flush and reclaim, long toward the magnet ${num(magnet)}`);
        else L.push(`${medals[i]} ${num(v)} ${i === 1 ? "(backup)" : "(deeper)"}`);
      });
    }
    if (shortVals.length) {
      L.push("");
      L.push("🔴 Rejection shorts (secondary)");
      shortVals.forEach((v, i) => {
        if (i === 0) L.push(`${medals[0]} ${num(v)} → reject and fail, short toward the magnet`);
        else L.push(`${medals[i]} ${num(v)}`);
      });
    }
  }

  L.push("");
  L.push("Rule: wait for acceptance, then manage level to level.");
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
