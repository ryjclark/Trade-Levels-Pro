import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import { useSeo } from "@/hooks/use-seo";
import { SITE_NAME } from "@/lib/constants";
import "./public.css";

interface BriefToday {
  symbol: string;
  date: string;
  bias: string | null;
  magnet: number | null;
  dzTop: number | null;
  dzBottom: number | null;
  keyLevel: number | null;
  headline: string;
}
interface BriefRecap {
  symbol: string;
  date: string;
  line: string;
}
interface DailyBrief {
  generatedForDate: string | null;
  today: BriefToday[];
  recap: BriefRecap[];
  note: string;
}

function n(v: number | null) {
  return v == null ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
function fmtDate(d: string | null) {
  if (!d) return "";
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function card(): CSSProperties {
  return {
    border: "1px solid var(--border, #26262b)",
    borderRadius: 12,
    padding: "18px 20px",
    background: "var(--card, rgba(255,255,255,0.02))",
  };
}

export default function PublicBriefPage() {
  useSeo({
    title: `Daily Brief | ${SITE_NAME}`,
    description:
      "The daily ES and NQ brief: how yesterday's plan resolved and today's setup at a glance. Reactive, level-based, and updated every trading day.",
    path: "/brief",
  });

  const { data, isLoading } = useQuery<DailyBrief>({
    queryKey: ["/api/public/daily-brief"],
    refetchInterval: 5 * 60 * 1000,
  });

  const today = data?.today ?? [];
  const recap = data?.recap ?? [];

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <header style={{ marginBottom: 28 }}>
          <h1 className="public-h1" style={{ fontSize: 40, marginBottom: 10 }}>
            Daily Brief
          </h1>
          <p className="public-hero-subtitle" style={{ maxWidth: 640 }}>
            How yesterday's plan resolved, and today's setup at a glance. The full
            ranked plan for members goes to Telegram and the on-site terminal.
            {data?.generatedForDate ? ` Prepared for ${fmtDate(data.generatedForDate)}.` : ""}
          </p>
        </header>

        {isLoading ? (
          <div style={{ opacity: 0.6 }}>Loading…</div>
        ) : (
          <>
            {today.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 className="public-h1" style={{ fontSize: 22, marginBottom: 14 }}>
                  Today's setup
                </h2>
                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {today.map((t) => (
                    <div key={t.symbol} style={card()} data-testid={`brief-today-${t.symbol}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 700 }}>{t.symbol}</span>
                        <span style={{ opacity: 0.7, fontSize: 13 }}>{t.bias || "Reactive"}</span>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                        <div>Magnet <b>{n(t.magnet)}</b></div>
                        <div>Dynamic Zone <b>{n(t.dzBottom)} – {n(t.dzTop)}</b></div>
                        <div>Key failed-breakdown level <b>{n(t.keyLevel)}</b></div>
                      </div>
                      <p style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>{t.headline}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {recap.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 className="public-h1" style={{ fontSize: 22, marginBottom: 14 }}>
                  Yesterday in review
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recap.map((r) => (
                    <div key={r.symbol} style={card()} data-testid={`brief-recap-${r.symbol}`}>
                      <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>{fmtDate(r.date)}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.6 }}>{r.line}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, opacity: 0.5, marginTop: 10 }}>
                  Recap figures are level-interaction statistics measured from the
                  session's OHLC, not trading results. See the{" "}
                  <Link href="/track-record" style={{ color: "inherit", textDecoration: "underline" }}>track record</Link>.
                </p>
              </section>
            )}

            {today.length === 0 && recap.length === 0 && (
              <div className="archive-empty">
                The next brief posts after the cash close. Check back by 5:30 PM ET
                on a trading day.
              </div>
            )}

            <section style={{ ...card(), display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 14 }}>
                Want the full ranked plan (best failed-breakdown longs and rejection
                shorts) every day in Telegram and on the terminal?
              </div>
              <Link href="/pricing" className="btn-primary" data-testid="brief-cta">
                Subscribe →
              </Link>
            </section>

            {data?.note && (
              <p style={{ fontSize: 12, opacity: 0.5, marginTop: 20, maxWidth: 640 }}>{data.note}</p>
            )}
          </>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
