import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import { Link } from "wouter";
import { useSeo } from "@/hooks/use-seo";
import { SITE_NAME } from "@/lib/constants";
import "./public.css";

export default function PublicTradingViewPage() {
  useSeo({
    title: `TradingView Guide | ${SITE_NAME}`,
    description:
      "How to put the Trade Levels Pro daily ES and NQ levels on your TradingView chart using the optional Pine overlay.",
    path: "/tradingview",
  });

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container-narrow" style={{ paddingTop: 64, paddingBottom: 100 }}>
        <h1 className="public-h1" style={{ fontSize: 44, marginBottom: 14 }}>
          TradingView <span className="accent">guide</span>
        </h1>
        <p className="public-hero-subtitle" style={{ marginBottom: 28 }}>
          Optional Pine overlay for the daily ES and NQ levels. Telegram and Today&apos;s Plan stay the primary delivery.
        </p>

        <h2 style={{ fontSize: 22, marginBottom: 14 }}>Install in three steps</h2>
        <ol style={{ color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 18, paddingLeft: 22 }}>
          <li>Open Today&apos;s Plan (or levels export) → Show code → Copy.</li>
          <li>In TradingView, open Pine Editor → New → Paste → Add to chart.</li>
          <li>After each new plan (~5:30 PM ET), replace the script with a full re-copy.</li>
        </ol>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>
          This is not one-click auto-publish. Re-copy when the next plan posts.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/pricing" className="btn-primary" data-testid="tv-cta-pricing">
            Subscribe →
          </Link>
          <Link href="/sample" className="btn-secondary" data-testid="tv-cta-sample">
            See a sample plan →
          </Link>
          <Link href="/how-it-works" className="btn-secondary" data-testid="tv-cta-how">
            How it works →
          </Link>
        </div>
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
