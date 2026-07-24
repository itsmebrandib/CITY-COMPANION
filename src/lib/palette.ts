export const C = {
  page: "#F4F3F9",
  frame: "#E7E5F0",
  violet: "#6C5CE7",
  violetDeep: "#584AD1",
  violetSoft: "#ECE9FB",
  violetSoft2: "#F4F1FD",
  ink: "#1B1526",
  ink2: "#3A3348",
  muted: "#6E6880",
  faint: "#9A94A8",
  line: "#EAE7F1",
  card: "#FFFFFF",
  peachA: "#FBE6D4",
  peachB: "#F7EEE7",
  green: "#2E9E5B",
  greenSoft: "#E7F5EC",
  amber: "#B07A16",
  amberSoft: "#FBF0DA",
} as const;

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .exp-root, .exp-root * { font-family:'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif; }
  @keyframes fadeSlide { from{opacity:0; transform:translateY(12px)} to{opacity:1; transform:none} }
  .fade-slide{ animation:fadeSlide .45s cubic-bezier(.2,.7,.2,1) both }
  @keyframes rise { from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:none} }
  .rise{ animation:rise .5s cubic-bezier(.2,.7,.2,1) both }
  @keyframes pulseRing { 0%{transform:scale(1);opacity:.55} 80%{transform:scale(2.1);opacity:0} 100%{opacity:0} }
  .pulse-ring{ animation:pulseRing 1.5s ease-out infinite }
  @keyframes eq { 0%,100%{transform:scaleY(.35)} 50%{transform:scaleY(1)} }
  .eqbar{ animation:eq .9s ease-in-out infinite; transform-origin:bottom }
  @keyframes spinny{ to{transform:rotate(360deg)} }
  .spinny{ animation:spinny 1.1s linear infinite }
  @keyframes dash{ to{stroke-dashoffset:-24} }
  .routeflow{ animation:dash 1.2s linear infinite }
  .no-bar::-webkit-scrollbar{ display:none }
  .no-bar{ -ms-overflow-style:none; scrollbar-width:none }
  .tap{ transition:transform .12s ease, box-shadow .2s ease, background .2s ease }
  .tap:active{ transform:scale(.97) }
  @media (prefers-reduced-motion: reduce){
    .fade-slide,.rise,.pulse-ring,.eqbar,.spinny,.routeflow{ animation:none !important }
  }
`;
