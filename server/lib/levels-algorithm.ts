/**
 * Self-generating levels algorithm. Fetches daily OHLC for ES/NQ, computes the
 * plan (Dynamic Zone, Magnet, R1-R4, S1-S4, bias) with transparent math, and
 * posts to POST /api/levels/ingest (which upserts source="algorithm" and
 * auto-sends to Telegram). No newsletter. Data source is pluggable.
 */
export const ALGORITHM_VERSION = "v1.1";

export interface Bar { date: string; open: number; high: number; low: number; close: number; }

export interface ComputedLevels {
  symbol: "ES" | "NQ";
  target_date: string;
  current_price: number;
  dynamic_zone_high: number;
  dynamic_zone_low: number;
  magnet: number;
  r1: number; r2: number; r3: number; r4: number;
  s1: number; s2: number; s3: number; s4: number;
  bias: "bullish" | "neutral" | "bearish";
  bias_reasoning: string;
  top_long_trade: string;
  top_short_trade: string;
  algorithm_version: string;
  // Full curated level set, stored with the plan so the track record can score it.
  levels: {
    magnet: number | null;
    dynamicZoneTop: number | null;
    dynamicZoneBottom: number | null;
    priorHigh: number | null;
    priorLow: number | null;
    priorClose: number | null;
    overnightHigh: number | null;
    overnightLow: number | null;
    priorWeekHigh: number | null;
    priorWeekLow: number | null;
    recentHigh: number | null;
    recentLow: number | null;
    swingSupports: number[];
    swingResistances: number[];
    swingSupportPoints?: SwingPoint[];
    swingResistancePoints?: SwingPoint[];
  };
}

const YAHOO_SYMBOL: Record<"ES" | "NQ", string> = { ES: "ES=F", NQ: "NQ=F" };
const TICK: Record<"ES" | "NQ", number> = { ES: 0.25, NQ: 0.25 };
const roundToTick = (v: number, t: number) => Math.round(v / t) * t;

/** ~3 months of daily bars, oldest -> newest. */
export async function fetchDailyBars(symbol: "ES" | "NQ"): Promise<Bar[]> {
  const y = YAHOO_SYMBOL[symbol];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=3mo&interval=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Yahoo fetch failed for ${y}: ${res.status}`);
  const json: any = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`No chart result for ${y}`);
  const ts: number[] = r.timestamp || [];
  const q = r.indicators?.quote?.[0] || {};
  const bars: Bar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    bars.push({ date: new Date(ts[i] * 1000).toISOString().slice(0, 10), open: o, high: h, low: l, close: c });
  }
  if (bars.length < 6) throw new Error(`Not enough bars for ${y} (${bars.length})`);
  return bars;
}

export interface IntradayBar { time: number; open: number; high: number; low: number; close: number; }

/**
 * Intraday OHLC bars for the public terminal chart. `time` is a UNIX timestamp
 * in seconds (what TradingView Lightweight Charts expects), oldest -> newest.
 */
export async function fetchIntradayBars(
  symbol: "ES" | "NQ",
  range = "1mo",
  interval = "1h",
): Promise<IntradayBar[]> {
  const y = YAHOO_SYMBOL[symbol];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Yahoo intraday fetch failed for ${y}: ${res.status}`);
  const json: any = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`No chart result for ${y}`);
  const ts: number[] = r.timestamp || [];
  const q = r.indicators?.quote?.[0] || {};
  const bars: IntradayBar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    bars.push({ time: ts[i], open: o, high: h, low: l, close: c });
  }
  return bars;
}

/** Calendar date (ET) + minutes-since-midnight (ET) for a unix-seconds ts. */
function etHM(unixSec: number): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(unixSec * 1000));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "0";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const minutes = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
  return { date, minutes };
}

const RTH_OPEN = 9 * 60 + 30;      // 09:30 ET
const RTH_LAST_BAR = 15 * 60 + 30; // last 30m bar starts 15:30, covers to 16:00 close

/**
 * Prior regular-session (RTH, 09:30–16:00 ET) daily bars, built by aggregating
 * 30-minute intraday bars. Using the cash session instead of Yahoo's full ~23h
 * Globex daily bar keeps the range (and therefore the pivots) tighter and closer
 * to what ES/NQ traders actually use. Only complete sessions are returned.
 */
