import { Link } from "wouter";
import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import Reveal from "@/components/reveal";
import { useSeo } from "@/hooks/use-seo";
import { ARTICLES } from "@/lib/articles";
import { CTA_TEXT, SITE_NAME } from "@/lib/constants";

export default function PublicLearnPage() {
  useSeo({
    title: `Learn — ES Futures, Levels, and Prop Trading | ${SITE_NAME}`,
    description: "In-depth articles on ES futures levels, the Magnet, the Dynamic Zone, prop firm strategy, and building a repeatable daily trade plan.",
    path: "/learn",
  });

  return (
    <div className="public-page">
      <PublicNav />
      <div className="public-container">
        <section className="public-hero">
          <div className="hero-orbs" aria-hidden="true">
            <div className="hero-orb-a" />
            <div className="hero-orb-b" />
          </div>
          <div className="hero-noise" aria-hidden="true" />
          <div className="public-hero-content public-hero-centered">
            <span className="public-section-eyebrow">Resources</span>
            <h1>Learn the <span className="accent">Method</span></h1>
            <p className="public-hero-subtitle">
              Long-form posts on ES futures levels, prop trading, and the exact
              process behind every Trade Levels Pro daily plan.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="public-section" style={{ paddingTop: 24 }}>
            <div className="blog-grid">
              {ARTICLES.map((a) => (
                <Link
                  key={a.slug}
                  href={`/learn/${a.slug}`}
                  className="blog-card"
                  data-testid={`card-article-${a.slug}`}
                >
                  <div className="blog-card-meta">{a.date} · {a.readMinutes} min read</div>
                  <h2 className="blog-card-title">{a.title}</h2>
                  <p className="blog-card-excerpt">{a.excerpt}</p>
                  <span className="blog-card-link">Read article →</span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <section className="public-cta-section">
          <div className="cta-orbs" aria-hidden="true">
            <div className="cta-orb-a" />
            <div className="cta-orb-b" />
          </div>
          <h2 className="public-section-title">Want the daily plan, not just the theory?</h2>
          <Link href="/pricing" className="btn-primary" data-testid="button-cta-learn">
            {CTA_TEXT} →
          </Link>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
