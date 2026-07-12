"use client";

import { num, h, curQ, vistaActivaOk } from "./model";
import { GLASS, FIELD, Chip, CellInput, EstadoBadge, Ro } from "./ui";
import { IconPlus } from "./icons";

/**
 * Iniciativas — portado de renderIniciativas() del legacy.
 * Filtros por Q/Estado + "Vista activa" (oculta lo cerrado de Qs anteriores).
 * En Modo normal las celdas editan la hoja "1) Iniciativas" (updateRow) y se
 * puede añadir una iniciativa nueva (appendClone).
 */
export default function TabIniciativas({ data, live, ui, redraw, persist, apiWrite }) {
  const recs = data.iniciativas || [];
  const qs = Array.from(new Set(recs.map((r) => r.data["Q facturación"]).filter(Boolean))).sort();
  const fq = ui.iniQ || "Todos";
  const estados = Array.from(new Set(recs.map((r) => r.data["Estado"]).filter(Boolean))).sort();
  const fe = ui.iniEstado || "Todos";
  const activa = ui.iniActiva;
  const cq = curQ();
  const filtered = recs.filter(
    (r) =>
      (fq === "Todos" || r.data["Q facturación"] === fq) &&
      (fe === "Todos" || r.data["Estado"] === fe) &&
      (!activa || vistaActivaOk(r.data["Estado"], r.data["Q facturación"], cq))
  );
  const ed = live; // editable (escribe en Excel) solo en Modo normal

  const commit = (rec, key, raw, type) => {
    const val = type === "number" ? num(raw) : raw;
    rec.data[key] = val;
    redraw();
    persist(() => apiWrite("updateRow", { sheet: "1) Iniciativas", row: rec.row, patch: { [key]: val } }), "Iniciativa actualizada");
  };

  const onAdd = () => {
    const Detalle = window.prompt("Nombre / descripción de la iniciativa:");
    if (!Detalle) return;
    const Q = window.prompt("Q facturación (p.ej. 2026Q3):", "") || "";
    const horas = num(window.prompt("Horas estimadas (propuesta):", "0"));
    const pedido = window.prompt("Id Pedido (opcional):", "") || "";
    const row = { Estado: "Pendiente de aprobar", Detalle, "Q facturación": Q, "Horas propuesta": horas, "Código Pedido": pedido };
    persist(() => apiWrite("appendClone", { sheet: "1) Iniciativas", data: row }), "Iniciativa añadida");
  };

  const edCell = (rec, key, type, extra = "") => (
    <CellInput value={rec.data[key]} type={type || "text"} className={`w-full min-w-[6rem] ${extra}`} onCommit={(v) => commit(rec, key, v, type)} aria-label={`${key} — ${rec.data["Detalle"] || "fila " + rec.row}`} />
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-sand/70">
          Q facturación{" "}
          <select className={`${FIELD} ml-1`} value={fq} onChange={(e) => { ui.iniQ = e.target.value; redraw(); }}>
            <option>Todos</option>
            {qs.map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <label className="text-xs text-sand/70">
          Estado{" "}
          <select className={`${FIELD} ml-1`} value={fe} onChange={(e) => { ui.iniEstado = e.target.value; redraw(); }}>
            <option>Todos</option>
            {estados.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <Chip on={activa} accent="lime" onClick={() => { ui.iniActiva = !ui.iniActiva; redraw(); }}>
          Vista activa ({cq})
        </Chip>
        <span className="text-xs tabular-nums text-sand/50">{filtered.length} iniciativas</span>
        {ed ? (
          <button
            type="button"
            onClick={onAdd}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-purple/50 bg-purple/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple transition hover:border-purple/80 hover:bg-purple/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
          >
            <IconPlus size={13} /> Añadir iniciativa
          </button>
        ) : (
          <span className="ml-auto text-xs text-sand/40">Activa <b>Modo normal</b> para editar / añadir</span>
        )}
      </div>

      <div className={`${GLASS} overflow-x-auto p-4`}>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-serene/80">
              <th className="min-w-[140px] p-2 font-bold">Estado</th>
              <th className="p-2 font-bold">Q</th>
              <th className="p-2 font-bold">Id Pedido</th>
              <th className="p-2 font-bold">Proyecto</th>
              <th className="p-2 text-right font-bold">Horas est.</th>
              <th className="p-2 font-bold">Facturación</th>
              <th className="p-2 text-right font-bold">Ejecutadas</th>
              <th className="p-2 font-bold">Ejecución</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {filtered.map((rec, i) => (
              <tr key={rec.row ?? i} className="border-t border-serene/10">
                <td className="whitespace-nowrap p-2">{ed ? edCell(rec, "Estado") : <EstadoBadge v={rec.data["Estado"]} />}</td>
                <td className="p-2">
                  {ed ? edCell(rec, "Q facturación") : rec.data["Q facturación"] ? (
                    <span className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-xs font-bold text-serene">{rec.data["Q facturación"]}</span>
                  ) : (
                    <Ro v={rec.data["Q facturación"]} />
                  )}
                </td>
                <td className="p-2">{ed ? edCell(rec, "Código Pedido") : <Ro v={rec.data["Código Pedido"]} />}</td>
                <td className="p-2">{ed ? edCell(rec, "Detalle", "text", "min-w-[14rem]") : <Ro v={rec.data["Detalle"]} />}</td>
                <td className="p-2 text-right">{ed ? edCell(rec, "Horas propuesta", "number", "text-right") : <Ro v={rec.data["Horas propuesta"]} f={h} />}</td>
                <td className="p-2">{ed ? edCell(rec, "Estado facturación") : <Ro v={rec.data["Estado facturación"]} />}</td>
                <td className="p-2 text-right"><Ro v={rec.data["Horas ejecutadas"]} f={h} /></td>
                <td className="p-2"><EstadoBadge v={rec.data["¿Ejecutado?"]} /></td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={8} className="p-3 text-sand/40">Sin iniciativas con estos filtros.</td></tr>
            )}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-sand/50">
          «Ejecutadas» es fórmula del Excel (cámbiala en la pestaña Ejecución). El resto es editable en Modo normal.
        </p>
      </div>
    </div>
  );
}
