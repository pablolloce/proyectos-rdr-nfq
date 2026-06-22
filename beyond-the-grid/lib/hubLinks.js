/**
 * Links del hub que se convierten en las CARAS del objeto 3D del index.
 * - href: página interna (servida desde /public).
 * - key:  enlace externo cuya URL vive en links.json (se resuelve con useLinks).
 * - coord: solo visible para coordinadores.
 */
export const HUB_LINKS = [
  { name: "¿Qué es RDR?",     href: "que-es-rdr.html",      color: "#85C8FF" },
  { name: "HUB Formativo",    href: "rdr-formacion.html",   color: "#88E783" },
  { name: "Portal BBVA CIB",  key:  "portalBBVACIB",        color: "#F7F8F8" },
  { name: "Vacaciones",       href: "vacaciones.html",      color: "#8BE1E9" },
  { name: "Time Report",      key:  "timeReportNFQ",        color: "#9694FF" },
  { name: "Retrospectiva",    href: "retro.html",           color: "#FFB56B" },
  { name: "Comidas",          href: "comidas.html",         color: "#FFE761" },
  { name: "Planificación",    key:  "planificacionNFQ",     color: "#85C8FF" },
  { name: "Pases Calendados", href: "pases-calendados.html",color: "#FFE761" },
  { name: "Drive",            key:  "driveBBVA",            color: "#88E783" },
  { name: "GitHub",           key:  "githubBBVA",           color: "#8BE1E9" },
  { name: "Control RDR",      href: "control.html",         color: "#9694FF", coord: true },
];
