/**
 * Thin wrapper over the Google Geocoding API.
 *
 * Instagram location names repeat heavily across a feed (twenty posts from one
 * trip share three or four venues), so results are memoised in-process. That
 * keeps a 50-post sync well under a handful of billable calls.
 */

import axios from "axios";

export type GeocodeStatus =
  | "ok"
  | "not_found"
  | "no_location"
  | "quota_exceeded"
  | "request_denied"
  | "network_error";

export interface GeocodeResult {
  status: GeocodeStatus;
  lat: number | null;
  lng: number | null;
  /** Google's canonical name, e.g. "Austin, TX, USA". */
  formattedAddress: string | null;
  /** Human-readable reason when status !== "ok". */
  error: string | null;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;

interface CacheEntry {
  result: GeocodeResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
/** De-dupes concurrent lookups of the same key into one upstream call. */
const inflight = new Map<string, Promise<GeocodeResult>>();

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

function fail(status: GeocodeStatus, error: string): GeocodeResult {
  return { status, lat: null, lng: null, formattedAddress: null, error };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheKey(location: string): string {
  return location.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Resolves a free-text location string to coordinates.
 *
 * Never throws — every failure path returns a GeocodeResult carrying a status
 * and a message, so one bad location can't abort a whole feed sync.
 */
export async function geocodeLocation(
  location: string | null | undefined
): Promise<GeocodeResult> {
  if (!location || !location.trim()) {
    return fail("no_location", "No location string supplied");
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    return fail("request_denied", "GOOGLE_MAPS_SERVER_KEY is not configured");
  }

  const key = cacheKey(location);

  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.result;

  const pending = inflight.get(key);
  if (pending) return pending;

  const lookup = (async (): Promise<GeocodeResult> => {
    let lastError = "Unknown geocoding failure";

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { data } = await axios.get(GEOCODE_URL, {
          params: { address: location, key: apiKey },
          timeout: 8000,
        });

        if (data.status === "OK" && data.results?.length) {
          const best = data.results[0];
          const result: GeocodeResult = {
            status: "ok",
            lat: best.geometry.location.lat,
            lng: best.geometry.location.lng,
            formattedAddress: best.formatted_address ?? null,
            error: null,
          };
          cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
          return result;
        }

        if (data.status === "ZERO_RESULTS") {
          // Definitive answer — cache it so we don't re-ask for a bad venue.
          const result = fail("not_found", `No match for "${location}"`);
          cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
          return result;
        }

        if (data.status === "OVER_QUERY_LIMIT") {
          lastError = "Google geocoding quota exceeded";
          await sleep(2 ** attempt * 500);
          continue;
        }

        if (data.status === "REQUEST_DENIED") {
          return fail("request_denied", data.error_message ?? "Geocoding request denied");
        }

        lastError = data.error_message ?? `Geocoding returned ${data.status}`;
        await sleep(2 ** attempt * 500);
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Network error";
        await sleep(2 ** attempt * 500);
      }
    }

    return fail(
      lastError.includes("quota") ? "quota_exceeded" : "network_error",
      lastError
    );
  })();

  inflight.set(key, lookup);
  try {
    return await lookup;
  } finally {
    inflight.delete(key);
  }
}

/** Test/ops hook — clears the memo cache. */
export function clearGeocodeCache(): void {
  cache.clear();
}

export function geocodeCacheSize(): number {
  return cache.size;
}
