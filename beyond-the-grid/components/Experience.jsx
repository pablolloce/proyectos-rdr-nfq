"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import AuthGate from "./AuthGate";
import Header from "./Header";
import LinkCloud from "./LinkCloud";

// Esfera + malla de nodos (cada nodo = link): solo cliente (WebGL).
const FacetIndex = dynamic(() => import("./FacetIndex"), { ssr: false });

// En móvil y tablet la malla 3D con pills no es cómoda al tacto -> lista (LinkCloud).
function useIsDesktop() {
  const [d, setD] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const f = () => setD(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return d;
}

/**
 * Index: malla 3D donde cada nodo es un link (la figura se frena al pasar el
 * ratón). En pantallas pequeñas, lista de chips. Todo tras la puerta de acceso.
 */
export default function Experience() {
  const desktop = useIsDesktop();

  return (
    <LinksProvider>
      <LoadingScreen />
      <AuthGate>
        <div className="relative h-screen w-screen overflow-hidden">
          {/* Canvas 3D a pantalla COMPLETA; el resto flota encima */}
          {desktop ? (
            <FacetIndex />
          ) : (
            <div className="h-full overflow-auto pb-16 pt-24">
              <LinkCloud />
            </div>
          )}
          <Header />
          {/* Co-branding NFQ (regla nº5 CLAUDE.md: NFQ en todas las vistas, menor que BBVA). */}
          <footer className="pointer-events-none absolute bottom-4 left-6 z-20 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-sand/60">Hecho por</span>
            <img src="/team-hub/logos/nfq-white.png" alt="NFQ" className="h-6 w-auto" />
          </footer>
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
