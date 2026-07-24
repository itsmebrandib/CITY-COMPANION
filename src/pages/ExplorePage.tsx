import { useState } from "react";
import { Welcome } from "../components/explore/Welcome";
import { Context } from "../components/explore/Context";
import { Experience } from "../components/explore/Experience";
import { Generating } from "../components/ui/Generating";

type Screen = "welcome" | "context" | "experience";

type QuickItem = {
  label: string;
  set: { moods?: string[]; time?: string; serendipity?: number };
};

export function ExplorePage() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [listening, setListening] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [start, setStart] = useState("Congress Ave");
  const [editingStart, setEditingStart] = useState(false);

  const [moods, setMoods] = useState<string[]>([]);
  const [company, setCompany] = useState("Solo");
  const [transport, setTransport] = useState("Walking");
  const [distance, setDistance] = useState("20 min");
  const [time, setTime] = useState("Afternoon");
  const [budget, setBudget] = useState("$$");
  const [serendipity, setSerendipity] = useState(60);
  const [saved, setSaved] = useState(false);

  const startListening = () => {
    if (listening) return;
    setListening(true);
    setTimeout(() => { setListening(false); setScreen("context"); }, 1400);
  };

  const quickStart = (q: QuickItem) => {
    if (q.set.moods) setMoods(q.set.moods);
    if (q.set.time) setTime(q.set.time);
    if (q.set.serendipity != null) setSerendipity(q.set.serendipity);
    setScreen("context");
  };

  const toggleMood = (k: string) =>
    setMoods((m) => m.includes(k) ? m.filter((x) => x !== k) : [...m, k]);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setScreen("experience"); }, 1600);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto no-bar">
        {screen === "welcome" && (
          <Welcome
            listening={listening} onMic={startListening} onQuick={quickStart}
            start={start} setStart={setStart}
            editingStart={editingStart} setEditingStart={setEditingStart}
          />
        )}
        {screen === "context" && (
          <Context
            moods={moods} toggleMood={toggleMood}
            company={company} setCompany={setCompany}
            transport={transport} setTransport={setTransport}
            distance={distance} setDistance={setDistance}
            time={time} setTime={setTime}
            budget={budget} setBudget={setBudget}
            serendipity={serendipity} setSerendipity={setSerendipity}
            onBack={() => setScreen("welcome")}
            onGenerate={generate}
          />
        )}
        {screen === "experience" && (
          <Experience
            moods={moods} company={company} transport={transport}
            distance={distance} time={time} budget={budget} start={start}
            onBack={() => setScreen("context")}
            onChangeMood={() => setScreen("context")}
            saved={saved} setSaved={setSaved}
          />
        )}
      </div>
      {generating && <Generating start={start} />}
    </>
  );
}
