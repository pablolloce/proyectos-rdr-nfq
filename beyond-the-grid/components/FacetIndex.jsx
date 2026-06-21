"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Icosahedron } from "@react-three/drei";
import { MathUtils } from "three";
import { pointer } from "@/lib/pointerStore";
import { HUB_LINKS } from "@/lib/hubLinks";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const RADIUS = 2.4;

// Distribución uniforme de N puntos sobre una esfera (Fibonacci).
function fibSphere(n, r) {
  const pts = [], phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r]);
  }
  return pts;
}

// Una CARA = un link. Hexágono tangente a la esfera, clicable, etiqueta al hover.
function Facet({ p, link }) {
  const g = useRef();
  const [hov, setHov] = useState(false);
  useLayoutEffect(() => { if (g.current) g.current.lookAt(0, 0, 0); }, []);
  const go = () => {
    const u = link.url;
    if (!u || u === "#") return;
    if (link.key || /^https?:/i.test(u)) window.open(u, "_blank", "noopener");
    else window.location.href = u;
  };
  return (
    <group ref={g} position={p}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHov(true); }}
        onPointerOut={() => setHov(false)}
        onClick={(e) => { e.stopPropagation(); go(); }}
        scale={hov ? 1.22 : 1}
      >
        <circleGeometry args={[0.66, 6]} />
        <meshStandardMaterial
          color={link.color} emissive={link.color}
          emissiveIntensity={hov ? 0.95 : 0.3} metalness={0.2} roughness={0.35}
          transparent opacity={hov ? 0.95 : 0.72} side={2}
        />
      </mesh>
      {hov && (
        <Html center distanceFactor={9} position={[0, 0, -0.25]} style={{ pointerEvents: "none" }}>
          <div style={{ whiteSpace: "nowrap", background: "rgba(10,18,74,.9)", color: "#F7F8F8",
            border: "1px solid " + link.color, borderRadius: "999px", padding: "5px 14px",
            fontSize: "13px", fontWeight: 700, fontFamily: "Lato, sans-serif" }}>
            {link.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// El objeto: retícula icosaédrica + las caras (links). Gira y hace parallax.
function FacetObject({ links }) {
  const grp = useRef();
  const pts = useMemo(() => fibSphere(links.length, RADIUS), [links.length]);
  useFrame((_, dt) => {
    if (!grp.current) return;
    grp.current.rotation.y += dt * 0.12;
    grp.current.rotation.x = MathUtils.lerp(grp.current.rotation.x, pointer.y * 0.3, 0.04);
  });
  return (
    <group ref={grp}>
      <Icosahedron args={[RADIUS, 1]}>
        <meshBasicMaterial color="#1D7CF4" wireframe transparent opacity={0.12} />
      </Icosahedron>
      {links.map((l, i) => <Facet key={l.name} p={pts[i]} link={l} />)}
    </group>
  );
}

export default function FacetIndex() {
  const { getUrl } = useLinks();
  const { isCoordinador } = useAuth();
  const links = HUB_LINKS
    .filter((l) => !l.coord || isCoordinador)
    .map((l) => ({ ...l, url: l.href || getUrl(l.key) || "#" }));

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#070E46"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 4, 5]} intensity={1.6} color="#F7F8F8" />
        <pointLight position={[-5, -3, -4]} intensity={2.2} color="#1D7CF4" />
        <Suspense fallback={null}>
          <FacetObject links={links} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs uppercase tracking-[0.3em] text-serene/55">
        Gira el objeto · pulsa una cara para abrir
      </div>
    </div>
  );
}
