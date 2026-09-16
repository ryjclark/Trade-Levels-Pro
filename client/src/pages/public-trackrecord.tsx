import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import "./public.css";

interface SymProof {
  scored: number;
  inPlayRate: number | null;
  targetReachedRate: number | null;
  taggedRate: number | null;
  triggeredRate: number | null;
  workedRate: number | null;
  workedWhenTriggeredRate: number | null;
  triggerSamples: number;
  target1Rate: number | null;
  target2Rate: number | null;
  target3Rate: number | null;
  rank1TrigRate: number | null;
  rank2TrigRate: number | null;
  rank3TrigRate: number | null;
  backupSavedRate: number | null;
  backupSamples: number;
  recent: ProofSession[];
}

interface ProofSession {
  date: string;
  ladder: number[];
  target: number;
  tagged: boolean[];
  triggered: boolean[];
  worked: boolean[];
  targetReached: boolean;
}

interface Proof {
  updatedAt: string;
  tolerancePts: number;
  interval: string;
  bySymbol: Record<string, SymProof>;
}

function pct(v: number | null | undefined) {
  return v == null ? "—" : `${v}%`;
}

function n(v: number | null | undefined) {
  return v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function shortDate(d: string) {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      style={{
        border: accent ? "1px solid var(--border-teal-strong, rgba(94,234,212,0.45))" : "1px solid var(--border, #26262b)",
        borderRadius: 12,
        padding: "18px 20px",
        background: accent ? "rgba(94,234,212,0.06)" : "var(--card, rgba(255,255,255,0.02))",
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.1, color: accent ? "var(--teal, #5EEAD4)" : "inherit" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// One rung's status: worked (ran to target) > triggered (flush+reclaim) > tagged
// (price reached it) > untouched. Color-coded so a reader can scan the ladder.
function rung(level: number, tagged: boolean, triggered: boolean, worked: boolean) {
  let color = "rgba(255,255,255,0.3)";
  let title = "not reached";
  if (worked) { color = "#4ade80"; title = "triggered → target"; }
  else if (triggered) { color = "#fbbf24"; title = "flushed + reclaimed"; }
  else if (tagged) { color = "#60a5fa"; title = "tagged (±2pts)"; }
  return (
    <span title={title} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 12, fontSize: 13 }}>
      <span style={{ width: 8, height: 8, borderRadius: 8, background: color, display: "inline-block" }} />
      {n(level)}
    </span>
  );
}

export default function PublicTrackRecordPage() {
  const { data, isLoading } = useQuery<Proof>({ queryKey: ["/api/public/proof"] });

  const symbols = data ? Object.keys(data.bySymbol) : [];
  const [sym, setSym] = useState<string>("ES");
  const active = symbols.includes(sym) ? sym : symbols[0];
  const view = active ? data?.bySymbol[active] : undefined;

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <header style={{ marginBottom: 28 }}>
          <h1 className="public-h1" style={{ fontSize: 40, marginBottom: 10 }}>
            Track Record
          </h1>
          <p className="public-hero-subtitle" style={{ maxWidth: 680 }}>
            The whole method is simple: price reaches our ranked levels almost every session,
            and then it's about which targets get hit. Below is exactly that, measured on
            15-minute bars (not just the daily candle) so a level counts only if price actually
            traded to it within a couple of points. Every session shown, no cherry-picking.
          </p>
        </header>

        {isLoading ? (
          <div style={{ opacity: 0.6 }}>Loading…</div>
        ) : !view || view.scored === 0 ? (
          <div className="archive-empty">
            No intraday-verified sessions yet. Numbers appear here as sessions settle.
          </div>
        ) : (
          <>
            {symbols.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }} data-testid="proof-filter">
                {symbols.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSym(s)}
                    style={{
                      padding: "6px 18px",
                      borderRadius: 8,
                      border: "1px solid var(--border-teal-strong, rgba(94,234,212,0.4))",
                      background: active === s ? "var(--teal, #5EEAD4)" : "transparent",
                      color: active === s ? "#050810" : "inherit",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 14,
                marginBottom: 18,
              }}
              data-testid="proof-hero"
            >
              <StatTile
                label="A level or target in play"
                value={pct(view.inPlayRate)}
                sub="price reached a ranked level or a target — every session"
                accent
              />
              <StatTile
                label="When a setup triggers, it works"
                value={pct(view.workedWhenTriggeredRate)}
                sub={`reaches the next level${view.triggerSamples ? ` · ${view.triggerSamples} setups` : ""}`}
                accent
              />
            </section>

            <p style={{ fontSize: 14, opacity: 0.72, marginBottom: 40, maxWidth: 720, lineHeight: 1.6 }}>
              Across <b>{view.scored}</b> intraday-verified {active} sessions: a failed-breakdown long set up
              (flushed a ranked level and reclaimed it) in <b>{pct(view.triggeredRate)}</b> of them — on the
              rest, price simply never pulled back to the entries, and the targets carried the day instead.
              And it's a <b>ranked ladder</b>, not one shot — the deeper backups catch the flushes the first
              entry misses.
            </p>

            <section style={{ marginBottom: 40 }}>
              <h2 className="public-h1" style={{ fontSize: 20, marginBottom: 4 }}>
                How far price runs — targets reached
              </h2>
              <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 14 }}>
                Once price is moving off the levels, how often it reaches each published upside target · {active}.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                <StatTile label="1st target reached" value={pct(view.target1Rate)} sub="the magnet, first objective" accent />
                <StatTile label="2nd target reached" value={pct(view.target2Rate)} />
                <StatTile label="3rd target reached" value={pct(view.target3Rate)} />
              </div>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 className="public-h1" style={{ fontSize: 22, marginBottom: 6 }}>
                Every session — the ladder, intraday · {active}
              </h2>
              <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 14, maxWidth: 680 }}>
                The three ranked failed-breakdown longs each session and what price actually did
                to each on 15-minute bars.{" "}
                <span style={{ color: "#4ade80" }}>● ran to next level</span>{" · "}
                <span style={{ color: "#fbbf24" }}>● flushed + reclaimed</span>{" · "}
                <span style={{ color: "#60a5fa" }}>● tagged (±{data?.tolerancePts}pts)</span>{" · "}
                <span style={{ opacity: 0.5 }}>● not reached</span>
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }} data-testid="proof-sessions">
                  <thead>
                    <tr style={{ textAlign: "left", opacity: 0.7, fontSize: 13 }}>
                      <th style={{ padding: "8px 10px" }}>Date</th>
                      <th style={{ padding: "8px 10px" }}>Ranked failed-breakdown longs</th>
                      <th style={{ padding: "8px 10px" }}>Target</th>
                      <th style={{ padding: "8px 10px" }}>Hit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.recent.map((s, i) => (
                      <tr key={`${s.date}-${i}`} style={{ borderTop: "1px solid var(--border, #26262b)", fontSize: 14 }}>
                        <td style={{ padding: "10px", whiteSpace: "nowrap" }}>{shortDate(s.date)}</td>
                        <td style={{ padding: "10px" }}>
                          {s.ladder.map((L, j) => (
                            <span key={j}>{rung(L, s.tagged[j], s.triggered[j], s.worked[j])}</span>
                          ))}
                        </td>
                        <td style={{ padding: "10px", opacity: 0.75 }}>{n(s.target)}</td>
                        <td style={{ padding: "10px", color: s.targetReached ? "#4ade80" : undefined }}>
                          {s.targetReached ? "✓" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 8, maxWidth: 680 }}>
              <b>In play</b> — price reached at least one ranked level or a target that session.
              <b> Triggered</b> — a ranked support flushed below the line and reclaimed it intraday
              (the failed-breakdown setting up). <b>Ran to next level</b> — after triggering, price
              reached the next level up (a level-to-level take-profit, how the plan is traded).
              Measured on 15-minute bars with a ±{data?.tolerancePts}-point tolerance, each session
              scored on the futures contract that was live that day.
            </p>
            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 12, maxWidth: 680 }}>
              These are level-interaction statistics describing how price moved relative to the
              published levels. They are NOT trading results or account performance, do not
              represent any actual profit or loss, and do not account for fees, commissions,
              slippage, or execution. Past performance is not indicative of future results.
              Nothing here is financial advice.
            </p>
            {data?.updatedAt && (
              <p style={{ fontSize: 11, opacity: 0.4, marginTop: 12 }}>
                Updated {new Date(data.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York" })} ET
              </p>
            )}
          </>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
