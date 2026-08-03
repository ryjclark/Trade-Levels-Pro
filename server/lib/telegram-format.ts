import type { Plan, PlanLevels, SwingPointData } from "@shared/schema";
import { escapeMdV2, formatTelegramPro } from "../formatter";

export { escapeMdV2 };

// Manual-entry plans use the existing pro template (byte-identical to today).
export function formatManualPlan(plan: Plan): string {
  return formatTelegramPro(plan);
}

const TIER_RANK: Record<string, number> = { major: 0, minor: 1, micro: 2 };

/** Rank swing points on one side by quality then proximity to the magnet,
 *  dropping micro shelves unless they are all that's available. */
function rankSide(points: SwingPointData[], magnet: number, side: "below" | "above"): SwingPointData[] {
  const filtered = points.filter((p) => (side === "below" ? p.price < magnet : p.price > magnet));
  filtered.sort(
    (a, b) =>
      TIER_RANK[a.tier] - TIER_RANK[b.tier] ||
      (side === "below" ? magnet - a.price - (magnet - b.price) : a.price - magnet - (b.price - magnet)),
  );
  const strong = filtered.filter((p) => p.tier !== "micro");
  return (strong.length ? strong : filtered).slice(0, 3);
}

// Algorithm-sourced plans: a compact, mobile-friendly message that LEADS with the
// failed-breakdown setups (the real plan) built from the ranked level data, and
// drops the R1-R4/S1-S4 pivot ladder. Falls back to the pro template for older
// plans that carry no ranked level points.
export function formatAlgorithmPlan(plan: Plan): string {
  const version = plan.algorithmVersion ? escapeMdV2(plan.algorithmVersion) : "unknown";
  const lv = (plan as any).levels as PlanLevels | null;
  const magnet = plan.magnet ?? lv?.magnet ?? null;
  const longPts = lv?.swingSupportPoints && magnet != null ? rankSide(lv.swingSupportPoints, magnet, "below") : [];
  const shortPts = lv?.swingResistancePoints && magnet != null ? rankSide(lv.swingResistancePoints, magnet, "above") : [];

  // Older plans without ranked points: keep the previous behaviour.
  if (magnet == null || (longPts.length === 0 && shortPts.length === 0)) {
    return `🤖 Algorithm ${version}\n` + formatTelegramPro(plan);
  }

  const e = escapeMdV2;
  const symbol = e(plan.symbol);
  const datePart = formatDateLine(plan.date);
  const arrow = "→"; // → (not reserved)
  const target = shortPts[0] ? shortPts[0].price : magnet; // nearest resistance = first upside target

  const lines: string[] = [];
  lines.push(`🤖 *${symbol} Trade Plan ${e("·")} ${datePart}*`);
  if (plan.bias) lines.push(`*Bias:* ${e(plan.bias)}`);
  lines.push("");
  lines.push(`*Magnet:* ${tick(magnet)}`);
  lines.push(`*Dynamic Zone:* ${tick(lv?.dynamicZoneBottom ?? plan.dynamicZoneBottom)} – ${tick(lv?.dynamicZoneTop ?? plan.dynamicZoneTop)}`);

  const medals = ["🥇", "🥈", "🥉"];
  if (longPts.length) {
    lines.push("");
    lines.push(`🟢 *${e("Failed-breakdown longs (best first)")}*`);
    longPts.forEach((p, i) => {
      if (i === 0) {
        lines.push(`${medals[0]} ${tick(p.price)} ${arrow} long toward ${tick(magnet)}, then ${tick(target)}`);
      } else {
        lines.push(`${medals[i]} ${tick(p.price)} ${e(i === 1 ? "backup" : "deeper")}`);
      }
    });
  }
  if (shortPts.length) {
    lines.push("");
    lines.push(`🔴 *${e("Rejection shorts (secondary)")}*`);
    shortPts.forEach((p, i) => {
      if (i === 0) {
        lines.push(`${medals[0]} ${tick(p.price)} ${arrow} short toward the magnet`);
      } else {
        lines.push(`${medals[i]} ${tick(p.price)} ${e("next level up")}`);
      }
    });
  }

  lines.push("");
  lines.push(e("Rule: wait for acceptance, then manage level to level."));
  lines.push(`_${e("Educational only. Not investment advice.")}_`);
  return lines.join("\n");
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
