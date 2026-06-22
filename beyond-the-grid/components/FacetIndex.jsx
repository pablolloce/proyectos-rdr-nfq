"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Icosahedron } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = las letras R · D · R como FIGURAS COMPLETAS, cada una recortada en
 * PORCIONES RADIALES (= enlaces). La letra se ve entera; cada porción es un gajo
 * clicable con su etiqueta fuera, unida por una línea (estilo tu esquema).
 * Coordinación = gema externa (solo coordinadores).
 *
 * El recorte usa planos de clipping sobre la geometría de la letra -> por eso la
 * figura NO rota (los planos son de mundo); el 3D lo da la cámara angulada + el
 * grosor + las luces. Movimiento propio = flotar en profundidad (no afecta al corte).
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

const DZ = 0.85;       // grosor de la letra
const LETX = 6.6;      // separación entre letras
const HITR = 2.7;      // radio del gajo de click (cubre la letra)
const LBL_R = 3.1;     // distancia de las etiquetas
const FRONT = DZ / 2 + 0.05;

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function hexToRgb(h) { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function mix(hex, t) { const a = hexToRgb(hex); const c = a.map((v) => Math.round(v + (255 - v) * t)); return `rgb(${c[0]},${c[1]},${c[2]})`; }
const shade = (hex, i, n) => mix(hex, 0.06 + 0.4 * (n > 1 ? i / (n - 1) : 0));

// --- Formas sólidas de letra (centradas luego con geometry.center()) ---
function shapeD() {
  const s = new THREE.Shape();
  s.moveTo(-1.5, -2); s.lineTo(-1.5, 2); s.lineTo(-0.5, 2);
  s.absarc(-0.5, 0, 2, Math.PI / 2, -Math.PI / 2, true); // bulto a la derecha
  s.lineTo(-1.5, -2);
  return s;
}
function shapeR() {
  const s = new THREE.Shape();
  s.moveTo(-1.4, -2);
  s.lineTo(-1.4, 2);
  s.lineTo(-0.1, 2);
  s.absarc(-0.1, 1.15, 0.9, Math.PI / 2, -Math.PI / 2, true); // bucle
  s.lineTo(0.2, 0.25);
  s.lineTo(1.15, -2);   // pata (lado externo)
  s.lineTo(0.45, -2);   // pata (lado interno)
  s.lineTo(-0.55, 0.25);
  s.lineTo(-0.55, -2);  // lado derecho del asta
  s.lineTo(-1.4, -2);
  return s;
}
function letterGeometry(glyph) {
  const shape = glyph === "D" ? shapeD() : shapeR();
  const g = new THREE.ExtrudeGeometry(shape, { depth: DZ, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.14, bevelSegments: 4, steps: 1, curveSegments: 26 });
  g.center();
  return g;
}

// Planos de clipping para el gajo angular [a0,a1] centrado en C (mundo).
function sectorPlanes(a0, a1, cx) {
  const C = new THREE.Vector3(cx, 0, 0);
  const n1 = new THREE.Vector3(-Math.sin(a0), Math.cos(a0), 0);
  const n2 = new THREE.Vector3(Math.sin(a1), -Math.cos(a1), 0);
  return [new THREE.Plane(n1, -n1.dot(C)), new THREE.Plane(n2, -n2.dot(C))];
}
// Gajo de disco (invisible) = área de click del sector.
function hitWedge(a0, a1) {
  const PAD = 0.04;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(Math.cos(a0 + PAD) * HITR, Math.sin(a0 + PAD) * HITR);
  s.absarc(0, 0, HITR, a0 + PAD, a1 - PAD, false);
  s.lineTo(0, 0);
  return new THREE.ShapeGeometry(s);
}

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function Sector({ geo, planes, hit, color, accent, mid, active, setActive, onAct, item }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const z = THREE.MathUtils.lerp(ref.current.position.z, active ? 0.5 : 0, 0.2);
    ref.current.position.z = z;
    if (ref.current.children[0]?.material) ref.current.children[0].material.emissiveIntensity = THREE.MathUtils.lerp(ref.current.children[0].material.emissiveIntensity, active ? 0.85 : 0.28, 0.2);
  });
  return (
    <group ref={ref}>
      {/* porción visible: la LETRA recortada a este gajo */}
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={color} emissive={accent} emissiveIntensity={0.28} metalness={0.18} roughness={0.3} clearcoat={1} clearcoatRoughness={0.16} clippingPlanes={planes} side={THREE.DoubleSide} />
      </mesh>
      {/* área de click (gajo invisible) */}
      <mesh geometry={hit} position={[0, 0, FRONT]}
        onPointerOver={(e) => { e.stopPropagation(); setActive(true); }}
        onPointerOut={() => setActive(false)}
        onClick={(e) => { e.stopPropagation(); onAct(item, accent); }}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Letter({ x, section, geo, activeKey, setActiveKey, onAct }) {
  const n = section.items.length;
  const sectors = useMemo(() => section.items.map((_, i) => {
    const a0 = -Math.PI / 2 + i * (2 * Math.PI / n);
    const a1 = a0 + 2 * Math.PI / n;
    return { a0, a1, mid: (a0 + a1) / 2, planes: sectorPlanes(a0, a1, x), hit: hitWedge(a0, a1) };
  }), [n, x]);

  return (
    <group position={[x, 0, 0]}>
      <Html center position={[0, 2.55, FRONT]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: "10px", letterSpacing: ".25em", color: "rgba(133,200,255,.6)", fontFamily: "var(--font-lato), Lato, sans-serif" }}>{section.num}</div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#F7F8F8", fontFamily: "var(--font-serif), Georgia, serif" }}>{section.title}</div>
        </div>
      </Html>

      {sectors.map((sec, i) => {
        const item = section.items[i];
        const key = section.num + "." + i;
        const color = shade(section.color, i, n);
        const active = activeKey === key;
        const lx = Math.cos(sec.mid) * LBL_R, ly = Math.sin(sec.mid) * LBL_R;
        return (
          <group key={key}>
            <Sector geo={geo} planes={sec.planes} hit={sec.hit} color={color} accent={section.color} mid={sec.mid}
              active={active} setActive={(v) => setActiveKey(v ? key : null)} onAct={onAct} item={item} />
            <Line points={[[Math.cos(sec.mid) * 1.4, Math.sin(sec.mid) * 1.4, FRONT], [lx, ly, FRONT]]}
              color={active ? section.color : "#9fb0e0"} lineWidth={active ? 2.6 : 1.2} transparent opacity={active ? 1 : 0.45} />
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
    ref.current.position.y = pos[1] + Math.sin(t * 1.1) * 0.12;
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
  // Solo flota en Z (no rota ni mueve XY) para que los planos de recorte sigan válidos.
  useFrame((state) => { if (grp.current) grp.current.position.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.25; });
  const n = letters.length;
  return (
    <group ref={grp}>
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
        <Canvas camera={{ position: [1.6, 1.0, 24], fov: 32 }}
          onCreated={({ camera, gl }) => { gl.localClippingEnabled = true; camera.lookAt(0, 0, 0); }}
          dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 9, 10]} intensity={2.4} color="#F7F8F8" />
          <pointLight position={[-9, -2, 9]} intensity={1.6} color="#1D7CF4" />
          <pointLight position={[9, 4, 6]} intensity={1.4} color="#85C8FF" />
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
