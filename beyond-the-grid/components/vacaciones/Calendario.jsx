"use client";

import { useEffect, useRef, useState } from "react";
import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { useTheme, useAccentMap } from "@/lib/theme";
import {
  MESES, DIAS_SEMANA, MAX_DOTS, UMBRAL_ALERTA,
  festivoStyle, festivoNumColor, alertColor, FESTIVO_LABEL,
  dateKey, motivoDe,
} from "./constants";

const ACCENT = PALETTE.mandarin;

/** ¿El dispositivo tiene puntero con hover? (tooltip) o es táctil (bottom sheet). */
function useCanHover() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(hover: hover) and (pointer: fine)");
    const f = () => setCan(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return can;
}

/** Tooltip flotante (sustituto React del tippy.js del legacy, solo desktop). */
function DayTooltip({ tip }) {
  const { theme } = useTheme();
  const mapAccent = useAccentMap();
  if (!tip) return null;
  const left = Math.min(Math.max(tip.x, 150), (typeof window !== "undefined" ? window.innerWidth : 1200) - 150);
  // Superficie sólida elevada por tema (mismo criterio que usePanel de /retro):
  // navy sobre Midnight, panel casi blanco con tinta Midnight sobre Sand.
  const panel = theme === "light"
    ? "bg-[#FDFDFE]/95 shadow-[0_18px_40px_-12px_rgba(7,14,70,0.3)]"
    : "bg-[#0c1656]/95 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]";
  return (
    <div
      role="tooltip"
      className={`pointer-events-none fixed z-50 w-[280px] -translate-x-1/2 -translate-y-full rounded-xl border border-serene/25 ${panel} p-3 backdrop-blur-md`}
      style={{ left, top: tip.y - 10 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-serene">
        Ausencias ({tip.ausencias.length})
      </p>
      <hr className="my-2 border-white/15" />
      {tip.ausencias.map((a, i) => {
        const emp = tip.empleadosMap[a.nombre];
        const motivo = motivoDe(a.motivo);
        return (
          <div key={`${a.nombre}-${i}`} className="mb-2 flex items-center justify-between gap-3 last:mb-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: emp?.color || mapAccent(PALETTE.serene) }} />
              <span className={`truncate text-[13px] text-sand ${emp && !emp.activo ? "opacity-60 line-through" : ""}`}>
                {emp?.nombre || a.nombre}
              </span>
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]"
              style={{ backgroundColor: motivo.bg, color: motivo.text }}
            >
              {motivo.texto}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DayCell({ dia, dateStr, esHoy, esFinde, festivo, alerta, ausencias, empleadosMap, canHover, onOpenDay, onTip }) {
  const { theme } = useTheme();
  const light = theme === "light";
  const conGente = ausencias.length > 0;

  let cls = "relative flex min-h-[52px] flex-col rounded-md border p-1 transition sm:min-h-[48px]";
  const style = {};
  const sombras = [];
  if (festivo && festivoStyle(festivo, theme)) {
    Object.assign(style, festivoStyle(festivo, theme));
  } else if (esHoy) {
    // border-serene/80 es utilidad temada (claro -> #155FA8). El relleno
    // electric al 50% del legacy se rebaja en claro (sería demasiado denso
    // para la tinta Midnight del número y de los +N).
    cls += " border-serene/80";
    style.background = light ? "rgba(0,19,145,0.08)" : "rgba(0,19,145,0.5)";
    sombras.push(`inset 0 0 0 1px ${light ? "rgba(21,95,168,0.6)" : "rgba(133,200,255,0.6)"}`);
  } else if (esFinde) {
    cls += " border-white/10 bg-white/[0.07]";
  } else {
    cls += " border-white/10 bg-white/[0.03]";
  }
  // Alerta de personal: anillo rojo interior (compatible con el foco global,
  // que usa outline). Equivale al ::before rojo del legacy.
  if (alerta) sombras.push(`inset 0 0 0 2px ${alertColor(theme)}`);
  if (sombras.length) style.boxShadow = sombras.join(", ");
  if (conGente) cls += " cursor-pointer hover:-translate-y-px hover:border-serene/60";

  const numColor = esHoy ? undefined : festivo ? festivoNumColor(festivo, theme) : undefined;

  const inner = (
    <>
      {esHoy ? (
        <span className="mb-1 grid h-[22px] w-[22px] place-items-center rounded-full bg-serene text-xs font-bold text-midnight">{dia}</span>
      ) : (
        <span className="mb-1 pl-0.5 text-xs font-bold text-sand/60" style={numColor ? { color: numColor } : undefined}>{dia}</span>
      )}
      {conGente && (
        <span className="mt-auto flex flex-wrap items-center justify-center gap-[3px]">
          {ausencias.slice(0, MAX_DOTS).map((a, i) => (
            <span
              key={`${a.nombre}-${i}`}
              className="h-[7px] w-[7px] rounded-full ring-1 ring-white/30 sm:h-[7px] sm:w-[7px]"
              style={{ backgroundColor: empleadosMap[a.nombre]?.color || (light ? "#C05621" : PALETTE.mandarin) }}
            />
          ))}
          {ausencias.length > MAX_DOTS && (
            <span className="flex h-[12px] items-center rounded bg-white/20 px-1 text-[9px] font-bold text-sand">
              +{ausencias.length - MAX_DOTS}
            </span>
          )}
        </span>
      )}
    </>
  );

  const partes = [];
  if (festivo) partes.push(FESTIVO_LABEL[festivo]);
  if (alerta) partes.push("alerta de personal");
  const ariaLabel = `Día ${dia}: ${ausencias.length} ausencia${ausencias.length === 1 ? "" : "s"}${partes.length ? " · " + partes.join(" · ") : ""}`;

  // Con ausencias: la celda es un botón (tap/Enter abre el detalle; hover con
  // puntero fino muestra tooltip, como tippy en el legacy).
  if (conGente) {
    return (
      <button
        type="button"
        className={`${cls} text-left`}
        style={style}
        aria-label={ariaLabel}
        onClick={() => { onTip(null); onOpenDay(dateStr, ausencias); }}
        onMouseEnter={canHover ? (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onTip({ x: r.left + r.width / 2, y: r.top, ausencias, empleadosMap });
        } : undefined}
        onMouseLeave={canHover ? () => onTip(null) : undefined}
      >
        {inner}
      </button>
    );
  }
  return <div className={cls} style={style}>{inner}</div>;
}

function MonthCard({ mes, anio, hoyStr, festivos, ausenciasPorDia, filtros, totalActivos, empleadosMap, canHover, onOpenDay, onTip, delay }) {
  const { theme } = useTheme();
  const mapAccent = useAccentMap();
  const primerDia = new Date(anio, mes, 1);
  const ultDia = new Date(anio, mes + 1, 0);
  let offset = primerDia.getDay() - 1;
  if (offset === -1) offset = 6;

  const celdas = [];
  let contieneHoy = false;

  for (let i = 0; i < offset; i++) celdas.push(<div key={`e${i}`} aria-hidden />);

  for (let dia = 1; dia <= ultDia.getDate(); dia++) {
    const fechaObj = new Date(anio, mes, dia);
    const dateStr = dateKey(fechaObj);
    const esHoy = dateStr === hoyStr;
    if (esHoy) contieneHoy = true;
    const esFinde = fechaObj.getDay() === 0 || fechaObj.getDay() === 6;
    const festivo = festivos[dateStr];

    const ausencias = Array.from(ausenciasPorDia[dateStr] || []);
    const ausenciasMostrar = filtros.size > 0 ? ausencias.filter((a) => filtros.has(a.nombre)) : ausencias;

    // La alerta usa TODAS las ausencias (no las filtradas), como el legacy.
    const disponibles = totalActivos - ausencias.length;
    const alerta = disponibles < UMBRAL_ALERTA && !esFinde && !festivo;

    celdas.push(
      <DayCell
        key={dateStr}
        dia={dia}
        dateStr={dateStr}
        esHoy={esHoy}
        esFinde={esFinde}
        festivo={festivo}
        alerta={alerta}
        ausencias={ausenciasMostrar}
        empleadosMap={empleadosMap}
        canHover={canHover}
        onOpenDay={onOpenDay}
        onTip={onTip}
      />
    );
  }

  return (
    <section
      aria-label={`${MESES[mes]} ${anio}`}
      className={`rdr-rise rounded-2xl border p-4 backdrop-blur-md transition hover:-translate-y-1 ${
        theme === "light"
          ? "hover:shadow-[0_24px_48px_-20px_rgba(7,14,70,0.25)]"
          : "hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]"
      } ${contieneHoy ? "bg-white/[0.07]" : "border-white/12 bg-white/[0.055]"}`}
      style={{
        animationDelay: `${delay}ms`,
        ...(contieneHoy ? { borderColor: rgba(ACCENT, 0.65), boxShadow: `0 0 24px -8px ${rgba(ACCENT, 0.35)}` } : null),
      }}
    >
      <h3 className="mb-3 flex items-baseline justify-between font-display text-lg font-bold text-sand">
        {MESES[mes]}
        {contieneHoy && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ background: rgba(ACCENT, 0.15), color: mapAccent(ACCENT) }}>
            Mes actual
          </span>
        )}
      </h3>
      <div className="mb-2 grid grid-cols-7 border-b border-white/10 pb-2 text-center text-[10px] font-bold tracking-[0.06em] text-sand/50">
        {DIAS_SEMANA.map((d) => (<span key={d}>{d}</span>))}
      </div>
      <div className="grid grid-cols-7 gap-1">{celdas}</div>
    </section>
  );
}

/**
 * Calendario anual (12 meses). Misma lógica que el legacy: semana empieza en
 * lunes, festivos ES/MX/AMBOS, hoy resaltado, puntos por ausencia (máx. 8 + N),
 * alerta si quedan <10 disponibles en día laborable, filtros por persona.
 */
export default function Calendario({ datos, filtros, totalActivos, onOpenDay }) {
  const canHover = useCanHover();
  const [tip, setTip] = useState(null);
  const tipRef = useRef(null);
  tipRef.current = tip;

  // El tooltip es fijo (viewport): si el usuario hace scroll, se cierra.
  useEffect(() => {
    const onScroll = () => { if (tipRef.current) setTip(null); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anio = datos.year || new Date().getFullYear();
  const hoyStr = dateKey(new Date());

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3" role="presentation">
      {Array.from({ length: 12 }, (_, mes) => (
        <MonthCard
          key={mes}
          mes={mes}
          anio={anio}
          hoyStr={hoyStr}
          festivos={datos.festivos || {}}
          ausenciasPorDia={datos.ausenciasPorDia || {}}
          filtros={filtros}
          totalActivos={totalActivos}
          empleadosMap={datos.empleadosMap || {}}
          canHover={canHover}
          onOpenDay={onOpenDay}
          onTip={setTip}
          delay={mes * 30}
        />
      ))}
      {canHover && <DayTooltip tip={tip} />}
    </div>
  );
}
