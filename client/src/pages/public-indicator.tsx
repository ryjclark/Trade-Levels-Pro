import { Check, LineChart } from "lucide-react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import { useSeo } from "@/hooks/use-seo";
import { CTA_INDICATOR_MAILTO, INDICATOR_PRICE, SITE_NAME } from "@/lib/constants";

const FEATURES = [
  "Pine Script for TradingView (Pro+ tier required)",
  "Auto-calculates Magnet, Dynamic Zone, R1–R4, and S1–S4 in real-time",
  "Customizable colors, line styles, and labels",
  "Lifetime updates",
];

export default function PublicIndicatorPage() {
  useSeo({
    title: `Trade Levels Pro Indicator for TradingView | ${SITE_NAME}`,
    description: "The Pine Script indicator that auto-calculates the Magnet, Dynamic Zone, and full S/R ladder on your TradingView chart. One-time purchase, lifetime updates.",
    path: "/indicator",
  });

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">
        <section className="public-hero">
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="hero-noise" aria-hidden="true" />
          <div className="public-hero-content public-hero-centered">
            <span className="public-section-eyebrow">Product</span>
            <h1>
              Trade Levels Pro <span className="accent">Indicator</span>
            </h1>
            <p className="public-hero-subtitle">
              The Pine Script that auto-calculates the Magnet, Dynamic Zone,
              and S/R ladder. Get the tool, not just the daily plan.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 24 }}>
            <div className="indicator-preview" data-testid="card-indicator-preview">
              <div className="indicator-preview-icon"><LineChart size={28} /></div>
              <div className="indicator-preview-text">Indicator preview coming soon</div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <div className="pricing-plan-wrap">
              <div className="pricing-plan" data-testid="card-indicator-plan">
                <div className="pricing-badge">ONE-TIME</div>
                <div className="pricing-plan-name">TradingView Indicator</div>
                <div className="pricing-plan-price">{INDICATOR_PRICE}</div>
                <div className="pricing-plan-period">one-time · lifetime updates</div>
                <div className="pricing-features">
                  {FEATURES.map((f, i) => (
                    <div className="pricing-feature" key={i}>
                      <span className="pricing-check"><Check size={12} strokeWidth={3} /></span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={CTA_INDICATOR_MAILTO}
                  className="subscribe-button"
                  data-testid="button-cta-indicator"
                >
                  Get the Indicator →
                </a>
                <p className="subscribe-secure-text">
                  Email checkout for now — Stripe coming soon.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        <PublicFooter />
      </div>
    </div>
  );
}
