"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { NIVELES, FORMACIONES, TRACKS, hrefDe } from "@/lib/formaciones";
import { estadoCurso } from "@/lib/progreso";
import ProgresoPanel from "./ProgresoPanel";

/**
 * Mapa-camino 3D de progresión. Cada nivel es una estación a lo largo de un
 * camino ascendente (N00 abajo → N06 arriba). Los cursos son nodos: completados
 * (verde, check), disponibles (color de track, se abren), bloqueados (candado).
 * La cámara sigue tu nivel actual; arrastra para orbitar. Al completar un curso,
 * el nivel se completa y el siguiente se desbloquea (en vivo).
 */
const GAP = 3.3;
const LOCK = "#5a6aa0";
const DONE = "#88E783";
const CUR = "#85C8FF";

const levelX = (i) => Math.sin(i * 1.1) * 2.1;
const levelPos = (i) => [levelX(i), i * GAP, Math.cos(i * 1.1) * 0.5];

function stationColor(estado) {
  if (estado === "completado") return DONE;
  if (estado === "actual") return CUR;
  return LOCK;
}

// Anillo de la estación (verde/azul/gris). El actual pulsa.
function Station({ pos, color, pulse }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current || !pulse) return;
    const k = 1 + Math.sin(s.clock.elapsedTime * 2.2) * 0.06;
    ref.current.scale.set(k, k, k);
  });
  return (
    <mesh ref={ref} position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.15, 0.07, 16, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={pulse ? 1.1 : 0.5} roughness={0.3} metalness={0.4} />
    </mesh>
  );
}

