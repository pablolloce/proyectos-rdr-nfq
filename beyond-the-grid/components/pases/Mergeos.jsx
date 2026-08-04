"use client";

import { useMemo } from "react";
import { usePases } from "./PasesRoute";
import { computeMergeUnits } from "./mergeos";
import { BTN, CARD_CLS, Empty, PanelTitle } from "./ui";
import { IconGitMerge } from "./icons";

/* Vista 5 · Post-implantación: mergeos por UNIDAD, no por componente.
   Workstation / ObjetosGS (paquete custom) / Estáticos / Dependientes de
   entorno se mergean una vez cada uno; los Javas, uno por uno. DataX, API,
   aperiódicos, directorios y cadenas no se mergean (ver mergeos.js). */

export default function Mergeos() {
  const { E, fase, isCompletado, actions } = usePases();
  const editable = !isCompletado;

  const units = useMemo(() => computeMergeUnits(E), [E]);

  return (
    <section className={`${CARD_CLS} p-4 sm:p-5`}>
      <PanelTitle sub="Confirma cada mergeo en Develop/Master: Workstation, ObjetosGS, Estáticos y Dependientes de entorno se mergean una sola vez; los Javas, uno a uno. DataX, API, aperiódicos, directorios y cadenas no requieren mergeo.">
        Post-implantación · Mergeos
      </PanelTitle>

      {units.length === 0 ? (
        <Empty>No hay nada que mergear en este pase.</Empty>
      ) : (
        <ul className="space-y-2">
          {units.map((u) => (
            <li
              key={u.key}
              className={`rounded-xl border px-3 py-2.5 transition ${
                u.mergeado ? "border-lime/30 bg-lime/[0.07]" : "border-white/[0.08] bg-white/[0.03]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[#88E783]"
                  aria-label={u.label}
                  checked={u.mergeado}
                  disabled={!editable}
                  onChange={(e) => actions.chkMergeUnidad(u.filas, e.target.checked)}
                />
                <IconGitMerge size={16} className={u.mergeado ? "shrink-0 text-lime" : "shrink-0 text-sand/40"} />
                <span className={`min-w-0 flex-1 break-words text-[13px] font-bold ${u.mergeado ? "text-sand/60 line-through" : "text-sand"}`}>
                  {u.label}
                </span>
                {u.comps.length > 1 && (
                  <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold tabular-nums text-sand/60">
                    {u.comps.length} componentes
                  </span>
                )}
              </div>
              {/* Qué componentes cubre esta unidad (contexto, seleccionable). */}
              <ul className="mt-1.5 select-text space-y-0.5 pl-[52px]">
                {u.comps.map((c) => (
                  <li key={c.fila} className="flex flex-wrap items-baseline gap-x-2 text-[11.5px] text-sand/55">
                    <span className="break-words">{c.nombre || "(sin nombre)"}</span>
                    <code className="font-mono text-[10.5px] text-serene/80">{c.codigo}</code>
                  </li>
                ))}
              </ul>
            </li>
          ))}
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
