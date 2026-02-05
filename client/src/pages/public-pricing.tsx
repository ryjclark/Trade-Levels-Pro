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
            <Link href="/about" className="public-link" data-testid="link-about">About</Link>
          </div>
        </nav>

        <section className="public-hero">
          <div className="public-hero-content">
            <div className="public-pill">Simple Pricing</div>
            <h1>Pricing</h1>
            <p className="public-hero-subtitle">
              One straightforward subscription. Full access to daily trade plans.
            </p>
            <p className="public-price-text">{settings?.priceText || "$20/month"}</p>
            <Link href="/subscribe" className="public-cta" data-testid="button-subscribe">
              Subscribe Now →
            </Link>
          </div>
        </section>

        <section className="public-section">
          <div className="public-info-box">
            <h2>Frequently Asked Questions</h2>
            <p><strong>What is included?</strong><br />Daily ES/NQ levels, directional bias, and actionable setups posted after market close.</p>
            <p><strong>When is it posted?</strong><br />Trade plans are published after market close on trading days.</p>
            <p><strong>Is this financial advice?</strong><br />No. This is for educational purposes only. Always do your own research.</p>
            <p><strong>Can I cancel?</strong><br />Yes, you can cancel anytime via InviteMember.</p>
            <p><strong>How do I access?</strong><br />After subscribing, you'll get instant access to the private Telegram channel.</p>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Start Trading with Confidence</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Get daily levels and trade plans delivered straight to your Telegram.
          </p>
          <Link href="/subscribe" className="public-cta">
            Join Now →
          </Link>
        </section>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
