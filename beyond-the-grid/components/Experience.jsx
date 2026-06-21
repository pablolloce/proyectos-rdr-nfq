"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { pointer } from "@/lib/pointerStore";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import AuthGate from "./AuthGate";
import Header from "./Header";
import LinkCloud from "./LinkCloud";

// Canvas solo en cliente (WebGL/window) -> sin SSR.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Hub RDR. Núcleo de datos 3D centrado como protagonista + enlaces como chips
 * de cristal flotantes por encima. Todo a pantalla completa, sin scroll.
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

      {/* Fondo 3D ambiente. z-0 (no -z-10) para que NUNCA quede tras el body. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Scene />
      </div>
      {/* Velo suave radial para legibilidad de los chips sin tapar la figura */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, rgba(7,14,70,0) 35%, rgba(7,14,70,0.5) 100%)",
        }}
      />

      <AuthGate>
        <div className="relative z-10 flex h-screen flex-col">
          <Header />
          <main className="flex-1">
            <LinkCloud />
          </main>
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
