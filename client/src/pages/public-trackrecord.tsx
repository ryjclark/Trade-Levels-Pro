import { Link } from "wouter";
import "./public.css";

const PAYMENT_URL = "https://im.page/tradelevelspro";

export default function PublicTrackRecordPage() {
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
            <Link href="/subscribe" className="public-link" data-testid="link-subscribe">Subscribe</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>Track Record</h1>
            <p className="public-hero-subtitle">
              Historical performance and level accuracy for ES & NQ trade plans.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="public-info-box">
            <h2>Coming Soon</h2>
            <p>We're building out a comprehensive track record section that will showcase:</p>
            <ul>
              <li>Historical level accuracy and hit rates</li>
              <li>Weekly and monthly performance summaries</li>
              <li>Notable setups and key level reactions</li>
            </ul>
            <p>Subscribe to stay updated on our latest analysis and results.</p>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Want to See It in Action?</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Join now and experience professional-grade trade plans daily.
          </p>
          <button onClick={handleSubscribe} className="public-cta" data-testid="button-subscribe">
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
