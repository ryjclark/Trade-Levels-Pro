// Per-route <head> meta + HTTP status for the SPA shell.
//
// The client is a single-page app, so without this every URL would return the
// SAME index.html with the homepage title + canonical="/" and a 200 status
// (a "soft 404"). This module injects the correct title/description/canonical/
// og:url per route and returns a real 404 for unknown paths, which is what
// crawlers need. Keep the route lists in sync with client/src/App.tsx.

const SITE = "https://tradelevelspro.com";

export interface RouteMeta {
  title: string;
  description: string;
  noindex?: boolean;
}

const DEFAULT_DESC =
  "Daily ES and NQ futures trade plans with Magnet, Dynamic Zone, and a full S/R ladder, delivered to Telegram and the on-site terminal after the close.";

// Exact-path routes.
const STATIC: Record<string, RouteMeta> = {
  "/": {
    title: "Trade Levels Pro: Daily ES and NQ Futures Trade Plans",
    description: DEFAULT_DESC,
  },
  "/pricing": {
    title: "Pricing | Trade Levels Pro",
    description:
      "Simple monthly or annual access to the daily ES and NQ trade plans, the on-site terminal, and the TradingView levels indicator. Cancel anytime.",
  },
  "/sample": {
    title: "Sample Daily Plan | Trade Levels Pro",
    description:
      "See a real, redacted Trade Levels Pro daily plan: bias, Magnet, Dynamic Zone, and the full support and resistance ladder for ES and NQ.",
  },
  "/how-it-works": {
    title: "How It Works | Trade Levels Pro",
    description:
      "How the daily ES and NQ trade plans are built and delivered: levels after the cash close, to Telegram and the on-site terminal, plus a TradingView indicator.",
  },
  "/track-record": {
    title: "Track Record | Trade Levels Pro",
    description:
      "A running record of how the published daily ES and NQ levels performed, measured from each session's open, high, low, and close.",
  },
  "/prop-firms": {
    title: "For Prop Firm Traders | Trade Levels Pro",
    description:
      "Daily ES and NQ levels built for prop firm rules: clear entries, targets, and invalidation to help you trade within drawdown and consistency limits.",
  },
  "/learn": {
    title: "Learn | Trade Levels Pro",
    description:
      "Guides on trading the daily plan: the Dynamic Zone, Magnet levels, rejection and failed-breakdown setups, and level-to-level trading for ES and NQ.",
  },
  "/about": {
    title: "About | Trade Levels Pro",
    description:
      "What Trade Levels Pro is and who it's for: daily, educational ES and NQ futures trade plans for active and prop firm traders.",
  },
  "/archive": {
    title: "Plan Archive | Trade Levels Pro",
    description: "Browse past published daily ES and NQ trade plans and levels.",
  },
  "/brief": {
    title: "Daily Brief | Trade Levels Pro",
    description: "A quick look at today's ES and NQ levels and bias.",
  },
  "/terminal": {
    title: "Today's Plan | Trade Levels Pro",
    description:
      "The live daily ES and NQ trade plan: bias, Magnet, Dynamic Zone, the support and resistance ladder, and the TradingView levels indicator for members.",
  },
  "/terms": {
    title: "Terms of Service | Trade Levels Pro",
    description: "The terms that govern your use of Trade Levels Pro.",
  },
  "/privacy": {
    title: "Privacy Policy | Trade Levels Pro",
    description: "How Trade Levels Pro collects and uses your information.",
  },
  "/risk": {
    title: "Risk Disclaimer | Trade Levels Pro",
    description:
      "Trading futures involves substantial risk. Trade Levels Pro is educational content only, not investment advice.",
  },
  "/refund": {
    title: "Refund Policy | Trade Levels Pro",
    description: "How billing, cancellations, and refunds work at Trade Levels Pro.",
  },
  // Utility / auth pages — valid routes, but should not be indexed.
  "/member-login": { title: "Member Login | Trade Levels Pro", description: "Log in to your Trade Levels Pro subscription.", noindex: true },
  "/member-auth": { title: "Signing you in | Trade Levels Pro", description: "Completing your Trade Levels Pro login.", noindex: true },
  "/account": { title: "Your Account | Trade Levels Pro", description: "Manage your Trade Levels Pro subscription.", noindex: true },
  "/welcome": { title: "Welcome | Trade Levels Pro", description: "Your Trade Levels Pro subscription is active.", noindex: true },
  "/login": { title: "Admin Login | Trade Levels Pro", description: "", noindex: true },
  "/indicator": { title: "Trade Levels Pro", description: DEFAULT_DESC, noindex: true },
};

// Learn article slugs → human title.
const ARTICLES: Record<string, string> = {
  "what-is-the-dynamic-zone": "What Is the Dynamic Zone?",
  "es-vs-nq-which-to-trade": "ES vs NQ: Which to Trade",
  "the-rejection-short-setup": "The Rejection Short Setup",
  "how-to-trade-the-daily-plan": "How to Trade the Daily Plan",
  "the-failed-breakdown-setup": "The Failed Breakdown Setup",
  "acceptance-and-level-to-level": "Acceptance and Level-to-Level Trading",
  "what-is-a-magnet-level-es-futures": "What Is a Magnet Level? (ES Futures)",
  "prop-firm-traders-support-resistance": "Support and Resistance for Prop Firm Traders",
  "building-a-daily-es-trade-plan-template": "Building a Daily ES Trade Plan Template",
};

export interface ResolvedMeta {
  meta: RouteMeta;
  status: number;
  canonical: string;
}

export function resolveRouteMeta(rawPath: string): ResolvedMeta {
  const path = rawPath.replace(/\/+$/, "") || "/";

  if (STATIC[path]) {
    return { meta: STATIC[path], status: 200, canonical: SITE + path };
  }

  // Any /learn/<slug> is treated as a real article (200) so a newly-published
  // article can never accidentally 404; known slugs get a specific title.
  const article = path.match(/^\/learn\/([a-z0-9-]+)$/);
  if (article) {
    const known = ARTICLES[article[1]];
    return {
      meta: {
        title: known ? `${known} | Trade Levels Pro` : "Learn | Trade Levels Pro",
        description: "A Trade Levels Pro guide on trading the daily ES and NQ plan.",
      },
      status: 200,
      canonical: SITE + path,
    };
  }

  const plan = path.match(/^\/p\/(\d+)$/);
  if (plan) {
    return {
      meta: {
        title: "Daily ES and NQ Trade Plan | Trade Levels Pro",
        description:
          "A published daily trade plan with bias, Magnet, Dynamic Zone, and the full support and resistance ladder.",
      },
      status: 200,
      canonical: SITE + path,
    };
  }

  // Admin app routes are valid but private.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return {
      meta: { title: "Admin | Trade Levels Pro", description: "", noindex: true },
      status: 200,
      canonical: SITE + path,
    };
  }

  // Anything else is a genuine 404.
  return {
    meta: {
      title: "Page not found | Trade Levels Pro",
      description: "That page does not exist.",
      noindex: true,
    },
    status: 404,
    canonical: SITE + path,
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Rewrites the <head> of the built index.html for a given path and returns the
 *  HTML plus the HTTP status the response should carry. */
export function renderIndexForPath(baseHtml: string, rawPath: string): { html: string; status: number } {
  const { meta, status, canonical } = resolveRouteMeta(rawPath);
  const title = esc(meta.title);
  const desc = esc(meta.description);

  let html = baseHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);

  if (meta.noindex && !/name="robots"/.test(html)) {
    html = html.replace(/<\/head>/, `    <meta name="robots" content="noindex,follow" />\n  </head>`);
  }

  return { html, status };
}
