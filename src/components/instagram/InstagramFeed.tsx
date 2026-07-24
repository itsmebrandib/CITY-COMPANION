import { useState } from "react";
import type { IGPost } from "../../types/instagram";
import type { TransportMode } from "../../lib/travelKeywords";
import { TRANSPORT_LABELS } from "../../lib/travelKeywords";
import { InstagramPost } from "./InstagramPost";
import { C } from "../../lib/palette";

const FILTERS: { key: TransportMode | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "📸" },
  { key: "flight", label: "Flights", emoji: "✈️" },
  { key: "boat", label: "Boat", emoji: "⛵" },
  { key: "train", label: "Train", emoji: "🚂" },
  { key: "drive", label: "Road", emoji: "🚗" },
];

interface Props {
  posts: IGPost[];
  loading: boolean;
}

export function InstagramFeed({ posts, loading }: Props) {
  const [filter, setFilter] = useState<TransportMode | "all">("all");

  const visible = filter === "all" ? posts : posts.filter((p) => p.transport === filter);

  return (
    <div>
      <div className="px-6 flex items-center justify-between mb-3">
        <div>
          <p style={{ color: C.ink, fontWeight: 700, fontSize: 15 }}>📸 Your travel moments</p>
          <p style={{ color: C.faint, fontSize: 12 }}>Synced from Instagram</p>
        </div>
      </div>

      {/* transport filter chips */}
      <div className="px-6 mb-3 flex gap-2 overflow-x-auto no-bar">
        {FILTERS.map(({ key, label, emoji }) => {
          const on = filter === key;
          return (
            <button
              key={key ?? "all"}
              onClick={() => setFilter(key)}
              className="tap flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: on ? C.violet : C.card,
                border: `1px solid ${on ? C.violet : C.line}`,
                color: on ? "#fff" : C.ink2,
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* horizontal scroll strip */}
      <div className="px-6 flex gap-3 overflow-x-auto no-bar pb-1">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl"
            style={{ width: 140, height: 176, background: C.violetSoft2, opacity: 0.6 + i * 0.1 }}
          />
        ))}

        {!loading && visible.length === 0 && (
          <div className="flex items-center justify-center rounded-2xl"
            style={{ width: "100%", height: 120, color: C.faint, fontSize: 13, fontWeight: 600 }}>
            No {filter === "all" ? "" : TRANSPORT_LABELS[filter].label} posts yet
          </div>
        )}

        {!loading && visible.map((post) => (
          <InstagramPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
