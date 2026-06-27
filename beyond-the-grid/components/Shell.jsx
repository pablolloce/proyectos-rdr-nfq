"use client";

import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import AuthGate from "./AuthGate";
import Header from "./Header";

/**
 * Chrome común a todas las rutas: proveedor de enlaces + toast, splash,
 * puerta de acceso, cabecera fija y co-branding NFQ. El contenido controla
 * su propio layout (bento scrollable / canvas a pantalla completa).
 */
export default function Shell({ children, backHref, subtitle }) {
  return (
    <LinksProvider>
      <LoadingScreen />
      <AuthGate>
        <div className="relative min-h-dvh w-full">
          <Header backHref={backHref} subtitle={subtitle} />
          {children}
          {/* Co-branding NFQ (regla nº5 CLAUDE.md: presente y menor que BBVA). */}
          <footer className="pointer-events-none fixed bottom-3 left-5 z-30 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-sand/60">Hecho por</span>
            <img src="/team-hub/logos/nfq-white.png?v=2" alt="NFQ" className="h-6 w-auto" />
          </footer>
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
