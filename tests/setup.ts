// Vitest setup: ensure the suite uses a real DATABASE_URL or fails loudly.
// We deliberately do NOT mock the database — the source-filter behavior we
// care about lives in a real Postgres query.
import { beforeAll } from "vitest";

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set to run tests");
  }
  // Tests do not need a real Anthropic key — they inject a mock client.
  // Setting this guard avoids the early ClaudeApiKeyMissingError when the
  // mock factory is in use.
  if (!process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = "test-mock-key";
  }
  // Pass 8: ensure admin credential is seeded so /api/auth/login works in tests.
  // Tests share the dev DB; we always (re)seed to whatever ADMIN_PASSWORD test
  // env value is in effect so the suite is hermetic regardless of prior state.
  if (!process.env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD = "test-admin-password";
  }
  const { setAdminPassword } = await import("../server/auth");
  await setAdminPassword(process.env.ADMIN_PASSWORD);
});
