"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = FICHAS etiquetadas, una por enlace, agrupadas por sección en columnas.
 *  - Cada ficha es un panel 3D (con grosor) y el NOMBRE del enlace escrito encima
 *    (texto 3D real) -> sabes a la primera dónde clicar.
 *  - La ficha es el target (click 3D fiable). Al señalar se eleva y brilla.
 *  - Profundidad real: cámara en perspectiva ligeramente angulada + grosor + flotar.
 *  - Movimiento continuo propio (flotar + balanceo); NO sigue al ratón.
 *  - Lista lateral espejo para teclado. Coordinación: columna extra solo coordinadores.
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

const TW = 3.0, TH = 0.86, TD = 0.4;   // ficha (ancho, alto, grosor)
const TPITCH = TH + 0.34;              // paso vertical entre fichas
const COLX = 3.55;                     // separación entre columnas (secciones)

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function Tile({ baseX, baseY, item, color, active, setActive, onAct }) {
  const ref = useRef();
  const mat = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = baseX;
    ref.current.position.y = baseY + Math.sin(t * 1.1 + phase) * 0.05;      // flotar
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, active ? 0.7 : 0, 0.2); // elevar al señalar
    if (mat.current) mat.current.emissiveIntensity = (active ? 0.6 : 0.18) + Math.sin(t * 1.6 + phase) * 0.05;
  });
  return (
    <group ref={ref} position={[baseX, baseY, 0]}>
      <RoundedBox
        args={[TW, TH, TD]} radius={0.14} smoothness={5}
        onPointerOver={(e) => { e.stopPropagation(); setActive(true); }}
        onPointerOut={() => setActive(false)}
        onClick={(e) => { e.stopPropagation(); onAct(item, color); }}
      >
        <meshPhysicalMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.18}
          metalness={0.15} roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
      </RoundedBox>
      {/* Nombre del enlace, texto 3D sobre la cara (electric blue sobre acento) */}
      <Text position={[-TW / 2 + 0.26, 0, TD / 2 + 0.02]} fontSize={0.3} color="#001391"
        anchorX="left" anchorY="middle" maxWidth={TW - 0.8} raycast={() => null}>
        {item.label}
      </Text>
      <Text position={[TW / 2 - 0.28, 0, TD / 2 + 0.02]} fontSize={0.3} color="#001391"
        anchorX="right" anchorY="middle" raycast={() => null}>
        {hint(item)}
      </Text>
    </group>
  );
}

function Column({ x, section, maxRows, activeKey, setActiveKey, onAct }) {
  const topTileY = ((maxRows - 1) * TPITCH) / 2;
  return (
    <group position={[x, 0, 0]}>
      <Text position={[0, topTileY + TPITCH + 0.15, 0]} fontSize={0.42} color="#F7F8F8" anchorX="center" anchorY="middle">
        {section.title}
      </Text>
      {section.items.map((it, ri) => {
        const key = section.num + "." + ri;
        return (
          <Tile key={key} baseX={0} baseY={topTileY - ri * TPITCH} item={it} color={section.color}
            active={activeKey === key} setActive={(v) => setActiveKey(v ? key : null)} onAct={onAct} />
        );
      })}
    </group>
  );
}

function Scene3D({ sections, maxRows, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  useFrame((state) => {
    if (!grp.current) return;
    const t = state.clock.elapsedTime;
    grp.current.rotation.y = Math.sin(t * 0.28) * 0.06;   // balanceo muy leve (no ratón)
    grp.current.position.y = Math.sin(t * 0.6) * 0.08;     // flotar global
  });
  const n = sections.length;
  return (
    <group ref={grp}>
      {sections.map((s, i) => (
        <Column key={s.num} x={(i - (n - 1) / 2) * COLX} section={s} maxRows={maxRows}
          activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
      ))}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [activeKey, setActiveKey] = useState(null);
  const [nav, setNav] = useState(null);

  const sections = useMemo(() => SECTIONS.filter((s) => !s.coordOnly || isCoordinador), [isCoordinador]);
  const maxRows = Math.max(...sections.map((s) => s.items.length));

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas
          camera={{ position: [2.2, 1.4, 15], fov: 34 }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[5, 8, 10]} intensity={2.3} color="#F7F8F8" />
          <pointLight position={[-8, -2, 8]} intensity={1.6} color="#1D7CF4" />
          <pointLight position={[8, 4, 6]} intensity={1.4} color="#85C8FF" />
          <Suspense fallback={null}>
            <Scene3D sections={sections} maxRows={maxRows} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada ficha es un enlace · pulsa para abrir · o usa la lista (Tab)
        </p>
      </div>

      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        {sections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.2em]" style={{ color: sec.color }}>{sec.title}</p>
            <ul className="space-y-1">
              {sec.items.map((it, ri) => {
                const key = sec.num + "." + ri;
                return (
                  <li key={it.label}>
                    <button
                      data-hover type="button" aria-label={aria(it)}
                      onClick={() => onAct(it, sec.color)}
                      onMouseEnter={() => setActiveKey(key)} onMouseLeave={() => setActiveKey(null)}
                      onFocus={() => setActiveKey(key)} onBlur={() => setActiveKey(null)}
                      className={"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-serene " +
                        (activeKey === key ? "bg-white/10" : "hover:bg-white/5")}
                    >
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
