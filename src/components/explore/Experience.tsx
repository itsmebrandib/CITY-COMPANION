import { useState } from "react";
import {
  ArrowLeft, Share2, Footprints, Clock, Navigation,
  RefreshCw, Heart, Star, Plus, Check, MapPin,
} from "lucide-react";
import { C } from "../../lib/palette";
import { InstagramFeed } from "../instagram/InstagramFeed";
import { PinterestGrid } from "../pinterest/PinterestGrid";
import { useInstagram } from "../../hooks/useInstagram";
import { usePinterest } from "../../hooks/usePinterest";

const STOPS = [
  { time: "9:00 AM", emoji: "☕", name: "Houndstooth Coffee", start: true, blurb: "Local roaster favorite, ideal for a slow first pour on Congress.", tag: "LOCAL GEM", tagKind: "violet" },
  { time: "10:30 AM", walk: 7, emoji: "🎨", name: "The Contemporary Austin", blurb: "Bold rotating shows and a sculpture terrace over the street.", tag: "MUST SEE", tagKind: "violet" },
  { time: "12:00 PM", walk: 12, emoji: "🏛️", name: "Texas State Capitol", blurb: "Pink granite dome and grounds you can wander for free.", tag: "HISTORIC", tagKind: "amber" },
  { time: "1:15 PM", walk: 8, emoji: "🍴", name: "Odd Duck", blurb: "Farm-to-table plates from a beloved neighborhood kitchen.", tag: "FOODIE PICK", tagKind: "green" },
  { time: "7:00 PM", walk: 5, emoji: "🎵", name: "The Continental Club", blurb: "An Austin institution. Live set tonight, doors at 7 PM.", tag: "LIVE MUSIC", tagKind: "violet" },
];

function tagStyle(kind: string) {
  if (kind === "green") return { color: C.green, background: C.greenSoft };
  if (kind === "amber") return { color: C.amber, background: C.amberSoft };
  return { color: C.violet, background: C.violetSoft };
}

function routeTitle(moods: string[]) {
  if (moods.includes("Music")) return "Culture crawl with a live music finish";
  if (moods.includes("History")) return "Historic + hidden gems walk";
  if (moods.includes("Food")) return "Coffee, art and a food crawl";
  if (moods.includes("Art")) return "Galleries and hidden gems walk";
  if (moods.includes("Surprise Me")) return "A day you didn't plan";
  return "Historic + hidden gems walk";
}

function costLine(budget: string) {
  if (budget === "Free") return "Mostly free today";
  if (budget === "$") return "Light spend, around $ per person";
  if (budget === "$$$") return "Treat yourself, $$$ range";
  return "Mid-range, $$ per person";
}

interface Props {
  moods: string[]; company: string; transport: string;
  distance: string; time: string; budget: string; start: string;
  onBack: () => void; onChangeMood: () => void;
  saved: boolean; setSaved: (v: boolean) => void;
}

