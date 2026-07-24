# CITY-COMPANION
CITY COMPANION
# EXPLORE

Discover your city like a local.

EXPLORE is an AI-native city companion prototype. The premise is simple: Google Maps and Yelp already solved discovery. What a traveler in an unfamiliar city actually lacks is confidence. EXPLORE turns a mood, a start point, and a few minutes of context into one connected, walkable route worth taking, not another wall of isolated pins.

This repository contains a single-file, interactive React prototype that validates the core "magic moment" flow: intent, context, and a generated day.

## Why this exists

Most travel tools optimize for search. You already know what a coffee shop is. What you do not know is which one locals actually go to, what sits three blocks past it that no guidebook mentions, and how to string a morning together so it feels like a day rather than a list of errands.

The product thesis is confidence over discovery. Every design choice follows from it: curated routes instead of ranked results, a memory layer that remembers what you love, and a serendipity dial that lets you choose between familiar favorites and genuine surprises.

## What it does

The prototype runs a three-screen flow you can click through end to end.

**Screen 1, intent.** A voice-style input with a working "listening" state, plus feeling-first quick starts ("I want to feel like a local", "Show me what tourists miss", "Rainy day ideas"). The starting location is editable with neighborhood suggestions.

**Screen 2, context.** Fast, low-friction selection: interests, who you are with, how you are getting around, distance, time, and budget. A familiar-to-surprising serendipity slider and a visible memory layer that shows what the companion already knows about you.

**Screen 3, the generated day.** A time-anchored, numbered route on a stylized map, with walk times between each stop, a difficulty and cost read, a hidden-gem bonus, and optional Maps / Gmail / Resy integrations that never gate the experience.

The mock city context is Austin, TX.

## Tech stack

- React with hooks for state and screen transitions
- Tailwind utility classes for layout
- lucide-react for iconography
- Inline SVG for the route map, no external image dependencies
- Plus Jakarta Sans loaded via Google Fonts

The entire prototype is one component in `ExploreApp.jsx` with no external state library and no backend.

## Getting started

The component is self-contained. Drop it into any React project that has Tailwind and lucide-react available.

```bash
# from a fresh Vite React app
npm create vite@latest explore -- --template react
cd explore
npm install
npm install lucide-react
# add Tailwind per the official Tailwind + Vite guide
```

Then copy `ExploreApp.jsx` into `src/` and render it:

```jsx
import ExploreApp from "./ExploreApp";

export default function App() {
  return <ExploreApp />;
}
```

```bash
npm run dev
```

The layout is mobile-first and renders inside a phone-style frame, so it looks right on both a phone and a desktop preview.

## Project structure

```
.
├── ExploreApp.jsx   # the full prototype: 3 screens, state, styling
└── README.md
```

Inside `ExploreApp.jsx`, the pieces are organized top to bottom: a color and content config block, then the root state container, then one component per screen (`Welcome`, `Context`, `Experience`), plus shared pieces (`RouteMap`, `TimelineStop`, `BottomNav`, `Generating`).

## Customizing it

Most of what you would want to change lives in the config block at the top of the file.

- **City and stops:** edit the `STOPS` array (name, time, walk time, blurb, tag).
- **Interests, company, transport, budget:** edit `MOODS`, `COMPANY`, `TRANSPORT`, `BUDGETS`.
- **Feeling-first prompts:** edit `QUICK`.
- **Memory layer:** edit `MEMORY`.
- **Palette:** edit the `C` object. Colors are set inline so they render reliably even without a Tailwind compiler step.

## What is real and what is mocked

This is a validation prototype, so it is honest about its edges.

Real: all three screens, the full click-through flow, the listening and generating moments, multi-select and single-select state, the editable start location, the serendipity slider, save and connect toggles, and the input summary that reflects your actual selections on the final screen.

Mocked: the route itself. The stop list is a fixed Austin set. Selections shape the framing (title, stats, summary chips) but do not yet regenerate the stops.

## Roadmap

- Make the route recompute from mood, budget, distance, and serendipity
- Real geocoding and live start location
- A recommendation layer behind the generated day
- Persisted memory across sessions
- Live "start route" handoff to turn-by-turn navigation
- Progressive integrations that actually personalize (Maps, Gmail, Resy)

## Design notes

The visual language is violet-forward and warm, built to feel like a premium consumer app rather than a utility. Boldness is spent in one place, the generated-day reveal, and everything around it stays quiet. Motion is deliberate and respects reduced-motion preferences. The bottom navigation and device frame persist across screens so the prototype reads as a real product, not a slideshow.

## License

Add your license of choice here.
