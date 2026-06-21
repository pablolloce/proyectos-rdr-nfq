"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { pointer } from "@/lib/pointerStore";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import AuthGate from "./AuthGate";
import Header from "./Header";
import HubSections from "./HubSections";
import Footer from "./Footer";

// Canvas solo en cliente (WebGL/window) -> sin SSR.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Hub RDR. Enfoque dashboard: todo el contenido accesible de inmediato
 * (sin hero a pantalla completa ni animaciones por scroll).
 *
 * Capas:
 *   -z-10  Fondo 3D ambiente (fijo, no captura clics)
 *    z-10  Contenido del hub (tras login)
 *    z-90  Puerta de acceso
 *    z-100 Splash de carga (una vez)
 *    z-9999 Cursor
 */
export default function Experience() {
  // Ratón -> pointerStore (parallax del 3D, sin estado de React).
  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <LinksProvider>
      <CustomCursor />
      <LoadingScreen />

      {/* Fondo 3D ambiente, fijo y detrás de todo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Scene />
      </div>
      {/* Velo para legibilidad sobre el 3D */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(7,14,70,0) 40%, rgba(7,14,70,0.85) 100%)",
        }}
      />

      <AuthGate>
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <HubSections />
          </main>
          <Footer />
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
