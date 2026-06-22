"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Icosahedron } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = siglas R · D · R (boceto a mano).
 *  - Cada LETRA = una sección. La letra se TROCEA en tantas piezas como enlaces:
 *    cada pieza 3D sólida = un enlace, clicable.
 *  - Cada pieza tiene su ETIQUETA fuera de la figura, unida por una LÍNEA a la
 *    pieza -> sabes a la primera qué es y dónde clicar (no se solapan).
 *  - COORDINACIÓN = gema EXTERNA aparte (solo coordinadores).
 *  - R = letra de bloques; D = semicírculo de "gajos" (como el boceto).
 *  - Movimiento continuo propio (flotar/balanceo); NO sigue al ratón.
 */
const SECTIONS = [
  { num: "01", title: "Formaciones", color: "#85C8FF", glyph: "R", side: "L", items: [
    { label: "¿Qué es RDR?",  href: "que-es-rdr.html" },
    { label: "HUB Formación", href: "rdr-formacion.html" },
    { label: "Portal CIB",    key: "portalBBVACIB", copy: true },
  ] },
  { num: "02", title: "Equipo", color: "#FFB56B", glyph: "D", side: "TB", items: [
    { label: "Retro",       href: "retro.html" },
    { label: "Vacaciones",  href: "vacaciones.html" },
    { label: "Comidas",     href: "comidas.html" },
    { label: "Time Report", key: "timeReportNFQ" },
    { label: "TR BBVA",     key: "timeReportBBVA", copy: true },
  ] },
  { num: "03", title: "Proyectos", color: "#88E783", glyph: "R", side: "R", items: [
    { label: "Pases",         href: "pases-calendados.html" },
    { label: "Planificación", key: "planificacionNFQ" },
    { label: "GitHub",        key: "githubBBVA", copy: true },
    { label: "Drive",         key: "driveBBVA", copy: true },
  ] },
  { num: "04", title: "Coordinación", color: "#9694FF", external: true, items: [
    { label: "Control", href: "control.html" },
  ] },
];

const DZ = 0.7;      // grosor de extrusión (profundidad 3D)
const LX = 4.6;      // separación horizontal de las letras
const FRONT = DZ / 2 + 0.02;

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function hexToRgb(h) { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function mix(hex, t) { const a = hexToRgb(hex); const c = a.map((v) => Math.round(v + (255 - v) * t)); return `rgb(${c[0]},${c[1]},${c[2]})`; }
const shade = (hex, i, n) => mix(hex, 0.08 + 0.4 * (n > 1 ? i / (n - 1) : 0));

function wedgeGeometry(r, a0, a1, depth) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
  s.absarc(0, 0, r, a0, a1, false);
  s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, steps: 1, curveSegments: 20 });
  g.translate(0, 0, -depth / 2);
  return g;
}

// Piezas que forman cada letra (una por enlace). cx/cy = centro (para la línea).
function buildR(n) {
  const stem = { kind: "box", w: 0.62, h: 3.0, x: -0.85, y: 0, rot: 0, cx: -0.85, cy: 0 };
  if (n <= 3) {
    return [
      stem,
      { kind: "box", w: 1.7, h: 1.0, x: 0.12, y: 1.0, rot: 0, cx: 0.12, cy: 1.0 },
      { kind: "box", w: 0.62, h: 2.0, x: 0.5, y: -0.85, rot: -0.5, cx: 0.5, cy: -0.85 },
    ];
  }
  return [
    stem,
    { kind: "box", w: 1.55, h: 0.85, x: 0.1, y: 1.12, rot: 0, cx: 0.1, cy: 1.12 },
    { kind: "box", w: 0.62, h: 1.1, x: 0.78, y: 0.5, rot: 0, cx: 0.78, cy: 0.5 },
    { kind: "box", w: 0.66, h: 2.0, x: 0.5, y: -0.85, rot: -0.5, cx: 0.5, cy: -0.85 },
  ].slice(0, n);
}
function buildD(n) {
  const r = 2.05, cx0 = -0.7, out = [];
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i * (Math.PI / n);
    const a1 = a0 + Math.PI / n;
    const mid = (a0 + a1) / 2;
    out.push({ kind: "wedge", geo: wedgeGeometry(r, a0, a1, DZ), x: cx0, y: 0, cx: cx0 + Math.cos(mid) * r * 0.62, cy: Math.sin(mid) * r * 0.62 });
  }
  return out;
}
const buildPieces = (s) => (s.glyph === "D" ? buildD(s.items.length) : buildR(s.items.length));

