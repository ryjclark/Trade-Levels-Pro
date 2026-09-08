import type { Member, Plan } from "@shared/schema";
import { sendTelegramMessage } from "./telegram";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Trade Levels Pro <noreply@tradelevelspro.com>";
// Where "new signup" alerts go. Defaults to the support inbox; override with OWNER_EMAIL.
const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@tradelevelspro.com";
// Optional: DM the owner in Telegram too. Set OWNER_TELEGRAM_CHAT_ID to your own
// chat id with the bot (message the bot once, then set this). Belt-and-suspenders
// so a signup alert never depends solely on email deliverability.
const OWNER_TELEGRAM_CHAT_ID = process.env.OWNER_TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/** Best-effort owner Telegram DM. No-ops if not configured; never throws. */
async function notifyOwnerTelegram(text: string): Promise<void> {
  if (!OWNER_TELEGRAM_CHAT_ID || !TELEGRAM_BOT_TOKEN) return;
  try {
    await sendTelegramMessage({
      token: TELEGRAM_BOT_TOKEN,
      chatId: OWNER_TELEGRAM_CHAT_ID,
      text,
      parseMode: "none",
    });
  } catch (err) {
    console.error("notifyOwnerTelegram failed:", err);
  }
}

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log("[email:dev-mode]", JSON.stringify({
      from: EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      bodyPreview: payload.text || payload.html.slice(0, 200),
    }));
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}

export async function sendMemberLoginLink(email: string, loginUrl: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Your Trade Levels Pro login link",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h1 style="color:#0c1117;">Log in to Trade Levels Pro</h1>
        <p>Click the button below to sign in. This link expires in 20 minutes and can be used once.</p>
        <p><a href="${loginUrl}" style="display:inline-block;background:#2dd4bf;color:#0c1117;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Log in →</a></p>
        <p style="color:#666;font-size:13px;">If you didn't request this, you can ignore this email.</p>
      </div>`,
    text: `Log in to Trade Levels Pro: ${loginUrl}\n(Expires in 20 minutes, single use.)`,
  });
}

// Alert the owner that someone subscribed. Best-effort; callers should catch.
export async function notifyOwnerOfSignup(
  customerEmail: string,
  inviteCreated: boolean
): Promise<void> {
  await sendEmail({
    to: OWNER_EMAIL,
    subject: `New Trade Levels Pro subscriber: ${customerEmail}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h2>New subscriber 🎉</h2>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Telegram invite generated:</strong> ${inviteCreated ? "yes" : "NO — check the bot's channel admin/invite permission"}</p>
        <p style="color:#666;font-size:13px;">Trade Levels Pro automated notification.</p>
      </div>`,
    text: `New Trade Levels Pro subscriber: ${customerEmail}. Invite generated: ${inviteCreated ? "yes" : "NO (check bot permissions)"}.`,
  });
  await notifyOwnerTelegram(
    `🎉 New Trade Levels Pro subscriber: ${customerEmail}\nInvite generated: ${inviteCreated ? "yes" : "NO — check bot channel-admin/invite permission"}`,
  );
}

// Alert the owner that a subscriber actually joined the Telegram channel.
// Best-effort; callers should catch.
export async function notifyOwnerOfJoin(customerEmail: string): Promise<void> {
  await sendEmail({
    to: OWNER_EMAIL,
    subject: `Joined the channel: ${customerEmail}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h2>Member joined ✅</h2>
        <p><strong>${customerEmail}</strong> just used their invite and joined the private Telegram channel.</p>
        <p style="color:#666;font-size:13px;">Trade Levels Pro automated notification.</p>
      </div>`,
    text: `${customerEmail} joined the private Telegram channel.`,
  });
  await notifyOwnerTelegram(`✅ ${customerEmail} joined the private Telegram channel.`);
}

/** Tell a member their recurring payment failed and how to fix it. Best-effort. */
export async function sendPaymentFailedEmail(
  email: string,
  billingPortalUrl: string | null,
): Promise<void> {
  const button = billingPortalUrl
    ? `<p><a href="${billingPortalUrl}" style="display:inline-block;background:#2dd4bf;color:#0c1117;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Update payment method →</a></p>`
    : `<p>Please update your card at <a href="https://tradelevelspro.com/member-login">tradelevelspro.com</a>.</p>`;
  await sendEmail({
    to: email,
    subject: "Action needed: your Trade Levels Pro payment failed",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h1 style="color:#0c1117;">Your payment didn't go through</h1>
        <p>We couldn't process your latest Trade Levels Pro subscription payment. Update your card to keep your access active.</p>
        ${button}
        <p style="color:#666;font-size:13px;margin-top:24px;">If you meant to cancel, no action is needed.</p>
      </div>`,
    text: `Your Trade Levels Pro payment failed. Update your card to keep access${billingPortalUrl ? `: ${billingPortalUrl}` : " at tradelevelspro.com"}.`,
  });
}

export async function sendWelcomeEmail(
  member: Member,
  telegramInviteUrl: string | null
): Promise<void> {
  const inviteBlock = telegramInviteUrl
    ? `<p><a href="${telegramInviteUrl}" style="display:inline-block;background:#2dd4bf;color:#0c1117;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Join the private Telegram channel →</a></p>
       <p style="color:#666;font-size:13px;">This single-use invite link expires in 7 days.</p>`
    : `<p>Your private Telegram invite link will be sent shortly.</p>`;

  await sendEmail({
    to: member.email,
    subject: "Welcome to Trade Levels Pro",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h1 style="color:#0c1117;">Welcome to Trade Levels Pro</h1>
        <p>Your subscription is active. Each trading day after the close you get the plan for ES and NQ (plus Gold, Crude, and Russell).</p>
        ${inviteBlock}
        <p style="color:#444;font-size:14px;margin-top:20px;"><strong>Prefer not to use Telegram?</strong> You don't need it. Just log in at <a href="https://tradelevelspro.com/member-login" style="color:#0891b2;">tradelevelspro.com</a> with this email and read every day's plan under <strong>Today's Plan</strong>.</p>
        <p style="color:#666;font-size:13px;margin-top:32px;">Educational content only. Not investment advice.</p>
      </div>`,
    text: `Welcome to Trade Levels Pro. Your subscription is active.${
      telegramInviteUrl ? `\n\nJoin the private Telegram channel: ${telegramInviteUrl}\n(Single-use, expires in 7 days.)` : ""
    }\n\nPrefer not to use Telegram? You don't need it — just log in at https://tradelevelspro.com/member-login with this email and read every day's plan under Today's Plan.`,
  });
}

