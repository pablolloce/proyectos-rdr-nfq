// Lógica PURA del Mapa de flujos: índices de cruce entre procesos, resolución
// de conexiones ("viajar") y construcción de grafos {nodes, edges} para React
// Flow con un layout determinista por columnas (sin dagre).
//
// Un "proceso" se identifica como { kind: 'chain'|'online', id }:
//   - chain   → nombre de la cadena en data.chains (excepto SIN_CADENA)
//   - online  → índice en data.online (los listeners; en data.chains viven
//               duplicados dentro de la pseudo-cadena SIN_CADENA)
// La publicación NO es un proceso viajable: es una acción del proceso. Lo
// único que se dibuja de ella es su resultado — la(s) cola(s) destino en las
// La publicación no se dibuja en el mapa (es una acción del proceso, y su
// resultado "Publica en <cola>" vive en la ficha del Process Explorer).
//
// Conexiones entre procesos (campos cruzados):
//   1. Workflows compartidos: data.wfPublish[WORKFLOW_GS] = pasos (NOMBRE) que
//      lo invocan → se resuelven a cadenas (índice NOMBRE→cadena) o a
//      listeners (NOMBRE→índice online cuando el paso vive en SIN_CADENA).
//   2. Cola JMS de un listener → otros listeners que escuchan la misma cola.
import { C, stepColor, splitWf } from "../explorer/lib";

export const SIN_CADENA = "SIN_CADENA";

/* Layout: columnas fijas en X (secuencia), abanicos verticales en Y. */
export const NODE_W = 232;
const COL = 300;
const ROW = 104;
const FAN_Y = 150;
const MAX_FAN = 6; // sub-workflows visibles por paso antes del nodo "+n más"

export const procKey = (p) => `${p.kind}:${p.id}`;
export const sameProc = (a, b) => !!a && !!b && a.kind === b.kind && String(a.id) === String(b.id);

/* Color de acento por familia de proceso (chips del rastro, selector). */
export const PROC_HEX = { chain: C.serene, online: C.canary };
export const PROC_LABEL = { chain: "Batch", online: "Online" };

export function procLabel(data, p) {
  if (p.kind === "chain") return (data.chainsMeta || {})[p.id]?.natural || p.id;
  const e = data.online[p.id];
  return e ? e.NOMBRE_NATURAL || e.NOMBRE : `#${p.id}`;
}

/* ── Índices de cruce (se construyen una vez por dataset) ──────────────── */
export function buildIndexes(data) {
  // Paso (NOMBRE) → cadenas reales que lo contienen.
  const stepToChains = new Map();
  for (const [name, steps] of Object.entries(data.chains || {})) {
    if (name === SIN_CADENA) continue;
    for (const s of steps) {
      if (!s.NOMBRE) continue;
      const arr = stepToChains.get(s.NOMBRE) || [];
      if (!arr.includes(name)) arr.push(name);
      stepToChains.set(s.NOMBRE, arr);
    }
  }
  // Listener por NOMBRE (primera ocurrencia) y por cola de escucha.
  const onlineByName = new Map();
  const onlineByQueue = new Map();
  (data.online || []).forEach((e, i) => {
    if (e.NOMBRE && !onlineByName.has(e.NOMBRE)) onlineByName.set(e.NOMBRE, i);
    if (e.COLA_ESCUCHA) {
      const arr = onlineByQueue.get(e.COLA_ESCUCHA) || [];
      arr.push(i);
      onlineByQueue.set(e.COLA_ESCUCHA, arr);
    }
  });
  return { stepToChains, onlineByName, onlineByQueue };
}

/* ── Resolución de destinos de viaje ───────────────────────────────────── */

