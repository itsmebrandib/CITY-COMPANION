import {
  ArrowLeft, Heart, ClipboardList, Footprints, Clock, Sparkles,
  User, Users, Bike, Car, Wallet, Check,
} from "lucide-react";
import { C } from "../../lib/palette";

const MOODS = [
  { key: "Coffee", emoji: "☕" },
  { key: "Art", emoji: "🎨" },
  { key: "Food", emoji: "🍜" },
  { key: "Music", emoji: "🎵" },
  { key: "History", emoji: "🏛️" },
  { key: "Outdoors", emoji: "🌿" },
  { key: "Shopping", emoji: "🛍️" },
  { key: "Surprise Me", emoji: "✨" },
];
const COMPANY = [
  { key: "Solo", icon: User },
  { key: "Partner", icon: Heart },
  { key: "Friends", icon: Users },
  { key: "Kids", icon: Users },
  { key: "Business", icon: ClipboardList },
];
const TRANSPORT = [
  { key: "Walking", icon: Footprints },
  { key: "Bike", icon: Bike },
  { key: "Car", icon: Car },
];
const DISTANCES = ["10 min", "20 min", "45 min"];
const TIMES = ["1 hour", "Afternoon", "Evening", "All day"];
const BUDGETS = ["Free", "$", "$$", "$$$"];
const MEMORY = [
  "Loves independent coffee shops",
  "Prefers local spots over chains",
  "Happy walking up to 3 miles",
  "Always says yes to live jazz",
];

function serendipityLabel(v: number) {
  if (v < 35) return "Mostly familiar favorites";
  if (v > 70) return "Lean into surprises";
  return "A balanced mix";
}

interface Props {
  moods: string[];
  toggleMood: (k: string) => void;
  company: string; setCompany: (v: string) => void;
  transport: string; setTransport: (v: string) => void;
  distance: string; setDistance: (v: string) => void;
  time: string; setTime: (v: string) => void;
  budget: string; setBudget: (v: string) => void;
  serendipity: number; setSerendipity: (v: number) => void;
  onBack: () => void;
  onGenerate: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ color: C.ink, fontWeight: 700, fontSize: 15.5 }}>{children}</p>;
}

function PillRow({ options, value, onChange, icon }: { options: string[]; value: string; onChange: (v: string) => void; icon: React.ReactNode }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} className="tap flex items-center gap-1.5 rounded-full px-4 py-2.5"
            style={{ background: on ? C.violetSoft : C.card, border: `1px solid ${on ? C.violet : C.line}`, color: on ? C.violetDeep : C.ink2, fontWeight: 600, fontSize: 14 }}>
            <span style={{ opacity: on ? 1 : 0.5 }}>{icon}</span>{o}
          </button>
        );
      })}
    </div>
  );
}

function IconPillRow({ options, value, onChange }: { options: { key: string; icon: React.FC<{ size: number; color: string }> }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {options.map(({ key, icon: Icon }) => {
        const on = value === key;
        return (
          <button key={key} onClick={() => onChange(key)} className="tap flex items-center gap-1.5 rounded-full px-4 py-2.5"
            style={{ background: on ? C.violetSoft : C.card, border: `1px solid ${on ? C.violet : C.line}`, color: on ? C.violetDeep : C.ink2, fontWeight: 600, fontSize: 14 }}>
            <Icon size={15} color={on ? C.violet : C.faint} /> {key}
          </button>
        );
      })}
    </div>
  );
}

