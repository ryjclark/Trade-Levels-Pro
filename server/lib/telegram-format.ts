import type { Plan } from "@shared/schema";
import { escapeMdV2, formatTelegramPro } from "../formatter";

export { escapeMdV2 };

// Manual-entry plans use the existing pro template (byte-identical to today).
export function formatManualPlan(plan: Plan): string {
  return formatTelegramPro(plan);
}

// Algorithm-sourced plans: "🤖 Algorithm vX.Y" prefix + the full plan template
// (bias reasoning + top long/short setups) when those fields are present, so
// members get an actionable plan, not just levels. Falls back to the bare pro
// template if the plan carries no reasoning/setups.
export function formatAlgorithmPlan(plan: Plan): string {
  const version = plan.algorithmVersion ? escapeMdV2(plan.algorithmVersion) : "unknown";
  const header = `🤖 Algorithm ${version}\n`;
  const hasPlan = plan.biasReasoning || plan.topLongTrade || plan.topShortTrade;
  if (!hasPlan) return header + formatTelegramPro(plan);

  const symbol = escapeMdV2(plan.symbol);
  const datePart = formatDateLine(plan.date);
  const biasLabel = escapeMdV2(plan.bias || "");
  const biasReason = escapeMdV2(plan.biasReasoning || "");
  const topLong = escapeMdV2(plan.topLongTrade || "");
  const topShort = escapeMdV2(plan.topShortTrade || "");

  const lines: string[] = [];
  lines.push(header + `📊 *${symbol} Trade Plan for ${datePart}*`);
  if (biasLabel || biasReason) {
    lines.push(`*Bias:* ${biasLabel}${biasReason ? " — " + biasReason : ""}`);
  }
  lines.push("");
  lines.push(`*Dynamic Zone:* ${tick(plan.dynamicZoneBottom)} – ${tick(plan.dynamicZoneTop)}`);
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
