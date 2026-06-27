"use client";

import { NIVELES, FORMACIONES, TRACKS, hrefDe, isDisponible, PROGRESO_EQUIPO } from "@/lib/formaciones";
import { IconLock, IconArrow, IconGrad } from "./icons";

const n2 = (n) => String(n).padStart(2, "0");

/** Lista de niveles con sus formaciones. Activas = enlaces; futuras = bloqueadas.
 *  Es la vía accesible/teclado del HUB Formativo (alternativa a la esfera 3D). */
export default function LevelsPanel() {
  return (
    <div className="space-y-6">
      {/* Progreso del equipo */}
      <a
        href={PROGRESO_EQUIPO}
        className="group flex items-center gap-3 rounded-2xl border border-serene/25 bg-serene/10 px-4 py-3 transition hover:border-serene/50 hover:bg-serene/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-serene/15 text-serene">
          <IconGrad size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-sand">Progreso del equipo</span>
          <span className="block truncate text-xs text-sand/60">Avance y certificados por persona</span>
        </span>
        <IconArrow size={16} className="shrink-0 text-serene transition-transform group-hover:translate-x-1" />
      </a>

      {/* Leyenda de tracks */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Itinerarios">
        {Object.entries(TRACKS).map(([id, t]) => (
          <li key={id} className="flex items-center gap-1.5 text-xs text-sand/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
            {t.nombre}
          </li>
        ))}
      </ul>

      {/* Niveles */}
      <div className="space-y-5">
        {NIVELES.map((lvl) => {
          const items = FORMACIONES.filter((f) => f.nivel === lvl.n);
          if (!items.length) return null;
          return (
            <section key={lvl.n} aria-labelledby={`niv-${lvl.n}`}>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-display text-xs font-bold tabular-nums text-serene/60">N{n2(lvl.n)}</span>
                <h3 id={`niv-${lvl.n}`} className="font-display text-sm font-bold text-sand">
                  {lvl.titulo}
                </h3>
              </div>
              <ul className="space-y-1.5">
                {items.map((f) => {
                  const color = TRACKS[f.track].color;
                  if (!isDisponible(f))
                    return (
                      <li
                        key={f.titulo}
                        aria-disabled="true"
                        className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sand/45"
                      >
                        <IconLock size={15} className="shrink-0" />
                        <span className="flex-1 truncate text-sm">{f.titulo}</span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-sand/40">Próximamente</span>
                      </li>
                    );
                  return (
                    <li key={f.titulo}>
                      <a
                        href={hrefDe(f)}
                        className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                      >
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <span className="flex-1 truncate text-sm font-medium text-sand">{f.titulo}</span>
                        {f.duracion && <span className="shrink-0 tabular-nums text-[11px] text-sand/55">{f.duracion}</span>}
                        <IconArrow size={15} className="shrink-0 text-sand/40 transition-transform group-hover:translate-x-0.5 group-hover:text-sand/80" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
