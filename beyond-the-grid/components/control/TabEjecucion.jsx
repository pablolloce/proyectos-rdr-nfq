"use client";

import { num, h, curQ, vistaActivaOk } from "./model";
import { GLASS, FIELD, Chip, Kpi, CellInput, EstadoBadge, TEXT } from "./ui";

/**
 * Ejecución — portado de renderEjecucion() del legacy.
 * Reparto de horas por Q y proyecto: Total (elevadas ± bolsa/adelantos),
 * Σ Q (repartidas) y Faltan (Total − Σ Q). Las celdas de Q son editables:
 * en simulación recalculan en local; en Modo normal escriben en la hoja
 * "2)Ejecución Real" (updateRow).
 */
export default function TabEjecucion({ data, live, ui, redraw, persist, apiWrite }) {
  const ej = data.ejecucion || { qColumns: [], records: [], totalesHorasQ: {} };
  const qs = ej.qColumns || [];

  // Recalcula los totales por Q (y los publica en el modelo, como el legacy:
  // Economía usa totalesHorasQ como horas por defecto del Q).
  const tot = {};
  qs.forEach((q) => (tot[q] = 0));
  (ej.records || []).forEach((r) => qs.forEach((q) => (tot[q] += num(r.data[q]))));
  if (data.ejecucion) data.ejecucion.totalesHorasQ = tot;

  const estadoMap = {};
  (data.iniciativas || []).forEach((r) => { const n = r.data["Detalle"]; if (n) estadoMap[n] = r.data["Estado"]; });
  const eOf = (rec) => estadoMap[rec.data["Proyecto"]] || "—";
  // Total a ejecutar = elevadas + de bolsa/adelantos − a bolsa/adelantos.
  const totalEjec = (r) =>
    num(r.data["Horas elevadas"]) + num(r.data["Horas cobradas de Adelantos"]) + num(r.data["Horas cobradas de Bolsa BBVA"]) -
    num(r.data["Horas a Adelantos"]) - num(r.data["Horas a Bolsa BBVA"]);
  const repartido = (r) => qs.reduce((a, q) => a + num(r.data[q]), 0);

  const qElev = Array.from(new Set((ej.records || []).map((r) => r.data["Q elevación"]).filter(Boolean))).sort();
  const estados = Array.from(new Set((ej.records || []).map(eOf).filter((s) => s && s !== "—"))).sort();
  const qf = ui.ejeQ || "Todos";
  const ef = ui.ejeEstado || "Todos";
  const activa = ui.ejeActiva;
  const cq = curQ();
  const rows = (ej.records || []).filter(
    (r) =>
      (qf === "Todos" || r.data["Q elevación"] === qf) &&
      (ef === "Todos" || eOf(r) === ef) &&
      (!activa || vistaActivaOk(eOf(r), r.data["Q elevación"], cq))
  );
  // Con vista activa, ocultar los Q a 0 en todas las filas visibles.
  const visQs = activa ? qs.filter((q) => rows.some((r) => num(r.data[q]) !== 0)) : qs;

  const faltanCell = (r) => {
    const f = totalEjec(r) - repartido(r);
    const c = f === 0 ? "lime" : f > 0 ? "canary" : "mandarin";
    return <span className={`font-bold ${TEXT[c]}`}>{h(f)}</span>;
  };

  const commit = (rec, q, raw) => {
    const val = num(raw);
    rec.data[q] = val;
    if (live) persist(() => apiWrite("updateRow", { sheet: "2)Ejecución Real", row: rec.row, patch: { [q]: val } }), "Ejecución actualizada");
    redraw(); // recalcula Σ / Faltan / KPIs (simulación y feedback inmediato)
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-sand/70">
          Q elevación{" "}
          <select className={`${FIELD} ml-1`} value={qf} onChange={(e) => { ui.ejeQ = e.target.value; redraw(); }}>
            <option>Todos</option>
            {qElev.map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <label className="text-xs text-sand/70">
          Estado{" "}
          <select className={`${FIELD} ml-1`} value={ef} onChange={(e) => { ui.ejeEstado = e.target.value; redraw(); }}>
            <option>Todos</option>
            {estados.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <Chip on={activa} accent="lime" onClick={() => { ui.ejeActiva = !ui.ejeActiva; redraw(); }}>
          Vista activa ({cq})
        </Chip>
        <span className="text-xs tabular-nums text-sand/50">
          {rows.length} proyectos · {live ? "la edición escribe en el Excel" : "simulación local"}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {visQs.map((q) => <Kpi key={q} label={"Horas " + q} value={h(tot[q])} />)}
      </div>

      <div className={`${GLASS} overflow-x-auto p-4`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-serene/80">
              <th className="p-2 font-bold">Proyecto</th>
              <th className="min-w-[120px] p-2 font-bold">Estado</th>
              <th className="p-2 text-right font-bold">Total</th>
              {visQs.map((q) => <th key={q} className="p-2 text-right font-bold">{q}</th>)}
              <th className="p-2 text-right font-bold">Σ Q</th>
              <th className="p-2 text-right font-bold">Faltan</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((rec, i) => (
              <tr key={rec.row ?? i} className="border-t border-serene/10">
                <td className="p-2 text-sand">{rec.data["Proyecto"] || "—"}</td>
                <td className="whitespace-nowrap p-2"><EstadoBadge v={eOf(rec)} /></td>
                <td className="p-2 text-right text-sand/70">{h(totalEjec(rec))}</td>
                {visQs.map((q) => (
                  <td key={q} className="p-2 text-right">
                    <CellInput
                      type="number"
                      value={num(rec.data[q])}
                      className="w-20 text-right"
                      onCommit={(v) => commit(rec, q, v)}
                      aria-label={`Horas ${q} de ${rec.data["Proyecto"] || "proyecto"}`}
                    />
                  </td>
                ))}
                <td className="p-2 text-right text-sand">{h(repartido(rec))}</td>
                <td className="p-2 text-right">{faltanCell(rec)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5 + visQs.length} className="p-3 text-sand/40">Sin proyectos con estos filtros.</td></tr>
            )}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-sand/50">
          Total = horas a ejecutar (elevadas ± bolsa/adelantos). Σ Q = repartidas entre trimestres. Faltan = Total − Σ Q (0 = completo).
        </p>
      </div>
    </div>
  );
}
