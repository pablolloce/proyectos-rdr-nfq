"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { MathUtils } from "three";
import { pointer } from "@/lib/pointerStore";

/**
 * Esfera abstracta distorsionada con ruido perlin (MeshDistortMaterial extiende
 * MeshPhysicalMaterial). Acabado PREMIUM: clearcoat + reflejos del Environment
 * (look cristal/metal líquido). Reacciona levemente al ratón (parallax).
 */
export default function DistortedSphere() {
  const g = useRef();
  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.rotation.y += dt * 0.06;
    g.current.rotation.x = MathUtils.lerp(g.current.rotation.x, pointer.y * 0.3, 0.04);
    g.current.position.x = MathUtils.lerp(g.current.position.x, pointer.x * 0.45, 0.04);
    g.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
  });
  return (
    <group ref={g}>
      <Sphere args={[1.6, 160, 160]}>
        <MeshDistortMaterial
          color="#1D7CF4"
          roughness={0.06}
          metalness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.5}
          distort={0.4}
          speed={1.4}
        />
      </Sphere>
    </group>
  );
}
