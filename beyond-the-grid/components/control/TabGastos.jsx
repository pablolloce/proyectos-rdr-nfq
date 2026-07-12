"use client";

import { useRef } from "react";
import { num, eur } from "./model";
import { GLASS, FIELD, CellInput } from "./ui";
import { IconPlus } from "./icons";

/**
 * Gastos — portado de renderGastos() del legacy: editor conectado a la hoja
 * "6) Gastos". Filtro por trimestre (derivado de la fecha), alta de gasto
 * (append) y edición de Detalle/Importe (updateRow) en Modo normal.
 */
export default function TabGastos({ data, live, ui, redraw, flash, persist, apiWrite }) {
  const recs = data.gastos || [];
  const qOf = (r) => { const x = new Date(r.data["Fecha"]); return isNaN(x) ? "—" : x.getFullYear() + "Q" + (Math.floor(x.getMonth() / 3) + 1); };
  const qs = Array.from(new Set(recs.map(qOf).filter((q) => q !== "—"))).sort();
  const fq = ui.gasQ || "Todos";
  const rows = recs.filter((r) => fq === "Todos" || qOf(r) === fq);
  const total = rows.reduce((a, r) => a + num(r.data["Importe"]), 0);
  const ed = live;
  const fFecha = (v) => { const x = new Date(v); return isNaN(x) ? v || "—" : x.toLocaleDateString("es-ES"); };

  const fecha = useRef(null);
  const persona = useRef(null);
  const detalle = useRef(null);
  const importe = useRef(null);

  const onAdd = () => {
    const f = (fecha.current && fecha.current.value) || new Date().toISOString().slice(0, 10);
    const p = (persona.current && persona.current.value) || "";
    const d = (detalle.current && detalle.current.value) || "";
    const imp = num(importe.current && importe.current.value);
    if (!d || !imp) { flash("Detalle e importe obligatorios", true); return; }
    persist(() => apiWrite("append", { sheet: "6) Gastos", data: { Fecha: f, Persona: p, Detalle: d, Importe: imp } }), "Gasto añadido");
  };

  const commit = (rec, key, raw, type) => {
    const val = type === "number" ? num(raw) : raw;
    rec.data[key] = val;
    redraw();
    persist(() => apiWrite("updateRow", { sheet: "6) Gastos", row: rec.row, patch: { [key]: val } }), "Gasto actualizado");
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-sand/70">
          Trimestre{" "}
          <select className={`${FIELD} ml-1`} value={fq} onChange={(e) => { ui.gasQ = e.target.value; redraw(); }}>
            <option>Todos</option>
            {qs.map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <span className="text-xs tabular-nums text-sand/50">
          {rows.length} gastos · Total <b className="text-sand">{eur.format(total)}</b>
        </span>
      </div>

      {ed ? (
        <div className={`${GLASS} mb-4 p-4`}>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-purple">Añadir gasto (escribe en «6) Gastos»)</p>
          <div className="flex flex-wrap items-end gap-2">
            <input ref={fecha} type="date" className={`${FIELD}`} aria-label="Fecha del gasto" />
            <input ref={persona} type="text" placeholder="Persona" className={`${FIELD}`} aria-label="Persona" />
            <input ref={detalle} type="text" placeholder="Detalle" className={`${FIELD} w-56`} aria-label="Detalle del gasto" />
            <input ref={importe} type="number" placeholder="€" className={`${FIELD} w-24`} aria-label="Importe en euros" />
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 rounded-full border border-purple/50 bg-purple/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple transition hover:border-purple/80 hover:bg-purple/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              <IconPlus size={12} /> Añadir
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-3 text-xs text-sand/40">Activa <b>Modo normal</b> para añadir/editar gastos.</p>
      )}

      <div className={`${GLASS} overflow-x-auto p-4`}>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-serene/80">
              <th className="p-2 font-bold">Fecha</th>
              <th className="p-2 font-bold">Persona</th>
              <th className="p-2 font-bold">Detalle</th>
              <th className="p-2 text-right font-bold">Importe</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.length ? (
              rows.map((r, i) => (
                <tr key={r.row ?? i} className="border-t border-serene/10">
                  <td className="whitespace-nowrap p-2 text-sand/80">{fFecha(r.data["Fecha"])}</td>
                  <td className="p-2 text-sand/80">{r.data["Persona"] || "—"}</td>
                  <td className="p-2">
                    {ed ? (
                      <CellInput value={r.data["Detalle"]} className="w-full min-w-[12rem]" onCommit={(v) => commit(r, "Detalle", v)} aria-label={`Detalle del gasto (fila ${r.row})`} />
                    ) : (
                      r.data["Detalle"] || "—"
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {ed ? (
                      <CellInput type="number" value={num(r.data["Importe"])} className="w-24 text-right" onCommit={(v) => commit(r, "Importe", v, "number")} aria-label={`Importe del gasto (fila ${r.row})`} />
                    ) : (
                      eur.format(num(r.data["Importe"]))
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-3 text-sand/40">Sin gastos en este Q.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
