"use client";

import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { useAccentMap } from "@/lib/theme";
import { CATEGORIAS, MEJORAS_COLOR, TERMOMETRO_OPCIONES, contarTermometro, parseReconocimiento } from "./constants";
import { GLASS } from "./ui";
import { IconArrowL, IconHeartFill, IconStar } from "./icons";

/** Tarjeta de solo lectura del visor histórico (badge "Para:" + corazones). */
function TarjetaArchivo({ t, color }) {
  const acc = useAccentMap();
  const { txt, dest } = parseReconocimiento(t);
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.05] p-3" style={{ borderLeft: `3px solid ${rgba(acc(color), 0.85)}` }}>
      {dest && (
        <p className="mb-2">
          <span className="inline-flex items-center gap-1 rounded border border-serene/40 bg-serene/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-serene">
            <IconStar size={11} className="text-canary" /> Para: {dest}
          </span>
        </p>
      )}
      <p className="whitespace-pre-line text-sm leading-relaxed text-sand/90">{txt}</p>
      {t.votos > 0 && (
        <p className="mt-2 flex justify-end">
          <span className="inline-flex items-center gap-1 rounded bg-white/[0.08] px-1.5 py-0.5 text-xs font-bold tabular-nums text-sand">
            <IconHeartFill size={11} className="text-mandarin" /> {t.votos}
          </span>
        </p>
      )}
    </article>
  );
}

/**
 * Visor de retrospectivas archivadas (solo lectura). Recibe el "dump"
 * {nombre, fecha, usuarios, termometro, tarjetas, mejoras} ya compuesto.
 */
export default function ArchiveView({ data, onVolver }) {
  const acc = useAccentMap();
  const votos = contarTermometro(data.termometro);
  const total = Object.values(votos).reduce((a, b) => a + b, 0);
  const tarjetas = (data.tarjetas || []).slice().sort((a, b) => (b.votos || 0) - (a.votos || 0));
  const usuarios = [...new Set(data.usuarios || [])];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="rdr-rise mb-8">
        <button
          type="button"
          onClick={onVolver}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-sand/80 transition hover:border-white/30 hover:bg-white/[0.1] hover:text-sand active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        >
          <IconArrowL size={15} /> Menú
        </button>
        <h2 className="font-display text-3xl font-bold text-sand sm:text-4xl">{data.nombre || "Retrospectiva"}</h2>
        <p className="mt-1.5 text-sm text-sand/60">
          {[data.fecha, `${(data.usuarios || []).length} participantes`].filter(Boolean).join(" · ")}
          <span className="ml-2 rounded-full bg-serene/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-serene">Archivada · solo lectura</span>
        </p>
      </header>

      {/* Termómetro */}
      <section aria-label="Termómetro de confianza" className={`rdr-rise mb-6 ${GLASS} p-6`} style={{ boxShadow: `inset 0 2px 0 ${rgba(acc(PALETTE.royal), 0.75)}`, animationDelay: "40ms" }}>
        <h3 className="font-display text-xl font-bold text-sand">Termómetro de confianza</h3>
        <p className="mb-4 mt-0.5 text-sm text-sand/55">{total} voto{total !== 1 ? "s" : ""} anónimos</p>
        <div className="space-y-2">
          {TERMOMETRO_OPCIONES.map((op) => {
            const v = votos[op.id];
            const pct = total ? Math.round((v / total) * 100) : 0;
            return (
              <div key={op.id} className="relative overflow-hidden rounded-lg border border-white/12 p-3">
                <span aria-hidden className="absolute bottom-0 left-0 top-0" style={{ width: `${pct}%`, background: rgba(op.color, 0.28) }} />
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="text-xl leading-none">{op.emoji}</span>
                    <span className="text-sm font-medium text-sand">{op.texto}</span>
                  </span>
                  <span className="text-xs font-bold tabular-nums text-sand/65">{v} · {pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Columnas */}
      <section aria-label="Tarjetas" className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CATEGORIAS.map((cat, i) => {
          const items = tarjetas.filter((t) => t.categoria === cat.id);
          return (
            <div key={cat.id} className={`rdr-rise ${GLASS} p-4`} style={{ boxShadow: `inset 0 2px 0 ${rgba(acc(cat.color), 0.75)}`, animationDelay: `${80 + i * 50}ms` }}>
              <h3 className="mb-3 font-display text-lg font-bold" style={{ color: acc(cat.color) }}>{cat.titulo}</h3>
              <div className="space-y-3">
                {items.length ? (
                  items.map((t) => <TarjetaArchivo key={t.id} t={t} color={cat.color} />)
                ) : (
                  <p className="text-xs italic text-sand/40">Sin entradas</p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Mejoras */}
      {(data.mejoras || []).length > 0 && (
        <section aria-label="Acciones de mejora" className={`rdr-rise mb-6 ${GLASS} p-6`} style={{ boxShadow: `inset 0 2px 0 ${rgba(MEJORAS_COLOR, 0.75)}`, animationDelay: "230ms" }}>
          <h3 className="mb-4 font-display text-xl font-bold text-lime">Acciones de mejora 📈</h3>
          <div className="space-y-3">
            {data.mejoras.map((m, i) => (
              <article key={m.id || i} className="rounded-xl border border-white/10 bg-lime/[0.06] p-3" style={{ borderLeft: `3px solid ${rgba(MEJORAS_COLOR, 0.85)}` }}>
                <p className="whitespace-pre-line text-sm leading-relaxed text-sand/90">{m.texto}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Participantes */}
      {usuarios.length > 0 && (
        <section aria-label="Participantes" className={`rdr-rise ${GLASS} p-6`} style={{ animationDelay: "280ms" }}>
          <h3 className="mb-3 font-display text-lg font-bold text-sand">Participantes</h3>
          <div className="flex flex-wrap gap-2">
            {usuarios.map((u) => (
              <span key={u} className="rounded-full border border-serene/30 bg-serene/15 px-3 py-1 text-xs font-medium text-serene">{u}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
