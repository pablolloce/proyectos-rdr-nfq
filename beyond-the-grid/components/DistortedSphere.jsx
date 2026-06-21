"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { MathUtils } from "three";
import { pointer } from "@/lib/pointerStore";

/**
 * Esfera ambiente (ya NO depende del scroll). Color de marca Serene sobre
 * Midnight. Gira suavemente, flota y hace un parallax leve con el ratón.
 *
 * metalness baja + emissive Electric: sin Environment HDRI se ve luminosa
 * (con metalness alta y sin entorno salía oscura -> "recuadros negros").
 */
export default function DistortedSphere() {
  const group = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.y += delta * 0.1; // giro ambiente continuo
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, pointer.y * 0.2, 0.04);
    group.current.position.x = MathUtils.lerp(group.current.position.x, pointer.x * 0.4, 0.04);
    group.current.position.y = Math.sin(t * 0.4) * 0.12; // flotación leve
  });

  return (
    <group ref={group}>
      <Sphere args={[1.5, 128, 128]}>
        <MeshDistortMaterial
          color="#85C8FF" // Serene
          emissive="#001391" // Electric
          emissiveIntensity={0.18}
          roughness={0.4}
          metalness={0.0}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          distort={0.35}
          speed={1.2}
        />
      </Sphere>
    </group>
  );
}
