"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Sphere, MeshDistortMaterial, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = constelación radial alrededor de la esfera distorsionada original.
 * Centro: esfera con MeshDistortMaterial (auto-animada, decorativa).
 * Alrededor: un nodo por enlace, en un anillo, unidos por radios al centro y
 * por un polígono perimetral. El color agrupa por sección. Cada nodo = un link
 * con su cartel. Coordinación es el nodo morado (solo coordinadores).
 */
const SECTIONS = [
  { num: "01", title: "Formaciones", color: "#85C8FF", items: [
    { label: "¿Qué es RDR?",  href: "que-es-rdr.html" },
    { label: "HUB Formación", href: "rdr-formacion.html" },
    { label: "Portal CIB",    key: "portalBBVACIB", copy: true },
  ] },
  { num: "02", title: "Equipo", color: "#FFB56B", items: [
    { label: "Retro",       href: "retro.html" },
    { label: "Vacaciones",  href: "vacaciones.html" },
    { label: "Comidas",     href: "comidas.html" },
    { label: "Time Report", key: "timeReportNFQ" },
    { label: "TR BBVA",     key: "timeReportBBVA", copy: true },
  ] },
  { num: "03", title: "Proyectos", color: "#88E783", items: [
    { label: "Pases",         href: "pases-calendados.html" },
    { label: "Planificación", key: "planificacionNFQ" },
    { label: "GitHub",        key: "githubBBVA", copy: true },
    { label: "Drive",         key: "driveBBVA", copy: true },
  ] },
  { num: "04", title: "Coordinación", color: "#9694FF", coordOnly: true, items: [
    { label: "Control", href: "control.html" },
  ] },
];

const SPHERE_R = 2.2;   // radio esfera central
const INNER = 2.45;     // donde arrancan los radios (borde de la esfera)
const BASE_R = 5.4;     // radio medio del anillo de nodos
const LBL_OUT = 1.0;    // cuánto sobresale el cartel respecto al nodo

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function StudioEnv() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={4.5} position={[0, 6, 3]} scale={[14, 5, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={1.5} position={[-7, 1, 2]} scale={[5, 10, 1]} color="#85C8FF" />
      <Lightformer form="rect" intensity={1.2} position={[7, -1, 2]} scale={[5, 10, 1]} color="#1D7CF4" />
      <Lightformer form="ring" intensity={2.2} position={[0, 2, -6]} scale={6} color="#ffffff" />
    </Environment>
  );
}

// Esfera distorsionada central (la "original"): decorativa, gira y ondula sola.
function CentralSphere() {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.14;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.2) * 0.15;
  });
  return (
    <Sphere ref={ref} args={[SPHERE_R, 128, 128]}>
      <MeshDistortMaterial color="#1D7CF4" emissive="#0a2a6e" emissiveIntensity={0.35}
        roughness={0.06} metalness={0.4} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.6} distort={0.4} speed={1.4} />
    </Sphere>
  );
}

function Node({ node, active, setActive, onAct }) {
  const ref = useRef();
  const { pos, dir, color, item, nodeKey } = node;
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.55 : 1, 0.18));
  });
  const lbl = [dir[0] * (node.r + LBL_OUT), dir[1] * (node.r + LBL_OUT), 0];
  const anchorRight = dir[0] < -0.25; // a la izquierda del centro → texto hacia fuera (derecha->izq)
  return (
    <group>
      <Line points={[[dir[0] * INNER, dir[1] * INNER, 0], pos]}
        color={active ? color : "#9fb0e0"} lineWidth={active ? 2.6 : 1.1} transparent opacity={active ? 1 : 0.32} />
      <mesh ref={ref} position={pos}
        onPointerOver={(e) => { e.stopPropagation(); setActive(nodeKey); }}
        onPointerOut={() => setActive(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item, color); }}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.4 : 0.7} roughness={0.22} metalness={0.3} />
      </mesh>
      <Html center position={lbl} zIndexRange={active ? [80, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
        <button data-hover type="button" aria-label={aria(item)}
          onClick={() => onAct(item, color)}
          onMouseEnter={() => setActive(nodeKey)} onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(nodeKey)} onBlur={() => setActive(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", cursor: "pointer",
            fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12.5px", fontWeight: 700,
            color: active ? "#070E46" : "#F7F8F8", background: active ? color : "rgba(10,18,74,.92)",
            border: "1.5px solid " + color, borderRadius: "999px", padding: "4px 11px",
            boxShadow: active ? `0 8px 22px ${color}88` : "0 2px 10px rgba(0,0,0,.35)", transition: "all .15s",
            transform: anchorRight ? "translateX(-6px)" : "translateX(6px)",
          }}>
          <span>{item.label}</span>
          <span aria-hidden style={{ opacity: 0.6, fontSize: "11px" }}>{hint(item)}</span>
        </button>
      </Html>
    </group>
  );
}

