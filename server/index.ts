import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { registerStripeRoutes } from "./stripe";
import { registerSeoRoutes } from "./seo-routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import { registerCronJobs } from "./cron";
import { seedAdminIfNeeded, cleanupExpiredSessions } from "./auth";

const app = express();
const httpServer = createServer(app);

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.get("/subscribe", (_req, res) => res.redirect(301, "/pricing"));

// Stripe webhook MUST receive raw body — register before express.json()
registerStripeRoutes(app);
registerSeoRoutes(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  const SENSITIVE_PATHS = new Set([
    "/api/auth/login",
    "/api/auth/check",
    "/api/auth/logout",
    "/api/preview-signup",
  ]);

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && !SENSITIVE_PATHS.has(path)) {
        const safe = { ...capturedJsonResponse };
        if ("token" in safe) safe.token = "[REDACTED]";
        if ("password" in safe) safe.password = "[REDACTED]";
        logLine += ` :: ${JSON.stringify(safe)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);
  
  await seedDatabase().catch(err => {
    console.error("Failed to seed database:", err);
  });

  // Pass 8: seed default admin login (Ryan/Ryan) on first boot of whichever
  // environment starts first. After that the DB row wins.
  await seedAdminIfNeeded().catch(err => {
    console.error("Failed to seed admin credential:", err);
  });

  // Boot-time cleanup so restarts don't leave stale rows for an hour.
  cleanupExpiredSessions().catch(err => console.warn("Initial session cleanup failed:", err));
  setInterval(() => {
    cleanupExpiredSessions().catch(err => console.warn("Hourly session cleanup failed:", err));
  }, 60 * 60 * 1000);

  registerCronJobs();

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
