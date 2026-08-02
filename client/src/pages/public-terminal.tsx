import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Lock } from "lucide-react";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import LevelsTerminalChart, {
  type TerminalBar,
  type TerminalLevels,
} from "@/components/LevelsTerminalChart";
import "./public.css";

interface TerminalData {
  symbol: string;
  bars: TerminalBar[];
  plan:
    | (TerminalLevels & { date: string })
    | null;
}

function n(v: number | null | undefined) {
  return v == null ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function PublicTerminalPage() {
  const [symbol, setSymbol] = useState<"ES" | "NQ">("ES");

  const { data, isLoading } = useQuery<TerminalData>({
    queryKey: ["/api/public/terminal", symbol],
    queryFn: async () => {
      const res = await fetch(`/api/public/terminal?symbol=${symbol}`);
      if (!res.ok) throw new Error("Failed to load terminal");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const plan = data?.plan ?? null;

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <header style={{ marginBottom: 20 }}>
          <h1 className="public-h1" style={{ fontSize: 40, marginBottom: 10 }}>
            Terminal
          </h1>
          <p className="public-hero-subtitle" style={{ maxWidth: 640 }}>
            Today's Magnet, Dynamic Zone, and S/R ladder drawn straight on the chart.
            Bias and setups unlock for members.
          </p>
        </header>

        {/* Symbol toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["ES", "NQ"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              data-testid={`terminal-symbol-${s}`}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid var(--border-teal-strong, rgba(94,234,212,0.4))",
                background: symbol === s ? "var(--teal, #5EEAD4)" : "transparent",
                color: symbol === s ? "#050810" : "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div
          style={{
            border: "1px solid var(--border, #26262b)",
            borderRadius: 12,
            padding: 12,
            background: "var(--card, rgba(255,255,255,0.02))",
            marginBottom: 24,
          }}
        >
          {isLoading ? (
            <div style={{ height: 520, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
              Loading {symbol} chart…
            </div>
          ) : !data || data.bars.length === 0 ? (
            <div style={{ height: 520, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
              Chart data unavailable right now.
            </div>
          ) : (
            <LevelsTerminalChart bars={data.bars} levels={plan} height={520} />
          )}
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>
            {symbol} · levels for {plan?.date ?? "the next session"} · chart data may be delayed.
          </div>
        </div>

        {/* Levels grid + gated card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <div
            style={{
              border: "1px solid var(--border, #26262b)",
              borderRadius: 12,
              padding: 18,
              background: "var(--card, rgba(255,255,255,0.02))",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              {symbol} levels {plan?.date ? `· ${plan.date}` : ""}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ opacity: 0.7 }}>Magnet</span>
              <b>{n(plan?.magnet)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ opacity: 0.7 }}>Dynamic Zone</span>
              <b>{n(plan?.dynamicZoneBottom)} – {n(plan?.dynamicZoneTop)}</b>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <div style={{ color: "#f87171", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Resistance</div>
                <div>R1 <b>{n(plan?.r1)}</b></div>
                <div>R2 <b>{n(plan?.r2)}</b></div>
                <div>R3 <b>{n(plan?.r3)}</b></div>
                <div>R4 <b>{n(plan?.r4)}</b></div>
              </div>
              <div>
                <div style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Support</div>
                <div>S1 <b>{n(plan?.s1)}</b></div>
                <div>S2 <b>{n(plan?.s2)}</b></div>
                <div>S3 <b>{n(plan?.s3)}</b></div>
                <div>S4 <b>{n(plan?.s4)}</b></div>
              </div>
            </div>
          </div>

          {/* Members-only teaser */}
          <div
            style={{
              border: "1px solid var(--border, #26262b)",
              borderRadius: 12,
              padding: 18,
              background: "var(--card, rgba(255,255,255,0.02))",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
              <Lock size={14} /> Bias & setups — members only
            </div>
            <p style={{ opacity: 0.7, fontSize: 14, flex: 1 }}>
              The daily bias call and the exact long/short setups around these levels are
              part of the membership, delivered here and to Telegram.
            </p>
            <Link
              href="/pricing"
              className="btn-primary"
              data-testid="terminal-unlock-cta"
              style={{ marginTop: 12, justifyContent: "center" }}
            >
              Unlock full plan →
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
