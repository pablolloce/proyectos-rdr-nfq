"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sphere, MeshDistortMaterial, Environment, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { FORMACIONES, TRACKS, hrefDe, isDisponible } from "@/lib/formaciones";
import LevelsPanel from "./LevelsPanel";

/**
 * HUB Formativo en 3D: malla esférica donde cada nodo es una formación.
 * Ordenados por nivel (arriba N00 -> abajo N06). Activas = color de track +
 * enlace; futuras = bolas bloqueadas (atenuadas, con candado). Panel de
 * niveles a la derecha como vía accesible/teclado.
 */
const HDRI = "/team-hub/hdri/city_1k.hdr";
const SPHERE_R = 2.2;
const CAGE_R = 5.0;
const NODE_R = 0.3;
const ROCK = 0.22;

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

function fibSphere(N, R) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  for (let i = 0; i < N; i++) {
    const y = N === 1 ? 0 : 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    pts.push([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R]);
  }
  return pts;
}

function CentralSphere({ reduce }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current || reduce) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.08;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.1;
  });
  return (
    <Sphere ref={ref} args={[SPHERE_R, 96, 96]}>
      <MeshDistortMaterial color="#1D7CF4" roughness={0.06} metalness={0.4} clearcoat={1}
        clearcoatRoughness={0.12} envMapIntensity={1.5} distort={reduce ? 0.12 : 0.4} speed={reduce ? 0 : 1.4} />
    </Sphere>
  );
}

const PILL = {
  display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
  fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12px", fontWeight: 700,
  borderRadius: "999px", padding: "3px 10px", transition: "all .15s", textDecoration: "none",
};

function Node({ node, active, setActive }) {
  const ref = useRef();
  const { f, pos, color, locked, k } = node;
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.5 : 1, 0.18));
  });
  const go = () => { if (!locked) { const h = hrefDe(f); if (h) window.location.href = h; } };

  return (
    <group position={pos}>
      <mesh ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setActive(k); }}
        onPointerOut={() => setActive(null)}
        onClick={(e) => { e.stopPropagation(); go(); }}>
        <sphereGeometry args={[locked ? NODE_R * 0.72 : NODE_R, 16, 16]} />
        <meshStandardMaterial
          color={locked ? "#5a6aa0" : color}
          emissive={locked ? "#39477a" : color}
          emissiveIntensity={active ? 1.4 : locked ? 0.3 : 0.75}
          roughness={locked ? 0.6 : 0.25} metalness={0.3}
          transparent opacity={locked ? 0.9 : 1} />
      </mesh>

      <Html center position={[0, locked ? 0.44 : 0.6, 0]} zIndexRange={active ? [80, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
        {locked ? (
          active ? (
            <span className="rdr-node-btn" style={{ ...PILL, color: "#C9D2F0", background: "rgba(20,28,74,.95)", border: "1.5px solid #5a6aa0", cursor: "not-allowed" }}>
              <LockGlyph /> <span>{f.titulo} · Próximamente</span>
            </span>
          ) : (
            <span title={`${f.titulo} · Próximamente`} aria-hidden style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "999px", background: "rgba(20,28,74,.9)", border: "1px solid #5a6aa0", color: "#8a96c4" }}>
              <LockGlyph />
            </span>
          )
        ) : (
          <a href={hrefDe(f)} className="rdr-node-btn" aria-label={`${f.titulo} · ${f.duracion || "abrir formación"}`}
            onMouseEnter={() => setActive(k)} onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(k)} onBlur={() => setActive(null)}
            style={{ ...PILL, color: active ? "#070E46" : "#F7F8F8", background: active ? color : "rgba(10,18,74,.92)", border: "1.5px solid " + color, boxShadow: active ? `0 8px 22px ${color}88` : "0 2px 10px rgba(0,0,0,.4)" }}>
            <span>{f.titulo}</span>
            <span aria-hidden style={{ opacity: 0.6, fontSize: "10px" }}>→</span>
          </a>
        )}
      </Html>
    </group>
  );
}

function LockGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function Cage({ nodes, edgeGeo, active, setActive, reduce }) {
  const grp = useRef();
  const phase = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  useFrame((s, dt) => {
    if (!grp.current) return;
    if (activeRef.current == null && !reduce) phase.current += dt;
    const t = phase.current;
    grp.current.rotation.y = Math.sin(t * 0.25) * ROCK;
    grp.current.rotation.x = Math.sin(t * 0.18) * 0.07;
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#85C8FF" transparent opacity={0.3} />
      </lineSegments>
      {nodes.map((n) => (
        <Node key={n.k} node={n} active={active === n.k} setActive={setActive} />
      ))}
    </group>
  );
}

export default function FormacionHub() {
  const [active, setActive] = useState(null);
  const [degraded, setDegraded] = useState(false);
  const reduce = useReducedMotion();

  const [frameloop, setFrameloop] = useState("always");
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const { nodes, edgeGeo } = useMemo(() => {
    // Orden por nivel (y track) -> se mapea de arriba (N00) a abajo (N06).
    const sorted = [...FORMACIONES].sort((a, b) => a.nivel - b.nivel || a.track.localeCompare(b.track));
    const verts = fibSphere(sorted.length, CAGE_R);
    const order = verts.map((_, i) => i).sort((a, b) => verts[b][1] - verts[a][1]); // Y desc = arriba primero
    const nodes = sorted.map((f, k) => ({
      f, pos: verts[order[k]], color: TRACKS[f.track].color, locked: !isDisponible(f), k: "f" + k,
    }));

    // Aristas: umbral relativo al vecino más cercano (red uniforme).
    const N = verts.length;
    let dmax2 = 0;
    for (let i = 0; i < N; i++) {
      let nn = Infinity;
      for (let j = 0; j < N; j++) if (j !== i) { const d = dist2(verts[i], verts[j]); if (d < nn) nn = d; }
      if (nn > dmax2) dmax2 = nn;
    }
    const thr = dmax2 * 2.0;
    const epts = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++)
      if (dist2(verts[i], verts[j]) <= thr) epts.push(...verts[i], ...verts[j]);
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(epts, 3));
    return { nodes, edgeGeo };
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas frameloop={frameloop} camera={{ position: [0, 0, 19], fov: 45 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        dpr={degraded ? 1 : [1, 1.25]} gl={{ antialias: true, powerPreference: "high-performance" }} className="!absolute inset-0">
        <color attach="background" args={["#070E46"]} />
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={2.2} color="#F7F8F8" />
        <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#1D7CF4" />
        <Suspense fallback={null}>
          <Environment files={HDRI} />
          <CentralSphere reduce={reduce} />
          <Cage nodes={nodes} edgeGeo={edgeGeo} active={active} setActive={setActive} reduce={reduce} />
        </Suspense>
        {!degraded && (
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.35} />
          </EffectComposer>
        )}
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-20 text-center text-xs uppercase tracking-[0.3em] text-serene/70">
        Cada nodo es una formación · arriba N00, abajo N06 · las bolas con candado se desbloquearán pronto
      </p>

      {/* Panel de niveles (vía accesible + teclado). */}
      <aside className="pointer-events-auto absolute right-4 top-24 bottom-14 z-20 hidden w-72 overflow-auto rounded-2xl border border-white/10 bg-midnight/85 p-4 backdrop-blur-xl xl:block">
        <LevelsPanel />
      </aside>
    </div>
  );
}
