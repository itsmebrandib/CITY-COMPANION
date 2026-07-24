import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExplorePage } from "./pages/ExplorePage";
import { MapPage } from "./pages/MapPage";
import { BottomNav } from "./components/ui/BottomNav";
import { C, globalStyles } from "./lib/palette";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: C.frame }}>
        <style>{globalStyles}</style>
        <style>{`.exp-range{-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;outline:none}.exp-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid ${C.violet};box-shadow:0 4px 10px -3px rgba(108,92,231,.7);cursor:pointer}.exp-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid ${C.violet};cursor:pointer}`}</style>

        <div
          className="exp-root relative w-full flex flex-col overflow-hidden"
          style={{
            maxWidth: 412,
            height: "min(880px, 100dvh)",
            background: C.page,
            boxShadow: "0 40px 80px -30px rgba(40,28,80,.45)",
          }}
        >
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/saved" element={<PlaceholderPage title="Saved" emoji="❤️" />} />
            <Route path="/itinerary" element={<PlaceholderPage title="Itinerary" emoji="📋" />} />
            <Route path="/profile" element={<PlaceholderPage title="Profile" emoji="👤" />} />
          </Routes>

          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center fade-slide" style={{ color: C.muted }}>
      <span style={{ fontSize: 48 }}>{emoji}</span>
      <p className="mt-4" style={{ fontWeight: 700, fontSize: 18, color: C.ink }}>{title}</p>
      <p className="mt-1" style={{ fontSize: 13 }}>Coming soon</p>
    </div>
  );
}
