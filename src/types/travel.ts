import type { TransitMode } from "../lib/travelKeywords";

/**
 * Client mirror of the server's TripNode contract
 * (server/services/travelNodes.ts).
 */
export interface TripNode {
  id: string;
  locationName: string | null;
  lat: number | null;
  lng: number | null;
  transitMode: TransitMode;
  instagramPostUrl: string;
  mediaUrl: string | null;
  timestamp: string;
  caption: string | null;
}

/** A TripNode known to carry usable coordinates. */
export interface PlacedNode extends TripNode {
  lat: number;
  lng: number;
}

export function isPlaced(node: TripNode): node is PlacedNode {
  return typeof node.lat === "number" && typeof node.lng === "number";
}
