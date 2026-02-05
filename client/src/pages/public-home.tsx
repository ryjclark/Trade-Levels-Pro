import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import "./public.css";

interface PublicSettings {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
}

export default function PublicHomePage() {
  const { data: settings } = useQuery<PublicSettings>({
    queryKey: ["/api/public/settings"],
  });

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
            <div className="public-pill">Daily after-close plan</div>
            <h1>Trade Levels Pro</h1>
            <p className="public-muted">Daily ES/NQ levels (Dynamic Zone, Magnet, Support/Resistance) + trade plan.</p>
            <p><strong>{settings?.priceText || "$25/month"}</strong></p>
            {settings?.joinUrl ? (
              <a href={settings.joinUrl} className="public-cta" target="_blank" rel="noopener noreferrer" data-testid="button-subscribe">
                Subscribe / Join Telegram
              </a>
            ) : (
              <span className="public-cta public-cta-disabled">Join link coming soon</span>
            )}
          </div>
        </div>

        <div className="public-section">
          <h2 className="public-section-title">What You Get</h2>
          <div className="public-cards">
            <div className="public-card public-card-soft">
              <h3>Daily Levels</h3>
              <p className="public-muted">Dynamic Zone, Magnet, and clean support/resistance.</p>
            </div>
            <div className="public-card public-card-soft">
              <h3>Directional Bias</h3>
              <p className="public-muted">Clear context on how the day is likely to trade.</p>
            </div>
            <div className="public-card public-card-soft">
              <h3>Best Setups</h3>
              <p className="public-muted">1–2 actionable setups, written simply.</p>
            </div>
          </div>
        </div>

        <div className="public-section public-card public-card-soft">
          <h2>Pricing</h2>
          <p>{settings?.priceText || "$25/month"}</p>
          {settings?.joinUrl && (
            <a href={settings.joinUrl} className="public-cta" target="_blank" rel="noopener noreferrer">
              Subscribe / Join Telegram
            </a>
          )}
        </div>

        <div className="public-section public-card public-card-soft">
          <h2>Find Me</h2>
          {settings?.substackUrl && (
            <p><a className="public-link" href={settings.substackUrl} target="_blank" rel="noopener noreferrer">Substack</a></p>
          )}
          {settings?.xUrl && (
            <p><a className="public-link" href={settings.xUrl} target="_blank" rel="noopener noreferrer">X / Twitter</a></p>
          )}
          {!settings?.substackUrl && !settings?.xUrl && (
            <p className="public-muted">Links coming soon.</p>
          )}
        </div>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
