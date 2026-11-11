/* Ikony liniowe 1.5px — spójne z minimalistycznym językiem wizualnym. */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  focusable: 'false',
};

export const IconSearch = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
export const IconClose = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconArrow = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconBack = (p) => (
  <svg {...base} {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
);
export const IconPlay = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M8 5.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 8 5.5Z" /></svg>
);
export const IconPause = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><rect x="6.5" y="5" width="3.5" height="14" rx=".75" /><rect x="14" y="5" width="3.5" height="14" rx=".75" /></svg>
);
export const IconLoop = (p) => (
  <svg {...base} {...p}><path d="M17 2l3 3-3 3" /><path d="M4 11V9a4 4 0 0 1 4-4h12" /><path d="M7 22l-3-3 3-3" /><path d="M20 13v2a4 4 0 0 1-4 4H4" /></svg>
);
export const IconVolume = (p) => (
  <svg {...base} {...p}><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
);
export const IconMuted = (p) => (
  <svg {...base} {...p}><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m22 9-6 6M16 9l6 6" /></svg>
);
export const IconExpand = (p) => (
  <svg {...base} {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
export const IconRestart = (p) => (
  <svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /></svg>
);

/* Feature 2 / 3 — ikony sekcji opisu znaku. */
export const IconHand = (p) => (
  <svg {...base} {...p}>
    <path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5" />
    <path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V13" />
    <path d="M8 11.5 6.6 10.1a1.6 1.6 0 0 0-2.3 2.3L8 16.5c1.3 1.6 2.9 3.5 5.5 3.5h.5a5 5 0 0 0 5-5v-3.5" />
  </svg>
);
export const IconFace = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 9.5h.01M15.5 9.5h.01" strokeWidth="2.25" />
    <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" />
  </svg>
);
export const IconMove = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M15 8l4 4-4 4" /><path d="M5 7v10" strokeDasharray="2 2.5" /></svg>
);
