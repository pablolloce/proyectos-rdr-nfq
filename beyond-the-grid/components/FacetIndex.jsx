"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = un BLOQUE dividido en 4 PARTES (las 4 secciones), dispuestas en 2×2.
 *  - Cada parte es un PANEL 3D de color propio (se distinguen de un vistazo).
 *  - Dentro de cada panel, cada enlace es una BARRA-botón con su etiqueta SIEMPRE
 *    visible (sabes qué vas a abrir antes de clicar).
 *  - El click va sobre la barra (target 3D fiable); la etiqueta es solo visual
 *    (no intercepta el ratón). Lista lateral espejo para teclado.
 *  - Movimiento continuo propio (balanceo/flotar + brillo que late); NO sigue al ratón.
 *
 * Orden = cuadrantes [arriba-izq, arriba-der, abajo-izq, abajo-der].
 */
const SECTIONS = [
  { num: "03", title: "Proyectos", color: "#88E783", items: [
    { label: "Pases",         href: "pases-calendados.html" },
    { label: "Planificación", key: "planificacionNFQ" },
    { label: "GitHub",        key: "githubBBVA", copy: true },
    { label: "Drive",         key: "driveBBVA", copy: true },
  ] },
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
  { num: "04", title: "Coordinación", color: "#9694FF", coordOnly: true, items: [
    { label: "Control", href: "control.html" },
  ] },
];

// Barra (enlace)
const BW = 3.0, BH = 0.6, BD = 0.5;
const BG = 0.16;                 // separación entre barras
const PITCH = BH + BG;           // paso vertical
const PAD = 0.42;                // margen interior del panel
const PANEL_D = 0.5;             // grosor del panel (detrás de las barras)
const GAP = 1.25;                // separación entre las 4 partes
const TITLE_DY = 0.85;           // hueco para el título sobre cada panel
const TILT = -0.16;              // ligera inclinación: se ve el grosor (bloque)

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function LinkBar({ y, item, color, active, setActive, onAct }) {
  const ref = useRef();
  const lift = useRef(0);
  useFrame(() => {
    if (!ref.current) return;
    lift.current = THREE.MathUtils.lerp(lift.current, active ? 0.34 : 0, 0.2);
    ref.current.position.z = BD / 2 + 0.02 + lift.current;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.04 : 1, 0.2);
    ref.current.scale.set(s, s, 1);
    if (ref.current.material) ref.current.material.emissiveIntensity = active ? 0.5 : 0.14;
  });
  return (
    <group position={[0, y, 0]}>
      <RoundedBox
        ref={ref}
        args={[BW, BH, BD]}
        radius={0.12}
        smoothness={4}
        position={[0, 0, BD / 2 + 0.02]}
        onPointerOver={(e) => { e.stopPropagation(); setActive(true); }}
        onPointerOut={() => setActive(false)}
        onClick={(e) => { e.stopPropagation(); onAct(item, color); }}
      >
        <meshPhysicalMaterial color="#F7F8F8" emissive={color} emissiveIntensity={0.14}
          metalness={0.1} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} />
      </RoundedBox>
      {/* Etiqueta SIEMPRE visible (solo visual; el click va a la barra) */}
      <Html center position={[0, 0, BD + 0.06]} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
          width: "118px", whiteSpace: "nowrap",
          fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "13px", fontWeight: 700,
          color: "#001391",
          transform: active ? "scale(1.04)" : "scale(1)", transition: "transform .15s",
        }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
          <span aria-hidden style={{ opacity: 0.55, fontSize: "12px" }}>{hint(item)}</span>
        </div>
      </Html>
    </group>
  );
}

function Part({ pos, section, panelH, activeKey, setActiveKey, onAct }) {
  const n = section.items.length;
  const topY = panelH / 2 - PAD - BH / 2;
  return (
    <group position={pos}>
      {/* Título de la parte */}
      <Html center position={[0, panelH / 2 + TITLE_DY, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(133,200,255,.65)", fontFamily: "var(--font-lato), Lato, sans-serif" }}>{section.num}</span>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#F7F8F8", fontFamily: "var(--font-serif), Georgia, serif" }}>{section.title}</div>
        </div>
      </Html>

      {/* Panel de color = la PARTE */}
      <RoundedBox args={[BW + 2 * PAD, panelH, PANEL_D]} radius={0.18} smoothness={4} position={[0, 0, 0]}>
        <meshPhysicalMaterial color={section.color} emissive={section.color} emissiveIntensity={0.22}
          metalness={0.15} roughness={0.3} clearcoat={1} clearcoatRoughness={0.18} />
      </RoundedBox>

      {/* Barras-enlace */}
      {section.items.map((it, ri) => {
        const key = section.num + "." + ri;
        return (
          <LinkBar key={key} y={topY - ri * PITCH} item={it} color={section.color}
            active={activeKey === key}
            setActive={(v) => setActiveKey(v ? key : null)}
            onAct={onAct} />
        );
      })}
    </group>
  );
}

function Assembly({ parts, panelH, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  useFrame((state) => {
    if (!grp.current) return;
    const t = state.clock.elapsedTime;
    grp.current.rotation.x = TILT;
    grp.current.rotation.y = Math.sin(t * 0.3) * 0.14;   // balanceo continuo (no ratón)
    grp.current.position.y = Math.sin(t * 0.6) * 0.12;    // flotar
  });
  return (
    <group ref={grp}>
      {parts.map((p) => (
        <Part key={p.section.num} pos={p.pos} section={p.section} panelH={panelH}
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

  // Paneles del mismo tamaño (look de bloque uniforme): alto = nº máx. de enlaces.
  const maxRows = Math.max(...sections.map((s) => s.items.length));
  const panelH = maxRows * PITCH - BG + 2 * PAD;
  const panelW = BW + 2 * PAD;

  // Distribución en 2×2 (última fila impar -> centrada).
  const parts = useMemo(() => {
    const cellW = panelW + GAP;
    const cellH = panelH + TITLE_DY + 0.6 + GAP;
    const nRows = Math.ceil(sections.length / 2);
    return sections.map((s, i) => {
      const row = Math.floor(i / 2), col = i % 2;
      const alone = i === sections.length - 1 && sections.length % 2 === 1;
      const x = alone ? 0 : (col - 0.5) * cellW;
      const y = ((nRows - 1) / 2 - row) * cellH;
      return { section: s, pos: [x, y, 0] };
    });
  }, [sections, panelH, panelW]);

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  const zoom = isCoordinador ? 46 : 50;

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas orthographic camera={{ position: [0, 0, 14], zoom, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 7, 9]} intensity={2.3} color="#F7F8F8" />
          <pointLight position={[-7, -2, 7]} intensity={1.7} color="#1D7CF4" />
          <pointLight position={[7, 4, 5]} intensity={1.4} color="#85C8FF" />
          <Suspense fallback={null}>
            <Assembly parts={parts} panelH={panelH} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Pulsa una barra para abrir · o navega con la lista (Tab)
        </p>
      </div>

      {/* Lista espejo: navegación 100% accesible por teclado */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        {sections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.2em]" style={{ color: sec.color }}>
              <span className="opacity-50">{sec.num}</span> · {sec.title}
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
