import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import StickyCta from "@/components/sticky-cta";
import { useSeo } from "@/hooks/use-seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import "./public.css";

interface PublicPlan {
  id: number;
  date: string;
  symbol: string;
  contract: string | null;
  dynamicZoneTop: number | null;
  dynamicZoneBottom: number | null;
  magnet: number | null;
  r1: number | null; r2: number | null; r3: number | null; r4: number | null;
  s1: number | null; s2: number | null; s3: number | null; s4: number | null;
  bias: string | null;
  publishedAt: string | null;
  updatedAt: number | null;
}

function fmtDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function n(v: number | null) { return v == null ? "—" : v.toLocaleString(); }

function setMetaProperty(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function PublicPlanDetailPage() {
  const [, params] = useRoute("/p/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const { data: plan, isLoading, isError } = useQuery<PublicPlan>({
    queryKey: ["/api/public/plans", id],
    enabled: Number.isFinite(id) && id > 0,
    retry: false,
  });

  // Base SEO via the existing hook (title/description/canonical/og:image/twitter:*).
  const dateLabel = plan ? fmtDate(plan.date) : "";
  // Version the og:image URL by the plan's last-edit timestamp so social
  // crawlers and CDNs re-fetch a fresh card whenever the plan is edited.
  const ogImage = plan
    ? `${SITE_URL}/api/og/plan/${plan.id}.png${plan.updatedAt ? `?v=${plan.updatedAt}` : ""}`
    : undefined;
  const description = plan
    ? `Magnet ${n(plan.magnet)} · DZ ${n(plan.dynamicZoneBottom)}–${n(plan.dynamicZoneTop)}${plan.bias ? ` · Bias ${plan.bias}` : ""}`
    : "Daily ES futures trade plan from Trade Levels Pro.";

  useSeo({
    title: plan
      ? `${plan.symbol} Trade Plan — ${dateLabel} | ${SITE_NAME}`
      : `Trade Plan | ${SITE_NAME}`,
    description,
    path: `/p/${Number.isFinite(id) ? id : ""}`,
    image: ogImage,
    type: "article",
  });

  // Add the OG image dimensions (the shared useSeo hook doesn't take these).
  useEffect(() => {
    if (!ogImage) return;
    setMetaProperty("og:image:width", "1200");
    setMetaProperty("og:image:height", "630");
  }, [ogImage]);

  const notFound = isError || (!isLoading && !plan);

  return (
    <div className="public-page">
      <PublicNav />
      <main className="public-container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/archive" className="public-link" data-testid="link-back-archive" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          <ArrowLeft size={14} /> Back to archive
        </Link>

        {isLoading && (
          <div className="archive-card archive-skeleton" style={{ height: 360 }} data-testid="plan-detail-loading" />
        )}

        {notFound && (
          <div className="archive-empty" data-testid="plan-detail-notfound">
            This plan isn't available.
            <div style={{ marginTop: 16 }}>
              <Link href="/archive" className="btn-secondary">Browse the archive →</Link>
            </div>
          </div>
        )}

        {plan && (
          <article className="archive-card" data-testid={`plan-detail-${plan.id}`} style={{ padding: 28 }}>
            <header className="archive-card-head" style={{ marginBottom: 18 }}>
              <div className="archive-card-title">
                <span className="archive-symbol" data-testid="text-plan-symbol">{plan.symbol}</span>
                <span className="archive-date" data-testid="text-plan-date">{fmtDate(plan.date)}</span>
                {plan.contract && <span className="archive-contract">{plan.contract}</span>}
              </div>
              <span className="archive-result-dot" title="Published">
                <CheckCircle2 size={12} strokeWidth={2.5} /> published
              </span>
            </header>

            <div className="archive-row">
              <span className="archive-k">Magnet</span>
              <span className="archive-v" data-testid="text-plan-magnet">{n(plan.magnet)}</span>
            </div>
            <div className="archive-row">
              <span className="archive-k">Dynamic Zone</span>
              <span className="archive-v" data-testid="text-plan-dz">
                {n(plan.dynamicZoneBottom)} – {n(plan.dynamicZoneTop)}
              </span>
            </div>

            <div className="archive-grid-rs">
              <div>
                <div className="archive-rs-label up">Resistance</div>
                <ul className="archive-rs-list">
                  <li>R1 <b>{n(plan.r1)}</b></li>
                  <li>R2 <b>{n(plan.r2)}</b></li>
                  <li>R3 <b>{n(plan.r3)}</b></li>
                  <li>R4 <b>{n(plan.r4)}</b></li>
                </ul>
              </div>
              <div>
                <div className="archive-rs-label down">Support</div>
                <ul className="archive-rs-list">
                  <li>S1 <b>{n(plan.s1)}</b></li>
                  <li>S2 <b>{n(plan.s2)}</b></li>
                  <li>S3 <b>{n(plan.s3)}</b></li>
                  <li>S4 <b>{n(plan.s4)}</b></li>
                </ul>
              </div>
            </div>

            <div className="archive-locked">
              <div className="archive-locked-row">
                <Lock size={12} strokeWidth={2.5} />
                <span>Bias & setups — members only</span>
              </div>
              <Link href="/pricing" className="archive-locked-cta" data-testid="link-plan-unlock">
                Unlock →
              </Link>
            </div>
          </article>
        )}
      </main>
      <PublicFooter />
      <StickyCta />
    </div>
  );
}
