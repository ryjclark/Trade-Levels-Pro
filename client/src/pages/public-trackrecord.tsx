import { useQuery } from "@tanstack/react-query";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import "./public.css";

interface Summary {
  sessions: number;
  magnetHitRate: number | null;
  r1TagRate: number | null;
  r2TagRate: number | null;
  s1TagRate: number | null;
  s2TagRate: number | null;
  namedTagRates?: Record<string, number | null>;
  supportTagRate?: number | null;
  resistanceTagRate?: number | null;
  failedBreakdownWinRate?: number | null;
  failedBreakdownSamples?: number;
  targetHitRate?: number | null;
  targetSamples?: number;
}

interface Session {
  date: string;
  symbol: string;
  close: number | null;
  aPlus: number | null;
  aPlusReclaimed: 0 | 1 | null;
  flushed: number;
  reclaimed: number;
  firstTarget: number | null;
  firstTargetHit: 0 | 1 | null;
}

const NAMED_LABELS: Record<string, string> = {
  priorHigh: "Prior-day high",
  priorLow: "Prior-day low",
  priorClose: "Prior-day close",
  overnightHigh: "Overnight high",
  overnightLow: "Overnight low",
  priorWeekHigh: "Prior-week high",
  priorWeekLow: "Prior-week low",
  recentHigh: "~1mo high",
  recentLow: "~1mo low",
};

interface TrackRecord {
  overall: Summary;
  bySymbol: Record<string, Summary>;
  sessions?: Session[];
}

function pct(v: number | null | undefined) {
  return v == null ? "—" : `${v}%`;
}