export function Context({ moods, toggleMood, company, setCompany, transport, setTransport, distance, setDistance, time, setTime, budget, setBudget, serendipity, setSerendipity, onBack, onGenerate }: Props) {
  return (
    <div className="fade-slide pb-4">
      <div className="px-6 pt-6 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="tap flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: C.card, border: `1px solid ${C.line}`, color: C.ink2 }} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div>
          <p style={{ color: C.violet, fontSize: 11, fontWeight: 700, letterSpacing: ".12em" }}>STEP 2 OF 3</p>
          <h2 style={{ color: C.ink, fontWeight: 800, fontSize: 22, letterSpacing: "-.01em" }}>Set the vibe</h2>
        </div>
      </div>

      <div className="px-6 mt-4">
        <SectionLabel>What are you in the mood for?</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {MOODS.map((m) => {
            const on = moods.includes(m.key);
            return (
              <button key={m.key} onClick={() => toggleMood(m.key)} className="tap flex items-center gap-2.5 rounded-2xl px-3.5 py-3"
                style={{ background: on ? C.violet : C.card, border: `1px solid ${on ? C.violet : C.line}`, boxShadow: on ? "0 10px 22px -12px rgba(108,92,231,.8)" : "none" }}>
                <span style={{ fontSize: 18 }}>{m.emoji}</span>
                <span style={{ color: on ? "#fff" : C.ink2, fontWeight: 600, fontSize: 14 }}>{m.key}</span>
                {on && <Check size={16} color="#fff" style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 mt-7"><SectionLabel>Who's with you?</SectionLabel><IconPillRow options={COMPANY as any} value={company} onChange={setCompany} /></div>
      <div className="px-6 mt-7"><SectionLabel>Getting around</SectionLabel><IconPillRow options={TRANSPORT as any} value={transport} onChange={setTransport} /></div>
      <div className="px-6 mt-7"><SectionLabel>How far will you go?</SectionLabel><PillRow options={DISTANCES} value={distance} onChange={setDistance} icon={<Footprints size={15} />} /></div>
      <div className="px-6 mt-7"><SectionLabel>How much time do you have?</SectionLabel><PillRow options={TIMES} value={time} onChange={setTime} icon={<Clock size={15} />} /></div>
      <div className="px-6 mt-7"><SectionLabel>Budget</SectionLabel><PillRow options={BUDGETS} value={budget} onChange={setBudget} icon={<Wallet size={15} />} /></div>

      <div className="px-6 mt-7">
        <SectionLabel>Familiar or surprising?</SectionLabel>
        <div className="mt-3 rounded-2xl px-4 py-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <input type="range" min="0" max="100" value={serendipity}
            onChange={(e) => setSerendipity(Number(e.target.value))}
            className="w-full" style={{ accentColor: C.violet }} />
          <div className="mt-2.5 flex items-center justify-between">
            <span style={{ color: C.faint, fontSize: 11.5, fontWeight: 600 }}>Favorites</span>
            <span style={{ color: C.violetDeep, fontSize: 12.5, fontWeight: 700 }}>{serendipityLabel(serendipity)}</span>
            <span style={{ color: C.faint, fontSize: 11.5, fontWeight: 600 }}>Surprises</span>
          </div>
        </div>
      </div>

      <div className="px-6 mt-7">
        <div className="rounded-2xl px-4 py-4" style={{ background: C.violetSoft2, border: `1px solid ${C.violetSoft}` }}>
          <div className="flex items-center gap-2">
            <Sparkles size={15} color={C.violet} />
            <p style={{ color: C.violetDeep, fontWeight: 700, fontSize: 13.5 }}>Personalizing from what you've told me</p>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {MEMORY.map((m) => (
              <span key={m} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5" style={{ background: C.card, color: C.ink2, fontSize: 12, fontWeight: 600 }}>
                <Heart size={12} color={C.violet} fill={C.violet} /> {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        <button onClick={onGenerate} className="tap w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.violetDeep})`, fontWeight: 700, fontSize: 16, boxShadow: "0 18px 34px -14px rgba(108,92,231,.9)" }}>
          <Sparkles size={18} /> Generate my experience
        </button>
        <p className="text-center mt-3" style={{ color: C.faint, fontSize: 12 }}>
          {moods.length ? `${moods.length} interests` : "No mood picked, I'll surprise you"} · {company} · {transport} · {time}
        </p>
      </div>
    </div>
  );
}
