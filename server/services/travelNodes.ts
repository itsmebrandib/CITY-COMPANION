/**
 * Turns raw Instagram media into map-ready trip nodes.
 *
 * Pipeline per post: caption -> transit mode, location tag -> lat/lng, then
 * both are folded into a flat TripNode the client can drop straight onto the
 * Google Map. Posts that fail geocoding are still returned (with null coords
 * and a reason) so the UI can list them as "needs a location" instead of
 * silently dropping the user's content.
 */

import { detectTransitMode, extractHashtags, MOVING_MODES } from "./transitDetector";
import type { TransitMode } from "./transitDetector";
import { geocodeLocation } from "./geocoder";
import type { GeocodeStatus } from "./geocoder";

/** Shape of a post as returned by the Instagram Graph API. */
export interface RawInstagramPost {
  id: string;
  caption?: string;
  permalink: string;
  media_url?: string;
  thumbnail_url?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
  /** Graph API returns this only for posts with a tagged place. */
  location?: { name?: string; latitude?: number; longitude?: number };
  /** Some integrations supply a plain string instead. */
  location_name?: string;
}

export interface TripNode {
  id: string;
  locationName: string | null;
  lat: number | null;
  lng: number | null;
  transitMode: TransitMode;
  instagramPostUrl: string;
  mediaUrl: string | null;
  timestamp: string;
  /** Original caption, retained so the map InfoWindow can show a snippet. */
  caption: string | null;
}

export interface TripNodeMeta {
  /** False when geocoding failed or no place was tagged. */
  mapped: boolean;
  geocodeStatus: GeocodeStatus;
  geocodeError: string | null;
  /** True when transitMode came from the fallback, not from caption evidence. */
  transitIsFallback: boolean;
  transitScore: number;
  transitMatches: string[];
  hashtags: string[];
  formattedAddress: string | null;
}

/** A TripNode plus the diagnostics the UI/logs may want. */
export interface AnnotatedTripNode extends TripNode {
  meta: TripNodeMeta;
}

export interface BuildOptions {
  /**
   * Mode assigned when a caption carries no travel signal.
   * Defaults to "stay" — we don't invent journeys the user didn't describe.
   */
  fallbackMode?: TransitMode;
  /**
   * When true, posts that could not be geocoded are omitted from the result.
   * Defaults to false so the caller decides how to surface them.
   */
  dropUnmapped?: boolean;
}

/** Picks the best displayable image URL for a post. */
function pickMediaUrl(post: RawInstagramPost): string | null {
  if (post.media_type === "VIDEO") return post.thumbnail_url ?? post.media_url ?? null;
  return post.media_url ?? post.thumbnail_url ?? null;
}

/** Normalises the several shapes a location can arrive in. */
function readLocation(post: RawInstagramPost): {
  name: string | null;
  lat: number | null;
  lng: number | null;
} {
  const name = post.location?.name ?? post.location_name ?? null;
  const lat = typeof post.location?.latitude === "number" ? post.location.latitude : null;
  const lng = typeof post.location?.longitude === "number" ? post.location.longitude : null;
  return { name, lat, lng };
}

/**
 * Builds a single trip node. Never throws — all failure modes are encoded in
 * `meta` so a malformed post can't take down a batch.
 */