export async function sendDailyPlanEmail(
  member: Member,
  plan: Plan
): Promise<void> {
  const subject = `${plan.symbol} Daily Trade Plan — ${plan.date}`;
  await sendEmail({
    to: member.email,
    subject,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h2>${subject}</h2>
        <p><strong>Bias:</strong> ${plan.bias ?? ""}</p>
        <p><strong>Dynamic Zone:</strong> ${plan.dynamicZoneBottom ?? ""} – ${plan.dynamicZoneTop ?? ""}</p>
        <p><strong>Magnet:</strong> ${plan.magnet ?? ""}</p>
        <p><strong>Resistance:</strong> R1 ${plan.r1 ?? ""} | R2 ${plan.r2 ?? ""} | R3 ${plan.r3 ?? ""} | R4 ${plan.r4 ?? ""}</p>
        <p><strong>Support:</strong> S1 ${plan.s1 ?? ""} | S2 ${plan.s2 ?? ""} | S3 ${plan.s3 ?? ""} | S4 ${plan.s4 ?? ""}</p>
        ${plan.setup1 ? `<p><strong>Setup 1:</strong> ${plan.setup1}</p>` : ""}
        ${plan.setup2 ? `<p><strong>Setup 2:</strong> ${plan.setup2}</p>` : ""}
        ${plan.notes ? `<p><strong>Notes:</strong> ${plan.notes}</p>` : ""}
        <p style="color:#666;font-size:13px;">Educational content only. Not investment advice.</p>
      </div>`,
  });
}

// Opt-in daily digest: emails the exact Telegram plan text (already formatted by
// formatAlgorithmPlan) so email/site/Telegram all say the same thing.
export async function sendDailyPlanDigest(email: string, planText: string): Promise<void> {
  const esc = planText.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
  await sendEmail({
    to: email,
    subject: "Your daily trade plan — Trade Levels Pro",
    html:
      `<div style="font-family:ui-monospace,Menlo,Consolas,monospace;max-width:600px;margin:0 auto;color:#111;white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:1.6;">${esc}</div>` +
      `<p style="font-family:Inter,Arial,sans-serif;color:#666;font-size:12px;max-width:600px;margin:16px auto 0;">You're getting this because you turned on daily-plan email. Manage it anytime under Today's Plan settings at <a href="https://tradelevelspro.com/account">tradelevelspro.com/account</a>. Educational content only, not investment advice.</p>`,
    text: `${planText}\n\nManage email delivery at https://tradelevelspro.com/account`,
  });
}

export async function sendWeeklyPreview(
  emailList: string[],
  planSnapshot: Plan
): Promise<void> {
  if (!emailList.length) return;
  await sendEmail({
    to: emailList,
    subject: "A look inside this week's Trade Levels Pro plan",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <h2>Inside this week's plan</h2>
        <p>Here's a redacted look at the structure subscribers get every trading day:</p>
        <p><strong>Bias:</strong> ${planSnapshot.bias ?? ""}</p>
        <p><strong>Dynamic Zone, Magnet, R1–R4, S1–S4 + 1–2 setups</strong></p>
        <p><a href="https://tradelevelspro.com/pricing">See pricing →</a></p>
      </div>`,
  });
}
