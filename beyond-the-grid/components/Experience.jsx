"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "@/hooks/useLenis";
import { useGsapAnimations } from "@/hooks/useGsapAnimations";
import { scrollStore } from "@/lib/scrollStore";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import Hero from "./Hero";
import ContentSection from "./ContentSection";

// El Canvas usa WebGL/window -> lo cargamos solo en cliente (sin SSR).
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Orquestador de toda la experiencia (client component).
 *
 * Capas (de atrás hacia delante por z-index):
 *   z-0     -> Scene 3D fija a pantalla completa (fondo)
 *   z-10    -> Contenido HTML scrolleable (Hero + secciones)
 *   z-100   -> Pantalla de carga
 *   z-9999  -> Cursor personalizado
 */
export default function Experience() {
  const scope = useRef(null); // contenedor para acotar los selectores de GSAP
  const [loaded, setLoaded] = useState(false);

  useLenis(); // smooth scroll global
  useGsapAnimations(scope, loaded); // coreografía (se arma al terminar la carga)

  // Listener de ratón -> escribe en scrollStore para el parallax del objeto 3D.
  // (No usa estado de React: lectura directa en el useFrame de la escena.)
  useEffect(() => {
    const onMove = (e) => {
      scrollStore.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollStore.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <CustomCursor />
      <LoadingScreen onComplete={() => setLoaded(true)} />

      {/* Fondo 3D fijo */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Contenido por encima del Canvas */}
      <main ref={scope} className="relative z-10">
        <Hero />
        <ContentSection />
      </main>
    </>
  );
}
