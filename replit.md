# Trade Levels Pro

## Overview
Trade Levels Pro is a daily trade planning system for ES (E-mini S&P 500) and NQ (E-mini Nasdaq) futures. It provides a professional admin dashboard for creating, managing, and publishing daily trade plans with key levels including:
- Dynamic Zone (DZ) Top and Bottom
- Magnet level
- Resistance levels (R1-R4)
- Support levels (S1-S4)
- Trading bias and setups

## Features
- **Password-protected Admin Dashboard**: Secure access with token-based authentication
- **Daily Plan Management**: Create, edit, and save trade plans as drafts
- **PRO Tier System**: Single "Publish to Telegram" button for PRO tier (R1-R4, S1-S4)
- **Telegram Publishing**: Publish plans directly to Telegram with variant tracking
- **Archive System**: View historical plans with publish logs
- **Admin Settings**: Configure social links, pricing text, and optional Telegram footer
- **Public Marketing Pages**: Home, About, Pricing, Subscribe pages with InviteMember payment integration
- **Brand Design**: Dark theme (#0c1117) with teal/cyan accents (#2dd4bf), Inter font
- **Health Check Endpoint**: GET /api/health for monitoring

## Brand
- Colors: Dark background (#0c1117), teal/cyan accent (#2dd4bf), white text
- Logo: /images/logo-square.webp (square), /images/logo-banner.jpg (wide)
- Tagline: "Trade Smart. React to Price. No Predictions."
- Payment URL: https://im.page/tradelevelspro
- Price: $20/month (Founding Members)

## Tech Stack
- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Custom CSS for public pages, Tailwind for admin

## Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── pages/          # Page components
│       ├── login.tsx   # Admin login page
│       ├── admin.tsx   # Main admin dashboard
│       ├── archive.tsx # Plan archive list
│       ├── archive-detail.tsx # Individual plan details
│       ├── settings.tsx # Admin settings
│       ├── public-home.tsx # Marketing homepage
│       ├── public-about.tsx # About page
│       ├── public-pricing.tsx # Pricing page with FAQ
│       ├── public-subscribe.tsx # Subscribe/checkout page
│       ├── public-trackrecord.tsx # Track record (coming soon)
│       └── public.css  # Shared public page styles
├── public/
│   └── images/         # Brand logos and assets
server/
├── db.ts               # Database connection
├── storage.ts          # Data access layer
├── routes.ts           # API endpoints
├── telegram.ts         # Telegram API integration
├── formatter.ts        # Plan formatting utilities
└── seed.ts             # Database seeding
shared/
└── schema.ts           # Database schema and types
```

## Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_PASSWORD`: Password for admin access
- `SESSION_SECRET`: Secret for session encryption
- `TELEGRAM_BOT_TOKEN`: Telegram bot token from @BotFather
- `TELEGRAM_CHAT_ID`: Target Telegram chat/channel ID
- `ALGORITHM_INGEST_API_KEY`: Bearer token for `POST /api/levels/ingest` (Pass 6)
- `ANTHROPIC_API_KEY`: Anthropic API key for the Newsletter Parser (Pass 7). When unset, `/api/admin/parse-newsletter` returns 503.

## API Endpoints
- `GET /api/health` - Health check endpoint
- `POST /api/auth/login` - Admin login
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/logout` - Logout
- `GET /api/plans` - List all plans
- `GET /api/plans/lookup?date=&symbol=` - Get plan by date and symbol
- `GET /api/plans/:id` - Get plan by ID
- `GET /api/plans/:id/logs` - Get publish logs for a plan
- `POST /api/plans/:id/republish` - Republish plan to Telegram
- `POST /api/plans/save` - Save plan (action: "save" | "publish_pro")
- `POST /api/telegram/test` - Send test message to Telegram
- `GET /api/settings` - Get admin settings (protected)
- `POST /api/settings` - Update admin settings (protected)
- `GET /api/public/settings` - Get public settings (joinUrl, substackUrl, xUrl, priceText)
- `POST /api/levels/ingest` - **Algorithm ingest** (Bearer auth via `ALGORITHM_INGEST_API_KEY`). Upserts ES/NQ levels by `(target_date, symbol)` with `source="algorithm"`; auto-sends to Telegram with a `🤖 Algorithm vX.Y` prefix when the auto-send setting is on. Rate-limited 30/min.
- `GET /api/admin/algorithm-plans` - Recent algorithm-sourced plans (admin only).
- `GET /api/admin/ingest-key` - Reveal the configured ingest key for the admin Settings page (admin only).
- `POST /api/admin/parse-newsletter` - **Newsletter Parser** (Pass 7, admin only, 20/min/token). Sends pasted newsletter text to Claude (`claude-sonnet-4-6`) via tool-use API and returns a structured plan plus `claude_api_call_id`, cost, and token usage. Returns 503 when `ANTHROPIC_API_KEY` is unset.
- `POST /api/admin/save-parsed-plan` - Persist the reviewed AI plan with `source="ai_parsed"`. Optionally sends to Telegram with the AI template. Returns **409** when a non-`ai_parsed` plan exists for the same `(date, symbol)`; client retries with `force_overwrite: true`.
- `GET /api/admin/claude-usage?days=30` - Aggregate cost / success-rate stats for the Claude usage card.

## Pass 7: Newsletter Parser
- New admin page at `/admin/parse-newsletter`.
- Public archive visibility is gated by `PUBLIC_PLAN_SOURCES` in `shared/constants.ts` (currently `["manual"]`); flip there to expose `ai_parsed` rows publicly.
- Republish dispatches the formatter by `plan.source` (`manual` → `formatManualPlan`, `algorithm` → `formatAlgorithmPlan`, `ai_parsed` → `formatAiParsedPlan`).
- Tests: `npm test` runs Vitest against the dev DB. Tests use a mock Claude client; no live API calls.

## Navigation (Public)
Home | About | Pricing | Subscribe

## Development
Run `npm run dev` to start the development server on port 5000.

## Database
Run `npm run db:push` to sync the database schema.