function n(v: number | null) {
  return v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function yn(v: 0 | 1 | null) {
  return v == null ? "—" : v === 1 ? "✓" : "—";
}

function shortDate(d: string) {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--border, #26262b)",
        borderRadius: 12,
        padding: "18px 20px",
        background: "var(--card, rgba(255,255,255,0.02))",
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function PublicTrackRecordPage() {
  const { data, isLoading } = useQuery<TrackRecord>({
    queryKey: ["/api/public/track-record"],
  });

  const overall = data?.overall;
  const symbols = data ? Object.keys(data.bySymbol).sort() : [];

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <header style={{ marginBottom: 28 }}>
          <h1 className="public-h1" style={{ fontSize: 40, marginBottom: 10 }}>
            Track Record
          </h1>
          <p className="public-hero-subtitle" style={{ maxWidth: 660 }}>
            How our published levels actually performed — the failed-breakdown win rate,
            target hits, and every session's call. Scored automatically from the regular
            session's OHLC the night before, no cherry-picking.
          </p>
        </header>

        {isLoading ? (
          <div style={{ opacity: 0.6 }}>Loading…</div>
        ) : !overall || overall.sessions === 0 ? (
          <div className="archive-empty">
            No results recorded yet. Numbers appear here after the first full
            session settles.
          </div>
        ) : (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 14,
                marginBottom: 40,
              }}
              data-testid="track-record-overall"
            >
              <StatTile
                label="Failed-breakdown win rate"
                value={pct(overall.failedBreakdownWinRate ?? null)}
                sub={
                  overall.failedBreakdownSamples
                    ? `${overall.failedBreakdownSamples} flushes reclaimed`
                    : "of levels that flushed, % that reclaimed"
                }
              />
              <StatTile
                label="Target-hit rate"
                value={pct(overall.targetHitRate)}
                sub={
                  overall.targetSamples
                    ? `1st target, ${overall.targetSamples} sessions`
                    : "1st upside target reached"
                }
              />
              <StatTile
                label="Support tag rate"
                value={pct(overall.supportTagRate ?? null)}
                sub="all support levels held"
              />
              <StatTile
                label="Resistance tag rate"
                value={pct(overall.resistanceTagRate ?? null)}
                sub="all resistance levels"
              />
              <StatTile label="Sessions counted" value={overall.sessions.toLocaleString()} />
            </section>

            {data?.sessions && data.sessions.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 className="public-h1" style={{ fontSize: 22, marginBottom: 6 }}>
                  Every session — the honest ledger
                </h2>
                <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 14, maxWidth: 660 }}>
                  The A+ failed-breakdown level each night, whether price flushed and reclaimed it
                  (the setup working), and whether the first target hit. Every call, no cherry-picking.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}
                    data-testid="track-record-sessions"
                  >
                    <thead>
                      <tr style={{ textAlign: "left", opacity: 0.7, fontSize: 13 }}>
                        <th style={{ padding: "8px 10px" }}>Date</th>
                        <th style={{ padding: "8px 10px" }}>Sym</th>
                        <th style={{ padding: "8px 10px" }}>A+ level</th>
                        <th style={{ padding: "8px 10px" }}>Flushed</th>
                        <th style={{ padding: "8px 10px" }}>Reclaimed</th>
                        <th style={{ padding: "8px 10px" }}>1st target</th>
                        <th style={{ padding: "8px 10px" }}>Hit</th>
                        <th style={{ padding: "8px 10px" }}>Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sessions.map((s, i) => (
                        <tr
                          key={`${s.date}-${s.symbol}-${i}`}
                          style={{ borderTop: "1px solid var(--border, #26262b)", fontSize: 14 }}
                        >
                          <td style={{ padding: "10px" }}>{shortDate(s.date)}</td>
                          <td style={{ padding: "10px", fontWeight: 600 }}>{s.symbol}</td>
                          <td style={{ padding: "10px" }}>{n(s.aPlus)}</td>
                          <td style={{ padding: "10px" }}>{s.flushed > 0 ? "✓" : "—"}</td>
                          <td style={{ padding: "10px", color: s.flushed > 0 ? (s.reclaimed > 0 ? "#4ade80" : "#f87171") : undefined }}>
                            {s.flushed > 0 ? (s.reclaimed > 0 ? "✓ won" : "✗") : "—"}
                          </td>
                          <td style={{ padding: "10px" }}>{n(s.firstTarget)}</td>
                          <td style={{ padding: "10px", color: s.firstTargetHit === 1 ? "#4ade80" : undefined }}>
                            {yn(s.firstTargetHit)}
                          </td>
                          <td style={{ padding: "10px", opacity: 0.65 }}>{n(s.close)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {overall.namedTagRates &&
              Object.keys(overall.namedTagRates).length > 0 && (
                <section style={{ marginBottom: 40 }}>
                  <h2
                    className="public-h1"
                    style={{ fontSize: 22, marginBottom: 14 }}
                  >
                    Structure levels — how often each gets tagged
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 12,
                    }}
                    data-testid="track-record-named"
                  >
                    {Object.entries(overall.namedTagRates)
                      .sort((a, b) => (b[1] ?? -1) - (a[1] ?? -1))
                      .map(([key, val]) => (
                        <StatTile
                          key={key}
                          label={NAMED_LABELS[key] ?? key}
                          value={pct(val)}
                        />
                      ))}
                  </div>
                </section>
              )}

            {symbols.length > 0 && (
              <section>
                <h2 className="public-h1" style={{ fontSize: 22, marginBottom: 14 }}>
                  By symbol
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}
                    data-testid="track-record-by-symbol"
                  >
                    <thead>
                      <tr style={{ textAlign: "left", opacity: 0.7, fontSize: 13 }}>
                        <th style={{ padding: "8px 10px" }}>Symbol</th>
                        <th style={{ padding: "8px 10px" }}>Sessions</th>
                        <th style={{ padding: "8px 10px" }}>FB win</th>
                        <th style={{ padding: "8px 10px" }}>Target hit</th>
                        <th style={{ padding: "8px 10px" }}>Support</th>
                        <th style={{ padding: "8px 10px" }}>Resistance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {symbols.map((sym) => {
                        const s = data!.bySymbol[sym];
                        return (
                          <tr
                            key={sym}
                            style={{ borderTop: "1px solid var(--border, #26262b)" }}
                            data-testid={`track-record-row-${sym}`}
                          >
                            <td style={{ padding: "10px", fontWeight: 600 }}>{sym}</td>
                            <td style={{ padding: "10px" }}>{s.sessions}</td>
                            <td style={{ padding: "10px" }}>{pct(s.failedBreakdownWinRate ?? null)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.targetHitRate)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.supportTagRate ?? null)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.resistanceTagRate ?? null)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 32, maxWidth: 660 }}>
              <b>Failed-breakdown win rate</b> — of the support levels that flushed
              below (traded under the line), the share that closed back above it. This is
              the core setup we trade, so it's the headline number. <b>Target-hit rate</b> —
              how often the first upside target was reached. A "tag" means price traded to
              or through a level. (We also track "magnet hit," but price crosses the pivot
              most sessions, so it's a low-signal stat we don't lead with.)
            </p>
            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 12, maxWidth: 660 }}>
              These figures are level-interaction statistics measured
              automatically from daily open/high/low/close data. They describe
              how price interacted with the published levels. They are NOT trading
              results or account performance, they do not represent any actual
              profit or loss, and they do not account for fees, commissions,
              slippage, or execution. Statistical and hypothetical measures have
              inherent limitations. Past performance is not indicative of future
              results. Nothing here is financial advice.
            </p>
          </>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
