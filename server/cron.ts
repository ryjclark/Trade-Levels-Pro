import cron from "node-cron";
import { storage } from "./storage";
import { sendTelegramMessage } from "./telegram";
import { formatTelegramPro, escapeMdV2 } from "./formatter";
import { generateAndPublishLevels, fetchDailyBars, fetchRthDailyBars, fetchIntradayBars, SYMBOLS, type SymbolId } from "./lib/levels-algorithm";
import { postToX } from "./lib/twitter";
import { buildDailyBrief, formatBriefTelegram } from "./lib/daily-brief";
import type { PlanLevels } from "@shared/schema";

/** Today's date as YYYY-MM-DD in America/New_York. */
function nyToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function processScheduledPlans() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const now = new Date();
  let due;
  try {
    due = await storage.listDueScheduledPlans(now);
  } catch (err) {
    console.error("[cron] listDueScheduledPlans failed:", err);
    return;
  }
  for (const candidate of due) {
    // Atomically claim the row. If another worker already grabbed it, skip.
    const plan = await storage.claimScheduledPlan(candidate.id);
    if (!plan) continue;
    try {
      let text = formatTelegramPro(plan);
      const settings = await storage.getSettings();
      if (settings.footerEnabled && settings.footerText) {
        const footer = settings.footerText.replace("{JOIN_URL}", settings.joinUrl || "");
        text += "\n\n" + escapeMdV2(footer);
      }
      const resp = await sendTelegramMessage({
        token: TELEGRAM_BOT_TOKEN,
        chatId: TELEGRAM_CHAT_ID,
        text,
      });
      const messageId = resp.result?.message_id?.toString() || "";
      await storage.upsertPlan({
        ...plan,
        status: "published",
        publishedAt: new Date().toISOString(),
        telegramMessageId: messageId,
        telegramMessage: text,
        telegramMessageVariant: "pro",
      });
      await storage.insertPublishLog({
        planId: plan.id,
        destination: "telegram",
        variant: "pro-scheduled",
        status: "success",
        responsePayload: JSON.stringify({ messageId }),
      });
      console.log(`[cron] Published scheduled plan #${plan.id} (${plan.symbol} ${plan.date})`);
    } catch (err: any) {
      // Roll the claim back so a future cron tick can retry.
      await storage.upsertPlan({ ...plan, status: "scheduled" });
      await storage.insertPublishLog({
        planId: plan.id,
        destination: "telegram",
        variant: "pro-scheduled",
        status: "error",
        errorMessage: err?.message || String(err),
      });
      console.error(`[cron] Failed to publish scheduled plan #${plan.id}:`, err);
    }
  }
}

