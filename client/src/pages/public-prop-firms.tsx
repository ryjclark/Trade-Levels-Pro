import type { CSSProperties } from "react";
import { Link } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import { useSeo } from "@/hooks/use-seo";
import {
  PROP_FIRMS,
  SITE_NAME,
  CONTACT_EMAIL,
  PRICE_PER_MONTH,
  PRICE_ANNUAL_PER_YEAR,
} from "@/lib/constants";

const WHO = [
  {
    t: "In an evaluation",
    d: "You need to hit a profit target without breaching a daily or trailing drawdown. A defined plan keeps you from forcing trades to chase the target.",
  },
  {
    t: "In a funded account",
    d: "Consistency and risk rules matter more than being right. Trading level-to-level with clear invalidation protects the account you worked to earn.",
  },
  {
    t: "Trading ES or NQ",
    d: "The daily plan is built around ES and NQ (with Gold, Crude, and Russell included), the instruments most futures evals are run on.",
  },
];

const HELPS = [
  {
    t: "Clear invalidation",
    d: "Every setup has a defined level where it is wrong, so your stop is a decision made before the open, not in the heat of the move.",
  },
  {
    t: "A reason to wait",
    d: "Pre-defined Magnet, Dynamic Zone, and reaction levels give you a reason to sit on your hands, which cuts the overtrading that fails most evals.",
  },
  {
    t: "Level-to-level targets",
    d: "Ranked reaction levels give logical places to scale or exit, useful when a firm rewards consistency over home runs.",
  },
  {
    t: "1-2 quality setups",
    d: "A short list of A-setups per day, not a firehose of alerts, so you can be selective and protect your risk budget.",
  },
];

const NOT_LIST = [
  "Not guaranteed funding, and not a promise you will pass an evaluation.",
  "Not copy trading, auto-orders, or a trading bot.",
  "Not a buy/sell signal service. You make your own decisions.",
  "Not affiliated with, or endorsed by, any prop firm.",
];

const PLAN = [
  ["Bias", "The day's directional lean, with the reasoning behind it."],
  ["Magnet", "The price the market is drawn toward."],
  ["Dynamic Zone", "The key acceptance and rejection band for the session."],
  ["Ranked reaction levels", "Support and resistance, ordered by importance."],
  ["1-2 setups", "Ranked failed-breakdown longs and rejection shorts, each with invalidation."],
];

const FAQ = [
  {
    q: "Will this help me pass an evaluation?",
    a: "It gives you a repeatable, level-based plan with clear invalidation, which is what a lot of traders who blow evals are missing. It is not a guarantee. No one can promise you will pass.",
  },
  {
    q: "Is this a signal service?",
    a: "No. It is a daily plan with levels, bias, and 1-2 ranked setups. You decide what to take and how to manage risk inside your firm's rules.",
  },
  {
    q: "Which firms does it work with?",
    a: "Any firm that lets you trade ES or NQ futures. The plan is about the market, not the platform, so it fits the major futures firms.",
  },
  {
    q: "Does it respect my drawdown and consistency rules?",
    a: "The plan gives you defined risk per setup and level-to-level targets. How you size and when you stop is up to you, and it is built to support staying inside a firm's limits.",
  },
  {
    q: "What does it cost?",
    a: `${PRICE_PER_MONTH} or ${PRICE_ANNUAL_PER_YEAR}. Cancel anytime.`,
  },
];

