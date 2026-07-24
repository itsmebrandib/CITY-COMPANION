import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { C } from "../../lib/palette";

export interface CityPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  postCount: number;
  emoji?: string;
}

interface Props {
  city: CityPin;
  selected: boolean;
  onClick: (city: CityPin) => void;
}

export function CityMarker({ city, selected, onClick }: Props) {
  return (
    <AdvancedMarker
      position={{ lat: city.lat, lng: city.lng }}
      onClick={() => onClick(city)}
      title={city.name}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          transform: selected ? "scale(1.15)" : "scale(1)",
          transition: "transform .2s ease",
        }}
      >
        <div
          style={{
            background: selected ? C.violet : C.card,
            border: `2.5px solid ${C.violet}`,
            borderRadius: 14,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: selected
              ? "0 8px 24px -8px rgba(108,92,231,.8)"
              : "0 4px 12px -4px rgba(40,28,80,.3)",
            minWidth: 70,
            justifyContent: "center",
          }}
        >
          {city.emoji && <span style={{ fontSize: 14 }}>{city.emoji}</span>}
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: selected ? "#fff" : C.ink,
              whiteSpace: "nowrap",
            }}
          >
            {city.name}
          </span>
          {city.postCount > 0 && (
            <span
              style={{
                background: selected ? "rgba(255,255,255,.3)" : C.violetSoft,
                color: selected ? "#fff" : C.violetDeep,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 800,
                padding: "1px 5px",
              }}
            >
              {city.postCount}
            </span>
          )}
        </div>
        {/* pointer triangle */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `7px solid ${selected ? C.violet : C.card}`,
            marginTop: -1,
          }}
        />
      </div>
    </AdvancedMarker>
  );
}
