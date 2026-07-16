// Helpers puros del catálogo Properties GSProcess (510 ficheros .properties).
// Los datos viven en public/recursos/properties-data.json y se cargan en
// cliente (~960 KB): aquí se preparan índices en minúsculas UNA vez para que
// la búsqueda multi-campo (incluido el contenido raw) sea instantánea.
import { PALETTE } from "@/lib/palette";

export const ACCENT = PALETTE.canary; // acento de esta página
export const DATA_URL = "/team-hub/recursos/properties-data.json";

/* javas/scripts/workflows llegan como "A.jar; B.jar" (a veces con comas);
   variablesGlobales usa " | " como separador. */
export const splitMulti = (s) =>
  s ? s.split(/[;,]/).map((t) => t.trim()).filter(Boolean) : [];
export const splitVars = (s) =>
  s ? s.split(" | ").map((t) => t.trim()).filter(Boolean) : [];

/* Campos consultados por la búsqueda rápida, en orden de prioridad. El label
   explica POR QUÉ matchea un resultado cuando no es por nombre de fichero. */
export const MATCH_FIELDS = [
  { key: "fichero", label: null },
  { key: "businessFeed", label: "en feed" },
  { key: "messageType", label: "en messageType" },
  { key: "javas", label: "en JARs" },
  { key: "scripts", label: "en scripts" },
  { key: "workflows", label: "en workflows" },
  { key: "variablesGlobales", label: "en variables" },
  { key: "raw", label: "en contenido" },
];

/* Prepara el dataset tras el fetch: id estable + copia en minúsculas de los
   campos buscables (evita toLowerCase() de 960 KB en cada pulsación). */
export function prepare(data) {
  return data.map((p, i) => ({
    ...p,
    id: i,
    low: Object.fromEntries(MATCH_FIELDS.map(({ key }) => [key, (p[key] || "").toLowerCase()])),
  }));
}

/* Línea completa del texto original alrededor de la posición `idx`. */
function lineAt(text, idx) {
  const start = text.lastIndexOf("\n", idx) + 1;
  const end = text.indexOf("\n", idx);
  return text.slice(start, end === -1 ? text.length : end).trim();
}

/* Primer campo (en orden de prioridad) que contiene la query. Devuelve
   { priority, label, snippet } o null. snippet = la línea/valor que coincide,
   para resaltarla en la lista cuando el match no es por nombre. */
export function matchItem(item, q) {
  for (let pr = 0; pr < MATCH_FIELDS.length; pr++) {
    const { key, label } = MATCH_FIELDS[pr];
    const idx = item.low[key].indexOf(q);
    if (idx === -1) continue;
    let snippet = null;
    if (key === "raw") snippet = lineAt(item.raw, idx);
    else if (key !== "fichero") snippet = lineAt(item[key] || "", idx);
    return { priority: pr, label, snippet };
  }
  return null;
}

/* ── Estadísticas de cabecera ── */
export function computeStats(data) {
  const feeds = new Set(data.map((p) => p.businessFeed).filter(Boolean));
  return {
    total: data.length,
    conFlujo: data.filter((p) => p.flujoEjecucion).length,
    feeds: feeds.size,
    vacios: data.filter((p) => !p.raw).length,
  };
}

/* Los ~8 businessFeed más frecuentes (no vacíos) para los chips de filtro. */
export const OTHER_FEEDS = "__otros__";
export function topFeeds(data, n = 8) {
  const counts = new Map();
  data.forEach((p) => {
    if (p.businessFeed) counts.set(p.businessFeed, (counts.get(p.businessFeed) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

/* Definición de los toggles de flags (colores alineados con el explorer). */
export const FLAG_DEFS = [
  { k: "mdx", label: "MDX", hex: PALETTE.purple },
  { k: "errores", label: "Errores", hex: "#FB7185" },
  { k: "reporte", label: "Reporte", hex: PALETTE.canary },
  { k: "difusion", label: "Difusión", hex: PALETTE.mandarin },
  { k: "publish", label: "Publish", hex: PALETTE.lime },
];

/* Filtros combinables (chips de feed + flags AND + con/sin flujo). */
export function passesFilters(p, { feed, flags, flujo }, topSet) {
  if (feed) {
    if (feed === OTHER_FEEDS) {
      if (!p.businessFeed || topSet.has(p.businessFeed)) return false;
    } else if (p.businessFeed !== feed) return false;
  }
  for (const f of FLAG_DEFS) if (flags[f.k] && !p.flags[f.k]) return false;
  if (flujo === "con" && !p.flujoEjecucion) return false;
  if (flujo === "sin" && p.flujoEjecucion) return false;
  return true;
}
