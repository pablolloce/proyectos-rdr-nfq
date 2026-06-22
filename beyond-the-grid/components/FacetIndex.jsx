"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Navegación 3D del hub estilo "losa de cubos" (ref: ejemplo.PNG) con la
 * distribución en 2×2 de bloques por sección (ref: distribucion.png).
 *
 *  - Cada CUBO redondeado = un enlace (etiqueta siempre visible). Los huecos se
 *    rellenan con cubos neutros para dar el aspecto de losa.
 *  - El conjunto está en MOVIMIENTO continuo propio (inclinación fija + balanceo
 *    lento + flotar) — NO sigue al ratón. Los cubos no se trasladan: el balanceo
 *    es leve, así que el target es estable y fácil de clicar.
 *  - Las etiquetas son <button> HTML reales (teclado + lector de pantalla) y hay
 *    una lista lateral espejo para navegar 100% con teclado.
 *  - Solo luces (sin HDRI remoto) -> rápido y sin depender de la red.
 *
 * Orden de los bloques = cuadrantes: [arriba-izq, arriba-der, abajo-izq, abajo-der].
 */
const SECTIONS = [
  { num: "03", title: "Proyectos", items: [
    { label: "Pases",         href: "pases-calendados.html", color: "#FFE761" },
    { label: "Planificación", key: "planificacionNFQ",       color: "#85C8FF" },
    { label: "GitHub",        key: "githubBBVA",             color: "#8BE1E9", copy: true },
    { label: "Drive",         key: "driveBBVA",              color: "#88E783", copy: true },
  ] },
  { num: "01", title: "Formaciones", items: [
    { label: "¿Qué es RDR?",  href: "que-es-rdr.html",    color: "#85C8FF" },
    { label: "HUB Formación", href: "rdr-formacion.html", color: "#88E783" },
    { label: "Portal CIB",    key: "portalBBVACIB",       color: "#F7F8F8", copy: true },
  ] },
  { num: "02", title: "Equipo", items: [
    { label: "Retro",       href: "retro.html",      color: "#FFB56B" },
    { label: "Vacaciones",  href: "vacaciones.html", color: "#8BE1E9" },
    { label: "Comidas",     href: "comidas.html",    color: "#FFE761" },
    { label: "Time Report", key: "timeReportNFQ",    color: "#9694FF" },
    { label: "TR BBVA",     key: "timeReportBBVA",   color: "#9694FF", copy: true },
  ] },
  { num: "04", title: "Coordinación", coordOnly: true, items: [
    { label: "Control", href: "control.html", color: "#9694FF" },
  ] },
];

const COLS = 3;       // cubos por fila dentro de un bloque
const CS = 1.0;       // tamaño del cubo
const SP = 1.16;      // separación entre cubos (costura)
const GAP_X = 1.7;    // separación horizontal entre bloques
const GAP_Y = 2.1;    // separación vertical entre bloques (incluye título)
const TILT = -0.14;   // inclinación fija (look isométrico de ejemplo.PNG)

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

// Coloca los enlaces en una rejilla de COLS columnas y rellena la última fila.
function layoutBlock(section) {
  const items = section.items;
  const rows = Math.ceil(items.length / COLS);
  const slots = rows * COLS;
  const cells = [];
  for (let i = 0; i < slots; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    cells.push({
      item: items[i] || null, // null = relleno
      x: (col - (COLS - 1) / 2) * SP,
      y: ((rows - 1) / 2 - row) * SP,
      key: section.num + "." + i,
    });
  }
  return { cells, rows, w: COLS * SP, h: rows * SP };
}

function LinkCube({ cell, active, setActive, onAct }) {
  const ref = useRef();
  const lift = useRef(0);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const { item } = cell;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    lift.current = THREE.MathUtils.lerp(lift.current, active ? 0.55 : 0, 0.2);
    ref.current.position.z = lift.current;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.12 : 1, 0.2);
    ref.current.scale.setScalar(s);
    // costura que late: pequeño pulso de emisión continuo
    if (ref.current.material) {
      const base = active ? 0.85 : 0.4;
      ref.current.material.emissiveIntensity = base + Math.sin(t * 1.6 + phase) * 0.1;
    }
  });

  return (
    <group position={[cell.x, cell.y, 0]}>
      <RoundedBox
        ref={ref}
        args={[CS, CS, CS]}
        radius={0.16}
        smoothness={5}
        onPointerOver={(e) => { e.stopPropagation(); setActive(true); }}
        onPointerOut={() => setActive(false)}
        onPointerDown={(e) => { e.stopPropagation(); onAct(item); }}
      >
        <meshPhysicalMaterial
          color="#EEF1F8"
          emissive={item.color}
          emissiveIntensity={0.4}
          metalness={0.1}
          roughness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </RoundedBox>

      <Html center position={[0, 0, CS * 0.5 + 0.05]} zIndexRange={[30, 0]}>
        <button
          data-hover
          type="button"
          aria-label={aria(item)}
          onClick={() => onAct(item)}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          style={{
            whiteSpace: "nowrap", cursor: "pointer",
            fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12px", fontWeight: 700,
            color: active ? "#070E46" : "#0A1240",
            background: active ? item.color : "rgba(247,248,248,.92)",
            border: "1.5px solid " + item.color,
            borderRadius: "999px", padding: "4px 11px",
            boxShadow: active ? `0 8px 24px ${item.color}66` : "0 2px 8px rgba(0,0,0,.35)",
            transition: "background .15s, color .15s, box-shadow .15s",
          }}
        >
          {item.label} <span aria-hidden style={{ opacity: 0.65 }}>{hint(item)}</span>
        </button>
      </Html>
    </group>
  );
}

