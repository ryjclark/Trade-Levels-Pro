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

export default function PublicTrackRecordPage() {
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
            <div className="public-pill">Performance</div>
            <h1>Track Record</h1>
            <p className="public-hero-subtitle">
              Historical performance and level accuracy for ES and NQ trade plans.
            </p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-info-box">
            <h2>Coming Soon</h2>
            <p>We're building out a comprehensive track record section that will showcase:</p>
            <p>Historical level accuracy and hit rates</p>
            <p>Weekly and monthly performance summaries</p>
            <p>Notable setups and key level reactions</p>
            <p style={{ marginTop: '24px' }}>Subscribe to stay updated on our latest analysis and results.</p>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Want to See It in Action?</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Join now and experience professional-grade trade plans daily.
          </p>
          <a href={paymentUrl} className="public-cta" target="_blank" rel="noopener noreferrer" data-testid="button-subscribe">
            Subscribe Now →
          </a>
        </section>

        <footer className="public-footer">
          Trade Smarter. React to Price. No Predictions.
        </footer>
      </div>
    </div>
  );
}
