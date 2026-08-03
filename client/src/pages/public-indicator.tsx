import { Check } from "lucide-react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import { useSeo } from "@/hooks/use-seo";
import { CONTACT_EMAIL, INDICATOR_PRICE, SITE_NAME } from "@/lib/constants";

const WAITLIST_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Indicator waitlist")}`;

const FEATURES = [
  "Pine Script for TradingView (Pro+ tier required)",
  "Plots the Magnet, Dynamic Zone, and R1–R4 / S1–S4 ladder on your chart",
  "Customizable colors, line styles, and labels",
  "Lifetime updates once released",
];

export default function PublicIndicatorPage() {
  useSeo({
    title: `Trade Levels Pro Indicator (Waitlist) | ${SITE_NAME}`,
    description: "The Pine Script indicator that plots the Magnet, Dynamic Zone, and full S/R ladder on your TradingView chart is in development. Join the waitlist to be notified when it launches.",
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
            <span className="public-section-eyebrow">In development</span>
            <h1>
              Trade Levels Pro <span className="accent">Indicator</span>
            </h1>
            <p className="public-hero-subtitle">
              A Pine Script indicator that plots the Magnet, Dynamic Zone, and
              S/R ladder directly on your TradingView chart is on the way. It is
              not available for purchase yet. Join the waitlist and we will email
              you the moment it is ready.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <div className="pricing-plan-wrap">
              <div className="pricing-plan" data-testid="card-indicator-plan">
                <div className="pricing-badge">COMING SOON</div>
                <div className="pricing-plan-name">TradingView Indicator</div>
                <div className="pricing-plan-price">Waitlist</div>
                <div className="pricing-plan-period">
                  planned one-time price around {INDICATOR_PRICE} (not yet for sale)
                </div>
                <div className="pricing-features">
                  {FEATURES.map((f, i) => (
                    <div className="pricing-feature" key={i}>
                      <span className="pricing-check"><Check size={12} strokeWidth={3} /></span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={WAITLIST_MAILTO}
                  className="subscribe-button"
                  data-testid="button-cta-indicator"
                >
                  Join the waitlist →
                </a>
                <p className="subscribe-secure-text">
                  No payment now. We will email you when the indicator is
                  available.
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
