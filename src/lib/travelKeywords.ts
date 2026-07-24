export type TransportMode = "flight" | "boat" | "train" | "road" | null;

const FLIGHT = [
  "✈️", "flight", "boarding", "takeoff", "landed", "airport", "layover",
  "terminal", "jetlagged", "airborne", "runway", "#flightmode", "#flying",
  "#intheair", "#travel", "departures", "arrivals",
];

const BOAT = [
  "⛵", "🚢", "cruise", "sailing", "yacht", "ferry", "ship", "aboard",
  "portside", "marina", "anchor", "nautical", "#sailing", "#cruiselife",
  "#yachtlife", "sea day", "ocean liner",
];

const TRAIN = [
  "🚂", "🚆", "train", "rail", "amtrak", "eurostar", "shinkansen", "tgv",
  "intercity", "railway", "locomotive", "#traintravel", "#trainride",
  "on the rails", "station", "platform",
];

const ROAD = [
  "🚗", "🛣️", "roadtrip", "road trip", "driving", "highway", "interstate",
  "miles driven", "#vanlife", "#roadtrip", "on the road",
];

function hits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k.toLowerCase())).length;
}

export function detectTransport(caption: string, hashtags: string[] = []): TransportMode {
  const full = `${caption} ${hashtags.join(" ")}`;
  const scores: Record<TransportMode & string, number> = {
    flight: hits(full, FLIGHT),
    boat: hits(full, BOAT),
    train: hits(full, TRAIN),
    road: hits(full, ROAD),
  };
  const winner = (Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  return winner[1] > 0 ? (winner[0] as TransportMode) : null;
}

export const TRANSPORT_LABELS: Record<string, { emoji: string; label: string }> = {
  flight: { emoji: "✈️", label: "Flight" },
  boat: { emoji: "⛵", label: "Boat" },
  train: { emoji: "🚂", label: "Train" },
  road: { emoji: "🚗", label: "Road trip" },
};
