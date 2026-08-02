import { useState } from "react";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import "./public.css";

export default function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/member/request-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Something went wrong.");
      }
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 72, paddingBottom: 100, maxWidth: 460 }}>
        <h1 className="public-h1" style={{ fontSize: 34, marginBottom: 10 }}>Member login</h1>
        {sent ? (
          <div
            style={{
              border: "1px solid var(--border-teal-strong, rgba(94,234,212,0.4))",
              borderRadius: 12, padding: 20, background: "var(--teal-soft, rgba(94,234,212,0.10))",
            }}
            data-testid="member-login-sent"
          >
            <p style={{ margin: 0 }}>
              If <b>{email}</b> is an active subscription, a login link is on its way.
              Check your inbox (and spam) — the link works once and expires in 20 minutes.
            </p>
          </div>
        ) : (
          <>
            <p className="public-hero-subtitle" style={{ marginBottom: 20 }}>
              Enter the email on your subscription. We'll email you a one-tap login link — no password.
            </p>
            <form onSubmit={submit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                data-testid="member-login-email"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8,
                  border: "1px solid var(--border-teal, rgba(94,234,212,0.12))",
                  background: "rgba(255,255,255,0.03)", color: "inherit", fontSize: 15, marginBottom: 12,
                }}
              />
              {error && <p style={{ color: "#f87171", fontSize: 14, marginBottom: 12 }}>{error}</p>}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                data-testid="member-login-submit"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {loading ? "Sending…" : "Email me a login link"}
              </button>
            </form>
            <p style={{ fontSize: 13, opacity: 0.6, marginTop: 16 }}>
              Not a member yet? <a href="/pricing" style={{ color: "var(--teal, #5EEAD4)" }}>See pricing →</a>
            </p>
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
