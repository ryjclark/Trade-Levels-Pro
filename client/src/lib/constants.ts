export const PRICE = "$49";
export const PRICE_PER_MONTH = "$49/month";
export const PRICE_ANNUAL = "$490";
export const PRICE_ANNUAL_PER_YEAR = "$490/year";
export const ANNUAL_SAVINGS_LABEL = "Save $98 · 2 months free";

export const CTA_TEXT = "Subscribe";
export const CTA_MAILTO =
  "mailto:contact@tradelevelspro.com?subject=Trade%20Levels%20Pro%20Monthly%20Signup";
export const CTA_MAILTO_ANNUAL =
  "mailto:contact@tradelevelspro.com?subject=Trade%20Levels%20Pro%20Annual%20Signup";

export const CONTACT_EMAIL = "contact@tradelevelspro.com";
export const TAGLINE = "Trade Smarter. React to Price. No Predictions.";

export const SITE_URL = "https://tradelevelspro.com";
export const SITE_NAME = "Trade Levels Pro";
export const OG_DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

/**
 * Prop firm list shown on /prop-firms, in display order.
 *
 * AFFILIATE: the `url` field is the affiliate slot. Replace each firm's homepage
 * URL below with your real affiliate / referral link once you have it from that
 * firm's affiliate program (see ~/Desktop/prop-firm-affiliate-checklist.md).
 * Links already carry rel="sponsored" and the page shows an affiliate
 * disclosure, so this is the only change needed to monetize them.
 */
export interface PropFirm {
  slug: string;
  name: string;
  tagline: string;
  accountSizes: string;
  pros: string[];
  cons: string[];
  url: string;
}

export const PROP_FIRMS: PropFirm[] = [
  {
    slug: "topstep",
    name: "Topstep",
    tagline: "The original prop firm. Strong reputation, transparent rules.",
    accountSizes: "$50K – $150K",
    pros: [
      "Long-running track record and established support",
      "Simple, well-documented rule set",
      "Live trading once funded with profit-split payouts",
    ],
    cons: ["Daily loss limit and trailing drawdown require strict risk control"],
    url: "https://www.topstep.com/",
  },
  {
    slug: "lucid-trading",
    name: "Lucid Trading",
    tagline: "CME futures firm with flexible routes and fast, frequent payouts.",
    accountSizes: "$25K – $150K",
    pros: [
      "Multiple routes (Flex, Pro, Direct) to match your risk style",
      "LucidFlex funded accounts have no daily loss limit and no consistency rule",
      "Keep 100% of your first $10K in payouts, then a 90/10 split, with daily payout requests",
    ],
    cons: ["Pro and Direct routes add consistency and buffer requirements"],
    url: "https://lucidtrading.com/",
  },
  {
    slug: "take-profit-trader",
    name: "Take Profit Trader",
    tagline: "One-step evaluation with on-demand payouts from day one of funded.",
    accountSizes: "$25K – $150K",
    pros: [
      "Simple one-step evaluation with a single profit target",
      "PRO accounts can withdraw on demand, starting day one",
      "Upgrade to PRO+ for a 90/10 split after $5K in profit",
    ],
    cons: ["A maximum trailing drawdown applies through the funded PRO stage"],
    url: "https://takeprofittrader.com/",
  },
  {
    slug: "apex-trader-funding",
    name: "Apex Trader Funding",
    tagline: "Aggressive payout splits and frequent promo discounts.",
    accountSizes: "$25K – $300K",
    pros: [
      "High profit splits (up to 90% after first payout)",
      "Up to 20 accounts per trader",
      "Frequent reset and discount promotions",
    ],
    cons: [
      "Trailing drawdown is strict and can catch new traders",
      "Some news-trading restrictions",
    ],
    url: "https://apextraderfunding.com/",
  },
  {
    slug: "myfundedfutures",
    name: "MyFundedFutures",
    tagline: "One-step evaluation with simplified rules.",
    accountSizes: "$50K – $150K",
    pros: [
      "One-step evaluation, no consistency rule on Starter accounts",
      "Same-day account activation",
      "Multiple plan tiers (Starter, Expert, Milestone)",
    ],
    cons: ["Newer firm — shorter operating history than legacy names"],
    url: "https://myfundedfutures.com/",
  },
  {
    slug: "tradeify",
    name: "Tradeify",
    tagline: "Flexible plans with both 1-step and standard challenges.",
    accountSizes: "$25K – $150K",
    pros: [
      "Multiple challenge formats including instant-funded options",
      "Clear payout schedule",
      "Trader-friendly platform support",
    ],
    cons: ["Smaller community and fewer reviews to reference"],
    url: "https://tradeify.co/",
  },
  {
    slug: "earn2trade",
    name: "Earn2Trade",
    tagline: "Education-first prop with structured course material.",
    accountSizes: "$25K – $200K",
    pros: [
      "Strong included education content (Bootcamp, Trader Career Path)",
      "Predictable, well-defined evaluation",
      "Live broker setup with established partners",
    ],
    cons: ["Slower payout cycles than newer competitors"],
    url: "https://www.earn2trade.com/",
  },
  {
    slug: "the-trading-pit",
    name: "The Trading Pit",
    tagline: "Multi-asset prop with tight rule transparency.",
    accountSizes: "$5K – $200K",
    pros: [
      "Wider asset coverage (futures, FX, equities CFDs)",
      "Scaling plan documented up front",
      "EU-based, regulated parent entity",
    ],
    cons: ["Lower starting position sizes vs. US-focused futures props"],
    url: "https://www.thetradingpit.com/",
  },
  {
    slug: "tick-tick-trader",
    name: "TickTick Trader",
    tagline: "Futures-focused prop with simple two-step evaluations.",
    accountSizes: "$25K – $150K",
    pros: [
      "Clean, easy-to-understand rule set",
      "Reasonable trailing drawdown structure",
      "Responsive support team",
    ],
    cons: ["Smaller account ladder vs. larger competitors"],
    url: "https://www.tickticktrader.com/",
  },
  {
    slug: "bulenox",
    name: "Bulenox",
    tagline: "Discount-friendly prop with fast activation.",
    accountSizes: "$10K – $250K",
    pros: [
      "Frequent promo pricing on evaluations",
      "Quick-start plans with same-day funding paths",
      "Multiple platform options",
    ],
    cons: ["Newer brand — do your own due diligence on payout history"],
    url: "https://bulenox.com/",
  },
];
