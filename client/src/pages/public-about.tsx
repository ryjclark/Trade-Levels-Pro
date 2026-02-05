import { Link } from "wouter";
import "./public.css";

export default function PublicAboutPage() {
  return (
    <div className="public-page">
      <div className="public-container">
        <nav className="public-navbar">
          <div className="public-brand">Trade Levels Pro</div>
          <div className="public-nav-links">
            <Link href="/" className="public-link" data-testid="link-home">Home</Link>
            <Link href="/pricing" className="public-link" data-testid="link-pricing">Pricing</Link>
            <Link href="/trackrecord" className="public-link" data-testid="link-trackrecord">Track Record</Link>
          </div>
        </nav>

        <div className="public-hero">
          <div className="public-hero-card">
            <div className="public-pill">About</div>
            <h1>About</h1>
            <p className="public-muted">Trade Levels Pro delivers a daily trade plan focused on Dynamic Zones, Magnet levels, and clear support/resistance.</p>
          </div>
        </div>

        <div className="public-section public-card public-card-soft">
          <h2>How The Levels Are Used</h2>
          <p>These levels provide context for potential reactions and areas of interest. The plan outlines the directional bias and top setups for the day.</p>
        </div>

        <div className="public-section public-card public-card-soft">
          <h2>Disclaimer</h2>
          <p>This content is for educational purposes only and is not financial advice.</p>
        </div>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
