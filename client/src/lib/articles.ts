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
