import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./email";

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

async function createTelegramInvite(): Promise<string | null> {
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
    const data = (await res.json()) as { ok: boolean; result?: { invite_link: string } };
    if (!data.ok || !data.result) return null;
    return data.result.invite_link;
  } catch (err) {
    console.error("Telegram invite link error:", err);
    return null;
  }
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
            const inviteLink = await createTelegramInvite();
            const member = await storage.upsertMember({
              email: email.toLowerCase(),
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: "active",
              telegramInviteLink: inviteLink,
              telegramJoinedAt: null,
            });

            try {
              await sendWelcomeEmail(member, inviteLink);
            } catch (err) {
              console.error("sendWelcomeEmail failed:", err);
            }
          }
        } else if (event.type === "customer.subscription.deleted") {
          const sub = event.data.object as Stripe.Subscription;
          await storage.markMemberInactiveBySubscription(sub.id);
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
}
