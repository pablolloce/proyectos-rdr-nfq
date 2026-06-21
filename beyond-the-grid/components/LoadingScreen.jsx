"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Pantalla de carga brutalista:
 *   - Contador 0 -> 100 (monoespaciado, enorme) y barra de progreso.
 *   - Al terminar, una timeline de GSAP la retira con una animación compleja
 *     (la barra completa, las etiquetas se van hacia arriba y el panel sube
 *     con un ease "expo" revelando el contenido).
 *   - Llama a onComplete() para que la experiencia arranque sus animaciones.
 */
export default function LoadingScreen({ onComplete }) {
  const root = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onComplete,
      });

      // 1) Contador animado 0 -> 100 (sincronizado con la barra vía scaleX).
      tl.to(counter, {
        v: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      });
      tl.to(".loader__bar", { scaleX: 1, duration: 2, ease: "power2.inOut" }, 0);

      // 2) Salida: etiquetas hacia arriba (stagger) + panel deslizándose.
      tl.to(".loader__line", {
        yPercent: -120,
        duration: 0.6,
        stagger: 0.08,
      });
      tl.to(root.current, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.2");
      tl.set(root.current, { display: "none" }); // fuera del flujo al acabar
    }, root);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-black p-6 md:p-10"
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between overflow-hidden">
        <span className="loader__line font-display text-sm uppercase tracking-[0.3em] text-white/70">
          Beyond the Grid
        </span>
        <span className="loader__line font-display text-sm uppercase tracking-[0.3em] text-white/70">
          Loading
        </span>
      </div>

      {/* Contador gigante */}
      <div className="overflow-hidden">
        <h1 className="loader__line font-display text-[22vw] font-bold leading-none text-white md:text-[16vw]">
          {String(count).padStart(3, "0")}
        </h1>
      </div>

      {/* Barra de progreso (scaleX de 0 a 1 desde la izquierda) */}
      <div className="overflow-hidden">
        <div className="loader__line">
          <div className="h-px w-full origin-left scale-x-0 bg-white loader__bar" />
        </div>
      </div>
    </div>
  );
}
