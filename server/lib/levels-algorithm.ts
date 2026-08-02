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

/** Human number for plan text, e.g. 7496 or 28403.25. */
function fmtLevel(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/**
 * Rule-based, reactive trading plan (bias reasoning + top long/short) built from
 * the computed levels. Reactive by design — "React to Price. No Predictions."
 */
function buildPlan(x: {
  bias: "bullish" | "neutral" | "bearish";
  magnet: number; dzHigh: number; dzLow: number;
  r1: number; r2: number; s1: number; s2: number;
}): { reasoning: string; long: string; short: string } {
  const { bias, magnet, dzHigh, dzLow, r1, r2, s1, s2 } = x;
  let reasoning: string;
  if (bias === "bullish") {
    reasoning = `Prior close held above the Dynamic Zone (${fmtLevel(dzLow)}–${fmtLevel(dzHigh)}); buyers have the edge while price stays above the ${fmtLevel(magnet)} Magnet.`;
  } else if (bias === "bearish") {
    reasoning = `Prior close broke below the Dynamic Zone (${fmtLevel(dzLow)}–${fmtLevel(dzHigh)}); sellers have the edge while price stays below the ${fmtLevel(magnet)} Magnet.`;
  } else {
    reasoning = `Prior close settled inside the Dynamic Zone (${fmtLevel(dzLow)}–${fmtLevel(dzHigh)}); no edge either way until price leaves the zone around the ${fmtLevel(magnet)} Magnet.`;
  }
  const long =
    `React to a reclaim/hold of the Dynamic Zone low ${fmtLevel(dzLow)} or S1 ${fmtLevel(s1)} — long toward the Magnet ${fmtLevel(magnet)}, then R1 ${fmtLevel(r1)}. Idea fails on an accepted break below S2 ${fmtLevel(s2)}.`;
  const short =
    `React to a rejection at the Dynamic Zone high ${fmtLevel(dzHigh)} or R1 ${fmtLevel(r1)} — short toward the Magnet ${fmtLevel(magnet)}, then S1 ${fmtLevel(s1)}. Idea fails on an accepted break above R2 ${fmtLevel(r2)}.`;
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

/** Pure, testable core. */
export function computeLevels(bars: Bar[], symbol: "ES" | "NQ"): ComputedLevels {
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

  const plan = buildPlan({ bias, magnet, dzHigh: dynamic_zone_high, dzLow: dynamic_zone_low, r1, r2, s1, s2 });

  return {
    symbol, target_date: nextTradingDay(prev.date), current_price: rt(C),
    dynamic_zone_high, dynamic_zone_low, magnet,
    r1, r2, r3, r4, s1, s2, s3, s4,
    bias,
    bias_reasoning: plan.reasoning,
    top_long_trade: plan.long,
    top_short_trade: plan.short,
    algorithm_version: ALGORITHM_VERSION,
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
      try {
        bars = await fetchRthDailyBars(symbol);
      } catch (rthErr: any) {
        console.warn(`[levels] ${symbol} RTH bars unavailable (${rthErr?.message || rthErr}); falling back to daily`);
        bars = await fetchDailyBars(symbol);
      }
      const levels = computeLevels(bars, symbol);
      await postToIngest(levels);
      console.log(`[levels] published ${symbol} for ${levels.target_date} (magnet ${levels.magnet}, ${levels.bias})`);
    } catch (err: any) {
      console.error(`[levels] ${symbol} failed:`, err?.message || err);
    }
  }
}
