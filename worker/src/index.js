import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import pg from "pg";

import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import productsRouter from "./routes/products.js";
import galleryRouter from "./routes/gallery.js";
import membersRouter from "./routes/members.js";
import reportsRouter from "./routes/reports.js";

const app = new Hono();

// Global Logger
app.use("*", logger());

// Global CORS
app.use(
  "*",
  cors({
    origin: (origin, c) => c.env.CORS_ORIGIN || "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Database connection helper (Hyperdrive or connection string)
export function getDb(env) {
  const connectionString =
    env.HYPERDRIVE?.connectionString ||
    env.DATABASE_URL ||
    process.env.DATABASE_URL;
  return new pg.Pool({ connectionString });
}

// Root route
app.get("/", (c) => {
  return c.json({
    name: "SER API Worker",
    status: "online",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      posts: "/api/posts",
      products: "/api/products",
      gallery: "/api/gallery",
      members: "/api/members",
      reports: "/api/reports",
    },
  });
});

// Health check
app.get("/api/health", (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() });
});

// Mount Routes
app.route("/api/auth", authRouter);
app.route("/api/posts", postsRouter);
app.route("/api/products", productsRouter);
app.route("/api/gallery", galleryRouter);
app.route("/api/members", membersRouter);
app.route("/api/reports", reportsRouter);

// 404 Handler
app.notFound((c) => {
  return c.json({ error: "Not Found", path: c.req.path }, 404);
});

// Global Error Handler
app.onError((err, c) => {
  console.error("Worker unhandled error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err?.message || String(err),
    },
    500
  );
});

export default app;
