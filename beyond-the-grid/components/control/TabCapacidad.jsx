"use client";

import { useState } from "react";
import { num, pct, h } from "./model";
import { GLASS, FIELD, CellInput, Bar, TEXT, BGBAR } from "./ui";
import { IconPlus, IconX } from "./icons";

/**
 * Capacidad — portado de renderCapacidad() del legacy. TODO es simulación
 * local (no escribe en el Excel): vista por proyecto con su equipo en chips,
 * capacidad por persona (barras, antes Chart.js) y editor de sub-equipos.
 * Las horas de cada proyecto salen de la pestaña Ejecución para el Q elegido.
 */

const colOf = (v) => (v > 1.05 ? "mandarin" : v >= 0.8 ? "lime" : "serene");
const fnName = (s) => String(s || "").split(" ")[0];
const noAlex = (n) => !/casal/i.test(String(n || ""));
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
const codeOf = (s) => { const m = String(s || "").match(/sdatool-?\d+/i); return m ? m[0].toLowerCase().replace("-", "") : null; };

// Añadir persona a un proyecto: persona + % y botón (estado local del chip).
function AddAsig({ people, onAdd, flash }) {
  const [persona, setPersona] = useState("");
  const [p, setP] = useState("");
  return (
    <span className="inline-flex items-center gap-1">
      <select className={`${FIELD} px-1 py-0.5 text-[11px]`} value={persona} onChange={(e) => setPersona(e.target.value)} aria-label="Añadir persona al proyecto">
        <option value="">+</option>
        {people.map((n) => <option key={n}>{n}</option>)}
      </select>
      <input type="number" placeholder="%" className={`${FIELD} w-11 px-1 py-0.5 text-[11px]`} value={p} onChange={(e) => setP(e.target.value)} aria-label="Porcentaje de dedicación" />
      <button
        type="button"
        title="Añadir"
        className="grid h-5 w-5 place-items-center rounded text-serene transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        onClick={() => {
          const v = num(p) / 100;
          if (!persona || !v) { flash("Elige persona y %", true); return; }
          onAdd(persona, v);
          setPersona("");
          setP("");
        }}
      >
        <IconPlus size={12} />
      </button>
    </span>
  );
}

