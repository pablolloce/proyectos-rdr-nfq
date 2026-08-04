/**
 * Unidades de MERGEO de la post-implantación.
 *
 * El mergeo no va por componente sino por unidad de repositorio:
 *   · Workstation (DP)            → 1 unidad "Mergear Workstation"
 *   · Paquete Custom (DP)         → 1 unidad "Mergear ObjetosGS"
 *   · Javas (DP)                  → 1 unidad POR CADA java
 *   · Estáticos (DP)              → 1 unidad "Mergear Estáticos"
 *   · Dependientes de entorno (DP)→ 1 unidad "Mergear Dependientes de entorno"
 * NO se mergean: DataX, API (NOVA), Aperiódicos, Directorios y Cadenas.
 *
 * Persistencia: cada unidad se apoya en el campo `mergeado` de sus
 * componentes en la hoja (marcar la unidad marca todas sus filas) — sin
 * cambios de modelo en el Excel ni en el Apps Script.
 */
import { isT } from "./backend";

const norm = (s) => String(s || "").toLowerCase();

/** ¿Componente de despliegue (código DP-KYTL)? Solo estos entran en mergeos. */
export const esDP = (c) => String(c.codigo || "").toUpperCase().includes("DP-KYTL");

/* Clasifica un componente DP en su unidad de mergeo. null = no se mergea. */
function grupoDe(c) {
  const s = norm(c.subida);
  const t = norm(c.tipo);
  // Nunca se mergean, tengan el código que tengan.
  if (t === "cadena" || t.startsWith("director")) return null;
  if (s === "nova" || s === "datax" || s.startsWith("aperiódic") || s.startsWith("aperiodic")) return null;

  if (s === "workstation" || t === "workstation") return { key: "WORKSTATION", label: "Mergear Workstation" };
  if (s.startsWith("paquete")) return { key: "OBJETOSGS", label: "Mergear ObjetosGS" };
  if (s === "java" || t === "java")
    return { key: "JAVA:" + c.fila, label: "Mergear Java · " + (c.nombre || "fila " + c.fila) };
  if (s.startsWith("estát") || s.startsWith("estat") || t.startsWith("estát") || t.startsWith("estat"))
    return { key: "ESTATICOS", label: "Mergear Estáticos" };
  if (s.startsWith("dependientes") || t.startsWith("dependientes"))
    return { key: "DEPENDIENTES", label: "Mergear Dependientes de entorno" };

  // Otras subidas con código DP: no perderlas — mergeo individual.
  return { key: "OTRO:" + c.fila, label: "Mergear · " + (c.nombre || c.codigo) };
}

/**
 * → [{ key, label, comps: [componente+proyecto], filas, mergeado }]
 * `mergeado` = todos sus componentes tienen el check en la hoja.
 */
export function computeMergeUnits(E) {
  const units = new Map();
  (E?.proyectos || []).forEach((p) =>
    (p.componentes || []).forEach((c) => {
      if (!esDP(c)) return;
      const g = grupoDe(c);
      if (!g) return;
      let u = units.get(g.key);
      if (!u) {
        u = { key: g.key, label: g.label, comps: [] };
        units.set(g.key, u);
      }
      u.comps.push({ ...c, proyecto: p.nombre });
    })
  );
  return [...units.values()].map((u) => ({
    ...u,
    filas: u.comps.map((c) => c.fila),
    mergeado: u.comps.every((c) => isT(c.mergeado)),
  }));
}
