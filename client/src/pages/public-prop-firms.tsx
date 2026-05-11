import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import { useSeo } from "@/hooks/use-seo";
import { CTA_TEXT, CTA_MAILTO, PROP_FIRMS, SITE_NAME } from "@/lib/constants";

export default function PublicPropFirmsPage() {
  useSeo({
    title: `Prop Firm Comparison for Futures Traders | ${SITE_NAME}`,
    description: "Honest comparison of the top prop firms for futures traders — Topstep, Apex, MyFundedFutures, Tradeify, Earn2Trade, The Trading Pit, TickTick Trader, and Bulenox.",
    path: "/prop-firms",
  });

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">
        <section className="public-hero">
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="hero-noise" aria-hidden="true" />
          <div className="public-hero-content public-hero-centered">
            <span className="public-section-eyebrow">Resources</span>
            <h1>
              Prop Firms for <span className="accent">Futures Traders</span>
            </h1>
            <p className="public-hero-subtitle">
              An honest comparison of the firms most ES traders use. Pick one
              that fits your account size, risk tolerance, and trading style —
              not just the loudest discount of the week.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="affiliate-disclosure" data-testid="text-affiliate-disclosure">
            Some links on this page are affiliate links. If you fund an account
            through them, Trade Levels Pro may receive compensation at no extra
            cost to you. We only list firms we believe are credible options.
          </div>

          <Reveal>
            <div className="firm-grid">
              {PROP_FIRMS.map((firm) => (
                <article
                  className="firm-card"
                  key={firm.slug}
                  data-testid={`card-firm-${firm.slug}`}
                >
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
                    <a
                      href={firm.url}
                      target="_blank"
                      rel="noopener sponsored"
                      className="btn-primary"
                      data-testid={`link-firm-${firm.slug}`}
                    >
                      Visit {firm.name} →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Pair a prop firm with a daily plan.</h2>
          <p className="public-section-subtitle" style={{ marginBottom: 32 }}>
            Get the same ES levels every trading day — and trade your evaluation
            with structure.
          </p>
          <a href={CTA_MAILTO} className="btn-primary" data-testid="button-cta-prop-firms">
            {CTA_TEXT} →
          </a>
        </section>

        <div className="affiliate-disclosure" style={{ marginTop: 24 }}>
          Affiliate disclosure: links on this page may earn Trade Levels Pro a
          commission. This never changes the price you pay.
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}
