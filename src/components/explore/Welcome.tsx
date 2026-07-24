import { Menu, Mic, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { C } from "../../lib/palette";

const MOODS_QUICK = [
  { label: "I want to feel like a local", set: { moods: ["Coffee", "Food"] } },
  { label: "Show me what tourists miss", set: { moods: ["Art"], serendipity: 80 } },
  { label: "I've got 3 hours to wander", set: { time: "Afternoon" } },
  { label: "Rainy day ideas", set: { moods: ["Art", "History"] } },
  { label: "Surprise me", set: { moods: ["Surprise Me"], serendipity: 90 } },
];

const START_SUGGESTIONS = ["Congress Ave", "South Congress", "East Austin", "The Domain"];

type QuickItem = (typeof MOODS_QUICK)[0];

interface Props {
  listening: boolean;
  onMic: () => void;
  onQuick: (q: QuickItem) => void;
  start: string;
  setStart: (s: string) => void;
  editingStart: boolean;
  setEditingStart: (v: boolean) => void;
}

export function Welcome({ listening, onMic, onQuick, start, setStart, editingStart, setEditingStart }: Props) {
  return (
    <div className="fade-slide">
      <div
        className="px-6 pt-6 pb-8"
        style={{ background: `linear-gradient(160deg, ${C.peachA} 0%, ${C.peachB} 42%, ${C.page} 100%)` }}
      >
        <div className="flex items-center justify-between">
          <button
            className="tap flex items-center justify-center rounded-full"
            style={{ width: 42, height: 42, background: "rgba(255,255,255,.7)", color: C.ink2 }}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div
            className="flex items-center justify-center rounded-full font-bold text-white"
            style={{
              width: 42, height: 42, fontSize: 15,
              background: `linear-gradient(135deg, ${C.violet}, #8E7BFF)`,
              boxShadow: "0 6px 16px -6px rgba(108,92,231,.7)",
            }}
          >
            B
          </div>
        </div>

        <div
          className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ background: "rgba(255,255,255,.6)", color: C.violetDeep, fontSize: 11, fontWeight: 700, letterSpacing: ".14em" }}
        >
          <Sparkles size={12} /> EXPLORE
        </div>

        <h1 className="mt-4" style={{ color: C.ink, fontWeight: 800, fontSize: 36, lineHeight: 1.05, letterSpacing: "-.02em" }}>
          Discover your city<br />like a local.
        </h1>
        <p className="mt-3" style={{ color: C.ink2, fontSize: 15, lineHeight: 1.5, maxWidth: 300 }}>
          You don't know this city yet. Tell me the kind of day you want, and I'll build one walkable route worth taking.
        </p>
      </div>

      <div className="px-6 -mt-2">
        <button
          onClick={onMic}
          className="tap w-full flex items-center gap-3 rounded-3xl px-4 py-4 text-left"
          style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 20px 40px -28px rgba(40,28,80,.4)" }}
        >
          <span className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
            {listening && (
              <span className="pulse-ring absolute rounded-full" style={{ inset: 0, border: `2px solid ${C.violet}` }} />
            )}
            <span
              className="flex items-center justify-center rounded-full text-white"
              style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${C.violet}, #8E7BFF)`, boxShadow: "0 10px 20px -8px rgba(108,92,231,.8)" }}
            >
              <Mic size={22} />
            </span>
          </span>

          {listening ? (
            <span className="flex-1 flex items-center gap-3">
              <span className="flex items-end gap-1" style={{ height: 22 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="eqbar rounded-full" style={{ width: 4, height: 22, background: C.violet, animationDelay: `${i * 0.12}s` }} />
                ))}
              </span>
              <span style={{ color: C.violetDeep, fontWeight: 600, fontSize: 15 }}>Listening…</span>
            </span>
          ) : (
            <span className="flex-1">
              <span style={{ color: C.ink, fontWeight: 600, fontSize: 15.5 }}>What are you looking for today?</span>
              <span className="block mt-0.5" style={{ color: C.faint, fontSize: 12.5 }}>Tap to speak, or pick a starter below</span>
            </span>
          )}
        </button>
      </div>

      <div className="px-6 mt-6">
        <p style={{ color: C.faint, fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em" }}>OR TELL ME THE FEELING</p>
        <div className="mt-3 flex flex-col gap-2.5">
          {MOODS_QUICK.map((q) => (
            <button
              key={q.label}
              onClick={() => onQuick(q)}
              className="tap w-full flex items-center justify-between rounded-2xl px-4 py-3.5"
              style={{ background: C.card, border: `1px solid ${C.line}` }}
            >
              <span style={{ color: C.ink2, fontWeight: 600, fontSize: 14.5 }}>{q.label}</span>
              <ChevronRight size={18} color={C.violet} />
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-6 mb-8">
        <div className="rounded-2xl px-4 py-3.5" style={{ background: C.violetSoft2, border: `1px solid ${C.violetSoft}` }}>
          <div className="flex items-center gap-3">
            <MapPin size={18} color={C.violet} />
            <div className="flex-1">
              <p style={{ color: C.ink2, fontWeight: 700, fontSize: 13.5 }}>Starting near {start}</p>
              <p style={{ color: C.muted, fontSize: 12 }}>Downtown Austin, TX</p>
            </div>
            <button onClick={() => setEditingStart(!editingStart)} style={{ color: C.violet, fontWeight: 700, fontSize: 12.5 }}>
              {editingStart ? "Done" : "Change"}
            </button>
          </div>
          {editingStart && (
            <div className="mt-3">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <MapPin size={15} color={C.faint} />
                <input
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="Hotel or neighborhood"
                  className="flex-1 outline-none"
                  style={{ fontSize: 14, color: C.ink, background: "transparent" }}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {START_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStart(s); setEditingStart(false); }}
                    className="tap rounded-full px-3 py-1.5"
                    style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 12.5, fontWeight: 600 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
