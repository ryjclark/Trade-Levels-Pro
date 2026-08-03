import { useEffect, useState } from "react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { CONTACT_EMAIL } from "@/lib/constants";

interface SessionInfo {
  email: string | null;
  status?: string;
  telegramInviteLink: string | null;
}

export default function PublicWelcomePage() {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) {
          setError("We couldn't load your subscription details yet.");
          return;
        }
        setInfo(await res.json());
      } catch {
        setError("Network error. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
              Welcome to <span className="accent">Trade Levels Pro</span>
            </h1>
            <p className="public-hero-subtitle">
              Your subscription is active. Here's how to access the private
              Telegram channel where daily ES and NQ plans are posted after the
              cash close.
            </p>
          </div>
        </section>

        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="capture-box" data-testid="box-welcome">
            {loading && <p className="capture-sub">Loading your details…</p>}

            {!loading && error && (
              <p className="capture-msg capture-msg-err" data-testid="text-welcome-error">
                {error}
              </p>
            )}

            {!loading && !error && info?.telegramInviteLink && (
              <>
                <h3 className="capture-title">Join the private Telegram channel</h3>
                <p className="capture-sub">
                  This is a single-use invite. It expires in 7 days. Tap below
                  on the device where you use Telegram.
                </p>
                <a
                  href={info.telegramInviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="capture-button"
                  style={{ textAlign: "center", textDecoration: "none" }}
                  data-testid="link-telegram-invite"
                >
                  Open Telegram invite →
                </a>
              </>
            )}

            {!loading && !error && info && !info.telegramInviteLink && (
              <>
                <h3 className="capture-title">We're setting up your access</h3>
                <p className="capture-sub">
                  Your invite link will arrive by email shortly. If you don't
                  see it within a few minutes, contact{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#2dd4bf" }}>
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </>
            )}

            {!loading && !info && !error && (
              <>
                <h3 className="capture-title">Thanks for subscribing</h3>
                <p className="capture-sub">
                  Check your inbox for a welcome email with your private
                  Telegram invite link. Daily ES and NQ plans are posted to the
                  channel after the cash close.
                </p>
              </>
            )}
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
