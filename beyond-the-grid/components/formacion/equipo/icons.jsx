// Iconos LOCALES de la vista de equipo (misma familia que components/icons.jsx:
// estilo Lucide, trazo 1.8, currentColor). Regla del proyecto: los iconos nuevos
// de esta ruta viven aquí — components/icons.jsx no se toca.

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

export const IconUsers = (p) => (
  <S {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6" />
    <path d="M18.5 14.6c1.9 1 3 2.9 3 5.4" />
  </S>
);

export const IconAlert = (p) => (
  <S {...p}>
    <path d="M12 3 2.5 19.5h19L12 3Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2v.1" />
  </S>
);

export const IconBack = (p) => (
  <S {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </S>
);
