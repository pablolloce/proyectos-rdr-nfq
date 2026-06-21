"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/pointerStore";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const CS = 0.86;   // tamaño del cubo
const GS = 1.06;   // separación entre cubos de una misma cara
const D = 1.45;    // distancia del centro de cada cara al origen
const LIFT = 0.42; // cuánto sale el cubo al hover

// Cada CARA del cubo = una sección (la "separación" del index.html original).
const FACES = [
  { num: "01", title: "Formaciones", normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], items: [
    { label: "¿Qué es RDR?", href: "que-es-rdr.html", color: "#85C8FF" },
    { label: "HUB Formativo", href: "rdr-formacion.html", color: "#88E783" },
    { label: "Portal BBVA CIB", key: "portalBBVACIB", color: "#F7F8F8" },
  ] },
  { num: "02", title: "Equipo RDR", normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], items: [
    { label: "Vacaciones", href: "vacaciones.html", color: "#8BE1E9" },
    { label: "Time Report", key: "timeReportNFQ", color: "#9694FF" },
    { label: "Retrospectiva", href: "retro.html", color: "#FFB56B" },
    { label: "Comidas", href: "comidas.html", color: "#FFE761" },
  ] },
  { num: "03", title: "Proyectos RDR", normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], items: [
    { label: "Planificación", key: "planificacionNFQ", color: "#85C8FF" },
    { label: "Pases Calendados", href: "pases-calendados.html", color: "#FFE761" },
    { label: "Drive", key: "driveBBVA", color: "#88E783" },
    { label: "GitHub", key: "githubBBVA", color: "#8BE1E9" },
  ] },
];
const COORD_FACE = { num: "04", title: "Coordinación", normal: [0, 1, 0], items: [
  { label: "Control RDR", href: "control.html", color: "#9694FF" },
] };

function navTo(item, getUrl) {
  const u = item.href || getUrl(item.key) || "#";
  if (!u || u === "#") return;
  if (item.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else window.location.href = u;
}

// Posiciones de los cubos de una cara (rejilla centrada sobre el plano de la cara).
function layoutFace(face) {
  const n = new THREE.Vector3(...face.normal);
  const u = new THREE.Vector3(...(face.u || [1, 0, 0]));
  const v = new THREE.Vector3(...(face.v || [0, 0, 1]));
  const cols = face.items.length <= 3 ? face.items.length : 2;
  const rows = Math.ceil(face.items.length / cols);
  const center = n.clone().multiplyScalar(face.dist || D);
  const cubes = face.items.map((it, idx) => {
    const col = idx % cols, row = Math.floor(idx / cols);
    const pos = center.clone()
      .addScaledVector(u, (col - (cols - 1) / 2) * GS)
      .addScaledVector(v, (row - (rows - 1) / 2) * GS);
    return { pos, normal: n, item: it };
  });
  const titlePos = center.clone().addScaledVector(n, 1.15);
  return { cubes, titlePos };
}

function Cube({ pos, normal, item, on, setOn, getUrl }) {
  const ref = useRef();
  const lift = useRef(0);
  const labelPos = useMemo(() => { const p = pos.clone().addScaledVector(normal, 0.8); return [p.x, p.y, p.z]; }, [pos, normal]);
  useFrame(() => {
    if (!ref.current) return;
    lift.current = THREE.MathUtils.lerp(lift.current, on ? LIFT : 0, 0.18);
    ref.current.position.copy(pos).addScaledVector(normal, lift.current);
    const s = THREE.MathUtils.lerp(ref.current.scale.x, on ? 1.14 : 1, 0.2);
    ref.current.scale.setScalar(s);
  });
  return (
    <group>
      <RoundedBox ref={ref} args={[CS, CS, CS]} radius={0.14} smoothness={5}
        onPointerOver={(e) => { e.stopPropagation(); setOn(true); }}
        onPointerOut={() => setOn(false)}
        onClick={(e) => { e.stopPropagation(); navTo(item, getUrl); }}>
        <meshPhysicalMaterial color={item.color} emissive={item.color} emissiveIntensity={on ? 0.5 : 0.14}
          metalness={0.18} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.7} />
      </RoundedBox>
      <Html center position={labelPos} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ whiteSpace: "nowrap", color: "#F7F8F8",
          background: on ? "rgba(10,18,74,.96)" : "rgba(10,18,74,.6)",
          border: "1px solid " + (on ? item.color : "rgba(133,200,255,.35)"),
          borderRadius: "999px", padding: on ? "4px 12px" : "3px 9px",
          fontSize: on ? "12.5px" : "10.5px", fontWeight: 700, fontFamily: "Lato, sans-serif",
          boxShadow: on ? "0 6px 24px rgba(0,0,0,.4)" : "none", transition: "all .15s" }}>
          {item.label}
        </div>
      </Html>
    </group>
  );
}

