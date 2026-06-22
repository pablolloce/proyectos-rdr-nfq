"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { pointer } from "@/lib/pointerStore";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const CS = 0.82;     // tamaño del sub-cubo
const SUBSP = 0.92;  // separación entre sub-cubos dentro de una figura
const LIFT = 0.4;    // cuánto sale el sub-cubo (link) al hover
const S = 2.4;       // separación entre figuras

// 4 SECCIONES = 4 figuras. Cada figura = mini-cubo de sub-cubos (1 por link + relleno).
// copy:true -> copia la URL al portapapeles (con aviso) en vez de navegar.
const SECTIONS = [
  { num: "01", title: "Formaciones", items: [
    { label: "¿Qué es RDR?", href: "que-es-rdr.html", color: "#85C8FF" },
    { label: "HUB Formativo", href: "rdr-formacion.html", color: "#88E783" },
    { label: "Portal BBVA CIB", key: "portalBBVACIB", color: "#F7F8F8", copy: true },
  ] },
  { num: "02", title: "Equipo RDR", items: [
    { label: "Vacaciones", href: "vacaciones.html", color: "#8BE1E9" },
    { label: "Time Report NFQ", key: "timeReportNFQ", color: "#9694FF" },
    { label: "Time Report BBVA", key: "timeReportBBVA", color: "#9694FF", copy: true },
    { label: "Retrospectiva", href: "retro.html", color: "#FFB56B" },
    { label: "Comidas", href: "comidas.html", color: "#FFE761" },
  ] },
  { num: "03", title: "Proyectos RDR", items: [
    { label: "Planificación", key: "planificacionNFQ", color: "#85C8FF" },
    { label: "Pases Calendados", href: "pases-calendados.html", color: "#FFE761" },
    { label: "Drive BBVA", key: "driveBBVA", color: "#88E783", copy: true },
    { label: "GitHub BBVA", key: "githubBBVA", color: "#8BE1E9", copy: true },
  ] },
  { num: "04", title: "Coordinación", coordOnly: true, items: [
    { label: "Control RDR", href: "control.html", color: "#9694FF" },
  ] },
];

// Distribución de las figuras según cuántas haya:
//  - 4 (coordinador): cuadrado (diamante en isométrica).
//  - 3 (no coordinador): fila diagonal centrada (se ve horizontal en isométrica).
function figPositions(n) {
  if (n <= 3) return [[-S, 0, S], [0, 0, 0], [S, 0, -S]].slice(0, n);
  return [[-S, 0, S], [S, 0, S], [-S, 0, -S], [S, 0, -S]];
}

// 8 huecos de un cubo 2×2×2, ordenados "más visibles primero" (cámara +x+y+z).
const SLOTS = (() => {
  const s = [];
  for (const sx of [-0.5, 0.5]) for (const sy of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) s.push([sx, sy, sz]);
  s.sort((a, b) => ((b[0] > 0) + (b[1] > 0) + (b[2] > 0)) - ((a[0] > 0) + (a[1] > 0) + (a[2] > 0)));
  return s;
})();

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }              // copia URL + toast
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener"); // externo: nueva pestaña
  else navInternal(u, item);                                  // interno: con transición
}

function SubCube({ local, item, on, setOn, onAct }) {
  const ref = useRef();
  const lift = useRef(0);
  const dir = useMemo(() => local.clone().normalize(), [local]);
  const labelPos = useMemo(() => { const p = local.clone().addScaledVector(dir, 0.75); return [p.x, p.y, p.z]; }, [local, dir]);
  useFrame(() => {
    if (!ref.current) return;
    lift.current = THREE.MathUtils.lerp(lift.current, on ? LIFT : 0, 0.18);
    ref.current.position.copy(local).addScaledVector(dir, lift.current);
    const sc = THREE.MathUtils.lerp(ref.current.scale.x, on ? 1.16 : 1, 0.2);
    ref.current.scale.setScalar(sc);
  });
  return (
    <group>
      <RoundedBox ref={ref} args={[CS, CS, CS]} radius={0.13} smoothness={5}
        onPointerOver={(e) => { e.stopPropagation(); setOn(true); }}
        onPointerOut={() => setOn(false)}
        onClick={(e) => { e.stopPropagation(); onAct(item); }}>
        <meshPhysicalMaterial color={item.color} emissive={item.color} emissiveIntensity={on ? 0.55 : 0.16}
          metalness={0.18} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.7} />
      </RoundedBox>
      <Html center position={labelPos} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ whiteSpace: "nowrap", color: "#F7F8F8",
          background: on ? "rgba(10,18,74,.96)" : "rgba(10,18,74,.6)",
          border: "1px solid " + (on ? item.color : "rgba(133,200,255,.35)"),
          borderRadius: "999px", padding: on ? "4px 11px" : "2px 8px",
          fontSize: on ? "12px" : "10px", fontWeight: 700, fontFamily: "Lato, sans-serif",
          boxShadow: on ? "0 6px 24px rgba(0,0,0,.4)" : "none", transition: "all .15s" }}>
          {item.label}{item.copy ? " ⧉" : ""}
        </div>
      </Html>
    </group>
  );
}

