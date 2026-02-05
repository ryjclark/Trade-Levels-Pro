import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import "./public.css";

interface PublicSettings {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
}

const PAYMENT_URL = "https://im.page/tradelevelspro";

export default function PublicSubscribePage() {
  const { data: settings } = useQuery<PublicSettings>({
    queryKey: ["/api/public/settings"],
  });

  const paymentUrl = settings?.joinUrl || PAYMENT_URL;

  return (
    <div className="public-page">
      <div className="public-container">
        <nav className="public-navbar">
          <div className="public-brand">Trade Levels Pro</div>
          <div className="public-nav-links">
            <Link href="/" className="public-link" data-testid="link-home">Home</Link>
            <Link href="/pricing" className="public-link" data-testid="link-pricing">Pricing</Link>
            <Link href="/trackrecord" className="public-link" data-testid="link-trackrecord">Track Record</Link>
            <Link href="/about" className="public-link" data-testid="link-about">About</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <div className="public-pill">Get Started</div>
            <h1>Subscribe Now</h1>
            <p className="public-hero-subtitle">
              Get daily ES/NQ trade plans with Dynamic Zone, Magnet levels, and Support/Resistance analysis delivered to your private Telegram channel.
            </p>
            <p className="public-price-text">{settings?.priceText || "$20/month"}</p>
          </div>
        </section>

        <section className="public-section">
          <div className="subscribe-grid">
            <div className="public-info-box">
              <h2>What's Included</h2>
              <div className="subscribe-features">
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Daily ES & NQ trade plans</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Dynamic Zone & Magnet levels</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Full R1-R4 & S1-S4 support/resistance</span>
                </div>
                <div className="subscribe-feature">
                  <span className="subscribe-check">&#10003;</span>
                  <span>Directional bias analysis</span>
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
                <div className="subscribe-price-label">Monthly Subscription</div>
                <div className="subscribe-price-amount">$20/month</div>
                <p className="subscribe-price-desc">Full access to all daily trade plans and levels</p>
                <a
                  href={paymentUrl}
                  className="subscribe-button"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-subscribe-main"
                >
                  Subscribe & Join Telegram
                </a>
                <p className="subscribe-secure-text">Secure payment via InviteMember</p>
              </div>

              <div className="subscribe-steps">
                <h3>How It Works</h3>
                <div className="subscribe-step">
                  <span className="subscribe-step-num">1</span>
                  <span>Click "Subscribe & Join Telegram" above</span>
                </div>
                <div className="subscribe-step">
                  <span className="subscribe-step-num">2</span>
                  <span>Complete payment through InviteMember</span>
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
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
