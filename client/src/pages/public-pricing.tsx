import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import "./public.css";

interface PublicSettings {
  joinUrl: string;
  substackUrl: string;
  xUrl: string;
  priceText: string;
}

export default function PublicPricingPage() {
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
            <div className="public-pill">Simple monthly access</div>
            <h1>Pricing</h1>
            <p className="public-muted">{settings?.priceText || "$25/month"}</p>
            {settings?.joinUrl ? (
              <a href={settings.joinUrl} className="public-cta" target="_blank" rel="noopener noreferrer" data-testid="button-subscribe">
                Subscribe / Join Telegram
              </a>
            ) : (
              <span className="public-cta public-cta-disabled">Join link coming soon</span>
            )}
          </div>
        </div>

        <div className="public-section public-card public-card-soft">
          <h2>FAQ</h2>
          <p><strong>What is included?</strong> Daily ES/NQ levels, bias, and setups.</p>
          <p><strong>When is it posted?</strong> After market close on trading days.</p>
          <p><strong>Is this financial advice?</strong> No. Educational purposes only.</p>
          <p><strong>Can I cancel?</strong> Yes, anytime via InviteMember.</p>
          <p><strong>How do I access?</strong> Join the private Telegram channel.</p>
        </div>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
