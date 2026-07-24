import type { Pin, Board } from "../../types/pinterest";
import { PinCard } from "./PinCard";
import { C } from "../../lib/palette";

interface Props {
  pins: Pin[];
  boards: Board[];
  activeBoard: string | null;
  onSelectBoard: (id: string) => void;
  loading: boolean;
}

export function PinterestGrid({ pins, boards, activeBoard, onSelectBoard, loading }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p style={{ color: C.ink, fontWeight: 700, fontSize: 15 }}>📌 Pinterest inspiration</p>
          <p style={{ color: C.faint, fontSize: 12 }}>{pins.length} pins saved</p>
        </div>
      </div>

      {/* board selector */}
      {boards.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-bar">
          {boards.map((b) => {
            const on = activeBoard === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBoard(b.id)}
                className="tap flex-shrink-0 rounded-full px-3 py-1.5"
                style={{
                  background: on ? C.violet : C.card,
                  border: `1px solid ${on ? C.violet : C.line}`,
                  color: on ? "#fff" : C.ink2,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      )}

      {/* two-column masonry via CSS columns */}
      {loading ? (
        <div style={{ columns: 2, columnGap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl mb-3"
              style={{
                height: i % 3 === 0 ? 200 : i % 3 === 1 ? 140 : 170,
                background: C.violetSoft2,
                opacity: 0.5 + i * 0.08,
                breakInside: "avoid",
              }}
            />
          ))}
        </div>
      ) : pins.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl"
          style={{ height: 120, color: C.faint, fontSize: 13, fontWeight: 600 }}>
          No pins in this board yet
        </div>
      ) : (
        <div style={{ columns: 2, columnGap: 12 }}>
          {pins.map((pin) => <PinCard key={pin.id} pin={pin} />)}
        </div>
      )}
    </div>
  );
}
