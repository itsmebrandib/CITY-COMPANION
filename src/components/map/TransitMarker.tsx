import { AdvancedMarker, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { MODE_GLYPHS, MODE_COLORS, MODE_LABELS } from "./markerIcons";
import type { PlacedNode } from "../../types/travel";

interface Props {
  node: PlacedNode;
  /** Sequence number shown on the pin, 1-based. */
  index: number;
  selected: boolean;
  onSelect: (
    node: PlacedNode,
    marker: google.maps.marker.AdvancedMarkerElement | null
  ) => void;
}

/**
 * A teardrop pin carrying the transit-mode glyph and its stop number.
 *
 * AdvancedMarker renders arbitrary DOM, so the pin is plain HTML/SVG — no
 * rasterised icon URLs, and it scales without blurring.
 *
 * The marker element is captured via useAdvancedMarkerRef and handed to the
 * parent on click: InfoWindow needs that element as its `anchor` to position
 * itself, and the click event itself does not carry a reference to it.
 */
export function TransitMarker({ node, index, selected, onSelect }: Props) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const Glyph = MODE_GLYPHS[node.transitMode];
  const color = MODE_COLORS[node.transitMode];

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: node.lat, lng: node.lng }}
      title={`${index}. ${node.locationName ?? MODE_LABELS[node.transitMode]}`}
      zIndex={selected ? 1000 : index}
      onClick={() => onSelect(node, marker)}
    >
      <div
        className="cc-pin"
        data-selected={selected ? "true" : "false"}
        style={{ ["--pin-color" as string]: color }}
      >
        <div className="cc-pin__body">
          <Glyph size={15} color="#fff" accent={color} />
          <span className="cc-pin__index">{index}</span>
        </div>
        <div className="cc-pin__tail" />
      </div>
    </AdvancedMarker>
  );
}
