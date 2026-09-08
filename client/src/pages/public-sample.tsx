import type { CSSProperties } from "react";
import { Link } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import TradingViewChart from "@/components/TradingViewChart";
import { useSeo } from "@/hooks/use-seo";
import { CTA_TEXT, SITE_NAME } from "@/lib/constants";

// A faithful mock of the real daily Telegram drop. Structure, order, emoji, and
// setup language mirror server/lib/telegram-format.ts (formatAlgorithmPlan) so
// visitors see exactly what members receive. Numbers are illustrative only.
const bubble: CSSProperties = {
  border: "1px solid var(--border, rgba(255,255,255,0.08))",
  borderRadius: 16,
  padding: "18px 20px",
  background: "var(--card, rgba(255,255,255,0.02))",
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
  fontSize: 14,
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxWidth: 560,
  margin: "0 auto",
};

const SAMPLE_ES = `🤖 ES Trade Plan · Example

Bias: Bullish
Magnet: 7,496
Dynamic Zone: 7,475 – 7,517

🟢 Failed-breakdown longs (best first)
🥇 7,427 → flush and reclaim, long toward the magnet
🥈 7,399 (backup)
🥉 7,372 (deeper)

🔴 Rejection shorts (secondary)
🥇 7,517 → reject and fail, short toward the magnet
🥈 7,547

Rule: wait for acceptance, then manage level to level.
Educational only. Not investment advice.`;

const SAMPLE_NQ = `🤖 NQ Trade Plan · Example

Bias: Neutral
Magnet: 24,180
Dynamic Zone: 24,090 – 24,275

🟢 Failed-breakdown longs (best first)
🥇 23,985 → flush and reclaim, long toward the magnet
🥈 23,880 (backup)
🥉 23,740 (deeper)

🔴 Rejection shorts (secondary)
🥇 24,310 → reject and fail, short toward the magnet
🥈 24,440

Rule: wait for acceptance, then manage level to level.
Educational only. Not investment advice.`;

export default function PublicSamplePage() {
  useSeo({
    title: `Sample Daily ES and NQ Trade Plan | ${SITE_NAME}`,
    description:
      "See exactly what members receive each trading day: the real Telegram drop with Bias, Magnet, Dynamic Zone, ranked failed-breakdown longs and rejection shorts, and the acceptance rule. Numbers illustrative.",
    path: "/sample",
  });

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">
        <section className="public-hero" style={{ padding: "80px 0 40px" }}>
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="public-hero-content public-hero-centered">
            <h1>Sample <span className="accent">Daily Plan</span></h1>
            <p className="public-hero-subtitle">
              This is the actual message members receive in Telegram each trading day,
              for ES and NQ (an ES example is shown). The numbers are illustrative, the
              format is exactly what gets sent.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <p style={{ textAlign: "center", fontSize: 13, opacity: 0.55, margin: "0 0 12px" }}>
              You get a separate plan for each market, ES and NQ, every trading day.
            </p>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", maxWidth: 900, margin: "0 auto" }}>
              <div style={bubble} data-testid="card-sample-plan-es">{SAMPLE_ES}</div>
              <div style={bubble} data-testid="card-sample-plan-nq">{SAMPLE_NQ}</div>
            </div>

            <p style={{ textAlign: "center", fontSize: 13, opacity: 0.6, maxWidth: 640, margin: "18px auto 0" }}>
              Numbers are illustrative examples, the format is exactly what gets sent. On the
              on-site plan you also get the full support/resistance ladder and the live
              chart. The optional TradingView overlay lets you copy these levels onto your own
              chart (re-copy when each new plan posts).
            </p>

            <div className="sample-callout" data-testid="callout-prop-firms" style={{ marginTop: 32 }}>
              <div className="sample-callout-text">
                Trading a prop eval or funded account?
                <small>See how the daily plan works as a discipline layer.</small>
              </div>
              <Link href="/prop-firms" className="btn-secondary" data-testid="link-callout-prop-firms">
                For prop traders →
              </Link>
            </div>

            <div className="glossary-box" data-testid="box-glossary" style={{ marginTop: 40 }}>
              <h3>Glossary</h3>
              <dl className="glossary-list">
                <dt>Bias</dt>
                <dd>The day's directional lean while price holds the magnet.</dd>
                <dt>Magnet</dt>
                <dd>The price the session tends to gravitate toward. The main anchor for bias.</dd>
                <dt>Dynamic Zone (DZ)</dt>
                <dd>A volatility band around the magnet where price often consolidates or reverses.</dd>
                <dt>Failed-breakdown long</dt>
                <dd>The primary setup: price flushes below a level, traps sellers, reclaims it, and you long toward the magnet.</dd>
                <dt>Rejection short</dt>
                <dd>The secondary setup: price tests a level above the magnet, rejects and fails to hold, and you fade it back toward the magnet.</dd>
                <dt>Acceptance</dt>
                <dd>The confirmation to enter: price holds back above (or below) the level rather than knifing through it.</dd>
                <dt>Level to level</dt>
                <dd>How you manage: bank the first target, trail a runner, and react to price rather than predict.</dd>
              </dl>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <TradingViewChart height={400} />
          </section>
        </Reveal>

        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Ready for tomorrow's plan?</h2>
          <Link href="/pricing" className="btn-primary" data-testid="button-cta-sample">
            {CTA_TEXT} →
          </Link>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
