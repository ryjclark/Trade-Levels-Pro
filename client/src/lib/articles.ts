export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  date: string;
  dateISO: string;
  readMinutes: number;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "what-is-the-dynamic-zone",
    title: "What Is the Dynamic Zone in ES and NQ Futures?",
    excerpt:
      "The Magnet tells you where. The Dynamic Zone tells you when the market is done deciding. Here's the volatility-scaled band we watch for acceptance and rejection, and exactly how we trade its edges.",
    description:
      "The Dynamic Zone is a volatility-scaled band around the Magnet that frames fair value for the session. Here's what it is, why a band beats a single line, and how we trade acceptance and rejection at its edges on ES and NQ.",
    date: "August 14, 2026",
    dateISO: "2026-08-14",
    readMinutes: 9,
  },
  {
    slug: "es-vs-nq-which-to-trade",
    title: "ES vs NQ: Which Futures Contract Should You Trade?",
    excerpt:
      "They look similar and often move together, but ES and NQ reward different temperaments and punish different mistakes. Tick value, volatility, sizing, and which one fits how you actually trade.",
    description:
      "ES vs NQ compared for level traders: what each tracks, tick size and dollar value, volatility and range, sizing, trading both at once, the micros, and which contract fits your temperament.",
    date: "August 11, 2026",
    dateISO: "2026-08-11",
    readMinutes: 10,
  },
  {
    slug: "the-rejection-short-setup",
    title: "The Rejection Short: Our Secondary Setup Explained",
    excerpt:
      "When the day is heavy and the failed-breakdown long isn't presenting, the rejection short carries the plan. What it is, why it's secondary, and how we frame it as a reaction, not a bearish opinion.",
    description:
      "The rejection short is our secondary setup: price pushes into a defined resistance level, fails to accept above it, and rolls over. Here's why it ranks below the failed-breakdown long and exactly how we trade it on ES and NQ.",
    date: "August 7, 2026",
    dateISO: "2026-08-07",
    readMinutes: 9,
  },
  {
    slug: "how-to-trade-the-daily-plan",
    title: "How to Trade the Daily Plan (Start Here)",
    excerpt:
      "New here? Read this first. Exactly what each part of the daily ES and NQ plan means (Magnet, Dynamic Zone, failed-breakdown longs, rejection shorts) and how to act on it.",
    description:
      "New here? Read this first. Exactly what each part of the daily ES and NQ plan means and how to trade it: the Magnet, Dynamic Zone, failed-breakdown longs, rejection shorts, acceptance, and level-to-level management.",
    date: "August 4, 2026",
    dateISO: "2026-08-04",
    readMinutes: 6,
  },
  {
    slug: "the-failed-breakdown-setup",
    title: "The Failed Breakdown: The Setup Our Daily Plans Are Built Around",
    excerpt:
      "Price flushes below a significant low, traps the sellers, then reclaims it. Here's the pattern, why trapped sellers fuel the reclaim, and how we trade it on ES and NQ.",
    description:
      "Price flushes below a significant low, traps the sellers, then reclaims it. Here's the pattern, why trapped sellers fuel the reclaim, and how we trade the Failed Breakdown on ES and NQ.",
    date: "July 31, 2026",
    dateISO: "2026-07-31",
    readMinutes: 10,
  },
  {
    slug: "acceptance-and-level-to-level",
    title: "Acceptance and Level-to-Level: How We Manage the Trade",
    excerpt:
      "The two disciplines that make the setups work: waiting for acceptance on the entry, then managing level to level on the exit. The same on ES and NQ.",
    description:
      "The two disciplines that make our setups work: waiting for acceptance on the entry, then banking the first target and trailing a runner level to level on the exit, on ES and NQ.",
    date: "July 28, 2026",
    dateISO: "2026-07-28",
    readMinutes: 9,
  },
  {
    slug: "what-is-a-magnet-level-es-futures",
    title: "What Is a Magnet Level in ES Futures Trading?",
    excerpt:
      "A Magnet level is the price ES tends to gravitate toward intraday. Here's how it's identified, why it works, and how to trade it without getting trapped.",
    description:
      "A Magnet level is the price ES tends to gravitate toward intraday. Here's how it's identified, why it works, and how to trade it without getting trapped.",
    date: "July 24, 2026",
    dateISO: "2026-07-24",
    readMinutes: 10,
  },
  {
    slug: "prop-firm-traders-support-resistance",
    title: "How Prop Firm Traders Use Support and Resistance to Pass Evaluations",
    excerpt:
      "Prop firm evaluations punish over-trading and drawdown. Here's the level-based playbook serious evaluators use to survive and pass.",
    description:
      "Prop firm evaluations punish over-trading and drawdown. Here's the level-based playbook serious evaluators use to survive and pass.",
    date: "July 17, 2026",
    dateISO: "2026-07-17",
    readMinutes: 11,
  },
  {
    slug: "building-a-daily-es-trade-plan-template",
    title: "How We Build the Daily ES and NQ Trade Plan",
    excerpt:
      "Our exact evening process for both contracts: mark the Magnet and Dynamic Zone, map the structure and ranked reaction levels, set a bias, then write the ranked Failed-Breakdown longs and secondary rejection shorts.",
    description:
      "Our exact evening process for building the next day's ES and NQ plan: the Magnet and Dynamic Zone, the structure and ranked detected levels, a conditional bias, and the ranked Failed-Breakdown longs with acceptance and level-to-level management, plus secondary rejection shorts.",
    date: "July 10, 2026",
    dateISO: "2026-07-10",
    readMinutes: 10,
  },
];

export function getArticle(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
