"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Color, MathUtils } from "three";
import { scrollStore } from "@/lib/scrollStore";

// Colores entre los que interpolamos según el progreso de scroll.
const COLOR_A = new Color("#1D7CF4"); // azul (arriba)
const COLOR_B = new Color("#CD3D60"); // magenta (abajo)
const _tmpColor = new Color();

/**
 * Esfera distorsionada con ruido simplex/perlin (MeshDistortMaterial extiende
 * MeshPhysicalMaterial, por lo que admite clearcoat/transmission -> look premium).
 *
 * Toda la reactividad ocurre en useFrame leyendo scrollStore (escrito por GSAP
 * y por el listener de ratón). NO usamos estado de React aquí: así el objeto
 * responde a 60fps sin re-renderizar el árbol.
 */
export default function DistortedSphere() {
  const group = useRef();
  const material = useRef();

  useFrame(() => {
    const { progress, mouseX, mouseY } = scrollStore;

    if (group.current) {
      // --- Parallax suave con el ratón + giro continuo con el scroll ---
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        mouseX * 0.5 + progress * Math.PI * 2,
        0.06
      );
      group.current.rotation.x = MathUtils.lerp(
        group.current.rotation.x,
        -mouseY * 0.35,
        0.06
      );

      // --- El objeto encoge y baja a medida que avanzamos ---
      const targetScale = MathUtils.lerp(1.6, 0.65, progress);
      const s = MathUtils.lerp(group.current.scale.x, targetScale, 0.1);
      group.current.scale.setScalar(s);
      group.current.position.y = MathUtils.lerp(
        group.current.position.y,
        progress * 1.6,
        0.1
      );
    }

    if (material.current) {
      // --- El material muta: más distorsión y cambio de color con el scroll ---
      material.current.distort = MathUtils.lerp(0.3, 0.7, progress);
      _tmpColor.copy(COLOR_A).lerp(COLOR_B, progress);
      material.current.color.copy(_tmpColor);
    }
  });

  return (
    <group ref={group}>
      {/* 128x128 segmentos = superficie densa para que el perlin se vea fluido */}
      <Sphere args={[1, 128, 128]}>
        <MeshDistortMaterial
          ref={material}
          color={COLOR_A}
          roughness={0.08}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.15}
          distort={0.3} // amplitud del ruido (la animamos en useFrame)
          speed={1.6} // velocidad del ruido
          // Para un acabado de cristal/refracción, sube transmission y baja
          // metalness (necesita el <Environment/> de la escena):
          // transmission={0.95} thickness={1.5} ior={1.45}
        />
      </Sphere>
    </group>
  );
}
