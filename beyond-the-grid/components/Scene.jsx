"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import DistortedSphere from "./DistortedSphere";

/**
 * Fondo 3D AMBIENTE (no interactivo, detrás del contenido del hub).
 * Fondo Midnight para que cualquier zona "vacía" case con la marca BBVA.
 * Sin Environment HDRI (evita descargas y frames oscuros): iluminación propia.
 */
export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      dpr={1} // va difuminado de fondo: no necesita resolución retina (mucho más fluido)
    >
      <color attach="background" args={["#070E46"]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 4]} intensity={1.4} color="#F7F8F8" />
      <pointLight position={[-4, -2, -2]} intensity={2} color="#85C8FF" />
      <pointLight position={[4, 2, 2]} intensity={1.2} color="#001391" />

      <Suspense fallback={null}>
        <DistortedSphere />
      </Suspense>
    </Canvas>
  );
}
