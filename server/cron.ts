import cron from "node-cron";
import { storage } from "./storage";
import { sendTelegramMessage } from "./telegram";
import { formatTelegramPro, escapeMdV2 } from "./formatter";

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
  // TODO: Fetch OHLC data for today's published ES/NQ plans and store in plan_results.
  // Suggested provider: Polygon.io / TradingView / IBKR — use intraday RTH bars to derive
  // open/high/low/close and which R/S/Magnet levels were tagged. For now this is a
  // placeholder that simply logs that the daily settlement window has elapsed so the
  // archive page's "result tag" feature can be wired up later.
  console.log("[cron] Daily results stub — would fetch OHLC and write plan_results here");
}

export function registerCronJobs() {
  // Every minute: publish any plans whose scheduled_for has passed.
  cron.schedule("* * * * *", () => {
    processScheduledPlans().catch((e) => console.error("[cron] scheduled publish error:", e));
  });

  // 5:00 PM America/New_York — daily results fetch stub.
  cron.schedule(
    "0 17 * * 1-5",
    () => {
      fetchAndStoreDailyResults().catch((e) =>
        console.error("[cron] daily results error:", e),
      );
    },
    { timezone: "America/New_York" } as any,
  );

  console.log("[cron] Registered scheduled-publish (every minute) + daily-results (5pm ET)");
}
