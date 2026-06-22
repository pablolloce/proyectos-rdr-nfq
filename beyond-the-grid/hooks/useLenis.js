"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Inicializa el smooth-scrolling con Lenis y lo sincroniza con GSAP.
 *
 * La clave de la integración:
 *   - Lenis controla el desplazamiento real de la página (con inercia).
 *   - En cada scroll avisamos a ScrollTrigger para que recalcule (ScrollTrigger.update).
 *   - Usamos el ticker de GSAP como reloj de Lenis (un único requestAnimationFrame
 *     para toda la app -> sin saltos entre librerías).
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000); // GSAP usa segundos; Lenis, ms
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}
