"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Icosahedron, MeshDistortMaterial, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import opentype from "opentype.js";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = letras R · D · R extruidas desde la fuente redondeada Baloo 2
 * (opentype.js -> THREE.Shape -> ExtrudeGeometry). Acabado tipo yinger.dev:
 * material reflectante con ondulación (MeshDistortMaterial) + reflejos de un
 * Environment de Lightformers (luz superior) + BLOOM (postprocessing).
 * Cada porción angular = un enlace; se interactúa con la letra (raycast por ángulo).
 * Control = gema externa (solo coordinadores).
 */
// public/fonts servido bajo basePath. Probamos varias rutas por robustez (dev/prod).
const FONT_URLS = ["/team-hub/fonts/Baloo2.ttf", "/fonts/Baloo2.ttf", "fonts/Baloo2.ttf"];

async function loadFont() {
  for (const url of FONT_URLS) {
    try {
      const r = await fetch(url);
      if (r.ok) return opentype.parse(await r.arrayBuffer(), {});
    } catch (e) { /* probar siguiente ruta */ }
  }
  throw new Error("No se pudo cargar Baloo2.ttf desde: " + FONT_URLS.join(", "));
}

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

const DZ = 0.95;
const LETX = 6.6;
const LBL_R = 3.2;
const FRONT = DZ / 2 + 0.1;
const TARGET_H = 3.7; // alto de letra en el mundo

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

// Glifo de la fuente -> geometría extruida (con sus huecos). Se voltea la Y
// (opentype usa Y hacia abajo) y se centra/escala a TARGET_H.
function glyphGeometry(font, char) {
  const glyph = font.charToGlyph(char);
  const path = glyph.getPath(0, 0, 4); // tamaño em arbitrario; luego se normaliza
  const sp = new THREE.ShapePath();
  path.commands.forEach((c) => {
    if (c.type === "M") sp.moveTo(c.x, -c.y);
    else if (c.type === "L") sp.lineTo(c.x, -c.y);
    else if (c.type === "C") sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
    else if (c.type === "Q") sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y);
  });
  const shapes = sp.toShapes(true);
  const g = new THREE.ExtrudeGeometry(shapes, { depth: DZ, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.09, bevelSegments: 4, steps: 1, curveSegments: 40 });
  g.center();
  g.computeBoundingBox();
  const h = g.boundingBox.max.y - g.boundingBox.min.y || 1;
  g.scale(TARGET_H / h, TARGET_H / h, 1);
  g.center();
  console.info(`[FacetIndex] glifo "${char}": ${shapes.length} shape(s), ${g.attributes.position.count} vértices`, g.boundingBox);
  return g;
}

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

function Letter({ x, section, geo, activeKey, setActiveKey, onAct }) {
  const grp = useRef();
  const meshRef = useRef();
  const mat = useRef();
  const n = section.items.length;
  const letterActive = activeKey != null && activeKey.startsWith(section.num + ".");
  const mids = useMemo(() => section.items.map((_, i) => -Math.PI / 2 + i * (2 * Math.PI / n) + Math.PI / n), [n]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (grp.current) {
      grp.current.rotation.z = Math.sin(t * 0.45 + x) * 0.04;
      grp.current.rotation.x = -0.05 + Math.sin(t * 0.33 + x) * 0.04;
      grp.current.rotation.y = Math.sin(t * 0.26 + x) * 0.06;
      grp.current.position.y = Math.sin(t * 0.5 + x) * 0.18;
    }
    if (mat.current) mat.current.emissiveIntensity = THREE.MathUtils.lerp(mat.current.emissiveIntensity, letterActive ? 0.5 : 0.16, 0.12);
  });

  function sectorAt(point) {
    const p = point.clone();
    meshRef.current.worldToLocal(p);
    let rel = Math.atan2(p.y, p.x) + Math.PI / 2;
    rel = ((rel % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(rel / (2 * Math.PI / n)) % n;
  }

  return (
    <group ref={grp} position={[x, 0, 0]}>
      <mesh ref={meshRef} geometry={geo}
        onPointerMove={(e) => { e.stopPropagation(); setActiveKey(section.num + "." + sectorAt(e.point)); }}
        onPointerOut={() => setActiveKey(null)}
        onClick={(e) => { e.stopPropagation(); onAct(section.items[sectorAt(e.point)], section.color); }}>
        <MeshDistortMaterial ref={mat} color={section.color} emissive={section.color} emissiveIntensity={0.16}
          roughness={0.06} metalness={0.4} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.6} distort={0.28} speed={1.8} />
      </mesh>

      <Html center position={[0, TARGET_H / 2 + 0.6, FRONT]} style={{ pointerEvents: "none" }}>
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

function Scene3D({ letters, external, geos, activeKey, setActiveKey, onAct }) {
  const n = letters.length;
  return (
    <group>
      {letters.map((s, i) => (
        <Letter key={s.num} x={(i - (n - 1) / 2) * LETX} section={s} geo={geos[s.glyph]} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />
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
  const [geos, setGeos] = useState(null); // { R, D } geometrías de la fuente

  useEffect(() => {
    let alive = true;
    loadFont()
      .then((font) => {
        if (!alive) return;
        const g = { R: glyphGeometry(font, "R"), D: glyphGeometry(font, "D") };
        console.info("[FacetIndex] fuente cargada, geometrías listas", g);
        setGeos(g);
      })
      .catch((e) => console.error("[FacetIndex] error cargando fuente:", e));
    return () => { alive = false; };
  }, []);

  const letters = SECTIONS.filter((s) => !s.external);
  const external = isCoordinador ? SECTIONS.find((s) => s.external) : null;
  const legendSections = external ? [...letters, external] : letters;

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
            {geos && <Scene3D letters={letters} external={external} geos={geos} activeKey={activeKey} setActiveKey={setActiveKey} onAct={onAct} />}
          </Suspense>
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.6} luminanceSmoothing={0.35} />
          </EffectComposer>
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
