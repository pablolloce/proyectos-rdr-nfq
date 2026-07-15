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
