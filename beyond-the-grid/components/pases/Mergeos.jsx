"use client";

import { usePases } from "./PasesRoute";
import { isT } from "./backend";
import { BTN, CARD_CLS, Empty, PanelTitle } from "./ui";
import { IconGitMerge } from "./icons";

/* Vista 5 · Post-implantación: mergeo de las ramas DP-KYTL en Develop/Master. */

export default function Mergeos() {
  const { E, fase, isCompletado, actions } = usePases();
  const editable = !isCompletado;

  const rows = [];
  (E.proyectos || []).forEach((p) =>
    (p.componentes || []).forEach((c) => {
      if ((c.codigo || "").toUpperCase().includes("DP-KYTL")) rows.push(c);
    })
  );

  return (
    <section className={`${CARD_CLS} p-4 sm:p-5`}>
      <PanelTitle sub="Confirma que las ramas de los componentes DP-KYTL han sido mergeadas correctamente en Develop/Master.">
        Post-implantación · Mergeos
      </PanelTitle>

      {rows.length === 0 ? (
        <Empty>No hay componentes tipo DP-KYTL que requieran mergeo en este pase.</Empty>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => {
            const done = isT(c.mergeado);
            return (
              <li
                key={c.fila}
                className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 transition sm:flex-nowrap ${
                  done ? "border-lime/30 bg-lime/[0.07]" : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[#88E783]"
                  aria-label={`Mergeado: ${c.nombre}`}
                  checked={done}
                  disabled={!editable}
                  onChange={(e) => actions.chkMerge(c.fila, e.target.checked)}
                />
                <IconGitMerge size={16} className={done ? "shrink-0 text-lime" : "shrink-0 text-sand/40"} />
                <span className={`min-w-0 flex-1 break-words text-[13px] font-semibold ${done ? "text-sand/60 line-through" : "text-sand"}`}>
                  {c.nombre}
                </span>
                <code className="shrink-0 rounded-md bg-white/[0.07] px-2 py-1 font-mono text-[11px] text-serene">{c.codigo}</code>
              </li>
            );
          })}
        </ul>
      )}

      {fase === "FASE_7_POST" && !isCompletado && (
        <button type="button" className={`${BTN.success} mt-5 w-full`} onClick={actions.validarYFinalizarPase}>
          Finalizar pase completamente
        </button>
      )}
    </section>
  );
}
