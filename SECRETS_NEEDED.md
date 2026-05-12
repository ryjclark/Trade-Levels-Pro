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

## Pass 6 additions

- `ALGORITHM_INGEST_API_KEY` — Bearer token your external algorithm sends
  with every `POST /api/levels/ingest` request. Generate a long random
  string (e.g. `openssl rand -hex 32`) and paste it into the Replit
  **Secrets** tab. The endpoint returns `503` while unset and `401` for
  any mismatch (timing-safe comparison). Rotate by replacing the value
  in Replit Secrets and restarting the workflow — the key is never
  stored in the database.

  **Endpoint:** `POST https://<your-deployment>/api/levels/ingest`
  **Auth header:** `Authorization: Bearer <ALGORITHM_INGEST_API_KEY>`
  **Body** (`application/json`):

  ```json
  {
    "symbol": "ES",
    "target_date": "2026-05-13",
    "current_price": 7438.75,
    "dynamic_zone_high": 7454.75,
    "dynamic_zone_low": 7410.00,
    "magnet": 7438.75,
    "r1": 7445.75, "r2": 7454.75, "r3": null, "r4": null,
    "s1": 7434.75, "s2": 7427.46, "s3": 7410.00, "s4": 7345.60,
    "algorithm_version": "v1.1"
  }
  ```

  Behaviour:
  - Upserts on `(target_date, symbol)` with `source="algorithm"`.
  - When **Algorithm auto-send** is on (Settings page, default ON), the
    plan is immediately formatted with `formatTelegramPro`, prefixed with
    `🤖 Algorithm <version>`, and sent to Telegram. Status flips to
    `published` on success or `publish_failed` on error.
  - When auto-send is off, the row stays `draft` and can be fired with
    the **Resend** button on the new "Algorithm Levels" panel of the
    admin dashboard.
  - Algorithm-sourced rows are hidden from the public archive
    (`/archive`) until you flip the filter in `listPublicPlans`.
  - Rate limit: 30 requests/minute per IP.

## Pass 5 additions

- `TV_WEBHOOK_SECRET` — shared secret for the TradingView alert webhook.
  Set this to a long random string and include it as the `X-TV-Secret`
  header in every TradingView alert that targets `POST /api/tv-webhook`.
  When unset the endpoint returns `503` so it's safe to leave blank in dev.
- `CLARITY_PROJECT_ID` — Microsoft Clarity project ID. Read by the server
  and exposed via `GET /api/public/site-config`; the frontend lazy-loads
  the Clarity tag only when this is present. Skip entirely to disable.

### TradingView alert message example

```json
{
  "date": "{{time}}",
  "symbol": "ES",
  "contract": "ESM26",
  "magnet": 5872,
  "dynamicZoneTop": 5880,
  "dynamicZoneBottom": 5864,
  "r1": 5894, "r2": 5908, "r3": 5926, "r4": 5945,
  "s1": 5856, "s2": 5840, "s3": 5821, "s4": 5802,
  "bias": "Neutral · upside lean",
  "setup1": "Long failed breakdown of S1",
  "setup2": "Short rejection at R2"
}
```

In TradingView, set the alert webhook URL to
`https://tradelevelspro.com/api/tv-webhook` and add the custom HTTP header
`X-TV-Secret: <your TV_WEBHOOK_SECRET value>` (TradingView Pro+ supports
custom headers — otherwise put the secret in the JSON body and read it
server-side instead).
