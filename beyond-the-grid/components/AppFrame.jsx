"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import AuthGate from "./AuthGate";
import Header from "./Header";

/**
 * Chrome PERSISTENTE de toda la app (vive en el layout, no por página):
 *   - LinksProvider + splash (una vez por sesión) + AuthGate (no se re-autentica
 *     al cambiar de ruta) + cabecera + co-branding NFQ.
 *   - El crossfade/morph entre rutas Next lo gestionan las View Transitions
 *     (next-view-transitions en el layout); el cross-document VT (CSS) las .html.
 *   - `leaveTo` muestra un velo de carga SOLO para páginas pesadas (formaciones),
 *     donde VT no daría feedback durante la descarga.
 */
const NavCtx = createContext({ leaveTo: () => {} });
export const useNav = () => useContext(NavCtx);

function NavVeil({ veil }) {
  return (
    <AnimatePresence>
      {veil && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-3 bg-midnight px-6 text-center"
        >
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.4em] text-serene/80">BBVA × NFQ</p>
          <h3 className="max-w-md font-display text-2xl font-bold leading-tight text-sand sm:text-3xl">
            {veil.title || "Abriendo…"}
          </h3>
          <p className="text-xs text-sand/55">Cargando formación…</p>
          <div aria-hidden className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-white/10 rdr-bar" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavBar({ active }) {
  return <div aria-hidden className="rdr-navbar" data-active={active ? "true" : "false"} />;
}

export default function AppFrame({ children }) {
  const [veil, setVeil] = useState(null);
  const [navActive, setNavActive] = useState(false);
  const veilTimer = useRef(0);

  // Velo de formación con NO-FLASH: navega ya (si está prerenderizado, instantáneo
  // y el velo no llega a salir) y solo muestra el velo si tarda >180ms.
  const leaveTo = useCallback((href, title) => {
    if (!href) return;
    clearTimeout(veilTimer.current);
    veilTimer.current = window.setTimeout(() => setVeil({ title }), 180);
    window.location.href = href;
  }, []);

  // Barra de progreso para navegaciones DURAS a páginas .html del hub, con
  // no-flash (solo si tardan >180ms). Las formaciones (/formacion/*.html) usan el
  // velo: su onClick hace preventDefault, así que aquí se ignoran (defaultPrevented).
  useEffect(() => {
    let t = 0;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href") || "";
      if (!/\.html(\?|#|$)/.test(href)) return;
      clearTimeout(t);
      t = window.setTimeout(() => setNavActive(true), 180);
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); clearTimeout(t); };
  }, []);

  return (
    <LinksProvider>
      <LoadingScreen />
      <AuthGate>
        <NavCtx.Provider value={{ leaveTo }}>
          <NavBar active={navActive} />
          <div className="relative min-h-dvh w-full">
            <Header />
            {children}
            {/* Co-branding NFQ (regla nº5 CLAUDE.md: presente y menor que BBVA). */}
            <footer className="pointer-events-none fixed bottom-3 left-5 z-30 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-sand/60">Hecho por</span>
              <img src="/team-hub/logos/nfq-white.png?v=2" alt="NFQ" className="h-6 w-auto" />
            </footer>
          </div>
          <NavVeil veil={veil} />
        </NavCtx.Provider>
      </AuthGate>
    </LinksProvider>
  );
}
