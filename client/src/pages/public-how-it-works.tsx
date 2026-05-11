import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { CTA_TEXT, CTA_MAILTO } from "@/lib/constants";

export default function PublicHowItWorksPage() {
  return (
    <div className="public-page">
      <div className="public-container">
        <PublicNav />

        <section className="public-hero">
          <div className="public-hero-content">
            <h1>
              How <span className="accent">It Works</span>
            </h1>
            <p className="public-hero-subtitle">
              A simple, repeatable process built around key levels — not
              predictions or noisy alerts.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="public-info-box">
            <p>
              Trade Levels Pro is built for prop traders and developing futures
              traders who want a structured way to approach the ES session.
            </p>
            <p>
              Each evening after the close, we publish a complete daily plan to
              the private Telegram channel. The plan gives you the levels and
              context you need to be prepared before the open — and the
              discipline to react instead of guess.
            </p>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">The Methodology</h2>
            <p className="public-section-subtitle">
              Five repeatable steps, applied the same way every day.
            </p>
          </div>
          <div className="method-list">
            <div className="method-step">
              <div className="public-step-num">1</div>
              <div>
                <h3>Map the Dynamic Zone</h3>
                <p>Define the reactive band where price is most likely to consolidate or reverse.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="public-step-num">2</div>
              <div>
                <h3>Identify the Magnet</h3>
                <p>Locate the level price tends to pull back toward intraday.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="public-step-num">3</div>
              <div>
                <h3>Layer Support and Resistance</h3>
                <p>Define R1–R4 and S1–S4 to frame the day's playable range.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="public-step-num">4</div>
              <div>
                <h3>Set the Bias</h3>
                <p>Establish a directional lean based on context, not prediction.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="public-step-num">5</div>
              <div>
                <h3>Define 1–2 High-Quality Setups</h3>
                <p>Concrete, level-based ideas you can prepare for ahead of the open.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-header">
            <h2 className="public-section-title">Your Daily Workflow</h2>
          </div>
          <div className="public-steps">
            <div className="public-step">
              <div className="public-step-num">1</div>
              <p>Subscribe once to access the private Telegram channel.</p>
            </div>
            <div className="public-step">
              <div className="public-step-num">2</div>
              <p>Receive tomorrow's ES plan in Telegram after the close.</p>
            </div>
            <div className="public-step">
              <div className="public-step-num">3</div>
              <p>Use the levels and bias to trade with discipline at the open.</p>
            </div>
          </div>
        </section>

        <section className="public-cta-section">
          <h2 className="public-section-title">Trade with structure tomorrow.</h2>
          <a
            href={CTA_MAILTO}
            className="public-cta"
            data-testid="button-cta-how"
          >
            {CTA_TEXT} →
          </a>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
