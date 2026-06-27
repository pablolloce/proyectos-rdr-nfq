"use client";

import { NIVELES, FORMACIONES, TRACKS, hrefDe, PROGRESO_EQUIPO } from "@/lib/formaciones";
import { estadoCurso, resumen } from "@/lib/progreso";
import { IconLock, IconArrow, IconCheck, IconPlay, IconGrad } from "./icons";

const n2 = (n) => String(n).padStart(2, "0");

/**
 * Lista de niveles con el AVANCE del usuario (vía accesible/teclado del mapa 3D).
 * Estados: completada · disponible (con "marcar") · bloqueada · próximamente.
 */
export default function ProgresoPanel({ niveles, completadas, current, onMarcar }) {
  const r = resumen(completadas);

  return (
    <div className="space-y-5">
      {/* Progreso global */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-serene/80">Tu progreso</span>
          <span className="tabular-nums text-sand/70">{r.hechos}/{r.total} · {r.pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={r.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de formación">
          <div className="h-full rounded-full bg-gradient-to-r from-serene to-lime transition-[width] duration-500" style={{ width: `${r.pct}%` }} />
        </div>
      </div>

      <a
        href={PROGRESO_EQUIPO}
        className="group flex items-center gap-3 rounded-2xl border border-serene/20 bg-serene/10 px-3.5 py-2.5 transition hover:border-serene/50 hover:bg-serene/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-serene/15 text-serene"><IconGrad size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-sand">Progreso del equipo</span>
          <span className="block truncate text-xs text-sand/60">Avance y certificados</span>
        </span>
        <IconArrow size={15} className="shrink-0 text-serene transition-transform group-hover:translate-x-1" />
      </a>

      <div className="space-y-4">
        {NIVELES.map((lvl) => {
          const nv = niveles[lvl.n];
          const items = FORMACIONES.filter((f) => f.nivel === lvl.n);
          if (!items.length) return null;
          const isCurrent = nv.estado === "actual";
          return (
            <section key={lvl.n} aria-labelledby={`niv-${lvl.n}`} className={isCurrent ? "rounded-2xl bg-white/[0.04] p-3 ring-1 ring-serene/40" : ""}>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-display text-xs font-bold tabular-nums text-serene/60">N{n2(lvl.n)}</span>
                <h3 id={`niv-${lvl.n}`} className="flex-1 font-display text-sm font-bold text-sand">{lvl.titulo}</h3>
                {nv.estado === "completado" && <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime"><IconCheck size={11} /> Hecho</span>}
                {isCurrent && <span className="rounded-full bg-serene/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-serene">Tu nivel</span>}
                {nv.estado === "bloqueado" && <IconLock size={14} className="text-sand/35" />}
                {nv.estado === "proximamente" && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sand/45">Pronto</span>}
              </div>
              <ul className="space-y-1.5">
                {items.map((f) => {
                  const st = estadoCurso(f, completadas, niveles);
                  const color = TRACKS[f.track].color;
                  if (st === "completada")
                    return (
                      <li key={f.titulo} className="flex items-center gap-2.5 rounded-xl border border-lime/20 bg-lime/[0.06] px-3 py-2">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/20 text-lime"><IconCheck size={13} /></span>
                        <a href={hrefDe(f)} className="flex-1 truncate text-sm font-medium text-sand/90 hover:text-sand focus-visible:outline-none focus-visible:underline">{f.titulo}</a>
                        <button type="button" onClick={() => onMarcar(f.archivo, false)} className="shrink-0 rounded-md px-2 py-0.5 text-[11px] text-sand/50 transition hover:bg-white/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene" title="Desmarcar">Deshacer</button>
                      </li>
                    );
                  if (st === "disponible")
                    return (
                      <li key={f.titulo} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 transition hover:border-white/25">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <a href={hrefDe(f)} className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium text-sand focus-visible:outline-none focus-visible:underline">
                          <span className="truncate">{f.titulo}</span>
                          {f.duracion && <span className="shrink-0 tabular-nums text-[11px] text-sand/55">· {f.duracion}</span>}
                        </a>
                        <a href={hrefDe(f)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-serene/15 px-2 py-1 text-[11px] font-bold text-serene transition hover:bg-serene/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"><IconPlay size={11} /> Abrir</a>
                        <button type="button" onClick={() => onMarcar(f.archivo, true)} className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-sand/70 transition hover:border-lime/40 hover:text-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene" title="Marcar como completada"><IconCheck size={12} /></button>
                      </li>
                    );
                  // bloqueada / proximamente
                  return (
                    <li key={f.titulo} aria-disabled="true" className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sand/40">
                      <IconLock size={14} className="shrink-0" />
                      <span className="flex-1 truncate text-sm">{f.titulo}</span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-sand/40">{st === "proximamente" ? "Próximamente" : "Bloqueado"}</span>
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
