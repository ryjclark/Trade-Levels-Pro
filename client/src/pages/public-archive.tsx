import { useQuery } from "@tanstack/react-query";
import { Lock, CheckCircle2 } from "lucide-react";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import { Link } from "wouter";
import "./public.css";

interface ArchivePlan {
  id: number;
  date: string;
  symbol: string;
  contract: string | null;
  dynamicZoneTop: number | null;
  dynamicZoneBottom: number | null;
  magnet: number | null;
  r1: number | null; r2: number | null; r3: number | null; r4: number | null;
  s1: number | null; s2: number | null; s3: number | null; s4: number | null;
  publishedAt: string | null;
  hasResult: boolean;
}

function fmtDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function n(v: number | null) { return v == null ? "—" : v.toLocaleString(); }

export default function PublicArchivePage() {
  const { data, isLoading } = useQuery<ArchivePlan[]>({
    queryKey: ["/api/public/archive"],
  });

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <header style={{ marginBottom: 28 }}>
          <h1 className="public-h1" style={{ fontSize: 40, marginBottom: 10 }}>Plan Archive</h1>
          <p className="public-hero-subtitle" style={{ maxWidth: 640 }}>
            The last 30 published plans. Levels are visible. Bias and setups stay
            inside Telegram for members.
          </p>
        </header>

        {isLoading ? (
          <div className="archive-grid">
            {[...Array(6)].map((_, i) => (
              <div className="archive-card archive-skeleton" key={i} />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="archive-empty">No published plans yet.</div>
        ) : (
          <div className="archive-grid" data-testid="public-archive-list">
            {data.map((p) => (
              <article
                key={p.id}
                className="archive-card"
                data-testid={`archive-card-${p.id}`}
              >
                <div className="archive-card-head">
                  <div className="archive-card-title">
                    <span className="archive-symbol">{p.symbol}</span>
                    <span className="archive-date">{fmtDate(p.date)}</span>
                    {p.contract && <span className="archive-contract">{p.contract}</span>}
                  </div>
                  {p.hasResult && (
                    <span
                      className="archive-result-dot"
                      title="Result tagged"
                      data-testid={`archive-result-${p.id}`}
                    >
                      <CheckCircle2 size={12} strokeWidth={2.5} /> tagged
                    </span>
                  )}
                </div>

                <div className="archive-row">
                  <span className="archive-k">Magnet</span>
                  <span className="archive-v">{n(p.magnet)}</span>
                </div>
                <div className="archive-row">
                  <span className="archive-k">Dynamic Zone</span>
                  <span className="archive-v">{n(p.dynamicZoneBottom)} – {n(p.dynamicZoneTop)}</span>
                </div>

                <div className="archive-grid-rs">
                  <div>
                    <div className="archive-rs-label up">Resistance</div>
                    <ul className="archive-rs-list">
                      <li>R1 <b>{n(p.r1)}</b></li>
                      <li>R2 <b>{n(p.r2)}</b></li>
                      <li>R3 <b>{n(p.r3)}</b></li>
                      <li>R4 <b>{n(p.r4)}</b></li>
                    </ul>
                  </div>
                  <div>
                    <div className="archive-rs-label down">Support</div>
                    <ul className="archive-rs-list">
                      <li>S1 <b>{n(p.s1)}</b></li>
                      <li>S2 <b>{n(p.s2)}</b></li>
                      <li>S3 <b>{n(p.s3)}</b></li>
                      <li>S4 <b>{n(p.s4)}</b></li>
                    </ul>
                  </div>
                </div>

                <div className="archive-locked">
                  <div className="archive-locked-row">
                    <Lock size={12} strokeWidth={2.5} />
                    <span>Bias & setups — members only</span>
                  </div>
                  <Link href="/pricing" className="archive-locked-cta" data-testid={`archive-cta-${p.id}`}>
                    Unlock →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
