import { useState } from "react";
import { Link } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { CTA_TEXT, CTA_MAILTO, PRICE_PER_MONTH, TAGLINE } from "@/lib/constants";

export default function PublicHomePage() {
  const [email, setEmail] = useState("");
  const [signupStatus, setSignupStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
      setSignupMessage("You're on the list. Watch your inbox.");
      setEmail("");
    } catch {
      setSignupStatus("error");
      setSignupMessage("Network error, please try again.");
    }
  };

  return (
    <div className="public-page">
      <div className="public-container">
        <PublicNav />

        {/* 1. Hero */}
        <section className="public-hero">
          <div className="public-hero-content">
            <h1>
              Trade Levels <span className="accent">Pro</span>
            </h1>
            <p className="public-hero-subtitle">{TAGLINE}</p>
            <p className="public-price-line">
              Daily ES futures trade plans with Dynamic Zone, Magnet, and key
              support/resistance — built for prop traders and developing
              futures traders.
            </p>
            <a
              href={CTA_MAILTO}
              className="public-cta"
              data-testid="button-cta-hero"
            >
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
                {signupStatus === "loading" ? "Sending…" : "Send me a sample"}
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
                {signupMessage}
              </p>
            )}
          </div>
        </section>

        {/* 3. Sample teaser */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">A look inside the daily plan</h2>
            <p className="public-section-subtitle">
              Every plan follows the same clear structure — you always know
              where to look.
            </p>
          </div>
          <div className="sample-card sample-card-teaser" data-testid="card-sample-teaser">
            <div className="sample-title">ES Daily Trade Plan — Sample</div>
            <div className="sample-row">
              <div className="sample-label">Bias</div>
              <div className="sample-value">Bullish above magnet</div>
            </div>
            <div className="sample-row">
              <div className="sample-label">Dynamic Zone</div>
              <div className="sample-value mono">5,812 – 5,824</div>
            </div>
            <div className="sample-row">
              <div className="sample-label">Magnet</div>
              <div className="sample-value mono">5,818</div>
            </div>
            <div className="sample-block">
              <div className="sample-label">Resistance</div>
              <div className="sample-grid">
                <div><span className="sample-tag">R1</span><span className="mono">5,832</span></div>
                <div><span className="sample-tag">R2</span><span className="mono">5,847</span></div>
                <div><span className="sample-tag">R3</span><span className="mono">5,861</span></div>
                <div><span className="sample-tag">R4</span><span className="mono">5,878</span></div>
              </div>
            </div>
            <div className="sample-cta-row">
              <Link href="/sample" className="public-link-arrow" data-testid="link-view-full-sample">
                View the full sample →
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Three feature cards */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Why Trade Levels Pro?</h2>
          </div>
          <div className="public-cards">
            <div className="public-card">
              <div className="public-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
              <h3>Key Market Levels</h3>
              <p>R1–R4 and S1–S4 for the next ES session, clearly defined before the open.</p>
            </div>
            <div className="public-card">
              <div className="public-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Dynamic Zone & Magnet</h3>
              <p>Understand the reactive zones where price is most likely to pause, reverse, or reset.</p>
            </div>
            <div className="public-card">
              <div className="public-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
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
            <div className="who-col who-col-for">
              <h3>This is for you if…</h3>
              <ul>
                <li>You trade ES futures and want a repeatable, level-based process.</li>
                <li>You're working through a prop firm evaluation or funded account.</li>
                <li>You want to react to price instead of predicting it.</li>
                <li>You value structure over shortcuts and signal spam.</li>
              </ul>
            </div>
            <div className="who-col who-col-not">
              <h3>This is not for you if…</h3>
              <ul>
                <li>You want copy-trading alerts or buy/sell signals.</li>
                <li>You're looking for guaranteed profits or win-rate claims.</li>
                <li>You want indices, options, crypto, or stocks coverage.</li>
                <li>You're not willing to do the work of executing a plan.</li>
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
            <div className="method-step"><div className="public-step-num">1</div><div><h3>Map the Dynamic Zone</h3><p>Define the reactive band where price is most likely to consolidate or reverse.</p></div></div>
            <div className="method-step"><div className="public-step-num">2</div><div><h3>Identify the Magnet</h3><p>Locate the level price tends to pull back toward intraday.</p></div></div>
            <div className="method-step"><div className="public-step-num">3</div><div><h3>Layer Support and Resistance</h3><p>Define R1–R4 and S1–S4 to frame the day's playable range.</p></div></div>
            <div className="method-step"><div className="public-step-num">4</div><div><h3>Set the Bias</h3><p>Establish a directional lean based on context, not prediction.</p></div></div>
            <div className="method-step"><div className="public-step-num">5</div><div><h3>Define 1–2 High-Quality Setups</h3><p>Concrete, level-based ideas you can prepare for ahead of the open.</p></div></div>
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

        {/* 8. Inline FAQ */}
        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Common Questions</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item"><h3 className="faq-question">Is this ES only?</h3><p className="faq-answer">Yes — ES only for now. NQ is on the roadmap.</p></div>
            <div className="faq-item"><h3 className="faq-question">Is this an alerts service?</h3><p className="faq-answer">No. It's a daily plan with key levels and 1–2 high-quality setups. You learn to navigate the levels and make your own decisions — not follow someone else's calls.</p></div>
            <div className="faq-item"><h3 className="faq-question">Who is this for?</h3><p className="faq-answer">Prop traders and developing futures traders who want a repeatable, disciplined process around the ES session.</p></div>
            <div className="faq-item"><h3 className="faq-question">When are plans posted?</h3><p className="faq-answer">After market close, for the next trading session — so you're prepared before the open.</p></div>
          </div>
        </section>

        {/* 9. Final CTA */}
        <section className="public-cta-section">
          <h2 className="public-section-title">Trade with structure tomorrow.</h2>
          <p className="public-section-subtitle" style={{ marginBottom: "32px" }}>
            {PRICE_PER_MONTH} • Cancel anytime.
          </p>
          <a
            href={CTA_MAILTO}
            className="public-cta"
            data-testid="button-cta-final"
          >
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
