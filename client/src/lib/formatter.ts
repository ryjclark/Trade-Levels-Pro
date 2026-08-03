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

function num2(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const n = Number(value);
  return Number.isNaN(n) ? '-' : n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function plainDateShort(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Matches the compact PLAIN-TEXT message the server actually sends to Telegram:
// leads with failed-breakdown longs (supports below the magnet) and rejection
// shorts (resistances above the magnet); no R1-R4/S1-S4 ladder, no markdown.
export function formatTelegramPro(plan: Plan): string {
  const magnet = plan.magnet ?? null;
  const supports = [plan.s1, plan.s2, plan.s3, plan.s4].filter((v): v is number => v != null);
  const resistances = [plan.r1, plan.r2, plan.r3, plan.r4].filter((v): v is number => v != null);
  const longs = magnet != null ? supports.filter((v) => v < magnet) : supports;
  const shorts = magnet != null ? resistances.filter((v) => v > magnet) : resistances;
  const medals = ['🥇', '🥈', '🥉'];

  const lines: string[] = [];
  lines.push(`🤖 ${plan.symbol} Trade Plan · ${plainDateShort(plan.date)}`);
  lines.push('');
  if (plan.bias) lines.push(`Bias: ${plan.bias}`);
  lines.push(`Magnet: ${num2(magnet)}`);
  lines.push(`Dynamic Zone: ${num2(plan.dynamicZoneBottom)} – ${num2(plan.dynamicZoneTop)}`);

  if (longs.length) {
    lines.push('');
    lines.push('🟢 Failed-breakdown longs (best first)');
    longs.slice(0, 3).forEach((v, i) =>
      lines.push(i === 0 ? `${medals[0]} ${num2(v)} → flush and reclaim, long toward the magnet` : `${medals[i]} ${num2(v)}`),
    );
  }
  if (shorts.length) {
    lines.push('');
    lines.push('🔴 Rejection shorts (secondary)');
    shorts.slice(0, 3).forEach((v, i) =>
      lines.push(i === 0 ? `${medals[0]} ${num2(v)} → reject and fail, short toward the magnet` : `${medals[i]} ${num2(v)}`),
    );
  }

  if (plan.notes) {
    lines.push('', `Notes: ${plan.notes}`);
  }
  lines.push('');
  lines.push('Rule: wait for acceptance, then manage level to level.');
  lines.push('Educational only. Not investment advice.');
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

function formatDateTelegram(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMiddayUpdate(plan: Plan): string {
  const datePart = formatDateTelegram(plan.date);
  const lines: string[] = [
    `\u{1F4CD} Midday Update \u2014 ${plan.symbol} \u2014 ${datePart}`
  ];

  if (plan.magnet != null) {
    lines.push('', `\u{1F3AF} Magnet: ${formatNumber(plan.magnet)}`);
  }

  if (plan.dynamicZoneBottom != null && plan.dynamicZoneTop != null) {
    lines.push(`\u{1F4C8} Dynamic Zone: ${formatNumber(plan.dynamicZoneBottom)}\u2013${formatNumber(plan.dynamicZoneTop)}`);
  }

  if (plan.bias) {
    lines.push(`\u{1F9ED} Bias: ${plan.bias}`);
  }

  if (plan.notes) {
    lines.push(`\u{1F4DD} Notes: ${plan.notes}`);
  }

  lines.push('', 'Full plan after close.');
  return lines.join('\n');
}

export function formatXPost(plan: Plan, ctaUrl?: string): string {
  const datePart = formatDateTelegram(plan.date);
  const url = ctaUrl || 'https://tradelevelspro.com';
  const lines: string[] = [
    `${plan.symbol} Daily Plan \u2014 ${datePart}`
  ];

  if (plan.magnet != null) {
    lines.push(`Magnet: ${formatNumber(plan.magnet)}`);
  }

  if (plan.dynamicZoneBottom != null && plan.dynamicZoneTop != null) {
    lines.push(`DZ: ${formatNumber(plan.dynamicZoneBottom)}\u2013${formatNumber(plan.dynamicZoneTop)}`);
  }

  if (plan.bias) {
    lines.push(`Bias: ${plan.bias}`);
  }

  lines.push(`Full plan: ${url}`);
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
