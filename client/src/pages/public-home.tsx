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

export default function PublicHomePage() {
  const { data: settings } = useQuery<PublicSettings>({
    queryKey: ["/api/public/settings"],
  });

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
            <Link href="/" className="public-link public-link-active" data-testid="link-home">Home</Link>
            <Link href="/about" className="public-link" data-testid="link-about">About</Link>
            <Link href="/pricing" className="public-link" data-testid="link-pricing">Pricing</Link>
            <Link href="/subscribe" className="public-link" data-testid="link-subscribe">Subscribe</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>Trade Levels <span className="accent">Pro</span></h1>
            <p className="public-hero-subtitle">
              Trade Smarter. React to Price. No Predictions.
            </p>
            <p className="public-price-line">Daily ES levels, Dynamic Zone, Magnet, and a structured trade plan built for prop traders and developing futures traders.</p>
            <button onClick={handleSubscribe} className="public-cta" data-testid="button-subscribe">
              Get Access on Telegram →
            </button>
            <p className="public-small-text">Secure checkout &bull; Instant access</p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Why Choose Trade Levels Pro?</h2>
            <p className="public-section-subtitle">
              A clear, repeatable framework built for prop traders and developing futures traders.
            </p>
          </div>
          <div className="public-cards">
            <div className="public-card">
              <div className="public-card-icon" data-testid="icon-levels">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
              <h3>Key Market Levels</h3>
              <p>Four support + four resistance levels for the next trading day, clearly defined.</p>
            </div>
            <div className="public-card">
              <div className="public-card-icon" data-testid="icon-bias">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Dynamic Zone & Magnet Price</h3>
              <p>Understand the zones where price is most likely to react and reset.</p>
            </div>
            <div className="public-card">
              <div className="public-card-icon" data-testid="icon-setups">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <h3>Complete Trade Plan</h3>
              <p>Daily context, bias, and 1-2 high-quality setups based on the levels — not noisy alerts.</p>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">How It Works</h2>
          </div>
          <div className="public-steps">
            <div className="public-step">
              <div className="public-step-num">1</div>
              <p>Sign Up — Subscribe once to access the private Telegram channel.</p>
            </div>
            <div className="public-step">
              <div className="public-step-num">2</div>
              <p>Receive the Plan — Tomorrow's ES plan is posted after the close in Telegram.</p>
            </div>
            <div className="public-step">
              <div className="public-step-num">3</div>
              <p>Trade with Confidence — Use the levels to trade with discipline and reduce avoidable drawdown.</p>
            </div>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Stop Guessing. Start Trading with Structure.</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            This plan teaches you how to navigate key levels and execute with discipline.
          </p>
          <button onClick={handleSubscribe} className="public-cta" data-testid="button-get-started">
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
