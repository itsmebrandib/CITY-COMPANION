/**
 * Detects the transit mode implied by an Instagram caption + its hashtags.
 *
 * Matching is deliberately conservative: word-boundary regexes so "training"
 * never counts as "train" and "planet" never counts as "plane", plus separate
 * emoji handling (emoji have no word boundaries).
 *
 * Signals are weighted rather than counted flat — a hashtag like #flight is a
 * far stronger authorial signal than the word "terminal" appearing in prose.
 */

export type TransitMode = "flight" | "boat" | "train" | "drive" | "stay";

/** Modes that represent actual movement between places. */
export const MOVING_MODES: TransitMode[] = ["flight", "boat", "train", "drive"];

export interface TransitSignal {
  mode: TransitMode;
  /** Weighted confidence score. Higher = stronger evidence. */
  score: number;
  /** The literal tokens that fired, for debugging and UI tooltips. */
  matched: string[];
}

export interface TransitResult {
  mode: TransitMode;
  score: number;
  matched: string[];
  /** True when nothing matched and `fallback` was used instead. */
  isFallback: boolean;
  /** Every mode that scored above zero, strongest first. */
  candidates: TransitSignal[];
}

interface ModeRules {
  /** Strong, unambiguous words. Weight 3. */
  strong: string[];
  /** Supporting context words — real but weaker evidence. Weight 1. */
  weak: string[];
  /** Emoji. Weight 3, matched by substring since \b doesn't apply. */
  emoji: string[];
  /** Hashtags (without the #). Weight 4 — explicit authorial intent. */
  tags: string[];
}

const RULES: Record<Exclude<TransitMode, "stay">, ModeRules> = {
  flight: {
    strong: ["flight", "flights", "flying", "flew", "plane", "airplane", "aeroplane", "airline", "airlines", "takeoff", "airborne", "redeye", "red-eye"],
    weak: ["airport", "layover", "terminal", "boarding", "landed", "runway", "jetlag", "jetlagged", "gate", "departures", "arrivals", "mile high", "window seat", "aisle seat"],
    emoji: ["✈️", "✈", "🛫", "🛬", "🛩️", "🛩"],
    tags: ["flight", "flightmode", "flying", "avgeek", "intheair", "planespotting", "aviation", "jetsetter"],
  },
  boat: {
    strong: ["boat", "boats", "ferry", "ferries", "sailing", "sailed", "sailboat", "cruise", "cruising", "yacht", "catamaran", "kayak", "canoe"],
    weak: ["aboard", "onboard", "marina", "harbour", "harbor", "portside", "starboard", "nautical", "anchored", "setting sail", "sea day", "ocean liner", "deck", "knots"],
    emoji: ["⛵", "🚢", "🛥️", "🛥", "🛳️", "🛳", "⚓", "🛶"],
    tags: ["sailing", "boatlife", "cruiselife", "yachtlife", "boating", "sailingtrip", "ferryride", "cruise"],
  },
  train: {
    strong: ["train", "trains", "rail", "railway", "railways", "amtrak", "eurostar", "shinkansen", "tgv", "locomotive", "metro", "subway", "tram"],
    weak: ["platform", "carriage", "sleeper car", "dining car", "conductor", "intercity", "on the rails", "rail pass", "interrail", "eurail"],
    emoji: ["🚂", "🚆", "🚄", "🚅", "🚈", "🚇", "🚊", "🚋"],
    tags: ["train", "traintravel", "trainride", "railtravel", "trainjourney", "interrail", "byrail", "scenicrail"],
  },
  drive: {
    strong: ["roadtrip", "road trip", "driving", "drove", "drive", "rental car", "rentalcar", "campervan", "motorhome", "rv"],
    weak: ["highway", "interstate", "freeway", "motorway", "autobahn", "on the road", "miles driven", "km driven", "pit stop", "gas station", "petrol station", "scenic route", "behind the wheel"],
    emoji: ["🚗", "🚙", "🛻", "🚐", "🛣️", "🛣", "🏎️"],
    tags: ["roadtrip", "vanlife", "roadtripping", "drivingholiday", "carcamping", "overlanding"],
  },
};

const WEIGHTS = { tag: 4, strong: 3, emoji: 3, weak: 1 } as const;

/** Escapes regex metacharacters so keywords are matched literally. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary match. Handles multi-word phrases ("road trip") by allowing
 * flexible whitespace between the words.
 */
function matchesWord(haystack: string, keyword: string): boolean {
  const pattern = escapeRegex(keyword).replace(/\\?\s+/g, "\\s+");
  return new RegExp(`\\b${pattern}\\b`, "i").test(haystack);
}

/** Pulls hashtags out of free text, lowercased and stripped of the leading #. */
export function extractHashtags(text: string): string[] {
  const found = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return found.map((h) => h.slice(1).toLowerCase());
}

/**
 * Strips hashtags and @mentions from a caption so that hashtag text is not
 * double-counted as prose when scoring the `strong`/`weak` word lists.
 */
function stripTagsAndMentions(text: string): string {
  return text.replace(/[#@][\p{L}\p{N}_]+/gu, " ");
}

function scoreMode(
  mode: Exclude<TransitMode, "stay">,
  prose: string,
  raw: string,
  hashtags: string[]
): TransitSignal {
  const rules = RULES[mode];
  const matched: string[] = [];
  let score = 0;

  for (const tag of rules.tags) {
    if (hashtags.includes(tag)) {
      score += WEIGHTS.tag;
      matched.push(`#${tag}`);
    }
  }
  for (const emoji of rules.emoji) {
    if (raw.includes(emoji)) {
      score += WEIGHTS.emoji;
      matched.push(emoji);
    }
  }
  for (const word of rules.strong) {
    if (matchesWord(prose, word)) {
      score += WEIGHTS.strong;
      matched.push(word);
    }
  }
  for (const word of rules.weak) {
    if (matchesWord(prose, word)) {
      score += WEIGHTS.weak;
      matched.push(word);
    }
  }

  return { mode, score, matched };
}

export interface DetectOptions {
  /** Mode to use when nothing matches. Defaults to "stay". */
  fallback?: TransitMode;
  /** Extra hashtags from the API that aren't inline in the caption text. */
  hashtags?: string[];
}

/**
 * Returns the most likely transit mode for a caption.
 *
 * Falls back to `"stay"` (a location the traveller was at, with no travel
 * signal) rather than guessing a mode. Pass `{ fallback: "drive" }` when the
 * caller knows the node sits between two other geocoded stops and therefore
 * must have been reached somehow.
 */
export function detectTransitMode(
  caption: string | null | undefined,
  options: DetectOptions = {}
): TransitResult {
  const fallback = options.fallback ?? "stay";
  const raw = caption ?? "";

  if (!raw.trim()) {
    return { mode: fallback, score: 0, matched: [], isFallback: true, candidates: [] };
  }

  const hashtags = [
    ...extractHashtags(raw),
    ...(options.hashtags ?? []).map((h) => h.replace(/^#/, "").toLowerCase()),
  ];
  const prose = stripTagsAndMentions(raw);

  const candidates = (Object.keys(RULES) as Exclude<TransitMode, "stay">[])
    .map((mode) => scoreMode(mode, prose, raw, hashtags))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return { mode: fallback, score: 0, matched: [], isFallback: true, candidates: [] };
  }

  const winner = candidates[0];
  return {
    mode: winner.mode,
    score: winner.score,
    matched: winner.matched,
    isFallback: false,
    candidates,
  };
}
