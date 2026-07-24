import { Polyline } from "@vis.gl/react-google-maps";
import { MODE_COLORS } from "./markerIcons";
import type { PlacedNode } from "../../types/travel";

interface Props {
  /** Chronologically ordered, coordinate-bearing nodes. */
  nodes: PlacedNode[];
  /** Dims segments not touching the selected node. */
  selectedId: string | null;
}

/**
 * Draws one polyline per consecutive pair of stops.
 *
 * Each segment is styled by the transit mode of the node being travelled *to*
 * — that's the mode that describes the journey. Flights and boat crossings are
 * drawn as dashed great-circle arcs; ground travel stays solid, since a
 * straight line between two rail stops is a reasonable abstraction while a
 * straight line across an ocean is not.
 */
export function RouteLines({ nodes, selectedId }: Props) {
  if (nodes.length < 2) return null;

  return (
    <>
      {nodes.slice(0, -1).map((from, i) => {
        const to = nodes[i + 1];
        const mode = to.transitMode;
        const color = MODE_COLORS[mode];

        // "stay" means the traveller didn't describe a journey; render it as a
        // faint hop so the sequence stays readable without implying a route.
        const isStay = mode === "stay";
        const isLongHaul = mode === "flight" || mode === "boat";

        const touchesSelection =
          selectedId === null || from.id === selectedId || to.id === selectedId;

        const path = [
          { lat: from.lat, lng: from.lng },
          { lat: to.lat, lng: to.lng },
        ];

        const dashed = isLongHaul || isStay;

        return (
          <Polyline
            key={`${from.id}-${to.id}`}
            path={path}
            geodesic={isLongHaul}
            strokeColor={color}
            strokeOpacity={dashed ? 0 : touchesSelection ? 0.85 : 0.25}
            strokeWeight={isStay ? 2 : 3.5}
            zIndex={touchesSelection ? 10 : 1}
            icons={
              dashed
                ? [
                    {
                      icon: {
                        path: "M 0,-1 0,1",
                        strokeOpacity: touchesSelection ? 0.9 : 0.25,
                        strokeColor: color,
                        strokeWeight: isStay ? 2 : 3,
                        scale: 3,
                      },
                      offset: "0",
                      repeat: isStay ? "10px" : "16px",
                    },
                  ]
                : undefined
            }
          />
        );
      })}
    </>
  );
}