export async function fetchRthDailyBars(symbol: "ES" | "NQ"): Promise<Bar[]> {
  const intraday = await fetchIntradayBars(symbol, "60d", "30m");
  const byDay = new Map<
    string,
    { o: number; h: number; l: number; c: number; openMin: number; closeMin: number; complete: boolean }
  >();
  for (const b of intraday) {
    const { date, minutes } = etHM(b.time);
    if (minutes < RTH_OPEN || minutes > RTH_LAST_BAR) continue;
    const cur = byDay.get(date);
    if (!cur) {
      byDay.set(date, {
        o: b.open, h: b.high, l: b.low, c: b.close,
        openMin: minutes, closeMin: minutes, complete: minutes === RTH_LAST_BAR,
      });
    } else {
      cur.h = Math.max(cur.h, b.high);
      cur.l = Math.min(cur.l, b.low);
      if (minutes < cur.openMin) { cur.openMin = minutes; cur.o = b.open; }
      if (minutes >= cur.closeMin) { cur.closeMin = minutes; cur.c = b.close; }
      if (minutes === RTH_LAST_BAR) cur.complete = true;
    }
  }
  const bars: Bar[] = [];
  for (const [date, v] of Array.from(byDay.entries())) {
    if (!v.complete) continue; // skip partial (e.g. in-progress) sessions
    bars.push({ date, open: v.o, high: v.h, low: v.l, close: v.c });
  }
  bars.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
  if (bars.length < 6) throw new Error(`Not enough RTH bars for ${symbol} (${bars.length})`);
  return bars;
}

export interface StructureLevels {
  priorHigh: number;
  priorLow: number;
  priorClose: number;
  overnightHigh: number | null;
  overnightLow: number | null;
  // Higher-timeframe (swing) layer:
  priorWeekHigh: number | null;
  priorWeekLow: number | null;
  recentHigh: number | null; // ~last month range high
  recentLow: number | null;  // ~last month range low
}

function prevCalendarDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Monday-aligned week index for a YYYY-MM-DD date (for prior-week grouping). */
function weekIndex(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00Z");
  const dow = d.getUTCDay(); // 0 Sun .. 6 Sat
  const toMonday = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + toMonday);
  return Math.floor(d.getTime() / (7 * 24 * 3600 * 1000));
}

/**
 * Real price-structure levels from 30-min intraday bars: prior RTH day
 * High/Low/Close, plus the overnight (evening ≥18:00 ET → next 09:30 ET) range
 * preceding that day's open. Needs 30-min bars so the 09:30/15:30 ET session
 * edges line up. Returns null if no complete RTH session is present.
 */
export function computeStructureLevels(bars: IntradayBar[], symbol: "ES" | "NQ"): StructureLevels | null {
  if (!bars.length) return null;
  const tick = TICK[symbol];
  const rt = (v: number) => roundToTick(v, tick);

  type Day = { high: number; low: number; close: number; hasClose: boolean };
  const days = new Map<string, Day>();
  for (const b of bars) {
    const { date, minutes } = etHM(b.time);
    if (minutes < RTH_OPEN || minutes > RTH_LAST_BAR) continue;
    const d = days.get(date);
    if (!d) {
      days.set(date, { high: b.high, low: b.low, close: b.close, hasClose: minutes === RTH_LAST_BAR });
    } else {
      d.high = Math.max(d.high, b.high);
      d.low = Math.min(d.low, b.low);
      if (minutes === RTH_LAST_BAR) { d.close = b.close; d.hasClose = true; }
    }
  }
  const completeDates = Array.from(days.keys()).filter((k) => days.get(k)!.hasClose).sort();
  if (!completeDates.length) return null;
  const D = completeDates[completeDates.length - 1];
  const day = days.get(D)!;
  const dPrev = prevCalendarDate(D);

  const complete = completeDates.map((dt) => ({ date: dt, ...days.get(dt)! }));
  // Recent (~1 month) range = highest high / lowest low of the last 20 RTH days.
  const recent = complete.slice(-20);
  const recentHigh = recent.length ? rt(Math.max(...recent.map((x) => x.high))) : null;
  const recentLow = recent.length ? rt(Math.min(...recent.map((x) => x.low))) : null;
  // Prior completed week's high/low.
  const priorWeek = weekIndex(D) - 1;
  const pw = complete.filter((x) => weekIndex(x.date) === priorWeek);
  const priorWeekHigh = pw.length ? rt(Math.max(...pw.map((x) => x.high))) : null;
  const priorWeekLow = pw.length ? rt(Math.min(...pw.map((x) => x.low))) : null;

  // Overnight into D's open: evening of the prior calendar day (≥18:00 ET) + early D (<09:30 ET).
  let onH = -Infinity, onL = Infinity;
  for (const b of bars) {
    const { date, minutes } = etHM(b.time);
    const inOvernight = (date === dPrev && minutes >= 18 * 60) || (date === D && minutes < RTH_OPEN);
    if (!inOvernight) continue;
    onH = Math.max(onH, b.high);
    onL = Math.min(onL, b.low);
  }

  return {
    priorHigh: rt(day.high),
    priorLow: rt(day.low),
    priorClose: rt(day.close),
    overnightHigh: onH === -Infinity ? null : rt(onH),
    overnightLow: onL === Infinity ? null : rt(onL),
    priorWeekHigh,
    priorWeekLow,
    recentHigh,
    recentLow,
  };
}

