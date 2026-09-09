import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Idempotently ensure aux tables exist. The deploy pipeline runs no migrations,
// so any NEW table must be self-created on boot. Safe to run every start; only
// touches new tables, never the existing members/plans schema.
export async function ensureAuxTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member_email_prefs (
      email text PRIMARY KEY,
      daily_email boolean NOT NULL DEFAULT true,
      last_emailed_date text,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS telegram_members (
      email text PRIMARY KEY,
      telegram_user_id text NOT NULL,
      joined_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member_access_expiry (
      email text PRIMARY KEY,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}
