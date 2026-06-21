"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { pointer } from "@/lib/pointerStore";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import AuthGate from "./AuthGate";
import Header from "./Header";
import Hero from "./Hero";
import LinkCloud from "./LinkCloud";

// Canvas 3D solo en cliente (WebGL).
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Hero inmersivo "BEYOND THE GRID": esfera distorsionada premium a pantalla
 * completa (fija, con parallax de ratón) + título enorme. Debajo, el hub.
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

  return (
    <LinksProvider>
      <CustomCursor />
      <LoadingScreen />

      {/* Canvas 3D fijo a pantalla completa (fondo premium) */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      <AuthGate>
        <div className="relative z-10">
          <Header />
          <Hero />
          {/* El hub, accesible al hacer scroll bajo el hero */}
          <div className="bg-midnight/40 backdrop-blur-sm">
            <LinkCloud />
          </div>
        </div>
      </AuthGate>
    </LinksProvider>
  );
}
