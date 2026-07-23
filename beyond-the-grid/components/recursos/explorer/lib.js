// Helpers puros del Process Explorer.
//
// Desde la reestructuración de 2026-07, el EJE del explorador son los 91
// procesos del inventario (clasificacion-rdr.json, generado por
// scripts/build-clasificacion.py): se filtra por Batch/Online y por las 8
// categorías oficiales. Las cadenas, listeners y publicaciones NO son ejes:
// son información agregada dentro de cada proceso. Lo que no encaja en
// ningún proceso vive en el "cajón desastre".
//
// Los colores originales (cian/verde/ámbar/rosa/violeta) mapean a los acentos
// BBVA del sitio: serene/lime/canary/mandarin/purple. El rojo de errores no
// tiene equivalente en PALETTE y se mantiene (#FB7185, oscurecido en claro).
import { PALETTE } from "@/lib/palette";

export const RED = "#FB7185";
export const RED_LIGHT = "#BE123C"; // equivalente AA sobre Sand (modo claro)

export const C = {
  serene: PALETTE.serene, // cian original → batch / JMS / Java / eventos
  lime: PALETTE.lime, //     verde original → publish / scripts / commands
  canary: PALETTE.canary, // ámbar original → online / contenido WF / property
  mandarin: PALETTE.mandarin, // rosa original → colas
  purple: PALETTE.purple, // violeta original → workflows / sub-workflows / MDX
  aqua: PALETTE.aqua, //     acento de la sección Recursos
  red: RED, //               errores / workflows anidados / inactivos
};

// JSONs en public/ (con basePath de GitHub Pages). DATA es el dato técnico
// completo (cadenas paso a paso, listeners, publicaciones); CLASIF es el eje
// de 91 procesos con la clasificación oficial y el cajón desastre.
export const DATA_URL = "/team-hub/recursos/procesos-rdr-data.json";
export const CLASIF_URL = "/team-hub/recursos/clasificacion-rdr.json";

// id especial del cajón desastre en la lista/hash (no colisiona con "P-xxx").
export const CAJON_ID = "cajon";

// Filtro por eje (tipo de proceso).
export const EJES = [
  { id: "todos", label: "Todos" },
  { id: "BATCH", label: "Batch" },
  { id: "ONLINE", label: "Online" },
];

// Nombre corto de cada categoría oficial (para chips compactos de la lista).
export const CAT_SHORT = {
  extracciones: "Extracciones",
  cargadores: "Cargadores",
  "cargas-externas": "Cargas externas",
  conciliaciones: "Conciliaciones",
  gestion: "Gestión",
  "handler-esb": "Handler ESB",
  "alta-setup": "Alta/Setup",
  "recepcion-mq": "Recepción MQ",
};

/* cxCls() del original (ALTA/MEDIA/BAJA). */
export const cxColor = (cx) => (cx === "ALTA" ? C.red : cx === "MEDIA" ? C.canary : C.lime);

/* Color del nodo numerado del timeline según TIPO_EJECUCION (clases sn del
   original: gs/sh/fw; null = dummy/neutro). */
export const stepColor = (tipo) =>
  tipo === "GSProcess" ? C.serene : tipo === "Script" ? C.lime : tipo === "FileWatch" ? C.canary : null;

/* wfTags() del original: trocea CONTENIDO_WF (por → o por " | ") y clasifica
   cada parte en un estilo {hex, strong (con borde), dim (atenuado)}. */
export const splitWf = (s) => (s.includes("→") ? s.split(/\s*→\s*/) : s.split(" | "));

export function wfTagStyle(t) {
  if (t.startsWith("Java(")) return { hex: C.serene, strong: true }; // wt-j2
  if (t.startsWith("Script(")) return { hex: C.lime, strong: true }; // wt-s2
  if (t.startsWith("Workflow(")) return { hex: C.red }; // wt-e
  if (t.startsWith("MDX(") || t === "MDX") return { hex: C.purple, strong: true }; // wt-m
  if (t === "Errores") return { hex: C.red, dim: true }; // wt-err
  if (t === "Reporte") return { hex: C.canary, dim: true }; // wt-rpt
  if (t.startsWith("Property(")) return { hex: C.canary, strong: true }; // wt-p
  if (t.includes("DB")) return { hex: C.mandarin }; // wt-d
  if (t.includes("JMS")) return { hex: C.serene }; // wt-j
  if (t.includes("SubWF")) return { hex: C.purple }; // wt-s
  if (t.includes("Command")) return { hex: C.lime }; // wt-c
  if (t.includes("Raise") || t.includes("Event")) return { hex: C.red }; // wt-e
  return { hex: C.canary }; // wt-b (por defecto)
}

/* deriveQueues() — portada literal del original: colas JMS de destino
   derivadas de ENTIDADES × SISTEMAS_CONECTADOS de un publisher. */
