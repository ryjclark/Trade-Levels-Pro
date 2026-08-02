/**
 * Self-generating levels algorithm. Fetches daily OHLC for ES/NQ, computes the
 * plan (Dynamic Zone, Magnet, R1-R4, S1-S4, bias) with transparent math, and
 * posts to POST /api/levels/ingest (which upserts source="algorithm" and
 * auto-sends to Telegram). No newsletter. Data source is pluggable.
 */
export const ALGORITHM_VERSION = "v1.0";

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
  const r1 = 2 * PP - L, s1 = 2 * PP - H;
  const r2 = PP + (H - L), s2 = PP - (H - L);
  const r3 = H + 2 * (PP - L), s3 = L - 2 * (H - PP);
  const r4 = r3 + (r3 - r2), s4 = s3 - (s2 - s3);
  const dz = 0.25 * a;
  const bias: ComputedLevels["bias"] = C > PP + dz ? "bullish" : C < PP - dz ? "bearish" : "neutral";
  const rt = (v: number) => roundToTick(v, tick);
  return {
    symbol, target_date: nextTradingDay(prev.date), current_price: rt(C),
    dynamic_zone_high: rt(PP + dz), dynamic_zone_low: rt(PP - dz), magnet: rt(PP),
    r1: rt(r1), r2: rt(r2), r3: rt(r3), r4: rt(r4),
    s1: rt(s1), s2: rt(s2), s3: rt(s3), s4: rt(s4),
    bias, algorithm_version: ALGORITHM_VERSION,
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
      const bars = await fetchDailyBars(symbol);
      const levels = computeLevels(bars, symbol);
      await postToIngest(levels);
      console.log(`[levels] published ${symbol} for ${levels.target_date} (magnet ${levels.magnet}, ${levels.bias})`);
    } catch (err: any) {
      console.error(`[levels] ${symbol} failed:`, err?.message || err);
    }
  }
}
