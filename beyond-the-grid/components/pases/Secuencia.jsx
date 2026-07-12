"use client";

import { useMemo, useState } from "react";
import { usePases } from "./PasesRoute";
import { etiquetaPasoPorCod } from "./comandos";
import { BTN, BtnIcon, CARD_CLS, INPUT_CLS, SELECT_CLS, Empty, PanelTitle } from "./ui";
import { IconUp, IconDown, IconTrash, IconPlus } from "./icons";

/* Vista 2 · Orden del pase (secuencia). El builder solo aparece en
   FASE_2_3_PREPARACION; después la lista queda de solo lectura. */

const QUICK = [
  "PARADA DEL SISTEMA",
  "ARRANQUE DEL SISTEMA",
  "REINICIO HANDLER",
  "REINICIO PREVENTIVO",
  "REINICIO API",
  "RECARGA CACHE",
];
const quickLabel = (s) =>
  s.replace("DEL SISTEMA", "").replace("REINICIO ", "R. ").replace("RECARGA CACHE", "RECARGA CACHE").trim();

const isSys = (el) => {
  const u = el.toUpperCase();
  return u.includes("PARADA") || u.includes("ARRANQUE") || u.includes("REINICIO");
};

export default function Secuencia() {
  const { E, fase, isCompletado, tempOrden, ordenOps, setActivePanel } = usePases();
  const editable = fase === "FASE_2_3_PREPARACION" && !isCompletado;
  const [manual, setManual] = useState("");

  // Cada Cod. una vez, etiquetado por su Tipo de Subida (como pintarSelectorCods).
  const codOptions = useMemo(() => {
    const cods = new Set();
    (E.proyectos || []).forEach((p) =>
      (p.componentes || []).forEach((c) => {
        if (c.codigo && c.codigo.trim() !== "" && c.codigo.trim() !== "-") cods.add(c.codigo.trim());
      })
    );
    return [...cods].map((c) => {
      const etiqueta = etiquetaPasoPorCod(E, c);
      return { cod: c, etiqueta, desc: etiqueta.replace(": " + c, "") };
    });
  }, [E]);

  const addManual = () => {
    const t = manual.trim();
    if (!t) return;
    ordenOps.addPaso(t);
    setManual("");
  };

  return (
    <section className={`${CARD_CLS} p-4 sm:p-5`}>
      <PanelTitle sub="Diseña el orden de ejecución. Debe incluir PARADA, ARRANQUE y todos los componentes (códigos) después de la PARADA. Los despliegues y aperiódicos pueden ir antes o después del ARRANQUE.">
        Orden del pase
      </PanelTitle>

      {editable && (
        <div className="mb-5 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button key={q} type="button" className={`${BTN.warn} !px-3 !py-2 !text-xs`} onClick={() => ordenOps.addPaso(q)}>
                + {quickLabel(q)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={`${SELECT_CLS} min-w-[200px] flex-1`}
              value=""
              aria-label="Añadir componente por código"
              onChange={(e) => { if (e.target.value) ordenOps.addPaso(e.target.value); }}
            >
              <option value="">+ Selecciona un componente (cód)…</option>
              {codOptions.map((o) => (
                <option key={o.cod} value={o.etiqueta}>{o.cod} — {o.desc}</option>
              ))}
            </select>
            <input
              type="text"
              className={`${INPUT_CLS} min-w-[180px] flex-1`}
              placeholder="Paso manual personalizado…"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addManual(); }}
            />
            <button type="button" className={BTN.accent} onClick={addManual}><IconPlus size={15} /> Manual</button>
          </div>
        </div>
      )}

      {tempOrden.length === 0 ? (
        <Empty>El orden del pase está vacío.</Empty>
      ) : (
        <ol className="space-y-2">
          {tempOrden.map((el, idx) => (
            <li key={idx} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 sm:flex-nowrap">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-lime/40 bg-lime/10 text-xs font-bold tabular-nums text-lime" aria-hidden>
                {idx + 1}
              </span>
              <span className="min-w-0 flex-1 break-words text-[13px] font-semibold text-sand">{el.elemento}</span>
              {isSys(el.elemento) && (
                <input
                  type="text"
                  className={`${INPUT_CLS} !w-32 !py-1.5`}
                  placeholder="SOM-…"
                  aria-label={`SOM de ${el.elemento}`}
                  value={el.som || ""}
                  disabled={!editable}
                  onChange={(e) => ordenOps.updSom(idx, e.target.value)}
                />
              )}
              {editable && (
                <span className="flex shrink-0 gap-0.5">
                  <BtnIcon title="Subir" onClick={() => ordenOps.movePaso(idx, -1)} disabled={idx === 0}><IconUp size={15} /></BtnIcon>
                  <BtnIcon title="Bajar" onClick={() => ordenOps.movePaso(idx, 1)} disabled={idx === tempOrden.length - 1}><IconDown size={15} /></BtnIcon>
                  <BtnIcon title="Eliminar" danger onClick={() => ordenOps.removePaso(idx)}><IconTrash size={15} /></BtnIcon>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      {editable && (
        <button type="button" className={`${BTN.success} mt-5 w-full`} onClick={() => setActivePanel("PROYECTOS")}>
          ← Volver a preparación para validar
        </button>
      )}
    </section>
  );
}