function TimelineStop({ stop, index, last }: { stop: typeof STOPS[0]; index: number; last: boolean }) {
  return (
    <div className="rise" style={{ animationDelay: `${index * 0.09}s` }}>
      {stop.walk != null && (
        <div className="flex items-center gap-3" style={{ paddingLeft: 15 }}>
          <div style={{ width: 2, height: 26, background: C.line, marginLeft: 12 }} />
          <span className="flex items-center gap-1" style={{ color: C.faint, fontSize: 12, fontWeight: 600 }}>
            <Footprints size={13} /> {stop.walk} min walk
          </span>
        </div>
      )}
      <div className="flex gap-3" style={{ paddingLeft: 15 }}>
        <div className="flex flex-col items-center" style={{ width: 28 }}>
          <div className="flex items-center justify-center rounded-full text-white"
            style={{ width: 28, height: 28, background: C.violet, fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
            {index + 1}
          </div>
          {!last && <div style={{ width: 2, flex: 1, background: C.line, marginTop: 2 }} />}
        </div>
        <div className="flex-1 rounded-2xl p-3.5 mb-1"
          style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 14px 30px -24px rgba(40,28,80,.5)" }}>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: C.violetSoft2, fontSize: 22, flexShrink: 0 }}>
              {stop.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {stop.start && <span style={{ color: C.violet, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em" }}>START</span>}
                <span style={{ color: C.faint, fontSize: 11.5, fontWeight: 700 }}>{stop.time}</span>
              </div>
              <p style={{ color: C.ink, fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>{stop.name}</p>
              <p className="mt-1" style={{ color: C.muted, fontSize: 12.8, lineHeight: 1.4 }}>{stop.blurb}</p>
              <span className="inline-block mt-2 rounded-full px-2.5 py-1"
                style={{ ...tagStyle(stop.tagKind), fontSize: 10.5, fontWeight: 800, letterSpacing: ".04em" }}>
                {stop.tag}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteMap() {
  const nodes = [{ x: 34, y: 96 }, { x: 96, y: 58 }, { x: 168, y: 82 }, { x: 232, y: 46 }, { x: 300, y: 92 }];
  const path = "M34 96 C 70 70, 78 60, 96 58 S 150 96, 168 82 S 214 44, 232 46 S 286 74, 300 92";
  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ height: 150, background: "linear-gradient(160deg,#F0EEFA,#F7F5FC)", border: `1px solid ${C.line}` }}>
      <svg viewBox="0 0 340 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {[[12,12,60,34],[210,10,70,30],[255,96,74,44],[8,104,66,40],[130,6,56,24]].map(([x,y,w,h],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#FFFFFF" opacity="0.65" />
        ))}
        <rect x="120" y="102" width="70" height="40" rx="10" fill={C.greenSoft} />
        <rect x="190" y="18" width="30" height="40" rx="8" fill="#E5EEFB" />
        <path d={path} fill="none" stroke={C.violet} strokeOpacity="0.22" strokeWidth="6" strokeLinecap="round" />
        <path className="routeflow" d={path} fill="none" stroke={C.violet} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 10" />
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="12" fill="#FFFFFF" stroke={C.violet} strokeWidth="2" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.violetDeep}>{i + 1}</text>
          </g>
        ))}
      </svg>
      <div className="absolute flex items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{ right: 10, bottom: 10, background: "rgba(255,255,255,.85)", color: C.muted, fontSize: 11, fontWeight: 700 }}>
        <MapPin size={12} color={C.violet} /> Downtown loop
      </div>
    </div>
  );
}

