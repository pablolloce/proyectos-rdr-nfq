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
    // parallax con el ratón (suave)
    p.x += uMouse.x * 0.45;
    p.y += uMouse.y * 0.28;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (9.0 + 28.0 * aRand + focus * 40.0) * uPixelRatio / max(-mv.z, 0.1);
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

function Cloud({ estados, reduce }) {
  const pts = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef(0); // nivel continuo objetivo (medido de las secciones [data-level])
  const cur = useRef(0); // nivel continuo amortiguado -> descenso suave

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Nivel continuo bajo una línea de referencia: qué sección cruza ~42% del alto.
  // Estable (las posiciones de sección son layout) y sincronizado con el scroll.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const secs = document.querySelectorAll("[data-level]");
      if (!secs.length) return;
      const refY = window.innerHeight * 0.42;
      const arr = [];
      secs.forEach((s) => { const r = s.getBoundingClientRect(); arr.push([Number(s.dataset.level), r.top + r.height / 2]); });
      arr.sort((a, b) => a[0] - b[0]);
      let lv = arr[arr.length - 1][0];
      if (refY <= arr[0][1]) lv = arr[0][0];
      else {
        for (let i = 0; i < arr.length - 1; i++) {
          if (refY >= arr[i][1] && refY <= arr[i + 1][1]) {
            const t = (refY - arr[i][1]) / ((arr[i + 1][1] - arr[i][1]) || 1);
            lv = arr[i][0] + t * (arr[i + 1][0] - arr[i][0]);
            break;
          }
        }
      }
      target.current = lv;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
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
          uPixelRatio: { value: Math.min(1.75, typeof window !== "undefined" ? window.devicePixelRatio : 1) },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05); // clamp: evita saltos tras lag o cambio de pestaña
    const ease = (r) => 1 - Math.pow(1 - r, dt * 60); // amortiguación independiente de FPS
    const u = material.uniforms;
    if (!reduce) u.uTime.value += dt;
    // Nivel continuo amortiguado -> la estructura BAJA EN ESPIRAL al scrollear:
    // se traslada para centrar el nivel actual (desciende) y gira (espiral).
    cur.current += (target.current - cur.current) * ease(0.09);
    const focusY = levelCenterY(cur.current);
    u.uFocusY.value = focusY; // la banda del nivel centrado brilla
    u.uFocusStr.value += (0.95 - u.uFocusStr.value) * ease(0.05);
    u.uMouse.value.x += ((reduce ? 0 : mouse.current.x) - u.uMouse.value.x) * ease(0.045);
    u.uMouse.value.y += ((reduce ? 0 : mouse.current.y) - u.uMouse.value.y) * ease(0.045);
    const o = pts.current;
    if (o) {
      o.position.y = -focusY; // centra el nivel actual -> al bajar el scroll, baja
      const targetRot = reduce ? 0 : cur.current * 0.7; // gira al descender = espiral
      o.rotation.y += (targetRot - o.rotation.y) * ease(0.08);
    }
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
      <Canvas frameloop={frameloop} dpr={[1, 1.75]} camera={{ position: [0, 0, 9], fov: 55 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#070E46"]} />
        <Cloud estados={estados} reduce={reduce} />
      </Canvas>
    </div>
  );
}
