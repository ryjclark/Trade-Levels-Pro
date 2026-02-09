import { Link } from "wouter";
import "./public.css";

const PAYMENT_URL = "https://im.page/tradelevelspro";

export default function PublicPricingPage() {
  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(PAYMENT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="public-page">
      <div className="public-container">
        <nav className="public-navbar">
          <Link href="/" className="public-brand" data-testid="link-brand">
            <img src="/images/logo-square.webp" alt="Trade Levels Pro" className="public-brand-logo" />
            Trade Levels Pro
          </Link>
          <div className="public-nav-links">
            <Link href="/" className="public-link" data-testid="link-home">Home</Link>
            <Link href="/about" className="public-link" data-testid="link-about">About</Link>
            <Link href="/pricing" className="public-link public-link-active" data-testid="link-pricing">Pricing</Link>
            <Link href="/subscribe" className="public-link" data-testid="link-subscribe">Subscribe</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>Start Trading with <span className="accent">Precision</span></h1>
            <p className="public-hero-subtitle">
              Get daily ES levels, bias, and structured setups for just $25/month.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="pricing-plan">
            <div className="pricing-plan-name">Trade Levels Pro — Founding Members</div>
            <div className="pricing-plan-price">$25</div>
            <div className="pricing-plan-period">per month</div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Daily ES Support & Resistance Levels</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Dynamic Zone + Magnet</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Bias + 1-2 High-Quality Setups</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Delivered via Telegram After the Close</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
            <button onClick={handleSubscribe} className="subscribe-button" data-testid="button-subscribe">
              Get Instant Access →
            </button>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">Is this ES only?</h3>
              <p className="faq-answer">Yes — ES only for now. NQ is planned for the future.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is this an alerts service?</h3>
              <p className="faq-answer">No. It's a daily plan with key levels and 1-2 high-quality setups. You learn to navigate the levels and make your own trading decisions — not follow someone else's calls.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Who is this for?</h3>
              <p className="faq-answer">Prop traders and futures traders who want a repeatable, disciplined process. Whether you're protecting an evaluation account or building consistency, this plan gives you the structure to trade with confidence.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What exactly do I get each day?</h3>
              <p className="faq-answer">Every trading day you receive a complete plan with Dynamic Zones, a Magnet level, support and resistance levels (S1-S4, R1-R4), the daily market bias, and 1-2 high-quality setups based on those levels.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">When are plans posted?</h3>
              <p className="faq-answer">Plans are published after market close for the following trading session, so you're always prepared before the market opens.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I cancel anytime?</h3>
              <p className="faq-answer">Yes. There are no contracts or long-term commitments. Cancel anytime with one click.</p>
            </div>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Start Trading with Structure</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Daily ES levels and a structured plan built for prop traders and developing futures traders.
          </p>
          <button onClick={handleSubscribe} className="public-cta" data-testid="button-join-now">
            Join Trade Levels Pro →
          </button>
        </section>

        <footer className="public-footer">
          Trade Smart. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
