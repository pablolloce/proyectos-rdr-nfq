"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

/**
 * Hub 3D a pantalla completa = esfera distorsionada ORIGINAL (HDRI city, look
 * realista) en el centro, rodeada de una malla esférica que pivota. La malla
 * tiene CAP vértices FIJOS; los enlaces se asignan a SLOTS fijos repartidos de
 * arriba a abajo (orden por secciones = agrupados por color). Lo no usado son
 * juntas de reserva -> al faltar Control o al añadir nodos futuros, la figura no
 * cambia. Solo aristas entre vértices (sin radios al centro). Header y menú flotan.
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

const HDRI = "/team-hub/hdri/city_1k.hdr";
const SPHERE_R = 2.4;   // esfera central prominente (como la original)
const CAGE_R = 5.0;     // radio de la malla (más cerca de la esfera)
const NODE_R = 0.3;
const CAP = 20;         // vértices FIJOS de la figura (capacidad; sube si hacen falta)

const hint = (it) => (it.copy ? "⧉" : it.key ? "↗" : "→");
const aria = (it) => it.label + (it.copy ? " · copiar enlace" : it.key ? " · abrir en pestaña nueva" : " · abrir");

function activate(item, getUrl, copyLink) {
  if (item.copy) { copyLink(item.key); return; }
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else window.location.href = u; // navega directo (la página destino muestra su splash)
}

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

// CAP puntos FIJOS por la esfera (espiral de Fibonacci): independientes del nº de links.
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

// Esfera distorsionada original (auto-animación, sin parallax de ratón).
function CentralSphere() {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.08;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.1;
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
      <Html center position={[0, 0.6, 0]} zIndexRange={active ? [80, 0] : [40, 0]} style={{ pointerEvents: "auto" }}>
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

// Malla de CAP vértices que pivota (se frena al interactuar con un nodo).
// Solo aristas vértice-a-vértice (sin radios al centro).
function Cage({ nodes, spares, edgeGeo, active, setActive, onAct }) {
  const grp = useRef();
  const activeRef = useRef(active);
  activeRef.current = active;
  useFrame((s, dt) => {
    if (!grp.current) return;
    if (activeRef.current == null) grp.current.rotation.y += dt * 0.1; // pivota; pausa al hover
    grp.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.12) * 0.16;
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#85C8FF" transparent opacity={0.38} />
      </lineSegments>
      {spares.map((p, i) => (
        <mesh key={"s" + i} position={p}>
          <sphereGeometry args={[NODE_R * 0.45, 12, 12]} />
          <meshStandardMaterial color="#4a5a8a" emissive="#2a3566" emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
      ))}
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

  const { nodes, spares, edgeGeo } = useMemo(() => {
    // Lista COMPLETA (incluye Control) -> slots fijos que no dependen del nº visible.
    const ALL = [];
    SECTIONS.forEach((sec) => sec.items.forEach((item) =>
      ALL.push({ color: sec.color, section: sec.title, coordOnly: !!sec.coordOnly, item })));
    const verts = fibSphere(CAP, CAGE_R);
    const NALL = ALL.length;
    // reparte los enlaces por TODA la altura (slot 0..CAP-1), conservando el orden por color
    const assigned = ALL.map((f, k) => {
      const slot = Math.round((k * (CAP - 1)) / (NALL - 1));
      return { ...f, slot, pos: verts[slot], nodeKey: "n" + k };
    });
    const nodes = assigned.filter((a) => !a.coordOnly || isCoordinador);
    const used = new Set(nodes.map((a) => a.slot));
    const spares = verts.filter((_, i) => !used.has(i));

    // Aristas: cada vértice a sus 3 vecinos más cercanos (toda la figura, fija).
    const seen = new Set(), epts = [];
    for (let i = 0; i < CAP; i++) {
      const d = [];
      for (let j = 0; j < CAP; j++) if (j !== i) d.push([dist2(verts[i], verts[j]), j]);
      d.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < Math.min(3, d.length); k++) {
        const j = d[k][1], key = i < j ? i + "-" + j : j + "-" + i;
        if (!seen.has(key)) { seen.add(key); epts.push(...verts[i], ...verts[j]); }
      }
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(epts, 3));

    return { nodes, spares, edgeGeo };
  }, [isCoordinador]);

  const onAct = (item) => activate(item, getUrl, copyLink);
  let gi = 0;

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }} className="!absolute inset-0">
        <color attach="background" args={["#070E46"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={2.2} color="#F7F8F8" />
        <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#1D7CF4" />
        <Suspense fallback={null}>
          <Environment files={HDRI} />
          <CentralSphere />
          <Cage nodes={nodes} spares={spares} edgeGeo={edgeGeo} active={active} setActive={setActive} onAct={onAct} />
        </Suspense>
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.35} />
        </EffectComposer>
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-20 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
        Cada nodo es un enlace · pulsa para abrir (la malla se detiene al pasar el ratón) · o usa la lista
      </p>

      <aside className="pointer-events-auto absolute right-4 top-28 bottom-16 z-20 hidden w-60 overflow-auto rounded-2xl border border-serene/10 bg-midnight/40 p-4 backdrop-blur-md md:block">
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