export type SwingTier = "major" | "minor" | "micro";

/** A ranked reaction level: price plus how hard price bounced (prominence) and a
 *  quality tier derived from that prominence. `major` = a significant low/high the
 *  failed-breakdown method actually leans on; `micro` = a weak shelf to de-emphasize. */
export interface SwingPoint {
  price: number;
  prominence: number;
  tier: SwingTier;
}

export interface SwingLevels {
  lows: number[];  // significant reaction lows, sorted high → low
  highs: number[]; // significant reaction highs, sorted high → low
  // Same levels as lows/highs (same order) but ranked with a quality tier so the
  // plan can lead with the strongest levels and flag micro ones.
  lowPoints: SwingPoint[];
  highPoints: SwingPoint[];
}

/**
 * Detect real swing (fractal) reaction points from intraday bars — the actual
 * spots where price flushed and reversed. A bar is a swing low if its low is the
 * lowest across ±window bars; swing high is the mirror. Each pivot is scored by
 * "prominence" (how far price travelled away from it — i.e. how hard it bounced),
 * then nearby pivots are clustered into shelves, keeping the strongest per shelf.
 * These are the "significant lows" a failed-breakdown method actually watches.
 */
export function detectSwings(
  bars: IntradayBar[],
  symbol: "ES" | "NQ",
  opts?: { window?: number; maxPerSide?: number },
): SwingLevels {
  const tick = TICK[symbol];
  const rt = (v: number) => roundToTick(v, tick);
  const k = opts?.window ?? 3;
  const maxPerSide = opts?.maxPerSide ?? 6;
  const n = bars.length;
  if (n < 2 * k + 1) return { lows: [], highs: [], lowPoints: [], highPoints: [] };

  type Piv = { price: number; prom: number };
  const rawLows: Piv[] = [];
  const rawHighs: Piv[] = [];
  for (let i = k; i < n - k; i++) {
    let isLow = true, isHigh = true;
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue;
      if (bars[j].low <= bars[i].low) isLow = false;
      if (bars[j].high >= bars[i].high) isHigh = false;
    }
    const fwd = Math.min(n - 1, i + 12);
    if (isLow) {
      let maxHi = bars[i].high;
      for (let j = i + 1; j <= fwd; j++) maxHi = Math.max(maxHi, bars[j].high);
      rawLows.push({ price: bars[i].low, prom: maxHi - bars[i].low });
    }
    if (isHigh) {
      let minLo = bars[i].low;
      for (let j = i + 1; j <= fwd; j++) minLo = Math.min(minLo, bars[j].low);
      rawHighs.push({ price: bars[i].high, prom: bars[i].high - minLo });
    }
  }

  const clusterTol = n ? bars[n - 1].close * 0.001 : tick * 4; // ~0.1% shelf tolerance
  // Cluster nearby pivots into shelves, keeping the strongest (highest-prominence)
  // per shelf. Preserve each kept level's prominence so we can rank it later.
  const cluster = (piv: Piv[]): { price: number; prom: number }[] => {
    const sorted = [...piv].sort((a, b) => b.prom - a.prom); // strongest first
    const kept: { price: number; prom: number }[] = [];
    for (const p of sorted) {
      if (kept.some((q) => Math.abs(q.price - p.price) < clusterTol)) continue;
      kept.push({ price: rt(p.price), prom: p.prom });
      if (kept.length >= maxPerSide) break;
    }
    return kept.sort((a, b) => b.price - a.price); // high → low
  };

  const keptLows = cluster(rawLows);
  const keptHighs = cluster(rawHighs);

  // Quality tier by prominence relative to the strongest level across BOTH sides,
  // so "major" means major overall (a support and a resistance are comparable).
  const maxProm = Math.max(
    0,
    ...keptLows.map((p) => p.prom),
    ...keptHighs.map((p) => p.prom),
  );
  const tierOf = (prom: number): SwingTier => {
    if (maxProm <= 0) return "micro";
    const ratio = prom / maxProm;
    if (ratio >= 0.5) return "major";
    if (ratio >= 0.25) return "minor";
    return "micro";
  };
  const toPoints = (kept: { price: number; prom: number }[]): SwingPoint[] =>
    kept.map((p) => ({ price: p.price, prominence: Math.round(p.prom * 100) / 100, tier: tierOf(p.prom) }));

  return {
    lows: keptLows.map((p) => p.price),
    highs: keptHighs.map((p) => p.price),
    lowPoints: toPoints(keptLows),
    highPoints: toPoints(keptHighs),
  };
}

