import { Link } from "wouter";
import { TAGLINE, CONTACT_EMAIL } from "@/lib/constants";

export default function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="public-footer-block">
      <div className="public-footer-grid">
        <div className="public-footer-col">
          <div className="public-footer-brand">
            Trade Levels<span className="brand-pro">Pro</span>
          </div>
          <div className="public-footer-tag">{TAGLINE}</div>
        </div>
        <div className="public-footer-col">
          <div className="public-footer-heading">Product</div>
          <Link href="/" className="public-footer-link" data-testid="footer-link-home">Home</Link>
          <Link href="/sample" className="public-footer-link" data-testid="footer-link-sample">Sample</Link>
          <Link href="/how-it-works" className="public-footer-link" data-testid="footer-link-how">How It Works</Link>
          <Link href="/pricing" className="public-footer-link" data-testid="footer-link-pricing">Pricing</Link>
          <Link href="/indicator" className="public-footer-link" data-testid="footer-link-indicator">Indicator</Link>
          <Link href="/login" className="public-footer-link" data-testid="footer-link-login">Login</Link>
        </div>
        <div className="public-footer-col">
          <div className="public-footer-heading">Resources</div>
          <Link href="/learn" className="public-footer-link" data-testid="footer-link-learn">Learn</Link>
          <Link href="/prop-firms" className="public-footer-link" data-testid="footer-link-prop-firms">Prop Firms</Link>
          <Link href="/archive" className="public-footer-link" data-testid="footer-link-archive">Archive</Link>
          <Link href="/about" className="public-footer-link" data-testid="footer-link-about">About</Link>
        </div>
        <div className="public-footer-col">
          <div className="public-footer-heading">Legal</div>
          <Link href="/terms" className="public-footer-link" data-testid="footer-link-terms">Terms</Link>
          <Link href="/privacy" className="public-footer-link" data-testid="footer-link-privacy">Privacy</Link>
          <Link href="/risk" className="public-footer-link" data-testid="footer-link-risk">Risk Disclaimer</Link>
        </div>
        <div className="public-footer-col">
          <div className="public-footer-heading">Contact</div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="public-footer-link"
            data-testid="footer-link-email"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
      <div className="footer-disclaimer-box" data-testid="box-risk-disclaimer">
        <div className="footer-disclaimer-label">Risk Disclaimer</div>
        <p className="footer-disclaimer-text">
          Trading futures involves substantial risk and is not suitable for all
          investors. Past performance is not indicative of future results.
          Trade Levels Pro provides educational content only and is not
          investment advice.
        </p>
      </div>
      <div className="public-footer-copy">
        © {year} Trade Levels Pro. All rights reserved.
      </div>
    </footer>
  );
}
