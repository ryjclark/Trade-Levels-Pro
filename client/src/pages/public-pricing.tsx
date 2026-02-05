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
                <span>Daily ES & NQ Trade Plans</span>
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
              <p className="faq-answer">This service is best for traders who already understand basic futures trading and want a structured daily framework.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you give buy/sell signals?</h3>
              <p className="faq-answer">No. We provide levels, structure, and scenarios so you can execute according to your own plan.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I cancel anytime?</h3>
              <p className="faq-answer">Yes. There are no contracts or long-term commitments.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">When are plans posted?</h3>
              <p className="faq-answer">Plans are published after market close for the following trading session.</p>
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
