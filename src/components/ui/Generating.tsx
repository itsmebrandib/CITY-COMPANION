import { Sparkles } from "lucide-react";
import { C } from "../../lib/palette";

export function Generating({ start }: { start: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${C.violet}, ${C.violetDeep})` }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
        <span
          className="pulse-ring absolute rounded-full"
          style={{ inset: 0, border: "2px solid rgba(255,255,255,.6)" }}
        />
        <span
          className="spinny flex items-center justify-center rounded-full"
          style={{ width: 84, height: 84, border: "3px solid rgba(255,255,255,.25)", borderTopColor: "#fff" }}
        />
        <Sparkles size={30} color="#fff" style={{ position: "absolute" }} />
      </div>
      <p className="mt-7 text-white" style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-.01em" }}>
        Crafting your route
      </p>
      <p className="mt-2" style={{ color: "rgba(255,255,255,.8)", fontSize: 14, maxWidth: 250, lineHeight: 1.5 }}>
        Connecting the good stuff near {start} into one easy walk.
      </p>
    </div>
  );
}
