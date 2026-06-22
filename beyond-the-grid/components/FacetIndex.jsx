"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = letras R · D · R "dentro del agua": cada letra es una pieza ÚNICA,
 * muy redondeada, que ONDULA como gelatina (MeshDistortMaterial), con burbujas
 * subiendo de fondo y mucha animación. Bordes limpios (sin cortes duros).
 *
 * Cada enlace = una porción angular de la letra: su etiqueta va fuera, unida por
 * una línea; al señalar (etiqueta o porción) la letra brilla y la línea se marca.
 * El click va sobre un gajo invisible que cubre esa porción. Control = gema externa.
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

const DZ = 0.9;
const LETX = 6.4;
const LBL_R = 3.1;
const FRONT = DZ / 2 + 0.1;

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function shapeD() {
  const s = new THREE.Shape();
  s.moveTo(-1.5, -2); s.lineTo(-1.5, 2); s.lineTo(-0.5, 2);
  s.absarc(-0.5, 0, 2, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(-1.5, -2);
  const h = new THREE.Path();
  h.moveTo(-0.78, -1.28); h.lineTo(-0.78, 1.28); h.lineTo(-0.5, 1.28);
  h.absarc(-0.5, 0, 1.28, Math.PI / 2, -Math.PI / 2, true); h.lineTo(-0.78, -1.28);
  s.holes.push(h);
  return s;
}
function shapeR() {
  const s = new THREE.Shape();
  s.moveTo(-1.4, -2); s.lineTo(-1.4, 2); s.lineTo(-0.1, 2);
  s.absarc(-0.1, 1.15, 0.92, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(0.25, 0.2); s.lineTo(1.18, -2); s.lineTo(0.48, -2);
  s.lineTo(-0.55, 0.2); s.lineTo(-0.55, -2); s.lineTo(-1.4, -2);
  const h = new THREE.Path();
  h.moveTo(-0.62, 1.62); h.lineTo(-0.62, 0.66); h.lineTo(-0.1, 0.66);
  h.absarc(-0.1, 1.15, 0.49, -Math.PI / 2, Math.PI / 2, false); h.lineTo(-0.62, 1.62);
  s.holes.push(h);
  return s;
}
function letterGeometry(glyph) {
  const shape = glyph === "D" ? shapeD() : shapeR();
  let g = new THREE.ExtrudeGeometry(shape, { depth: DZ, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.24, bevelSegments: 6, steps: 2, curveSegments: 40 });
  g.center();
  g = g.toNonIndexed();
  // teselar -> muchos vértices -> la ondulación (agua) se ve suave en toda la cara
  g = new TessellateModifier(0.5, 4).modify(g);
  return g;
}

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

// Burbujas de fondo subiendo (efecto agua)
function Bubbles({ count = 30 }) {
  const ref = useRef();
  const data = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 24, y0: Math.random() * 16, z: -2.5 - Math.random() * 5,
    r: 0.06 + Math.random() * 0.18, sp: 0.4 + Math.random() * 0.7, ph: Math.random() * 6.28,
  })), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((b, i) => {
      const y = ((b.y0 + t * b.sp) % 16) - 8;
      dummy.position.set(b.x + Math.sin(t * 0.6 + b.ph) * 0.35, y, b.z);
      dummy.scale.setScalar(b.r * (0.85 + Math.sin(t * 2 + b.ph) * 0.15));
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshPhysicalMaterial color="#bfe2ff" transparent opacity={0.26} roughness={0.08} metalness={0} clearcoat={1} />
    </instancedMesh>
  );
}

function Letter({ x, section, geo, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  const meshRef = useRef();
  const mat = useRef();
  const n = section.items.length;
  const letterActive = activeKey != null && activeKey.startsWith(section.num + ".");
  // ángulos medios de cada porción (para colocar la etiqueta radialmente)
  const mids = useMemo(() => section.items.map((_, i) => -Math.PI / 2 + i * (2 * Math.PI / n) + Math.PI / n), [n]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (grp.current) {
      grp.current.rotation.z = Math.sin(t * 0.5 + x) * 0.04;
      grp.current.rotation.x = -0.08 + Math.sin(t * 0.35 + x) * 0.04;
      grp.current.rotation.y = Math.sin(t * 0.28 + x) * 0.05;
      grp.current.position.y = Math.sin(t * 0.5 + x) * 0.18;
    }
    if (mat.current) mat.current.emissiveIntensity = THREE.MathUtils.lerp(mat.current.emissiveIntensity, letterActive ? 0.55 : 0.22, 0.12);
  });

  // qué porción está bajo el punto pulsado (ángulo en coords locales de la letra)
  function sectorAt(point) {
    const p = point.clone();
    meshRef.current.worldToLocal(p);
    let rel = Math.atan2(p.y, p.x) + Math.PI / 2;
    rel = ((rel % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(rel / (2 * Math.PI / n)) % n;
  }

  return (
    <group ref={grp} position={[x, 0, 0]}>
      {/* la LETRA: pieza única que ondula (agua). Se interactúa con ella directamente. */}
      <mesh ref={meshRef} geometry={geo}
        onPointerMove={(e) => { e.stopPropagation(); setActiveKey(section.num + "." + sectorAt(e.point)); }}
        onPointerOut={() => setActiveKey(null)}
        onClick={(e) => { e.stopPropagation(); onAct(section.items[sectorAt(e.point)], section.color); }}>
        <MeshDistortMaterial ref={mat} color={section.color} emissive={section.color} emissiveIntensity={0.22}
          roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} distort={0.3} speed={1.6} />
      </mesh>

      <Html center position={[0, 2.6, FRONT]} style={{ pointerEvents: "none" }}>
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
            <Line points={[[Math.cos(mid) * 1.55, Math.sin(mid) * 1.55, FRONT], [lx, ly, FRONT]]}
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
  const grp = useRef();
  useFrame((state) => { if (grp.current) grp.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15; });
  const n = letters.length;
  return (
    <group ref={grp}>
      <Bubbles />
      {letters.map((s, i) => (
        <Letter key={s.num} x={(i - (n - 1) / 2) * LETX} section={s} geo={s._geo} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
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

  const letters = useMemo(() => SECTIONS.filter((s) => !s.external).map((s) => ({ ...s, _geo: letterGeometry(s.glyph) })), []);
  const external = isCoordinador ? SECTIONS.find((s) => s.external) : null;
  const legendSections = external ? [...SECTIONS.filter((s) => !s.external), external] : SECTIONS.filter((s) => !s.external);

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas camera={{ position: [1.4, 0.8, 24], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#061046"]} />
          <fog attach="fog" args={["#061046", 18, 40]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 9, 10]} intensity={2.3} color="#F7F8F8" />
          <pointLight position={[-9, -2, 9]} intensity={1.8} color="#1D7CF4" />
          <pointLight position={[9, 4, 6]} intensity={1.5} color="#85C8FF" />
          <Suspense fallback={null}>
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
