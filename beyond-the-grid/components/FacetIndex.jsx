"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Icosahedron } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Navegación 3D del hub: una CONSTELACIÓN de nodos-gema (uno por enlace),
 * agrupados en columnas por sección, vista frontal.
 *
 * Decisiones de accesibilidad / claridad:
 *  - Los nodos NO se trasladan ni siguen al ratón -> target estable, fácil de clicar.
 *  - Cada gema gira sobre sí misma y flota un poco = movimiento continuo propio.
 *  - La ETIQUETA siempre está visible (no hace falta hover) y es un <button> HTML
 *    real (foco de teclado, lector de pantalla, área de click amplia).
 *  - Lista lateral espejo para navegar 100% con teclado.
 *  - Sin HDRI remoto (solo luces) -> rápido y sin depender de la red.
 */
const SECTIONS = [
  { num: "01", title: "Formaciones", items: [
    { label: "¿Qué es RDR?",    href: "que-es-rdr.html",     color: "#85C8FF" },
    { label: "HUB Formativo",   href: "rdr-formacion.html",  color: "#88E783" },
    { label: "Portal BBVA CIB", key: "portalBBVACIB",        color: "#F7F8F8", copy: true },
  ] },
  { num: "02", title: "Equipo RDR", items: [
    { label: "Vacaciones",       href: "vacaciones.html", color: "#8BE1E9" },
    { label: "Time Report NFQ",  key: "timeReportNFQ",    color: "#9694FF" },
    { label: "Time Report BBVA", key: "timeReportBBVA",   color: "#9694FF", copy: true },
    { label: "Retrospectiva",    href: "retro.html",      color: "#FFB56B" },
    { label: "Comidas",          href: "comidas.html",    color: "#FFE761" },
  ] },
  { num: "03", title: "Proyectos RDR", items: [
    { label: "Planificación",    key: "planificacionNFQ",      color: "#85C8FF" },
    { label: "Pases Calendados", href: "pases-calendados.html", color: "#FFE761" },
    { label: "Drive BBVA",       key: "driveBBVA",             color: "#88E783", copy: true },
    { label: "GitHub BBVA",      key: "githubBBVA",            color: "#8BE1E9", copy: true },
  ] },
  { num: "04", title: "Coordinación", coordOnly: true, items: [
    { label: "Control RDR", href: "control.html", color: "#9694FF" },
  ] },
];

const COL_W = 4.6;     // separación entre columnas (secciones)
const ROW_H = 1.55;    // separación vertical entre nodos
const TITLE_DY = 1.35; // hueco para el título de sección

// Pista de acción según el tipo de enlace.
const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) =>
  it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

function Token({ baseY, item, active, setActive, onAct }) {
  const grp = useRef();
  const gem = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (gem.current) gem.current.rotation.y = t * 0.8 + phase; // giro propio (continuo)
    if (grp.current) {
      grp.current.position.y = baseY + Math.sin(t * 1.05 + phase) * 0.05; // flotar suave
      const s = THREE.MathUtils.lerp(grp.current.scale.x, active ? 1.16 : 1, 0.18);
      grp.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={grp} position={[0, baseY, 0]}>
      <Icosahedron
        ref={gem}
        args={[0.36, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setActive(true); }}
        onPointerOut={() => setActive(false)}
        onPointerDown={(e) => { e.stopPropagation(); onAct(item); }}
      >
        <meshPhysicalMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={active ? 0.75 : 0.28}
          metalness={0.3}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.15}
          flatShading
        />
      </Icosahedron>

      {/* Etiqueta = botón HTML real (siempre visible, accesible, target grande) */}
      <Html center position={[0, -0.66, 0]} zIndexRange={[30, 0]}>
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
            whiteSpace: "nowrap",
            cursor: "pointer",
            fontFamily: "var(--font-lato), Lato, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F7F8F8",
            background: active ? "rgba(10,18,74,.98)" : "rgba(10,18,74,.8)",
            border: "1.5px solid " + (active ? item.color : "rgba(133,200,255,.4)"),
            borderRadius: "999px",
            padding: "7px 15px",
            boxShadow: active ? `0 8px 26px ${item.color}55` : "0 2px 10px rgba(0,0,0,.3)",
            transition: "background .15s, border-color .15s, box-shadow .15s",
          }}
        >
          {item.label} <span aria-hidden style={{ opacity: 0.7 }}>{hint(item)}</span>
        </button>
      </Html>
    </group>
  );
}

function Column({ x, section, fi, activeKey, setActiveKey, onAct }) {
  const n = section.items.length;
  const topY = ((n - 1) * ROW_H) / 2;
  return (
    <group position={[x, 0, 0]}>
      <Html center position={[0, topY + TITLE_DY, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: "rgba(133,200,255,.6)", fontFamily: "var(--font-lato), Lato, sans-serif" }}>
            {section.num}
          </div>
          <div style={{ fontSize: "19px", fontWeight: 700, color: "#F7F8F8", fontFamily: "var(--font-serif), Georgia, serif" }}>
            {section.title}
          </div>
        </div>
      </Html>
      {section.items.map((it, ri) => {
        const key = fi + "." + ri;
        return (
          <Token
            key={key}
            baseY={topY - ri * ROW_H}
            item={it}
            active={activeKey === key}
            setActive={(v) => setActiveKey(v ? key : null)}
            onAct={onAct}
          />
        );
      })}
    </group>
  );
}

function Constellation({ sections, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  // Respiración global muy leve del conjunto (sin desplazar los targets).
  useFrame((state) => {
    if (grp.current) grp.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.012;
  });
  const n = sections.length;
  return (
    <group ref={grp}>
      {sections.map((sec, fi) => (
        <Column
          key={sec.num}
          x={(fi - (n - 1) / 2) * COL_W}
          section={sec}
          fi={fi}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          onAct={onAct}
        />
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
  const onAct = (item) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: it.color }));

  // zoom según nº de columnas para que entre sin recortes
  const zoom = sections.length >= 4 ? 46 : 54;

  return (
    <div className="absolute inset-0 flex">
      {/* Lienzo 3D interactivo */}
      <div className="relative flex-1">
        <Canvas
          orthographic
          camera={{ position: [0, 0, 12], zoom, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 6, 8]} intensity={2.2} color="#F7F8F8" />
          <pointLight position={[-7, -2, 6]} intensity={1.7} color="#1D7CF4" />
          <pointLight position={[7, 3, 5]} intensity={1.5} color="#85C8FF" />
          <Suspense fallback={null}>
            <Constellation
              sections={sections}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              onAct={onAct}
            />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Pulsa un nodo para abrir · o navega con la lista (Tab)
        </p>
      </div>

      {/* Lista espejo: navegación 100% accesible por teclado */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 lg:block">
        {sections.map((sec, fi) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.2em] text-serene/70">
              <span className="text-serene/40">{sec.num}</span> · {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it, ri) => {
                const key = fi + "." + ri;
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

      {/* Transición de salida hacia la página destino */}
      <AnimatePresence>
        {nav && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onAnimationComplete={() => { window.location.href = nav.url; }}
          >
            <div className="text-center">
              <div
                className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-serene/25"
                style={{ borderTopColor: nav.color }}
              />
              <p className="font-display text-xs uppercase tracking-[0.3em] text-serene/60">Abriendo</p>
              <p className="mt-1 font-display text-2xl font-bold" style={{ color: nav.color }}>{nav.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
