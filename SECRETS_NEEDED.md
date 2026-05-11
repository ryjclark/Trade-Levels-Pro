# Secrets Needed

Add these via the Replit **Secrets** tab. None of the Stripe/Email features
will activate until both groups are populated. Until then the public site
keeps the existing `mailto:` CTA — Stripe checkout and Resend email run in
inert / dev-log mode.

## Already configured

- `ADMIN_PASSWORD` — admin login password
- `SESSION_SECRET` — server session signing secret
- `TELEGRAM_BOT_TOKEN` — Telegram bot token (also used to mint one-time
  invite links via `createChatInviteLink`)
- `TELEGRAM_CHAT_ID` — private channel chat ID
- `DATABASE_URL` — auto-managed by Replit Postgres

## Stripe (required to activate paid checkout)

- `STRIPE_SECRET_KEY` — `sk_live_…` from Stripe dashboard → Developers → API keys
- `STRIPE_PUBLISHABLE_KEY` — `pk_live_…` (only needed if you later switch the
  pricing CTA to Stripe Elements / client-side; not required for hosted
  Checkout)
- `STRIPE_PRICE_ID` — `price_…` for the $25/month Founding Members plan
- `STRIPE_WEBHOOK_SECRET` — `whsec_…` from Stripe webhook endpoint settings.
  Endpoint to register: `POST https://tradelevelspro.com/stripe/webhook`,
  events: `checkout.session.completed`, `customer.subscription.deleted`

When all four are set, swap the `CTA_MAILTO` constant in
`client/src/lib/constants.ts` (or call `POST /api/checkout` and redirect to
the returned `url`) to flip the site over to live checkout.

## Email — Resend (optional in dev)

- `RESEND_API_KEY` — `re_…` from https://resend.com → API Keys
- `EMAIL_FROM` — sender, e.g. `Trade Levels Pro <noreply@tradelevelspro.com>`
  (the domain must be verified in Resend)

When `RESEND_API_KEY` is missing the email helpers in `server/email.ts`
log the message body to the server console instead of sending — safe for
local development.

## Optional

- `APP_BASE_URL` — defaults to `https://tradelevelspro.com`. Override only if
  testing checkout against a non-production host.
