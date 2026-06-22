"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = icosaedro de alambre PIVOTANDO sobre la esfera distorsionada original.
 * Los 12 enlaces (Formaciones+Equipo+Proyectos) van en los 12 vértices del
 * icosaedro; cada vértice es un nodo-link con su cartel. La esfera del centro es
 * la "original" (MeshDistortMaterial). Coordinación = nodo externo (solo coord.).
 * Al pasar el ratón sobre un nodo, el icosaedro se detiene para poder pulsar.
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
];
const COORD = { num: "04", title: "Coordinación", color: "#9694FF", items: [{ label: "Control", href: "control.html" }] };

const SPHERE_R = 2.0;  // esfera central (como la original / control.html)
const CAGE_R = 4.9;    // radio del icosaedro
const NODE_R = 0.28;

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink, navInternal) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else navInternal(u, item);
}

// 12 vértices del icosaedro (proporción áurea) + sus 30 aristas. Ordenados de
// arriba abajo para que los colores de sección queden agrupados por latitud.
function icosa() {
  const t = (1 + Math.sqrt(5)) / 2;
  let raw = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  raw.sort((a, b) => b[1] - a[1]); // por Y descendente
  const len = Math.hypot(1, t, 0);
  const verts = raw.map((v) => [(v[0] / len) * CAGE_R, (v[1] / len) * CAGE_R, (v[2] / len) * CAGE_R]);
  const edges = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++) {
      const d2 = (raw[i][0] - raw[j][0]) ** 2 + (raw[i][1] - raw[j][1]) ** 2 + (raw[i][2] - raw[j][2]) ** 2;
      if (Math.abs(d2 - 4) < 0.2) edges.push([i, j]);
    }
  return { verts, edges };
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

// Esfera central como control.html: icosaedro de alambre + núcleo translúcido.
function ControlSphere() {
  const ref = useRef();
  const wireGeo = useMemo(() => new THREE.IcosahedronGeometry(SPHERE_R, 1), []);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.18;
    ref.current.rotation.x = s.clock.elapsedTime * 0.08;
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[SPHERE_R * 0.66, 2]} />
        <meshBasicMaterial color="#1D7CF4" transparent opacity={0.35} />
      </mesh>
      <lineSegments>
        <wireframeGeometry args={[wireGeo]} />
        <lineBasicMaterial color="#85C8FF" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

function Node({ pos, color, item, nodeKey, active, setActive, onAct }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.6 : 1, 0.18));
  });
  return (
    <group position={pos}>
      <mesh ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setActive(nodeKey); }}
        onPointerOut={() => setActive(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item, color); }}>
        <sphereGeometry args={[NODE_R, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.5 : 0.7} roughness={0.25} metalness={0.3} />
      </mesh>
      <Html center position={[0, 0.55, 0]} zIndexRange={active ? [80, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
        <button data-hover type="button" aria-label={aria(item)}
          onClick={() => onAct(item, color)}
          onMouseEnter={() => setActive(nodeKey)} onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(nodeKey)} onBlur={() => setActive(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", cursor: "pointer",
            fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12px", fontWeight: 700,
            color: active ? "#070E46" : "#F7F8F8", background: active ? color : "rgba(10,18,74,.92)",
            border: "1.5px solid " + color, borderRadius: "999px", padding: "3px 10px",
            boxShadow: active ? `0 8px 22px ${color}88` : "0 2px 10px rgba(0,0,0,.4)", transition: "all .15s",
          }}>
          <span>{item.label}</span>
          <span aria-hidden style={{ opacity: 0.6, fontSize: "10px" }}>{hint(item)}</span>
        </button>
      </Html>
    </group>
  );
}

// Icosaedro de alambre que pivota (se frena al interactuar con un nodo).
// edgeGeo = aristas del icosaedro; spokeGeo = radios desde el centro (nuevo_enfoque 3D).
function Cage({ nodes, edgeGeo, spokeGeo, active, setActive, onAct }) {
  const grp = useRef();
  const activeRef = useRef(active);
  activeRef.current = active;
  useFrame((s, dt) => {
    if (!grp.current) return;
    if (activeRef.current == null) grp.current.rotation.y += dt * 0.12; // pivota; pausa al hover
    grp.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.13) * 0.18;
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={spokeGeo}>
        <lineBasicMaterial color="#9fb0e0" transparent opacity={0.22} />
      </lineSegments>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#85C8FF" transparent opacity={0.45} />
      </lineSegments>
      {nodes.map((n) => (
        <Node key={n.nodeKey} pos={n.pos} color={n.color} item={n.item} nodeKey={n.nodeKey}
          active={active === n.nodeKey} setActive={setActive} onAct={onAct} />
      ))}
    </group>
  );
}

