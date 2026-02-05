import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import "./public.css";

interface PublicSettings {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
}

const PAYMENT_URL = "https://im.page/8e37ed0a/plan?planId=76a5d210-02de-11f1-b161-8d9d089773e5";

export default function PublicHomePage() {
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
            <div className="public-pill">Daily ES/NQ Trade Plans</div>
            <h1>Trade Levels Pro</h1>
            <p className="public-hero-subtitle">
              Professional daily trade plans with Dynamic Zone, Magnet levels, and Support/Resistance analysis for ES and NQ futures.
            </p>
            <p className="public-price-text">$20/month</p>
            <a href={paymentUrl} className="public-cta" target="_blank" rel="noopener noreferrer" data-testid="button-subscribe">
              Subscribe Now →
            </a>
          </div>
          <div className="public-hero-image">
            <img src="/images/hero-trading.jpg" alt="Trading charts" />
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">What You Get</h2>
            <p className="public-section-subtitle">
              Everything you need to plan your trading day with confidence
            </p>
          </div>
          <div className="public-cards">
            <div className="public-card">
              <img src="/images/feature-levels.jpg" alt="Trading levels" className="public-card-image" />
              <div className="public-card-content">
                <h3>Daily Levels</h3>
                <p>Dynamic Zone, Magnet, and clean support/resistance levels delivered after market close.</p>
              </div>
            </div>
            <div className="public-card">
              <img src="/images/feature-bias.jpg" alt="Directional bias" className="public-card-image" />
              <div className="public-card-content">
                <h3>Directional Bias</h3>
                <p>Clear context on how the day is likely to trade, helping you align with market direction.</p>
              </div>
            </div>
            <div className="public-card">
              <img src="/images/feature-setups.jpg" alt="Trade setups" className="public-card-image" />
              <div className="public-card-content">
                <h3>Best Setups</h3>
                <p>1-2 actionable setups for each session, written simply and clearly.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-info-box">
            <h2>Find Me</h2>
            <p>Stay connected and get the latest updates on trade plans and market analysis.</p>
            <div className="public-social-links">
              {settings?.substackUrl && (
                <a className="public-social-link" href={settings.substackUrl} target="_blank" rel="noopener noreferrer">
                  Substack
                </a>
              )}
              {settings?.xUrl && (
                <a className="public-social-link" href={settings.xUrl} target="_blank" rel="noopener noreferrer">
                  X / Twitter
                </a>
              )}
              {!settings?.substackUrl && !settings?.xUrl && (
                <span className="public-social-link">Links coming soon</span>
              )}
            </div>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Ready to Level Up Your Trading?</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Join traders who use professional-grade levels every day.
          </p>
          <a href={paymentUrl} className="public-cta" target="_blank" rel="noopener noreferrer" data-testid="button-get-started">
            Get Started Today →
          </a>
        </section>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
