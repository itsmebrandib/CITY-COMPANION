import { C } from "../../lib/palette";

/**
 * Styles for map DOM that lives outside React's control (AdvancedMarker
 * content and the Google-rendered InfoWindow shell), plus the responsive
 * sizing rules for the map shell itself.
 *
 * Injected as a <style> tag rather than Tailwind classes because the
 * InfoWindow's outer chrome is created by the Maps API and can only be reached
 * with descendant selectors.
 */
export const mapStyles = `
/* ── responsive shell ─────────────────────────────────────────────── */
.cc-map-shell {
  position: relative;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: ${C.violetSoft2};
  height: clamp(280px, 46vh, 420px);
}
@media (min-width: 768px) {
  .cc-map-shell { height: clamp(420px, 62vh, 720px); border-radius: 28px; }
}
.cc-map-shell--full { height: 100%; border-radius: 0; }

/* ── marker pins ──────────────────────────────────────────────────── */
.cc-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform-origin: bottom center;
  transition: transform .18s cubic-bezier(.2,.7,.2,1);
  will-change: transform;
}
.cc-pin[data-selected="true"] { transform: scale(1.18); z-index: 5; }
.cc-pin:hover { transform: scale(1.09); }

.cc-pin__body {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px 5px 6px;
  border-radius: 999px;
  background: var(--pin-color);
  border: 2px solid #fff;
  box-shadow: 0 4px 12px -3px rgba(27,21,38,.45);
}
.cc-pin[data-selected="true"] .cc-pin__body {
  box-shadow: 0 8px 22px -4px rgba(27,21,38,.6);
}
.cc-pin__index {
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
.cc-pin__tail {
  width: 0; height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid #fff;
  margin-top: -1px;
  filter: drop-shadow(0 2px 2px rgba(27,21,38,.3));
}

/* ── info window ──────────────────────────────────────────────────── */
/* Strip the default Google chrome so our card fills the bubble edge-to-edge. */
.cc-map-shell .gm-style-iw.gm-style-iw-c {
  padding: 0 !important;
  border-radius: 18px !important;
  box-shadow: 0 18px 44px -16px rgba(27,21,38,.45) !important;
  overflow: hidden;
}
.cc-map-shell .gm-style-iw-d {
  overflow: hidden !important;
  max-height: none !important;
}
.cc-map-shell .gm-style-iw-chr { display: none; }
.cc-map-shell .gm-style-iw-tc::after { background: #fff; }

.cc-iw {
  width: 236px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: #fff;
}
.cc-iw__media {
  display: block;
  width: 100%;
  height: 128px;
  object-fit: cover;
}
.cc-iw__body { padding: 10px 12px 12px; }

.cc-iw__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 6px;
  border-radius: 999px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.cc-iw__place {
  margin: 7px 0 0;
  color: ${C.ink};
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.25;
}
.cc-iw__date {
  margin: 1px 0 0;
  color: ${C.faint};
  font-size: 11.5px;
  font-weight: 600;
}
.cc-iw__caption {
  margin: 7px 0 0;
  color: ${C.muted};
  font-size: 12.3px;
  line-height: 1.45;
}
.cc-iw__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 9px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}
.cc-iw__link:hover { text-decoration: underline; }

@media (min-width: 768px) {
  .cc-iw { width: 268px; }
  .cc-iw__media { height: 150px; }
}

/* ── legend ───────────────────────────────────────────────────────── */
.cc-legend {
  position: absolute;
  left: 10px; bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  max-width: calc(100% - 20px);
  padding: 7px 9px;
  border-radius: 12px;
  background: rgba(255,255,255,.93);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 18px -8px rgba(27,21,38,.4);
}
.cc-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  color: ${C.ink2};
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
.cc-legend__dot { width: 8px; height: 8px; border-radius: 50%; }

@media (prefers-reduced-motion: reduce) {
  .cc-pin { transition: none; }
}
`;
