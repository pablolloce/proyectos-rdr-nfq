// Helpers puros del Process Explorer — lógica portada 1:1 del JS del HTML
// original (public/recursos/procesos-rdr-explorer.html) a funciones testables.
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

// JSON con la D del original (public/, con basePath de GitHub Pages).
export const DATA_URL = "/team-hub/recursos/procesos-rdr-data.json";

export const TABS = [
  { id: "batch", label: "Batch" },
  { id: "online", label: "Online" },
  { id: "publish", label: "Publish" },
  { id: "inv", label: "Inventario" },
];

/* cxCls() del original (ALTA/MEDIA/BAJA). El HTML original no definía CSS para
   sus clases cx-*; aquí sí se colorea, alineado con la leyenda 🔴🟡🟢 del mapa. */
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

/* ── Filtros de búsqueda: mismo alcance multi-campo que render() original ── */
const has = (v, q) => (v || "").toLowerCase().includes(q);

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

export const filterInv = (inventory, q) =>
  (inventory || []).map((p, i) => [p, i]).filter(([p]) =>
    !q ||
    [p.NOMBRE_NATURAL, p.DESCRIPCION, p.ENTIDADES, p.SISTEMAS_CONECTADOS, p.TECNOLOGIAS, p.CADENAS_CONTROLM, p.EVENTOS_JMS]
      .some((v) => has(v, q)));

/* ── Navegación por hash: identidad estable de cada proceso ──────────────────
   El export es ESTÁTICO (GitHub Pages, basePath /team-hub): sólo podemos usar
   el hash de la URL, nunca rutas/query nuevas. Formato:
     #<tab>                       (pestaña, sin proceso)
     #<tab>/<NOMBRE_encodeURIComponent>   (proceso concreto)
   El "NOMBRE" es un identificador estable por pestaña (no el índice del array):
   batch → nombre de cadena; online → NOMBRE; publish → WORKFLOW; inv → ID. */

export const TAB_IDS = TABS.map((t) => t.id);

export function buildHash(tab, key) {
  return key ? `#${tab}/${encodeURIComponent(key)}` : `#${tab}`;
}

export function parseHash(hash) {
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return null;
  const i = raw.indexOf("/");
  const tab = i === -1 ? raw : raw.slice(0, i);
  if (!TAB_IDS.includes(tab)) return null;
  let key = null;
  if (i !== -1) {
    try { key = decodeURIComponent(raw.slice(i + 1)); }
    catch { key = raw.slice(i + 1); }
  }
  return { tab, key };
}

/* id interno (chain name para batch, índice para el resto) → clave de hash. */
export function processKey(tab, data, id) {
  if (!data || id == null) return null;
  if (tab === "batch") return String(id);
  if (tab === "online") { const e = data.online[id]; return e ? e.NOMBRE || String(id) : null; }
  if (tab === "publish") { const p = data.publishing[id]; return p ? p.WORKFLOW || String(id) : null; }
  const p = data.inventory[id]; return p ? p.ID || p.NOMBRE_NATURAL || String(id) : null;
}

/* clave de hash → id interno (o null si no existe en los datos cargados). */
export function resolveKey(tab, data, key) {
  if (!data || key == null || key === "") return null;
  if (tab === "batch") return data.chains && data.chains[key] != null ? key : null;
  if (tab === "online") { const i = (data.online || []).findIndex((e) => e.NOMBRE === key); return i >= 0 ? i : null; }
  if (tab === "publish") { const i = (data.publishing || []).findIndex((p) => p.WORKFLOW === key); return i >= 0 ? i : null; }
  const i = (data.inventory || []).findIndex((p) => (p.ID || p.NOMBRE_NATURAL) === key); return i >= 0 ? i : null;
}

/* Etiqueta humana de un proceso (para filas de "Procesos relacionados"). */
export function processLabel(tab, data, id) {
  if (!data || id == null) return "";
  if (tab === "batch") return String(id);
  if (tab === "online") { const e = data.online[id] || {}; return e.NOMBRE_NATURAL || e.NOMBRE || `Online #${id}`; }
  if (tab === "publish") { const p = data.publishing[id] || {}; return p.WORKFLOW || p.NOMBRE_NATURAL || `Publisher #${id}`; }
  const p = data.inventory[id] || {}; return p.NOMBRE_NATURAL || p.ID || `Proceso #${id}`;
}

/* ── Índices de referencias cruzadas: workflow→procesos y cola JMS→procesos ──
   Se construyen UNA vez tras el fetch (buildRefIndex) a partir de los datos ya
   cargados; relatedProcesses() los usa para resolver "Procesos relacionados"
   sin recorrer todo el dataset en cada render. */

