"use client";

import { useEffect, useRef } from "react";
import { PALETTE } from "@/lib/palette";
import { useTheme } from "@/lib/theme";
import { IconCheck, IconInfo } from "./icons";

// Tarjeta glass estándar de la ruta (misma receta que el hub y /formacion).
export const GLASS = "rounded-2xl border border-white/12 bg-white/[0.055] backdrop-blur-md";

/**
 * Superficie SÓLIDA elevada (modal, dropdown, toast): a diferencia del glass,
 * necesita un fondo opaco por tema. Oscuro: panel navy con sombra profunda;
 * claro: panel casi blanco con tinta Midnight y elevación suave.
 */
export function usePanel() {
  const { theme } = useTheme();
  return theme === "light"
    ? "border border-white/15 bg-[#FDFDFE]/95 shadow-[0_24px_60px_-24px_rgba(7,14,70,0.35)] backdrop-blur-md"
    : "border border-white/12 bg-[#0d1642]/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md";
}

/** Fondo ambiental con blobs (mismo patrón que ProgresoSkeleton/BentoHub). */
export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <span className="rdr-blob left-[-8%] top-[4%] h-80 w-80" style={{ background: PALETTE.mandarin }} />
      <span className="rdr-blob right-[-4%] top-[-10%] h-72 w-72" style={{ background: PALETTE.royal, animationDelay: "-4s" }} />
      <span className="rdr-blob bottom-[-12%] right-[10%] h-96 w-96" style={{ background: PALETTE.purple, animationDelay: "-8s" }} />
      <span className="rdr-blob bottom-[2%] left-[10%] h-64 w-64" style={{ background: PALETTE.lime, animationDelay: "-12s" }} />
    </div>
  );
}

/** Spinner accesible (sustituye al fa-spinner del legacy). */
export function Spinner({ className = "" }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-serene/30 border-t-serene ${className}`}
    />
  );
}

/**
 * Modal genérico: cierra con Escape y clic fuera, enfoca [data-autofocus]
 * (o el propio diálogo) al abrir. aria-modal + role dialog.
 */
export function Modal({ open, onClose, labelledBy, maxW = "max-w-md", children }) {
  const panel = usePanel();
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      const el = ref.current && (ref.current.querySelector("[data-autofocus]") || ref.current);
      if (el && el.focus) el.focus();
    }, 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-midnight/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`max-h-[85vh] w-full ${maxW} overflow-y-auto rounded-2xl ${panel} p-6 focus:outline-none`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Diálogo de alerta/confirmación (sustituye a customAlert/customConfirm).
 * dialog = { msg, confirm?: bool, onOk?: fn } | null
 */
export function DialogHost({ dialog, onClose }) {
  return (
    <Modal open={!!dialog} onClose={onClose} labelledBy="retro-dialog-title" maxW="max-w-sm">
      {dialog && (
        <>
          <h3 id="retro-dialog-title" className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-sand">
            <IconInfo size={18} className="text-mandarin" /> Retro RDR
          </h3>
          <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-sand/75">{dialog.msg}</p>
          <div className="flex justify-end gap-3">
            {dialog.confirm && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-sand/70 transition hover:bg-white/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              data-autofocus
              onClick={() => {
                onClose();
                if (dialog.onOk) dialog.onOk();
              }}
              className="rounded-lg bg-[#FFB56B] px-5 py-2 text-sm font-bold text-[#001391] shadow transition hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              Aceptar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/**
 * Toast propio de la retro (replica el del legacy: estado "progreso" con
 * spinner persistente y estado "éxito" con check que se autooculta).
 * toast = { msg, kind: "progress" | "success" } | null
 */
export function RetroToast({ toast }) {
  const panel = usePanel();
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-16 right-4 z-[90]">
      {toast && (
        <div className={`flex items-center gap-3 rounded-xl ${panel} px-5 py-3`}>
          {toast.kind === "success" ? <IconCheck size={16} className="shrink-0 text-lime" /> : <Spinner />}
          <span className="text-sm font-medium text-sand">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

/** Bloque skeleton (shimmer .rdr-skel de globals.css). */
export function Skel({ className = "" }) {
  return <div aria-hidden className={`rdr-skel rounded-xl ${className}`} />;
}
