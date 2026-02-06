import { Link } from "wouter";
import "./public.css";

const PAYMENT_URL = "https://im.page/tradelevelspro";

export default function PublicAboutPage() {
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
            <Link href="/about" className="public-link public-link-active" data-testid="link-about">About</Link>
            <Link href="/pricing" className="public-link" data-testid="link-pricing">Pricing</Link>
            <Link href="/subscribe" className="public-link" data-testid="link-subscribe">Subscribe</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>About <span className="accent">Trade Levels Pro</span></h1>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="public-info-box">
            <p>Trade Levels Pro was created for traders who are tired of guessing, chasing moves, and reacting emotionally to the market.</p>
            <p>This service is built around one core idea: <strong>professional trading requires structure.</strong></p>
            <p>Every trading day, we publish a clear, repeatable plan for ES futures based on:</p>
            <ul>
              <li>Dynamic Zones</li>
              <li>Magnet Levels</li>
              <li>Key Support and Resistance</li>
              <li>Market Context and Bias</li>
              <li>High-Probability Setups</li>
            </ul>
            <p>No hype. No signal spam. No unrealistic promises.</p>
            <p>Just disciplined preparation and consistent execution.</p>
            <p>Trade Levels Pro is designed for traders who want to think in probabilities, manage risk properly, and treat trading like a business.</p>
            <p><strong>If you value structure over shortcuts, you're in the right place.</strong></p>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Ready to Get Started?</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Join traders who use professional-grade levels every day.
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
