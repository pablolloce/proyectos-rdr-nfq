"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { pointer } from "@/lib/pointerStore";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import AuthGate from "./AuthGate";
import Header from "./Header";
import LinkList from "./LinkList";

// Canvas solo en cliente (WebGL/window) -> sin SSR.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Hub RDR. Sin tarjetas: índice de enlaces elegante a la derecha y el 3D
 * (núcleo de datos) como protagonista a la izquierda. Todo a pantalla completa,
 * sin scroll en desktop.
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
      {/* Velo muy suave (solo refuerza la legibilidad de la columna derecha) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,14,70,0) 40%, rgba(7,14,70,0.45) 75%, rgba(7,14,70,0.6) 100%)",
        }}
      />

      <AuthGate>
        <div className="relative z-10 flex h-screen flex-col">
          <Header />
          <main className="grid flex-1 grid-cols-1 gap-10 px-8 pb-10 lg:grid-cols-2">
            {/* Izquierda: espacio para el 3D + claim de marca */}
            <div className="relative hidden lg:block">
              <p className="absolute bottom-3 left-1 max-w-sm font-display text-3xl font-bold leading-tight text-sand/90">
                Todo el conocimiento del equipo RDR, en un único lugar.
              </p>
            </div>

            {/* Derecha: índice de enlaces (centrado vertical, sin scroll) */}
            <div className="flex items-center">
              <LinkList />
            </div>
          </main>
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
