// Iconos locales de la ruta /comidas (misma familia que components/icons.jsx:
// estilo Lucide, trazo 1.8, currentColor). Locales para no tocar el set global.

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

/* Comer fuera (cubiertos cruzados) */
export const IconPlato = (p) => (<S {...p}><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" /><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" /><path d="m2.1 21.8 6.4-6.3" /></S>);
/* Taper / Glovo (paquete) */
export const IconTaper = (p) => (<S {...p}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /></S>);
/* No estoy (casa) */
export const IconCasa = (p) => (<S {...p}><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></S>);
/* Voto flexible (estrella) */
export const IconEstrella = (p) => (<S {...p}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" /></S>);
/* Ver carta (documento) */
export const IconCarta = (p) => (<S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></S>);
/* Descripción (libro abierto) */
export const IconLibro = (p) => (<S {...p}><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2Z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7Z" /></S>);
/* Cerrar */
export const IconCerrar = (p) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>);
/* Histórico (reloj con flecha) */
export const IconHistorial = (p) => (<S {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></S>);
/* Esta semana (calendario) */
export const IconSemana = (p) => (<S {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></S>);
/* Enviar voto */
export const IconEnviar = (p) => (<S {...p}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></S>);
/* Volver al hub */
export const IconVolver = (p) => (<S {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></S>);
/* Enlace externo (carta en pestaña nueva) */
export const IconExterno = (p) => (<S {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></S>);
/* Aviso (triángulo) */
export const IconAviso = (p) => (<S {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></S>);
