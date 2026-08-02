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
}

interface TrackRecord {
  overall: Summary;
  bySymbol: Record<string, Summary>;
}

function pct(v: number | null) {
  return v == null ? "—" : `${v}%`;
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
          <p className="public-hero-subtitle" style={{ maxWidth: 640 }}>
            How often each session tagged the levels we published the night before.
            Measured automatically from daily OHLC — no cherry-picking.
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
              <StatTile label="Magnet hit rate" value={pct(overall.magnetHitRate)} />
              <StatTile label="R1 tagged" value={pct(overall.r1TagRate)} />
              <StatTile label="S1 tagged" value={pct(overall.s1TagRate)} />
              <StatTile
                label="Sessions counted"
                value={overall.sessions.toLocaleString()}
              />
            </section>

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
                        <th style={{ padding: "8px 10px" }}>Magnet</th>
                        <th style={{ padding: "8px 10px" }}>R1</th>
                        <th style={{ padding: "8px 10px" }}>R2</th>
                        <th style={{ padding: "8px 10px" }}>S1</th>
                        <th style={{ padding: "8px 10px" }}>S2</th>
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
                            <td style={{ padding: "10px" }}>{pct(s.magnetHitRate)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.r1TagRate)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.r2TagRate)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.s1TagRate)}</td>
                            <td style={{ padding: "10px" }}>{pct(s.s2TagRate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 32, maxWidth: 640 }}>
              A "tag" means price traded to or through that level during the
              session. Magnet hit means the session's range contained the magnet.
              Past performance is not indicative of future results.
            </p>
          </>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
