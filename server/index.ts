import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool } from "./db";

const app = express();
const httpServer = createServer(app);

// Railway terminates TLS at the proxy. Trust it so secure cookies work.
app.set("trust proxy", 1);

// Configure session store
const PgSession = connectPgSimple(session);

// Session configuration
app.use(
  session({
    proxy: true,
    store: new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    },
  })
);

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
    if (path.startsWith("/api/campaigns")) {
      console.log(`🟣 [MIDDLEWARE] res.json called for ${path}`);
      console.log(`🟣 [MIDDLEWARE] Content-Type: ${res.getHeader("content-type")}`);
      console.log(`🟣 [MIDDLEWARE] Response body type: ${typeof bodyJson}`);
      console.log(`🟣 [MIDDLEWARE] Response body preview:`, JSON.stringify(bodyJson).substring(0, 200));
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  const originalResSend = res.send;
  res.send = function (body, ...args) {
    if (path.startsWith("/api/campaigns")) {
      console.log(`🟣 [MIDDLEWARE] res.send called for ${path}`);
      console.log(`🟣 [MIDDLEWARE] Content-Type: ${res.getHeader("content-type")}`);
      console.log(`🟣 [MIDDLEWARE] Body type: ${typeof body}`);
      if (typeof body === "string") {
        console.log(`🟣 [MIDDLEWARE] Body preview: ${body.substring(0, 200)}`);
      }
    }
    return originalResSend.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (path.startsWith("/api/campaigns")) {
        console.log(`🟣 [MIDDLEWARE] Response finished for ${path}`);
        console.log(`🟣 [MIDDLEWARE] Status: ${res.statusCode}`);
        console.log(`🟣 [MIDDLEWARE] Content-Type: ${res.getHeader("content-type")}`);
        console.log(`🟣 [MIDDLEWARE] All headers:`, res.getHeaders());
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // Unmatched API routes: send 404 JSON once (prevents "cannot 404 after headers sent")
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api")) return next();
    if (res.headersSent) return next();
    res.status(404).json({ error: "Not found", message: `Cannot ${req.method} ${req.path}` });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("\n🔴 [ERROR HANDLER] ========== Express Error Handler ==========");
    console.error(`🔴 [ERROR HANDLER] Path: ${req.path}`);
    console.error(`🔴 [ERROR HANDLER] Method: ${req.method}`);
    console.error(`🔴 [ERROR HANDLER] Status: ${status}`);
    console.error(`🔴 [ERROR HANDLER] Message: ${message}`);
    console.error(`🔴 [ERROR HANDLER] Headers sent: ${res.headersSent}`);
    console.error(`🔴 [ERROR HANDLER] Content-Type: ${res.getHeader("content-type")}`);
    console.error(`🔴 [ERROR HANDLER] Full error:`, err);
    console.error("🔴 [ERROR HANDLER] ============================================\n");

    if (res.headersSent) {
      console.error("🔴 [ERROR HANDLER] Headers already sent, calling next()");
      return next(err);
    }

    res.setHeader("Content-Type", "application/json");
    res.status(status).json({ message, error: message });
    return;
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
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