/* Procesos (≠ current) que también invocan el workflow `wf`, vía wfPublish. */
export function wfConsumers(data, idx, wf, current) {
  const callers = (data.wfPublish || {})[wf] || [];
  const out = [];
  const seen = new Set();
  for (const caller of new Set(callers)) {
    const chains = idx.stepToChains.get(caller) || [];
    for (const cn of chains) {
      const t = { kind: "chain", id: cn };
      const k = procKey(t);
      if (seen.has(k) || sameProc(current, t)) continue;
      seen.add(k);
      out.push({ ...t, label: procLabel(data, t), via: caller });
    }
    if (!chains.length) {
      const oi = idx.onlineByName.get(caller);
      if (oi == null) continue;
      const t = { kind: "online", id: oi };
      const k = procKey(t);
      if (seen.has(k) || sameProc(current, t)) continue;
      seen.add(k);
      out.push({ ...t, label: procLabel(data, t), via: "listener" });
    }
  }
  return out;
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Listeners que escuchan la cola `queue` ({env} actúa de comodín). */
export function queueListeners(data, idx, queue, current) {
  let ids = idx.onlineByQueue.get(queue) || [];
  if (!ids.length && queue.includes("{env}")) {
    const re = new RegExp("^" + queue.split("{env}").map(escRe).join("[^.]+") + "$");
    ids = [];
    (data.online || []).forEach((e, i) => {
      if (e.COLA_ESCUCHA && re.test(e.COLA_ESCUCHA)) ids.push(i);
    });
  }
  return ids
    .map((i) => ({ kind: "online", id: i }))
    .filter((t) => !sameProc(current, t))
    .map((t) => ({ ...t, label: procLabel(data, t), via: queue }));
}

/* ── Factories de nodos/edges React Flow ───────────────────────────────── */
const node = (id, x, y, data) => ({
  id,
  type: "proc",
  position: { x, y },
  data,
  // Ancho fijo → el layout por columnas es predecible.
  style: { width: NODE_W },
});

// kind del edge: 'seq' (camino secuencial, animado), 'fan' (detalle bajo un
// paso), 'travel' (salto hacia otro proceso). Los handles fijan la geometría:
// secuencia por los lados (r→l), abanico por arriba/abajo (b→t).
const edge = (source, target, kind = "seq") => ({
  id: `e:${source}->${target}`,
  source,
  target,
  sourceHandle: kind === "fan" ? "b" : "r",
  targetHandle: kind === "fan" ? "t" : "l",
  data: { kind },
});

const splitSubs = (s) => (s ? s.split(" > ").map((x) => x.trim()).filter(Boolean) : []);
const splitCsv = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

/* Abanico de detalle bajo un paso/listener: workflow (+sub-workflows en
   cadena), JARs, scripts, cola JMS, eventos Raise del contenido WF. */
function fanForStep({ nodes, edges, data, idx, current, ownerId, x, s }) {
  let y = FAN_Y;
  let anchor = ownerId; // de dónde cuelgan los sub-workflows

  if (s.WORKFLOW_GS) {
    const wid = `${ownerId}-wf`;
    nodes.push(
      node(wid, x, y, {
        kind: "workflow",
        hex: C.purple,
        title: s.WORKFLOW_GS,
        badge: "Workflow",
        follow: wfConsumers(data, idx, s.WORKFLOW_GS, current),
        payload: { wf: s.WORKFLOW_GS, contenido: s.CONTENIDO_WF, step: s },
      })
    );
    edges.push(edge(ownerId, wid, "fan"));
    anchor = wid;
    y += ROW;
  }

  const subs = splitSubs(s.SUB_WORKFLOWS);
  subs.slice(0, MAX_FAN).forEach((sw, j) => {
    const sid = `${ownerId}-sw${j}`;
    nodes.push(
      node(sid, x, y, {
        kind: "subwf",
        hex: C.purple,
        dim: true,
        title: sw,
        badge: "Sub-WF",
        follow: wfConsumers(data, idx, sw, current),
        payload: { wf: sw, step: s },
      })
    );
    edges.push(edge(anchor, sid, "fan"));
    anchor = sid;
    y += ROW;
  });
  if (subs.length > MAX_FAN) {
    const sid = `${ownerId}-swmas`;
    nodes.push(
      node(sid, x, y, {
        kind: "subwf",
        hex: C.purple,
        dim: true,
        title: `+${subs.length - MAX_FAN} sub-workflows más`,
        payload: { lista: subs.slice(MAX_FAN), step: s },
      })
    );
    edges.push(edge(anchor, sid, "fan"));
    y += ROW;
  }

  if (s.JAVAS) {
    const jid = `${ownerId}-jar`;
    const jars = splitCsv(s.JAVAS);
    nodes.push(
      node(jid, x, y, {
        kind: "jars",
        hex: C.lime,
        title: jars.length === 1 ? jars[0] : `${jars.length} JARs`,
        badge: "Java",
        payload: { jars, step: s },
      })
    );
    edges.push(edge(ownerId, jid, "fan"));
    y += ROW;
  }
  if (s.SCRIPTS) {
    const scid = `${ownerId}-sh`;
    const scripts = splitCsv(s.SCRIPTS);
    nodes.push(
      node(scid, x, y, {
        kind: "scripts",
        hex: C.canary,
        title: scripts.length === 1 ? scripts[0] : `${scripts.length} scripts`,
        badge: "Script",
        payload: { scripts, step: s },
      })
    );
    edges.push(edge(ownerId, scid, "fan"));
    y += ROW;
  }
  if (s.COLA_JMS) {
    const qid = `${ownerId}-q`;
    nodes.push(
      node(qid, x, y, {
        kind: "cola",
        hex: C.mandarin,
        title: s.COLA_JMS,
        badge: "Cola JMS",
        follow: queueListeners(data, idx, s.COLA_JMS, current),
        payload: { cola: s.COLA_JMS, step: s },
      })
    );
    edges.push(edge(ownerId, qid, "fan"));
    y += ROW;
  }
  // Raise-Event / JMS dentro del contenido del workflow → nodo evento.
  const raises = s.CONTENIDO_WF && s.CONTENIDO_WF !== "Dummy/Empty"
    ? splitWf(s.CONTENIDO_WF).filter((t) => /^RaiseEvent\(|^JMS\(/.test(t))
    : [];
  raises.forEach((t, j) => {
    const eid = `${ownerId}-ev${j}`;
    nodes.push(
      node(eid, x, y, {
        kind: "evento",
        hex: C.serene,
        title: t,
        badge: "Raise-Event",
        payload: { evento: t, step: s },
      })
    );
    edges.push(edge(anchor, eid, "fan"));
    y += ROW;
  });
  return y;
}

/* ── Grafo de una cadena batch ─────────────────────────────────────────── */
function chainGraph(data, idx, name) {
  const steps = data.chains[name] || [];
  const current = { kind: "chain", id: name };
  const nodes = [];
  const edges = [];

  nodes.push(
    node("start", 0, 0, {
      kind: "inicio",
      hex: C.serene,
      title: "Control-M",
      badge: "Planificador",
      sub: name,
      payload: { cadena: name, meta: (data.chainsMeta || {})[name] },
    })
  );

  let prev = "start";
  steps.forEach((s, i) => {
    const id = `p${i}`;
    const x = (i + 1) * COL;
    const tipo = s.TIPO_EJECUCION || "Job";
    nodes.push(
      node(id, x, 0, {
        kind: "paso",
        hex: stepColor(tipo),
        num: i + 1,
        title: s.NOMBRE || `Paso ${i + 1}`,
        badge: tipo,
        sub: s.SCRIPT_O_EJECUTABLE
          ? `${s.SCRIPT_O_EJECUTABLE}${s.PARAMETRO ? ` → ${s.PARAMETRO}` : ""}`
          : s.PARAMETRO || "",
        payload: { step: s },
      })
    );
    edges.push(edge(prev, id, "seq"));
    prev = id;
    fanForStep({ nodes, edges, data, idx, current, ownerId: id, x, s });
  });

  // La publicación NO se dibuja en el mapa: es una acción del proceso, y su
  // resultado ("Publica en <cola>") vive en la ficha del Process Explorer.
  return { nodes, edges };
}

/* ── Grafo de un listener online ───────────────────────────────────────── */
function onlineGraph(data, idx, i) {
  const e = data.online[i] || {};
  const current = { kind: "online", id: i };
  const nodes = [];
  const edges = [];

  // Origen: cola JMS escuchada o evento GS que lo dispara.
  if (e.COLA_ESCUCHA) {
    nodes.push(
      node("start", 0, 0, {
        kind: "cola",
        hex: C.mandarin,
        title: e.COLA_ESCUCHA,
        badge: "Cola de escucha",
        sub: e.CLASE_EVENTO || "",
        follow: queueListeners(data, idx, e.COLA_ESCUCHA, current),
        payload: { cola: e.COLA_ESCUCHA, ev: e },
      })
    );
  } else {
    nodes.push(
      node("start", 0, 0, {
        kind: "evento",
        hex: C.serene,
        title: e.EVENTO_GS || e.NOMBRE || "Evento",
        badge: e.CLASE_EVENTO || "Evento GS",
        sub: e.TIPO_ENTRADA || "",
        payload: { evento: e.EVENTO_GS, ev: e },
      })
    );
  }

  nodes.push(
    node("lst", COL, 0, {
      kind: "listener",
      hex: C.canary,
      title: e.NOMBRE || `Listener #${i}`,
      badge: "Listener",
      sub: e.PARAMETRO || "",
      payload: { ev: e },
    })
  );
  edges.push(edge("start", "lst", "seq"));

  let prev = "lst";
  let x = 2 * COL;
  if (e.WORKFLOW_GS) {
    nodes.push(
      node("wf", x, 0, {
        kind: "workflow",
        hex: C.purple,
        dim: e.WORKFLOW_GS === "Missing",
        title: e.WORKFLOW_GS,
        badge: "Workflow",
        follow: wfConsumers(data, idx, e.WORKFLOW_GS, current),
        payload: { wf: e.WORKFLOW_GS, contenido: e.CONTENIDO_WF, step: e },
      })
    );
    edges.push(edge(prev, "wf", "seq"));
    prev = "wf";
    x += COL;

    // Raise-Event/JMS del contenido → abanico bajo el workflow.
    const raises = e.CONTENIDO_WF && e.CONTENIDO_WF !== "Dummy/Empty"
      ? splitWf(e.CONTENIDO_WF).filter((t) => /^RaiseEvent\(|^JMS\(/.test(t))
      : [];
    raises.forEach((t, j) => {
      const eid = `wf-ev${j}`;
      nodes.push(
        node(eid, x - COL, FAN_Y + j * ROW, {
          kind: "evento",
          hex: C.serene,
          title: t,
          badge: "Raise-Event",
          payload: { evento: t, ev: e },
        })
      );
      edges.push(edge("wf", eid, "fan"));
    });
  }

  // Sub-workflows: secuencia ordenada → siguen el eje horizontal.
  splitSubs(e.SUB_WORKFLOWS).forEach((sw, j) => {
    const sid = `sw${j}`;
    nodes.push(
      node(sid, x, 0, {
        kind: "subwf",
        hex: C.purple,
        title: sw,
        badge: "Sub-WF",
        follow: wfConsumers(data, idx, sw, current),
        payload: { wf: sw, step: e },
      })
    );
    edges.push(edge(prev, sid, "seq"));
    prev = sid;
    x += COL;
  });

  // Cola de salida (filas COLA_ASSEMBLY con COLA_JMS propia distinta).
  if (e.COLA_JMS && e.COLA_JMS !== e.COLA_ESCUCHA) {
    nodes.push(
      node("qout", x, 0, {
        kind: "cola",
        hex: C.mandarin,
        title: e.COLA_JMS,
        badge: "Cola de salida",
        follow: queueListeners(data, idx, e.COLA_JMS, current),
        payload: { cola: e.COLA_JMS, ev: e },
      })
    );
    edges.push(edge(prev, "qout", "seq"));
  }

  return { nodes, edges };
}

/* ── Deep links (#chain/…, #online/…, #proc/P-xxx; #publish/… legado) ──────
   El export es estático (GitHub Pages): la identidad del proceso viaja en el
   hash. El formato #proc/P-xxx enlaza desde el Process Explorer un proceso
   del INVENTARIO: se resuelve a su primera cadena real (batch) o a su primer
   listener (online) usando data.inventory. */

export function buildMapHash(data, p) {
  if (!p) return "#";
  if (p.kind === "chain") return `#chain/${encodeURIComponent(p.id)}`;
  const e = data.online[p.id];
  return e && e.NOMBRE ? `#online/${encodeURIComponent(e.NOMBRE)}` : "#";
}

const decodeSafe = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

export function parseMapHash(data, idx, hash) {
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return null;
  const i = raw.indexOf("/");
  if (i === -1) return null;
  const kind = raw.slice(0, i);
  const key = decodeSafe(raw.slice(i + 1));
  if (!key) return null;
  if (kind === "chain")
    return (data.chains || {})[key] && key !== SIN_CADENA ? { kind: "chain", id: key } : null;
  if (kind === "online") {
    const oi = idx.onlineByName.get(key);
    return oi != null ? { kind: "online", id: oi } : null;
  }
  if (kind === "publish") {
    // Legado: los publishers ya no son viajables — se abre la cadena caller,
    // cuyo flujo termina en la(s) cola(s) en las que publica.
    const pub = (data.publishing || []).find((p) => p.WORKFLOW === key);
    for (const c of (pub && pub.CALLERS) || []) {
      if ((data.chains || {})[c] && c !== SIN_CADENA) return { kind: "chain", id: c };
    }
    return null;
  }
  if (kind === "proc") {
    // P-xxx del inventario → primera cadena real, o primer listener online.
    const inv = (data.inventory || []).find((p) => p.ID === key);
    if (!inv) return null;
    for (const c of (inv.CADENAS_CONTROLM || "").split(",").map((s) => s.trim())) {
      if (c && (data.chains || {})[c] && c !== SIN_CADENA) return { kind: "chain", id: c };
    }
    for (const e of (inv.EVENTOS_JMS || "").split(",").map((s) => s.trim())) {
      const oi = e && idx.onlineByName.get(e);
      if (oi != null) return { kind: "online", id: oi };
    }
    return null;
  }
  return null;
}

/* ── Punto de entrada ──────────────────────────────────────────────────── */
export function buildGraph(data, idx, proc) {
  if (!data || !proc) return { nodes: [], edges: [] };
  if (proc.kind === "chain") return chainGraph(data, idx, proc.id);
  return onlineGraph(data, idx, proc.id);
}
