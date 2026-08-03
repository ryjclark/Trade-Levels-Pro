import { useState } from "react";
import { Check } from "lucide-react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import FaqAccordion from "@/components/faq-accordion";
import Reveal from "@/components/reveal";
import SectionDivider from "@/components/section-divider";
import { useSeo } from "@/hooks/use-seo";
import {
  CTA_TEXT, CTA_MAILTO, CTA_MAILTO_ANNUAL,
  PRICE, PRICE_ANNUAL, ANNUAL_SAVINGS_LABEL, SITE_NAME,
} from "@/lib/constants";

const FAQ = [
  { q: "Which markets does this cover?", a: "Both ES and NQ E-mini futures, with ES as the primary focus. You get a plan and levels for each." },
  { q: "Is this an alerts service?", a: "No. It is a daily plan with the key levels and ranked setups. You learn to navigate the levels and make your own decisions." },
  { q: "Who is this for?", a: "Prop traders and developing futures traders who want a repeatable, disciplined process around the ES and NQ session." },
  { q: "What do I get each day?", a: "The Magnet and Dynamic Zone, the key structure and reaction levels, a daily bias, and ranked failed-breakdown longs plus secondary rejection shorts, for both ES and NQ." },
  { q: "When are plans posted?", a: "By 5:30 PM ET each trading day, for the next session, to Telegram and the on-site terminal." },
  { q: "Is the market data live?", a: "No. Price data shown on the site is delayed about a minute and is not a live trading feed. The levels are set after the cash close." },
  { q: "Can I cancel anytime?", a: "Yes. Email support to cancel and we will stop future billing. There are no contracts and no long-term commitment." },
  { q: "Do you offer refunds?", a: "You can cancel anytime to stop future billing, and access continues through the period you already paid for. Because the plans are delivered daily, we do not refund elapsed subscription time." },
];

const FEATURES = [
  "Daily ES and NQ levels and trade plan",
  "Magnet, Dynamic Zone, and ranked reaction levels",
  "Ranked failed-breakdown longs plus rejection shorts",
  "Posted by 5:30 PM ET via Telegram and the on-site terminal",
  "Cancel anytime",
];

export default function PublicPricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  useSeo({
    title: `Pricing — Founding Members | ${SITE_NAME}`,
    description: "Founding Members pricing for Trade Levels Pro: $49/month or $490/year for daily ES and NQ futures trade plans delivered to a private Telegram channel and the on-site terminal.",
    path: "/pricing",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  });

  const isAnnual = billing === "annual";
  const price = isAnnual ? PRICE_ANNUAL : PRICE;
  const period = isAnnual ? "per year" : "per month";
  const ctaHref = isAnnual ? CTA_MAILTO_ANNUAL : CTA_MAILTO;

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
            <h1>
              Founding Members <span className="accent">Pricing</span>
            </h1>
            <p className="public-hero-subtitle">
              One simple plan. Daily ES and NQ levels, bias, and setups
              delivered to a private Telegram channel.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 0 }}>
            <div className="pricing-plan-wrap">
              <div className="pricing-toggle" role="tablist" aria-label="Billing period">
                <button
                  role="tab"
                  aria-selected={!isAnnual}
                  className={`pricing-toggle-btn ${!isAnnual ? "active" : ""}`}
                  onClick={() => setBilling("monthly")}
                  data-testid="toggle-monthly"
                >
                  Monthly
                </button>
                <button
                  role="tab"
                  aria-selected={isAnnual}
                  className={`pricing-toggle-btn ${isAnnual ? "active" : ""}`}
                  onClick={() => setBilling("annual")}
                  data-testid="toggle-annual"
                >
                  Annual
                  <span className="pricing-toggle-save">{ANNUAL_SAVINGS_LABEL}</span>
                </button>
              </div>
              <div className="pricing-plan" data-testid="card-pricing-plan">
                <div className="pricing-badge">FOUNDING MEMBERS</div>
                <div className="pricing-plan-name">Trade Levels Pro</div>
                <div className="pricing-plan-price" data-testid="text-price">{price}</div>
                <div className="pricing-plan-period">{period}</div>
                <div className="pricing-features">
                  {FEATURES.map((f, i) => (
                    <div className="pricing-feature" key={i}>
                      <span className="pricing-check"><Check size={12} strokeWidth={3} /></span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={ctaHref} className="subscribe-button" data-testid="button-cta-pricing">
                  {CTA_TEXT} →
                </a>
                <p className="subscribe-onboard-text">
                  Founding-member access. Email to subscribe and we'll send your
                  payment link and Telegram invite (usually within 24 hours).
                </p>
                <p className="subscribe-secure-text">No contracts. Cancel anytime.</p>
                <p className="subscribe-secure-text">Cancel anytime to stop future billing.</p>
              </div>
            </div>
          </section>
        </Reveal>

        <SectionDivider />

        <Reveal>
          <section className="public-section">
            <div className="public-section-header">
              <span className="public-section-eyebrow">FAQ</span>
              <h2 className="public-section-title">Frequently Asked Questions</h2>
            </div>
            <FaqAccordion items={FAQ} />
          </section>
        </Reveal>

        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Ready to start?</h2>
          <a href={ctaHref} className="btn-primary" data-testid="button-cta-pricing-final">
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
