// Sources whose plans are visible on the public archive (`/archive`) and
// returned by `GET /api/public/archive`. Add `"ai_parsed"` (or `"algorithm"`)
// here later to expose those rows publicly. This is the only place to flip;
// keep it in sync with the validation phase strategy.
export const PUBLIC_PLAN_SOURCES = ["manual", "algorithm"] as const;
export type PublicPlanSource = (typeof PUBLIC_PLAN_SOURCES)[number];

export const PLAN_SOURCES = ["manual", "algorithm", "ai_parsed"] as const;
export type PlanSource = (typeof PLAN_SOURCES)[number];
