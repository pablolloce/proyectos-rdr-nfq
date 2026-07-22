// lib/nav.js — FUENTE ÚNICA de la navegación del sitio.
//
// Aquí vive el modelo que antes estaba incrustado en BentoHub (SECTIONS /
// COORD_SECTION) más las sub-páginas anidadas (Recursos desde lib/recursos.js
// y /formacion/equipo). Lo consumen:
//   - components/hub/BentoHub.jsx      → hubSections()   (misma UI del hub)
//   - components/chrome/Header.jsx     → menuSections() + trailFor() + activeSectionId()
//   - components/chrome/CommandPalette → pagesFor()
//   - app/not-found.jsx                → menuSections()
//
// Tipos de acción (idénticos a los del hub):
//   route → ruta Next interna (Link / router.push)
//   page  → HTML estático de public/ (href con basePath /team-hub)
//   open  → enlace externo resuelto vía links.json (useLinks().getUrl)
//   copy  → copiar URL al portapapeles. EXCLUSIVO del hub: nunca aparece en
//           menús ni en la paleta (un menú que "copia" en vez de navegar
//           confunde; en el hub la tarjeta lo comunica con su icono).
import { PALETTE } from "./palette";
import { RECURSOS } from "./recursos";
import { PROGRESO_EQUIPO } from "./formaciones";
import {
  IconBook, IconLink, IconUtensils, IconCalendar, IconRefresh, IconClock,
  IconRocket, IconCode, IconFolder, IconShield, IconGrad, IconUsers,
} from "@/components/icons";

/* ── Páginas (descriptores compartidos: hub, menús, migas y paleta) ──────
   crumb: etiqueta corta para las migas (si difiere del label).
   sub:   subtítulo del header cuando la página es el nivel actual.        */
const PAGES = {
  formacion: {
    label: "HUB Formativo", crumb: "Formación", sub: "Ruta formativa · niveles 00–06",
    desc: "Ruta por niveles 00–06", icon: IconGrad, action: "route", target: "/formacion",
  },
  progresoEquipo: {
    label: "Progreso del equipo", sub: "Formaciones del equipo",
    desc: "Formaciones completadas por el equipo", icon: IconUsers, action: "route", target: PROGRESO_EQUIPO,
  },
  queEsRdr: {
    label: "¿Qué es RDR?", sub: "¿Qué es RDR? · Introducción",
    desc: "Presentación de introducción", icon: IconBook, action: "route", target: "/que-es-rdr",
  },
  comidas: {
    label: "Comidas", sub: "Comidas del equipo",
    desc: "Restaurante de los jueves", icon: IconUtensils, action: "route", target: "/comidas",
  },
  vacaciones: {
    label: "Vacaciones", sub: "Vacaciones del equipo",
    desc: "Calendario y política", icon: IconCalendar, action: "route", target: "/vacaciones",
  },
  retro: {
    label: "Retrospectiva", sub: "Retrospectivas del equipo",
    desc: "Retros y mejoras", icon: IconRefresh, action: "route", target: "/retro",
  },
  pases: {
    label: "Pases Calendados", sub: "Pases calendados · Releases",
    desc: "Releases por entorno", icon: IconRocket, action: "route", target: "/pases",
  },
  recursos: {
    label: "Recursos", sub: "Recursos · Biblioteca RDR",
    desc: "Biblioteca de referencia RDR", icon: IconBook, action: "route", target: "/recursos",
  },
  control: {
    label: "Control RDR", sub: "Control económico · Coordinación",
    desc: "Control económico", icon: IconShield, action: "route", target: "/control",
  },
};

/* Sub-páginas de Recursos: derivadas del catálogo (lib/recursos.js) para que
   añadir un recurso allí lo publique también en menús, migas y paleta. */
const RECURSOS_CHILDREN = RECURSOS.map((r) => ({
  label: r.titulo,
  desc: r.desc,
  icon: IconBook,
  action: r.tipo === "route" ? "route" : "page",
  target: r.href,
  color: r.color,
}));

/* ── Modelo del HUB (idéntico en colores/orden/acciones al BentoHub previo).
   Los items "copy" y las tarjetas multi-acción viven SOLO aquí. ─────────── */
export const HUB_SECTIONS = [
  {
    id: "form", n: "01", title: "Formación", color: PALETTE.serene,
    items: [
      { ...PAGES.formacion, kind: "feature", children: [PAGES.progresoEquipo] },
      PAGES.queEsRdr,
      { label: "Portal BBVA CIB", desc: "Portal corporativo del equipo", icon: IconLink, action: "copy", target: "portalBBVACIB" },
    ],
  },
  {
    id: "equipo", n: "02", title: "Equipo", color: PALETTE.mandarin,
    items: [
      PAGES.comidas,
      PAGES.vacaciones,
      PAGES.retro,
      { label: "Time Report", desc: "Imputación de horas", icon: IconClock, actions: [
        { label: "NFQ", action: "open", target: "timeReportNFQ" },
        { label: "BBVA", action: "copy", target: "timeReportBBVA" },
      ] },
    ],
  },
  {
    id: "proy", n: "03", title: "Proyectos", color: PALETTE.lime,
    items: [
      PAGES.pases,
      { ...PAGES.recursos, children: RECURSOS_CHILDREN },
      { label: "Planificación", desc: "Hoja de planificación", icon: IconCalendar, action: "open", target: "planificacionNFQ" },
      { label: "Repositorio", desc: "Código y documentación", icon: IconFolder, actions: [
        { label: "GitHub", action: "copy", target: "githubBBVA", icon: IconCode },
        { label: "Drive", action: "copy", target: "driveBBVA", icon: IconFolder },
      ] },
    ],
  },
];

