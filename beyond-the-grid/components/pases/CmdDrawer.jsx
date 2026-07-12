"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { usePases } from "./PasesRoute";
import { resolverBloquesComandos } from "./comandos";
import { BtnIcon } from "./ui";
import { IconCopy, IconCheck, IconX } from "./icons";

/* Drawer lateral con los comandos de comprobación de un elemento del orden.
   Bloques resueltos contra los datos reales del pase (comandos.js). */

function CopyBtn({ text }) {
  const { showToast } = usePases();
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      showToast("No se pudo copiar al portapapeles", "error");
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copiar al portapapeles"
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${
        copied ? "border-lime/50 bg-lime/15 text-lime" : "border-white/15 bg-white/[0.06] text-sand/70 hover:text-sand"
      }`}
    >
      {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function CmdRow({ txt, esLink }) {
  const { theme } = useTheme();
  // Oscuro: inset negro clásico de terminal. Claro: panel de código claro
  // (tinte electric via bg-white temado) — bg-black/30 sería ilegible en claro.
  // text-lime / text-serene son utilidades temadas: en claro pasan a verde/azul
  // oscuros con contraste AA sobre el panel claro.
  const codeBg = theme === "light" ? "bg-white/[0.08] border border-white/10" : "bg-black/30";
  return (
    <div className="flex items-center gap-2">
      <code className={`min-w-0 flex-1 break-all rounded-md ${codeBg} px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed ${esLink ? "text-serene underline underline-offset-2" : "text-lime"}`}>
        {esLink ? <a href={txt} target="_blank" rel="noopener noreferrer" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene">{txt}</a> : txt}
      </code>
      <CopyBtn text={txt} />
    </div>
  );
}

export default function CmdDrawer({ elemento, onClose }) {
  const { E, tpls } = usePases();
  const reduce = useReducedMotion();
  const closeRef = useRef(null);

  // Esc para cerrar + foco inicial en el botón de cierre (a11y).
  useEffect(() => {
    if (!elemento) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [elemento, onClose]);

  const bloques = elemento ? resolverBloquesComandos(elemento, E, tpls) : [];
  const anim = (x) => (reduce ? {} : x);

  return (
    <AnimatePresence>
      {elemento && (
        <div className="fixed inset-0 z-[96]" role="dialog" aria-modal="true" aria-label={`Comandos de comprobación: ${elemento}`}>
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-midnight/70 backdrop-blur-sm"
            {...anim({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-midnight shadow-2xl"
            {...anim({ initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }, transition: { type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] } })}
          >
            <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-serene/80">Comandos de comprobación</p>
                <h3 className="mt-1 break-words font-display text-lg font-bold leading-snug text-sand">{elemento}</h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                title="Cerrar (Esc)"
                aria-label="Cerrar (Esc)"
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sand/70 transition hover:bg-white/10 hover:text-sand active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                <IconX size={17} />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {bloques.length === 0 && (
                <p className="py-6 text-center text-sm text-sand/60">No hay comandos definidos para este elemento.</p>
              )}
              {bloques.map((b, bi) => (
                <section key={bi} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                  <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-serene">{b.titulo}</h4>
                  <div className="space-y-3">
                    {b.pasos.map((paso, pi) => {
                      if (paso.esSeparador)
                        return <div key={pi} className="pt-1 text-center text-[11px] font-bold uppercase tracking-wider text-sand/45">{paso.desc}</div>;
                      if (paso.agrupado)
                        return (
                          <article key={pi} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                            <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <h5 className="text-[13px] font-bold text-sand">{paso.titulo || `Paso ${pi + 1}`}</h5>
                              {paso.maquinas && <span className="rounded-full bg-purple/15 px-2 py-0.5 text-[10px] font-bold text-purple">{paso.maquinas}</span>}
                            </header>
                            <div className="space-y-1.5">
                              {(paso.comandos || []).map((c, ci) => <CmdRow key={ci} txt={c} />)}
                            </div>
                            {paso.esperado && (
                              <p className="mt-2 rounded-md border-l-2 border-canary/60 bg-canary/[0.07] px-2.5 py-1.5 text-[12px] text-sand/80">
                                <span className="mr-1 font-bold uppercase tracking-wide text-canary">Resultado esperado</span>
                                {paso.esperado}
                              </p>
                            )}
                          </article>
                        );
                      return (
                        <div key={pi}>
                          <p className="mb-1 text-[12px] text-sand/70">{paso.desc || `Paso ${pi + 1}`}</p>
                          <CmdRow txt={paso.txt} esLink={paso.esLink} />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
