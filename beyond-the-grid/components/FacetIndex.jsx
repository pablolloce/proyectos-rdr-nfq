"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sphere, MeshDistortMaterial, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D = malla esférica (constelación 3D, tipo nuevo_enfoque) PIVOTANDO sobre
 * la esfera distorsionada original. Un nodo por enlace repartido por la esfera
 * (Fibonacci) -> caben todos, incluido Control (Coordinación), abajo. Radios
 * desde el centro + aristas a vecinos = la "figura de líneas" en 3D.
 * Al pasar el ratón sobre un nodo, la malla se detiene para poder pulsar.
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

const SPHERE_R = 1.7;  // esfera distorsionada central (la original)
const CAGE_R = 4.8;    // radio de la malla de nodos
const NODE_R = 0.28;

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else window.location.href = u; // navega directo: la página destino ya muestra su splash
}

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

// N puntos repartidos por la esfera (espiral de Fibonacci): arriba->abajo, así
// las secciones quedan en bandas (Formaciones arriba ... Coordinación abajo).
function fibSphere(N, R) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  for (let i = 0; i < N; i++) {
    const y = N === 1 ? 0 : 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    pts.push([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R]);
  }
  return pts;
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

// Esfera distorsionada original (sin parallax de ratón: solo auto-animación).
function CentralSphere() {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.08;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.08;
  });
  return (
    <Sphere ref={ref} args={[SPHERE_R, 160, 160]}>
      <MeshDistortMaterial color="#1D7CF4" roughness={0.06} metalness={0.4} clearcoat={1}
        clearcoatRoughness={0.12} envMapIntensity={1.5} distort={0.4} speed={1.4} />
    </Sphere>
  );
}

function Node({ node, active, setActive, onAct }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.6 : 1, 0.18));
  });
  const { pos, color, item, nodeKey } = node;
  return (
    <group position={pos}>
      <mesh ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setActive(nodeKey); }}
        onPointerOut={() => setActive(null)}
        onClick={(e) => { e.stopPropagation(); onAct(item); }}>
        <sphereGeometry args={[NODE_R, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.5 : 0.7} roughness={0.25} metalness={0.3} />
      </mesh>
      <Html center position={[0, 0.55, 0]} zIndexRange={active ? [80, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
        <button data-hover type="button" aria-label={aria(item)}
          onClick={() => onAct(item)}
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

// Malla de nodos que pivota (se frena al interactuar con un nodo).
function Cage({ nodes, edgeGeo, spokeGeo, active, setActive, onAct }) {
  const grp = useRef();
  const activeRef = useRef(active);
  activeRef.current = active;
  useFrame((s, dt) => {
    if (!grp.current) return;
    if (activeRef.current == null) grp.current.rotation.y += dt * 0.12; // pivota; pausa al hover
    grp.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.13) * 0.16;
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={spokeGeo}>
        <lineBasicMaterial color="#9fb0e0" transparent opacity={0.2} />
      </lineSegments>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#85C8FF" transparent opacity={0.4} />
      </lineSegments>
      {nodes.map((n) => (
        <Node key={n.nodeKey} node={n} active={active === n.nodeKey} setActive={setActive} onAct={onAct} />
      ))}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl, copyLink } = useLinks();
  const { isCoordinador } = useAuth();
  const [active, setActive] = useState(null);

  const sections = useMemo(() => SECTIONS.filter((s) => !s.coordOnly || isCoordinador), [isCoordinador]);

  const { nodes, edgeGeo, spokeGeo } = useMemo(() => {
    const flat = [];
    sections.forEach((sec) => sec.items.forEach((item) => flat.push({ color: sec.color, section: sec.title, num: sec.num, item })));
    const N = flat.length;
    const verts = fibSphere(N, CAGE_R);
    const nodes = verts.map((pos, i) => ({ ...flat[i], pos, nodeKey: "n" + i }));

    // Aristas: cada nodo a sus 3 vecinos más cercanos (sin duplicar).
    const seen = new Set(), epts = [];
    for (let i = 0; i < N; i++) {
      const d = [];
      for (let j = 0; j < N; j++) if (j !== i) d.push([dist2(verts[i], verts[j]), j]);
      d.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < Math.min(3, d.length); k++) {
        const j = d[k][1], key = i < j ? i + "-" + j : j + "-" + i;
        if (!seen.has(key)) { seen.add(key); epts.push(...verts[i], ...verts[j]); }
      }
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(epts, 3));

    const spts = [];
    verts.forEach((v) => spts.push(0, 0, 0, v[0], v[1], v[2]));
    const spokeGeo = new THREE.BufferGeometry();
    spokeGeo.setAttribute("position", new THREE.Float32BufferAttribute(spts, 3));

    return { nodes, edgeGeo, spokeGeo };
  }, [sections]);

  const onAct = (item) => activate(item, getUrl, copyLink);
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
            <CentralSphere />
            <Cage nodes={nodes} edgeGeo={edgeGeo} spokeGeo={spokeGeo} active={active} setActive={setActive} onAct={onAct} />
          </Suspense>
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.35} />
          </EffectComposer>
        </Canvas>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada nodo es un enlace · pulsa para abrir (la malla se detiene al pasar el ratón) · o usa la lista (Tab)
        </p>
      </div>

      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        {sections.map((sec) => (
          <div key={sec.num} className="mb-4">
            <p className="mb-2 flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em]" style={{ color: sec.color }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
              {sec.title}
            </p>
            <ul className="space-y-1">
              {sec.items.map((it) => {
                const key = "n" + gi++;
                return (
                  <li key={it.label}>
                    <button data-hover type="button" aria-label={aria(it)}
                      onClick={() => onAct(it)}
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
    </div>
  );
}
