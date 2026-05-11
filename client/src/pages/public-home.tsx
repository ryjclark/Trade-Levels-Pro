import { useState } from "react";
import { Link } from "wouter";
import {
  BarChart3, Target, Layers, Compass, Send,
  Activity, TrendingUp, Magnet,
  Check, X, CheckCircle2,
} from "lucide-react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import TelegramBubble from "@/components/telegram-bubble";
import FaqAccordion from "@/components/faq-accordion";
import { CTA_TEXT, CTA_MAILTO, PRICE_PER_MONTH, TAGLINE } from "@/lib/constants";

const FOR_LIST = [
  "You trade ES futures and want a repeatable, level-based process.",
  "You're working through a prop firm evaluation or funded account.",
  "You want to react to price instead of predicting it.",
  "You value structure over shortcuts and signal spam.",
];
const NOT_FOR_LIST = [
  "You want copy-trading alerts or buy/sell signals.",
  "You're looking for guaranteed profits or win-rate claims.",
  "You want indices, options, crypto, or stocks coverage.",
  "You're not willing to do the work of executing a plan.",
];

const METHOD = [
  { icon: Activity, title: "Map the Dynamic Zone", body: "Define the reactive band where price is most likely to consolidate or reverse." },
  { icon: Target, title: "Identify the Magnet", body: "Locate the level price tends to pull back toward intraday." },
  { icon: Layers, title: "Layer Support and Resistance", body: "Define R1–R4 and S1–S4 to frame the day's playable range." },
  { icon: Compass, title: "Set the Bias", body: "Establish a directional lean based on context, not prediction." },
  { icon: Send, title: "Define 1–2 High-Quality Setups", body: "Concrete, level-based ideas you can prepare for ahead of the open." },
];

const FAQ = [
  { q: "Is this ES only?", a: "Yes — ES only for now. NQ is on the roadmap." },
  { q: "Is this an alerts service?", a: "No. It's a daily plan with key levels and 1–2 high-quality setups. You learn to navigate the levels and make your own decisions — not follow someone else's calls." },
  { q: "Who is this for?", a: "Prop traders and developing futures traders who want a repeatable, disciplined process around the ES session." },
  { q: "When are plans posted?", a: "After market close, for the next trading session — so you're prepared before the open." },
];