export default function TabCapacidad({ data, ui, redraw, flash }) {
  const blocks = (data.capacidad && data.capacidad.bloques) || [];
  if (!blocks.length) return <div className={`${GLASS} p-6 text-sand/70`}>No hay bloques de Capacidad.</div>;

  const qSel = ui.capQ || blocks[0].q;
  ui.capQ = qSel;
  const b = blocks.find((x) => x.q === qSel) || blocks[0];
  const hq = ui.capHoras[qSel] != null ? ui.capHoras[qSel] : num(b.horasQ) || 500;

  // Sub-equipos editables (copia local por Q; se inicializa desde el Excel).
  if (!ui.capTeams[qSel])
    ui.capTeams[qSel] = (b.equipos || []).map((e) => ({
      lider: e.lider || "",
      capExcel: e.capacidadCubierta,
      miembros: (e.miembros || []).map((m) => ({ persona: (m && m.persona) || m, nivel: (m && m.nivel) || "", peso: 1 })).filter((x) => noAlex(x.persona)),
    }));
  const equipos = ui.capTeams[qSel];
  const projs = b.proyectos || [];

  // Horas por proyecto = las de Ejecución para este Q (deben coincidir).
  const ejMap = (() => {
    const m = {};
    const ej = data.ejecucion || {};
    (ej.records || []).forEach((r) => {
      const nm = r.data && r.data["Proyecto"];
      if (!nm) return;
      const hrs = num(r.data[qSel]);
      const c = codeOf(nm);
      if (c) m["c" + c] = (m["c" + c] || 0) + hrs;
      m["n" + norm(nm)] = (m["n" + norm(nm)] || 0) + hrs;
    });
    return m;
  })();
  const ejHoras = (p) => {
    const c = codeOf(p.nombre);
    if (c && ejMap["c" + c] != null) return ejMap["c" + c];
    const k = "n" + norm(p.nombre);
    return ejMap[k] != null ? ejMap[k] : num(p.horas);
  };

  const people = (() => {
    const s = new Set();
    equipos.forEach((e) => e.miembros.forEach((m) => s.add(m.persona)));
    projs.forEach((p) => (p.asignaciones || []).forEach((a) => a.persona && s.add(a.persona)));
    return Array.from(s).filter((n) => n && noAlex(n)).sort();
  })();
  const cob = (p) => { const s = (p.asignaciones || []).reduce((a, x) => a + num(x.pct), 0); const hp = ejHoras(p); return hp ? (s * hq) / hp : 0; };
  const capP = (per) => { let hh = 0; projs.forEach((p) => (p.asignaciones || []).forEach((a) => { if (a.persona === per) hh += ejHoras(p) * num(a.pct); })); return hq ? hh / hq : 0; };
  const teamCap = (e) => { let w = 0, s = 0; e.miembros.forEach((m) => { const p = num(m.peso); w += p; s += capP(m.persona) * p; }); return w ? s / w : 0; };

  return (
    <div key={qSel}>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <label className="text-xs text-sand/70">
          Trimestre{" "}
          <select className={`${FIELD} ml-1`} value={qSel} onChange={(e) => { ui.capQ = e.target.value; redraw(); }}>
            {blocks.map((x) => <option key={x.q}>{x.q}</option>)}
          </select>
        </label>
        <label className="text-xs text-sand/70">
          Horas/persona Q{" "}
          <CellInput type="number" value={hq} className={`${FIELD} ml-1 w-24`} onCommit={(v) => { ui.capHoras[qSel] = num(v); redraw(); }} />
        </label>
        <span className="text-xs text-sand/40">
          Horas = las de Ejecución · Cob. = % cubierto · chips = % por persona · <span className="text-lime">ok</span>/<span className="text-mandarin">excede</span>
        </span>
      </div>

      {/* ---- Proyectos: 1 fila por proyecto, equipo en chips ---- */}
      <h3 className="mb-2 font-display text-lg font-bold text-sand">Proyectos</h3>
      <div className={`${GLASS} overflow-x-auto p-3`}>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-serene/80">
              <th className="py-1 pr-3 font-bold">Proyecto</th>
              <th className="px-2 py-1 text-right font-bold">Horas</th>
              <th className="px-2 py-1 text-right font-bold">Cob.</th>
              <th className="py-1 pl-2 font-bold">Equipo</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {projs.map((p, pi) => {
              const c = cob(p);
              return (
                <tr key={pi} className="border-t border-serene/10 align-top">
                  <td className="py-1.5 pr-3">
                    <div className="max-w-[230px] truncate font-medium text-sand" title={p.nombre}>{p.nombre || "—"}</div>
                  </td>
                  <td className="px-2 py-1.5 text-right text-sand/70" title={`Horas de Ejecución (${qSel})`}>{h(ejHoras(p))}</td>
                  <td className="px-2 py-1.5 text-right"><b className={TEXT[colOf(c)]}>{pct(c)}</b></td>
                  <td className="py-1.5 pl-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {(p.asignaciones || []).map((a, ai) => (
                        <span key={ai} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[11px]" title={`${a.persona} · ${a.rol || ""}`}>
                          <span className="text-sand/85">{fnName(a.persona)}</span>
                          <CellInput type="number" value={Math.round(num(a.pct) * 100)} className="w-8 text-right" onCommit={(v) => { a.pct = num(v) / 100; redraw(); }} aria-label={`% de ${a.persona} en ${p.nombre}`} />
                          <span className="text-sand/40">%</span>
                          <button type="button" title={`Quitar a ${a.persona}`} className="text-mandarin transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-serene" onClick={() => { p.asignaciones.splice(ai, 1); redraw(); }}>
                            <IconX size={11} />
                          </button>
                        </span>
                      ))}
                      {!(p.asignaciones || []).length && <span className="text-xs text-sand/30">sin equipo</span>}
                      <AddAsig people={people} flash={flash} onAdd={(persona, v) => { (p.asignaciones = p.asignaciones || []).push({ rol: "ejecutor", persona, pct: v }); redraw(); }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {!projs.length && <tr><td colSpan={4} className="py-3 text-sand/40">Sin proyectos.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ---- Capacidad por persona (barras, antes Chart.js) + por sub-equipo ---- */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-display text-lg font-bold text-sand">Capacidad por persona</h3>
          <div className={`${GLASS} space-y-2.5 p-4`}>
            {people.length ? people.map((per) => {
              const v = capP(per);
              const c = colOf(v);
              return (
                <div key={per}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-sand/90">{per}</span>
                    <span className={`shrink-0 font-bold tabular-nums ${TEXT[c]}`}>{Math.round(v * 100)}%</span>
                  </div>
                  {/* escala hasta 160% (como el eje del chart legacy) */}
                  <div className="mt-0.5 h-2 rounded-full bg-white/10">
                    <div className={`h-2 rounded-full ${BGBAR[c]}`} style={{ width: `${Math.min(100, (v / 1.6) * 100)}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm text-sand/40">—</p>}
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-display text-lg font-bold text-sand">Capacidad por sub-equipo</h3>
          <div className={`${GLASS} space-y-3 p-4`}>
            {equipos.length
              ? equipos.map((e, i) => {
                const v = teamCap(e);
                return <Bar key={i} label={e.lider || "—"} v={v} extra={`${(e.miembros || []).length} pers.`} col={colOf(v)} fmt={pct(v)} />;
              })
              : <p className="text-sm text-sand/40">—</p>}
          </div>
        </div>
      </div>

      {/* ---- Distribución del equipo (editor de sub-equipos) ---- */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-sand">Distribución del equipo</h3>
        <button
          type="button"
          onClick={() => { equipos.push({ lider: "Nuevo sub-equipo", miembros: [] }); redraw(); }}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.055] px-3 py-1.5 text-xs font-bold text-sand transition hover:border-purple/50 hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        >
          <IconPlus size={12} /> Sub-equipo
        </button>
      </div>
      <p className="mb-2 text-xs text-sand/40"><span className="text-aqua">Tech/cross</span> en aqua. % = peso de cada persona en el sub-equipo.</p>
      <div className={`${GLASS} p-4`}>
        {equipos.length ? equipos.map((e, ei) => (
          <div key={ei} className="mb-2 border-b border-serene/10 pb-2 last:mb-0 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <CellInput value={e.lider} placeholder="Responsable (N2)" className="flex-1 text-sm font-bold" onCommit={(v) => { e.lider = v; redraw(); }} aria-label="Responsable del sub-equipo" />
              {e.capExcel != null && <span className="text-[10px] tabular-nums text-sand/35" title="Capacidad cubierta (Excel)">xls {pct(num(e.capExcel))}</span>}
              <button type="button" title="Eliminar sub-equipo" className="text-mandarin transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-serene" onClick={() => { equipos.splice(ei, 1); redraw(); }}>
                <IconX size={13} />
              </button>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {e.miembros.map((m, mi) => (
                <span key={mi} className={`inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[11px] ${m.nivel === "Tech" ? "text-aqua" : "text-sand/80"}`} title={`${m.persona} · ${m.nivel || ""}`}>
                  {fnName(m.persona)}
                  <CellInput type="number" value={Math.round(num(m.peso) * 100)} className="w-8 text-right" onCommit={(v) => { m.peso = num(v) / 100; redraw(); }} aria-label={`Peso de ${m.persona}`} />
                  <span className="text-sand/40">%</span>
                  <button type="button" title={`Quitar a ${m.persona}`} className="text-mandarin transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-serene" onClick={() => { e.miembros.splice(mi, 1); redraw(); }}>
                    <IconX size={11} />
                  </button>
                </span>
              ))}
              <select
                className={`${FIELD} px-1 py-0.5 text-[11px]`}
                value=""
                aria-label="Añadir miembro al sub-equipo"
                onChange={(ev) => { if (ev.target.value) { e.miembros.push({ persona: ev.target.value, peso: 1 }); redraw(); } }}
              >
                <option value="">+ miembro</option>
                {people.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
        )) : <p className="text-sm text-sand/40">Sin sub-equipos.</p>}
      </div>
    </div>
  );
}