function ExternalNode({ section, active, setActive, onAct }) {
  const ref = useRef();
  const item = section.items[0];
  const nodeKey = "ext";
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.position.y = -6.1 + Math.sin(s.clock.elapsedTime * 1.1) * 0.18;
    ref.current.rotation.y = s.clock.elapsedTime * 0.6;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active === nodeKey ? 1.5 : 1, 0.2));
  });
  return (
    <group>
      <mesh ref={ref} position={[0, -6.1, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setActive(nodeKey); }}
        onPointerOut={() => setActive(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item, section.color); }}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={section.color} emissive={section.color} emissiveIntensity={active === nodeKey ? 1.3 : 0.6} flatShading metalness={0.3} roughness={0.2} />
      </mesh>
      <Html center position={[0, -7, 0]} zIndexRange={[60, 0]} style={{ pointerEvents: "auto" }}>
        <button data-hover type="button" aria-label={aria(item)}
          onClick={() => onAct(item, section.color)}
          onMouseEnter={() => setActive(nodeKey)} onMouseLeave={() => setActive(null)}
          style={{
            fontFamily: "var(--font-lato), Lato, sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer",
            color: active === nodeKey ? "#070E46" : "#F7F8F8", background: active === nodeKey ? section.color : "rgba(10,18,74,.92)",
            border: "1.5px solid " + section.color, borderRadius: "999px", padding: "3px 11px",
          }}>
          Coordinación · {item.label}
        </button>
      </Html>
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [active, setActive] = useState(null);
  const [nav, setNav] = useState(null);

  const { nodes, edgeGeo } = useMemo(() => {
    const { verts, edges } = icosa();
    const flat = [];
    SECTIONS.forEach((sec) => sec.items.forEach((item) => flat.push({ color: sec.color, section: sec.title, num: sec.num, item })));
    const nodes = verts.map((pos, i) => ({ ...flat[i], pos, nodeKey: "n" + i }));
    const pts = [];
    edges.forEach(([a, b]) => { pts.push(...verts[a], ...verts[b]); });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const spts = [];
    verts.forEach((v) => { spts.push(0, 0, 0, v[0], v[1], v[2]); }); // radios centro -> vértice
    const spokeGeo = new THREE.BufferGeometry();
    spokeGeo.setAttribute("position", new THREE.Float32BufferAttribute(spts, 3));
    return { nodes, edgeGeo, spokeGeo };
  }, []);

  const onAct = (item, color) =>
    activate(item, getUrl, copyLink, (url, it) => setNav({ url, label: it.label, color: color || "#85C8FF" }));

  const legendSections = isCoordinador ? [...SECTIONS, COORD] : SECTIONS;
  let gi = 0;

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas camera={{ position: [0, 0, 26], fov: 34 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.45} />
          <directionalLight position={[2, 9, 6]} intensity={2.0} color="#F7F8F8" />
          <pointLight position={[-8, -3, 6]} intensity={1.4} color="#1D7CF4" />
          <Suspense fallback={null}>
            <StudioEnv />
            <ControlSphere />
            <Cage nodes={nodes} edgeGeo={edgeGeo} spokeGeo={spokeGeo} active={active} setActive={setActive} onAct={onAct} />
            {isCoordinador && <ExternalNode section={COORD} active={active} setActive={setActive} onAct={onAct} />}
          </Suspense>
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.35} />
          </EffectComposer>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada vértice es un enlace · pulsa para abrir (el icosaedro se detiene al pasar el ratón) · o usa la lista (Tab)
        </p>
      </div>

      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        {legendSections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em]" style={{ color: sec.color }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
              {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it) => {
                const key = sec === COORD ? "ext" : "n" + gi++;
                return (
                  <li key={it.label}>
                    <button data-hover type="button" aria-label={aria(it)}
                      onClick={() => onAct(it, sec.color)}
                      onMouseEnter={() => setActive(key)} onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(key)} onBlur={() => setActive(null)}
                      className={"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-serene " +
                        (active === key ? "bg-white/10" : "hover:bg-white/5")}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sec.color }} />
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