function Filler({ local }) {
  return (
    <RoundedBox args={[CS, CS, CS]} radius={0.13} smoothness={4} position={[local.x, local.y, local.z]}>
      <meshPhysicalMaterial color="#001391" emissive="#001391" emissiveIntensity={0.18}
        metalness={0.2} roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.18} envMapIntensity={1.4} />
    </RoundedBox>
  );
}

function Figure({ pos, section, fi, active, setActive, onAct }) {
  return (
    <group position={pos}>
      <Html center position={[0, 2.25, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", fontFamily: "var(--font-grotesk), sans-serif", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(133,200,255,.6)" }}>{section.num}</span>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#F7F8F8", textShadow: "0 4px 18px rgba(7,14,70,.7)" }}>{section.title}</div>
        </div>
      </Html>
      {SLOTS.map((slot, si) => {
        const local = new THREE.Vector3(slot[0], slot[1], slot[2]).multiplyScalar(SUBSP);
        const item = section.items[si];
        if (!item) return <Filler key={"f" + si} local={local} />;
        const key = fi + "." + si;
        return <SubCube key={key} local={local} item={item} onAct={onAct}
          on={active === key} setOn={(v) => setActive(v ? key : null)} />;
      })}
    </group>
  );
}

function Sculpture({ sections, active, setActive, onAct }) {
  const grp = useRef();
  useFrame(() => {
    if (!grp.current) return;
    grp.current.rotation.y = THREE.MathUtils.lerp(grp.current.rotation.y, pointer.x * 0.14, 0.05);
    grp.current.rotation.x = THREE.MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.07, 0.05);
  });
  const POS = figPositions(sections.length);
  return (
    <group ref={grp}>
      {sections.map((sec, fi) => (
        <Figure key={sec.num} pos={POS[fi]} section={sec} fi={fi}
          active={active} setActive={setActive} onAct={onAct} />
      ))}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [active, setActive] = useState(null);
  const [nav, setNav] = useState(null); // transición de salida a otra página
  const onAct = (item) => activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: it.color }));
  const sections = useMemo(() => SECTIONS.filter((s) => !s.coordOnly || isCoordinador), [isCoordinador]);

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas orthographic camera={{ position: [7, 7, 7], zoom: 56, near: -50, far: 100 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 9, 6]} intensity={2.8} color="#F7F8F8" />
          <pointLight position={[-7, -2, 5]} intensity={2.4} color="#1D7CF4" />
          <pointLight position={[5, 4, -5]} intensity={1.8} color="#85C8FF" />
          <Suspense fallback={null}>
            <Sculpture sections={sections} active={active} setActive={setActive} onAct={onAct} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada figura es una sección · pulsa un cubo de color para abrir
        </div>
      </div>

      {/* Leyenda agrupada por sección (separación tipo index.html) */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 lg:block">
        {sections.map((sec, fi) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 font-grotesk text-xs uppercase tracking-[0.25em] text-serene/70">
              <span className="text-serene/40">{sec.num}</span> · {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it, si) => {
                const key = fi + "." + si;
                return (
                  <li key={it.label} data-hover
                    onMouseEnter={() => setActive(key)} onMouseLeave={() => setActive(null)}
                    onClick={() => onAct(it)}
                    className={"flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors " + (active === key ? "bg-white/10" : "hover:bg-white/5")}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: it.color }} />
                    <span className="flex-1 truncate text-sand/85">{it.label}</span>
                    <span className="shrink-0 text-serene/50">{it.copy ? "⧉" : it.key ? "↗" : "→"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* Transición de salida hacia otra página (fundido + spinner) */}
      <AnimatePresence>
        {nav && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            onAnimationComplete={() => { window.location.href = nav.url; }}>
            <motion.div className="text-center"
              initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}>
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-serene/25"
                style={{ borderTopColor: nav.color }} />
              <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-serene/60">Abriendo</p>
              <p className="mt-1 font-grotesk text-2xl font-bold" style={{ color: nav.color }}>{nav.label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
