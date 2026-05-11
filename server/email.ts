import type { Member, Plan } from "@shared/schema";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Trade Levels Pro <noreply@tradelevelspro.com>";

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
        <p>Your subscription is active. You'll receive the next ES daily plan after the close.</p>
        ${inviteBlock}
        <p style="color:#666;font-size:13px;margin-top:32px;">Educational content only. Not investment advice.</p>
      </div>`,
    text: `Welcome to Trade Levels Pro. Your subscription is active.${
      telegramInviteUrl ? `\n\nJoin the private Telegram channel: ${telegramInviteUrl}\n(Single-use, expires in 7 days.)` : ""
    }`,
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
