import { useState, useEffect, useCallback } from "react";
import type { Pin, Board } from "../types/pinterest";

export function usePinterest() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pinterest/boards", { credentials: "include" });
      if (res.status === 401) { setConnected(false); return; }
      if (!res.ok) throw new Error(await res.text());
      const data: { items: Board[] } = await res.json();
      setBoards(data.items);
      setConnected(true);
      if (data.items.length > 0) setActiveBoard(data.items[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPins = useCallback(async (boardId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pinterest/boards/${boardId}/pins`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data: { items: Pin[] } = await res.json();
      setPins(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/pinterest/me", { credentials: "include" })
      .then((r) => { if (r.ok) { setConnected(true); fetchBoards(); } })
      .catch(() => {});
  }, [fetchBoards]);

  useEffect(() => {
    if (activeBoard) fetchPins(activeBoard);
  }, [activeBoard, fetchPins]);

  const connect = () => { window.location.href = "/auth/pinterest"; };

  return { pins, boards, activeBoard, setActiveBoard, loading, error, connected, connect };
}
