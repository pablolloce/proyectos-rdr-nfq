"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/pointerStore";
import { HUB_LINKS } from "@/lib/hubLinks";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const R = 1.75;        // radio de la esfera
const COLS = 4, ROWS = 3; // 4×3 = 12 fragmentos (= 12 links)
const SEP = 0.45;      // separación del fragmento al hover

function navTo(link) {
  const u = link.url;
  if (!u || u === "#") return;
  if (link.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else window.location.href = u;
}

// Un FRAGMENTO = una porción real de la esfera (slice phi/theta) = un link.
// Material físico premium (clearcoat + reflejos del Environment). Se separa al hover.
function Shard({ idx, link, on, setOn }) {
  const ref = useRef();
  const { geom, dir, labelPos } = useMemo(() => {
    const c = idx % COLS, r = Math.floor(idx / COLS);
    const phiLen = (Math.PI * 2) / COLS, thetaLen = Math.PI / ROWS;
    const g = new THREE.SphereGeometry(R, 28, 20, c * phiLen, phiLen, r * thetaLen, thetaLen);
    const pos = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.x += pos.getX(i); v.y += pos.getY(i); v.z += pos.getZ(i); }
    v.multiplyScalar(1 / pos.count).normalize();
    const lp = v.clone().multiplyScalar(R + 0.95);
    return { geom: g, dir: v, labelPos: [lp.x, lp.y, lp.z] };
  }, [idx]);

  useFrame(() => {
    if (!ref.current) return;
    const want = on ? SEP : 0;
    const nl = THREE.MathUtils.lerp(ref.current.position.length(), want, 0.18);
    ref.current.position.copy(dir).multiplyScalar(nl);
  });

  return (
    <group>
      <mesh ref={ref} geometry={geom}
        onPointerOver={(e) => { e.stopPropagation(); setOn(true); }}
        onPointerOut={() => setOn(false)}
        onClick={(e) => { e.stopPropagation(); navTo(link); }}>
        <meshPhysicalMaterial
          color={link.color} emissive={link.color} emissiveIntensity={on ? 0.55 : 0.05}
          metalness={0.35} roughness={0.12} clearcoat={1} clearcoatRoughness={0.15}
          envMapIntensity={1.4} side={THREE.DoubleSide} />
      </mesh>
      {on && (
        <Html center position={labelPos} distanceFactor={7} style={{ pointerEvents: "none" }}>
          <div style={{ whiteSpace: "nowrap", background: "rgba(10,18,74,.92)", color: "#F7F8F8",
            border: "1px solid " + link.color, borderRadius: "999px", padding: "5px 14px",
            fontSize: "13px", fontWeight: 700, fontFamily: "Lato, sans-serif" }}>{link.name}</div>
        </Html>
      )}
    </group>
  );
}

function ShardSphere({ links, active, setActive }) {
  const grp = useRef();
  useFrame((_, dt) => {
    if (!grp.current) return;
    grp.current.rotation.y += dt * 0.08;
    grp.current.rotation.x = THREE.MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.25, 0.04);
  });
  return (
    <group ref={grp}>
      {links.map((l, i) => (
        <Shard key={l.name} idx={i} link={l} on={active === i} setOn={(v) => setActive(v ? i : -1)} />
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
    .map((l) => ({ ...l, url: l.href || getUrl(l.key) || "#" }));

  return (
    <div className="absolute inset-0 flex">
      <div className="relative flex-1">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 5, 6]} intensity={2.2} color="#F7F8F8" />
          <pointLight position={[-6, -3, -4]} intensity={2} color="#1D7CF4" />
          <Suspense fallback={null}>
            <ShardSphere links={links} active={active} setActive={setActive} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        {/* Título overlay (no captura clics, pasan a la esfera) */}
        <div className="pointer-events-none absolute inset-x-0 top-8 px-6 text-center">
          <h1 className="font-grotesk font-bold leading-none tracking-tighter text-sand/95"
            style={{ fontSize: "clamp(2rem, 7vw, 6rem)", textShadow: "0 8px 60px rgba(7,14,70,.6)" }}>
            BEYOND THE GRID
          </h1>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Pasa el ratón sobre un fragmento · pulsa para abrir
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
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="truncate text-sand/85">{l.name}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
