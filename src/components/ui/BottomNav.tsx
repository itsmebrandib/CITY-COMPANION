import { Compass, Map, Heart, ClipboardList, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../../lib/palette";

const ITEMS = [
  { icon: Compass, label: "Explore", path: "/" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: Heart, label: "Saved", path: "/saved" },
  { icon: ClipboardList, label: "Itinerary", path: "/itinerary" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="flex items-center justify-around px-2 pt-2.5 pb-3"
      style={{
        background: "rgba(255,255,255,.92)",
        borderTop: `1px solid ${C.line}`,
        backdropFilter: "blur(8px)",
      }}
    >
      {ITEMS.map(({ icon: Icon, label, path }) => {
        const active = pathname === path;
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="tap flex flex-col items-center gap-1"
            style={{ width: 60 }}
          >
            <Icon size={21} color={active ? C.violet : C.faint} />
            <span
              style={{
                color: active ? C.violet : C.faint,
                fontSize: 10.5,
                fontWeight: active ? 700 : 500,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
