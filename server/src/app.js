import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import productsRouter from "./routes/products.js";
import eventsRouter from "./routes/events.js";
import postsRouter from "./routes/posts.js";
import galleryRouter from "./routes/gallery.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/gallery", galleryRouter);

const port = Number(process.env.PORT || 0);
const host = process.env.HOST || undefined;

const server = app.listen(port, host, () => {
  const address = server.address();
  const actualPort = typeof address === "string" ? address : address?.port;
  const actualHost = typeof address === "string" ? "local" : address?.address;
  const hostLabel = actualHost && actualHost !== "::" ? actualHost : "0.0.0.0";
  console.log(`SER API running on ${hostLabel}:${actualPort}`);
});
