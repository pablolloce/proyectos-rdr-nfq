"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Estructura 3D orgánica y densa con SHADERS (estilo realtime 3D, tipo yinger.dev):
 * ~4800 partículas en una torre helicoidal con ruido que respira y sigue al ratón.
 * Cada banda de altura = un nivel, coloreada por su estado. INTERACTÚA con los
 * niveles: al hacer scroll/hover sobre un nivel, su banda se ilumina e hincha
 * (uniform uFocusY). ShaderMaterial con additive blending -> glow orgánico.
 */
const LV = 7;
const HEIGHT = 12;
const COUNT = 4800;
const TURNS = 3.0;
const BASE_R = 2.7;

const COLS = {
  completado: [0.53, 0.91, 0.51], // lime
  actual: [0.52, 0.78, 1.0], // serene
  proximamente: [0.24, 0.30, 0.55],
  bloqueado: [0.2, 0.26, 0.48],
};
const levelCenterY = (L) => ((L + 0.5) / LV) * HEIGHT - HEIGHT / 2;

const VERT = `
  uniform float uTime, uFocusY, uFocusStr, uPixelRatio;
  uniform vec2 uMouse;
  attribute float aRand;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vGlow;
  void main(){
    vColor = aColor;
    vec3 p = position;
    float t = uTime;
    float ph = aRand * 6.28318;
    // movimiento orgánico (ruido por senos/cosenos)
    p.x += sin(p.y * 1.5 + t * 0.8 + ph) * (0.12 + 0.22 * aRand);
    p.z += cos(p.y * 1.3 + t * 0.7 + ph) * (0.12 + 0.22 * aRand);
    p.y += sin(p.x * 0.8 + t * 0.6 + ph) * 0.12;
    // foco: la banda del nivel activo se hincha y brilla
    float d = abs(p.y - uFocusY);
    float focus = smoothstep(1.9, 0.0, d) * uFocusStr;
    vec3 radial = normalize(vec3(p.x, 0.0, p.z) + 0.0001);
    p += radial * focus * 0.8;
    vGlow = focus;
    // parallax con el ratón
    p.x += uMouse.x * 0.6;
    p.y += uMouse.y * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (9.0 + 30.0 * aRand + focus * 60.0) * uPixelRatio / max(-mv.z, 0.1);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  precision mediump float;
  varying vec3 vColor;
  varying float vGlow;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.04, r);
    vec3 col = vColor + vGlow * 0.9;
    gl_FragColor = vec4(col, a * (0.42 + vGlow * 0.55));
  }
`;

function useScrollRef() {
  const ref = useRef({ p: 0, v: 0 });
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      ref.current.v = p - last;
      ref.current.p = p;
      last = p;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

function Cloud({ estados, activeLevel, reduce }) {
  const pts = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const scroll = useScrollRef();

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const { geometry, levelOf } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const aRand = new Float32Array(COUNT);
    const aColor = new Float32Array(COUNT * 3);
    const levelOf = new Int8Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const tt = Math.random();
      const y = (tt - 0.5) * HEIGHT;
      const ang = tt * TURNS * Math.PI * 2 + Math.random() * 0.9;
      const rad = BASE_R * (1 - 0.18 * tt) * (0.5 + Math.random() * 0.6);
      const j = () => (Math.random() - 0.5) * 0.55;
      positions[i * 3] = Math.cos(ang) * rad + j();
      positions[i * 3 + 1] = y + j() * 0.5;
      positions[i * 3 + 2] = Math.sin(ang) * rad + j();
      aRand[i] = Math.random();
      levelOf[i] = Math.min(LV - 1, Math.max(0, Math.floor(((y + HEIGHT / 2) / HEIGHT) * LV)));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));
    return { geometry: g, levelOf };
  }, []);

  // recolorear por estado de nivel
  useEffect(() => {
    const col = geometry.getAttribute("aColor");
    for (let i = 0; i < COUNT; i++) {
      const c = COLS[estados?.[levelOf[i]]] || COLS.bloqueado;
      col.setXYZ(i, c[0], c[1], c[2]);
    }
    col.needsUpdate = true;
  }, [estados, geometry, levelOf]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uFocusY: { value: 0 },
          uFocusStr: { value: 0.3 },
          uMouse: { value: new THREE.Vector2() },
          uPixelRatio: { value: Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1) },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((s, dt) => {
    const u = material.uniforms;
    if (!reduce) u.uTime.value += dt;
    const targetY = levelCenterY(activeLevel == null ? 0 : activeLevel);
    u.uFocusY.value += (targetY - u.uFocusY.value) * 0.06;
    u.uFocusStr.value += ((activeLevel == null ? 0.35 : 1.0) - u.uFocusStr.value) * 0.05;
    u.uMouse.value.x += ((reduce ? 0 : mouse.current.x) - u.uMouse.value.x) * 0.05;
    u.uMouse.value.y += ((reduce ? 0 : mouse.current.y) - u.uMouse.value.y) * 0.05;
    if (pts.current) pts.current.rotation.y += (reduce ? 0 : dt * 0.05) + scroll.current.v * 4;
  });

  return <points ref={pts} geometry={geometry} material={material} />;
}

export default function EstructuraTower({ estados, activeLevel }) {
  const reduce = useReducedMotion();
  const [frameloop, setFrameloop] = useState("always");
  useEffect(() => {
    const v = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", v);
    return () => document.removeEventListener("visibilitychange", v);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas frameloop={frameloop} dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 55 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#070E46"]} />
        <Cloud estados={estados} activeLevel={activeLevel} reduce={reduce} />
      </Canvas>
    </div>
  );
}
