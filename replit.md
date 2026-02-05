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
- **Free/Pro Tier System**: Separate publishing for Free (R1-R2, S1-S2) and Pro (R1-R4, S1-S4) tiers
- **Dual Publish Buttons**: Publish FREE or PRO versions to Telegram independently
- **Four Preview Panels**: See Telegram and Substack previews for both Free and Pro tiers
- **Telegram Publishing**: Publish plans directly to Telegram with variant tracking
- **Substack Formatting**: Copy formatted plans for Substack newsletters (Free and Pro versions)
- **Archive System**: View historical plans with tier badges and variant-tracked publish logs
- **Admin Settings**: Configure join URL, social links, pricing text, and optional Telegram footer
- **Public Marketing Pages**: Home, Pricing, Track Record, and About pages for marketing funnel
- **Dark/Light Mode**: Toggle between themes
- **Health Check Endpoint**: GET /api/health for monitoring

## Tech Stack
- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with custom design tokens

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
│       └── archive-detail.tsx # Individual plan details
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

## API Endpoints
- `GET /api/health` - Health check endpoint
- `POST /api/auth/login` - Admin login
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/logout` - Logout
- `GET /api/plans` - List all plans
- `GET /api/plans/lookup?date=&symbol=` - Get plan by date and symbol
- `GET /api/plans/:id` - Get plan by ID
- `GET /api/plans/:id/logs` - Get publish logs for a plan
- `POST /api/plans/:id/republish` - Republish plan to Telegram (accepts variant: "free" | "pro")
- `POST /api/plans/save` - Save plan (action: "save" | "publish_free" | "publish_pro")
- `POST /api/telegram/test` - Send test message to Telegram
- `GET /api/settings` - Get admin settings (protected)
- `POST /api/settings` - Update admin settings (protected)
- `GET /api/public/settings` - Get public settings (joinUrl, substackUrl, xUrl, priceText)

## Development
Run `npm run dev` to start the development server on port 5000.

## Database
Run `npm run db:push` to sync the database schema.
