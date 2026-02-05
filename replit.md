# Trade Levels Pro

## Overview
Trade Levels Pro is a daily trade planning system for ES (E-mini S&P 500) and NQ (E-mini Nasdaq) futures. It provides a professional admin dashboard for creating, managing, and publishing daily trade plans with key levels including:
- Dynamic Zone (DZ) Top and Bottom
- Magnet level
- Resistance levels (R1-R4)
- Support levels (S1-S4)
- Trading bias and setups

## Features
- **Password-protected Admin Dashboard**: Secure access with session-based authentication
- **Daily Plan Management**: Create, edit, and save trade plans as drafts
- **Telegram Publishing**: Publish plans directly to Telegram with one click
- **Substack Formatting**: Copy formatted plans for Substack newsletters
- **Archive System**: View historical plans with full details and publish logs
- **Dark/Light Mode**: Toggle between themes

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
- `POST /api/auth/login` - Admin login
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/logout` - Logout
- `GET /api/plans` - List all plans
- `GET /api/plans/lookup?date=&symbol=` - Get plan by date and symbol
- `GET /api/plans/:id` - Get plan by ID
- `GET /api/plans/:id/logs` - Get publish logs for a plan
- `POST /api/plans/save` - Save plan as draft
- `POST /api/plans/publish` - Save and publish to Telegram
- `POST /api/telegram/test` - Send test message to Telegram

## Development
Run `npm run dev` to start the development server on port 5000.

## Database
Run `npm run db:push` to sync the database schema.
