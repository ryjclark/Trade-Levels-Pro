// Per-route <head> meta + HTTP status for the SPA shell.
//
// The client is a single-page app, so without this every URL would return the
// SAME index.html with the homepage title + canonical="/" and a 200 status
// (a "soft 404"). This module injects the correct title/description/canonical/
// og:url per route and returns a real 404 for unknown paths, which is what
// crawlers need. Keep the route lists in sync with client/src/App.tsx.

import { ARTICLES as LEARN_ARTICLES } from "../client/src/lib/articles";
import { PRERENDER_ARTICLE_BODIES } from "./prerender-articles";
import { getProofSnapshot } from "./proof-cache";

const SITE = "https://tradelevelspro.com";

// Real article metadata (title/excerpt/description) shared with the hydrated
// /learn page, used to build the SSR hub index and per-article meta.
const LEARN_BY_SLUG = new Map(LEARN_ARTICLES.map((a) => [a.slug, a]));

export interface RouteMeta {
  title: string;
  description: string;
  noindex?: boolean;
}

const DEFAULT_DESC =
  "Daily ES and NQ futures trade plans with ranked levels, a daily bias, and 1 to 2 setups with clear invalidation, delivered by email and Telegram, with Today's Plan on site after the close.";

// Exact-path routes.
const STATIC: Record<string, RouteMeta> = {
  "/": {
    title: "Trade Levels Pro: Daily ES and NQ Futures Trade Plans",
    description: DEFAULT_DESC,
  },
  "/pricing": {
    title: "Pricing | Trade Levels Pro",
    description:
      "Start a 7-day free trial, then $49/month or $490/year for the daily ES and NQ trade plans, Today's Plan, and an optional TradingView overlay. Cancel anytime.",
  },
  "/sample": {
    title: "Sample Daily Plan | Trade Levels Pro",
    description:
      "See a real, redacted Trade Levels Pro daily plan: bias, ranked levels, failed-breakdown longs, rejection shorts, and the acceptance rule for ES and NQ.",
  },
  "/how-it-works": {
    title: "How It Works | Trade Levels Pro",
    description:
      "How the daily ES and NQ trade plans are built and delivered: levels after the cash close, by email and Telegram and on Today's Plan, plus an optional TradingView overlay you copy in.",
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
  "/tradingview": {
    title: "TradingView Guide | Trade Levels Pro",
    description:
      "How to put the Trade Levels Pro daily ES and NQ levels on your TradingView chart using the optional Pine overlay.",
  },
  "/learn": {
    title: "Learn | Trade Levels Pro",
    description:
      "Guides on trading the daily plan: ranked levels, failed-breakdown and rejection setups, acceptance, and level-to-level trading for ES and NQ.",
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
      "The live daily ES and NQ trade plan: bias, ranked levels, the support and resistance ladder, plus an optional TradingView overlay for members.",
  },
  // Friendly aliases that match the "Today's Plan" name (used in email/Telegram
  // links). They render the same page; noindex keeps /terminal the one indexed URL.
  "/plan": {
    title: "Today's Plan | Trade Levels Pro",
    description:
      "The live daily ES and NQ trade plan: bias, ranked levels, the support and resistance ladder, plus an optional TradingView overlay for members.",
    noindex: true,
  },
  "/todays-plan": {
    title: "Today's Plan | Trade Levels Pro",
    description:
      "The live daily ES and NQ trade plan: bias, ranked levels, the support and resistance ladder, plus an optional TradingView overlay for members.",
    noindex: true,
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
  "/welcome": { title: "Welcome | Trade Levels Pro", description: "Member access. Log in to continue.", noindex: true },
  "/login": { title: "Admin Login | Trade Levels Pro", description: "", noindex: true },
  "/indicator": { title: "Trade Levels Pro", description: DEFAULT_DESC, noindex: true },
};

// Learn article slugs → human title.

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
    const a = LEARN_BY_SLUG.get(article[1]);
    return {
      meta: {
        title: a ? `${a.title} | Trade Levels Pro` : "Learn | Trade Levels Pro",
        description: a
          ? (a.description || a.excerpt)
          : "A Trade Levels Pro guide on trading the daily ES and NQ plan.",
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
          "A published daily trade plan with bias, ranked levels, and the full support and resistance ladder.",
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

// ===== Prerendered body content =====
// The client is pure CSR (createRoot().render), so React CLEARS #root and
// re-renders on mount. That lets us seed #root with real, static HTML for each
// route: crawlers and `curl` (no JS) see genuine content + internal links, and
// users instantly get the React app that replaces it. No hydration mismatch.

const NAV_LINKS: Array<[string, string]> = [
  ["/", "Home"],
  ["/pricing", "Pricing"],
  ["/sample", "Sample plan"],
  ["/prop-firms", "For prop traders"],
  ["/how-it-works", "How it works"],
  ["/track-record", "Track record"],
  ["/learn", "Learn"],
  ["/terminal", "Today's Plan"],
  ["/about", "About"],
];

const ROUTE_BODY: Record<string, { h1: string; paras: string[] }> = {
  "/": {
    h1: "Daily ES and NQ levels for traders who prepare, then react.",
    paras: [
      "Trade Levels Pro publishes a daily ES and NQ futures trade plan after the cash close: ranked reaction levels, a directional bias, and one to two ranked setups (failed-breakdown longs and rejection shorts), each with clear invalidation.",
      "Plans are delivered by email and Telegram and on Today's Plan, with Gold, Crude, and Russell included. $49/month or $490/year, cancel anytime. Educational content only, not investment advice.",
    ],
  },
  "/pricing": {
    h1: "Pricing",
    paras: [
      "Start with a 7-day free trial, then $49 per month, or pay $490 per year. Cancel anytime.",
      "You get the daily ES and NQ trade plan (plus Gold, Crude, and Russell): ranked reaction levels, a daily bias, and ranked failed-breakdown longs plus rejection shorts, delivered by email and Telegram and on Today's Plan. An optional TradingView overlay lets you copy the levels onto your own chart; re-copy when each new plan posts.",
    ],
  },
  "/sample": {
    h1: "Sample daily plan",
    paras: [
      "Illustrative, redacted example of the daily Telegram drop for ES and NQ. Numbers are examples, not live levels.",
      "ES Trade Plan. Bias: Bullish. Failed-breakdown longs (best first): 7,427 flush and reclaim, long toward the first target; 7,399 backup; 7,372 deeper. Rejection shorts (secondary): 7,517 reject and fail, short toward the first target; 7,547. Rule: wait for acceptance, then manage level to level.",
      "You get a separate plan for each market, ES and NQ, every trading day. On Today's Plan you also get the full support and resistance ladder and the live chart.",
    ],
  },
  "/prop-firms": {
    h1: "A daily plan for eval and funded ES and NQ traders",
    paras: [
      "A discipline layer for your prop evaluation or funded account, not signal spam. Every setup has clear invalidation, pre-defined levels give you a reason to wait, and ranked reaction levels give logical level-to-level targets, which is what helps traders stay inside drawdown and consistency rules.",
      "This is not guaranteed funding, not copy trading, not a signal service, and not affiliated with any prop firm. Educational content only. Firms and educators can partner with us for a referral link and sample assets.",
    ],
  },
  "/how-it-works": {
    h1: "How it works",
    paras: [
      "After the cash close each trading day, Trade Levels Pro defines the next session's ranked reaction levels and bias, then publishes the plan by email and Telegram and on Today's Plan so you can prepare before the open and react to price instead of predicting.",
    ],
  },
  "/track-record": {
    h1: "Track record",
    paras: [
      "A running, automatically-scored record of how the published daily ES and NQ levels actually performed, measured from each session's open, high, low, and close, with no cherry-picking.",
      "The headline is the target-hit rate: how often the first upside target was reached. We also report the failed-breakdown reclaim rate, support and resistance tag rates, and the number of sessions counted. These are level-interaction statistics measured from OHLC data, not trading results or account performance, and past performance is not indicative of future results.",
    ],
  },
  "/tradingview": {
    h1: "TradingView guide",
    paras: [
      "Use the optional overlay to put the daily ranked levels on your own TradingView chart.",
      "Open Today's Plan or the levels export, choose Show code, then Copy. Open TradingView, Pine Editor, New, Paste, then Add to chart.",
      "Re-copy after each new plan around 5:30 PM ET. This is not one-click auto-publish: Telegram and Today's Plan remain the primary delivery channels, while TradingView is an optional visual aid.",
    ],
  },
  "/learn": {
    h1: "Learn",
    paras: [
      "Guides on trading the daily plan: ranked levels, failed-breakdown and rejection setups, acceptance, and level-to-level trading for ES and NQ.",
    ],
  },
  "/welcome": {
    h1: "Member access",
    paras: [
      "This page is for after checkout or for signed-in members. Log in to continue.",
    ],
  },
  "/about": {
    h1: "About Trade Levels Pro",
    paras: [
      "Daily, educational ES and NQ futures trade plans for active and prop firm traders, built around a repeatable, level-based process.",
    ],
  },
};

// Route-aware CTA footer. Never self-links the current page: /sample drives to
// paid (Subscribe), /pricing offers the sample only, everything else gets both.
function ctaFooter(path: string): string {
  if (path === "/sample") {
    return (
      `<p>Daily ES and NQ plans by email and Telegram and on Today's Plan. $49/mo or $490/yr. Cancel anytime.</p>` +
      `<p><a href="/pricing">Subscribe</a></p>`
    );
  }
  if (path === "/pricing") {
    return `<p><a href="/sample">See a sample plan</a></p>`;
  }
  if (path === "/welcome") {
    return `<p><a href="/member-login">Log in</a> · <a href="/pricing">See pricing</a></p>`;
  }
  return `<p><a href="/pricing">Subscribe</a> · <a href="/sample">See a sample plan</a></p>`;
}

// Static "How this maps to prop rules" block for the /prop-firms prerender, with
// a deep link to the full guide. Inserted after the intro paragraph.
function propRulesBlock(): string {
  return (
    `<h2>How this maps to prop rules</h2>` +
    `<ul>` +
    `<li>Clear invalidation on every setup so you know when you are wrong and can stop.</li>` +
    `<li>Pre-defined levels give you a reason to wait instead of over-trading the eval.</li>` +
    `<li>Ranked reaction levels give level-to-level targets inside daily loss and consistency limits.</li>` +
    `<li>A discipline layer for ES and NQ, not a signal feed.</li>` +
    `</ul>` +
    `<p>Read the guide: <a href="/learn/prop-firm-traders-support-resistance">How prop firm traders use support and resistance to pass evaluations</a></p>`
  );
}

// Read-only proof numbers for the /track-record prerender, from the shared
// in-memory snapshot (default ES+NQ "ALL" view). Returns "" if the snapshot is
// cold or has no scored sessions, so the prerender keeps its static fallback.
// Never throws, never awaits, never recomputes.
function trackRecordProof(): string {
  try {
    const snap = getProofSnapshot();
    const v = snap?.bySymbol?.ALL;
    if (!snap || !v || !v.scored) return "";
    const pct = (x: number | null | undefined) => (x == null ? null : `${x}%`);
    const inPlay = pct(v.inPlayRate);
    const worked = pct(v.workedWhenTriggeredRate);
    const trig = pct(v.triggeredRate);
    const t1 = pct(v.target1Rate), t2 = pct(v.target2Rate), t3 = pct(v.target3Rate);
    const parts: string[] = [`<h2>The numbers</h2>`];
    const tiles: string[] = [];
    if (inPlay) tiles.push(`<li><strong>${esc(inPlay)}</strong> A level or target in play</li>`);
    if (worked) {
      const samp = v.triggerSamples ? ` (${v.triggerSamples} setups)` : "";
      tiles.push(`<li><strong>${esc(worked)}</strong> When a setup triggers, it works${esc(samp)}</li>`);
    }
    if (tiles.length) parts.push(`<ul>${tiles.join("")}</ul>`);
    if (trig) {
      parts.push(
        `<p>Across ${v.scored} intraday-verified sessions, a failed-breakdown long set up ` +
        `(flushed a ranked level and reclaimed it) in ${esc(trig)} of them.</p>`,
      );
    }
    const tp: string[] = [];
    if (t1) tp.push(`1st target ${t1}`);
    if (t2) tp.push(`2nd ${t2}`);
    if (t3) tp.push(`3rd ${t3}`);
    if (tp.length) parts.push(`<p>Targets reached: ${esc(tp.join(", "))}.</p>`);
    parts.push(
      `<p>These are level-interaction statistics, not trading results. ` +
      `Past performance is not indicative of future results.</p>`,
    );
    const d = new Date(snap.updatedAt);
    if (!isNaN(d.getTime())) parts.push(`<p>Updated ${esc(d.toISOString().slice(0, 10))}.</p>`);
    return parts.join("");
  } catch {
    return "";
  }
}

// Static "Share this" row for the prerender of /sample and /learn articles, so
// crawlers and the share links exist without JS. The hydrated page swaps in the
// interactive version (copy link, native share).
function shareRow(path: string, title: string): string {
  const url = SITE + path;
  const x = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  return (
    `<p>Share this: <a href="${esc(x)}" rel="noopener noreferrer">Share on X</a> · ` +
    `<a href="https://www.instagram.com/tradelevelspro/" rel="noopener noreferrer">Follow @tradelevelspro on Instagram</a></p>`
  );
}

// How-to video for the /tradingview prerender. Inserted after the intro
// paragraph so crawlers see the player next to the install steps. No autoplay.
function tradingViewVideo(): string {
  return (
    `<h2>Watch: install in about a minute</h2>` +
    `<video controls playsinline preload="metadata" ` +
    `poster="/videos/tradingview-howto-2026-10-08-poster.jpg" ` +
    `style="width:100%;max-width:860px;aspect-ratio:16/9;border-radius:12px;background:#050810">` +
    `<source src="/videos/tradingview-howto-2026-10-08.mp4" type="video/mp4" />` +
    `<track kind="captions" src="/videos/tradingview-howto-2026-10-08.en.vtt" srclang="en" label="English" default />` +
    `</video>`
  );
}

function renderRouteBody(path: string, meta: RouteMeta): string {
  const entry = ROUTE_BODY[path];
  const slugMatch = path.match(/^\/learn\/([a-z0-9-]+)$/);
  const slug = slugMatch?.[1];
  const article = slug ? LEARN_BY_SLUG.get(slug) : undefined;

  // Article pages use the real title as H1 and the real description as the intro.
  const h1 = esc(article?.title || entry?.h1 || meta.title);

  // Specific articles get their FULL body prerendered (trusted static HTML), so
  // crawlers see the real content instead of a one-paragraph stub.
  const fullArticle = slug ? PRERENDER_ARTICLE_BODIES[slug] : undefined;
  const paraSource = article ? [article.description || article.excerpt] : (entry?.paras || [meta.description]);
  let paras = fullArticle
    ? fullArticle
    : paraSource.map((p) => `<p>${esc(p)}</p>`).join("");
  // /tradingview: video sits after the intro sentence, above the step text.
  if (path === "/tradingview" && !fullArticle) {
    const parts = paraSource.map((p) => `<p>${esc(p)}</p>`);
    paras = (parts[0] || "") + tradingViewVideo() + parts.slice(1).join("");
  }

  // Route-specific extra content inserted after the intro.
  let extra = "";
  if (path === "/prop-firms") extra = propRulesBlock();
  else if (path === "/track-record") extra = trackRecordProof();

  // Share row on /sample and every /learn article.
  const share = (path === "/sample" || article) ? shareRow(path, meta.title) : "";

  // /learn hub: a real index of every guide (title + excerpt + read time) so
  // crawlers and no-JS visitors get the full set of internal links.
  const learnIndex =
    path === "/learn"
      ? `<ul>` +
        LEARN_ARTICLES.map((a) =>
          `<li><a href="/learn/${a.slug}"><strong>${esc(a.title)}</strong></a>` +
          `<p>${esc(a.excerpt || a.description)}` +
          (a.readMinutes ? ` (${a.readMinutes} min read)` : "") +
          `</p></li>`,
        ).join("") +
        `</ul>`
      : "";
  // Article pages link back to the hub; the prop-firm guide also links across to
  // the prop-firms page so the two reinforce each other for crawlers.
  const learnBack = article
    ? (slug === "prop-firm-traders-support-resistance"
        ? `<p><a href="/learn">All guides</a> · <a href="/prop-firms">For prop firm traders</a></p>`
        : `<p><a href="/learn">All guides</a></p>`)
    : "";

  // Don't self-link the current page in the site nav either (render it as text).
  const nav = NAV_LINKS.map(([href, label]) =>
    href === path ? `<span>${esc(label)}</span>` : `<a href="${href}">${esc(label)}</a>`,
  ).join(" · ");
  // Sits inside #root; React clears it on mount. Kept minimal + semantic.
  return (
    `<div id="prerender-content"><header><a href="/">Trade Levels Pro</a></header>` +
    `<main><h1>${h1}</h1>${paras}${extra}${share}${learnIndex}${learnBack}` +
    ctaFooter(path) +
    `</main>` +
    `<nav aria-label="Site">${nav}</nav>` +
    `<nav aria-label="Social">` +
    `<a href="https://x.com/TradeLevelsPro" rel="noopener noreferrer">Trade Levels Pro on X</a> · ` +
    `<a href="https://www.instagram.com/tradelevelspro/" rel="noopener noreferrer">Trade Levels Pro on Instagram</a>` +
    `</nav></div>`
  );
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

  // Seed #root with real content for crawlers / no-JS. React clears it on mount.
  const normPath = rawPath.replace(/\/+$/, "") || "/";
  const body = renderRouteBody(normPath, meta);
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  return { html, status };
}
