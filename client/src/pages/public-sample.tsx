import { Link } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import TradingViewChart from "@/components/TradingViewChart";
import { useSeo } from "@/hooks/use-seo";
import { CTA_TEXT, CTA_MAILTO, SITE_NAME } from "@/lib/constants";

export default function PublicSamplePage() {
  useSeo({
    title: `Sample Daily ES Trade Plan | ${SITE_NAME}`,
    description: "See exactly what's inside the daily ES trade plan delivered to subscribers — Dynamic Zone, Magnet, R1–R4, S1–S4, bias, and setups.",
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
              This is exactly what you receive in Telegram each trading day.
              Numbers below are illustrative only.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <div className="sample-card" data-testid="card-sample-plan">
              <div className="sample-title">ES Daily Trade Plan — Monday, May 12, 2026</div>
              <div className="sample-row">
                <div className="sample-label">Bias</div>
                <div className="sample-value">Bullish above magnet</div>
              </div>
              <div className="sample-row">
                <div className="sample-label">Dynamic Zone</div>
                <div className="sample-value mono">5,812 – 5,824</div>
              </div>
              <div className="sample-row">
                <div className="sample-label">Magnet</div>
                <div className="sample-value mono">5,818</div>
              </div>
              <div className="sample-block">
                <div className="sample-label">Resistance</div>
                <div className="sample-grid">
                  <div><span className="sample-tag">R1</span><span className="mono">5,832</span></div>
                  <div><span className="sample-tag">R2</span><span className="mono">5,847</span></div>
                  <div><span className="sample-tag">R3</span><span className="mono">5,861</span></div>
                  <div><span className="sample-tag">R4</span><span className="mono">5,878</span></div>
                </div>
              </div>
              <div className="sample-block">
                <div className="sample-label">Support</div>
                <div className="sample-grid">
                  <div><span className="sample-tag">S1</span><span className="mono">5,804</span></div>
                  <div><span className="sample-tag">S2</span><span className="mono">5,790</span></div>
                  <div><span className="sample-tag">S3</span><span className="mono">5,776</span></div>
                  <div><span className="sample-tag">S4</span><span className="mono">5,761</span></div>
                </div>
              </div>
              <div className="sample-block">
                <div className="sample-label">Setups</div>
                <ul className="sample-list">
                  <li>Long reaction at S1 (5,804) targeting magnet, stop below S2.</li>
                  <li>Short rejection at R2 (5,847) if price overextends, stop above R3.</li>
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
                <dt>Dynamic Zone (DZ)</dt>
                <dd>The reactive band where price often consolidates or reverses.</dd>
                <dt>Magnet</dt>
                <dd>The price level price tends to gravitate toward intraday.</dd>
                <dt>R1–R4 / S1–S4</dt>
                <dd>Layered resistance and support levels for the session.</dd>
                <dt>Bias</dt>
                <dd>Overall directional context for the day.</dd>
                <dt>Setup</dt>
                <dd>A specific, level-based trade idea — a starting point, not a signal.</dd>
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
          <a href={CTA_MAILTO} className="btn-primary" data-testid="button-cta-sample">
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
