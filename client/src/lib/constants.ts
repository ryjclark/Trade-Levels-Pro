export const PRICE = "$49";
export const PRICE_PER_MONTH = "$49/month";
export const PRICE_ANNUAL = "$490";
export const PRICE_ANNUAL_PER_YEAR = "$490/year";
export const ANNUAL_SAVINGS_LABEL = "Save $98 · 2 months free";

export const CTA_TEXT = "Subscribe";
export const CTA_MAILTO =
  "mailto:contact@tradelevelspro.com?subject=Founding%20Member%20Signup";
export const CTA_MAILTO_ANNUAL =
  "mailto:contact@tradelevelspro.com?subject=Founding%20Member%20Annual%20Signup";

export const CONTACT_EMAIL = "contact@tradelevelspro.com";
export const TAGLINE = "Trade Smarter. React to Price. No Predictions.";

export const SITE_URL = "https://tradelevelspro.com";
export const SITE_NAME = "Trade Levels Pro";
export const OG_DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

/**
 * Affiliate placeholders. Swap each `ref` value for the real affiliate code
 * when ready. The order here is also the display order on /prop-firms.
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