// Posiciones de las etiquetas (fuera de la letra) según el lado.
function computeAnchors(pieces, side) {
  const n = pieces.length;
  if (side === "L" || side === "R") {
    const sgn = side === "L" ? -1 : 1, X = 3.1, H = 2.5;
    return pieces.map((_, i) => { const y = n > 1 ? H - 2 * H * (i / (n - 1)) : 0; return { x: sgn * X, y }; });
  }
  const TOP = 3.0, SPAN = 3.0; // D: mitad arriba, mitad abajo
  return pieces.map((_, i) => {
    const up = i % 2 === 0, k = Math.floor(i / 2), cnt = Math.ceil(n / 2);
    const x = cnt > 1 ? -SPAN + 2 * SPAN * (k / (cnt - 1)) : 0;
    return { x, y: up ? TOP : -TOP };
  });
}

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function Piece({ desc, color, active, setActive, onAct, item }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, active ? 0.45 : 0, 0.2);
    if (ref.current.material) ref.current.material.emissiveIntensity = THREE.MathUtils.lerp(ref.current.material.emissiveIntensity, active ? 0.8 : 0.24, 0.2);
  });
  const common = {
    ref,
    onPointerOver: (e) => { e.stopPropagation(); setActive(true); },
    onPointerOut: () => setActive(false),
    onClick: (e) => { e.stopPropagation(); onAct(item, color); },
  };
  const mat = <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.24} metalness={0.2} roughness={0.32} clearcoat={1} clearcoatRoughness={0.16} />;
  if (desc.kind === "box") {
    return (
      <mesh {...common} position={[desc.x, desc.y, 0]} rotation={[0, 0, desc.rot || 0]}>
        <boxGeometry args={[desc.w, desc.h, DZ]} />{mat}
      </mesh>
    );
  }
  return <mesh {...common} geometry={desc.geo} position={[desc.x, desc.y, 0]}>{mat}</mesh>;
}

function Letter({ x, section, activeKey, setActiveKey, onAct }) {
  const pieces = useMemo(() => buildPieces(section), [section]);
  const anchors = useMemo(() => computeAnchors(pieces, section.side), [pieces, section.side]);
  return (
    <group position={[x, 0, 0]}>
      {pieces.map((p, i) => {
        const item = section.items[i];
        const key = section.num + "." + i;
        const color = shade(section.color, i, pieces.length);
        const active = activeKey === key;
        const a = anchors[i];
        return (
          <group key={key}>
            <Piece desc={p} item={item} color={color} active={active}
              setActive={(v) => setActiveKey(v ? key : null)} onAct={onAct} />
            <Line points={[[p.cx, p.cy, FRONT], [a.x, a.y, FRONT]]}
              color={active ? section.color : "#9fb0e0"} lineWidth={active ? 2.6 : 1.2}
              transparent opacity={active ? 1 : 0.45} />
            <Html center position={[a.x, a.y, FRONT]} zIndexRange={active ? [70, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
              <button
                data-hover type="button" aria-label={aria(item)}
                onClick={() => onAct(item, color)}
                onMouseEnter={() => setActiveKey(key)} onMouseLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(key)} onBlur={() => setActiveKey(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", cursor: "pointer",
                  fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12.5px", fontWeight: 700,
                  color: active ? "#070E46" : "#F7F8F8",
                  background: active ? section.color : "rgba(10,18,74,.88)",
                  border: "1.5px solid " + section.color, borderRadius: "999px", padding: "4px 11px",
                  boxShadow: active ? `0 8px 22px ${section.color}77` : "0 2px 10px rgba(0,0,0,.35)",
                  transition: "background .15s, color .15s, transform .15s",
                  transform: active ? "scale(1.05)" : "scale(1)",
                }}
              >
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
    ref.current.rotation.y = t * 0.6;
    ref.current.rotation.x = t * 0.25;
    ref.current.position.y = pos[1] + Math.sin(t * 1.1) * 0.12;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.2 : 1, 0.2));
  });
  return (
    <group position={pos}>
      <Icosahedron ref={ref} args={[0.7, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setActiveKey(key); }}
        onPointerOut={() => setActiveKey(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item, section.color); }}>
        <meshPhysicalMaterial color={section.color} emissive={section.color} emissiveIntensity={active ? 0.85 : 0.45} metalness={0.3} roughness={0.18} clearcoat={1} flatShading />
      </Icosahedron>
      <Html center position={[0, -1.15, 0]} zIndexRange={[60, 0]} style={{ pointerEvents: "none" }}>
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
  useFrame((state) => {
    if (!grp.current) return;
    const t = state.clock.elapsedTime;
    grp.current.rotation.y = Math.sin(t * 0.26) * 0.08;
    grp.current.position.y = Math.sin(t * 0.6) * 0.1;
  });
  return (
    <group ref={grp}>
      {letters.map((s, i) => (
        <Letter key={s.num} x={(i - 1) * LX} section={s} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
      ))}
      {external && (
        <External pos={[LX + 2.6, 2.6, 0]} section={external} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
      )}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [activeKey, setActiveKey] = useState(null);
  const [nav, setNav] = useState(null);

  const letters = SECTIONS.filter((s) => !s.external);
  const external = isCoordinador ? SECTIONS.find((s) => s.external) : null;
  const legendSections = external ? [...letters, external] : letters;

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas camera={{ position: [1.2, 0.6, 22], fov: 34 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 10]} intensity={2.3} color="#F7F8F8" />
          <pointLight position={[-9, -2, 9]} intensity={1.6} color="#1D7CF4" />
          <pointLight position={[9, 4, 6]} intensity={1.4} color="#85C8FF" />
          <Suspense fallback={null}>
            <Scene3D letters={letters} external={external} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          R · D · R — cada trozo es un enlace · pulsa para abrir · o usa la lista (Tab)
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
