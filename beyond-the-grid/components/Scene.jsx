"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import DistortedSphere from "./DistortedSphere";

/**
 * Canvas 3D de fondo, a pantalla completa. Se monta solo en cliente
 * (lo importamos con dynamic ssr:false desde Experience.jsx).
 *
 * El <Environment/> aporta reflejos HDRI -> es lo que hace que el material
 * se vea "premium" en lugar de plano.
 */
export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]} // nitidez en pantallas retina sin pasarnos de carga
    >
      {/* Fondo del propio canvas */}
      <color attach="background" args={["#05060d"]} />

      {/* Iluminación base */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 3]} intensity={2.2} />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#1D7CF4" />

      <Suspense fallback={null}>
        <DistortedSphere />
        {/* Reflejos premium. Quita o cambia el preset si trabajas offline. */}
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
