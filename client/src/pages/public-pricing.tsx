import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { CTA_TEXT, CTA_MAILTO, PRICE } from "@/lib/constants";

export default function PublicPricingPage() {
  return (
    <div className="public-page">
      <div className="public-container">
        <PublicNav />

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>
              Founding Members <span className="accent">Pricing</span>
            </h1>
            <p className="public-hero-subtitle">
              One simple plan. Daily ES levels, bias, and setups delivered to a
              private Telegram channel.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="pricing-plan">
            <div className="pricing-plan-name">Trade Levels Pro — Founding Members</div>
            <div className="pricing-plan-price">{PRICE}</div>
            <div className="pricing-plan-period">per month</div>
            <div className="pricing-features">
              <div className="pricing-feature"><span className="pricing-check">✓</span><span>Daily ES support &amp; resistance levels</span></div>
              <div className="pricing-feature"><span className="pricing-check">✓</span><span>Dynamic Zone + Magnet</span></div>
              <div className="pricing-feature"><span className="pricing-check">✓</span><span>Daily bias + 1–2 high-quality setups</span></div>
              <div className="pricing-feature"><span className="pricing-check">✓</span><span>Delivered via Telegram after the close</span></div>
              <div className="pricing-feature"><span className="pricing-check">✓</span><span>Cancel anytime</span></div>
            </div>
            <a
              href={CTA_MAILTO}
              className="subscribe-button"
              data-testid="button-cta-pricing"
            >
              {CTA_TEXT} →
            </a>
            <p className="subscribe-secure-text">No contracts • Cancel in one click</p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item"><h3 className="faq-question">Is this ES only?</h3><p className="faq-answer">Yes — ES only for now. NQ is on the roadmap.</p></div>
            <div className="faq-item"><h3 className="faq-question">Is this an alerts service?</h3><p className="faq-answer">No. It's a daily plan with key levels and 1–2 high-quality setups. You learn to navigate the levels and make your own decisions.</p></div>
            <div className="faq-item"><h3 className="faq-question">Who is this for?</h3><p className="faq-answer">Prop traders and developing futures traders who want a repeatable, disciplined process around the ES session.</p></div>
            <div className="faq-item"><h3 className="faq-question">What do I get each day?</h3><p className="faq-answer">Dynamic Zone, Magnet, R1–R4 / S1–S4, daily bias, and 1–2 setups based on those levels.</p></div>
            <div className="faq-item"><h3 className="faq-question">When are plans posted?</h3><p className="faq-answer">After market close, for the next trading session.</p></div>
            <div className="faq-item"><h3 className="faq-question">Can I cancel anytime?</h3><p className="faq-answer">Yes. No contracts, no long-term commitment.</p></div>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Ready to start?</h2>
          <a
            href={CTA_MAILTO}
            className="public-cta"
            data-testid="button-cta-pricing-final"
          >
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
