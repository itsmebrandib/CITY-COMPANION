import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TravelMap } from "../components/map/TravelMap";
import { InstagramFeed } from "../components/instagram/InstagramFeed";
import { useTravelNodes } from "../hooks/useTravelNodes";
import { useInstagram } from "../hooks/useInstagram";
import { MODE_LABELS, MODE_COLORS } from "../components/map/markerIcons";
import { C } from "../lib/palette";

export function MapPage() {
  const navigate = useNavigate();
  const travel = useTravelNodes();
  const ig = useInstagram();

  const modeCounts = travel.stats
    ? (Object.entries(travel.stats.byMode) as [keyof typeof MODE_LABELS, number][])
        .filter(([, count]) => count > 0)
    : [];

  return (
    <div className="flex-1 overflow-y-auto no-bar fade-slide">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="tap flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: C.card, border: `1px solid ${C.line}`, color: C.ink2 }}
          aria-label="Back"
        >
          <ArrowLeft size={19} />
        </button>
        <div className="flex-1">
          <p style={{ color: C.violet, fontSize: 11, fontWeight: 700, letterSpacing: ".12em" }}>TRAVEL MAP</p>
          <h2 style={{ color: C.ink, fontWeight: 800, fontSize: 22, letterSpacing: "-.01em" }}>
            Where you've been
          </h2>
        </div>
        {travel.connected && (
          <button
            onClick={travel.reload}
            className="tap flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, background: C.card, border: `1px solid ${C.line}`, color: C.ink2 }}
            aria-label="Refresh map"
          >
            <RefreshCw size={16} className={travel.loading ? "spinny" : undefined} />
          </button>
        )}
      </div>

      <div className="px-6 pb-4">
        <TravelMap nodes={travel.nodes} refitOnChange />
      </div>

      {/* trip summary */}
      {travel.stats && travel.stats.mapped > 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full px-2.5 py-1"
              style={{ background: C.violetSoft2, color: C.violetDeep, fontSize: 11.5, fontWeight: 700 }}>
              {travel.stats.mapped} stops
            </span>
            {modeCounts.map(([mode, count]) => (
              <span key={mode} className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: MODE_COLORS[mode] }} />
                {count} {MODE_LABELS[mode].toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* posts we couldn't place */}
      {travel.unmapped.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
            style={{ background: C.amberSoft, border: `1px solid #F0E0BC` }}>
            <AlertCircle size={16} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ color: C.amber, fontWeight: 700, fontSize: 12.5 }}>
                {travel.unmapped.length} post{travel.unmapped.length > 1 ? "s" : ""} couldn't be placed
              </p>
              <p style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.4 }}>
                They're missing a location tag, or the venue name didn't resolve.
              </p>
            </div>
          </div>
        </div>
      )}

      {travel.error && (
        <div className="px-6 pb-4">
          <p style={{ color: C.muted, fontSize: 12.5 }}>{travel.error}</p>
        </div>
      )}

      {!travel.connected && !travel.loading && (
        <div className="px-6 pb-4">
          <div className="rounded-2xl px-4 py-4" style={{ background: C.violetSoft2, border: `1px solid ${C.violetSoft}` }}>
            <p style={{ color: C.ink, fontWeight: 700, fontSize: 14.5 }}>Connect Instagram to populate your map</p>
            <p className="mt-1" style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
              We'll read your travel posts, detect flight / boat / train content, and pin each city automatically.
            </p>
            <button
              onClick={ig.connect}
              className="tap mt-3 flex items-center justify-center rounded-xl py-3 px-5 text-white"
              style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.violetDeep})`, fontWeight: 700, fontSize: 14 }}
            >
              Connect Instagram
            </button>
          </div>
        </div>
      )}

      {ig.connected && (
        <div className="pb-4">
          <InstagramFeed posts={ig.posts} loading={ig.loading} />
        </div>
      )}
    </div>
  );
}
