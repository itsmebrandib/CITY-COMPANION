import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { PlacedNode } from "../../types/travel";

interface Props {
  nodes: PlacedNode[];
  /** Padding in px around the fitted bounds. */
  padding?: number | google.maps.Padding;
  /** Cap so a single marker doesn't slam the camera to street level. */
  maxZoom?: number;
  /**
   * Re-fit whenever the node set changes. When false (default) the map only
   * fits once, so a user's manual pan/zoom isn't yanked back on re-render.
   */
  refitOnChange?: boolean;
}

/**
 * Fits the camera to every placed marker.
 *
 * Runs imperatively via useMap because fitBounds is a camera command, not a
 * declarative prop — expressing it as `defaultBounds` would fight the user's
 * own panning on every subsequent render.
 */
export function FitBounds({ nodes, padding = 48, maxZoom = 12, refitOnChange = false }: Props) {
  const map = useMap();
  const fittedKey = useRef<string | null>(null);

  // Identity of the current node set — lets us detect real changes cheaply.
  const key = nodes.map((n) => n.id).join("|");

  useEffect(() => {
    if (!map || nodes.length === 0) return;
    if (!refitOnChange && fittedKey.current !== null) return;
    if (fittedKey.current === key) return;

    fittedKey.current = key;

    if (nodes.length === 1) {
      const only = nodes[0];
      map.setCenter({ lat: only.lat, lng: only.lng });
      map.setZoom(Math.min(maxZoom, 10));
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    nodes.forEach((n) => bounds.extend({ lat: n.lat, lng: n.lng }));

    map.fitBounds(bounds, padding);

    // fitBounds can overshoot on tightly-clustered points; clamp once the
    // camera settles.
    const listener = google.maps.event.addListenerOnce(map, "idle", () => {
      const zoom = map.getZoom();
      if (typeof zoom === "number" && zoom > maxZoom) map.setZoom(maxZoom);
    });

    return () => google.maps.event.removeListener(listener);
  }, [map, key, nodes, padding, maxZoom, refitOnChange]);

  return null;
}
