import { Check } from "lucide-react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import FaqAccordion from "@/components/faq-accordion";
import { CTA_TEXT, CTA_MAILTO, PRICE } from "@/lib/constants";

const FAQ = [
  { q: "Is this ES only?", a: "Yes — ES only for now. NQ is on the roadmap." },
  { q: "Is this an alerts service?", a: "No. It's a daily plan with key levels and 1–2 high-quality setups. You learn to navigate the levels and make your own decisions." },
  { q: "Who is this for?", a: "Prop traders and developing futures traders who want a repeatable, disciplined process around the ES session." },
  { q: "What do I get each day?", a: "Dynamic Zone, Magnet, R1–R4 / S1–S4, daily bias, and 1–2 setups based on those levels." },
  { q: "When are plans posted?", a: "After market close, for the next trading session." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no long-term commitment." },
];

const FEATURES = [
  "Daily ES support & resistance levels",
  "Dynamic Zone + Magnet",
  "Daily bias + 1–2 high-quality setups",
  "Delivered via Telegram after the close",
  "Cancel anytime",
];

export default function PublicPricingPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">
        <section className="public-hero">
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="public-hero-content">
            <h1>
              Founding Members <span className="accent">Pricing</span>
            </h1>
            <p className="public-hero-subtitle">
              One simple plan. Daily ES levels, bias, and setups delivered to a
              private Telegram channel.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="pricing-plan" data-testid="card-pricing-plan">
            <div className="pricing-badge">FOUNDING MEMBERS</div>
            <div className="pricing-plan-name">Trade Levels Pro</div>
            <div className="pricing-plan-price">{PRICE}</div>
            <div className="pricing-plan-period">per month</div>
            <div className="pricing-features">
              {FEATURES.map((f, i) => (
                <div className="pricing-feature" key={i}>
                  <span className="pricing-check"><Check size={12} strokeWidth={3} /></span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <a href={CTA_MAILTO} className="subscribe-button" data-testid="button-cta-pricing">
              {CTA_TEXT} →
            </a>
            <p className="subscribe-secure-text">No contracts • Cancel in one click</p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Frequently Asked Questions</h2>
          </div>
          <FaqAccordion items={FAQ} />
        </section>

        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Ready to start?</h2>
          <a href={CTA_MAILTO} className="public-cta" data-testid="button-cta-pricing-final">
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
