"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/pointerStore";
import { HUB_LINKS } from "@/lib/hubLinks";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const SP = 1.04;   // separación entre mini-cubos (deja una rendija)
const CS = 0.94;   // tamaño del mini-cubo
const LIFT = 0.55; // cuánto sale el cubo al hover

// 12 celdas de la cáscara visible (cámara iso en +x,+y,+z) repartidas en las 3 caras.
const LINK_CELLS = [
  [-1, 1, 1], [1, 1, 1], [-1, 1, -1], [0, 1, 0],   // cara superior (y=1)
  [1, 0, 1], [1, -1, 0], [1, 0, -1], [1, -1, -1],  // cara derecha (x=1)
  [-1, 0, 1], [0, -1, 1], [-1, -1, 1], [0, 0, 1],  // cara izquierda (z=1)
];

function navTo(link) {
  const u = link.url;
  if (!u || u === "#") return;
  if (link.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else window.location.href = u;
}

// Un mini-cubo. Si tiene link es interactivo (sale al hover, etiqueta, navega).
function MiniCube({ cell, link, on, setOn }) {
  const ref = useRef();
  const cur = useRef(0);
  const base = useMemo(() => new THREE.Vector3(cell[0], cell[1], cell[2]).multiplyScalar(SP), [cell]);
  const dir = useMemo(() => base.clone().normalize(), [base]);
  useFrame(() => {
    if (!ref.current) return;
    cur.current = THREE.MathUtils.lerp(cur.current, on ? LIFT : 0, 0.2);
    ref.current.position.copy(base).addScaledVector(dir, cur.current);
  });
  const isLink = !!link;
  return (
    <group>
      <mesh ref={ref}
        onPointerOver={isLink ? (e) => { e.stopPropagation(); setOn(true); } : undefined}
        onPointerOut={isLink ? () => setOn(false) : undefined}
        onClick={isLink ? (e) => { e.stopPropagation(); navTo(link); } : undefined}>
        <boxGeometry args={[CS, CS, CS]} />
        <meshPhysicalMaterial
          color={isLink ? link.color : "#0c1657"}
          emissive={isLink ? link.color : "#000000"}
          emissiveIntensity={on ? 0.7 : isLink ? 0.14 : 0}
          metalness={0.32} roughness={isLink ? 0.16 : 0.5}
          clearcoat={1} clearcoatRoughness={0.2} envMapIntensity={1.3} />
      </mesh>
      {isLink && on && (
        <Html center position={[base.x + dir.x * 1.1, base.y + dir.y * 1.1, base.z + dir.z * 1.1]} style={{ pointerEvents: "none" }}>
          <div style={{ whiteSpace: "nowrap", background: "rgba(10,18,74,.92)", color: "#F7F8F8",
            border: "1px solid " + link.color, borderRadius: "999px", padding: "5px 14px",
            fontSize: "13px", fontWeight: 700, fontFamily: "Lato, sans-serif" }}>{link.name}</div>
        </Html>
      )}
    </group>
  );
}

function CubeOfCubes({ links, active, setActive }) {
  const grp = useRef();
  const used = useMemo(() => new Set(LINK_CELLS.slice(0, links.length).map((c) => c.join(","))), [links.length]);
  // Resto de la cáscara visible: cubos neutros (para que se lea como un cubo macizo).
  const neutral = useMemo(() => {
    const out = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++)
      if ((i === 1 || j === 1 || k === 1) && !used.has([i, j, k].join(","))) out.push([i, j, k]);
    return out;
  }, [used]);
  useFrame(() => {
    if (!grp.current) return;
    // Parallax leve: el cubo bascula con el ratón pero sin ocultar caras.
    grp.current.rotation.y = THREE.MathUtils.lerp(grp.current.rotation.y, pointer.x * 0.18, 0.05);
    grp.current.rotation.x = THREE.MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.12, 0.05);
  });
  return (
    <group ref={grp}>
      {neutral.map((c) => <MiniCube key={"n" + c.join(",")} cell={c} link={null} />)}
      {links.map((l, i) => (
        <MiniCube key={l.name} cell={LINK_CELLS[i]} link={l} on={active === i} setOn={(v) => setActive(v ? i : -1)} />
      ))}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl } = useLinks();
  const { isCoordinador } = useAuth();
  const [active, setActive] = useState(-1);
  const links = HUB_LINKS
    .filter((l) => !l.coord || isCoordinador)
    .slice(0, LINK_CELLS.length)
    .map((l) => ({ ...l, url: l.href || getUrl(l.key) || "#" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas orthographic camera={{ position: [7, 7, 7], zoom: 88, near: -50, far: 100 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 8, 5]} intensity={2.2} color="#F7F8F8" />
          <pointLight position={[-6, -2, 4]} intensity={1.8} color="#1D7CF4" />
          <Suspense fallback={null}>
            <CubeOfCubes links={links} active={active} setActive={setActive} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Cada cubo de color es un link · pulsa para abrir
        </div>
      </div>

      {/* Leyenda: todos los links accesibles desde el primer momento */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        <p className="mb-3 font-grotesk text-xs uppercase tracking-[0.3em] text-serene/70">Explora</p>
        <ul className="space-y-1">
          {links.map((l, i) => (
            <li key={l.name} data-hover
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(-1)}
              onClick={() => navTo(l)}
              className={"flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors " + (active === i ? "bg-white/10" : "hover:bg-white/5")}>
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="truncate text-sand/85">{l.name}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
