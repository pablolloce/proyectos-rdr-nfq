"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "@/hooks/useLenis";
import { useGsapAnimations } from "@/hooks/useGsapAnimations";
import { scrollStore } from "@/lib/scrollStore";
import { LinksProvider } from "@/lib/links";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import AuthGate from "./AuthGate";
import Hero from "./Hero";
import HubSections from "./HubSections";
import Footer from "./Footer";

// El Canvas usa WebGL/window -> solo cliente (sin SSR).
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Orquestador de la experiencia (client component).
 *
 * Capas (por z-index):
 *   z-0     -> Scene 3D fija a pantalla completa (fondo, siempre visible)
 *   z-10    -> Contenido del hub (Hero + secciones + footer), tras login
 *   z-90    -> Puerta de acceso (AuthGate) hasta autenticarse
 *   z-100   -> Pantalla de carga
 *   z-9999  -> Cursor personalizado
 *
 * Las animaciones GSAP se arman cuando loader terminó Y el usuario está
 * autenticado (el contenido ya está en el DOM para que ScrollTrigger mida bien).
 */
export default function Experience() {
  const scope = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(false);

  useLenis();
  useGsapAnimations(scope, loaded && authed);

  // Ratón -> scrollStore (parallax del 3D, sin estado de React).
  useEffect(() => {
    const onMove = (e) => {
      scrollStore.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollStore.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <LinksProvider>
      <CustomCursor />
      <LoadingScreen onComplete={() => setLoaded(true)} />

      {/* Fondo 3D fijo (visible también tras el login) */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Puerta de acceso: hasta autenticar muestra el login; luego, el hub */}
      <AuthGate onAuthed={() => setAuthed(true)}>
        <main ref={scope} className="relative z-10">
          <Hero />
          <HubSections />
          <Footer />
        </main>
      </AuthGate>
    </LinksProvider>
  );
}
