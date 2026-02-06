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
            <h1>Simple Pricing. <span className="accent">No Gimmicks.</span></h1>
            <p className="public-hero-subtitle">
              One plan. Full access. Cancel anytime.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="pricing-plan">
            <div className="pricing-plan-name">Trade Levels Pro — Founding Members</div>
            <div className="pricing-plan-price">$20</div>
            <div className="pricing-plan-period">per month</div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Daily ES Trade Plans</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Dynamic Zones & Magnet Levels</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Support & Resistance Levels</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Market Bias & Context</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Best Setup Scenarios</span>
              </div>
              <div className="pricing-feature">
                <span className="pricing-check">&#10003;</span>
                <span>Private Telegram Access</span>
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
              <h3 className="faq-question">Is this for beginners?</h3>
              <p className="faq-answer">Yes. Trade Levels Pro is designed for all experience levels. We provide key price levels and context that help you understand where the market may react — so whether you're just starting out or have years of experience, you'll learn to trade with structure instead of guessing.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is this an alert or signal service?</h3>
              <p className="faq-answer">No. We don't send buy/sell alerts. Instead, we provide daily levels, zones, and market context so you can build your own plan and make your own trading decisions. This is about learning to trade with structure — not following someone else's calls.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What exactly do I get each day?</h3>
              <p className="faq-answer">Every trading day you receive a complete plan with Dynamic Zones, a Magnet level, support and resistance levels (S1-S4, R1-R4), the daily market bias, and 1-2 high-probability trade setups. These levels help you know where price is likely to react before the session even starts.</p>
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
            Get daily levels and trade plans delivered straight to your Telegram.
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
