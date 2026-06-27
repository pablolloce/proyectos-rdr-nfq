"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Tubo/columna 3D central (estilo ChainGPT): cilindro de cristal con rejilla de
 * energía, partículas que descienden y un núcleo que late. Reacciona al SCROLL
 * (gira y acelera las partículas) y se "rellena" según el progreso (frac 0..1).
 * Canvas fijo de fondo; el contenido (niveles) hace scroll por encima.
 */
const H = 44; // altura del tubo
const R = 1.8;

function useScroll() {
  const ref = useRef({ p: 0, v: 0 });
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      ref.current.v = p - last;
      ref.current.p = p;
      last = p;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

function Particles({ scroll, reduce }) {
  const ref = useRef();
  const N = 220;
  const data = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (R - 0.15);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * H;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speed[i] = 2 + Math.random() * 4;
    }
    return { positions, speed };
  }, []);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g || reduce) return;
    const boost = 1 + Math.min(Math.abs(scroll.current.v) * 220, 8);
    const arr = g.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] -= data.speed[i] * dt * boost; // descienden
      if (arr[i * 3 + 1] < -H / 2) arr[i * 3 + 1] = H / 2;
    }
    g.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.13} color="#9FD4FF" transparent opacity={0.95} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Tube({ scroll, frac, reduce }) {
  const grp = useRef();
  const core = useRef();
  const fillH = Math.max(0.6, (frac || 0) * H);
  useFrame((s, dt) => {
    if (grp.current) grp.current.rotation.y += dt * 0.15 + (reduce ? 0 : scroll.current.v * 4);
    if (core.current && !reduce) {
      core.current.material.opacity = 0.5 + Math.sin(s.clock.elapsedTime * 2.2) * 0.25;
    }
  });
  return (
    <group ref={grp}>
      {/* rejilla de energía (wireframe) */}
      <mesh>
        <cylinderGeometry args={[R, R, H, 22, 40, true]} />
        <meshBasicMaterial color="#85C8FF" wireframe transparent opacity={0.22} />
      </mesh>
      {/* cristal translúcido */}
      <mesh>
        <cylinderGeometry args={[R - 0.04, R - 0.04, H, 48, 1, true]} />
        <meshStandardMaterial color="#1D7CF4" emissive="#1D7CF4" emissiveIntensity={0.45} transparent opacity={0.16} side={THREE.DoubleSide} roughness={0.2} metalness={0.4} />
      </mesh>
      {/* relleno de progreso desde arriba (verde) */}
      <mesh position={[0, H / 2 - fillH / 2, 0]}>
        <cylinderGeometry args={[R - 0.1, R - 0.1, fillH, 32, 1, true]} />
        <meshStandardMaterial color="#88E783" emissive="#88E783" emissiveIntensity={0.7} transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>
      {/* núcleo brillante */}
      <mesh ref={core}>
        <cylinderGeometry args={[0.08, 0.08, H, 8]} />
        <meshBasicMaterial color="#D8ECFF" transparent opacity={0.8} />
      </mesh>
      <Particles scroll={scroll} reduce={reduce} />
    </group>
  );
}

export default function TuboTower({ frac = 0 }) {
  const scroll = useScroll();
  const reduce = useReducedMotion();
  const [frameloop, setFrameloop] = useState("always");
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas frameloop={frameloop} dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 52 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#070E46"]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 2, 5]} intensity={1.7} color="#85C8FF" />
        <Tube scroll={scroll} frac={frac} reduce={reduce} />
      </Canvas>
    </div>
  );
}