function SectionTitle({ pos, num, title }) {
  return (
    <Html center position={[pos.x, pos.y, pos.z]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ textAlign: "center", fontFamily: "var(--font-grotesk), sans-serif", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(133,200,255,.6)" }}>{num}</span>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#F7F8F8", textShadow: "0 4px 18px rgba(7,14,70,.7)" }}>{title}</div>
      </div>
    </Html>
  );
}

function CubeOfSections({ faces, active, setActive, getUrl }) {
  const grp = useRef();
  const layouts = useMemo(() => faces.map(layoutFace), [faces]);
  useFrame(() => {
    if (!grp.current) return;
    grp.current.rotation.y = THREE.MathUtils.lerp(grp.current.rotation.y, pointer.x * 0.14, 0.05);
    grp.current.rotation.x = THREE.MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.08, 0.05);
  });
  return (
    <group ref={grp}>
      {layouts.map((lay, fi) => (
        <group key={faces[fi].num}>
          <SectionTitle pos={lay.titlePos} num={faces[fi].num} title={faces[fi].title} />
          {lay.cubes.map((c, ii) => {
            const key = fi + "." + ii;
            return <Cube key={key} pos={c.pos} normal={c.normal} item={c.item} getUrl={getUrl}
              on={active === key} setOn={(val) => setActive(val ? key : null)} />;
          })}
        </group>
      ))}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl } = useLinks();
  const { isCoordinador } = useAuth();
  const [active, setActive] = useState(null);
  // Coordinación arriba del todo, separado, solo para coordinadores.
  const faces = useMemo(() => {
    if (!isCoordinador) return FACES;
    return [...FACES, { ...COORD_FACE, dist: 3.5 }];
  }, [isCoordinador]);

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas orthographic camera={{ position: [7, 7, 7], zoom: 66, near: -50, far: 100 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 9, 6]} intensity={2.8} color="#F7F8F8" />
          <pointLight position={[-7, -2, 5]} intensity={2.4} color="#1D7CF4" />
          <pointLight position={[5, 4, -5]} intensity={1.8} color="#85C8FF" />
          <Suspense fallback={null}>
            <CubeOfSections faces={faces} active={active} setActive={setActive} getUrl={getUrl} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada cara es una sección · pulsa un cubo para abrir
        </div>
      </div>

      {/* Leyenda agrupada por sección (separación tipo index.html) */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 lg:block">
        {faces.map((face, fi) => (
          <div key={face.num} className="mb-4">
            <p className="mb-2 font-grotesk text-xs uppercase tracking-[0.25em] text-serene/70">
              <span className="text-serene/40">{face.num}</span> · {face.title}
            </p>
            <ul className="space-y-1">
              {face.items.map((it, ii) => {
                const key = fi + "." + ii;
                return (
                  <li key={it.label} data-hover
                    onMouseEnter={() => setActive(key)} onMouseLeave={() => setActive(null)}
                    onClick={() => navTo(it, getUrl)}
                    className={"flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors " + (active === key ? "bg-white/10" : "hover:bg-white/5")}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: it.color }} />
                    <span className="truncate text-sand/85">{it.label}</span>
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
