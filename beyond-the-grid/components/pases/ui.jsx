"use client";

import { useLayoutEffect, useRef } from "react";

/* Primitivas visuales compartidas de la ruta /pases.
   Glass sobre Midnight con acento lime (#88E783), como la sección
   "Proyectos" del hub. */

export const ACCENT = "#88E783"; // PALETTE.lime

// Tarjeta glass estándar (misma receta que el hub/formación).
export const CARD_CLS =
  "relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] backdrop-blur-md";

// Inputs/selects sobre fondo oscuro.
export const INPUT_CLS =
  "w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-[13px] font-semibold text-sand placeholder:font-normal placeholder:text-sand/35 transition hover:bg-white/[0.09] focus:border-serene focus:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-serene/60";

export const SELECT_CLS = INPUT_CLS + " appearance-none pr-8 [&>option]:bg-midnight [&>option]:text-sand";

export const LABEL_CLS =
  "text-[10px] font-bold uppercase tracking-[0.08em] text-sand/60";

// Botones (variantes BBVA sobre oscuro; texto Electric sobre acentos — regla 9).
const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-sans text-sm font-bold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

export const BTN = {
  primary: `${BTN_BASE} bg-electric text-sand hover:brightness-125 border border-serene/30`,
  accent: `${BTN_BASE} bg-serene text-electric hover:brightness-95`,
  success: `${BTN_BASE} bg-lime text-electric hover:brightness-95`,
  warn: `${BTN_BASE} bg-mandarin text-electric hover:brightness-95`,
  danger: `${BTN_BASE} border border-white/20 bg-white/10 text-sand hover:bg-white/15`,
  ghost: `${BTN_BASE} border border-white/15 bg-transparent text-sand/85 hover:bg-white/[0.08]`,
};

export function BtnIcon({ title, danger, className = "", ...p }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sand/70 transition hover:bg-white/10 hover:text-sand active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${
        danger ? "hover:bg-mandarin/15 hover:text-mandarin" : ""
      } ${className}`}
      {...p}
    />
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className={LABEL_CLS}>{label}</span>
      {children}
    </label>
  );
}

/**
 * Textarea de una línea que crece con el contenido (autosize), estilo
 * "inline-input" del legacy. Re-mide en cada cambio de valor y al montar.
 */
export function AutoTextarea({ value, className = "", ...p }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    // offsetParent null = panel oculto: scrollHeight sería 0, no tocamos.
    if (ta.offsetParent !== null) ta.style.height = ta.scrollHeight + 2 + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      className={`resize-none overflow-hidden whitespace-pre-wrap break-words leading-[1.35] ${className}`}
      {...p}
    />
  );
}

/** Bloque vacío / mensaje informativo dentro de un panel. */
export function Empty({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm italic text-sand/50">
      {children}
    </div>
  );
}

/** Título de sección dentro de un panel. */
export function PanelTitle({ children, sub }) {
  return (
    <header className="mb-4">
      <h3 className="font-display text-xl font-bold text-sand">{children}</h3>
      {sub && <p className="mt-1 text-sm text-sand/65">{sub}</p>}
    </header>
  );
}
