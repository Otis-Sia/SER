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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SER API running on :${port}`));
