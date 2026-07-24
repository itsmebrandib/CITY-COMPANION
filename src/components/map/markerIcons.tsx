/**
 * Inline SVG glyphs for each transit mode.
 *
 * Drawn as React nodes inside AdvancedMarker rather than passed as icon URLs,
 * so they inherit colour from props and stay crisp at any zoom.
 *
 * These render at ~15px on the pin, which drives the design: solid white
 * silhouettes, no interior detail finer than ~2px. Where a shape needs an
 * interior cutout (a train window, the gap between wheels) it is filled with
 * `accent` — the pin's own background colour — so the cutout reads as negative
 * space on every mode rather than a stray dark blob.
 */

import type { TransitMode } from "../../lib/travelKeywords";

interface GlyphProps {
  size?: number;
  /** Silhouette colour. */
  color?: string;
  /** Colour for interior cutouts; should match the surface behind the glyph. */
  accent?: string;
}

export function FlightGlyph({ size = 16, color = "#fff" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.5 14.6v-1.9l-8.2-4.6V3.6a1.4 1.4 0 0 0-2.8 0v4.5L2.3 12.7v1.9l8.2-2.4v4.2l-2.4 1.5v1.5l3.8-1 3.8 1v-1.5l-2.4-1.5v-4.2l8.2 2.4Z"
        fill={color}
      />
    </svg>
  );
}

export function BoatGlyph({ size = 16, color = "#fff", accent = "#6C5CE7" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* mast + sail as one solid triangle */}
      <path d="M12.8 2.2 19 12.2h-6.2V2.2Z" fill={color} />
      <path d="M11.2 5.4v6.8H6.4l4.8-6.8Z" fill={color} />
      {/* hull */}
      <path
        d="M3 14.2h18l-2 4.3a2.8 2.8 0 0 1-2.5 1.6H7.5A2.8 2.8 0 0 1 5 18.5l-2-4.3Z"
        fill={color}
      />
      {/* waterline notch keeps hull and sail visually separate */}
      <path d="M9.6 14.2h4.8v1.1H9.6z" fill={accent} />
    </svg>
  );
}

export function TrainGlyph({ size = 16, color = "#fff", accent = "#6C5CE7" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* body */}
      <rect x="5" y="2.6" width="14" height="14.4" rx="4.2" fill={color} />
      {/* window band, cut in the pin's own colour */}
      <rect x="7.6" y="5.6" width="8.8" height="4.4" rx="1.4" fill={accent} />
      {/* wheels protrude below the body so they read as wheels, not buttons */}
      <circle cx="8.6" cy="18.4" r="2.1" fill={color} />
      <circle cx="15.4" cy="18.4" r="2.1" fill={color} />
      <rect x="10.7" y="17.4" width="2.6" height="2" fill={accent} />
    </svg>
  );
}

export function DriveGlyph({ size = 16, color = "#fff", accent = "#6C5CE7" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* cabin + bonnet as one silhouette */}
      <path
        d="M2.6 16.4v-3.1l2.2-4.6c.35-.75 1.05-1.2 1.9-1.2h10.6c.85 0 1.55.45 1.9 1.2l2.2 4.6v3.1H2.6Z"
        fill={color}
      />
      {/* windscreen cutout */}
      <path d="M7 9.1h10l1.5 3.2H5.5L7 9.1Z" fill={accent} />
      {/* wheels below the body line */}
      <circle cx="7.2" cy="17.6" r="2.2" fill={color} />
      <circle cx="16.8" cy="17.6" r="2.2" fill={color} />
      <rect x="9.4" y="16.4" width="5.2" height="2.1" fill={accent} />
    </svg>
  );
}

export function StayGlyph({ size = 16, color = "#fff", accent = "#6C5CE7" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2a7.2 7.2 0 0 0-7.2 7.2C4.8 14.4 12 22 12 22s7.2-7.6 7.2-12.8A7.2 7.2 0 0 0 12 2Z"
        fill={color}
      />
      <circle cx="12" cy="9.1" r="2.7" fill={accent} />
    </svg>
  );
}

export const MODE_GLYPHS: Record<TransitMode, React.FC<GlyphProps>> = {
  flight: FlightGlyph,
  boat: BoatGlyph,
  train: TrainGlyph,
  drive: DriveGlyph,
  stay: StayGlyph,
};

/** Per-mode accent colours, used for both markers and their route segments. */
export const MODE_COLORS: Record<TransitMode, string> = {
  flight: "#6C5CE7",
  boat: "#0E9BA6",
  train: "#C2571E",
  drive: "#2E9E5B",
  stay: "#8A7FA8",
};

export const MODE_LABELS: Record<TransitMode, string> = {
  flight: "Flight",
  boat: "Boat",
  train: "Train",
  drive: "Road trip",
  stay: "Stay",
};
