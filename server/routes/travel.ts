import { Router } from "express";
import axios from "axios";
import { buildTripNodes, toTripNode } from "../services/travelNodes";
import type { RawInstagramPost } from "../services/travelNodes";
import type { TransitMode } from "../services/transitDetector";

const router = Router();

const MEDIA_FIELDS =
  "id,media_type,media_url,thumbnail_url,caption,timestamp,permalink";

/**
 * GET /api/travel/nodes
 *
 * Pulls the connected user's Instagram media, derives transit mode + coords,
 * and returns map-ready trip nodes.
 *
 * Query params:
 *   ?verbose=1          include per-node `meta` diagnostics
 *   ?dropUnmapped=1     omit posts that could not be geocoded
 *   ?fallback=drive     mode for captions with no travel signal (default "stay")
 */
router.get("/nodes", async (req, res) => {
  const token = req.cookies?.ig_token;
  if (!token) return res.status(401).json({ error: "Instagram not connected" });

  const { verbose, dropUnmapped, fallback } = req.query as Record<string, string>;

  const allowed: TransitMode[] = ["flight", "boat", "train", "drive", "stay"];
  const fallbackMode = allowed.includes(fallback as TransitMode)
    ? (fallback as TransitMode)
    : "stay";

  try {
    const { data } = await axios.get("https://graph.instagram.com/me/media", {
      params: { fields: MEDIA_FIELDS, access_token: token, limit: 50 },
      timeout: 10000,
    });

    const posts: RawInstagramPost[] = data?.data ?? [];

    const result = await buildTripNodes(posts, {
      fallbackMode,
      dropUnmapped: dropUnmapped === "1",
    });

    res.json({
      nodes: verbose === "1" ? result.nodes : result.nodes.map(toTripNode),
      stats: result.stats,
      unmapped:
        verbose === "1"
          ? result.unmapped
          : result.unmapped.map((n) => ({
              id: n.id,
              locationName: n.locationName,
              reason: n.meta.geocodeError,
            })),
    });
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    if (status === 401 || status === 403) {
      return res.status(401).json({ error: "Instagram token expired, reconnect required" });
    }
    console.error("Travel nodes error:", err);
    res.status(502).json({ error: "Failed to build travel nodes from Instagram" });
  }
});

/**
 * POST /api/travel/parse
 *
 * Stateless variant — caller supplies the posts. Useful for testing the
 * pipeline, and for clients that already hold their own media cache.
 * Body: { posts: RawInstagramPost[], fallback?, dropUnmapped? }
 */
router.post("/parse", async (req, res) => {
  const { posts, fallback, dropUnmapped } = req.body ?? {};

  if (!Array.isArray(posts)) {
    return res.status(400).json({ error: "Body must include a `posts` array" });
  }
  if (posts.length > 200) {
    return res.status(413).json({ error: "Maximum 200 posts per request" });
  }

  try {
    const result = await buildTripNodes(posts as RawInstagramPost[], {
      fallbackMode: fallback ?? "stay",
      dropUnmapped: Boolean(dropUnmapped),
    });
    res.json({ nodes: result.nodes, stats: result.stats, unmapped: result.unmapped });
  } catch (err) {
    console.error("Travel parse error:", err);
    res.status(500).json({ error: "Failed to parse posts" });
  }
});

export default router;
