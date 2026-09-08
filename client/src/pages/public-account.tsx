import { useEffect, useState, type CSSProperties } from "react";
import { Link, Redirect } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { useMemberAuth } from "@/hooks/use-member-auth";
import { CONTACT_EMAIL } from "@/lib/constants";

interface Account {
  email: string;
  status: string;
  createdAt: string;
  telegramInviteLink: string | null;
  telegramJoinedAt: string | null;
}

const cardStyle: CSSProperties = {
  border: "1px solid var(--border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding: 20,
  background: "var(--card, rgba(255,255,255,0.02))",
  marginTop: 16,
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

export default function PublicAccountPage() {
  const { token, isMember, checked, email: authEmail, logout } = useMemberAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyEmail, setDailyEmail] = useState<boolean | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch("/api/member/account", { headers: { authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((d: Account) => {
        if (cancelled) return;
        setAccount(d);
        setInvite(d.telegramInviteLink);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your account details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetch("/api/member/email-pref", { headers: { authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((d: { dailyEmail: boolean }) => {
        if (!cancelled) setDailyEmail(!!d.dailyEmail);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Once the stored token has been validated, send guests to login.
  if (checked && !isMember) return <Redirect to="/member-login" />;

  const toggleDailyEmail = async () => {
    const next = !dailyEmail;
    setEmailSaving(true);
    setDailyEmail(next); // optimistic
    try {
      const r = await fetch("/api/member/email-pref", {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ dailyEmail: next }),
      });
      if (!r.ok) {
        setDailyEmail(!next); // revert
        setError("Could not save your email preference.");
      }
    } catch {
      setDailyEmail(!next);
      setError("Could not save your email preference.");
    } finally {
      setEmailSaving(false);
    }
  };

  const getInvite = async () => {
    setError(null);
    setInviteLoading(true);
    try {
      const r = await fetch("/api/member/telegram-invite", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok && d.inviteLink) setInvite(d.inviteLink);
      else setError(d.error || "Could not create an invite.");
    } catch {
      setError("Could not create an invite.");
    } finally {
      setInviteLoading(false);
    }
  };

  const openBilling = async () => {
    setError(null);
    setPortalLoading(true);
    try {
      const r = await fetch("/api/member/portal", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok && d.url) window.location.href = d.url;
      else setError(d.error || "Billing portal isn't available yet. Please contact support.");
    } catch {
      setError("Could not open the billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null;

  const isActive = account?.status === "active";

  return (
    <div className="public-page">
      <PublicNav />
      <main
        className="public-container"
        style={{ paddingTop: 72, paddingBottom: 100, maxWidth: 640 }}
      >
        <h1 className="public-h1" style={{ fontSize: 34, marginBottom: 6 }}>
          Your account
        </h1>
        <p className="public-hero-subtitle" style={{ marginBottom: 8 }}>
          {authEmail || account?.email || ""}
        </p>

        {error && (
          <p style={{ color: "#f87171", fontSize: 14, marginTop: 8 }} data-testid="account-error">
            {error}
          </p>
        )}

        {loading ? (
          <p className="capture-sub" style={{ marginTop: 16 }}>
            Loading your account…
          </p>
        ) : (
          <>
            {/* Subscription */}
            <div style={cardStyle} data-testid="card-subscription">
              <div style={rowStyle}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>Subscription</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: isActive ? "#34d399" : "#f87171",
                        marginRight: 8,
                      }}
                    />
                    {isActive ? "Active" : account?.status ?? "Inactive"}
                  </div>
                  {fmtDate(account?.createdAt) && (
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
                      Member since {fmtDate(account?.createdAt)}
                    </div>
                  )}
                </div>
                <button
                  onClick={openBilling}
                  disabled={portalLoading}
                  className="btn-primary"
                  data-testid="button-manage-billing"
                  style={{ justifyContent: "center" }}
                >
                  {portalLoading ? "Opening…" : "Manage billing"}
                </button>
              </div>
              <p style={{ fontSize: 12, opacity: 0.55, marginTop: 12, marginBottom: 0 }}>
                Update your card, view invoices, or cancel anytime in the billing portal.
              </p>
            </div>

            {/* Telegram */}
            <div style={cardStyle} data-testid="card-telegram">
              <div style={{ fontSize: 13, opacity: 0.6 }}>Telegram channel</div>
              {account?.telegramJoinedAt ? (
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                  <span style={{ color: "#34d399" }}>Connected ✓</span>
                  <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 400, marginLeft: 8 }}>
                    joined {fmtDate(account.telegramJoinedAt)}
                  </span>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                    Daily ES and NQ plans are posted in the private Telegram channel after the
                    cash close. Join to get them on your phone.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                    {invite ? (
                      <a
                        href={invite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ textDecoration: "none", justifyContent: "center" }}
                        data-testid="link-telegram-invite"
                      >
                        Open Telegram invite →
                      </a>
                    ) : (
                      <button
                        onClick={getInvite}
                        disabled={inviteLoading}
                        className="btn-primary"
                        style={{ justifyContent: "center" }}
                        data-testid="button-get-invite"
                      >
                        {inviteLoading ? "Creating…" : "Get Telegram invite"}
                      </button>
                    )}
                    {invite && (
                      <button
                        onClick={getInvite}
                        disabled={inviteLoading}
                        style={{
                          background: "none",
                          border: "1px solid var(--border, rgba(255,255,255,0.14))",
                          borderRadius: 8,
                          color: "inherit",
                          cursor: "pointer",
                          padding: "0 14px",
                          fontSize: 13,
                        }}
                        data-testid="button-fresh-invite"
                      >
                        {inviteLoading ? "…" : "Need a fresh link?"}
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 11, opacity: 0.45, marginTop: 8, marginBottom: 0 }}>
                    The invite is single-use and expires in 7 days.
                  </p>
                </>
              )}
            </div>

            {/* Delivery preference */}
            <div style={cardStyle} data-testid="card-delivery">
              <div style={rowStyle}>
                <div style={{ maxWidth: 420 }}>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>Delivery</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Email me the daily plan</div>
                  <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6, marginTop: 4 }}>
                    Get each day's ES and NQ plan in your inbox after the close, on by default,
                    in addition to Telegram and the site (no Telegram required). Turn it off here
                    anytime.
                  </div>
                </div>
                <button
                  onClick={toggleDailyEmail}
                  disabled={dailyEmail === null || emailSaving}
                  role="switch"
                  aria-checked={!!dailyEmail}
                  data-testid="toggle-daily-email"
                  style={{
                    flexShrink: 0,
                    width: 52,
                    height: 30,
                    borderRadius: 999,
                    border: "none",
                    cursor: dailyEmail === null ? "wait" : "pointer",
                    background: dailyEmail ? "var(--teal, #5EEAD4)" : "rgba(255,255,255,0.18)",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: dailyEmail ? 25 : 3,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#0b0e14",
                      transition: "left 0.15s",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div style={cardStyle} data-testid="card-links">
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/terminal" style={{ color: "var(--teal, #5EEAD4)" }}>
                  Today's Plan →
                </Link>
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--teal, #5EEAD4)" }}>
                  Contact support
                </a>
                <button
                  onClick={() => logout()}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 14,
                  }}
                  data-testid="button-logout"
                >
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
