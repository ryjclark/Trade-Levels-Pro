import { Link } from "wouter";
import "./public.css";

export default function PublicTrackRecordPage() {
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
            <div className="public-pill">Performance</div>
            <h1>Track Record</h1>
            <p className="public-muted">Performance history and level accuracy.</p>
          </div>
        </div>

        <div className="public-section public-card public-card-soft">
          <h2>Coming Soon</h2>
          <p className="public-muted">Track record details and historical performance will be available soon.</p>
          <p className="public-muted">Subscribe to stay updated on our latest analysis and results.</p>
        </div>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
