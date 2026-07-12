"use client";

import { useMemo } from "react";
import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { useTheme, useAccentMap } from "@/lib/theme";
import {
  dateKey, addDays, DIA_LETRA,
  formatearFechaLegible, motivoDe, motivoChipStyle,
} from "./constants";
import { IconCheck, IconAlert } from "./icons";

const ACCENT = PALETTE.mandarin;

/** Chip nombre+motivo con tinte del motivo (texto temado AA). */
function PersonaChip({ nombre, motivo, theme, compact = false }) {
  const m = motivoDe(motivo);
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full font-bold ${compact ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[12px]"}`}
      style={motivoChipStyle(motivo, theme)}
      title={m.texto}
    >
      <span className="truncate">{nombre}</span>
      {!compact && <span className="shrink-0 opacity-75">· {m.texto}</span>}
    </span>
  );
}

/**
 * Resumen "Ahora" (hero): cuánta gente falta HOY y qué viene en los próximos
 * 7 días, con la fecha real del cliente. Si el año publicado por el backend
 * no es el año en curso, se muestra el aviso en su lugar (el dato manda: no
 * tendría sentido un "hoy" calculado sobre otro año).
 */
export default function AhoraPanel({ datos, hoy }) {
  const { theme } = useTheme();
  const mapAccent = useAccentMap();

  const hoyStr = dateKey(hoy);
  const anioActual = hoy.getFullYear();
  const anioDato = datos.year || anioActual;
  const desfase = anioDato !== anioActual;

  const ausenciasPorDia = datos.ausenciasPorDia || {};
  const hoyAusentes = useMemo(
    () => Array.from(ausenciasPorDia[hoyStr] || []),
    [ausenciasPorDia, hoyStr]
  );

  // Próximos 7 días LABORABLES (hoy+1 en adelante, saltando sábados y
  // domingos); se omiten además los días sin ausencias.
  const proximos = useMemo(() => {
    const out = [];
    for (let i = 1, laborables = 0; laborables < 7 && i <= 11; i++) {
      const d = addDays(hoy, i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue; // fin de semana: fuera
      laborables++;
      const k = dateKey(d);
      const aus = ausenciasPorDia[k];
      if (aus && aus.length > 0) out.push({ dateStr: k, dia: d.getDate(), letra: DIA_LETRA[dow], ausencias: aus });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ausenciasPorDia, hoyStr]);

  return (
    <section
      aria-label="Resumen de ausencias de hoy y próximos días"
      className="mb-6 rounded-2xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-md"
      style={{ boxShadow: `inset 0 2px 0 ${rgba(ACCENT, 0.6)}` }}
    >
      {desfase ? (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0" style={{ color: mapAccent(ACCENT) }} aria-hidden>
            <IconAlert size={20} />
          </span>
          <div>
            <p className="font-display text-base font-bold text-sand">
              Los datos publicados corresponden a {anioDato}.
            </p>
            <p className="mt-1 text-sm text-sand/65">
              Estamos en {anioActual}: el resumen de «hoy» y «próximos 7 días» no aplica al calendario mostrado.
              El calendario y la vista por personas reflejan el año {anioDato} del backend.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          {/* Hoy */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sand/50">
              Hoy · <span className="capitalize">{formatearFechaLegible(hoyStr)}</span>
            </p>
            {hoyAusentes.length > 0 ? (
              <>
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold leading-none tabular-nums" style={{ color: mapAccent(ACCENT) }}>
                    {hoyAusentes.length}
                  </span>
                  <span className="text-sm font-bold text-sand/75">
                    {hoyAusentes.length === 1 ? "persona ausente" : "personas ausentes"}
                  </span>
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Ausentes hoy">
                  {hoyAusentes.map((a, i) => (
                    <li key={`${a.nombre}-${i}`} className="max-w-full">
                      <PersonaChip nombre={a.nombre} motivo={a.motivo} theme={theme} />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-lime">
                <IconCheck size={16} aria-hidden /> Todo el equipo disponible
              </p>
            )}
          </div>

          {/* Próximos 7 días */}
          <div className="md:border-l md:border-white/10 md:pl-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sand/50">Próximos días laborables</p>
            {proximos.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {proximos.map((p) => (
                  <li key={p.dateStr} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="w-12 shrink-0 text-[12px] font-bold tabular-nums text-sand/80">
                      {p.letra} {p.dia}
                    </span>
                    <span className="shrink-0 text-[11px] text-sand/55">
                      {p.ausencias.length} {p.ausencias.length === 1 ? "ausente" : "ausentes"} ·
                    </span>
                    <span className="flex min-w-0 flex-wrap gap-1">
                      {p.ausencias.map((a, i) => (
                        <PersonaChip key={`${a.nombre}-${i}`} nombre={a.nombre} motivo={a.motivo} theme={theme} compact />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-sand/55">Sin ausencias previstas esta semana.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
