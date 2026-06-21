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

// Canvas solo en cliente (WebGL/window) -> sin SSR.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Hub RDR. Dashboard a pantalla completa: todo el contenido visible sin scroll
 * (en desktop). El 3D queda de fondo (núcleo de datos) y la sesión vive en la
 * cabecera. Animaciones de entrada (Framer), no de scroll.
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
      {/* Velo suave para legibilidad sin tapar la figura */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(125% 90% at 50% 28%, rgba(7,14,70,0) 32%, rgba(7,14,70,0.55) 100%)",
        }}
      />

      <AuthGate>
        <div className="relative z-10 flex h-screen flex-col">
          <Header />
          <HubSections />
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