const REF_NOISE = new Set(["", "-", "missing", "dummy/empty", "n/a", "na", "none", "(sin cola identificada)"]);
const refClean = (v) => String(v == null ? "" : v).trim();
const refIsNoise = (v) => !v || REF_NOISE.has(v.toLowerCase());
const refSubs = (v) => (v ? String(v).split(/\s*>\s*/) : []);

/* Workflows y colas JMS asociados a un proceso, por pestaña. */
function refTokens(tab, item) {
  const wf = new Set();
  const q = new Set();
  const addWf = (v) => { const s = refClean(v); if (!refIsNoise(s)) wf.add(s); };
  const addQ = (v) => { const s = refClean(v); if (!refIsNoise(s)) q.add(s); };
  if (tab === "batch") {
    (item.steps || []).forEach((s) => { addWf(s.WORKFLOW_GS); refSubs(s.SUB_WORKFLOWS).forEach(addWf); addQ(s.COLA_JMS); });
  } else if (tab === "online") {
    addWf(item.WORKFLOW_GS); refSubs(item.SUB_WORKFLOWS).forEach(addWf); addQ(item.COLA_ESCUCHA); addQ(item.COLA_JMS);
  } else if (tab === "publish") {
    addWf(item.WORKFLOW); (item.QUEUES || []).forEach(addQ);
  } else {
    (item.EVENTOS_JMS || "").split(",").forEach(addQ);
  }
  return { wf: [...wf], q: [...q] };
}

function refItem(tab, data, id) {
  if (tab === "batch") return data.chains[id] ? { steps: data.chains[id] } : null;
  if (tab === "online") return data.online[id] || null;
  if (tab === "publish") return data.publishing[id] || null;
  return data.inventory[id] || null;
}

export function buildRefIndex(data) {
  const workflow = new Map();
  const queue = new Map();
  const add = (map, key, ref) => { const a = map.get(key); if (a) a.push(ref); else map.set(key, [ref]); };
  const feed = (tab, item, ref) => {
    const { wf, q } = refTokens(tab, item);
    wf.forEach((w) => add(workflow, w, ref));
    q.forEach((x) => add(queue, x, ref));
  };
  // "SIN_CADENA" no es una cadena real: es el contenedor de los listeners
  // online (las mismas filas que data.online). Incluirla haría que CADA listener
  // se "relacionara" con ella — ruido inútil. Se excluye del índice de refs.
  Object.keys(data.chains || {})
    .filter((n) => n !== "SIN_CADENA")
    .forEach((n) => feed("batch", { steps: data.chains[n] }, { tab: "batch", id: n }));
  (data.online || []).forEach((e, i) => feed("online", e, { tab: "online", id: i }));
  (data.publishing || []).forEach((p, i) => feed("publish", p, { tab: "publish", id: i }));
  (data.inventory || []).forEach((p, i) => feed("inv", p, { tab: "inv", id: i }));
  return { workflow, queue };
}

/* Procesos que comparten workflow o cola JMS con (tab, id). Devuelve
   { list: [{ tab, id, key, name, via, token }], extra } limitado a `limit`,
   ordenado por nº de coincidencias compartidas. */
export function relatedProcesses(data, index, tab, id, limit = 8) {
  const item = refItem(tab, data, id);
  if (!item || !index) return { list: [], extra: 0 };
  const { wf, q } = refTokens(tab, item);
  const selfKey = `${tab}:${id}`;
  const map = new Map();
  const consider = (refs, via, token) => {
    (refs || []).forEach((ref) => {
      const k = `${ref.tab}:${ref.id}`;
      if (k === selfKey) return;
      let e = map.get(k);
      if (!e) { e = { tab: ref.tab, id: ref.id, via: new Set(), tokens: new Set() }; map.set(k, e); }
      e.via.add(via); e.tokens.add(token);
    });
  };
  wf.forEach((w) => consider(index.workflow.get(w), "workflow", w));
  q.forEach((x) => consider(index.queue.get(x), "cola", x));
  const all = [...map.values()].sort((a, b) => b.tokens.size - a.tokens.size);
  const list = all.slice(0, limit).map((e) => ({
    tab: e.tab,
    id: e.id,
    key: processKey(e.tab, data, e.id),
    name: processLabel(e.tab, data, e.id),
    via: [...e.via],
    token: [...e.tokens][0] || "",
  }));
  return { list, extra: Math.max(0, all.length - limit) };
}
