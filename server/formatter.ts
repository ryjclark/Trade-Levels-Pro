import type { Plan } from "@shared/schema";

const MDV2_RESERVED = /[_*\[\]()~`>#+\-=|{}.!\\]/g;

export function escapeMdV2(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(MDV2_RESERVED, (m) => `\\${m}`);
}

function fmtNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return num.toString();
}

function tick(value: number | null | undefined): string {
  const s = fmtNum(value);
  return s ? "`" + s + "`" : "`-`";
}

function formatDateTitle(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTelegram(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTitle(plan: Plan): string {
  const datePart = formatDateTitle(plan.date);
  const contract = plan.contract ? ` (${plan.contract})` : "";
  return `${plan.symbol} Daily Trade Plan \u2014 ${datePart}${contract}`;
}

export function formatTelegramPro(plan: Plan): string {
  const datePart = escapeMdV2(formatDateTelegram(plan.date));
  const symbol = escapeMdV2(plan.symbol);
  const contract = plan.contract ? ` \\(${escapeMdV2(plan.contract)}\\)` : "";

  const lines: string[] = [];
  lines.push(`*${symbol} Daily Trade Plan \u2014 ${datePart}${contract}*`);
  lines.push("");
  lines.push(`*Bias:* ${escapeMdV2(plan.bias || "")}`);
  lines.push("");
  lines.push(
    `*Dynamic Zone:* ${tick(plan.dynamicZoneBottom)} \u2013 ${tick(plan.dynamicZoneTop)}`
  );
  lines.push(`*Magnet:* ${tick(plan.magnet)}`);
  lines.push("");
  lines.push("*Resistance:*");
  lines.push(
    `R1 ${tick(plan.r1)} \u2502 R2 ${tick(plan.r2)} \u2502 R3 ${tick(plan.r3)} \u2502 R4 ${tick(plan.r4)}`
  );
  lines.push("");
  lines.push("*Support:*");
  lines.push(
    `S1 ${tick(plan.s1)} \u2502 S2 ${tick(plan.s2)} \u2502 S3 ${tick(plan.s3)} \u2502 S4 ${tick(plan.s4)}`
  );

  if (plan.setup1 || plan.setup2) {
    lines.push("");
    lines.push("*Setups:*");
    if (plan.setup1) lines.push(`\u2022 ${escapeMdV2(plan.setup1)}`);
    if (plan.setup2) lines.push(`\u2022 ${escapeMdV2(plan.setup2)}`);
  }

  if (plan.notes) {
    lines.push("");
    lines.push(`*Notes:* ${escapeMdV2(plan.notes)}`);
  }

  lines.push("");
  lines.push("\\—");
  lines.push(
    "_Educational content only\\. Not investment advice\\. Trade Smarter\\. React to Price\\. No Predictions\\._"
  );
  return lines.join("\n");
}

export function formatTelegramFree(plan: Plan): string {
  return formatTelegramPro(plan);
}

export function formatSubstackPro(plan: Plan): string {
  const title = formatTitle(plan);
  const lines = [
    `# ${title}`,
    "",
    `**Bias:** ${plan.bias || ""}`,
    `**Dynamic Zone:** ${fmtNum(plan.dynamicZoneBottom)} \u2013 ${fmtNum(plan.dynamicZoneTop)}`,
    `**Magnet:** ${fmtNum(plan.magnet)}`,
    `**Resistance:** R1 ${fmtNum(plan.r1)} | R2 ${fmtNum(plan.r2)} | R3 ${fmtNum(plan.r3)} | R4 ${fmtNum(plan.r4)}`,
    `**Support:** S1 ${fmtNum(plan.s1)} | S2 ${fmtNum(plan.s2)} | S3 ${fmtNum(plan.s3)} | S4 ${fmtNum(plan.s4)}`,
    "",
    "**Setups:**",
    `- ${plan.setup1 || ""}`,
  ];
  if (plan.setup2) lines.push(`- ${plan.setup2}`);
  if (plan.notes) lines.push("", `**Notes:** ${plan.notes}`);
  lines.push("", "Trade Smarter. React to Price. No Predictions.");
  return lines.join("\n");
}

export function formatSubstackFree(plan: Plan): string {
  return formatSubstackPro(plan);
}

export function formatTelegram(plan: Plan): string {
  return formatTelegramPro(plan);
}

export function formatAll(plan: Plan) {
  return {
    title: formatTitle(plan),
    telegramPro: formatTelegramPro(plan),
    telegramFree: formatTelegramFree(plan),
    substackPro: formatSubstackPro(plan),
    substackFree: formatSubstackFree(plan),
  };
}
