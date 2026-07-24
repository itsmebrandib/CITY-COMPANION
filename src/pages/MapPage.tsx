import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TravelMap } from "../components/map/TravelMap";
import { InstagramFeed } from "../components/instagram/InstagramFeed";
import { useInstagram } from "../hooks/useInstagram";
import { C } from "../lib/palette";

export function MapPage() {
  const navigate = useNavigate();
  const ig = useInstagram();

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
        <div>
          <p style={{ color: C.violet, fontSize: 11, fontWeight: 700, letterSpacing: ".12em" }}>TRAVEL MAP</p>
          <h2 style={{ color: C.ink, fontWeight: 800, fontSize: 22, letterSpacing: "-.01em" }}>Where you've been</h2>
        </div>
      </div>

      <div className="px-6 pb-4">
        <TravelMap igPosts={ig.posts} />
      </div>

      {!ig.connected && (
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