function Constellation({ nodes, ringPts, active, setActive, onAct }) {
  return (
    <group>
      <CentralSphere />
      {ringPts.length > 2 && (
        <Line points={[...ringPts, ringPts[0]]} color="#9fb0e0" lineWidth={1} transparent opacity={0.28} />
      )}
      {nodes.map((n) => (
        <Node key={n.nodeKey} node={n} active={active === n.nodeKey} setActive={setActive} onAct={onAct} />
      ))}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [active, setActive] = useState(null);
  const [nav, setNav] = useState(null);

  const sections = useMemo(
    () => SECTIONS.filter((s) => !s.coordOnly || isCoordinador),
    [isCoordinador]
  );

  // Aplana enlaces -> nodos repartidos en el anillo (en sentido horario desde arriba).
  const { nodes, ringPts } = useMemo(() => {
    const flat = [];
    sections.forEach((sec) =>
      sec.items.forEach((item) => flat.push({ color: sec.color, section: sec.title, num: sec.num, item }))
    );
    const N = flat.length;
    const nodes = flat.map((f, i) => {
      const a = Math.PI / 2 - ((i + 0.5) / N) * Math.PI * 2; // horario desde arriba
      const r = BASE_R + Math.sin(i * 1.7 + 1) * 0.5;        // radio irregular (constelación)
      const dir = [Math.cos(a), Math.sin(a)];
      return { ...f, nodeKey: f.num + ":" + i, a, r, dir, pos: [dir[0] * r, dir[1] * r, 0] };
    });
    return { nodes, ringPts: nodes.map((n) => n.pos) };
  }, [sections]);

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas camera={{ position: [0, 0, 26], fov: 34 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.45} />
          <directionalLight position={[2, 9, 6]} intensity={2.0} color="#F7F8F8" />
          <pointLight position={[-8, -3, 6]} intensity={1.4} color="#1D7CF4" />
          <Suspense fallback={null}>
            <StudioEnv />
            <Constellation nodes={nodes} ringPts={ringPts} active={active} setActive={setActive} onAct={onAct} />
          </Suspense>
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.35} />
          </EffectComposer>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada nodo es un enlace · pulsa para abrir · o usa la lista (Tab)
        </p>
      </div>

      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        {sections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em]" style={{ color: sec.color }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
              {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it, ri) => {
                const key = sec.num + ":" + globalIndex(sections, sec, ri);
                return (
                  <li key={it.label}>
                    <button data-hover type="button" aria-label={aria(it)}
                      onClick={() => onAct(it, sec.color)}
                      onMouseEnter={() => setActive(key)} onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(key)} onBlur={() => setActive(null)}
                      className={"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-serene " +
                        (active === key ? "bg-white/10" : "hover:bg-white/5")}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sec.color }} />
                      <span className="flex-1 truncate text-sand/85">{it.label}</span>
                      <span aria-hidden className="shrink-0 text-serene/50">{hint(it)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      <AnimatePresence>
        {nav && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onAnimationComplete={() => { window.location.href = nav.url; }}>
            <div className="text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-serene/25" style={{ borderTopColor: nav.color }} />
              <p className="font-display text-xs uppercase tracking-[0.3em] text-serene/60">Abriendo</p>
              <p className="mt-1 font-display text-2xl font-bold" style={{ color: nav.color }}>{nav.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// índice global del item (para emparejar la clave del nodo 3D con la lista lateral)
function globalIndex(sections, sec, ri) {
  let idx = 0;
  for (const s of sections) {
    if (s === sec) return idx + ri;
    idx += s.items.length;
  }
  return idx + ri;
}
