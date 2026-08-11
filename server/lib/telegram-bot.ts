// Telegram preference bot. Users DM the bot, pick which tickers + alert types they
// want via inline buttons, and delivery DMs each person only what they chose — so
// the broadcast channel's one-size-fits-all firehose becomes per-user control.
import { storage } from "../storage";
import { SYMBOLS, SYMBOL_LABEL, type SymbolId } from "./levels-algorithm";
import type { TelegramSubscriber } from "@shared/schema";

export type AlertType = "daily" | "intraday" | "recap";
const ALERT_LABEL: Record<AlertType, string> = {
  daily: "Daily plan",
  intraday: "Intraday hits",
  recap: "Recap",
};

async function tg(token: string, method: string, body: Record<string, unknown>): Promise<any> {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

function typeOn(sub: TelegramSubscriber, t: AlertType): boolean {
  return t === "daily" ? sub.alertDaily : t === "intraday" ? sub.alertIntraday : sub.alertRecap;
}

function keyboard(sub: TelegramSubscriber) {
  const symBtns = SYMBOLS.map((s) => ({
    text: `${(sub.symbols ?? []).includes(s) ? "✅" : "➕"} ${SYMBOL_LABEL[s]}`,
    callback_data: `sym:${s}`,
  }));
  const symRows: any[] = [];
  for (let i = 0; i < symBtns.length; i += 3) symRows.push(symBtns.slice(i, i + 3));
  const typeRow = (["daily", "intraday", "recap"] as AlertType[]).map((t) => ({
    text: `${typeOn(sub, t) ? "✅" : "⬜️"} ${ALERT_LABEL[t]}`,
    callback_data: `type:${t}`,
  }));
  return { inline_keyboard: [...symRows, typeRow, [{ text: "✔️ Done", callback_data: "done" }]] };
}

function prefsText(sub: TelegramSubscriber): string {
  const syms = (sub.symbols ?? []).length ? (sub.symbols ?? []).join(", ") : "none";
  const types =
    (["daily", "intraday", "recap"] as AlertType[]).filter((t) => typeOn(sub, t)).map((t) => ALERT_LABEL[t].toLowerCase()).join(", ") ||
    "none";
  return `⚙️ Your Trade Levels Pro alerts\n\nTickers: ${syms}\nTypes: ${types}\n\nTap to toggle — you'll get DMs only for what's checked.`;
}

/** Handle one incoming Telegram update (message or button press). */
export async function handleTelegramUpdate(update: any, token: string): Promise<void> {
  // Slash commands / plain messages.
  if (update.message?.text) {
    const chatId = String(update.message.chat.id);
    const username: string | null = update.message.chat.username ?? update.message.from?.username ?? null;
    const text = String(update.message.text).trim().toLowerCase();
    if (/^\/(start|alerts|settings|prefs)/.test(text)) {
      const existed = await storage.getTelegramSubscriber(chatId);
      const sub = await storage.upsertTelegramSubscriber(chatId, username);
      if (!existed) {
        await tg(token, "sendMessage", {
          chat_id: chatId,
          text:
            "👋 Welcome to Trade Levels Pro alerts.\n\n" +
            "You control exactly what you receive. Below, tap to turn tickers and alert types on/off, " +
            "then press Done. You'll only get DMs for what's checked — nothing else.\n\n" +
            "Change it anytime by sending /alerts.",
        });
      }
      await tg(token, "sendMessage", { chat_id: chatId, text: prefsText(sub), reply_markup: keyboard(sub) });
    } else {
      await tg(token, "sendMessage", {
        chat_id: chatId,
        text: "Send /alerts to choose which tickers and alert types you receive.",
      });
    }
    return;
  }

  // Inline-button toggles.
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = String(cq.message.chat.id);
    const messageId = cq.message.message_id;
    const data = String(cq.data || "");
    let sub = (await storage.getTelegramSubscriber(chatId)) ?? (await storage.upsertTelegramSubscriber(chatId, cq.from?.username ?? null));

    if (data === "done") {
      await tg(token, "answerCallbackQuery", { callback_query_id: cq.id, text: "Saved ✓" });
      await tg(token, "editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: prefsText(sub) + "\n\n(Send /alerts anytime to change.)",
      });
      return;
    }
    if (data.startsWith("sym:")) {
      const s = data.slice(4) as SymbolId;
      if ((SYMBOLS as readonly string[]).includes(s)) {
        const cur = sub.symbols ?? [];
        const symbols = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
        sub = await storage.updateTelegramSubscriber(chatId, { symbols });
      }
    } else if (data.startsWith("type:")) {
      const t = data.slice(5) as AlertType;
      const patch =
        t === "daily" ? { alertDaily: !sub.alertDaily } : t === "intraday" ? { alertIntraday: !sub.alertIntraday } : { alertRecap: !sub.alertRecap };
      sub = await storage.updateTelegramSubscriber(chatId, patch);
    }
    await tg(token, "answerCallbackQuery", { callback_query_id: cq.id });
    await tg(token, "editMessageText", { chat_id: chatId, message_id: messageId, text: prefsText(sub), reply_markup: keyboard(sub) });
    return;
  }
}

/** DM an alert to every subscriber who opted into (symbol, type). Best-effort:
 *  a blocked/failed DM is skipped, never throws into the caller's alert path. */
export async function deliverToSubscribers(symbol: SymbolId, type: AlertType, text: string, token: string): Promise<number> {
  let subs: TelegramSubscriber[] = [];
  try {
    subs = await storage.listTelegramSubscribersFor(symbol, type);
  } catch {
    return 0;
  }
  let sent = 0;
  for (const sub of subs) {
    try {
      const r = await tg(token, "sendMessage", { chat_id: sub.chatId, text, disable_web_page_preview: true });
      if (r?.ok) sent++;
    } catch {
      /* skip */
    }
  }
  return sent;
}
