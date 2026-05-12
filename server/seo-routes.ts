import type { Express } from "express";
import { storage } from "./storage";

const SITE_URL = "https://tradelevelspro.com";

const STATIC_PATHS: Array<{ path: string; changefreq: string; priority: number }> = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/sample", changefreq: "weekly", priority: 0.9 },
  { path: "/how-it-works", changefreq: "monthly", priority: 0.8 },
  { path: "/pricing", changefreq: "monthly", priority: 0.9 },
  { path: "/prop-firms", changefreq: "weekly", priority: 0.8 },
  { path: "/indicator", changefreq: "monthly", priority: 0.8 },
  { path: "/learn", changefreq: "weekly", priority: 0.8 },
  { path: "/learn/what-is-a-magnet-level-es-futures", changefreq: "monthly", priority: 0.7 },
  { path: "/learn/prop-firm-traders-support-resistance", changefreq: "monthly", priority: 0.7 },
  { path: "/learn/building-a-daily-es-trade-plan-template", changefreq: "monthly", priority: 0.7 },
  { path: "/archive", changefreq: "daily", priority: 0.8 },
  { path: "/terms", changefreq: "yearly", priority: 0.3 },
  { path: "/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/risk", changefreq: "yearly", priority: 0.3 },
];

export function registerSeoRoutes(app: Express): void {
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /admin/",
        "Disallow: /login",
        "Disallow: /welcome",
        "Disallow: /api/",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
      ].join("\n")
    );
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const staticUrls = STATIC_PATHS.map(
      (entry) =>
        `  <url>\n    <loc>${SITE_URL}${entry.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`
    );

    // Per-plan public detail URLs (/p/:id) — only published, public-source plans.
    let planUrls: string[] = [];
    try {
      const plans = await storage.listPublicPlans(200);
      planUrls = plans.map((p) => {
        const lastmod = p.publishedAt
          ? new Date(p.publishedAt).toISOString().slice(0, 10)
          : today;
        return `  <url>\n    <loc>${SITE_URL}/p/${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
      });
    } catch (err) {
      console.error("sitemap: failed to list public plans:", err);
    }

    const urls = [...staticUrls, ...planUrls].join("\n");
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      );
  });
}