/** Human number for plan text, e.g. 7496 or 28403.25. */
function fmtLevel(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/**
 * Reactive trading plan built around the Failed-Breakdown edge: wait for a flush
 * that loses a significant low and reclaims it (long), manage level-to-level and
 * leave runners. Shorts (rejection at resistance / breakdown of support) are
 * included but flagged lower-win-rate. Uses real structure levels when present,
 * falling back to pivots. "React to Price. No Predictions."
 */
function buildPlan(x: {
  bias: "bullish" | "neutral" | "bearish";
  magnet: number; dzHigh: number; dzLow: number;
  r1: number; s1: number; s2: number;
  structure: StructureLevels | null;
  swings: SwingLevels | null;
}): { reasoning: string; long: string; short: string } {
  const { bias, magnet, dzHigh, dzLow, r1, s1, s2, structure: s, swings } = x;

  // Rank failed-breakdown longs NEAREST-first (below the magnet), the way a
  // trader actually works down through supports, dropping only micro shelves so
  // the list stays actionable. Quality shows as a tag on each level.
  const tierWordLow: Record<SwingTier, string> = {
    major: "significant low",
    minor: "decent low",
    micro: "micro shelf — lower quality",
  };
  const tierWordHigh: Record<SwingTier, string> = {
    major: "significant high",
    minor: "decent high",
    micro: "micro shelf — lower quality",
  };
  let longPts: SwingPoint[] = [];
  if (swings) {
    const below = swings.lowPoints.filter((p) => p.price < magnet);
    below.sort((a, b) => (magnet - a.price) - (magnet - b.price)); // nearest below the magnet first
    const strong = below.filter((p) => p.tier !== "micro");
    longPts = (strong.length ? strong : below).slice(0, 3);
  }
  let lowVals: number[] = longPts.map((p) => p.price);
  if (!lowVals.length) {
    lowVals = [s?.priorLow, s?.overnightLow, s?.priorWeekLow, s1].filter(
      (v): v is number => v != null,
    );
  }
  if (!lowVals.length) lowVals = [s1];

  // Nearest resistances above the magnet — used as upside targets for longs.
  let targetHighs: number[] = swings
    ? swings.highs.filter((v) => v > magnet).sort((a, b) => a - b).slice(0, 2)
    : [];
  if (!targetHighs.length) {
    targetHighs = [s?.priorHigh, s?.priorWeekHigh, r1].filter((v): v is number => v != null);
  }
  if (!targetHighs.length) targetHighs = [r1];

  // Rejection shorts = resistances above the magnet, ranked by QUALITY then
  // proximity — mirrors the longs so the short side is a ranked ladder of the
  // major highs, not a single line. Drop micro unless they're all we have.
  let shortPts: SwingPoint[] = [];
  if (swings) {
    const above = swings.highPoints.filter((p) => p.price > magnet);
    above.sort((a, b) => (a.price - magnet) - (b.price - magnet)); // nearest above the magnet first
    const strong = above.filter((p) => p.tier !== "micro");
    shortPts = (strong.length ? strong : above).slice(0, 3);
  }
  const firstHighVal = shortPts[0] ? shortPts[0].price : targetHighs[0];

  // Breakdown-short target must sit BELOW the level being lost.
  const breakdownLow = lowVals[0];
  const belowLevels = [
    ...(swings ? swings.lows : []),
    s?.recentLow, s?.priorWeekLow, s2,
  ].filter((v): v is number => v != null && v < breakdownLow);
  // Only a level strictly below the one being broken is a valid down-target; if
  // none exists, omit the continuation line rather than print a target above it.
  const downTarget: number | null = belowLevels.length ? Math.max(...belowLevels) : null;

  let reasoning: string;
  if (bias === "bullish") {
    reasoning = `Bullish — buyers have the edge while price holds the ${fmtLevel(magnet)} magnet. Trade the failed breakdown; manage level-to-level (bank the first target, trail a runner).`;
  } else if (bias === "bearish") {
    reasoning = `Bearish tilt — under the ${fmtLevel(magnet)} magnet a rejection short is in play, but the failed-breakdown long is still the A+ setup on any reclaim. Manage level-to-level.`;
  } else {
    reasoning = `Neutral — balanced around the ${fmtLevel(magnet)} magnet. No edge until price flushes a low and reclaims it (failed breakdown). Manage level-to-level.`;
  }

  // Ranked failed-breakdown longs (best QUALITY first) with a target on each and
  // an explicit quality tag so micro shelves are visibly de-emphasized.
  const medals = ["🥇", "🥈", "🥉"];
  const target = targetHighs[0] != null ? fmtLevel(targetHighs[0]) : fmtLevel(magnet);
  const longParts = longPts.length
    ? longPts.map((p, i) => {
        const tag = tierWordLow[p.tier];
        if (i === 0)
          return `${medals[0]} ${fmtLevel(p.price)} (${tag}): flush + reclaim → long toward ${fmtLevel(magnet)}, then ${target}`;
        if (i === 1) return `${medals[1]} ${fmtLevel(p.price)} (${tag}): deeper backup if the first fails`;
        return `${medals[2]} ${fmtLevel(p.price)} (${tag}): deeper, take it if it reaches`;
      })
    : lowVals.slice(0, 3).map((v, i) => {
        if (i === 0) return `${medals[0]} ${fmtLevel(v)}: flush + reclaim → long toward ${fmtLevel(magnet)}, then ${target}`;
        if (i === 1) return `${medals[1]} ${fmtLevel(v)}: deeper backup if the first fails`;
        return `${medals[2]} ${fmtLevel(v)}: lower, higher-quality`;
      });
  const long =
    `Failed-breakdown longs (best first):\n${longParts.join("\n")}\n` +
    `Entry rule: wait for acceptance — price holds back above the level, or reclaims by ~5 pts and holds a couple minutes (don't knife-catch). Then manage level-to-level and leave a runner.`;

  // Ranked rejection shorts (best QUALITY first), mirroring the longs — built from
  // the major resistances above the magnet with a quality tag on each.
  const shortParts = shortPts.length
    ? shortPts.map((p, i) => {
        const tag = tierWordHigh[p.tier];
        if (i === 0)
          return `${medals[0]} ${fmtLevel(p.price)} (${tag}): reject + fail to hold → short toward ${fmtLevel(magnet)}`;
        if (i === 1) return `${medals[1]} ${fmtLevel(p.price)} (${tag}): next resistance up`;
        return `${medals[2]} ${fmtLevel(p.price)} (${tag}): higher, take it if it reaches`;
      })
    : [`${medals[0]} ${fmtLevel(firstHighVal)}: reject + fail to hold → short toward ${fmtLevel(magnet)}`];
  const continuation =
    downTarget != null
      ? `Continuation: breakdown of ${fmtLevel(breakdownLow)} that holds below → ${fmtLevel(downTarget)}. `
      : "";
  const short =
    `Rejection shorts (secondary, lower win-rate — best first):\n${shortParts.join("\n")}\n` +
    continuation +
    `Wait for acceptance the same way; size down — most breakdowns trap.`;

  return { reasoning, long, short };
}

function atr(bars: Bar[], n = 14): number {
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const pc = bars[i - 1].close;
    trs.push(Math.max(bars[i].high - bars[i].low, Math.abs(bars[i].high - pc), Math.abs(bars[i].low - pc)));
  }
  const k = Math.min(n, trs.length);
  return trs.slice(-k).reduce((a, b) => a + b, 0) / k;
}

function nextTradingDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  do { d.setUTCDate(d.getUTCDate() + 1); } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

const ROUND_STEP: Record<"ES" | "NQ", number> = { ES: 25, NQ: 100 };
const AUGMENT_BAND: Record<"ES" | "NQ", number> = { ES: 125, NQ: 500 };

/**
 * Enrich the detected swings with structural anchors (prior-day high/low/close,
 * overnight high/low), round numbers within a band of price, and a range-based
 * extension. Everything is bucketed relative to the magnet: above = resistance,
 * below = support. This guarantees the plan always has near-price levels AND
 * beyond-price targets on both sides, even on breakout days when price is at new
 * highs and there are no detected swings above it. Detected swings keep their
 * quality tier; added reference levels are tagged "minor".
 */
export function augmentSwings(
  swings: SwingLevels | null,
  structure: StructureLevels | null,
  magnet: number,
  price: number,
  symbol: "ES" | "NQ",
): SwingLevels {
  const tick = TICK[symbol];
  const rt = (v: number) => roundToTick(v, tick);
  const clusterTol = price * 0.0012;
  const highs: SwingPoint[] = [...(swings?.highPoints ?? [])];
  const lows: SwingPoint[] = [...(swings?.lowPoints ?? [])];

  const addLevel = (raw: number | null | undefined, tier: SwingTier) => {
    if (raw == null || !Number.isFinite(raw)) return;
    const p = rt(raw);
    const arr = p > magnet ? highs : p < magnet ? lows : null;
    if (!arr) return; // sitting exactly on the magnet
    if (arr.some((q) => Math.abs(q.price - p) < clusterTol)) return;
    arr.push({ price: p, prominence: 0, tier });
  };

  addLevel(structure?.priorHigh, "major");
  addLevel(structure?.priorLow, "major");
  addLevel(structure?.priorClose, "minor");
  addLevel(structure?.overnightHigh, "minor");
  addLevel(structure?.overnightLow, "minor");

  // Round numbers within a band above and below price (near-price levels +
  // clean upside/downside targets).
  const step = ROUND_STEP[symbol];
  const band = AUGMENT_BAND[symbol];
  for (let r = Math.ceil((price - band) / step) * step; r <= price + band; r += step) {
    addLevel(r, "minor");
  }

  // Measured extension off the prior-day range (a projected target each way).
  if (structure?.priorHigh != null && structure?.priorLow != null) {
    const range = structure.priorHigh - structure.priorLow;
    if (range > 0) {
      addLevel(structure.priorHigh + range * 0.5, "minor");
      addLevel(structure.priorLow - range * 0.5, "minor");
    }
  }

  highs.sort((a, b) => b.price - a.price);
  lows.sort((a, b) => b.price - a.price);
  return {
    lows: lows.map((p) => p.price),
    highs: highs.map((p) => p.price),
    lowPoints: lows,
    highPoints: highs,
  };
}

