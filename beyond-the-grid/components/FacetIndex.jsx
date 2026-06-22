"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Icosahedron, MeshDistortMaterial, Environment, Lightformer, MarchingCubes, MarchingCube } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = letras R · D · R generadas como SUPERFICIE IMPLÍCITA (metaballs +
 * marching cubes): se colocan "bolas" a lo largo del esqueleto de cada letra y se
 * fusionan en una malla LISA y UNIFORME con forma de letra. Encima va el MISMO
 * material que la esfera original (MeshDistortMaterial) -> la letra ONDULA y
 * cambia de forma igual que la esfera, sin teselado feo.
 *
 * Cada enlace = una porción angular: etiqueta fuera unida por una línea; se
 * interactúa con la PROPIA letra (raycast -> porción por ángulo). Control = gema externa.
 */
const SECTIONS = [
  { num: "01", title: "Formaciones", color: "#85C8FF", glyph: "R", items: [
    { label: "¿Qué es RDR?",  href: "que-es-rdr.html" },
    { label: "HUB Formación", href: "rdr-formacion.html" },
    { label: "Portal CIB",    key: "portalBBVACIB", copy: true },
  ] },
  { num: "02", title: "Equipo", color: "#FFB56B", glyph: "D", items: [
    { label: "Retro",       href: "retro.html" },
    { label: "Vacaciones",  href: "vacaciones.html" },
    { label: "Comidas",     href: "comidas.html" },
    { label: "Time Report", key: "timeReportNFQ" },
    { label: "TR BBVA",     key: "timeReportBBVA", copy: true },
  ] },
  { num: "03", title: "Proyectos", color: "#88E783", glyph: "R", items: [
    { label: "Pases",         href: "pases-calendados.html" },
    { label: "Planificación", key: "planificacionNFQ" },
    { label: "GitHub",        key: "githubBBVA", copy: true },
    { label: "Drive",         key: "driveBBVA", copy: true },
  ] },
  { num: "04", title: "Coordinación", color: "#9694FF", external: true, items: [
    { label: "Control", href: "control.html" },
  ] },
];

const LETX = 6.6;
const LBL_R = 3.1;
const FRONT = 1.6;
const NORM = 2.4; // escala del campo de marching cubes (coords letra -> campo [-1,1])

// Esqueleto de cada letra (trazos como polilíneas). Las bolas se reparten encima.
const SKELETON = {
  R: [
    [[-1, -2], [-1, 2]],                                    // asta
    [[-1, 2], [0.2, 2], [0.78, 1.25], [0.2, 0.5], [-1, 0.5]], // bucle
    [[-0.25, 0.5], [0.98, -2]],                             // pata
  ],
  D: [
    [[-1, -2], [-1, 2]],                                    // asta
    [[-1, 2], [0.45, 1.45], [0.98, 0], [0.45, -1.45], [-1, -2]], // panza
  ],
};
function ballsFor(glyph, spacing = 0.26) {
  const out = [];
  SKELETON[glyph].forEach((pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.round(len / spacing));
      for (let s = 0; s <= steps; s++) { const t = s / steps; out.push([ax + dx * t, ay + dy * t]); }
    }
  });
  return out;
}

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

