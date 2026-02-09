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
              Daily ES levels and a structured plan built for prop traders and developing futures traders.
            </p>
            <p className="public-price-line">Focus on the levels that matter to reduce drawdown and trade with more discipline.</p>
            <button onClick={handleSubscribe} className="public-cta" data-testid="button-subscribe">
              Get Access on Telegram →
            </button>
            <p className="public-small-text">Secure checkout &bull; Instant access</p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Why It Works</h2>
            <p className="public-section-subtitle">
              A clear, repeatable framework built for prop traders and developing futures traders.
            </p>
          </div>
          <div className="public-cards">
            <div className="public-card">
              <div className="public-card-icon" data-testid="icon-levels">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
              <h3>Levels-First Clarity</h3>
              <p>Dynamic Zone, Magnet, and key S/R levels to cut out the noise and focus on what matters.</p>
            </div>
            <div className="public-card">
              <div className="public-card-icon" data-testid="icon-bias">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Prop-Trader Focused</h3>
              <p>Built to create a repeatable process and protect evaluation accounts. Trade with discipline, not emotion.</p>
            </div>
            <div className="public-card">
              <div className="public-card-icon" data-testid="icon-setups">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <h3>High-Quality Setups</h3>
              <p>1-2 clean setups per day based on the levels — not alerts, just structured examples of how to trade them.</p>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Simple. Consistent. Professional.</h2>
          </div>
          <div className="public-steps">
            <div className="public-step">
              <div className="public-step-num">1</div>
              <p>Subscribe for $20/month using our secure checkout.</p>
            </div>
            <div className="public-step">
              <div className="public-step-num">2</div>
              <p>Get instant access to our private Telegram channel.</p>
            </div>
            <div className="public-step">
              <div className="public-step-num">3</div>
              <p>Receive your daily plan and levels before each session.</p>
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