/** Pure, testable core. */
export function computeLevels(bars: Bar[], symbol: "ES" | "NQ", structure: StructureLevels | null = null, swings: SwingLevels | null = null): ComputedLevels {
  const prev = bars[bars.length - 1];
  const { high: H, low: L, close: C } = prev;
  const a = atr(bars, 14);
  const tick = TICK[symbol];
  const PP = (H + L + C) / 3;
  const dz = 0.25 * a;
  const rt = (v: number) => roundToTick(v, tick);

  const magnet = rt(PP);
  const dynamic_zone_high = rt(PP + dz);
  const dynamic_zone_low = rt(PP - dz);
  const r1 = rt(2 * PP - L), s1 = rt(2 * PP - H);
  const r2 = rt(PP + (H - L)), s2 = rt(PP - (H - L));
  const r3 = rt(H + 2 * (PP - L)), s3 = rt(L - 2 * (H - PP));
  const r4 = rt(r3 + (r3 - r2)), s4 = rt(s3 - (s2 - s3));
  const bias: ComputedLevels["bias"] = C > PP + dz ? "bullish" : C < PP - dz ? "bearish" : "neutral";

  // Enrich the detected swings with structure, round numbers, and extensions so
  // the plan always has near-price levels and beyond-price targets on both sides.
  const enriched = augmentSwings(swings, structure, magnet, rt(C), symbol);

  const plan = buildPlan({ bias, magnet, dzHigh: dynamic_zone_high, dzLow: dynamic_zone_low, r1, s1, s2, structure, swings: enriched });

  return {
    symbol, target_date: nextTradingDay(prev.date), current_price: rt(C),
    dynamic_zone_high, dynamic_zone_low, magnet,
    r1, r2, r3, r4, s1, s2, s3, s4,
    bias,
    bias_reasoning: plan.reasoning,
    top_long_trade: plan.long,
    top_short_trade: plan.short,
    algorithm_version: ALGORITHM_VERSION,
    levels: {
      magnet,
      dynamicZoneTop: dynamic_zone_high,
      dynamicZoneBottom: dynamic_zone_low,
      priorHigh: structure?.priorHigh ?? null,
      priorLow: structure?.priorLow ?? null,
      priorClose: structure?.priorClose ?? null,
      overnightHigh: structure?.overnightHigh ?? null,
      overnightLow: structure?.overnightLow ?? null,
      priorWeekHigh: structure?.priorWeekHigh ?? null,
      priorWeekLow: structure?.priorWeekLow ?? null,
      recentHigh: structure?.recentHigh ?? null,
      recentLow: structure?.recentLow ?? null,
      swingSupports: enriched.lows,
      swingResistances: enriched.highs,
      swingSupportPoints: enriched.lowPoints,
      swingResistancePoints: enriched.highPoints,
    },
  };
}

