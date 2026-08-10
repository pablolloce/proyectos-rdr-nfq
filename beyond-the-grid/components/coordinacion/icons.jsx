// Iconos LOCALES de Coordinación (misma familia que components/icons.jsx:
// estilo Lucide, trazo 1.8, currentColor). No se toca el set global.

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

export const IconList = (p) => (<S {...p}><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></S>);
export const IconGauge = (p) => (<S {...p}><path d="M12 15 8.5 9.5" /><path d="M20.5 14a8.5 8.5 0 1 0-17 0" /><path d="M4 19h16" /></S>);
export const IconEuro = (p) => (<S {...p}><path d="M18 6.5A7 7 0 0 0 7 12a7 7 0 0 0 11 5.5" /><path d="M4 10.5h9M4 13.5h8" /></S>);
export const IconUsers = (p) => (<S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" /><path d="M16 5a3.5 3.5 0 0 1 0 6.5" /><path d="M18.5 15.5c1.7.8 2.7 2.3 3 4.5" /></S>);
export const IconWallet = (p) => (<S {...p}><path d="M20 7H5a2 2 0 0 1-2-2 2 2 0 0 1 2-2h13v4" /><path d="M3 5v13a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1" /><path d="M16 13.5h.01" /></S>);
export const IconReceipt = (p) => (<S {...p}><path d="M5 2h14v20l-2.5-1.6L14 22l-2-1.4L10 22l-2.5-1.6L5 22Z" /><path d="M9 7h6M9 11h6M9 15h4" /></S>);
export const IconStar = (p) => (<S {...p}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" /></S>);
export const IconReload = (p) => (<S {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></S>);
export const IconPlus = (p) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const IconX = (p) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>);
export const IconBack = (p) => (<S {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></S>);
export const IconEye = (p) => (<S {...p}><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></S>);
export const IconExternal = (p) => (<S {...p}><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" /></S>);
export const IconAlert = (p) => (<S {...p}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5h.01" /></S>);
