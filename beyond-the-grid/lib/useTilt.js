import { useEffect, useRef } from "react";

/**
 * Tilt 3D + spotlight dirigidos por el puntero. Escribe variables CSS en el
 * elemento (--rx/--ry para el tilt, --mx/--my para el spotlight). Aplica la
 * clase .rdr-tilt para el tilt y .rdr-spot (hijo) para el foco.
 * Pasa disabled=true (p.ej. prefers-reduced-motion) para desactivarlo.
 */
export function useTilt(disabled) {
  const ref = useRef(null);
  const raf = useRef(0);
  const onPointerMove = (e) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", ((px - 0.5) * 8).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
      el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    });
  };
  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { ref, onPointerMove, onPointerLeave };
}
