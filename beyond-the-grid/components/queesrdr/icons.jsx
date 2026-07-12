// Iconos locales de la página "¿Qué es RDR?" (mismo estilo Lucide, trazo 1.8,
// currentColor, que components/icons.jsx — pero SIN tocar aquel fichero).

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

export const IconBank = (p) => (<S {...p}><path d="M3 21h18" /><path d="M4 18h16" /><path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7" /><path d="M12 3 3 8h18l-9-5Z" /></S>);
export const IconLayers = (p) => (<S {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></S>);
export const IconDatabase = (p) => (<S {...p}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></S>);
export const IconServer = (p) => (<S {...p}><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></S>);
export const IconContract = (p) => (<S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></S>);
export const IconSend = (p) => (<S {...p}><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></S>);
export const IconSwap = (p) => (<S {...p}><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></S>);
export const IconGlobe = (p) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18Z" /></S>);
export const IconUsers = (p) => (<S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 5a3.5 3.5 0 0 1 0 7" /><path d="M17.5 14.5c2.4.7 4 2.6 4 5.5" /></S>);
export const IconTag = (p) => (<S {...p}><path d="M12 2H2v10l9.3 9.3a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8L12 2Z" /><circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" /></S>);
export const IconNetwork = (p) => (<S {...p}><circle cx="12" cy="12" r="2.6" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M6.5 6.5 10 10M17.5 6.5 14 10M6.5 17.5 10 14M17.5 17.5 14 14" /></S>);
export const IconFlow = (p) => (<S {...p}><rect x="2" y="9" width="5" height="6" rx="1" /><rect x="17" y="9" width="5" height="6" rx="1" /><path d="M7 12h10" /><path d="m13.5 8.5 3.5 3.5-3.5 3.5" /></S>);
export const IconBook = (p) => (<S {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></S>);
export const IconScale = (p) => (<S {...p}><path d="M12 3v18" /><path d="M8 21h8" /><path d="M4 7h16" /><path d="m6 7-3 6a3 3 0 0 0 6 0L6 7Z" /><path d="m18 7-3 6a3 3 0 0 0 6 0l-3-6Z" /></S>);
export const IconClipboard = (p) => (<S {...p}><rect x="5" y="4" width="14" height="18" rx="2" /><path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /><path d="m8.5 13 2.5 2.5 4.5-4.5" /></S>);
export const IconMail = (p) => (<S {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6L22 7" /></S>);
export const IconArrowRight = (p) => (<S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>);
export const IconArrowLeft = (p) => (<S {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></S>);
export const IconChart = (p) => (<S {...p}><path d="M3 3v18h18" /><path d="M7 15v-4M12 15V7M17 15v-6" /></S>);
export const IconGear = (p) => (<S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></S>);
