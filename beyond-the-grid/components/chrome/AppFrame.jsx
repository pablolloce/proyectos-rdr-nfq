"use client";

import { LinksProvider } from "@/lib/links";
import { ThemeProvider, useTheme } from "@/lib/theme";
import LoadingScreen from "./LoadingScreen";
import AuthGate from "./AuthGate";
import Header from "./Header";

/* Logo NFQ según tema (blanco sobre Midnight, negro sobre Sand). */
function NfqLogo() {
  const { theme } = useTheme();
  const src = theme === "light" ? "/team-hub/logos/nfq-black.png" : "/team-hub/logos/nfq-white.png?v=2";
  return <img src={src} alt="NFQ" className="h-6 w-auto" />;
}

/**
 * Chrome PERSISTENTE de la app: proveedor de enlaces + splash (1×sesión) +
 * puerta de acceso + cabecera + co-branding NFQ.
 *
 * Transiciones: el SPA (index <-> /formacion) lo anima next-view-transitions
 * (provider en el layout). Las páginas .html llevan SU PROPIO splash de carga;
 * el hub solo navega (con prerender en hover vía Speculation Rules). Sin velos
 * ni barras propias para no apilar pantallas de carga.
 */
export default function AppFrame({ children }) {
  return (
    <ThemeProvider>
      <LinksProvider>
        <LoadingScreen />
        <AuthGate>
          <div className="relative min-h-dvh w-full">
            {/* Skip-link para teclado: oculto hasta recibir foco (a11y). */}
            <a
              href="#contenido"
              className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-serene px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-midnight shadow-lg transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand"
            >
              Saltar al contenido
            </a>
            <Header />
            <div id="contenido">{children}</div>
            {/* Co-branding NFQ (regla nº5 CLAUDE.md: presente y menor que BBVA). */}
            <footer className="pointer-events-none fixed bottom-3 left-5 z-30 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-sand/60">Hecho por</span>
              <NfqLogo />
            </footer>
          </div>
        </AuthGate>
      </LinksProvider>
    </ThemeProvider>
  );
}
