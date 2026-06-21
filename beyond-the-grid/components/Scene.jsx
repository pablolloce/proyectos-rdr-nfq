"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import DistortedSphere from "./DistortedSphere";

/**
 * Canvas 3D del hero, a pantalla completa. El <Environment/> aporta los reflejos
 * HDRI que hacen que el material se vea premium (cristal/metal) y no plano.
 */
export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={["#070E46"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 6]} intensity={2.2} color="#F7F8F8" />
      <pointLight position={[-6, -3, -4]} intensity={2} color="#1D7CF4" />
      <Suspense fallback={null}>
        <DistortedSphere />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
