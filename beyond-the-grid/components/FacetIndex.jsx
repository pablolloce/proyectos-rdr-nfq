"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox, Icosahedron } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = las siglas R D R.
 *  - Cada LETRA es una sección ("un tipo"), con su color.
 *  - Cada letra se FRAGMENTA en tantas piezas como enlaces tenga la sección;
 *    cada fragmento (un grupo de cubos) es un enlace clicable.
 *  - COORDINACIÓN va como elemento EXTERNO (una gema flotante aparte), solo
 *    para coordinadores.
 *  - Al señalar un fragmento se ilumina y muestra su etiqueta; la lista lateral
 *    es el índice permanente (señalar en la lista ilumina su fragmento y viceversa).
 *  - Movimiento continuo propio (flotar + balanceo); NO sigue al ratón.
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

// Patrones de letra (5 filas × 4 columnas; "1" = cubo)
const GLYPH = {
  R: ["1110", "1001", "1110", "1010", "1001"],
  D: ["1110", "1001", "1001", "1001", "1110"],
};
const GR = 5, GC = 4;     // filas/columnas del glifo
const CELL = 0.66;        // tamaño de celda
const LETTER_W = GC * CELL;
const LETTER_GAP = 1.15;

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function hexToRgb(h) { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function mix(hex, t) { const a = hexToRgb(hex); const c = a.map((v) => Math.round(v + (255 - v) * t)); return `rgb(${c[0]},${c[1]},${c[2]})`; }

function parseGlyph(rows) {
  const cells = [];
  rows.forEach((row, r) => row.split("").forEach((ch, c) => { if (ch === "1") cells.push({ r, c }); }));
  return cells;
}
// Reparte las celdas (orden de lectura) en n fragmentos lo más iguales posible.
function fragmentize(cells, n) {
  const sorted = [...cells].sort((a, b) => a.r - b.r || a.c - b.c);
  const base = Math.floor(sorted.length / n), extra = sorted.length % n;
  const groups = []; let idx = 0;
  for (let g = 0; g < n; g++) {
    const cnt = base + (g < extra ? 1 : 0);
    groups.push(sorted.slice(idx, idx + cnt)); idx += cnt;
  }
  return groups;
}
const cellPos = (cell) => [
  (cell.c - (GC - 1) / 2) * CELL,
  ((GR - 1) / 2 - cell.r) * CELL,
  0,
];

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function Cube({ pos, color, accent, active, onOver, onOut, onClick }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current?.material) {
      const target = active ? 0.7 : 0.18;
      ref.current.material.emissiveIntensity = THREE.MathUtils.lerp(ref.current.material.emissiveIntensity, target, 0.2);
    }
    if (ref.current) {
      const s = THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.12 : 1, 0.2);
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <RoundedBox ref={ref} args={[CELL * 0.9, CELL * 0.9, CELL * 0.9]} radius={0.1} smoothness={3} position={pos}
      onPointerOver={(e) => { e.stopPropagation(); onOver(); }}
      onPointerOut={onOut}
      onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <meshPhysicalMaterial color={color} emissive={accent} emissiveIntensity={0.18}
        metalness={0.15} roughness={0.28} clearcoat={1} clearcoatRoughness={0.14} />
    </RoundedBox>
  );
}

