"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/pointerStore";
import { HUB_LINKS } from "@/lib/hubLinks";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const SP = 1.38;   // separación entre cubos (flotan con aire entre ellos)
const CS = 0.92;   // tamaño del cubo
const LIFT = 0.5;  // cuánto sale el cubo al hover

// 12 celdas repartidas en las 3 caras visibles de un cubo 3×3×3 (cámara iso +x+y+z).
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

// Cubo-cristal redondeado (bubbly) translúcido = un link. Etiqueta SIEMPRE visible.
function Crystal({ cell, link, on, setOn }) {
  const ref = useRef();
  const lift = useRef(0);
  const base = useMemo(() => new THREE.Vector3(cell[0], cell[1], cell[2]).multiplyScalar(SP), [cell]);
  const dir = useMemo(() => base.clone().normalize(), [base]);
  const labelPos = useMemo(() => { const p = base.clone().addScaledVector(dir, 1.0); return [p.x, p.y, p.z]; }, [base, dir]);
  useFrame(() => {
    if (!ref.current) return;
    lift.current = THREE.MathUtils.lerp(lift.current, on ? LIFT : 0, 0.18);
    ref.current.position.copy(base).addScaledVector(dir, lift.current);
    const s = THREE.MathUtils.lerp(ref.current.scale.x, on ? 1.16 : 1, 0.2);
    ref.current.scale.setScalar(s);
  });
  return (
    <group>
      <RoundedBox ref={ref} args={[CS, CS, CS]} radius={0.18} smoothness={5}
        onPointerOver={(e) => { e.stopPropagation(); setOn(true); }}
        onPointerOut={() => setOn(false)}
        onClick={(e) => { e.stopPropagation(); navTo(link); }}>
        <meshPhysicalMaterial
          color={link.color} emissive={link.color} emissiveIntensity={on ? 0.55 : 0.18}
          transparent opacity={on ? 0.92 : 0.62} roughness={0.05} metalness={0}
          clearcoat={1} clearcoatRoughness={0.08} ior={1.45} envMapIntensity={2.1}
          transmission={0.35} thickness={0.6} />
      </RoundedBox>
      <Html center position={labelPos} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ whiteSpace: "nowrap", color: "#F7F8F8",
          background: on ? "rgba(10,18,74,.96)" : "rgba(10,18,74,.55)",
          border: "1px solid " + (on ? link.color : "rgba(133,200,255,.35)"),
          borderRadius: "999px", padding: on ? "5px 13px" : "3px 10px",
          fontSize: on ? "13px" : "11px", fontWeight: 700, fontFamily: "Lato, sans-serif",
          boxShadow: on ? "0 6px 24px rgba(0,0,0,.4)" : "none", transition: "all .15s" }}>
          {link.name}
        </div>
      </Html>
    </group>
  );
}

function CubeOfCubes({ links, active, setActive }) {
  const grp = useRef();
  useFrame(() => {
    if (!grp.current) return;
    grp.current.rotation.y = THREE.MathUtils.lerp(grp.current.rotation.y, pointer.x * 0.16, 0.05);
    grp.current.rotation.x = THREE.MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.1, 0.05);
  });
  return (
    <group ref={grp}>
      {links.map((l, i) => (
        <Crystal key={l.name} cell={LINK_CELLS[i]} link={l} on={active === i} setOn={(v) => setActive(v ? i : -1)} />
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
        <Canvas orthographic camera={{ position: [7, 7, 7], zoom: 64, near: -50, far: 100 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 9, 6]} intensity={2.8} color="#F7F8F8" />
          <pointLight position={[-7, -2, 5]} intensity={2.4} color="#1D7CF4" />
          <pointLight position={[5, 4, -5]} intensity={1.8} color="#85C8FF" />
          <Suspense fallback={null}>
            <CubeOfCubes links={links} active={active} setActive={setActive} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Pulsa un cubo para abrir su enlace
        </div>
      </div>

      {/* Leyenda lateral (acceso rápido + sincronizada con el cubo) */}
      <aside className="hidden w-60 shrink-0 overflow-auto border-l border-serene/10 p-4 lg:block">
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