export function Experience({ moods, company, transport, distance, budget, start, onBack, onChangeMood, saved, setSaved }: Props) {
  const ig = useInstagram();
  const pt = usePinterest();

  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const toggleService = (k: string) => {
    if (k === "Instagram" && !ig.connected) { ig.connect(); return; }
    if (k === "Pinterest" && !pt.connected) { pt.connect(); return; }
    setConnectedServices((c) => c.includes(k) ? c.filter((x) => x !== k) : [...c, k]);
  };

  const INTEGRATIONS = [
    { key: "Maps", connected: connectedServices.includes("Maps") },
    { key: "Instagram", connected: ig.connected },
    { key: "Pinterest", connected: pt.connected },
    { key: "Resy", connected: connectedServices.includes("Resy") },
  ];

  return (
    <div className="fade-slide pb-4">
      <div className="px-6 pt-6 flex items-center justify-between">
        <button onClick={onBack} className="tap flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: C.card, border: `1px solid ${C.line}`, color: C.ink2 }} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <button className="tap flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: C.card, border: `1px solid ${C.line}`, color: C.ink2 }} aria-label="Share">
          <Share2 size={18} />
        </button>
      </div>

      <div className="px-6 mt-3">
        <p style={{ color: C.violet, fontSize: 11, fontWeight: 700, letterSpacing: ".12em" }}>YOUR LOCAL ADVENTURE</p>
        <h2 className="mt-1" style={{ color: C.ink, fontWeight: 800, fontSize: 26, lineHeight: 1.12, letterSpacing: "-.02em" }}>
          {routeTitle(moods)}
        </h2>
        <div className="mt-3 flex items-center gap-4" style={{ color: C.muted, fontSize: 13.5, fontWeight: 600 }}>
          <span className="flex items-center gap-1.5"><Footprints size={15} color={C.violet} /> 2.8 miles</span>
          <span style={{ color: C.line }}>|</span>
          <span className="flex items-center gap-1.5"><Clock size={15} color={C.violet} /> 3 hours</span>
          <span style={{ color: C.line }}>|</span>
          <span>🚶 Easy</span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {[`Starts at ${start}`, company, transport, `${distance} radius`, costLine(budget)].map((chip) => (
            <span key={chip} className="rounded-full px-2.5 py-1"
              style={{ background: C.violetSoft2, color: C.violetDeep, fontSize: 11.5, fontWeight: 600 }}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 mt-4"><RouteMap /></div>

      <div className="px-6 mt-5">
        {STOPS.map((s, i) => <TimelineStop key={i} stop={s} index={i} last={i === STOPS.length - 1} />)}
      </div>

      <div className="px-6 mt-2">
        <div className="rounded-2xl p-3.5 flex items-start gap-3"
          style={{ background: "linear-gradient(135deg,#FFF7E9,#FDF0F6)", border: `1px solid ${C.amberSoft}` }}>
          <div className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: "#FFFFFF", flexShrink: 0 }}>
            <Star size={20} color={C.amber} fill={C.amber} />
          </div>
          <div>
            <p style={{ color: C.amber, fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em" }}>HIDDEN GEM</p>
            <p style={{ color: C.ink, fontWeight: 700, fontSize: 14.5 }}>Rooftop garden above the district</p>
            <p style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.4 }}>Quiet, open till dusk, and almost no tourists find it.</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5 flex flex-col gap-2.5">
        <button className="tap w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.violetDeep})`, fontWeight: 700, fontSize: 16, boxShadow: "0 18px 34px -14px rgba(108,92,231,.9)" }}>
          <Navigation size={18} /> Start route
        </button>
        <div className="flex gap-2.5">
          <button onClick={() => setSaved(!saved)} className="tap flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5"
            style={{ background: saved ? C.violetSoft : C.card, border: `1px solid ${saved ? C.violet : C.line}`, color: saved ? C.violetDeep : C.ink2, fontWeight: 700, fontSize: 15 }}>
            <Heart size={18} fill={saved ? C.violet : "none"} color={saved ? C.violet : C.ink2} />
            {saved ? "Saved" : "Save"}
          </button>
          <button onClick={onChangeMood} className="tap flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 700, fontSize: 15 }}>
            <RefreshCw size={17} /> Change mood
          </button>
        </div>
      </div>

      {/* ── Instagram travel feed ── */}
      {ig.connected && (
        <div className="mt-6">
          <InstagramFeed posts={ig.posts} loading={ig.loading} />
        </div>
      )}

      {/* ── Pinterest inspiration grid ── */}
      {pt.connected && (
        <div className="mt-4 px-6">
          <PinterestGrid
            pins={pt.pins}
            boards={pt.boards}
            activeBoard={pt.activeBoard}
            onSelectBoard={pt.setActiveBoard}
            loading={pt.loading}
          />
        </div>
      )}

      {/* ── optional integrations ── */}
      <div className="px-6 mt-6 mb-2">
        <p style={{ color: C.faint, fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em" }}>
          SHARPEN TOMORROW'S PICKS · OPTIONAL
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {INTEGRATIONS.map(({ key, connected }) => (
            <button key={key} onClick={() => toggleService(key)} className="tap flex items-center gap-1.5 rounded-full px-3 py-2"
              style={{ background: connected ? C.violetSoft : C.card, border: `1px solid ${connected ? C.violet : C.line}`, color: connected ? C.violetDeep : C.ink2, fontSize: 12.5, fontWeight: 600 }}>
              {connected ? <Check size={14} color={C.violet} /> : <Plus size={14} color={C.faint} />}
              {connected ? `${key} connected` : `Connect ${key}`}
            </button>
          ))}
        </div>
        <p className="mt-2" style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.4 }}>
          Everything works without these. Connect only what you want, whenever you want.
        </p>
      </div>
    </div>
  );
}
