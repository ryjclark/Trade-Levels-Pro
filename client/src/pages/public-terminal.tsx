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
import { keyEventForDate } from "@/lib/key-events";
import "./public.css";

// Symbol registry for the terminal UI. Mirrors the server SYMBOLS list; a new
// ticker is one row here (label + round-number grid step for the level display).
const TERMINAL_SYMBOLS = ["ES", "NQ", "GC", "CL", "RTY"] as const;
type TermSym = (typeof TERMINAL_SYMBOLS)[number];
const SYM_LABEL: Record<TermSym, string> = {
  ES: "ES", NQ: "NQ", GC: "Gold", CL: "Crude", RTY: "Russell",
};
const ROUND_STEP_UI: Record<TermSym, number> = {
  ES: 25, NQ: 100, GC: 10, CL: 1, RTY: 10,
};

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
  profile?: {
    poc: number | null;
    vah: number | null;
    val: number | null;
    date: string | null;
  } | null;
}

type SwingPt = { price: number; prominence: number; tier: "major" | "minor" | "micro" };

function n(v: number | null | undefined) {
  return v == null ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// A round-number reference is enrichment filler (no prominence, sits exactly on
// the round grid — ES 25 / NQ 100). Real detected shelves and structure are not.
function isRoundRef(p: SwingPt, step: number) {
  return p.prominence === 0 && Math.abs(p.price - Math.round(p.price / step) * step) < 1e-6;
}

// Render a row of levels: real detected shelves show normal (majors bold + ★),
// round-number references are dimmed + italic grey so it's obvious which lines
// are actual reactions vs. filler, micro dimmed, and a ✓ marks levels the current
// session has already traded to.
function renderSwingRow(points: SwingPt[], step: number, isTagged?: (price: number) => boolean) {
  const shown = points.slice(0, 6);
  if (!shown.length) return "—";
  return shown.map((p, i) => {
    const round = isRoundRef(p, step);
    return (
      <span key={p.price}>
        <span
          style={{
            opacity: p.tier === "micro" || round ? 0.55 : 1,
            fontWeight: p.tier === "major" ? 700 : 400,
            fontStyle: round ? "italic" : "normal",
            color: round ? "#94a3b8" : undefined,
          }}
        >
          {n(p.price)}
          {p.tier === "major" ? "★" : ""}
          {isTagged && isTagged(p.price) ? <span style={{ color: "#eab308" }}> ✓</span> : ""}
        </span>
        {i < shown.length - 1 ? "  ·  " : ""}
      </span>
    );
  });
}

export default function PublicTerminalPage() {
  const [symbol, setSymbol] = useState<TermSym>("ES");
  const [copiedExport, setCopiedExport] = useState(false);
  const [copiedAuto, setCopiedAuto] = useState(false);
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

  // Bucket detected levels by SIDE (above the reference = resistance, below =
  // support), not by whether they were a swing high or low. A swing low that now
  // sits above price is functioning as resistance. Use the plan's magnet as the
  // reference so this list matches how the plan classifies levels.
  const swingRef = plan?.magnet ?? lastPrice ?? null;
  const allSwingPts: SwingPt[] = swings
    ? [...(swings.lowPoints ?? []), ...(swings.highPoints ?? [])]
    : [];
  const resistancePts =
    swingRef == null ? [] : allSwingPts.filter((p) => p.price > swingRef).sort((a, b) => a.price - b.price);
  const supportPts =
    swingRef == null ? [] : allSwingPts.filter((p) => p.price < swingRef).sort((a, b) => b.price - a.price);

  // Level-hit + acceptance markers: measure the current session (the latest ET
  // day present in the bars) against the levels. A level is "tagged" if the
  // session traded to it; the key support is "accepted" if price flushed below
  // and reclaimed it (the failed breakdown working in real time).
  const etDate = (t: number) =>
    new Date(t * 1000).toLocaleDateString("en-US", { timeZone: "America/New_York" });
  const sessionDay = lastBar ? etDate(lastBar.time) : null;
  const sessionBars = sessionDay ? bars.filter((b) => etDate(b.time) === sessionDay) : [];
  const sessHigh = sessionBars.length ? Math.max(...sessionBars.map((b) => b.high)) : null;
  const sessLow = sessionBars.length ? Math.min(...sessionBars.map((b) => b.low)) : null;
  const sessClose = sessionBars.length ? sessionBars[sessionBars.length - 1].close : null;
  const isTagged = (price: number, side: "support" | "resistance") =>
    side === "support" ? sessLow != null && sessLow <= price : sessHigh != null && sessHigh >= price;

  const keySupport = supportPts.find((p) => p.tier === "major") ?? supportPts[0] ?? null;
  let acceptance: "untested" | "flushed" | "accepted" | null = null;
  if (keySupport && sessLow != null) {
    const flushed = sessLow < keySupport.price;
    const reclaimed = flushed && sessClose != null && sessClose > keySupport.price;
    acceptance = reclaimed ? "accepted" : flushed ? "flushed" : "untested";
  }

  const keyEvent = keyEventForDate(plan?.date);

  // Prior-session recap (proof) for this symbol, folded in from the daily brief.
  const { data: brief } = useQuery<{ recap: { symbol: string; date: string; line: string }[] }>({
    queryKey: ["/api/public/daily-brief"],
    queryFn: async () => {
      const res = await fetch("/api/public/daily-brief");
      if (!res.ok) throw new Error("Failed to load brief");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });
  const recap = (brief?.recap ?? []).find((r) => r.symbol === symbol) ?? null;

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
          {TERMINAL_SYMBOLS.map((s) => (
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
              {SYM_LABEL[s]}
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

        {/* Key macro-event flag */}
        {keyEvent && (
          <div
            data-testid="terminal-event-flag"
            style={{
              border: "1px solid rgba(234,179,8,0.4)",
              background: "rgba(234,179,8,0.08)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <b style={{ color: "#eab308" }}>Heads up, {keyEvent.label} on {plan?.date}.</b>{" "}
            {keyEvent.note}
          </div>
        )}

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
            {(resistancePts.length > 0 || supportPts.length > 0) && (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--border, #26262b)", paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, opacity: 0.8 }}>
                  Detected reaction levels
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  <div>
                    <span style={{ color: "#f87171" }}>Resistance:</span>{" "}
                    {renderSwingRow(resistancePts, ROUND_STEP_UI[symbol], (px) => isTagged(px, "resistance"))}
                  </div>
                  <div>
                    <span style={{ color: "#4ade80" }}>Support:</span>{" "}
                    {renderSwingRow(supportPts, ROUND_STEP_UI[symbol], (px) => isTagged(px, "support"))}
                  </div>
                </div>
                {keySupport && acceptance && (
                  <div style={{ fontSize: 12, marginTop: 8 }} data-testid="terminal-acceptance">
                    Failed breakdown at <b>{n(keySupport.price)}</b>:{" "}
                    {acceptance === "accepted" ? (
                      <span style={{ color: "#4ade80" }}>flushed and reclaimed (accepted) ✓</span>
                    ) : acceptance === "flushed" ? (
                      <span style={{ color: "#eab308" }}>flushed, not yet reclaimed, wait for acceptance</span>
                    ) : (
                      <span style={{ opacity: 0.65 }}>not tested this session</span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>
                  ★ = major shelf (strongest reactions); <i style={{ color: "#94a3b8" }}>italic grey</i> = round-number reference (filler, not a detected reaction); dimmed = micro shelf. ✓ = tagged this session. Support/resistance are relative to the magnet.
                </div>
                {data?.profile && data.profile.poc != null && (
                  <div style={{ marginTop: 14, borderTop: "1px solid var(--border, #26262b)", paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, opacity: 0.8 }}>
                      Prior-session profile (reference for today)
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.8 }} data-testid="terminal-profile">
                      <span style={{ color: "#c084fc", fontWeight: 600 }}>POC</span>{" "}
                      <b>{n(data.profile.poc)}</b>
                      <span style={{ opacity: 0.5 }}>{"   ·   "}</span>
                      Value area <b>{n(data.profile.val)}</b> – <b>{n(data.profile.vah)}</b>
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>
                      POC = price that traded the most time last session (a magnet; a return to it is a common target). Value area = where ~70% of the session traded — accepting above it favors buyers, below favors sellers. Built from time-at-price (30-min brackets).
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={async () => {
                      try {
                        const r = await fetch(`/api/public/levels-export?symbol=${symbol}`);
                        await navigator.clipboard.writeText(await r.text());
                        setCopiedExport(true);
                        setTimeout(() => setCopiedExport(false), 2000);
                      } catch {}
                    }}
                    data-testid="button-copy-levels"
                    style={{
                      fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                      border: "1px solid var(--border, #26262b)", background: "var(--card, rgba(255,255,255,0.03))",
                      color: "inherit",
                    }}
                  >
                    {copiedExport ? "✓ Copied" : "📋 Copy levels for your chart"}
                  </button>
                  <a
                    href={`/api/public/levels-export?symbol=${symbol}&format=pine`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: "var(--teal, #5EEAD4)" }}
                  >
                    TradingView Pine script →
                  </a>
                </div>
                {/* Auto-updating indicator: add once, recomputes every day. */}
                <div style={{ marginTop: 14, borderTop: "1px solid var(--border, #26262b)", paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, opacity: 0.85 }}>
                    Auto-updating indicator (add once, never re-paste)
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 8 }}>
                    Computes the levels on your chart and refreshes every session on its own. A close
                    approximation of the daily plan; use the exact export above for precision.
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={async () => {
                        try {
                          const r = await fetch(`/api/public/auto-indicator.pine`);
                          await navigator.clipboard.writeText(await r.text());
                          setCopiedAuto(true);
                          setTimeout(() => setCopiedAuto(false), 2000);
                        } catch {}
                      }}
                      data-testid="button-copy-auto-indicator"
                      style={{
                        fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                        border: "1px solid var(--border, #26262b)", background: "var(--card, rgba(255,255,255,0.03))",
                        color: "inherit",
                      }}
                    >
                      {copiedAuto ? "✓ Copied — paste into TradingView Pine Editor" : "⚡ Copy auto-updating indicator"}
                    </button>
                    <a
                      href={`/api/public/auto-indicator.pine`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: "var(--teal, #5EEAD4)" }}
                    >
                      View script →
                    </a>
                  </div>
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

        {recap && (
          <div
            data-testid="terminal-recap"
            style={{
              border: "1px solid var(--border, #26262b)",
              borderRadius: 12,
              padding: 18,
              background: "var(--card, rgba(255,255,255,0.02))",
              marginTop: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              Yesterday in review
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>{recap.line}</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>
              Measured from the session's OHLC. See the{" "}
              <Link href="/track-record" style={{ color: "inherit", textDecoration: "underline" }}>
                track record
              </Link>
              .
            </div>
          </div>
        )}

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
