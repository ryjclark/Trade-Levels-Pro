import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import { Link } from "wouter";
import { TAGLINE } from "@/lib/constants";
import "./public.css";

export default function PublicAboutPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container-narrow" style={{ paddingTop: 64, paddingBottom: 100 }}>
        <h1 className="public-h1" style={{ fontSize: 44, marginBottom: 14 }}>
          About Trade Levels<span className="brand-pro">Pro</span>
        </h1>
        <p className="public-hero-subtitle" style={{ marginBottom: 28 }}>{TAGLINE}</p>

        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 18 }}>
          Trade Levels Pro publishes one focused plan per session for ES and NQ
          futures: a Magnet, a Dynamic Zone, ranked reaction levels, and a
          failed-breakdown trade plan, delivered to a private Telegram channel
          and the on-site terminal so you have it before the next open.
        </p>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 18 }}>
          The plans are reactive, not predictive. We don't post win-rates, we
          don't sell signals, and we don't post anything we wouldn't trade
          ourselves. Levels come from price structure — every other decision is
          yours.
        </p>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 36 }}>
          Educational content only. Not investment advice.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/pricing" className="btn-primary" data-testid="about-cta-pricing">
            See pricing
          </Link>
          <Link href="/archive" className="btn-secondary" data-testid="about-cta-archive">
            Browse archive
          </Link>
        </div>
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
