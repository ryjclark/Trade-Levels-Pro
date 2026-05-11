import { Link, useRoute } from "wouter";
import { useEffect } from "react";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { useSeo } from "@/hooks/use-seo";
import { ARTICLES, getArticle } from "@/lib/articles";
import {
  CTA_TEXT, CTA_MAILTO, SITE_NAME, SITE_URL, OG_DEFAULT_IMAGE,
} from "@/lib/constants";
import NotFound from "@/pages/not-found";
import { ArticleMagnet } from "@/articles/magnet-level";
import { ArticlePropFirm } from "@/articles/prop-firm-sr";
import { ArticleDailyTemplate } from "@/articles/daily-template";

const BODY_MAP: Record<string, () => JSX.Element> = {
  "what-is-a-magnet-level-es-futures": ArticleMagnet,
  "prop-firm-traders-support-resistance": ArticlePropFirm,
  "building-a-daily-es-trade-plan-template": ArticleDailyTemplate,
};

function MidCta() {
  return (
    <div className="article-cta">
      <h3>Want this work done for you every trading day?</h3>
      <p>Trade Levels Pro publishes the full ES plan to Telegram after each close.</p>
      <div className="article-cta-row">
        <Link href="/sample" className="btn-secondary" data-testid="article-link-sample">See a sample</Link>
        <a href={CTA_MAILTO} className="btn-primary" data-testid="article-link-pricing">{CTA_TEXT} →</a>
      </div>
    </div>
  );
}

function EndCta() {
  return (
    <div className="article-cta">
      <h3>Trade tomorrow with structure.</h3>
      <p>The same Magnet, Dynamic Zone, and S/R ladder — delivered to Telegram every evening.</p>
      <div className="article-cta-row">
        <Link href="/pricing" className="btn-secondary" data-testid="article-link-pricing-end">View pricing</Link>
        <a href={CTA_MAILTO} className="btn-primary" data-testid="article-link-cta-end">{CTA_TEXT} →</a>
      </div>
    </div>
  );
}

export { MidCta, EndCta };

export default function PublicArticlePage() {
  const [, params] = useRoute("/learn/:slug");
  const slug = params?.slug || "";
  const article = getArticle(slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useSeo({
    title: article ? `${article.title} | ${SITE_NAME}` : `Article | ${SITE_NAME}`,
    description: article?.description || "",
    path: `/learn/${slug}`,
    type: "article",
    jsonLd: article
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.dateISO,
          dateModified: article.dateISO,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo-square.webp` },
          },
          image: OG_DEFAULT_IMAGE,
          mainEntityOfPage: `${SITE_URL}/learn/${slug}`,
        }
      : undefined,
  });

  if (!article || !BODY_MAP[slug]) return <NotFound />;
  const Body = BODY_MAP[slug];

  return (
    <div className="public-page">
      <PublicNav />
      <article className="article-shell">
        <Link href="/learn" className="article-back" data-testid="link-back-learn">← All articles</Link>
        <div className="article-meta">
          {SITE_NAME} · {article.date} · {article.readMinutes} min read
        </div>
        <h1 className="article-title">{article.title}</h1>
        <p className="article-lede">{article.excerpt}</p>
        <div className="article-body">
          <Body />
        </div>
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 12 }}>
            More from the blog
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ARTICLES.filter((a) => a.slug !== slug).map((a) => (
              <Link
                key={a.slug}
                href={`/learn/${a.slug}`}
                className="public-link-arrow"
                data-testid={`link-related-${a.slug}`}
                style={{ display: "inline-block" }}
              >
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </article>
      <div className="public-container">
        <PublicFooter />
      </div>
    </div>
  );
}
