import { useState, useMemo, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { TransitMarker } from "./TransitMarker";
import { RouteLines } from "./RouteLines";
import { FitBounds } from "./FitBounds";
import { NodeInfoWindow } from "./NodeInfoWindow";
import { mapStyles } from "./mapStyles";
import { MODE_COLORS, MODE_LABELS } from "./markerIcons";
import { isPlaced } from "../../types/travel";
import type { TripNode, PlacedNode } from "../../types/travel";
import type { TransitMode } from "../../lib/travelKeywords";
import { C } from "../../lib/palette";

/**
 * Map ID is required for AdvancedMarker. Note that when a mapId is set, Google
 * ignores any inline `styles` array — map appearance is controlled from the
 * Cloud console for that ID instead.
 */
const MAP_ID = "city-companion-map";

export interface TravelMapProps {
  nodes: TripNode[];
  /** Fill the parent instead of using the built-in responsive height. */
  fullBleed?: boolean;
  /** Hide the mode legend overlay. */
  hideLegend?: boolean;
  /** Re-fit the camera when the node set changes. */
  refitOnChange?: boolean;
  onSelectNode?: (node: PlacedNode | null) => void;
}

export function TravelMap({
  nodes,
  fullBleed = false,
  hideLegend = false,
  refitOnChange = false,
  onSelectNode,
}: TravelMapProps) {
  const [selected, setSelected] = useState<PlacedNode | null>(null);
  const [anchor, setAnchor] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? "";

  /** Only placeable nodes reach the map, sorted oldest → newest for the route. */
  const placed = useMemo<PlacedNode[]>(
    () =>
      nodes
        .filter(isPlaced)
        .slice()
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [nodes]
  );

  /** Modes actually present, so the legend doesn't list unused ones. */
  const activeModes = useMemo<TransitMode[]>(() => {
    const order: TransitMode[] = ["flight", "boat", "train", "drive", "stay"];
    const present = new Set(placed.map((n) => n.transitMode));
    return order.filter((m) => present.has(m));
  }, [placed]);

  const handleSelect = useCallback(
    (node: PlacedNode, marker: google.maps.marker.AdvancedMarkerElement | null) => {
      setSelected(node);
      setAnchor(marker);
      onSelectNode?.(node);
    },
    [onSelectNode]
  );

  const handleClose = useCallback(() => {
    setSelected(null);
    setAnchor(null);
    onSelectNode?.(null);
  }, [onSelectNode]);

  const shellClass = `cc-map-shell${fullBleed ? " cc-map-shell--full" : ""}`;

  if (!apiKey || apiKey.startsWith("your_")) {
    return (
      <>
        <style>{mapStyles}</style>
        <div className={shellClass} style={{ border: `1px solid ${C.violetSoft}` }}>
          <div
            style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center",
            }}
          >
            <span style={{ fontSize: 32 }}>🗺️</span>
            <p style={{ marginTop: 12, color: C.violetDeep, fontWeight: 700, fontSize: 15 }}>
              Google Maps key needed
            </p>
            <p style={{ marginTop: 4, color: C.muted, fontSize: 12.5, lineHeight: 1.5, maxWidth: 280 }}>
              Add <code style={{ background: C.violetSoft, padding: "1px 5px", borderRadius: 4 }}>
                VITE_GOOGLE_MAPS_KEY
              </code>{" "}
              to <code>.env.local</code> to render the travel map.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{mapStyles}</style>
      <APIProvider apiKey={apiKey}>
        <div className={shellClass}>
          <Map
            mapId={MAP_ID}
            defaultCenter={{ lat: 20, lng: 0 }}
            defaultZoom={2}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            reuseMaps
            onClick={handleClose}
            style={{ width: "100%", height: "100%" }}
          >
            <RouteLines nodes={placed} selectedId={selected?.id ?? null} />

            {placed.map((node, i) => (
              <TransitMarker
                key={node.id}
                node={node}
                index={i + 1}
                selected={selected?.id === node.id}
                onSelect={handleSelect}
              />
            ))}

            {selected && (
              <NodeInfoWindow node={selected} anchor={anchor} onClose={handleClose} />
            )}

            <FitBounds nodes={placed} refitOnChange={refitOnChange} />
          </Map>

          {!hideLegend && activeModes.length > 0 && (
            <div className="cc-legend">
              {activeModes.map((mode) => (
                <span key={mode} className="cc-legend__item">
                  <span className="cc-legend__dot" style={{ background: MODE_COLORS[mode] }} />
                  {MODE_LABELS[mode]}
                </span>
              ))}
            </div>
          )}

          {placed.length === 0 && (
            <div
              style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", pointerEvents: "none",
                background: "rgba(244,243,249,.82)", textAlign: "center", padding: 24,
              }}
            >
              <span style={{ fontSize: 28 }}>📍</span>
              <p style={{ marginTop: 10, color: C.ink, fontWeight: 700, fontSize: 14.5 }}>
                No mapped stops yet
              </p>
              <p style={{ marginTop: 3, color: C.muted, fontSize: 12.5, maxWidth: 240 }}>
                Connect Instagram and tag your posts with a location to see them here.
              </p>
            </div>
          )}
        </div>
      </APIProvider>
    </>
  );
}
