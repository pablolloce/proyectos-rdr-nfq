// Iconos locales de la ruta /vacaciones (mismo estilo que components/icons.jsx:
// familia Lucide, trazo 1.8, currentColor). NO se toca el set global.

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

export const IconUsers = (p) => (<S {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></S>);
export const IconFilterOff = (p) => (<S {...p}><path d="M13.35 6H22l-3.5 4.1M9.6 9.6 2 6h7.6ZM10 12v8l4-2v-4.5" /><path d="m2 2 20 20" /></S>);
export const IconExternal = (p) => (<S {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></S>);
export const IconClose = (p) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>);
export const IconChevron = (p) => (<S {...p}><path d="m6 9 6 6 6-6" /></S>);
export const IconAlert = (p) => (<S {...p}><path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></S>);
export const IconInfo = (p) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></S>);
export const IconSun = (p) => (<S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></S>);
export const IconArrowLeft = (p) => (<S {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></S>);
export const IconRefresh = (p) => (<S {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></S>);
