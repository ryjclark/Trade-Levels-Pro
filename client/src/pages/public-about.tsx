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

export default function PublicAboutPage() {
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
            <div className="public-pill">About Us</div>
            <h1>About Trade Levels Pro</h1>
            <p className="public-hero-subtitle">
              Professional-grade daily trade plans focused on precision and clarity.
            </p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-info-box">
            <h2>Our Approach</h2>
            <p>Trade Levels Pro delivers a daily trade plan focused on Dynamic Zones, Magnet levels, and clear support/resistance analysis for ES and NQ futures.</p>
            <p>Each plan includes the directional bias and top setups for the day, giving you a clear framework for your trading decisions.</p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-info-box">
            <h2>How The Levels Are Used</h2>
            <p>These levels provide context for potential reactions and areas of interest. They're not predictions - they're frameworks for understanding where price may find support or resistance.</p>
            <p>The plan outlines the directional bias and top setups, helping you trade with context rather than chasing moves.</p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-info-box">
            <h2>Disclaimer</h2>
            <p>This content is for educational purposes only and is not financial advice. Trading futures involves substantial risk of loss. Past performance is not indicative of future results.</p>
            <p>Always do your own research and consult with a qualified financial advisor before making any trading decisions.</p>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Ready to Get Started?</h2>
          <p className="public-section-subtitle" style={{ marginBottom: '32px' }}>
            Join traders who use professional-grade levels every day.
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
