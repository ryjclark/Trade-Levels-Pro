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

export function formatTitle(plan: Plan): string {
  const datePart = formatDateTitle(plan.date);
  const contract = plan.contract ? ` (${plan.contract})` : '';
  return `${plan.symbol} Daily Trade Plan — ${datePart}${contract}`;
}

export function formatTelegramPro(plan: Plan): string {
  const title = formatTitle(plan);
  const lines = [
    title,
    '',
    `Magnet: ${formatNumber(plan.magnet)}`,
    `Dynamic Zone: ${formatNumber(plan.dynamicZoneBottom)} – ${formatNumber(plan.dynamicZoneTop)}`,
    `Resistance: R1 ${formatNumber(plan.r1)} | R2 ${formatNumber(plan.r2)} | R3 ${formatNumber(plan.r3)} | R4 ${formatNumber(plan.r4)}`,
    `Support: S1 ${formatNumber(plan.s1)} | S2 ${formatNumber(plan.s2)} | S3 ${formatNumber(plan.s3)} | S4 ${formatNumber(plan.s4)}`,
    `Bias: ${plan.bias || ''}`,
    'Best Setups:',
    `- ${plan.setup1 || ''}`,
    `- ${plan.setup2 || ''}`
  ];

  if (plan.notes) {
    lines.push('', `Notes: ${plan.notes}`);
  }

  lines.push('', 'Trade Smarter. React to Price. No Predictions.');
  return lines.join('\n');
}

export function formatTelegramFree(plan: Plan): string {
  const title = formatTitle(plan);
  const lines = [
    title,
    '',
    `Magnet: ${formatNumber(plan.magnet)}`,
    `Dynamic Zone: ${formatNumber(plan.dynamicZoneBottom)} – ${formatNumber(plan.dynamicZoneTop)}`,
    `Resistance: R1 ${formatNumber(plan.r1)} | R2 ${formatNumber(plan.r2)}`,
    `Support: S1 ${formatNumber(plan.s1)} | S2 ${formatNumber(plan.s2)}`,
    `Bias: ${plan.bias || ''}`
  ];

  lines.push('', 'Trade Smarter. React to Price. No Predictions.');
  return lines.join('\n');
}

export function formatSubstackPro(plan: Plan): string {
  const title = formatTitle(plan);
  const lines = [
    `# ${title}`,
    '',
    `**Magnet:** ${formatNumber(plan.magnet)}`,
    `**Dynamic Zone:** ${formatNumber(plan.dynamicZoneBottom)} – ${formatNumber(plan.dynamicZoneTop)}`,
    `**Resistance:** R1 ${formatNumber(plan.r1)} | R2 ${formatNumber(plan.r2)} | R3 ${formatNumber(plan.r3)} | R4 ${formatNumber(plan.r4)}`,
    `**Support:** S1 ${formatNumber(plan.s1)} | S2 ${formatNumber(plan.s2)} | S3 ${formatNumber(plan.s3)} | S4 ${formatNumber(plan.s4)}`,
    `**Bias:** ${plan.bias || ''}`,
    '',
    '**Best Setups:**',
    `- ${plan.setup1 || ''}`,
    `- ${plan.setup2 || ''}`
  ];

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
    `**Magnet:** ${formatNumber(plan.magnet)}`,
    `**Dynamic Zone:** ${formatNumber(plan.dynamicZoneBottom)} – ${formatNumber(plan.dynamicZoneTop)}`,
    `**Resistance:** R1 ${formatNumber(plan.r1)} | R2 ${formatNumber(plan.r2)}`,
    `**Support:** S1 ${formatNumber(plan.s1)} | S2 ${formatNumber(plan.s2)}`,
    `**Bias:** ${plan.bias || ''}`,
    '',
    'Trade Smarter. React to Price. No Predictions.'
  ];

  return lines.join('\n');
}

export function formatTelegram(plan: Plan): string {
  return formatTelegramPro(plan);
}

export function formatSubstack(plan: Plan): string {
  return formatSubstackPro(plan);
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
