import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { renderIndexForPath } from "./seo-meta";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Read the built shell once; we rewrite its <head> per request for SEO.
  const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf8");

  // Hashed build assets (/assets/*) are content-addressed and immutable — cache
  // them for a year. Everything else (esp. index.html) must never be served
  // stale, or new deploys won't show up until the user clears their cache.
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    }),
  );

  // SPA fallback — rewrite the shell's <head> for this route (correct title,
  // description, canonical, og:url) and return a real 404 status for unknown
  // paths instead of a soft-404. The HTML is always no-store so new deploys
  // show up on the next load without cache-clearing.
  app.use("/{*path}", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    // Use originalUrl, not req.path: under an app.use("/{*path}") splat mount,
    // req.path is stripped to "/", which would give every route the homepage
    // meta and a 200. originalUrl is always the real requested path.
    const pathname = (req.originalUrl || req.url || "/").split("?")[0] || "/";
    const { html, status } = renderIndexForPath(indexHtml, pathname);
    res.status(status).type("html").send(html);
  });
}
