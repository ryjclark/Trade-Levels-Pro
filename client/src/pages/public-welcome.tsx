import { useEffect, useState } from "react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { CONTACT_EMAIL } from "@/lib/constants";
import { useMemberAuth } from "@/hooks/use-member-auth";

interface SessionInfo {
  email: string | null;
  status?: string;
  telegramInviteLink: string | null;
  memberToken?: string | null;
}

export default function PublicWelcomePage() {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login } = useMemberAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const MAX_ATTEMPTS = 8; // ~20s of polling in case provisioning lags

    (async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const res = await fetch(
            `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`
          );
          if (res.ok) {
            const data: SessionInfo = await res.json();
            if (cancelled) return;
            setInfo(data);
            // Auto-login: if the server issued a member session, store it so the
            // buyer is signed in on the site immediately (no magic-link email).
            if (data.memberToken) {
              login(data.memberToken, data.email ?? undefined);
            }
            // Got the invite — stop polling and show it.
            if (data.telegramInviteLink) {
              setLoading(false);
              return;
            }
          }
        } catch {
          /* transient — keep trying */
        }
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 2500));
        }
      }
      // Exhausted retries without an invite link — show whatever we have and
      // let the fallback UI guide them (email + member login).
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
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
                <p className="capture-sub" style={{ marginTop: 16 }}>
                  You're also signed in on the site. View the daily plan and the
                  TradingView indicator anytime at{" "}
                  <a href="/terminal" style={{ color: "#2dd4bf" }}>Today's Plan →</a>
                </p>
              </>
            )}

            {!loading && !error && info && !info.telegramInviteLink && (
              <>
                <h3 className="capture-title">Your subscription is active</h3>
                <p className="capture-sub">
                  We're finishing your private Telegram access. If your invite
                  link doesn't appear here in a moment, email{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#2dd4bf" }}>
                    {CONTACT_EMAIL}
                  </a>{" "}
                  and we'll send it within minutes. Your payment is safe and your
                  subscription is active.
                </p>
              </>
            )}

            {!loading && !info && !error && (
              <>
                <h3 className="capture-title">Thanks for subscribing</h3>
                <p className="capture-sub">
                  Your subscription is active and we're setting up your Telegram
                  access. If your invite doesn't appear here shortly, email{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#2dd4bf" }}>
                    {CONTACT_EMAIL}
                  </a>{" "}
                  and we'll get you in right away.
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
