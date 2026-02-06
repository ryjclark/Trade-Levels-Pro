import type { Plan } from "@shared/schema";

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return num.toString();
}

function formatDateTitle(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDateTelegram(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTitle(plan: Plan): string {
  const datePart = formatDateTitle(plan.date);
  const contract = plan.contract ? ` (${plan.contract})` : '';
  return `${plan.symbol} Daily Trade Plan \u2014 ${datePart}${contract}`;
}

function formatTelegramHeader(plan: Plan): string {
  const datePart = formatDateTelegram(plan.date);
  const contract = plan.contract ? ` (${plan.contract})` : '';
  return `\u{1F4CA} ${plan.symbol} Daily Trade Plan \u2014 ${datePart}${contract}`;
}

export function formatTelegramPro(plan: Plan): string {
  const header = formatTelegramHeader(plan);
  const lines = [
    header,
    '',
    '\u{1F9ED} Bias',
    `${plan.bias || ''}`,
    '',
    '\u{1F4C8} Dynamic Zone',
    `${formatNumber(plan.dynamicZoneBottom)} \u2013 ${formatNumber(plan.dynamicZoneTop)}`,
    '',
    '\u{1F3AF} Magnet',
    `${formatNumber(plan.magnet)}`,
    '',
    '\u{1F7E5} Resistance',
    `R1: ${formatNumber(plan.r1)} | R2: ${formatNumber(plan.r2)} | R3: ${formatNumber(plan.r3)} | R4: ${formatNumber(plan.r4)}`,
    '',
    '\u{1F7E9} Support',
    `S1: ${formatNumber(plan.s1)} | S2: ${formatNumber(plan.s2)} | S3: ${formatNumber(plan.s3)} | S4: ${formatNumber(plan.s4)}`,
    '',
    '\u26A1 Best Setups',
    `\u2022 ${plan.setup1 || ''}`
  ];

  if (plan.setup2) {
    lines.push(`\u2022 ${plan.setup2}`);
  }

  if (plan.notes) {
    lines.push('', '\u{1F4DD} Notes', `${plan.notes}`);
  }

  lines.push('', '\u2014', 'Trade Smarter. React to Price. No Predictions.');
  return lines.join('\n');
}

export function formatTelegramFree(plan: Plan): string {
  return formatTelegramPro(plan);
}

export function formatSubstackPro(plan: Plan): string {
  const title = formatTitle(plan);
  const lines = [
    `# ${title}`,
    '',
    `**Bias:** ${plan.bias || ''}`,
    `**Dynamic Zone:** ${formatNumber(plan.dynamicZoneBottom)} \u2013 ${formatNumber(plan.dynamicZoneTop)}`,
    `**Magnet:** ${formatNumber(plan.magnet)}`,
    `**Resistance:** R1 ${formatNumber(plan.r1)} | R2 ${formatNumber(plan.r2)} | R3 ${formatNumber(plan.r3)} | R4 ${formatNumber(plan.r4)}`,
    `**Support:** S1 ${formatNumber(plan.s1)} | S2 ${formatNumber(plan.s2)} | S3 ${formatNumber(plan.s3)} | S4 ${formatNumber(plan.s4)}`,
    '',
    '**Best Setups:**',
    `- ${plan.setup1 || ''}`
  ];

  if (plan.setup2) {
    lines.push(`- ${plan.setup2}`);
  }

  if (plan.notes) {
    lines.push('', `**Notes:** ${plan.notes}`);
  }

  lines.push('', 'Trade Smarter. React to Price. No Predictions.');
  return lines.join('\n');
}

export function formatSubstackFree(plan: Plan): string {
  const title = formatTitle(plan);
  const lines = [
    `# ${title}`,
    '',
    `**Bias:** ${plan.bias || ''}`,
    `**Dynamic Zone:** ${formatNumber(plan.dynamicZoneBottom)} \u2013 ${formatNumber(plan.dynamicZoneTop)}`,
    `**Magnet:** ${formatNumber(plan.magnet)}`,
    `**Resistance:** R1 ${formatNumber(plan.r1)} | R2 ${formatNumber(plan.r2)}`,
    `**Support:** S1 ${formatNumber(plan.s1)} | S2 ${formatNumber(plan.s2)}`,
    '',
    'Trade Smarter. React to Price. No Predictions.'
  ];

  return lines.join('\n');
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
    substackFree: formatSubstackFree(plan)
  };
}
