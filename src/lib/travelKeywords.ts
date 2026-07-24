/**
 * Client-side mirror of the server's transit vocabulary.
 *
 * Detection itself lives on the server (server/services/transitDetector.ts) so
 * there is one source of truth; this module only carries the shared type and
 * the display metadata the UI needs. `detectTransport` remains for posts that
 * arrive from a cache without a server-assigned mode.
 */

export type TransitMode = "flight" | "boat" | "train" | "drive" | "stay";

/** @deprecated Use TransitMode. Kept so older imports keep compiling. */
export type TransportMode = TransitMode;

export const TRANSPORT_LABELS: Record<TransitMode, { emoji: string; label: string }> = {
  flight: { emoji: "✈️", label: "Flight" },
  boat: { emoji: "⛵", label: "Boat" },
  train: { emoji: "🚂", label: "Train" },
  drive: { emoji: "🚗", label: "Road trip" },
  stay: { emoji: "📍", label: "Stay" },
};

/** Modes that represent movement, i.e. worth drawing as a leg on the map. */
export const MOVING_MODES: TransitMode[] = ["flight", "boat", "train", "drive"];

const QUICK_RULES: Record<Exclude<TransitMode, "stay">, RegExp> = {
  flight: /\b(flight|flights|flying|flew|plane|airplane|airline)\b|✈|🛫|🛬|#flight\b/i,
  boat: /\b(boat|boats|ferry|ferries|sailing|cruise|cruising|yacht)\b|⛵|🚢|🛳|#sailing\b/i,
  train: /\b(train|trains|rail|railway|amtrak|eurostar|shinkansen)\b|🚂|🚆|🚄|#traintravel\b/i,
  drive: /\b(roadtrip|road\s+trip|driving|drove|campervan)\b|🚗|🚙|🛣|#vanlife\b/i,
};

/**
 * Lightweight fallback detector. The server version is more accurate — prefer
 * the `transitMode` field returned by /api/travel/nodes when it is present.
 */
export function detectTransport(caption: string, hashtags: string[] = []): TransitMode {
  const text = `${caption} ${hashtags.join(" ")}`;
  for (const mode of MOVING_MODES) {
    if (mode !== "stay" && QUICK_RULES[mode as Exclude<TransitMode, "stay">].test(text)) {
      return mode;
    }
  }
  return "stay";
}
