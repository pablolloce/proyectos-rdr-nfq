"use client";

import { useEffect, useState } from "react";

/**
 * Detecta equipos de poca capacidad para degradar los efectos caros del index
 * (glass `backdrop-filter`, blobs animados, tilt 3D y spotlight). Cuando aplica,
 * añade la clase `rdr-lite` a <html> y globals.css activa el modo ligero.
 *
 * Estrategia: heurística barata e inmediata + una sonda de FPS corta (la mejor
 * señal de GPU real, que no se puede leer directamente). Solo DEGRADA, nunca
 * "sube" de nuevo, para no provocar parpadeos.
 */
function heuristicaBaja() {
  if (typeof window === "undefined") return false;
  const mm = (q) => typeof window.matchMedia === "function" && window.matchMedia(q).matches;
  if (mm("(prefers-reduced-motion: reduce)")) return true; // accesibilidad / equipos lentos
  if (mm("(update: slow)")) return true;                    // pantallas/equipos de refresco lento
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 4) return true;
  const mem = navigator.deviceMemory; // solo Chromium; GB de RAM aproximados
  if (typeof mem === "number" && mem > 0 && mem <= 4) return true;
  return false;
}

export function useLowPower() {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const activar = () => {
      if (cancelled) return;
      setLite(true);
      document.documentElement.classList.add("rdr-lite");
    };

    // 1) Señales inmediatas (sin coste).
    if (heuristicaBaja()) { activar(); return; }

    // 2) Sonda de FPS (~0.6 s): si el index no alcanza ~40 fps con los efectos
    //    activos, el equipo no da para el glass animado -> modo ligero.
    let frames = 0;
    let t0 = 0;
    let raf = requestAnimationFrame(function tick(t) {
      if (cancelled) return;
      if (!t0) t0 = t;
      frames += 1;
      const dt = t - t0;
      if (dt >= 600) {
        if ((frames * 1000) / dt < 40) activar();
        return;
      }
      raf = requestAnimationFrame(tick);
    });

    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, []);

  return lite;
}