const PARTNER_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Partner with Trade Levels Pro",
)}&body=${encodeURIComponent(
  "Name:\nRole:\nFirm or audience:\nApprox. size / reach:\nLink (site, channel, or profile):\nNotes:\n",
)}`;

const card: CSSProperties = {
  border: "1px solid var(--border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding: 20,
  background: "var(--card, rgba(255,255,255,0.02))",
};

export default function PublicPropFirmsPage() {
  useSeo({
    title: `For Prop Firm Traders | ${SITE_NAME}`,
    description:
      "A daily ES and NQ plan built as a discipline layer for prop evaluations and funded accounts: Magnet, Dynamic Zone, ranked reaction levels, bias, and 1-2 setups with clear invalidation. Not a signal service.",
    path: "/prop-firms",
  });

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">
        {/* Hero */}
        <section className="public-hero">
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="hero-noise" aria-hidden="true" />
          <div className="public-hero-content public-hero-centered">
            <span className="public-section-eyebrow">For prop traders</span>
            <h1>
              A daily plan for <span className="accent">eval and funded</span> ES / NQ traders
            </h1>
            <p className="public-hero-subtitle">
              Magnet, Dynamic Zone, ranked reaction levels, a daily bias, and 1-2 setups,
              each with clear invalidation. A discipline layer for your evaluation or funded
              account, not signal spam. Delivered to Telegram and the on-site terminal.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 24 }}>
              <Link href="/sample" className="btn-primary" data-testid="button-prop-sample">
                See today's sample plan →
              </Link>
              <Link href="/pricing" className="btn-secondary" data-testid="button-prop-pricing">
                Pricing ({PRICE_PER_MONTH})
              </Link>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="public-section">
          <span className="public-section-eyebrow">Who it's for</span>
          <h2 className="public-section-title">Built for the eval and funded grind</h2>
          <Reveal>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 24 }}>
              {WHO.map((w) => (
                <div key={w.t} style={card}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{w.t}</div>
                  <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{w.d}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* How it helps */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <span className="public-section-eyebrow">How it helps</span>
          <h2 className="public-section-title">In an eval or a funded account</h2>
          <Reveal>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 24 }}>
              {HELPS.map((h) => (
                <div key={h.t} style={card}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{h.t}</div>
                  <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{h.d}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* What's in the daily plan */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <span className="public-section-eyebrow">The daily plan</span>
          <h2 className="public-section-title">What you get each day</h2>
          <Reveal>
            <div style={{ ...card, marginTop: 24, padding: 0, overflow: "hidden" }}>
              {PLAN.map(([name, desc], i) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "14px 20px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border, rgba(255,255,255,0.06))",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: 700, minWidth: 180, color: "var(--teal, #5EEAD4)" }}>{name}</div>
                  <div style={{ fontSize: 14, opacity: 0.82, flex: 1, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* What it is NOT */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <span className="public-section-eyebrow">Straight talk</span>
          <h2 className="public-section-title">What this is not</h2>
          <Reveal>
            <ul style={{ ...card, marginTop: 24, listStyle: "none", padding: 20, display: "grid", gap: 10 }}>
              {NOT_LIST.map((n) => (
                <li key={n} style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6, paddingLeft: 22, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#f87171" }}>✕</span>
                  {n}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* Primary CTA */}
        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Trade your eval with structure.</h2>
          <p className="public-section-subtitle" style={{ marginBottom: 32 }}>
            See a real sample plan first, then subscribe if it fits your process.
            {" "}{PRICE_PER_MONTH} or {PRICE_ANNUAL_PER_YEAR}, cancel anytime.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/sample" className="btn-primary" data-testid="button-cta-prop-sample">
              See a sample plan →
            </Link>
            <Link href="/pricing" className="btn-secondary" data-testid="button-cta-prop-pricing">
              See pricing →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="public-section">
          <span className="public-section-eyebrow">FAQ</span>
          <h2 className="public-section-title">Common questions</h2>
          <Reveal>
            <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
              {FAQ.map((f) => (
                <div key={f.q} style={card}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{f.q}</div>
                  <div style={{ fontSize: 14, opacity: 0.82, lineHeight: 1.6 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Partner block */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <div style={{ ...card, padding: 28, borderColor: "var(--border-teal-strong, rgba(94,234,212,0.35))", background: "var(--teal-soft, rgba(94,234,212,0.06))" }}>
            <span className="public-section-eyebrow">Firms & educators</span>
            <h2 className="public-section-title" style={{ marginTop: 8 }}>Partner with us</h2>
            <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7, maxWidth: 640 }}>
              Run a prop firm, a trading community, or an education program? We can set you up
              with a unique referral link, sample assets for your audience, and an optional
              30-day cohort pilot so your traders can try the daily plan. No exclusivity, no
              white-label promises, just a clean value-add for your traders.
            </p>
            <a href={PARTNER_MAILTO} className="btn-primary" style={{ marginTop: 8, display: "inline-block" }} data-testid="button-partner">
              Partner with us →
            </a>
          </div>
        </section>

        {/* Secondary resource: real firm list (kept, not invented) */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <span className="public-section-eyebrow">Resource</span>
          <h2 className="public-section-title">Prop firms futures traders use</h2>
          <div className="affiliate-disclosure" data-testid="text-affiliate-disclosure">
            We are not affiliated with these firms. Some links may become affiliate links in the
            future. We only list firms we would consider ourselves.
          </div>
          <Reveal>
            <div className="firm-grid">
              {PROP_FIRMS.map((firm) => (
                <article className="firm-card" key={firm.slug} data-testid={`card-firm-${firm.slug}`}>
                  <h3 className="firm-name">{firm.name}</h3>
                  <p className="firm-tagline">{firm.tagline}</p>
                  <div className="firm-meta">{firm.accountSizes}</div>
                  <div className="firm-pros-label">Pros</div>
                  <ul className="firm-pros">
                    {firm.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                  <div className="firm-cons-label">Trade-offs</div>
                  <ul className="firm-cons">
                    {firm.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <div className="firm-cta-row">
                    <a href={firm.url} target="_blank" rel="noopener sponsored" className="btn-primary" data-testid={`link-firm-${firm.slug}`}>
                      Visit {firm.name} →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Compliance strip */}
        <div className="affiliate-disclosure" style={{ marginTop: 8, marginBottom: 24 }} data-testid="text-compliance">
          Educational content only, not financial advice. Trade Levels Pro is not a signal
          service and is not affiliated with or endorsed by any prop firm. No outcome, funding,
          or evaluation result is guaranteed. Price data on the site is delayed and is not a live
          trading feed. Trading futures involves substantial risk of loss.
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}