async function fetchAndStoreDailyResults() {
  // After the cash close, record how each of today's published ES/NQ plans
  // performed. This fills `plan_results`, which powers the public track-record
  // page (the proof that converts subscribers). One symbol failing must not
  // block the other, so each is wrapped in its own try/catch.
  const today = nyToday();
  const rfmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const recapLines: string[] = [];

  for (const symbol of SYMBOLS) {
    try {
      const plan = await storage.getPlanByDateSymbol(today, symbol);
      if (!plan) {
        console.log(`[cron] results: no plan for ${symbol} ${today}, skipping`);
        continue;
      }

      // Idempotency: never double-record a session.
      const existing = await storage.listResultsForPlanIds([plan.id]);
      if (existing.length > 0) {
        console.log(`[cron] results: ${symbol} ${today} already recorded, skipping`);
        continue;
      }

      // Measure hits against the same regular-session (RTH) range the levels are
      // built from; fall back to full-session daily bars if intraday is missing.
      // Prefer the bar dated today; else the most recent (provider lag at close).
      let bars;
      try {
        bars = await fetchRthDailyBars(symbol);
      } catch {
        bars = await fetchDailyBars(symbol);
      }
      const bar = bars.find((b) => b.date === today) ?? bars[bars.length - 1];
      if (!bar) {
        console.log(`[cron] results: no OHLC bar for ${symbol} ${today}, skipping`);
        continue;
      }
      const { open, high, low, close } = bar;

      const b01 = (v: boolean) => (v ? 1 : 0);
      const hitMagnet = b01(plan.magnet != null && low <= plan.magnet && plan.magnet <= high);
      const hitR1 = b01(plan.r1 != null && high >= plan.r1);
      const hitR2 = b01(plan.r2 != null && high >= plan.r2);
      const hitS1 = b01(plan.s1 != null && low <= plan.s1);
      const hitS2 = b01(plan.s2 != null && low <= plan.s2);

      // Score EVERY stored level (structure + swing) for the track record.
      // Resistance tagged = high >= level; support tagged = low <= level;
      // magnet tagged = range contains it. Failed-breakdown "worked" = a support
      // flushed (low < level) AND closed back above it (close > level).
      const lv = (plan as any).levels as import("@shared/schema").PlanLevels | null;
      let levelHits: import("@shared/schema").LevelHits | null = null;
      if (lv) {
        const named: Record<string, 0 | 1> = {};
        const namedResist: Array<[string, number | null]> = [
          ["priorHigh", lv.priorHigh], ["overnightHigh", lv.overnightHigh],
          ["priorWeekHigh", lv.priorWeekHigh], ["recentHigh", lv.recentHigh],
        ];
        const namedSupport: Array<[string, number | null]> = [
          ["priorLow", lv.priorLow], ["priorClose", lv.priorClose], ["overnightLow", lv.overnightLow],
          ["priorWeekLow", lv.priorWeekLow], ["recentLow", lv.recentLow],
        ];
        for (const [k, v] of namedResist) if (v != null) named[k] = b01(high >= v);
        for (const [k, v] of namedSupport) if (v != null) named[k] = b01(low <= v);

        const sups = lv.swingSupports ?? [];
        const res = lv.swingResistances ?? [];
        let flushed = 0, reclaimed = 0, supTagged = 0;
        for (const s of sups) {
          if (low <= s) supTagged++;
          if (low < s) { flushed++; if (close > s) reclaimed++; }
        }
        const resTagged = res.filter((r) => high >= r).length;

        // The flagged A+ (nearest major support below the magnet): did it flush
        // AND reclaim (the failed-breakdown setup actually working)?
        let aPlus: number | null = null;
        let aPlusReclaimed: 0 | 1 = 0;
        if (plan.magnet != null) {
          const majors = (lv.swingSupportPoints ?? [])
            .filter((p) => p.tier === "major" && p.price < plan.magnet!)
            .sort((a, b) => b.price - a.price);
          aPlus = majors[0]?.price ?? null;
          if (aPlus != null && low < aPlus && close > aPlus) aPlusReclaimed = 1;
        }
        // First upside target (nearest resistance above the magnet): did price hit it?
        let firstTarget: number | null = null;
        let firstTargetHit: 0 | 1 = 0;
        if (plan.magnet != null) {
          const above = (lv.swingResistances ?? []).filter((r) => r > plan.magnet!).sort((a, b) => a - b);
          firstTarget = above[0] ?? null;
          if (firstTarget != null && high >= firstTarget) firstTargetHit = 1;
        }

        levelHits = {
          magnet: hitMagnet as 0 | 1,
          named,
          supports: { total: sups.length, tagged: supTagged, flushed, reclaimed },
          resistances: { total: res.length, tagged: resTagged },
          aPlus,
          aPlusReclaimed,
          firstTarget,
          firstTargetHit,
        };

        // End-of-day recap line — a DIRECTIONAL plan grade, not raw support
        // coverage. On a trending day price shouldn't revisit its supports, so
        // "X/13 supports tested" reads as a loss when the call was actually right.
        // Lead with the bias call + the objective IN THE CALLED DIRECTION
        // (upside targets on a bull day, downside on a bear day), then the A+
        // failed-breakdown outcome and the magnet. supTagged/resTagged still get
        // stored above for the track record; they just don't headline the recap.
        const dayChange = close - open;
        const changeStr = `${dayChange >= 0 ? "+" : ""}${rfmt(dayChange)}`;
        const biasStr = (plan.bias || "").toLowerCase();
        const biasCap = biasStr ? biasStr.charAt(0).toUpperCase() + biasStr.slice(1) : "";
        const mg = plan.magnet;

        let headline: string;
        if (biasStr === "bullish" || biasStr === "bearish") {
          const callRight = biasStr === "bullish" ? close >= open : close <= open;
          headline = `${symbol}: ${biasCap} call ${callRight ? "✅" : "✗"} · closed ${rfmt(close)} (${changeStr})`;
        } else {
          headline = `${symbol}: Range day · closed ${rfmt(close)} (${changeStr})`;
        }

        // Targets in the realized/called direction.
        const dirUp = biasStr === "bullish" || (biasStr !== "bearish" && close >= open);
        const tgts =
          mg == null ? [] :
          dirUp ? res.filter((r) => r > mg).sort((a, b) => a - b)
                : sups.filter((s) => s < mg).sort((a, b) => b - a);
        const tgtHit = dirUp ? tgts.filter((r) => high >= r) : tgts.filter((s) => low <= s);

        // A+ failed-breakdown outcome — "held above" (trend ran) is a WIN, not a miss.
        let aLine = "";
        if (aPlus != null) {
          if (aPlusReclaimed) aLine = `A+ ${rfmt(aPlus)}: flushed & reclaimed ✅ — the failed-breakdown worked`;
          else if (low > aPlus) aLine = `A+ ${rfmt(aPlus)}: held above all session — trend ran, no dip to buy`;
          else aLine = `A+ ${rfmt(aPlus)}: flushed but didn't reclaim by the close`;
        }

        const parts = [headline];
        if (tgts.length)
          parts.push(
            `Targets ${dirUp ? "up" : "down"}: ${tgtHit.length}/${tgts.length} hit` +
              (tgtHit.length ? ` (${tgtHit.slice(0, 3).map(rfmt).join(", ")})` : ""),
          );
        if (aLine) parts.push(aLine);
        if (mg != null) parts.push(`Magnet ${rfmt(mg)} ${hitMagnet ? "tagged ✅" : "not tagged"}`);
        recapLines.push(parts.join("\n"));
      }

      await storage.insertPlanResult({
        planId: plan.id,
        date: today,
        symbol,
        open,
        high,
        low,
        close,
        hitR1,
        hitR2,
        hitS1,
        hitS2,
        hitMagnet,
        levelHits: levelHits as any,
        notes: null,
      });
      console.log(
        `[cron] results: recorded ${symbol} ${today} ` +
          `(O ${open} H ${high} L ${low} C ${close}; magnet ${hitMagnet}, R1 ${hitR1}, S1 ${hitS1})`,
      );

      // Auto-post to X when the plan's discussed levels actually reacted: the
      // failed breakdown worked (flushed and reclaimed) or the magnet was tagged.
      // This is proof/marketing; no-op in dev-mode until X credentials are set.
      try {
        const worked = levelHits ? levelHits.supports.reclaimed > 0 || hitMagnet === 1 : false;
        if (worked) {
          const lv = (plan as any).levels as PlanLevels | null;
          let keyLevel: number | null = null;
          if (lv && plan.magnet != null) {
            const below = (lv.swingSupportPoints ?? []).filter((p) => p.price < plan.magnet!);
            const major = below.find((p) => p.tier === "major") ?? below[0];
            keyLevel = major ? major.price : null;
          }
          const parts: string[] = [`$${symbol} nightly plan update.`];
          if (levelHits && levelHits.supports.reclaimed > 0) {
            parts.push(
              keyLevel != null
                ? `Price flushed below ${keyLevel} and reclaimed it, the failed-breakdown long we flagged the night before.`
                : `A failed breakdown we flagged flushed and reclaimed.`,
            );
          } else if (hitMagnet === 1) {
            parts.push(`Price tagged the ${plan.magnet} magnet from the plan.`);
          }
          parts.push(`Free nightly ES & NQ levels: tradelevelspro.com`);
          await postToX(parts.join(" "));
        }
      } catch (xErr: any) {
        console.error(`[cron] X auto-post ${symbol} failed:`, xErr?.message || xErr);
      }
    } catch (err: any) {
      console.error(`[cron] results: ${symbol} failed:`, err?.message || err);
    }
  }

  // End-of-day recap to Telegram: how today's levels actually did (closes the loop
  // and builds trust — the same numbers that feed the track record).
  if (recapLines.length && TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const dateLabel = new Date(`${today}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const text =
      `📊 Session recap · ${dateLabel}\n\n${recapLines.join("\n\n")}\n\n` +
      `Full track record: tradelevelspro.com/track-record`;
    try {
      await sendTelegramMessage({ token: TELEGRAM_BOT_TOKEN, chatId: TELEGRAM_CHAT_ID, text, parseMode: "none" });
      console.log("[cron] posted session recap to Telegram");
    } catch (err: any) {
      console.error("[cron] session recap post failed:", err?.message || err);
    }
  }
}

async function postDailyBriefToTelegram() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const brief = await buildDailyBrief();
    const text = formatBriefTelegram(brief);
    if (!text) return; // nothing scored yet, don't post an empty brief
    await sendTelegramMessage({ token: TELEGRAM_BOT_TOKEN, chatId: TELEGRAM_CHAT_ID, text, parseMode: "none" });
    console.log("[cron] posted daily brief to Telegram");
  } catch (err: any) {
    console.error("[cron] daily brief post failed:", err?.message || err);
  }
}

// ===== Level-proximity alerts (opt-in) =====
// Sends a short heads-up to Telegram when price comes near one of the day's
// MAJOR levels. OFF unless PROXIMITY_ALERTS_ENABLED === "true". Each level
// alerts at most once per session, only during the regular cash session, so it
// can never spam the channel.

const proximityAlerted = new Set<string>(); // keys: `${date}-${symbol}-${price}`
// Wider "approaching" window so range days still ping when price nears a level
// (3 pts was too tight for ES between 2-min checks).
const PROXIMITY_THRESHOLD: Record<SymbolId, number> = { ES: 6, NQ: 24, GC: 4, CL: 0.5, RTY: 4 };

// Which symbols fire INTRADAY alerts (the all-day level-hit pings). Defaults to
// ES + NQ so the broadcast channel isn't a firehose of five tickers; the once-a-day
// plans + recap still cover every symbol. Override with INTRADAY_ALERT_SYMBOLS
// (comma-separated, e.g. "ES,NQ,GC"). Per-user control comes from the preference bot.
const INTRADAY_ALERT_SYMBOLS: SymbolId[] = (() => {
  const raw = (process.env.INTRADAY_ALERT_SYMBOLS ?? "ES,NQ")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is SymbolId => (SYMBOLS as readonly string[]).includes(s));
  return raw.length ? raw : (["ES", "NQ"] as SymbolId[]);
})();

function isRegularSessionET(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const wd = parts.find((p) => p.type === "weekday")?.value;
  if (wd === "Sat" || wd === "Sun") return false;
  const hh = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const mm = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const mins = hh * 60 + mm;
  return mins >= 9 * 60 + 30 && mins <= 16 * 60; // 9:30–16:00 ET
}

// Last seen price per symbol, so we can detect a level CROSSING (reclaim / lose /
// tag) between checks — not just proximity.
const lastPrice = new Map<SymbolId, number>();

async function checkIntradayAlerts() {
  if (process.env.PROXIMITY_ALERTS_ENABLED !== "true") return;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  if (!isRegularSessionET()) return;

  const today = nyToday();
  const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const send = async (key: string, text: string) => {
    if (proximityAlerted.has(key)) return;
    try {
      await sendTelegramMessage({ token: TELEGRAM_BOT_TOKEN!, chatId: TELEGRAM_CHAT_ID!, text, parseMode: "none" });
      proximityAlerted.add(key);
      console.log(`[cron] intraday alert: ${text.slice(0, 60)}`);
    } catch (sendErr: any) {
      console.error(`[cron] intraday alert send failed:`, sendErr?.message || sendErr);
    }
  };

  for (const symbol of INTRADAY_ALERT_SYMBOLS) {
    try {
      const plan = await storage.getPlanByDateSymbol(today, symbol);
      if (!plan || plan.magnet == null) continue;
      const lv = (plan as any).levels as import("@shared/schema").PlanLevels | null;
      const magnet = plan.magnet;

      // Current (delayed) price from the latest 1-minute bar.
      let price: number | null = null;
      try {
        const bars = await fetchIntradayBars(symbol, "1d", "1m");
        price = bars.length ? bars[bars.length - 1].close : null;
      } catch {
        price = null;
      }
      if (price == null) continue;
      const prev = lastPrice.get(symbol) ?? null;
      lastPrice.set(symbol, price);

      type Lvl = { price: number; kind: "support" | "resistance" | "magnet" };
      const levels: Lvl[] = [{ price: magnet, kind: "magnet" }];
      if (lv) {
        // Watch the nearest ~4 real shelves each side (not just majors), so there's
        // always something to react to on a range day — deduped so it can't spam.
        const sup = (lv.swingSupportPoints ?? [])
          .filter((p) => p.price < magnet && p.tier !== "micro")
          .sort((a, b) => magnet - a.price - (magnet - b.price))
          .slice(0, 4);
        const res = (lv.swingResistancePoints ?? [])
          .filter((p) => p.price > magnet && p.tier !== "micro")
          .sort((a, b) => a.price - magnet - (b.price - magnet))
          .slice(0, 4);
        for (const p of sup) levels.push({ price: p.price, kind: "support" });
        for (const p of res) levels.push({ price: p.price, kind: "resistance" });
      }

      const threshold = PROXIMITY_THRESHOLD[symbol];
      for (const level of levels) {
        const L = level.price;

        // Crossing events (need a prior price to know price moved THROUGH the level).
        if (prev != null) {
          if (level.kind === "support") {
            if (prev < L && price >= L)
              await send(`${today}-${symbol}-${L}-reclaim`, `✅ ${symbol} reclaimed ${fmt(L)} — failed-breakdown long in play. Wait for acceptance (holds a couple minutes above), then manage level to level.`);
            else if (prev >= L && price < L)
              await send(`${today}-${symbol}-${L}-lose`, `⚠️ ${symbol} flushed below ${fmt(L)} — watch for a reclaim (the failed-breakdown setup). Don't knife-catch; wait for it to recover and hold.`);
          } else if (level.kind === "resistance") {
            if (prev < L && price >= L)
              await send(`${today}-${symbol}-${L}-tag`, `🎯 ${symbol} tagged ${fmt(L)} — key resistance/target reached. Bank a runner; watch for rejection.`);
          } else {
            if (prev < L && price >= L) await send(`${today}-${symbol}-${L}-mup`, `⚡ ${symbol} reclaimed the ${fmt(L)} magnet.`);
            else if (prev >= L && price < L) await send(`${today}-${symbol}-${L}-mdn`, `⚡ ${symbol} lost the ${fmt(L)} magnet.`);
          }
        }

        // Lighter "approaching" heads-up (once per level per session).
        const nearKey = `${today}-${symbol}-${L}-near`;
        if (!proximityAlerted.has(nearKey) && Math.abs(price - L) <= threshold) {
          const t =
            level.kind === "magnet"
              ? `⚡ ${symbol} is back near the ${fmt(L)} magnet.`
              : level.kind === "support"
                ? `⚡ ${symbol} approaching ${fmt(L)} — a key failed-breakdown level. Watch for a flush and reclaim.`
                : `⚡ ${symbol} approaching ${fmt(L)} — key resistance. Watch for a rejection.`;
          await send(nearKey, t);
        }
      }
    } catch (err: any) {
      console.error(`[cron] intraday ${symbol} failed:`, err?.message || err);
    }
  }
}

