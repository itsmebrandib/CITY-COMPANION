import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";
import dotenv from "dotenv";

import igAuthRouter from "./routes/auth/instagram";
import ptAuthRouter from "./routes/auth/pinterest";
import geocodingRouter from "./routes/geocoding";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// ── Auth routes ──────────────────────────────────────────────────────────────
app.use("/auth/instagram", igAuthRouter);
app.use("/auth/pinterest", ptAuthRouter);

// ── Geocoding proxy ──────────────────────────────────────────────────────────
app.use("/api/geocode", geocodingRouter);

// ── Instagram Graph API proxy ─────────────────────────────────────────────────
app.get("/api/instagram/me", (req, res) => {
  const token = req.cookies?.ig_token;
  if (!token) return res.status(401).json({ error: "Not connected" });
  res.json({ connected: true });
});

app.get("/api/instagram/posts", async (req, res) => {
  const token = req.cookies?.ig_token;
  if (!token) return res.status(401).json({ error: "Not connected" });

  try {
    const { data } = await axios.get("https://graph.instagram.com/me/media", {
      params: {
        fields: "id,media_type,media_url,thumbnail_url,caption,timestamp,permalink",
        access_token: token,
        limit: 50,
      },
    });
    res.json(data);
  } catch (err) {
    console.error("Instagram posts error:", err);
    res.status(500).json({ error: "Failed to fetch Instagram posts" });
  }
});

// ── Pinterest API proxy ───────────────────────────────────────────────────────
app.get("/api/pinterest/me", (req, res) => {
  const token = req.cookies?.pt_token;
  if (!token) return res.status(401).json({ error: "Not connected" });
  res.json({ connected: true });
});

app.get("/api/pinterest/boards", async (req, res) => {
  const token = req.cookies?.pt_token;
  if (!token) return res.status(401).json({ error: "Not connected" });

  try {
    const { data } = await axios.get("https://api.pinterest.com/v5/boards", {
      headers: { Authorization: `Bearer ${token}` },
      params: { page_size: 25 },
    });
    res.json(data);
  } catch (err) {
    console.error("Pinterest boards error:", err);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

app.get("/api/pinterest/boards/:boardId/pins", async (req, res) => {
  const token = req.cookies?.pt_token;
  if (!token) return res.status(401).json({ error: "Not connected" });

  try {
    const { data } = await axios.get(
      `https://api.pinterest.com/v5/boards/${req.params.boardId}/pins`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 50 },
      }
    );
    res.json(data);
  } catch (err) {
    console.error("Pinterest pins error:", err);
    res.status(500).json({ error: "Failed to fetch pins" });
  }
});

// ── Auth disconnect ───────────────────────────────────────────────────────────
app.post("/auth/instagram/disconnect", (_req, res) => {
  res.clearCookie("ig_token");
  res.json({ ok: true });
});

app.post("/auth/pinterest/disconnect", (_req, res) => {
  res.clearCookie("pt_token");
  res.clearCookie("pt_refresh");
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`City Companion server running on http://localhost:${PORT}`);
});