export default function PublicHomePage() {
  const [email, setEmail] = useState("");
  const [signupStatus, setSignupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [signupMessage, setSignupMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSignupStatus("error");
      setSignupMessage("Please enter a valid email.");
      return;
    }
    setSignupStatus("loading");
    try {
      const res = await fetch("/api/preview-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSignupStatus("error");
        setSignupMessage(data?.error || "Something went wrong.");
        return;
      }
      setSignupStatus("success");
      setSignupMessage("We've got it. Sample on the way.");
      setEmail("");
    } catch {
      setSignupStatus("error");
      setSignupMessage("Network error, please try again.");
    }
  };

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">

        {/* 1. Hero */}
        <section className="public-hero">
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="hero-grid" aria-hidden="true" />
          <div className="public-hero-content">
            <div className="hero-pill" data-testid="pill-founding-members">
              <span className="hero-pill-dot" />
              Founding Members
            </div>
            <h1>
              Trade Levels <span className="accent">Pro</span>
            </h1>
            <p className="public-hero-subtitle">{TAGLINE}</p>
            <p className="public-price-line">
              Daily ES futures trade plans with Dynamic Zone, Magnet, and key
              support/resistance — built for prop traders and developing
              futures traders.
            </p>
            <a href={CTA_MAILTO} className="public-cta" data-testid="button-cta-hero">
              {CTA_TEXT} →
            </a>
            <p className="public-small-text">{PRICE_PER_MONTH} • Cancel anytime</p>
          </div>
        </section>

        {/* 2. Email capture */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="capture-box" data-testid="box-email-capture">
            <div>
              <h3 className="capture-title">See a free sample plan first.</h3>
              <p className="capture-sub">
                Drop your email and we'll send you a sample so you know exactly
                what you're getting.
              </p>
            </div>
            <form onSubmit={handleSignup} className="capture-form">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="capture-input"
                disabled={signupStatus === "loading"}
                data-testid="input-preview-email"
              />
              <button
                type="submit"
                className="capture-button"
                disabled={signupStatus === "loading"}
                data-testid="button-preview-submit"
              >
                {signupStatus === "loading" ? (
                  <>
                    <span className="capture-spinner" />
                    Sending…
                  </>
                ) : (
                  "Send me a sample"
                )}
              </button>
            </form>
            {signupMessage && (
              <p
                className={
                  signupStatus === "success"
                    ? "capture-msg capture-msg-ok"
                    : "capture-msg capture-msg-err"
                }
                data-testid="text-preview-message"
              >
                {signupStatus === "success" && <CheckCircle2 size={16} />}
                {signupMessage}
              </p>
            )}
          </div>
        </section>

        {/* 3. Sample teaser — Telegram bubble */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">A look inside the daily plan</h2>
            <p className="public-section-subtitle">
              Delivered as a single, structured Telegram message every trading day.
            </p>
          </div>
          <TelegramBubble />
          <div className="tg-cta-row">
            <Link href="/sample" className="public-link-arrow" data-testid="link-view-full-sample">
              View the full sample →
            </Link>
          </div>
        </section>

        {/* 4. Three feature cards */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Why Trade Levels Pro?</h2>
          </div>
          <div className="public-cards">
            <div className="public-card" data-testid="card-feature-levels">
              <div className="public-card-icon"><BarChart3 size={22} /></div>
              <h3>Key Market Levels</h3>
              <p>R1–R4 and S1–S4 for the next ES session, clearly defined before the open.</p>
            </div>
            <div className="public-card" data-testid="card-feature-zone">
              <div className="public-card-icon"><Magnet size={22} /></div>
              <h3>Dynamic Zone & Magnet</h3>
              <p>Understand the reactive zones where price is most likely to pause, reverse, or reset.</p>
            </div>
            <div className="public-card" data-testid="card-feature-bias">
              <div className="public-card-icon"><TrendingUp size={22} /></div>
              <h3>Bias & Setups</h3>
              <p>Daily bias and 1–2 high-quality setups based on the levels — not noisy alerts.</p>
            </div>
          </div>
        </section>

        {/* 5. Who this is for / not for */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Who this is for</h2>
          </div>
          <div className="who-grid">
            <div className="who-col">
              <h3>This is for you if…</h3>
              <ul>
                {FOR_LIST.map((t, i) => (
                  <li key={i}>
                    <span className="who-icon who-icon-ok"><Check size={12} strokeWidth={3} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="who-divider" aria-hidden="true" />
            <div className="who-col">
              <h3>This is not for you if…</h3>
              <ul>
                {NOT_FOR_LIST.map((t, i) => (
                  <li key={i}>
                    <span className="who-icon who-icon-no"><X size={12} strokeWidth={3} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Methodology steps */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">The Methodology</h2>
            <p className="public-section-subtitle">Five repeatable steps, applied the same way every day.</p>
          </div>
          <div className="method-list">
            {METHOD.map((m, i) => {
              const Icon = m.icon;
              return (
                <div className="method-step" key={i} data-testid={`method-step-${i + 1}`}>
                  <div className="method-icon"><Icon size={20} /></div>
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. How it works */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">How It Works</h2>
          </div>
          <div className="public-steps">
            <div className="public-step"><div className="public-step-num">1</div><p>Subscribe once to access the private Telegram channel.</p></div>
            <div className="public-step"><div className="public-step-num">2</div><p>Receive tomorrow's ES plan in Telegram after the close.</p></div>
            <div className="public-step"><div className="public-step-num">3</div><p>Use the levels and bias to trade with discipline at the open.</p></div>
          </div>
        </section>

        {/* 8. FAQ accordion */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Common Questions</h2>
          </div>
          <FaqAccordion items={FAQ} />
        </section>

        {/* 9. Final CTA */}
        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Trade with structure tomorrow.</h2>
          <p className="public-section-subtitle" style={{ marginBottom: "32px" }}>
            {PRICE_PER_MONTH} • Cancel anytime.
          </p>
          <a href={CTA_MAILTO} className="public-cta" data-testid="button-cta-final">
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
