import { useState, useEffect, useCallback } from "react";
import type { TripNode } from "../types/travel";
import type { TransitMode } from "../lib/travelKeywords";

export interface TravelStats {
  total: number;
  mapped: number;
  unmapped: number;
  byMode: Record<TransitMode, number>;
  legs: number;
}

interface NodesResponse {
  nodes: TripNode[];
  stats: TravelStats;
  unmapped: Array<{ id: string; locationName: string | null; reason: string | null }>;
}

/**
 * Loads geocoded trip nodes from the server pipeline
 * (GET /api/travel/nodes). Returns an empty set rather than an error when
 * Instagram simply isn't connected yet.
 */
export function useTravelNodes() {
  const [nodes, setNodes] = useState<TripNode[]>([]);
  const [stats, setStats] = useState<TravelStats | null>(null);
  const [unmapped, setUnmapped] = useState<NodesResponse["unmapped"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/travel/nodes", { credentials: "include" });

      if (res.status === 401) {
        setConnected(false);
        setNodes([]);
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data: NodesResponse = await res.json();
      setNodes(data.nodes ?? []);
      setStats(data.stats ?? null);
      setUnmapped(data.unmapped ?? []);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load travel map");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { nodes, stats, unmapped, loading, error, connected, reload: load };
}
