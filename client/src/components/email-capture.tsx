import { useState } from "react";

// Free-list email capture. Posts to /api/preview-signup; the nightly free "taste"
// plan email is sent to this list (once FREE_PLAN_EMAIL_ENABLED is on).
export default function EmailCapture({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/preview-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setStatus("error"); setMsg(d.error || "Please enter a valid email."); return; }
      setStatus("done");
    } catch {
      setStatus("error");
      setMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <p style={{ color: "var(--teal, #5EEAD4)", fontWeight: 600 }} data-testid="free-signup-done">
        You're on the list — free ES levels will hit your inbox after the close.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 460 }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        data-testid="input-free-email"
        style={{
          flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 8,
          border: "1px solid var(--border, #26262b)", background: "rgba(255,255,255,0.04)", color: "inherit", fontSize: 15,
        }}
      />
      <button type="submit" disabled={status === "loading"} className="btn-primary" data-testid="button-free-signup">
        {status === "loading" ? "…" : "Get free levels"}
      </button>
      {status === "error" && <p style={{ color: "#f87171", fontSize: 13, width: "100%", margin: "4px 0 0" }}>{msg}</p>}
    </form>
  );
}
