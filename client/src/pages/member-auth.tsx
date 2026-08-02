import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMemberAuth } from "@/hooks/use-member-auth";
import PublicNav from "@/components/public-nav";
import "./public.css";

export default function MemberAuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useMemberAuth();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing login token.");
      return;
    }
    let cancelled = false;
    fetch("/api/member/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "This link is invalid or expired.");
        return d;
      })
      .then((d) => {
        if (cancelled) return;
        login(d.token, d.email);
        setMessage("Signed in! Taking you to the terminal…");
        setTimeout(() => setLocation("/terminal"), 700);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(err?.message || "This link is invalid or expired.");
      });
    return () => {
      cancelled = true;
    };
  }, [login, setLocation]);

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 100, paddingBottom: 120, textAlign: "center" }}>
        <p style={{ fontSize: 18 }} data-testid="member-auth-status">{message}</p>
        {status === "error" && (
          <p style={{ marginTop: 16 }}>
            <a href="/member-login" style={{ color: "var(--teal, #5EEAD4)" }}>Request a new link →</a>
          </p>
        )}
      </main>
    </div>
  );
}