function Letter({ x, section, balls, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  const mcRef = useRef();
  const mat = useRef();
  const n = section.items.length;
  const letterActive = activeKey != null && activeKey.startsWith(section.num + ".");
  const mids = useMemo(() => section.items.map((_, i) => -Math.PI / 2 + i * (2 * Math.PI / n) + Math.PI / n), [n]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (grp.current) {
      grp.current.rotation.y = Math.sin(t * 0.3 + x) * 0.08;
      grp.current.rotation.z = Math.sin(t * 0.4 + x) * 0.03;
      grp.current.position.y = Math.sin(t * 0.5 + x) * 0.18;
    }
    if (mat.current) mat.current.emissiveIntensity = THREE.MathUtils.lerp(mat.current.emissiveIntensity, letterActive ? 0.4 : 0.12, 0.1);
  });

  function sectorAt(point) {
    const p = point.clone();
    mcRef.current.worldToLocal(p);
    let rel = Math.atan2(p.y, p.x) + Math.PI / 2;
    rel = ((rel % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(rel / (2 * Math.PI / n)) % n;
  }

  return (
    <group ref={grp} position={[x, 0, 0]}>
      {/* la LETRA como superficie implícita lisa, con el material de la esfera (ondula) */}
      <MarchingCubes ref={mcRef} resolution={42} maxPolyCount={20000} enableUvs={false} enableColors={false} scale={NORM}
        onPointerMove={(e) => { e.stopPropagation(); setActiveKey(section.num + "." + sectorAt(e.point)); }}
        onPointerOut={() => setActiveKey(null)}
        onClick={(e) => { e.stopPropagation(); onAct(section.items[sectorAt(e.point)], section.color); }}>
        <MeshDistortMaterial ref={mat} color={section.color} emissive={section.color} emissiveIntensity={0.12}
          roughness={0.06} metalness={0.4} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.5} distort={0.32} speed={1.4} />
        {balls.map((b, i) => (
          <MarchingCube key={i} position={[b[0] / NORM, b[1] / NORM, 0]} strength={0.42} subtract={9} />
        ))}
      </MarchingCubes>

      <Html center position={[0, 2.7, FRONT]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: "10px", letterSpacing: ".25em", color: "rgba(133,200,255,.6)", fontFamily: "var(--font-lato), Lato, sans-serif" }}>{section.num}</div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#F7F8F8", fontFamily: "var(--font-serif), Georgia, serif" }}>{section.title}</div>
        </div>
      </Html>

      {mids.map((mid, i) => {
        const item = section.items[i];
        const key = section.num + "." + i;
        const active = activeKey === key;
        const lx = Math.cos(mid) * LBL_R, ly = Math.sin(mid) * LBL_R;
        return (
          <group key={key}>
            <Line points={[[Math.cos(mid) * 1.6, Math.sin(mid) * 1.6, FRONT], [lx, ly, FRONT]]}
              color={active ? section.color : "#9fb0e0"} lineWidth={active ? 2.6 : 1.2} transparent opacity={active ? 1 : 0.4} />
            <Html center position={[lx, ly, FRONT]} zIndexRange={active ? [70, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
              <button data-hover type="button" aria-label={aria(item)}
                onClick={() => onAct(item, section.color)}
                onMouseEnter={() => setActiveKey(key)} onMouseLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(key)} onBlur={() => setActiveKey(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", cursor: "pointer",
                  fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12.5px", fontWeight: 700,
                  color: active ? "#070E46" : "#F7F8F8", background: active ? section.color : "rgba(10,18,74,.9)",
                  border: "1.5px solid " + section.color, borderRadius: "999px", padding: "4px 11px",
                  boxShadow: active ? `0 8px 22px ${section.color}77` : "0 2px 10px rgba(0,0,0,.35)", transition: "all .15s",
                }}>
                <span>{item.label}</span>
                <span aria-hidden style={{ opacity: 0.6, fontSize: "11px" }}>{hint(item)}</span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function External({ pos, section, activeKey, setActiveKey, onAct }) {
  const ref = useRef();
  const item = section.items[0];
  const key = section.num + ".0";
  const active = activeKey === key;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.6; ref.current.rotation.x = t * 0.25;
    ref.current.position.y = pos[1] + Math.sin(t * 1.1) * 0.18;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.2 : 1, 0.2));
  });
  return (
    <group position={pos}>
      <Icosahedron ref={ref} args={[0.78, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setActiveKey(key); }}
        onPointerOut={() => setActiveKey(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item, section.color); }}>
        <meshPhysicalMaterial color={section.color} emissive={section.color} emissiveIntensity={active ? 0.85 : 0.45} metalness={0.3} roughness={0.18} clearcoat={1} flatShading />
      </Icosahedron>
      <Html center position={[0, -1.25, 0]} zIndexRange={[60, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", whiteSpace: "nowrap", fontFamily: "var(--font-lato), Lato, sans-serif" }}>
          <div style={{ fontSize: "9px", letterSpacing: ".2em", color: "rgba(133,200,255,.6)" }}>COORDINACIÓN</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: section.color }}>{item.label}</div>
        </div>
      </Html>
    </group>
  );
}

function Scene3D({ letters, external, activeKey, setActiveKey, onAct }) {
  const n = letters.length;
  return (
    <group>
      {letters.map((s, i) => (
        <Letter key={s.num} x={(i - (n - 1) / 2) * LETX} section={s} balls={s._balls} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
      ))}
      {external && (
        <External pos={[(n - 1) / 2 * LETX + LETX * 0.55, 2.4, 0]} section={external} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
      )}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [activeKey, setActiveKey] = useState(null);
  const [nav, setNav] = useState(null);

  const letters = useMemo(() => SECTIONS.filter((s) => !s.external).map((s) => ({ ...s, _balls: ballsFor(s.glyph) })), []);
  const external = isCoordinador ? SECTIONS.find((s) => s.external) : null;
  const legendSections = external ? [...SECTIONS.filter((s) => !s.external), external] : SECTIONS.filter((s) => !s.external);

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas camera={{ position: [1.4, 0.8, 24], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 9, 6]} intensity={2.0} color="#F7F8F8" />
          <pointLight position={[-8, -3, 6]} intensity={1.4} color="#1D7CF4" />
          <Suspense fallback={null}>
            <StudioEnv />
            <Scene3D letters={letters} external={external} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          R · D · R — cada porción es un enlace · pulsa para abrir · o usa la lista (Tab)
        </p>
      </div>

      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        {legendSections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.2em]" style={{ color: sec.color }}>
              <span className="opacity-50">{sec.glyph || "·"}</span> · {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it, ri) => {
                const key = sec.num + "." + ri;
                return (
                  <li key={it.label}>
                    <button data-hover type="button" aria-label={aria(it)}
                      onClick={() => onAct(it, sec.color)}
                      onMouseEnter={() => setActiveKey(key)} onMouseLeave={() => setActiveKey(null)}
                      onFocus={() => setActiveKey(key)} onBlur={() => setActiveKey(null)}
                      className={"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-serene " +
                        (activeKey === key ? "bg-white/10" : "hover:bg-white/5")}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: sec.color }} />
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
