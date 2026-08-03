import { Link } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import TradingViewChart from "@/components/TradingViewChart";
import { useSeo } from "@/hooks/use-seo";
import { CTA_TEXT, SITE_NAME } from "@/lib/constants";

export default function PublicSamplePage() {
  useSeo({
    title: `Sample Daily ES and NQ Trade Plan | ${SITE_NAME}`,
    description: "See exactly what's inside the daily ES and NQ trade plan: Magnet, Dynamic Zone, ranked reaction levels, and ranked failed-breakdown longs plus rejection shorts, with the acceptance rule.",
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
              This is the structure you receive in Telegram each trading day for
              ES and NQ (an ES example is shown below). Numbers below are
              illustrative only.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <div className="sample-card" data-testid="card-sample-plan">
              <div className="sample-title">ES Daily Trade Plan (Example)</div>
              <div className="sample-row">
                <div className="sample-label">Bias</div>
                <div className="sample-value">Bullish while price holds the magnet</div>
              </div>
              <div className="sample-row">
                <div className="sample-label">Magnet</div>
                <div className="sample-value mono">7,496</div>
              </div>
              <div className="sample-row">
                <div className="sample-label">Dynamic Zone</div>
                <div className="sample-value mono">7,475 – 7,517</div>
              </div>

              <div className="sample-block">
                <div className="sample-label">Failed-Breakdown Longs (primary, ranked best-first)</div>
                <ul className="sample-list">
                  <li>🥇 7,427 (significant low): flush below, reclaim, and accept back above, then long toward the magnet (7,496), then 7,517. Stop below 7,410.</li>
                  <li>🥈 7,399 (significant low): deeper backup if the first fails. Target 7,427, then the magnet.</li>
                  <li>🥉 7,372 (significant low): deeper still, take it only if price reaches and reclaims it.</li>
                </ul>
              </div>

              <div className="sample-block">
                <div className="sample-label">Rejection Shorts (secondary, lower win-rate)</div>
                <ul className="sample-list">
                  <li>🥇 7,517 (significant high): reject and fail to hold, then short toward the magnet. Stop above 7,530. Size down.</li>
                  <li>🥈 7,547 (significant high): next resistance up if 7,517 gives way.</li>
                </ul>
              </div>

              <div className="sample-block">
                <div className="sample-label">Detected reaction levels</div>
                <div className="sample-grid">
                  <div><span className="sample-tag">Resistance</span><span className="mono">7,517 · 7,547 · 7,563</span></div>
                  <div><span className="sample-tag">Support</span><span className="mono">7,427 · 7,399 · 7,372</span></div>
                </div>
              </div>

              <div className="sample-block">
                <div className="sample-label">How to take it</div>
                <ul className="sample-list">
                  <li>Acceptance first: do not knife-catch. Wait for price to hold back above the level, or reclaim it by about 5 points and hold for a couple of minutes.</li>
                  <li>Manage level to level: bank the first target, move your stop, and trail a runner. React to price, no predictions.</li>
                </ul>
              </div>
            </div>

            <div className="sample-callout" data-testid="callout-prop-firms">
              <div className="sample-callout-text">
                Trading through a prop firm?
                <small>Compare the best ones for ES futures traders.</small>
              </div>
              <Link href="/prop-firms" className="btn-secondary" data-testid="link-callout-prop-firms">
                See the comparison →
              </Link>
            </div>

            <div className="glossary-box" data-testid="box-glossary" style={{ marginTop: 40 }}>
              <h3>Glossary</h3>
              <dl className="glossary-list">
                <dt>Magnet</dt>
                <dd>The price the session tends to gravitate toward. Our main anchor for bias.</dd>
                <dt>Dynamic Zone (DZ)</dt>
                <dd>A volatility band around the magnet where price often consolidates or reverses.</dd>
                <dt>Reaction levels</dt>
                <dd>The real spots where price flushed and reversed, ranked by quality (major, minor, micro).</dd>
                <dt>Failed breakdown</dt>
                <dd>Our primary setup: price flushes below a significant low, traps sellers, then reclaims it, so you go long.</dd>
                <dt>Acceptance</dt>
                <dd>The confirmation to enter: price holds back above the level, or reclaims it by about 5 points and holds.</dd>
                <dt>Level to level</dt>
                <dd>How we manage: bank the first target, trail a runner, and react to price rather than predict.</dd>
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
