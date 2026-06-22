"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { pointer } from "@/lib/pointerStore";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import AuthGate from "./AuthGate";
import Header from "./Header";
import LinkCloud from "./LinkCloud";

// Esfera fragmentada (cada fragmento = link): solo cliente (WebGL).
const FacetIndex = dynamic(() => import("./FacetIndex"), { ssr: false });

// En móvil fragmentos diminutos no son cómodos -> lista (LinkCloud).
function useIsDesktop() {
  const [d, setD] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 768px)");
    const f = () => setD(m.matches);
    f(); m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return d;
}

/**
 * Index: esfera premium que se FRAGMENTA en partes, y cada parte es un link
 * (se separa al pasar el ratón). En móvil, lista de chips. Tras la puerta de acceso.
 */
export default function Experience() {
  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  const desktop = useIsDesktop();

  return (
    <LinksProvider>
      <LoadingScreen />
      <AuthGate>
        <div className="relative h-screen w-screen overflow-hidden">
          {/* Canvas 3D a pantalla COMPLETA; el resto flota encima */}
          {desktop ? <FacetIndex /> : <div className="h-full overflow-auto pt-24"><LinkCloud /></div>}
          <Header />
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
