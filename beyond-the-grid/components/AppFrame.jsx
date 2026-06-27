"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import AuthGate from "./AuthGate";
import Header from "./Header";

/**
 * Chrome PERSISTENTE de toda la app (vive en el layout, no por página):
 *   - LinksProvider + splash (una vez por sesión) + AuthGate (no se re-autentica
 *     al cambiar de ruta) + cabecera + co-branding NFQ.
 *   - Crossfade entre rutas Next (index <-> /formacion) con framer-motion.
 *   - Velo de salida al navegar a páginas .html (recarga dura) -> da feedback y
 *     evita el salto brusco, sobre todo en las formaciones (pesadas).
 * Solo opacidad en las transiciones: un transform en un ancestro rompería el
 * `position: fixed` del canvas 3D de /formacion.
 */
const NavCtx = createContext({ leaveTo: () => {} });
export const useNav = () => useContext(NavCtx);

function RouteTransition({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  if (reduce) return children;
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

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
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-5 bg-midnight"
        >
          <span aria-hidden className="h-9 w-9 animate-spin rounded-full border-2 border-serene/25 border-t-serene" />
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-serene/80">{veil.label}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AppFrame({ children }) {
  const [veil, setVeil] = useState(null);

  const leaveTo = useCallback((href, label = "Abriendo…") => {
    if (!href) return;
    setVeil({ label });
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
            <RouteTransition>{children}</RouteTransition>
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
