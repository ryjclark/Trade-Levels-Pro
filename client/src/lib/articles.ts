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
    slug: "what-is-a-magnet-level-es-futures",
    title: "What Is a Magnet Level in ES Futures Trading?",
    excerpt:
      "A Magnet level is the price ES tends to gravitate toward intraday. Here's how it's identified, why it works, and how to trade it without getting trapped.",
    description:
      "A Magnet level is the price ES tends to gravitate toward intraday. Here's how it's identified, why it works, and how to trade it without getting trapped.",
    date: "May 8, 2026",
    dateISO: "2026-05-08",
    readMinutes: 10,
  },
  {
    slug: "prop-firm-traders-support-resistance",
    title: "How Prop Firm Traders Use Support and Resistance to Pass Evaluations",
    excerpt:
      "Prop firm evaluations punish over-trading and drawdown. Here's the level-based playbook serious evaluators use to survive and pass.",
    description:
      "Prop firm evaluations punish over-trading and drawdown. Here's the level-based playbook serious evaluators use to survive and pass.",
    date: "May 5, 2026",
    dateISO: "2026-05-05",
    readMinutes: 11,
  },
  {
    slug: "building-a-daily-es-trade-plan-template",
    title: "How to Build a Daily ES Trade Plan (The Exact Template I Use)",
    excerpt:
      "The template I use every evening to build the next day's ES plan: Magnet, Dynamic Zone, S/R ladder, bias, and 1–2 setups. Steal it.",
    description:
      "The template I use every evening to build the next day's ES plan: Magnet, Dynamic Zone, S/R ladder, bias, and 1–2 setups. Steal it.",
    date: "May 1, 2026",
    dateISO: "2026-05-01",
    readMinutes: 10,
  },
];

export function getArticle(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