const ENTITY_QUEUE_MAP = {
  FINS: "PARTY", CPTY: "PARTY", CNTC: "CONTACT", ISSU: "SECURITIES",
  SSIS: "SETTLEMENT", SCIS: "CONFIRMATIONS", LAGR: "AGREEMENT", ACCT: "PORTFOLIO",
  CADF: "CALENDAR", MKTD: "INDEX", FIGR: "SECURITIES", GUNT: "AGREEMENT", RTNG: "PARTY",
};
const SYSTEM_QUEUE_MAP = {
  Calypso: "KLYO", Murex: "KMUX.MX3_RDR", ESB: "KYRS", ABACO: "ABACO", CTM: "ECTM",
  Mentor: "MENTOR", SWIFT: "SWIFT", Bloomberg: "BBG", Refinitiv: "RFNTV", DATIO: "DATIO",
  DUCO: "DUCO", SMA: "SMA", Altamira: "ALTAMIRA", Genesis: "GENESIS",
};

export function deriveQueues(p) {
  const queues = [];
  const ents = (p.ENTIDADES || "").split(",").map((e) => e.trim()).filter(Boolean);
  const syss = (p.SISTEMAS_CONECTADOS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ents.length && !syss.length) return [{ queue: "(sin cola identificada)", entity: "-", system: "-" }];
  ents.forEach((ent) => {
    const qType = ENTITY_QUEUE_MAP[ent];
    if (!qType) return;
    const destSys = syss.length ? syss[0] : "ESB";
    const sysPrefix = SYSTEM_QUEUE_MAP[destSys] || "KYRS";
    let qName;
    if (sysPrefix === "KYRS") qName = "GLB.BBVA.GMA.{env}.KYRS.RDR." + qType + ".PUBLISH";
    else if (sysPrefix === "KLYO") qName = "GLB.BBVA.GMA.{env}.KLYO." + qType + ".PUBLISH";
    else qName = sysPrefix + "." + qType;
    if (!queues.some((x) => x.queue === qName)) queues.push({ queue: qName, entity: `${ent} → ${qType}`, system: destSys });
  });
  if (!queues.length && syss.length)
    syss.forEach((s) => queues.push({ queue: `${SYSTEM_QUEUE_MAP[s] || s}.*`, entity: ents.join(",") || "-", system: s }));
  return queues.length
    ? queues
    : [{ queue: "(sin cola identificada)", entity: ents.join(",") || "-", system: syss.join(",") || "-" }];
}

/* ── Filtros de búsqueda por colección (los usa el Selector del Mapa) ────── */
export function filterChains(chains, chainsMeta, q) {
  const names = Object.keys(chains);
  if (!q) return names;
  return names.filter((n) => {
    const m = (chainsMeta || {})[n] || {};
    return (
      n.toLowerCase().includes(q) ||
      has(m.natural, q) ||
      chains[n].some((x) => [x.PARAMETRO, x.JAVAS, x.SCRIPTS, x.WORKFLOW_GS, x.NOMBRE].some((v) => has(v, q)))
    );
  });
}

export const filterOnline = (online, q) =>
  (online || []).map((e, i) => [e, i]).filter(([e]) =>
    !q || has(e.NOMBRE, q) || has(e.WORKFLOW_GS, q) || has(e.COLA_ESCUCHA, q) || has(e.NOMBRE_NATURAL, q));

export const filterPublish = (publishing, q) =>
  (publishing || []).map((p, i) => [p, i]).filter(([p]) =>
    !q || has(p.WORKFLOW, q) || (p.QUEUES || []).some((x) => has(x, q)) || (p.CALLERS || []).some((x) => has(x, q)));

/* ── Índices sobre el dato técnico, calculados UNA vez tras el fetch ────────
   Permiten que cada proceso encuentre sus filas de datos sin recorrer todo
   el dataset en cada render. */
export function buildDataIndex(data) {
  const onlineByName = new Map(); // NOMBRE del listener → índice en data.online
  (data.online || []).forEach((e, i) => {
    if (e.NOMBRE) onlineByName.set(e.NOMBRE, i);
  });
  const publishByWf = new Map(); // WORKFLOW del publisher → índice en data.publishing
  (data.publishing || []).forEach((p, i) => {
    if (p.WORKFLOW && !publishByWf.has(p.WORKFLOW)) publishByWf.set(p.WORKFLOW, i);
  });
  const invById = new Map(); // "P-001" → item del inventario
  (data.inventory || []).forEach((p) => {
    if (p.ID) invById.set(p.ID, p);
  });
  return { onlineByName, publishByWf, invById };
}

/* Índices sobre la clasificación (procesos + traducción de claves antiguas). */
export function buildClasifIndex(clasif) {
  const byId = new Map();
  const chain2pid = new Map(); //   nombre de cadena → P-xxx
  const listener2pid = new Map(); // NOMBRE de listener → P-xxx
  const publish2pid = new Map(); // WORKFLOW de publicación → P-xxx
  (clasif.procesos || []).forEach((p) => {
    byId.set(p.id, p);
    (p.cadenas || []).forEach((c) => chain2pid.set(c, p.id));
    (p.listeners || []).forEach((l) => listener2pid.set(l, p.id));
    (p.publicacion || []).forEach((w) => publish2pid.set(w, p.id));
  });
  const catMap = Object.fromEntries((clasif.categorias || []).map((c) => [c.key, c]));
  return { byId, chain2pid, listener2pid, publish2pid, catMap };
}

