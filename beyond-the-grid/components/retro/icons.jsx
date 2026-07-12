// Iconos locales de la ruta /retro (estilo Lucide, trazo 1.8, currentColor).
// Independientes de components/icons.jsx (que NO se toca) pero de la misma
// familia visual para que la app siga leyéndose como un único sistema.

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

export const IconThermo = (p) => (<S {...p}><path d="M14 4a2 2 0 0 0-4 0v9.3a4.5 4.5 0 1 0 4 0Z" /><path d="M12 9v7" /></S>);
export const IconHeart = (p) => (<S {...p}><path d="M19 14c1.5-1.5 2-3 2-4.5A4.5 4.5 0 0 0 16.5 5c-1.8 0-3.4 1-4.5 2.6C10.9 6 9.3 5 7.5 5A4.5 4.5 0 0 0 3 9.5c0 1.5.5 3 2 4.5l7 6Z" /></S>);
export const IconHeartFill = (p) => (<S {...p} fill="currentColor" stroke="none"><path d="M19 14c1.5-1.5 2-3 2-4.5A4.5 4.5 0 0 0 16.5 5c-1.8 0-3.4 1-4.5 2.6C10.9 6 9.3 5 7.5 5A4.5 4.5 0 0 0 3 9.5c0 1.5.5 3 2 4.5l7 6Z" /></S>);
export const IconPlus = (p) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const IconUsers = (p) => (<S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 5a3.5 3.5 0 0 1 0 6.7" /><path d="M17.5 14.4a6.5 6.5 0 0 1 4 5.6" /></S>);
export const IconArchive = (p) => (<S {...p}><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /><path d="M10 13h4" /></S>);
export const IconHistory = (p) => (<S {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></S>);
export const IconTrash = (p) => (<S {...p}><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></S>);
export const IconRestore = (p) => (<S {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></S>);
export const IconEyeOff = (p) => (<S {...p}><path d="M10.6 5.1A10 10 0 0 1 12 5c7 0 10 7 10 7a15.7 15.7 0 0 1-2.2 3.2M6.6 6.6A15 15 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M3 3l18 18" /></S>);
export const IconChevronR = (p) => (<S {...p}><path d="m9 6 6 6-6 6" /></S>);
export const IconChevronD = (p) => (<S {...p}><path d="m6 9 6 6 6-6" /></S>);
export const IconX = (p) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>);
export const IconCheck = (p) => (<S {...p}><path d="M20 6 9 17l-5-5" /></S>);
export const IconArrowL = (p) => (<S {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></S>);
export const IconArrowR = (p) => (<S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>);
export const IconStar = (p) => (<S {...p}><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8Z" /></S>);
export const IconCalendarPlus = (p) => (<S {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M12 13.5v5M9.5 16h5" /></S>);
export const IconEnter = (p) => (<S {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></S>);
export const IconInfo = (p) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11.5V16" /></S>);
export const IconBackward = (p) => (<S {...p}><path d="m11 18-7-6 7-6" /><path d="m20 18-7-6 7-6" /></S>);
export const IconForward = (p) => (<S {...p}><path d="m13 6 7 6-7 6" /><path d="m4 6 7 6-7 6" /></S>);