function CourseNode({ pos, color, locked, done, label, onOpen, onMarcar }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, hover && !locked ? 1.45 : 1, 0.18));
  });
  return (
    <group position={pos}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => { e.stopPropagation(); if (!locked) onOpen(); }}
      >
        <sphereGeometry args={[locked ? 0.2 : 0.28, 18, 18]} />
        <meshStandardMaterial color={locked ? LOCK : color} emissive={locked ? "#39477a" : color} emissiveIntensity={hover && !locked ? 1.4 : done ? 1 : 0.7} roughness={locked ? 0.6 : 0.25} metalness={0.35} transparent opacity={locked ? 0.9 : 1} />
      </mesh>

      {locked ? (
        <Html center position={[0, 0.42, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <span aria-hidden style={{ display: "grid", placeItems: "center", width: 16, height: 16, borderRadius: 999, background: "rgba(20,28,74,.9)", border: "1px solid #5a6aa0", color: "#8a96c4" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </span>
        </Html>
      ) : (
        <Html center position={[0, 0.55, 0]} zIndexRange={hover ? [80, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", fontFamily: "var(--font-lato),Lato,sans-serif", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "3px 8px", color: done ? "#06210b" : hover ? "#070E46" : "#F7F8F8", background: done ? DONE : hover ? color : "rgba(10,18,74,.92)", border: `1.5px solid ${done ? DONE : color}`, boxShadow: hover ? `0 8px 22px ${color}88` : "0 2px 10px rgba(0,0,0,.4)", transition: "all .15s" }}>
            {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
            <button className="rdr-node-btn" type="button" onClick={onOpen} style={{ all: "unset", cursor: "pointer" }}>{label}</button>
            {!done && (
              <button className="rdr-node-btn" type="button" title="Marcar como completada" onClick={(e) => { e.stopPropagation(); onMarcar(); }} style={{ cursor: "pointer", display: "grid", placeItems: "center", width: 16, height: 16, borderRadius: 999, border: "1px solid currentColor", opacity: 0.7 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ niveles, completadas, current, onMarcar }) {
  const controls = useRef();
  const targetY = current * GAP;

  // Camino (línea) por los centros de nivel, color por estado.
  const { points, colors } = useMemo(() => {
    const pts = [];
    const cols = [];
    NIVELES.forEach((lvl) => {
      pts.push(levelPos(lvl.n));
      const c = new THREE.Color(stationColor(niveles[lvl.n].estado));
      cols.push([c.r, c.g, c.b]);
    });
    return { points: pts, colors: cols };
  }, [niveles]);

  useFrame(({ camera }) => {
    if (!controls.current) return;
    const c = controls.current;
    c.target.y = THREE.MathUtils.lerp(c.target.y, targetY, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 1.2, 0.05);
    c.update();
  });

  return (
    <>
      <color attach="background" args={["#070E46"]} />
      <fog attach="fog" args={["#070E46", 12, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 6]} intensity={1.8} color="#F7F8F8" />
      <directionalLight position={[-6, -4, -2]} intensity={0.5} color="#1D7CF4" />
      <pointLight position={[0, targetY, 5]} intensity={0.8} color="#85C8FF" />

      <Line points={points} vertexColors={colors} lineWidth={3} transparent opacity={0.6} />

      {NIVELES.map((lvl) => {
        const nv = niveles[lvl.n];
        const [lx, ly, lz] = levelPos(lvl.n);
        const items = FORMACIONES.filter((f) => f.nivel === lvl.n);
        return (
          <group key={lvl.n}>
            <Station pos={[lx, ly, lz]} color={stationColor(nv.estado)} pulse={nv.estado === "actual"} />
            {/* etiqueta de nivel */}
            <Html center position={[lx, ly - 0.95, lz]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", fontFamily: "var(--font-lato),Lato,sans-serif", color: nv.estado === "bloqueado" ? "#8a96c4" : "#F7F8F8", opacity: nv.estado === "bloqueado" ? 0.6 : 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", color: nv.estado === "completado" ? DONE : nv.estado === "actual" ? CUR : "#8a96c4" }}>N{String(lvl.n).padStart(2, "0")}{nv.tieneContenido ? ` · ${nv.hechos}/${nv.total}` : ""}</div>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{lvl.titulo}</div>
              </div>
            </Html>
            {/* nodos de curso, en fila frente a la estación */}
            {items.map((f, k) => {
              const st = estadoCurso(f, completadas, niveles);
              const spread = (k - (items.length - 1) / 2) * 1.4;
              const pos = [lx + spread, ly + 0.15, lz + 1.9];
              const locked = st === "bloqueada" || st === "proximamente";
              return (
                <CourseNode
                  key={f.titulo}
                  pos={pos}
                  color={TRACKS[f.track].color}
                  locked={locked}
                  done={st === "completada"}
                  label={f.titulo}
                  onOpen={() => { const h = hrefDe(f); if (h) window.location.href = h; }}
                  onMarcar={() => onMarcar(f.archivo, true)}
                />
              );
            })}
          </group>
        );
      })}

      <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={0.08} minDistance={6} maxDistance={20} minPolarAngle={0.6} maxPolarAngle={1.95} target={[0, targetY, 0]} />
    </>
  );
}

export default function ProgresoMapa({ niveles, completadas, current, onMarcar }) {
  const [degraded, setDegraded] = useState(false);
  const startY = current * GAP;
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [6.5, startY + 1.2, 12], fov: 45 }} dpr={degraded ? 1 : [1, 1.25]} gl={{ antialias: true, powerPreference: "high-performance" }} className="!absolute inset-0" onCreated={({ gl }) => gl.setClearColor("#070E46")}>
        <Suspense fallback={null}>
          <Scene niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />
        </Suspense>
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-20 text-center text-xs uppercase tracking-[0.3em] text-serene/70">
        Tu ruta de aprendizaje · arrastra para orbitar · completa un nivel para desbloquear el siguiente
      </p>

      <aside className="pointer-events-auto absolute right-4 top-24 bottom-14 z-20 hidden w-80 overflow-auto rounded-2xl border border-white/10 bg-midnight/85 p-4 backdrop-blur-xl xl:block">
        <ProgresoPanel niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />
      </aside>
    </div>
  );
}
