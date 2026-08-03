import cron from "node-cron";
import { storage } from "./storage";
import { sendTelegramMessage } from "./telegram";
import { formatTelegramPro, escapeMdV2 } from "./formatter";
import { generateAndPublishLevels, fetchDailyBars, fetchRthDailyBars } from "./lib/levels-algorithm";

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

  for (const symbol of ["ES", "NQ"] as const) {
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

        levelHits = {
          magnet: hitMagnet as 0 | 1,
          named,
          supports: { total: sups.length, tagged: supTagged, flushed, reclaimed },
          resistances: { total: res.length, tagged: resTagged },
        };
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
    } catch (err: any) {
      console.error(`[cron] results: ${symbol} failed:`, err?.message || err);
    }
  }
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
      generateAndPublishLevels().catch((e) =>
        console.error("[cron] levels generation error:", e),
      );
    },
    { timezone: "America/New_York" } as any,
  );

  console.log(
    "[cron] Registered scheduled-publish (every minute) + daily-results (5pm ET) + self-generating levels (5:15pm ET)",
  );
}
