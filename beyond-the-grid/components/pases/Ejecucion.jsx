"use client";

import { usePases } from "./PasesRoute";
import { resolverBloquesComandos } from "./comandos";
import { isT } from "./backend";
import { BTN, CARD_CLS, INPUT_CLS, Empty, PanelTitle } from "./ui";
import { IconTerminal } from "./icons";

/* Vista 4 · Ejecución del pase: checklist del orden con SOM en los pasos de
   sistema y acceso a los comandos de comprobación de cada elemento. */

const isSys = (el) => {
  const u = el.toUpperCase();
  return u.includes("PARADA") || u.includes("ARRANQUE") || u.includes("REINICIO");
};

export default function Ejecucion() {
  const { E, fase, isCompletado, actions, abrirComandos, tpls } = usePases();
  const editable = !isCompletado;
  const orden = E.ordenPase || [];
  const hechos = orden.filter((o) => isT(o.implantado)).length;

  return (
    <section className={`${CARD_CLS} p-4 sm:p-5`}>
      <PanelTitle sub="Marca los elementos a medida que se implanten en producción e informa del SOM asociado a los reinicios o paradas.">
        Ejecución del pase
      </PanelTitle>

      {orden.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-sand/60">
            <span>Progreso de implantación</span>
            <span className="tabular-nums">{hechos}/{orden.length}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={hechos} aria-valuemin={0} aria-valuemax={orden.length}>
            <div className="h-full rounded-full bg-gradient-to-r from-serene to-lime transition-[width] duration-500" style={{ width: orden.length ? `${(hechos / orden.length) * 100}%` : 0 }} />
          </div>
        </div>
      )}

      {orden.length === 0 ? (
        <Empty>El orden de implantación no se definió en la preparación.</Empty>
      ) : (
        <ol className="space-y-2">
          {orden.map((o, idx) => {
            const done = isT(o.implantado);
            const tieneComandos = resolverBloquesComandos(o.elemento, E, tpls).length > 0;
            return (
              <li
                key={o.fila}
                className={`flex flex-wrap items-center gap-2.5 rounded-xl border px-3 py-2.5 transition sm:flex-nowrap ${
                  done ? "border-lime/30 bg-lime/[0.07]" : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[#88E783]"
                  aria-label={`Implantado: ${o.elemento}`}
                  checked={done}
                  disabled={!editable}
                  onChange={(e) => actions.chkOrden(o.fila, e.target.checked)}
                />
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold tabular-nums ${done ? "border-lime/50 bg-lime/20 text-lime" : "border-white/20 text-sand/60"}`} aria-hidden>
                  {idx + 1}
                </span>
                <span className={`min-w-0 flex-1 break-words text-[13px] font-semibold ${done ? "text-sand/60 line-through" : "text-sand"}`}>
                  {o.elemento}
                </span>
                {isSys(o.elemento) && (
                  <input
                    type="text"
                    className={`${INPUT_CLS} !w-32 !py-1.5`}
                    placeholder="SOM-…"
                    aria-label={`SOM de ${o.elemento}`}
                    value={o.som || ""}
                    disabled={!editable}
                    onChange={(e) => actions.updSomEjecucion(o.fila, e.target.value)}
                  />
                )}
                {tieneComandos && (
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-serene/35 bg-serene/10 px-2.5 py-1.5 text-xs font-bold text-serene transition hover:bg-serene/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                    onClick={() => abrirComandos(o.elemento)}
                  >
                    <IconTerminal size={13} /> Ver comandos
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {fase === "FASE_6_IMPLANTACION" && !isCompletado && (
        <button type="button" className={`${BTN.success} mt-5 w-full`} onClick={actions.validarYCompletarImplantacion}>
          Completar implantación · Avanzar a mergeos
        </button>
      )}
    </section>
  );
}
