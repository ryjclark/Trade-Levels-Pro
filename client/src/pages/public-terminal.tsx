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
import { useMemberAuth } from "@/hooks/use-member-auth";
import "./public.css";

interface MemberPlan {
  date: string;
  bias: string | null;
  biasReasoning: string | null;
  topLongTrade: string | null;
  topShortTrade: string | null;
}

interface TerminalData {
  symbol: string;
  bars: TerminalBar[];
  plan:
    | { date: string; magnet: number | null; dynamicZoneTop: number | null; dynamicZoneBottom: number | null }
    | null;
  structure:
    | {
        priorHigh: number | null;
        priorLow: number | null;
        priorClose: number | null;
        overnightHigh: number | null;
        overnightLow: number | null;
        priorWeekHigh: number | null;
        priorWeekLow: number | null;
        recentHigh: number | null;
        recentLow: number | null;
      }
    | null;
  swings: {
    lows: number[];
    highs: number[];
    lowPoints?: SwingPt[];
    highPoints?: SwingPt[];
  } | null;
}

type SwingPt = { price: number; prominence: number; tier: "major" | "minor" | "micro" };

function n(v: number | null | undefined) {
  return v == null ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Render a row of detected levels, ranked by quality: majors bold + ★, micro dimmed.
// Falls back to plain numbers if the ranked points aren't present in the payload.
function renderSwingRow(points: SwingPt[] | undefined, fallback: number[]) {
  const list: SwingPt[] = points && points.length
    ? points
    : fallback.map((price) => ({ price, prominence: 0, tier: "minor" as const }));
  const shown = list.slice(0, 6);
  if (!shown.length) return "—";
  return shown.map((p, i) => (
    <span key={p.price}>
      <span
        style={{
          opacity: p.tier === "micro" ? 0.5 : 1,
          fontWeight: p.tier === "major" ? 700 : 400,
        }}
      >
        {n(p.price)}
        {p.tier === "major" ? "★" : ""}
      </span>
      {i < shown.length - 1 ? "  ·  " : ""}
    </span>
  ));
}

export default function PublicTerminalPage() {
  const [symbol, setSymbol] = useState<"ES" | "NQ">("ES");
  const { isMember, email: memberEmail, token: memberToken, logout } = useMemberAuth();

  const { data, isLoading } = useQuery<TerminalData>({
    queryKey: ["/api/public/terminal", symbol],
    queryFn: async () => {
      const res = await fetch(`/api/public/terminal?symbol=${symbol}`);
      if (!res.ok) throw new Error("Failed to load terminal");
      return res.json();
    },
    refetchInterval: 60 * 1000,
  });

  const bars = data?.bars ?? [];
  const lastBar = bars.length ? bars[bars.length - 1] : null;
  const prevBar = bars.length > 1 ? bars[bars.length - 2] : null;
  const lastPrice = lastBar?.close ?? null;
  const change = lastBar && prevBar ? lastBar.close - prevBar.close : null;
  const changePct = change != null && prevBar ? (change / prevBar.close) * 100 : null;
  const up = (change ?? 0) >= 0;

  const { data: memberData } = useQuery<{ plan: MemberPlan | null }>({
    queryKey: ["/api/member/plan", symbol, memberToken],
    enabled: isMember && !!memberToken,
    queryFn: async () => {
      const res = await fetch(`/api/member/plan?symbol=${symbol}`, {
        headers: { authorization: `Bearer ${memberToken}` },
      });
      if (!res.ok) throw new Error("Failed to load member plan");
      return res.json();
    },
  });

  const plan = data?.plan ?? null;
  const structure = data?.structure ?? null;
  const swings = data?.swings ?? null;
  const memberPlan = memberData?.plan ?? null;

  const chartLevels: TerminalLevels | null =
    plan || structure
      ? {
          magnet: plan?.magnet ?? null,
          dynamicZoneTop: plan?.dynamicZoneTop ?? null,
          dynamicZoneBottom: plan?.dynamicZoneBottom ?? null,
          priorHigh: structure?.priorHigh ?? null,
          priorLow: structure?.priorLow ?? null,
          priorClose: structure?.priorClose ?? null,
          overnightHigh: structure?.overnightHigh ?? null,
          overnightLow: structure?.overnightLow ?? null,
          priorWeekHigh: structure?.priorWeekHigh ?? null,
          priorWeekLow: structure?.priorWeekLow ?? null,
          recentHigh: structure?.recentHigh ?? null,
          recentLow: structure?.recentLow ?? null,
        }
      : null;

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <header style={{ marginBottom: 20 }}>
          <h1 className="public-h1" style={{ fontSize: 40, marginBottom: 10 }}>
            Terminal
          </h1>
          <p className="public-hero-subtitle" style={{ maxWidth: 640 }}>
            Magnet, Dynamic Zone, and the key structure levels — prior-day high/low/close
            and overnight range — drawn straight on the chart. Bias and setups unlock for members.
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

          {/* Live-ish price readout (delayed) */}
          {lastPrice != null && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginLeft: 4 }} data-testid="terminal-price">
              <span style={{ fontSize: 22, fontWeight: 700 }}>{n(lastPrice)}</span>
              {change != null && (
                <span style={{ fontSize: 14, fontWeight: 600, color: up ? "#4ade80" : "#f87171" }}>
                  {up ? "▲" : "▼"} {n(Math.abs(change))} ({changePct != null ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%` : "—"})
                </span>
              )}
              <span style={{ fontSize: 11, opacity: 0.45 }}>delayed</span>
            </div>
          )}
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
            <LevelsTerminalChart bars={data.bars} levels={chartLevels} swings={swings} height={520} />
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
                <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prior day</div>
                <div style={{ color: "#f87171" }}>High <b>{n(structure?.priorHigh)}</b></div>
                <div style={{ color: "#60a5fa" }}>Close <b>{n(structure?.priorClose)}</b></div>
                <div style={{ color: "#4ade80" }}>Low <b>{n(structure?.priorLow)}</b></div>
              </div>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Overnight</div>
                <div style={{ color: "#fb923c" }}>High <b>{n(structure?.overnightHigh)}</b></div>
                <div style={{ color: "#22d3ee" }}>Low <b>{n(structure?.overnightLow)}</b></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, opacity: 0.85 }}>
              <div>
                <div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prior week</div>
                <div>High <b>{n(structure?.priorWeekHigh)}</b></div>
                <div>Low <b>{n(structure?.priorWeekLow)}</b></div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>~1-month range</div>
                <div>High <b>{n(structure?.recentHigh)}</b></div>
                <div>Low <b>{n(structure?.recentLow)}</b></div>
              </div>
            </div>
            {swings && (swings.lows.length > 0 || swings.highs.length > 0) && (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--border, #26262b)", paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, opacity: 0.8 }}>
                  Detected reaction levels
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  <div>
                    <span style={{ color: "#f87171" }}>Resistance:</span>{" "}
                    {renderSwingRow(swings.highPoints, swings.highs)}
                  </div>
                  <div>
                    <span style={{ color: "#4ade80" }}>Support:</span>{" "}
                    {renderSwingRow(swings.lowPoints, swings.lows)}
                  </div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>
                  ★ = major (strongest reactions); dimmed = micro shelf (lower quality)
                </div>
              </div>
            )}
          </div>

          {/* Plan card — full for members, teaser for guests */}
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
            {isMember && memberPlan ? (
              <div data-testid="terminal-member-plan">
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  Trade Plan {memberPlan.date ? `· ${memberPlan.date}` : ""}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ opacity: 0.7 }}>Bias: </span>
                  <b style={{ textTransform: "capitalize" }}>{memberPlan.bias || "—"}</b>
                  {memberPlan.biasReasoning && (
                    <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{memberPlan.biasReasoning}</div>
                  )}
                </div>
                {memberPlan.topLongTrade && (
                  <div style={{ fontSize: 14, marginBottom: 10, whiteSpace: "pre-line" }}>
                    <span style={{ color: "#4ade80", fontWeight: 700 }}>🟢 Top Long{"\n"}</span>{memberPlan.topLongTrade}
                  </div>
                )}
                {memberPlan.topShortTrade && (
                  <div style={{ fontSize: 14, whiteSpace: "pre-line" }}>
                    <span style={{ color: "#f87171", fontWeight: 700 }}>🔴 Top Short{"\n"}</span>{memberPlan.topShortTrade}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  <Lock size={14} /> Bias & setups — members only
                </div>
                <p style={{ opacity: 0.7, fontSize: 14, flex: 1 }}>
                  The daily bias call and the exact long/short setups around these levels are
                  part of the membership, shown here and delivered to Telegram.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <Link
                    href="/pricing"
                    className="btn-primary"
                    data-testid="terminal-unlock-cta"
                    style={{ justifyContent: "center" }}
                  >
                    Get access →
                  </Link>
                  <Link
                    href="/member-login"
                    data-testid="terminal-member-login"
                    style={{ alignSelf: "center", color: "var(--teal, #5EEAD4)", fontSize: 14 }}
                  >
                    Already a member? Log in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {isMember && (
          <div style={{ fontSize: 12, opacity: 0.55, marginTop: 16 }} data-testid="terminal-member-status">
            Signed in{memberEmail ? ` as ${memberEmail}` : ""} ·{" "}
            <button
              onClick={() => logout()}
              style={{ background: "none", border: "none", color: "var(--teal, #5EEAD4)", cursor: "pointer", padding: 0, fontSize: 12 }}
            >
              Log out
            </button>
          </div>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