async function postToIngest(levels: ComputedLevels): Promise<void> {
  const key = process.env.ALGORITHM_INGEST_API_KEY;
  if (!key) throw new Error("ALGORITHM_INGEST_API_KEY not set");
  const port = process.env.PORT || "5000";
  const res = await fetch(`http://127.0.0.1:${port}/api/levels/ingest`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify(levels),
  });
  if (!res.ok) throw new Error(`ingest failed ${res.status}: ${await res.text().catch(() => "")}`);
}

export async function generateAndPublishLevels(): Promise<void> {
  for (const symbol of ["ES", "NQ"] as const) {
    try {
      // Prefer the tighter regular-session (RTH) range; fall back to Yahoo's
      // full-session daily bars if intraday data is unavailable.
      let bars: Bar[];
      let structure: StructureLevels | null = null;
      let swings: SwingLevels | null = null;
      try {
        const intraday = await fetchIntradayBars(symbol, "1mo", "30m");
        bars = await fetchRthDailyBars(symbol);
        structure = computeStructureLevels(intraday, symbol);
        swings = detectSwings(intraday, symbol);
      } catch (rthErr: any) {
        console.warn(`[levels] ${symbol} RTH/structure unavailable (${rthErr?.message || rthErr}); falling back to daily`);
        bars = await fetchDailyBars(symbol);
      }
      const levels = computeLevels(bars, symbol, structure, swings);
      await postToIngest(levels);
      console.log(`[levels] published ${symbol} for ${levels.target_date} (magnet ${levels.magnet}, ${levels.bias})`);
    } catch (err: any) {
      console.error(`[levels] ${symbol} failed:`, err?.message || err);
    }
  }
}
