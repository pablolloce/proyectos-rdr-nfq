"use client";

import { num, eur, pct, h, rentObjetivoTotal, pickTarifa } from "./model";
import { GLASS, FIELD, Kpi, CellInput } from "./ui";

/**
 * Economía — portado de renderEconomia() del legacy.
 * Valores REALES del Excel (horas imputadas y coste = €/h × imputadas); la
 * simulación de dedicación ESCALA las horas imputadas reales. El escenario
 * (tarifa/horas/gastos) vive por Q en ui.ecoScenario y sobrevive al cambio de
 * pestaña. En Modo normal: €/h escribe D{row} y la dedicación batch H/I/J{row}
 * en la hoja "3) Control Economico.".
 */
export default function TabEconomia({ data, live, ui, redraw, flash, persist, apiWrite }) {
  const blocks = (data.economico && data.economico.bloques) || [];
  if (!blocks.length) return <div className={`${GLASS} p-6 text-sand/70`}>No hay bloques de Control Económico.</div>;

  const qSel = ui.ecoQ || blocks[0].q;
  ui.ecoQ = qSel;
  const block = blocks.find((b) => b.q === qSel) || blocks[0];

  // Gastos del Q desde la hoja "6) Gastos" (suma por meses del bloque).
  const ym = (d) => { const x = new Date(d); return isNaN(x) ? null : x.getFullYear() + "-" + (x.getMonth() + 1); };
  const mesesYM = (block.meses || []).map(ym).filter(Boolean);
  const gastosQ = (data.gastos || []).reduce((a, g) => {
    const m = ym(g.data && g.data["Fecha"]);
    return a + (m && mesesYM.indexOf(m) >= 0 ? num(g.data["Importe"]) : 0);
  }, 0);

  const sc = (ui.ecoScenario[qSel] = ui.ecoScenario[qSel] || {
    tarifa: pickTarifa(data, qSel),
    horas: ((data.ejecucion && data.ejecucion.totalesHorasQ) || {})[qSel] || 0,
    gastos: null,
  });
  if (sc.gastos == null) sc.gastos = gastosQ;

  // La dedicación simulada escala las imputadas reales (no recalcula desde
  // "horas teóricas", vacías en el Excel para casi todos).
  const baseDed = (p) => (p.dedicacion && p.dedicacion.length ? num(p.dedicacion[0]) : 1);
  const dedNow = (p) => (p._ded != null ? p._ded : baseDed(p));
  const factor = (p) => { const b = baseDed(p); return b ? dedNow(p) / b : dedNow(p) ? 1 : 0; };
  const impM = (p, m) => num((p.horasImputadas || [])[m]) * factor(p);
  const impQ = (p) => (p.horasImputadas || []).reduce((a, x) => a + num(x), 0) * factor(p);
  const ausQ = (p) => (p.ausencias || []).reduce((a, x) => a + num(x), 0);
  const costeQ = (p) => num(p.costeHora) * impQ(p);
  const mLabel = (d, m) => { const x = new Date(d); return isNaN(x) ? "M" + (m + 1) : x.toLocaleDateString("es-ES", { month: "short" }); };

  const costes = () => {
    let NFQ = 0, NTER = 0;
    block.personas.forEach((p) => { const c = costeQ(p); if (p.equipo === "NTER") NTER += c; else NFQ += c; });
    return { NFQ, NTER, total: NFQ + NTER };
  };
  const eco = () => {
    const c = costes();
    const costeTotal = c.total + num(sc.gastos);
    const ingresoReal = num(sc.horas) * num(sc.tarifa);
    const rObj = rentObjetivoTotal(c.NFQ, c.NTER, block.rentObjetivoNFQ || 0.25, block.rentObjetivoNTER || 0.2);
    const ingObj = rObj < 1 && rObj >= 0 ? costeTotal / (1 - rObj) : 0;
    return {
      NFQ: c.NFQ, NTER: c.NTER, costeTotal, ingresoReal, rObj, ingObj,
      ingObjH: sc.tarifa ? ingObj / num(sc.tarifa) : 0,
      rReal: ingresoReal ? 1 - costeTotal / ingresoReal : null,
    };
  };
  const e = eco();
  const ok = e.rReal != null && e.rReal >= e.rObj;

  const commitCoste = (p, raw) => {
    const val = num(raw);
    p.costeHora = val;
    if (live) { persist(() => apiWrite("write", { sheet: "3) Control Economico.", a1: "D" + p.row, value: val }), "Coste actualizado"); return; }
    redraw();
  };
  const commitDed = (p, raw) => {
    const ded = num(raw) / 100;
    p._ded = ded;
    if (live) {
      persist(() => apiWrite("batch", {
        updates: [
          { sheet: "3) Control Economico.", a1: "H" + p.row, value: ded },
          { sheet: "3) Control Economico.", a1: "I" + p.row, value: ded },
          { sheet: "3) Control Economico.", a1: "J" + p.row, value: ded },
        ],
      }), "Dedicación actualizada");
      return;
    }
    redraw();
  };
  const requireRow = (p, fn) => (raw) => {
    if (!p.row) { flash("Sin fila asociada (recarga datos).", true); return; }
    fn(p, raw);
  };

  // Función normal (no componente): evita que React remonte las tablas en cada
  // pulsación de los inputs de escenario (identidad de componente inestable).
  const teamTable = (t) => {
    const ps = block.personas.filter((p) => p.equipo === t);
    if (!ps.length) return null;
    const sM = [0, 1, 2].map((m) => ps.reduce((a, p) => a + impM(p, m), 0));
    const sImp = ps.reduce((a, p) => a + impQ(p), 0);
    const sCoste = ps.reduce((a, p) => a + costeQ(p), 0);
    return (
      <div key={t}>
        <h3 className="mb-2 mt-5 font-display text-base font-bold text-purple">
          {t} · <span className="tabular-nums text-sand">{eur.format(sCoste)}</span>
        </h3>
        <div className={`${GLASS} overflow-x-auto p-3`}>
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-serene/70">
                <th className="p-2 font-bold">Persona</th>
                <th className="p-2 text-right font-bold">€/h</th>
                <th className="p-2 text-right font-bold">Dedic.</th>
                {[0, 1, 2].map((m) => <th key={m} className="p-2 text-right font-bold">{mLabel((block.meses || [])[m], m)}</th>)}
                <th className="p-2 text-right font-bold">Aus. Q</th>
                <th className="p-2 text-right font-bold">Imput. Q</th>
                <th className="p-2 text-right font-bold">Coste Q</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {ps.map((p, i) => (
                <tr key={p.row ?? p.nombre ?? i} className="border-t border-serene/10">
                  <td className="p-2 text-sand">{p.nombre}</td>
                  <td className="p-2 text-right">
                    <CellInput type="number" step="0.01" value={num(p.costeHora).toFixed(2)} className="w-20 text-right" onCommit={requireRow(p, commitCoste)} aria-label={`Coste hora de ${p.nombre}`} />
                  </td>
                  <td className="whitespace-nowrap p-2 text-right">
                    <CellInput type="number" step="5" min="0" value={Math.round(dedNow(p) * 100)} className="w-14 text-right" onCommit={requireRow(p, commitDed)} aria-label={`Dedicación de ${p.nombre}`} />%
                  </td>
                  {[0, 1, 2].map((m) => <td key={m} className="p-2 text-right text-sand/70">{h(impM(p, m))}</td>)}
                  <td className="p-2 text-right text-sand/50">{h(ausQ(p))}</td>
                  <td className="p-2 text-right">{h(impQ(p))}</td>
                  <td className="p-2 text-right text-sand">{eur.format(costeQ(p))}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-serene/30 font-bold text-sand">
                <td className="p-2">Total {t}</td>
                <td /><td />
                {sM.map((v, m) => <td key={m} className="p-2 text-right">{h(v)}</td>)}
                <td />
                <td className="p-2 text-right">{h(sImp)}</td>
                <td className="p-2 text-right">{eur.format(sCoste)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div key={qSel}>
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <label className="text-xs text-sand/70">
          Trimestre{" "}
          <select className={`${FIELD} ml-1`} value={qSel} onChange={(ev) => { ui.ecoQ = ev.target.value; redraw(); }}>
            {blocks.map((b) => <option key={b.q}>{b.q}</option>)}
          </select>
        </label>
        <label className="text-xs text-sand/70">
          Tarifa €/h{" "}
          <input type="number" step="0.01" defaultValue={sc.tarifa} className={`${FIELD} ml-1 w-24`} onChange={(ev) => { sc.tarifa = num(ev.target.value); redraw(); }} />
        </label>
        <label className="text-xs text-sand/70">
          Horas Q{" "}
          <input type="number" defaultValue={sc.horas} className={`${FIELD} ml-1 w-28`} onChange={(ev) => { sc.horas = num(ev.target.value); redraw(); }} />
        </label>
        <label className="text-xs text-sand/70">
          Gastos €{" "}
          <input type="number" defaultValue={sc.gastos} className={`${FIELD} ml-1 w-28`} onChange={(ev) => { sc.gastos = num(ev.target.value); redraw(); }} />
        </label>
        <span className="text-xs text-sand/40">
          Gastos del Q (hoja 6): <b className="tabular-nums text-sand/70">{eur.format(gastosQ)}</b> · {live ? "editar €/h y dedicación escribe en el Excel" : "simulación local"}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Ingreso real" value={eur.format(e.ingresoReal)} />
        <Kpi label="Coste total" value={eur.format(e.costeTotal)} accent="mandarin" />
        <Kpi label="Rentab. real" value={pct(e.rReal)} accent={ok ? "lime" : "mandarin"} />
        <Kpi label="Rent. objetivo" value={pct(e.rObj)} />
        <Kpi label="Ingreso objetivo" value={eur.format(e.ingObj)} />
        <Kpi label="Ing. obj. (horas)" value={h(e.ingObjH)} />
        <Kpi label="Coste NFQ" value={eur.format(e.NFQ)} />
        <Kpi label="Coste NTER" value={eur.format(e.NTER)} />
      </div>

      {teamTable("NFQ")}
      {teamTable("NTER")}

      <p className="mt-3 text-xs text-sand/50">
        Valores reales del Excel (horas imputadas y coste). La dedicación escala las horas imputadas en la simulación. Aus. Q = vacaciones/formación importadas.
      </p>
    </div>
  );
}