function Letter({ x, section, activeKey, setActiveKey, onAct }) {
  const groups = useMemo(() => fragmentize(parseGlyph(GLYPH[section.glyph]), section.items.length), [section]);

  // etiqueta del fragmento activo (centroide del grupo, desplazada arriba)
  const activeFrag = activeKey && activeKey.startsWith(section.num + ".") ? Number(activeKey.split(".")[1]) : -1;
  const labelPos = useMemo(() => {
    if (activeFrag < 0 || !groups[activeFrag]) return null;
    const pts = groups[activeFrag].map(cellPos);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const top = Math.max(...pts.map((p) => p[1]));
    return [cx, top + CELL * 0.9, 0.4];
  }, [activeFrag, groups]);

  return (
    <group position={[x, 0, 0]}>
      {groups.map((cells, g) => {
        const item = section.items[g];
        const fragKey = section.num + "." + g;
        const color = mix(section.color, 0.12 + 0.42 * (groups.length > 1 ? g / (groups.length - 1) : 0));
        const active = activeKey === fragKey;
        return cells.map((cell, ci) => (
          <Cube key={fragKey + "_" + ci} pos={cellPos(cell)} color={color} accent={section.color} active={active}
            onOver={() => setActiveKey(fragKey)} onOut={() => setActiveKey(null)}
            onClick={() => onAct(item, section.color)} />
        ));
      })}

      {labelPos && (
        <Html center position={labelPos} zIndexRange={[80, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
            fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "13px", fontWeight: 700,
            color: "#070E46", background: section.color, border: "2px solid rgba(255,255,255,.65)",
            borderRadius: "9px", padding: "5px 12px", boxShadow: `0 10px 28px ${section.color}99`,
          }}>
            <span>{section.items[activeFrag].label}</span>
            <span aria-hidden style={{ opacity: 0.65, fontSize: "12px" }}>{hint(section.items[activeFrag])}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function External({ pos, section, activeKey, setActiveKey, onAct }) {
  const ref = useRef();
  const item = section.items[0];
  const fragKey = section.num + ".0";
  const active = activeKey === fragKey;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.6;
    ref.current.rotation.x = t * 0.25;
    ref.current.position.y = pos[1] + Math.sin(t * 1.1) * 0.12;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.2 : 1, 0.2);
    ref.current.scale.setScalar(s);
  });
  return (
    <group position={pos}>
      <Icosahedron ref={ref} args={[0.62, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setActiveKey(fragKey); }}
        onPointerOut={() => setActiveKey(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item, section.color); }}>
        <meshPhysicalMaterial color={section.color} emissive={section.color} emissiveIntensity={active ? 0.8 : 0.4}
          metalness={0.3} roughness={0.18} clearcoat={1} flatShading />
      </Icosahedron>
      <Html center position={[0, -1, 0.4]} zIndexRange={[60, 0]} style={{ pointerEvents: "none" }}>
        <div style={{
          textAlign: "center", whiteSpace: "nowrap", fontFamily: "var(--font-lato), Lato, sans-serif",
          fontSize: "12px", fontWeight: 700, color: section.color,
        }}>
          <div style={{ fontSize: "9px", letterSpacing: ".2em", color: "rgba(133,200,255,.6)" }}>COORDINACIÓN</div>
          {item.label}
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
    grp.current.rotation.y = Math.sin(t * 0.3) * 0.12;
    grp.current.rotation.x = -0.05 + Math.sin(t * 0.22) * 0.03;
    grp.current.position.y = Math.sin(t * 0.6) * 0.1;
  });
  const n = letters.length;
  return (
    <group ref={grp}>
      {letters.map((s, i) => (
        <Letter key={s.num} x={(i - (n - 1) / 2) * (LETTER_W + LETTER_GAP)} section={s}
          activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
      ))}
      {external && (
        <External pos={[(n - 1) / 2 * (LETTER_W + LETTER_GAP) + LETTER_W * 0.7 + 1.4, GR * CELL * 0.5 + 0.2, 0]}
          section={external} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
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
        <Canvas orthographic camera={{ position: [0, 0, 14], zoom: 64, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 7, 9]} intensity={2.3} color="#F7F8F8" />
          <pointLight position={[-7, -2, 7]} intensity={1.7} color="#1D7CF4" />
          <pointLight position={[7, 4, 5]} intensity={1.4} color="#85C8FF" />
          <Suspense fallback={null}>
            <Scene3D letters={letters} external={external} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada letra es una sección · pulsa un fragmento para abrir · o usa la lista (Tab)
        </p>
      </div>

      {/* Lista espejo: índice permanente, navegable por teclado */}
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
