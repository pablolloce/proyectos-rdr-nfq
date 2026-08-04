// Iconos locales de la ruta /pases (estilo Lucide, trazo 1.8, currentColor).
// Misma familia visual que components/icons.jsx, pero SIN tocar ese fichero:
// los conceptos de esta página (guardar, terminal, drag de orden…) son suyos.

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

export const IconSave = (p) => (<S {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></S>);
export const IconTrash = (p) => (<S {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6M14 11v6" /></S>);
export const IconUp = (p) => (<S {...p}><path d="m18 15-6-6-6 6" /></S>);
export const IconDown = (p) => (<S {...p}><path d="m6 9 6 6 6-6" /></S>);
export const IconCheck = (p) => (<S {...p}><path d="M20 6 9 17l-5-5" /></S>);
export const IconX = (p) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>);
export const IconTerminal = (p) => (<S {...p}><path d="m4 17 6-5-6-5" /><path d="M12 19h8" /></S>);
export const IconCopy = (p) => (<S {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></S>);
export const IconPlus = (p) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const IconRocket = (p) => (<S {...p}><path d="M14 4c3 0 6 3 6 6-2 6-6 8-6 8l-4-4s2-4 4-10Z" /><path d="M9 11 5 9s.5-3 3-4M13 15l2 4s3-.5 4-3" /><path d="M9 15c-1.5 1.5-1.5 4-1.5 4s2.5 0 4-1.5" /></S>);
export const IconRefresh = (p) => (<S {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></S>);
export const IconCalendar = (p) => (<S {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></S>);
export const IconMoon = (p) => (<S {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></S>);
export const IconFlag = (p) => (<S {...p}><path d="M4 22V4a1 1 0 0 1 .4-.8C5.5 2.4 7 2 8.5 2c3 0 4.5 2 7 2 1.3 0 2.4-.3 3.5-.9a.6.6 0 0 1 1 .5v10.6a1 1 0 0 1-.4.8c-1.1.8-2.6 1.3-4.1 1.3-3 0-4.5-2-7-2-1.4 0-2.7.4-3.5 1" /></S>);
export const IconAlert = (p) => (<S {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></S>);
export const IconArrowLeft = (p) => (<S {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></S>);
export const IconArrowRight = (p) => (<S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>);
export const IconExternal = (p) => (<S {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></S>);
export const IconLock = (p) => (<S {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></S>);
export const IconGitMerge = (p) => (<S {...p}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></S>);
export const IconClipboard = (p) => (<S {...p}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></S>);
export const IconListOrdered = (p) => (<S {...p}><path d="M10 6h11M10 12h11M10 18h11" /><path d="M4 6h1v4M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></S>);
export const IconGrip = (p) => (<S {...p} fill="currentColor"><circle cx="9" cy="5" r="1.2" /><circle cx="15" cy="5" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="9" cy="19" r="1.2" /><circle cx="15" cy="19" r="1.2" /></S>);
