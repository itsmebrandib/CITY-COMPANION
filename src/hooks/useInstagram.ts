import { useState, useEffect, useCallback } from "react";
import type { IGPost } from "../types/instagram";
import { detectTransport } from "../lib/travelKeywords";

const HASH_RE = /#[\w]+/g;

function parseHashtags(caption = ""): string[] {
  return (caption.match(HASH_RE) ?? []).map((h) => h.toLowerCase());
}

export function useInstagram() {
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/instagram/posts", { credentials: "include" });
      if (res.status === 401) { setConnected(false); return; }
      if (!res.ok) throw new Error(await res.text());
      const data: { data: Array<{ id: string; media_type: string; media_url: string; thumbnail_url?: string; caption?: string; timestamp: string; permalink: string }> } = await res.json();
      const enriched: IGPost[] = data.data.map((p) => {
        const hashtags = parseHashtags(p.caption);
        return {
          ...p,
          media_type: p.media_type as IGPost["media_type"],
          hashtags,
          transport: detectTransport(p.caption ?? "", hashtags),
        };
      });
      setPosts(enriched);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if already authed on mount
    fetch("/api/instagram/me", { credentials: "include" })
      .then((r) => { if (r.ok) { setConnected(true); fetchPosts(); } })
      .catch(() => {});
  }, [fetchPosts]);

  const connect = () => {
    window.location.href = "/auth/instagram";
  };

  return { posts, loading, error, connected, connect, refetch: fetchPosts };
}
