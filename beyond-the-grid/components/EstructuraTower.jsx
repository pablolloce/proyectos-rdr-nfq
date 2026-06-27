"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Estructura 3D central (estilo "realtime 3D" tipo yinger.dev): una torre-lattice
 * de celdas instanciadas formando una espira que gira; cada capa = un nivel,
 * coloreada por su estado (completado=lime, actual=serene, futuro=tenue).
 * Aristas de rejilla + núcleo. Reacciona al scroll. Canvas fijo de fondo.
 */
const LV = 7; // niveles
const PER = 16; // celdas por anillo
const GAP = 1.55;
const BASE_R = 2.35;
const TAPER = 0.16; // estrechamiento por nivel (espira)
const TWIST = 0.32; // giro por nivel

const COLS = { completado: "#88E783", actual: "#85C8FF", proximamente: "#3a4a7a", bloqueado: "#33406e" };

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

function nodePos(L, k) {
  const r = BASE_R - L * TAPER;
  const a = (k / PER) * Math.PI * 2 + L * TWIST;
  const y = (L - (LV - 1) / 2) * GAP;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}

function Lattice({ estados, scroll, reduce }) {
  const grp = useRef();
  const mesh = useRef();
  const COUNT = LV * PER;

  // Aristas de la rejilla: anillo + verticales entre niveles.
  const edges = useMemo(() => {
    const pts = [];
    for (let L = 0; L < LV; L++) {
      for (let k = 0; k < PER; k++) {
        const a = nodePos(L, k);
        const b = nodePos(L, (k + 1) % PER);
        pts.push(...a, ...b); // arista de anillo
        if (L < LV - 1) { const c = nodePos(L + 1, k); pts.push(...a, ...c); } // vertical
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const d = new THREE.Object3D();
    let i = 0;
    for (let L = 0; L < LV; L++) {
      const col = new THREE.Color(COLS[estados?.[L]] || COLS.bloqueado);
      for (let k = 0; k < PER; k++) {
        const [x, y, z] = nodePos(L, k);
        d.position.set(x, y, z);
        d.rotation.set(0, (k / PER) * Math.PI * 2 + L * TWIST, 0);
        const s = (estados?.[L] === "actual" ? 1.35 : estados?.[L] === "completado" ? 1.1 : 0.85);
        d.scale.setScalar(s);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
        m.setColorAt(i, col);
        i++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [estados, COUNT]);

  useFrame((s, dt) => {
    if (!grp.current) return;
    grp.current.rotation.y += (reduce ? 0 : dt * 0.12) + scroll.current.v * 5;
    if (!reduce) grp.current.position.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.12;
  });

  return (
    <group ref={grp}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#85C8FF" transparent opacity={0.18} />
      </lineSegments>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.82} />
      </instancedMesh>
      {/* núcleo tenue */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, LV * GAP, 6]} />
        <meshBasicMaterial color="#C9E8FF" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default function EstructuraTower({ estados }) {
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
      <Canvas frameloop={frameloop} dpr={[1, 1.5]} camera={{ position: [0, 0, 9.5], fov: 50 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#070E46"]} />
        <ambientLight intensity={0.8} />
        <Lattice estados={estados} scroll={scroll} reduce={reduce} />
      </Canvas>
    </div>
  );
}
