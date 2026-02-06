import { Link } from "wouter";
import "./public.css";

const PAYMENT_URL = "https://im.page/tradelevelspro";

export default function PublicSubscribePage() {
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
            <Link href="/pricing" className="public-link" data-testid="link-pricing">Pricing</Link>
            <Link href="/subscribe" className="public-link public-link-active" data-testid="link-subscribe">Subscribe</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>Get <span className="accent">Instant Access</span></h1>
            <p className="public-hero-subtitle">
              Daily ES trade plans with Dynamic Zones, Magnet Levels, and support/resistance delivered to your private Telegram channel.
            </p>
            <p className="public-price-line"><strong>Only $20/month</strong> &bull; Cancel anytime</p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="subscribe-grid">
            <div className="public-info-box">
              <h2>What's Included</h2>
              <div className="subscribe-features">
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Daily ES trade plans</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Dynamic Zones & Magnet Levels</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Full R1-R4 & S1-S4 support/resistance</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Market bias & context</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>1-2 actionable setups per session</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Private Telegram channel access</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Published after market close daily</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="subscribe-action-box">
              <div className="subscribe-price-card">
                <div className="subscribe-price-label">Founding Members</div>
                <div className="subscribe-price-amount">$20/mo</div>
                <p className="subscribe-price-desc">Full access to all daily trade plans and levels</p>
                <button
                  onClick={handleSubscribe}
                  className="subscribe-button"
                  data-testid="button-subscribe-main"
                >
                  Subscribe & Join Telegram
                </button>
                <p className="subscribe-secure-text">Secure checkout &bull; Instant access</p>
              </div>

              <div className="subscribe-steps">
                <h3>How It Works</h3>
                <div className="subscribe-step">
                  <span className="subscribe-step-num">1</span>
                  <span>Click "Subscribe & Join Telegram" above</span>
                </div>
                <div className="subscribe-step">
                  <span className="subscribe-step-num">2</span>
                  <span>Complete payment through secure checkout</span>
                </div>
                <div className="subscribe-step">
                  <span className="subscribe-step-num">3</span>
                  <span>Get instant access to the private Telegram channel</span>
                </div>
                <div className="subscribe-step">
                  <span className="subscribe-step-num">4</span>
                  <span>Receive daily trade plans after market close</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="public-footer">
          Trade Smart. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
