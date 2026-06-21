"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { pointer } from "@/lib/pointerStore";
import { HUB_LINKS } from "@/lib/hubLinks";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const R = 2.25;       // distancia de las caras al centro
const PENT_R = 0.98;  // radio del pentágono (tiles casi tocándose -> sólido)
const SEP = 0.55;     // cuánto se separa una cara al hover

// 12 direcciones = vértices del icosaedro = normales de las caras del dodecaedro.
function icoDirs() {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],
             [0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
  return v.map((a) => { const n = Math.hypot(a[0],a[1],a[2]); return [a[0]/n, a[1]/n, a[2]/n]; });
}

function navTo(link) {
  const u = link.url;
  if (!u || u === "#") return;
  if (link.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
  else window.location.href = u;
}

// Un FRAGMENTO = una cara (pentágono). Se separa del conjunto cuando está activo.
function Fragment({ dir, link, on, setOn }) {
  const g = useRef();
  const base = useMemo(() => new Vector3(dir[0], dir[1], dir[2]), [dir]);
  useLayoutEffect(() => {
    if (!g.current) return;
    g.current.position.copy(base).multiplyScalar(R);
    g.current.lookAt(0, 0, 0);
  }, [base]);
  useFrame(() => {
    if (!g.current) return;
    const want = R + (on ? SEP : 0);
    const cur = g.current.position.length() || R;
    g.current.position.copy(base).multiplyScalar(MathUtils.lerp(cur, want, 0.18));
  });
  return (
    <group ref={g}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setOn(true); }}
        onPointerOut={() => setOn(false)}
        onClick={(e) => { e.stopPropagation(); navTo(link); }}
        scale={on ? 1.05 : 1}
      >
        <circleGeometry args={[PENT_R, 5]} />
        <meshStandardMaterial
          color={link.color} emissive={link.color}
          emissiveIntensity={on ? 0.9 : 0.28} metalness={0.25} roughness={0.4}
          transparent opacity={on ? 0.98 : 0.85} side={2}
        />
      </mesh>
      {on && (
        <Html center distanceFactor={8} position={[0, 0, -0.3]} style={{ pointerEvents: "none" }}>
          <div style={{ whiteSpace: "nowrap", background: "rgba(10,18,74,.92)", color: "#F7F8F8",
            border: "1px solid " + link.color, borderRadius: "999px", padding: "5px 14px",
            fontSize: "13px", fontWeight: 700, fontFamily: "Lato, sans-serif" }}>{link.name}</div>
        </Html>
      )}
    </group>
  );
}

function Dodeca({ links, active, setActive }) {
  const grp = useRef();
  const dirs = useMemo(() => icoDirs(), []);
  useFrame((_, dt) => {
    if (!grp.current) return;
    grp.current.rotation.y += dt * 0.1;
    grp.current.rotation.x = MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.25, 0.04);
  });
  return (
    <group ref={grp}>
      {/* Núcleo sólido: rellena los huecos entre fragmentos -> objeto macizo */}
      <mesh>
        <icosahedronGeometry args={[R - 0.35, 1]} />
        <meshStandardMaterial color="#0b1450" metalness={0.3} roughness={0.5} flatShading />
      </mesh>
      {links.map((l, i) => (
        <Fragment key={l.name} dir={dirs[i % dirs.length]} link={l}
          on={active === i} setOn={(v) => setActive(v ? i : -1)} />
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
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <color attach="background" args={["#070E46"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 5, 6]} intensity={1.7} color="#F7F8F8" />
          <pointLight position={[-6, -4, -4]} intensity={2.4} color="#1D7CF4" />
          <pointLight position={[5, 2, 3]} intensity={1} color="#85C8FF" />
          <Suspense fallback={null}>
            <Dodeca links={links} active={active} setActive={setActive} />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
          Pasa el ratón sobre un fragmento · pulsa para abrir
        </div>
      </div>

      {/* Leyenda: todos los links accesibles desde el primer momento */}
      <aside className="hidden w-64 shrink-0 overflow-auto border-l border-serene/10 p-4 md:block">
        <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-serene/70">Explora</p>
        <ul className="space-y-1">
          {links.map((l, i) => (
            <li key={l.name}
              data-hover
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(-1)}
              onClick={() => navTo(l)}
              className={"flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors " + (active === i ? "bg-white/10" : "hover:bg-white/5")}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="truncate text-sand/85">{l.name}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