// Externally-triggerable job runners. Replit Autoscale can idle the app to zero,
// which stops the in-process timers — so an external pinger hits these via
// /api/cron/:job to guarantee they run (and keeps the app warm).
export async function runIntradayTick() {
  await checkIntradayAlerts();
}
export async function runResultsTick() {
  await fetchAndStoreDailyResults();
}
export async function runGenerateTick() {
  await generateAndPublishLevels();
  await postDailyBriefToTelegram();
}

export function registerCronJobs() {
  // Every minute: publish any plans whose scheduled_for has passed.
  cron.schedule("* * * * *", () => {
    processScheduledPlans().catch((e) => console.error("[cron] scheduled publish error:", e));
  });

  // 5:00 PM America/New_York — record how today's plans performed.
  cron.schedule(
    "0 17 * * 1-5",
    () => {
      fetchAndStoreDailyResults().catch((e) =>
        console.error("[cron] daily results error:", e),
      );
    },
    { timezone: "America/New_York" } as any,
  );

  // 5:15 PM America/New_York, weekdays — self-generating levels for the next session.
  cron.schedule(
    "15 17 * * 1-5",
    () => {
      generateAndPublishLevels()
        .then(() => postDailyBriefToTelegram())
        .catch((e) => console.error("[cron] levels generation error:", e));
    },
    { timezone: "America/New_York" } as any,
  );

  // Every 2 minutes during the cash session — level-proximity heads-up alerts.
  // No-op unless PROXIMITY_ALERTS_ENABLED === "true".
  cron.schedule(
    "*/2 9-16 * * 1-5",
    () => {
      checkIntradayAlerts().catch((e) => console.error("[cron] intraday alerts error:", e));
    },
    { timezone: "America/New_York" } as any,
  );

  console.log(
    "[cron] Registered scheduled-publish (every minute) + daily-results + recap (5pm ET) + self-generating levels (5:15pm ET) + intraday level-hit alerts (2min, opt-in)",
  );
}
