"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PALETTE } from "@/lib/palette";
import { useTheme, useAccentMap } from "@/lib/theme";
import { formatearFechaLegible, motivoDe } from "./constants";
import { IconClose } from "./icons";

/**
 * Bottom sheet con el detalle de un día (quién falta y por qué). Sustituye al
 * #day-sheet del legacy: se abre al tocar/clicar un día con ausencias.
 * Accesible: dialog modal, Escape y backdrop cierran, foco al abrir.
 */
export default function DaySheet({ sheet, empleadosMap, onClose }) {
  const reduce = useReducedMotion();
  const closeRef = useRef(null);
  const { theme } = useTheme();
  const mapAccent = useAccentMap();
  // Superficie sólida elevada por tema (criterio usePanel de /retro): navy
  // sobre Midnight; en claro, panel casi blanco con tinta Midnight (las
  // utilidades text-sand/text-serene/border-white ya están temadas).
  const panel = theme === "light"
    ? "bg-[#FDFDFE] shadow-[0_-8px_30px_rgba(7,14,70,0.2)]"
    : "bg-[#0b1450] shadow-[0_-8px_30px_rgba(0,0,0,0.4)]";

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheet, onClose]);

  return (
    <AnimatePresence>
      {sheet && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            className="fixed inset-0 z-[70] bg-midnight/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`Ausencias del ${formatearFechaLegible(sheet.dateStr)}`}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: reduce ? 0.1 : 0.3 }}
            className={`fixed inset-x-0 bottom-0 z-[71] mx-auto flex max-h-[70vh] w-full max-w-lg flex-col rounded-t-3xl border border-b-0 border-white/15 ${panel} pb-[max(1rem,env(safe-area-inset-bottom))]`}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/25" aria-hidden />
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand/60">
                  {sheet.ausencias.length} {sheet.ausencias.length === 1 ? "persona ausente" : "personas ausentes"}
                </p>
                <h3 className="font-display text-xl font-bold capitalize leading-tight text-serene">
                  {formatearFechaLegible(sheet.dateStr)}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-sand transition hover:bg-white/[0.12] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                <IconClose size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {sheet.ausencias.map((a, i) => {
                const emp = empleadosMap[a.nombre];
                const motivo = motivoDe(a.motivo);
                return (
                  <div key={`${a.nombre}-${i}`} className="flex items-center gap-3 border-b border-white/[0.07] py-3 last:border-b-0">
                    <span className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/15" style={{ backgroundColor: emp?.color || mapAccent(PALETTE.serene) }} aria-hidden />
                    <span className={`min-w-0 flex-1 truncate text-sm font-bold text-sand ${emp && !emp.activo ? "opacity-60 line-through" : ""}`}>
                      {a.nombre || ""}
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em]"
                      style={{ backgroundColor: motivo.bg, color: motivo.text }}
                    >
                      {motivo.texto}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