export const COORD_SECTION = {
  id: "coord", n: "04", title: "Coordinación", color: PALETTE.purple,
  items: [PAGES.control],
};

/** Secciones del hub (columnas bento). Coordinación solo para coordinadores. */
export function hubSections(isCoordinador) {
  return isCoordinador ? [...HUB_SECTIONS, COORD_SECTION] : HUB_SECTIONS;
}

/* ── Modelo de MENÚS (Header desktop, sheet móvil, 404) ──────────────────
   Recursos se promociona a sección propia (tiene sub-hub + 3 herramientas:
   pesa más como destino de navegación que como un item más de Proyectos).
   Sin items "copy"; de las tarjetas multi-acción solo sobreviven las
   acciones navegables (Time Report · NFQ). */
export function menuSections(isCoordinador) {
  const secs = [
    {
      id: "form", title: "Formación", color: PALETTE.serene,
      items: [PAGES.formacion, PAGES.progresoEquipo, PAGES.queEsRdr],
    },
    {
      id: "equipo", title: "Equipo", color: PALETTE.mandarin,
      items: [
        PAGES.comidas,
        PAGES.vacaciones,
        PAGES.retro,
        { label: "Time Report · NFQ", desc: "Imputación de horas", icon: IconClock, action: "open", target: "timeReportNFQ" },
      ],
    },
    {
      id: "proy", title: "Proyectos", color: PALETTE.lime,
      items: [
        PAGES.pases,
        { label: "Planificación", desc: "Hoja de planificación", icon: IconCalendar, action: "open", target: "planificacionNFQ" },
      ],
    },
    {
      id: "recursos", title: "Recursos", color: PALETTE.aqua,
      items: [PAGES.recursos, ...RECURSOS_CHILDREN],
    },
  ];
  if (isCoordinador) secs.push({ id: "coord", title: "Coordinación", color: PALETTE.purple, items: [PAGES.control] });
  return secs;
}

/* ── Índice de rutas internas (para migas y sección activa) ────────────── */
const ROUTE_INDEX = (() => {
  const out = [];
  for (const sec of menuSections(true)) {
    for (const it of sec.items) {
      if (it.action === "route") out.push({ ...it, sectionId: sec.id, sectionColor: sec.color });
    }
  }
  // Más profundo primero: la coincidencia más específica gana.
  return out.sort((a, b) => b.target.length - a.target.length);
})();

const matches = (pathname, target) =>
  pathname === target || pathname.startsWith(target + "/");

/** Página de ROUTE_INDEX que corresponde a una pathname (o null). */
export function pageFor(pathname) {
  const p = pathname || "/";
  if (p === "/") return null;
  return ROUTE_INDEX.find((pg) => matches(p, pg.target)) || null;
}

/** Id de la sección de menús activa para una pathname (o null en la raíz). */
export function activeSectionId(pathname) {
  const page = pageFor(pathname);
  return page ? page.sectionId : null;
}

/**
 * Migas para el header. Devuelve null en la raíz (se mantiene el subtítulo
 * del hub). Para rutas anidadas encadena los ancestros por prefijo de ruta:
 *   /recursos/procesos → [{Recursos, href:/recursos}, {Process Explorer}]
 *   /formacion/equipo  → [{Formación, href:/formacion}, {Progreso del equipo}]
 * Para páginas de primer nivel devuelve una sola miga (el header muestra
 * entonces su `sub` como subtítulo descriptivo).
 */
export function trailFor(pathname) {
  const page = pageFor(pathname);
  if (!page) return null;
  const chain = [page];
  let cur = page;
  for (;;) {
    const parent = ROUTE_INDEX.find(
      (pg) => pg.target !== cur.target && matches(cur.target, pg.target)
    );
    if (!parent) break;
    chain.unshift(parent);
    cur = parent;
  }
  return chain.map((pg, i) => ({
    label: i < chain.length - 1 ? pg.crumb || pg.label : pg.label,
    href: i < chain.length - 1 ? pg.target : null,
    sub: pg.sub || pg.desc,
    color: pg.sectionColor,
  }));
}

/** Todas las páginas navegables (route/page/open) para la paleta de comandos. */
export function pagesFor(isCoordinador) {
  const out = [
    { label: "Inicio", desc: "Hub de documentación", icon: IconGrad, action: "route", target: "/", section: "Hub", sectionColor: PALETTE.serene },
  ];
  for (const sec of menuSections(isCoordinador)) {
    for (const it of sec.items) {
      out.push({ ...it, section: sec.title, sectionColor: sec.color });
    }
  }
  return out;
}
