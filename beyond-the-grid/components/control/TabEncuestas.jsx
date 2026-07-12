"use client";

import { num } from "./model";
import { FIELD, EmptyCard, DataTable } from "./ui";

/**
 * Encuestas — portado de renderEncuestas() del legacy. Conjuntos por Q
 * disponibles en el snapshot (encuestasQ1 -> 2026Q1, encuestasQ4 -> 2025Q4)
 * con media de "CALIDAD TOTAL NUEVA".
 */
export default function TabEncuestas({ data, ui, redraw }) {
  const sets = [];
  if ((data.encuestasQ1 || []).length) sets.push({ q: "2026Q1", recs: data.encuestasQ1 });
  if ((data.encuestasQ4 || []).length) sets.push({ q: "2025Q4", recs: data.encuestasQ4 });
  if (!sets.length) return <EmptyCard>Sin encuestas.</EmptyCard>;

  const qSel = ui.encQ || sets[0].q;
  ui.encQ = qSel;
  const set = sets.find((s) => s.q === qSel) || sets[0];
  const avg = (k) => {
    const v = set.recs.map((r) => num(r.data[k])).filter((x) => x > 0);
    return v.length ? v.reduce((a, x) => a + x, 0) / v.length : 0;
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-sand/70">
          Trimestre{" "}
          <select className={`${FIELD} ml-1`} value={set.q} onChange={(e) => { ui.encQ = e.target.value; redraw(); }}>
            {sets.map((s) => <option key={s.q}>{s.q}</option>)}
          </select>
        </label>
        <span className="text-xs tabular-nums text-sand/50">
          {set.recs.length} respuestas · Calidad media <b className="text-lime">{avg("CALIDAD TOTAL NUEVA").toFixed(2)}</b>
        </span>
      </div>
      <DataTable
        records={set.recs}
        cols={[
          { k: "Código de proyecto/servicio", label: "Código" },
          { k: "NOMBRE DEL PROYECTO/SERVICIO", label: "Proyecto" },
          { k: "SATISFACCIÓN ENTREGA", label: "Satisf.", r: true },
          { k: "CONSIGUE RESULTADOS", label: "Resultados", r: true },
          { k: "CONOCIMIENTO TÉCNICO ADECUADO", label: "Conocim.", r: true },
          { k: "CALIDAD TOTAL NUEVA", label: "Calidad", r: true },
        ]}
      />
    </div>
  );
}
