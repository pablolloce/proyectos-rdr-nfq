"use client";

import { createContext, useCallback, useContext, useState } from "react";
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

export default function AppFrame({ children }) {
  const [veil, setVeil] = useState(null);

  const leaveTo = useCallback((href, title) => {
    if (!href) return;
    setVeil({ title });
    // breve margen para que el velo pinte antes de la navegación dura
    window.setTimeout(() => {
      window.location.href = href;
    }, 230);
  }, []);

  return (
    <LinksProvider>
      <LoadingScreen />
      <AuthGate>
        <NavCtx.Provider value={{ leaveTo }}>
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