export async function buildTripNode(
  post: RawInstagramPost,
  options: BuildOptions = {}
): Promise<AnnotatedTripNode> {
  const caption = post.caption ?? "";
  const hashtags = extractHashtags(caption);

  const transit = detectTransitMode(caption, {
    fallback: options.fallbackMode ?? "stay",
    hashtags,
  });

  const location = readLocation(post);

  // Graph API already gave us coordinates — skip the billable geocode call.
  if (location.lat !== null && location.lng !== null) {
    return {
      id: post.id,
      locationName: location.name,
      lat: location.lat,
      lng: location.lng,
      transitMode: transit.mode,
      instagramPostUrl: post.permalink,
      mediaUrl: pickMediaUrl(post),
      timestamp: post.timestamp,
      caption: caption || null,
      meta: {
        mapped: true,
        geocodeStatus: "ok",
        geocodeError: null,
        transitIsFallback: transit.isFallback,
        transitScore: transit.score,
        transitMatches: transit.matched,
        hashtags,
        formattedAddress: location.name,
      },
    };
  }

  const geo = await geocodeLocation(location.name);

  return {
    id: post.id,
    locationName: location.name,
    lat: geo.lat,
    lng: geo.lng,
    transitMode: transit.mode,
    instagramPostUrl: post.permalink,
    mediaUrl: pickMediaUrl(post),
    timestamp: post.timestamp,
    caption: caption || null,
    meta: {
      mapped: geo.status === "ok",
      geocodeStatus: geo.status,
      geocodeError: geo.error,
      transitIsFallback: transit.isFallback,
      transitScore: transit.score,
      transitMatches: transit.matched,
      hashtags,
      formattedAddress: geo.formattedAddress,
    },
  };
}

export interface BuildBatchResult {
  nodes: AnnotatedTripNode[];
  /** Nodes that carry usable coordinates, sorted oldest -> newest. */
  mapped: AnnotatedTripNode[];
  /** Nodes we could not place, with the reason on each `meta`. */
  unmapped: AnnotatedTripNode[];
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
    byMode: Record<TransitMode, number>;
    /** How many nodes represent movement rather than a stay. */
    legs: number;
  };
}

/**
 * Processes a whole feed. Runs in bounded-concurrency batches so a 50-post
 * sync doesn't fire 50 simultaneous geocode requests.
 */
export async function buildTripNodes(
  posts: RawInstagramPost[],
  options: BuildOptions = {}
): Promise<BuildBatchResult> {
  const CONCURRENCY = 5;
  const nodes: AnnotatedTripNode[] = [];

  for (let i = 0; i < posts.length; i += CONCURRENCY) {
    const slice = posts.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      slice.map((p) => buildTripNode(p, options))
    );

    settled.forEach((outcome, idx) => {
      if (outcome.status === "fulfilled") {
        nodes.push(outcome.value);
        return;
      }
      // Defensive: buildTripNode shouldn't reject, but a malformed post must
      // not lose the rest of the batch.
      const post = slice[idx];
      console.error(`Trip node build failed for post ${post?.id}:`, outcome.reason);
      nodes.push({
        id: post?.id ?? `unknown-${i + idx}`,
        locationName: null,
        lat: null,
        lng: null,
        transitMode: options.fallbackMode ?? "stay",
        instagramPostUrl: post?.permalink ?? "",
        mediaUrl: null,
        timestamp: post?.timestamp ?? new Date(0).toISOString(),
        caption: post?.caption ?? null,
        meta: {
          mapped: false,
          geocodeStatus: "network_error",
          geocodeError:
            outcome.reason instanceof Error ? outcome.reason.message : "Unexpected failure",
          transitIsFallback: true,
          transitScore: 0,
          transitMatches: [],
          hashtags: [],
          formattedAddress: null,
        },
      });
    });
  }

  const byTime = (a: AnnotatedTripNode, b: AnnotatedTripNode) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

  const mapped = nodes.filter((n) => n.meta.mapped).sort(byTime);
  const unmapped = nodes.filter((n) => !n.meta.mapped);

  const byMode: Record<TransitMode, number> = {
    flight: 0, boat: 0, train: 0, drive: 0, stay: 0,
  };
  nodes.forEach((n) => { byMode[n.transitMode] += 1; });

  const filtered = options.dropUnmapped ? mapped : nodes.slice().sort(byTime);

  return {
    nodes: filtered,
    mapped,
    unmapped,
    stats: {
      total: nodes.length,
      mapped: mapped.length,
      unmapped: unmapped.length,
      byMode,
      legs: MOVING_MODES.reduce((sum, m) => sum + byMode[m], 0),
    },
  };
}

/** Strips diagnostics, returning exactly the documented TripNode contract. */
export function toTripNode(node: AnnotatedTripNode): TripNode {
  const { meta, ...bare } = node;
  return bare;
}