function FillerCube({ cell }) {
  return (
    <RoundedBox args={[CS, CS, CS]} radius={0.16} smoothness={4} position={[cell.x, cell.y, 0]}>
      <meshPhysicalMaterial color="#D7DCEA" emissive="#001391" emissiveIntensity={0.06}
        metalness={0.1} roughness={0.4} clearcoat={0.8} clearcoatRoughness={0.25} />
    </RoundedBox>
  );
}

function Block({ pos, section, layout, activeKey, setActiveKey, onAct }) {
  return (
    <group position={pos}>
      <Html center position={[0, layout.h / 2 + 0.7, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(133,200,255,.6)", fontFamily: "var(--font-lato), Lato, sans-serif" }}>
            {section.num}
          </div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#F7F8F8", fontFamily: "var(--font-serif), Georgia, serif" }}>
            {section.title}
          </div>
        </div>
      </Html>
      {layout.cells.map((cell) =>
        cell.item ? (
          <LinkCube key={cell.key} cell={cell}
            active={activeKey === cell.key}
            setActive={(v) => setActiveKey(v ? cell.key : null)}
            onAct={onAct} />
        ) : (
          <FillerCube key={cell.key} cell={cell} />
        )
      )}
    </group>
  );
}

function Assembly({ blocks, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  useFrame((state) => {
    if (!grp.current) return;
    const t = state.clock.elapsedTime;
    grp.current.rotation.x = TILT;
    grp.current.rotation.y = Math.sin(t * 0.35) * 0.18;  // balanceo continuo (no ratón)
    grp.current.position.y = Math.sin(t * 0.6) * 0.12;    // flotar
  });
  return (
    <group ref={grp}>
      {blocks.map((b) => (
        <Block key={b.section.num} pos={b.pos} section={b.section} layout={b.layout}
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

  const sections = useMemo(
    () => SECTIONS.filter((s) => !s.coordOnly || isCoordinador),
    [isCoordinador]
  );

  // Distribución en rejilla de 2 columnas (cuadrantes). Última fila impar -> centrada.
  const blocks = useMemo(() => {
    const laid = sections.map((s) => ({ section: s, layout: layoutBlock(s) }));
    const cellW = COLS * SP + GAP_X;
    const maxH = Math.max(...laid.map((l) => l.layout.h)) + GAP_Y;
    const nRows = Math.ceil(laid.length / 2);
    return laid.map((l, bi) => {
      const row = Math.floor(bi / 2);
      const col = bi % 2;
      const aloneInRow = bi === laid.length - 1 && laid.length % 2 === 1;
      const x = aloneInRow ? 0 : (col - 0.5) * cellW;
      const y = ((nRows - 1) / 2 - row) * maxH;
      return { ...l, pos: [x, y, 0] };
    });
  }, [sections]);

  const onAct = (item) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: it.color }));

  const zoom = isCoordinador ? 58 : 66;

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas
          orthographic
          camera={{ position: [0, 0, 14], zoom, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 8, 9]} intensity={2.4} color="#F7F8F8" />
          <pointLight position={[-8, -3, 7]} intensity={1.9} color="#1D7CF4" />
          <pointLight position={[8, 4, 5]} intensity={1.5} color="#85C8FF" />
          <Suspense fallback={null}>
            <Assembly blocks={blocks} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Pulsa un cubo para abrir · o navega con la lista (Tab)
        </p>
      </div>

      {/* Lista espejo: navegación 100% accesible por teclado */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 lg:block">
        {sections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.2em] text-serene/70">
              <span className="text-serene/40">{sec.num}</span> · {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it, ri) => {
                const key = sec.num + "." + ri;
                return (
                  <li key={it.label}>
                    <button
                      data-hover
                      type="button"
                      aria-label={aria(it)}
                      onClick={() => onAct(it)}
                      onMouseEnter={() => setActiveKey(key)}
                      onMouseLeave={() => setActiveKey(null)}
                      onFocus={() => setActiveKey(key)}
                      onBlur={() => setActiveKey(null)}
                      className={
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-serene " +
                        (activeKey === key ? "bg-white/10" : "hover:bg-white/5")
                      }
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: it.color }} />
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
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onAnimationComplete={() => { window.location.href = nav.url; }}
          >
            <div className="text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-serene/25"
                style={{ borderTopColor: nav.color }} />
              <p className="font-display text-xs uppercase tracking-[0.3em] text-serene/60">Abriendo</p>
              <p className="mt-1 font-display text-2xl font-bold" style={{ color: nav.color }}>{nav.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
