import { InfoWindow } from "@vis.gl/react-google-maps";
import { ExternalLink } from "lucide-react";
import { MODE_GLYPHS, MODE_COLORS, MODE_LABELS } from "./markerIcons";
import { C } from "../../lib/palette";
import type { PlacedNode } from "../../types/travel";

interface Props {
  node: PlacedNode;
  anchor: google.maps.marker.AdvancedMarkerElement | null;
  onClose: () => void;
}

const CAPTION_LIMIT = 120;

function snippet(caption: string | null): string | null {
  if (!caption) return null;
  // Drop trailing hashtag blocks — they're noise in a small popup.
  const cleaned = caption.replace(/(\s*#[\p{L}\p{N}_]+)+\s*$/u, "").trim();
  const text = cleaned || caption.trim();
  if (text.length <= CAPTION_LIMIT) return text;
  return `${text.slice(0, CAPTION_LIMIT).trimEnd()}…`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function NodeInfoWindow({ node, anchor, onClose }: Props) {
  const Glyph = MODE_GLYPHS[node.transitMode];
  const color = MODE_COLORS[node.transitMode];
  const caption = snippet(node.caption);

  return (
    <InfoWindow
      anchor={anchor}
      onCloseClick={onClose}
      headerDisabled
      pixelOffset={[0, -6]}
      maxWidth={280}
    >
      <div className="cc-iw">
        {node.mediaUrl && (
          <img
            className="cc-iw__media"
            src={node.mediaUrl}
            alt={node.locationName ?? "Instagram post"}
            loading="lazy"
          />
        )}

        <div className="cc-iw__body">
          <div className="cc-iw__badge" style={{ background: color }}>
            <Glyph size={12} color="#fff" accent={color} />
            <span>{MODE_LABELS[node.transitMode]}</span>
          </div>

          <p className="cc-iw__place">{node.locationName ?? "Unknown location"}</p>
          <p className="cc-iw__date">{formatDate(node.timestamp)}</p>

          {caption && <p className="cc-iw__caption">{caption}</p>}

          {node.instagramPostUrl && (
            <a
              className="cc-iw__link"
              href={node.instagramPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.violetDeep }}
            >
              View on Instagram <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </InfoWindow>
  );
}
