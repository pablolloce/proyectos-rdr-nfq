"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { MathUtils } from "three";
import { pointer } from "@/lib/pointerStore";

/**
 * "Núcleo de datos" (RDR = Repositorio de Datos de Referencia):
 *   - esfera distorsionada (ruido perlin) = el dato vivo.
 *   - retícula wireframe (icosaedro) que la envuelve y contra-rota = la
 *     estructura/relaciones del repositorio.
 * Colores de marca (Serene + Electric) sobre Midnight. Gira despacio y hace
 * parallax con el ratón. metalness 0 + emissive -> luminosa (nunca negra).
 */
export default function DistortedSphere() {
  const group = useRef();
  const wire = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, pointer.y * 0.2, 0.04);
      group.current.position.x = MathUtils.lerp(group.current.position.x, pointer.x * 0.5, 0.03);
      group.current.position.y = 0.35 + Math.sin(t * 0.4) * 0.12; // flota, ligeramente alta
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.05; // contra-rota respecto al núcleo
      wire.current.rotation.z += delta * 0.03;
    }
  });

  return (
    <group ref={group}>
      <Sphere args={[1.45, 128, 128]}>
        <MeshDistortMaterial
          color="#85C8FF" // Serene
          emissive="#1D7CF4" // azul brillante para que destaque
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
          distort={0.42}
          speed={1.3}
        />
      </Sphere>

      {/* Retícula envolvente (estructura del repositorio) */}
      <Icosahedron ref={wire} args={[2.45, 1]}>
        <meshBasicMaterial color="#85C8FF" wireframe transparent opacity={0.3} />
      </Icosahedron>
    </group>
  );
}
