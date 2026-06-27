// Set de iconos en línea (estilo Lucide, trazo 1.8, currentColor).
// Uno solo por concepto -> consistencia de familia/grosor (regla skill).

const S = ({ children, size = 22, fill = "none", ...p }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    {children}
  </svg>
);

export const IconGrad = (p) => (<S {...p}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" /></S>);
export const IconBook = (p) => (<S {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></S>);
export const IconLink = (p) => (<S {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></S>);
export const IconRefresh = (p) => (<S {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></S>);
export const IconCalendar = (p) => (<S {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></S>);
export const IconUtensils = (p) => (<S {...p}><path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20" /><path d="M18 2c-2 0-3 2-3 5s1 4 3 4-1 0 0 0v11" /></S>);
export const IconClock = (p) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>);
export const IconRocket = (p) => (<S {...p}><path d="M14 4c3 0 6 3 6 6-2 6-6 8-6 8l-4-4s2-4 4-10Z" /><path d="M9 11 5 9s.5-3 3-4M13 15l2 4s3-.5 4-3" /><path d="M9 15c-1.5 1.5-1.5 4-1.5 4s2.5 0 4-1.5" /></S>);
export const IconCode = (p) => (<S {...p}><path d="m8 18-6-6 6-6M16 6l6 6-6 6" /></S>);
export const IconFolder = (p) => (<S {...p}><path d="M4 5h5l2 2.5h9A1.5 1.5 0 0 1 21 9v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" /></S>);
export const IconShield = (p) => (<S {...p}><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></S>);
export const IconArrow = (p) => (<S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>);
export const IconExternal = (p) => (<S {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></S>);
export const IconCopy = (p) => (<S {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></S>);
export const IconLock = (p) => (<S {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></S>);
export const IconCheck = (p) => (<S {...p}><path d="M20 6 9 17l-5-5" /></S>);
export const IconPlay = (p) => (<S {...p}><path d="M7 4v16l13-8z" /></S>);
export const IconLockOpen = (p) => (<S {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.9-1" /></S>);
export const IconOrbit = (p) => (<S {...p}><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)" /><circle cx="20" cy="8.5" r="1.4" fill="currentColor" stroke="none" /></S>);
