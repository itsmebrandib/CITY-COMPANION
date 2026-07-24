import { useState, useMemo } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { CityMarker } from "./CityMarker";
import type { CityPin } from "./CityMarker";
import type { IGPost } from "../../types/instagram";
import { InstagramPost } from "../instagram/InstagramPost";
import { C } from "../../lib/palette";
import { X } from "lucide-react";

// Demo pins — replaced by real geocoded data once Instagram is connected
const DEMO_CITIES: CityPin[] = [
  { id: "austin", name: "Austin", lat: 30.2672, lng: -97.7431, postCount: 0, emoji: "🎸" },
  { id: "nyc", name: "New York", lat: 40.7128, lng: -74.006, postCount: 0, emoji: "🗽" },
  { id: "paris", name: "Paris", lat: 48.8566, lng: 2.3522, postCount: 0, emoji: "🗼" },
  { id: "tokyo", name: "Tokyo", lat: 35.6762, lng: 139.6503, postCount: 0, emoji: "⛩️" },
  { id: "london", name: "London", lat: 51.5074, lng: -0.1278, postCount: 0, emoji: "🎡" },
];

const MAP_ID = "city-companion-map";

const MAP_STYLE_OPTIONS = {
  disableDefaultUI: true,
  gestureHandling: "greedy" as const,
  mapTypeId: "roadmap",
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "simplified" }] },
    { elementType: "geometry", stylers: [{ color: "#f5f3ff" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#eae7f1" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#dfe8f5" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f4f3f9" }] },
  ],
};

interface Props {
  igPosts: IGPost[];
}

function buildCityPins(igPosts: IGPost[]): CityPin[] {
  const cityMap: Record<string, CityPin> = {};

  // Seed demo pins
  DEMO_CITIES.forEach((c) => { cityMap[c.id] = { ...c }; });

  // Enrich with real post counts when posts carry location
  igPosts.forEach((p) => {
    if (!p.location?.name) return;
    const key = p.location.name.toLowerCase().replace(/\s+/g, "-");
    if (cityMap[key]) {
      cityMap[key].postCount += 1;
    } else if (p.location.lat && p.location.lng) {
      cityMap[key] = {
        id: key,
        name: p.location.name,
        lat: p.location.lat,
        lng: p.location.lng,
        postCount: 1,
      };
    }
  });

  return Object.values(cityMap);
}

export function TravelMap({ igPosts }: Props) {
  const [selectedCity, setSelectedCity] = useState<CityPin | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? "";

  const cities = useMemo(() => buildCityPins(igPosts), [igPosts]);

  const cityPosts = useMemo(() => {
    if (!selectedCity) return [];
    return igPosts.filter(
      (p) => p.location?.name?.toLowerCase().includes(selectedCity.name.toLowerCase())
    );
  }, [selectedCity, igPosts]);

  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl"
        style={{ height: 320, background: C.violetSoft2, border: `1px solid ${C.violetSoft}` }}
      >
        <span style={{ fontSize: 32 }}>🗺️</span>
        <p className="mt-3" style={{ color: C.violetDeep, fontWeight: 700, fontSize: 15 }}>
          Google Maps key needed
        </p>
        <p className="mt-1 px-8 text-center" style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>
          Add <code style={{ background: C.violetSoft, padding: "1px 5px", borderRadius: 4 }}>VITE_GOOGLE_MAPS_KEY</code> to <code>.env.local</code>
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", height: 340 }}>
        <Map
          defaultCenter={{ lat: 30, lng: 0 }}
          defaultZoom={2}
          mapId={MAP_ID}
          {...MAP_STYLE_OPTIONS}
        >
          {cities.map((city) => (
            <CityMarker
              key={city.id}
              city={city}
              selected={selectedCity?.id === city.id}
              onClick={setSelectedCity}
            />
          ))}
        </Map>

        {/* city bottom sheet */}
        {selectedCity && (
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl p-4"
            style={{ background: C.card, boxShadow: "0 -12px 40px -16px rgba(40,28,80,.25)", maxHeight: "55%" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ color: C.ink, fontWeight: 800, fontSize: 17 }}>
                  {selectedCity.emoji} {selectedCity.name}
                </p>
                <p style={{ color: C.faint, fontSize: 12 }}>
                  {cityPosts.length > 0 ? `${cityPosts.length} posts here` : "No posts tagged yet"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCity(null)}
                className="tap flex items-center justify-center rounded-full"
                style={{ width: 32, height: 32, background: C.frame, color: C.ink2 }}
              >
                <X size={16} />
              </button>
            </div>
            {cityPosts.length > 0 && (
              <div className="flex gap-2.5 overflow-x-auto no-bar pb-1">
                {cityPosts.map((p) => <InstagramPost key={p.id} post={p} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </APIProvider>
  );
}
