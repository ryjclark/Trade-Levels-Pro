import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { sendWelcomeEmail, notifyOwnerOfSignup, sendPaymentFailedEmail } from "./email";
import { createMemberSession, requireMember, type MemberAuthRequest } from "./member-auth";
import type { Member } from "@shared/schema";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const STRIPE_PRICE_ID_ANNUAL = process.env.STRIPE_PRICE_ID_ANNUAL;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const APP_BASE_URL = process.env.APP_BASE_URL || "https://tradelevelspro.com";

function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY);
}

export async function createTelegramInvite(): Promise<string | null> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return null;
  try {
    const expireDate = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createChatInviteLink`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        member_limit: 1,
        expire_date: expireDate,
        name: `tlp-${Date.now()}`,
      }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      result?: { invite_link: string };
      description?: string;
    };
    if (!data.ok || !data.result) {
      // Most common cause: the bot is not an admin of the channel with the
      // "invite users via link" permission. The description says exactly why.
      console.error("Telegram createChatInviteLink failed:", data.description || data);
      return null;
    }
    return data.result.invite_link;
  } catch (err) {
    console.error("Telegram invite link error:", err);
    return null;
  }
}

/** Ensure a paid customer has an active member record WITH a Telegram invite.
 *  Idempotent and safe to call from both the webhook and the /welcome page:
 *  creates the member if missing, and generates + persists an invite if one
 *  isn't there yet. Returns the member and whether an invite was just created. */
async function provisionMemberAccess(args: {
  email: string;
  customerId: string | null;
  subscriptionId: string | null;
}): Promise<{ member: Member; inviteCreatedNow: boolean }> {
  const email = args.email.toLowerCase();
  let member = await storage.getMemberByEmail(email);

  if (!member) {
    const inviteLink = await createTelegramInvite();
    member = await storage.upsertMember({
      email,
      stripeCustomerId: args.customerId,
      stripeSubscriptionId: args.subscriptionId,
      status: "active",
      telegramInviteLink: inviteLink,
      telegramJoinedAt: null,
    });
    return { member, inviteCreatedNow: !!inviteLink };
  }

  // Member exists but never got an invite — heal it without clobbering fields.
  if (!member.telegramInviteLink) {
    const inviteLink = await createTelegramInvite();
    if (inviteLink) {
      const healed = await storage.setMemberInvite(email, inviteLink);
      return { member: healed ?? member, inviteCreatedNow: true };
    }
  }
  return { member, inviteCreatedNow: false };
}

/** Admin action: mint a FRESH single-use invite for a member (even if one exists,
 *  e.g. the old one expired or was never received) and persist it. */
export async function regenerateMemberInvite(email: string): Promise<string | null> {
  const inviteLink = await createTelegramInvite();
  if (!inviteLink) return null;
  await storage.setMemberInvite(email.toLowerCase(), inviteLink);
  return inviteLink;
}

export function registerStripeRoutes(app: Express): void {
  app.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const stripe = getStripe();
      if (!stripe || !STRIPE_WEBHOOK_SECRET) {
        return res.status(503).json({ error: "Stripe not configured" });
      }
      const sig = req.headers["stripe-signature"] as string | undefined;
      if (!sig) return res.status(400).send("Missing stripe-signature");

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error("Stripe webhook signature failed:", err);
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      }

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const email =
            session.customer_email ||
            session.customer_details?.email ||
            "";
          const customerId =
            typeof session.customer === "string" ? session.customer : session.customer?.id || null;
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id || null;

          if (email) {
            const { member } = await provisionMemberAccess({
              email,
              customerId,
              subscriptionId,
            });

            // Best-effort notifications — a failure here must never fail the
            // webhook (which would make Stripe retry and double-provision).
            try {
              await sendWelcomeEmail(member, member.telegramInviteLink);
            } catch (err) {
              console.error("sendWelcomeEmail failed:", err);
            }
            try {
              await notifyOwnerOfSignup(member.email, !!member.telegramInviteLink);
            } catch (err) {
              console.error("notifyOwnerOfSignup failed:", err);
            }
          }
        } else if (event.type === "customer.subscription.deleted") {
          const sub = event.data.object as Stripe.Subscription;
          await storage.markMemberInactiveBySubscription(sub.id);
        } else if (event.type === "invoice.payment_failed") {
          // A recurring charge failed. Stripe will retry, but nudge the member to
          // fix their card. Best-effort — never fail the webhook.
          const invoice = event.data.object as Stripe.Invoice;
          const customerId =
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null;
          let to = invoice.customer_email || "";
          if (!to && customerId) {
            const m = await storage.getMemberByCustomerId(customerId);
            to = m?.email || "";
          }
          if (to) {
            let portalUrl: string | null = null;
            if (customerId) {
              try {
                const portal = await stripe.billingPortal.sessions.create({
                  customer: customerId,
                  return_url: `${APP_BASE_URL}/member-login`,
                });
                portalUrl = portal.url;
              } catch (err) {
                console.error("billingPortal (payment_failed) failed:", err);
              }
            }
            try {
              await sendPaymentFailedEmail(to, portalUrl);
            } catch (err) {
              console.error("sendPaymentFailedEmail failed:", err);
            }
          }
        }
      } catch (err) {
        console.error("Webhook handler error:", err);
        return res.status(500).send("handler error");
      }

      res.json({ received: true });
    }
  );

  app.post("/api/checkout", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe || !STRIPE_PRICE_ID) {
      return res.status(503).json({
        error:
          "Stripe checkout is not yet activated. Please contact support to subscribe.",
      });
    }
    try {
      const email = typeof req.body?.email === "string" ? req.body.email : undefined;
      // Annual if requested and an annual price is configured; else monthly.
      const plan = req.body?.plan === "annual" ? "annual" : "monthly";
      const priceId = plan === "annual" && STRIPE_PRICE_ID_ANNUAL ? STRIPE_PRICE_ID_ANNUAL : STRIPE_PRICE_ID;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${APP_BASE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_BASE_URL}/pricing`,
        customer_email: email,
        allow_promotion_codes: true,
        // Force the price's native currency (USD). Without this, Stripe Adaptive
        // Pricing converts to the visitor's local currency (e.g. ¥ JPY), which
        // mismatched the USD shown on /pricing.
        adaptive_pricing: { enabled: false },
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe checkout error:", err);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/checkout/session", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
    const sessionId = req.query.session_id as string | undefined;
    if (!sessionId) return res.status(400).json({ error: "session_id required" });
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const email =
        session.customer_email ||
        session.customer_details?.email ||
        "";
      if (!email) return res.json({ email: null, telegramInviteLink: null });

      // For a genuinely paid checkout, provision access right here rather than
      // waiting on the async webhook. This makes the welcome page the reliable
      // delivery path: the member + invite are ensured and the link is returned
      // for on-screen display, even if the webhook is slow or its invite failed.
      const isPaid =
        session.payment_status === "paid" || session.status === "complete";
      if (isPaid) {
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id || null;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id || null;
        const { member } = await provisionMemberAccess({
          email,
          customerId,
          subscriptionId,
        });
        // Auto-login: issue a member session so the buyer is signed in on the
        // site immediately, with no magic-link email required. The session_id is
        // only known to whoever completed this checkout, so this is safe.
        let memberToken: string | null = null;
        if (member.status === "active") {
          try {
            const session2 = await createMemberSession(email.toLowerCase());
            memberToken = session2.token;
          } catch (err) {
            console.error("welcome auto-login session failed:", err);
          }
        }
        return res.json({
          email,
          status: member.status,
          telegramInviteLink: member.telegramInviteLink ?? null,
          memberToken,
        });
      }

      const member = await storage.getMemberByEmail(email.toLowerCase());
      res.json({
        email,
        status: member?.status ?? "pending",
        telegramInviteLink: member?.telegramInviteLink ?? null,
      });
    } catch (err) {
      console.error("session lookup error:", err);
      res.status(500).json({ error: "Failed to load session" });
    }
  });

  // Logged-in member opens the Stripe billing portal to manage/cancel/update card.
  app.post(
    "/api/member/portal",
    requireMember,
    async (req: MemberAuthRequest, res: Response) => {
      const stripe = getStripe();
      if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
      try {
        const member = await storage.getMemberByEmail((req.memberEmail || "").toLowerCase());
        if (!member?.stripeCustomerId) {
          return res.status(400).json({ error: "No billing account on file." });
        }
        const portal = await stripe.billingPortal.sessions.create({
          customer: member.stripeCustomerId,
          return_url: `${APP_BASE_URL}/terminal`,
        });
        res.json({ url: portal.url });
      } catch (err) {
        console.error("member portal error:", err);
        res.status(500).json({ error: "Could not open billing portal." });
      }
    },
  );
}