/* ── Búsqueda multi-campo a nivel de PROCESO ────────────────────────────────
   Un proceso casa si el término aparece en su ficha (nombre, id, descripción,
   sistemas, entidades, tecnologías, JARs, categoría), en el NOMBRE de alguna
   de sus cadenas/listeners/publicaciones/colas, o en el CONTENIDO de los
   pasos de sus cadenas (parámetros, JARs, scripts, workflows). */
const has = (v, q) => (v || "").toLowerCase().includes(q);
const hasAny = (arr, q) => (arr || []).some((v) => has(v, q));

export function matchProceso(p, cat, data, q) {
  if (!q) return true;
  if (
    has(p.nombre, q) || has(p.id, q) || has(p.descripcion, q) ||
    has(p.colasDoc, q) || has(p.wikiRef, q) || has(p.complejidad, q) ||
    hasAny(p.sistemas, q) || hasAny(p.entidades, q) || hasAny(p.tecnologias, q) ||
    hasAny(p.javas, q) || hasAny(p.cadenas, q) || hasAny(p.listeners, q) ||
    hasAny(p.publicacion, q) || hasAny(p.colasInfra, q)
  )
    return true;
  if (cat && (has(cat.nombre, q) || has(CAT_SHORT[cat.key], q))) return true;
  // contenido de los pasos de sus cadenas y de sus listeners
  if (data) {
    for (const name of p.cadenas || []) {
      const steps = (data.chains || {})[name];
      if (
        steps &&
        steps.some((x) =>
          [x.NOMBRE, x.PARAMETRO, x.JAVAS, x.SCRIPTS, x.WORKFLOW_GS, x.SUB_WORKFLOWS, x.COLA_JMS].some((v) => has(v, q))
        )
      )
        return true;
    }
    if (p.listeners && p.listeners.length) {
      for (const e of data.online || []) {
        if (!p.listeners.includes(e.NOMBRE)) continue;
        if ([e.COLA_ESCUCHA, e.WORKFLOW_GS, e.SUB_WORKFLOWS, e.JAVAS].some((v) => has(v, q))) return true;
      }
    }
  }
  return false;
}

/* El cajón desastre casa si el término aparece en alguno de sus eventos o
   colas sin proceso asignado. */
export function matchCajon(cajon, q) {
  if (!q) return true;
  if (!cajon) return false;
  return (
    "cajón desastre".includes(q) || "cajon desastre".includes(q) ||
    (cajon.eventos || []).some((e) => has(e.nombre, q) || has(e.clase, q)) ||
    (cajon.colas || []).some((c) => has(c, q))
  );
}

/* ── Navegación por hash ────────────────────────────────────────────────────
   El export es ESTÁTICO (GitHub Pages, basePath /team-hub): sólo podemos usar
   el hash de la URL. Formato actual:
     #proc/P-013            → proceso
     #proc/P-013/<CADENA>   → proceso con esa cadena desplegada
     #cajon                 → cajón desastre
   RETROCOMPATIBILIDAD: los hashes del explorador anterior (#batch/<cadena>,
   #online/<NOMBRE>, #publish/<WORKFLOW>, #inv/<P-xxx>) se traducen al proceso
   dueño para que los enlaces ya compartidos sigan funcionando. */

export function buildHash(pid, sub) {
  if (!pid) return "#";
  if (pid === CAJON_ID) return "#cajon";
  return sub ? `#proc/${encodeURIComponent(pid)}/${encodeURIComponent(sub)}` : `#proc/${encodeURIComponent(pid)}`;
}

const dec = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

/* → { pid, sub } | null. Necesita los índices para traducir claves antiguas. */
export function parseHash(hash, clasifIndex) {
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return null;
  const parts = raw.split("/");
  const head = parts[0];
  if (head === "cajon") return { pid: CAJON_ID, sub: null };
  if (head === "proc") {
    const pid = parts[1] ? dec(parts[1]) : null;
    return pid ? { pid, sub: parts[2] ? dec(parts.slice(2).join("/")) : null } : null;
  }
  if (!clasifIndex) return null;
  const key = parts.length > 1 ? dec(parts.slice(1).join("/")) : null;
  if (head === "inv") return key && clasifIndex.byId.has(key) ? { pid: key, sub: null } : null;
  if (head === "batch" || head === "chain") {
    const pid = key && clasifIndex.chain2pid.get(key);
    return pid ? { pid, sub: key } : null;
  }
  if (head === "online") {
    const pid = key && clasifIndex.listener2pid.get(key);
    // Los "online" que no son listener de ningún proceso (eventos genéricos
    // de plataforma) viven en el cajón desastre.
    return pid ? { pid, sub: key } : key ? { pid: CAJON_ID, sub: null } : null;
  }
  if (head === "publish") {
    const pid = key && clasifIndex.publish2pid.get(key);
    return pid ? { pid, sub: key } : null;
  }
  return null;
}
