"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollStore } from "@/lib/scrollStore";

/**
 * Divide el texto de un elemento en palabras "enmascaradas" para el reveal.
 * Cada palabra queda dentro de un <span overflow:hidden> con un <span> interno
 * que es el que animamos (sube desde abajo y se descubre tras la máscara).
 * Devuelve el array de spans internos para que GSAP los anime con stagger.
 *
 * (Hacemos el split a mano porque SplitText de GSAP es un plugin de pago.)
 */
function splitWords(el) {
  const text = el.textContent;
  el.textContent = "";
  const inners = [];

  text.split(/(\s+)/).forEach((token) => {
    if (token.trim() === "") {
      el.appendChild(document.createTextNode(token)); // conserva los espacios
      return;
    }
    const outer = document.createElement("span");
    outer.style.display = "inline-block";
    outer.style.overflow = "hidden";
    outer.style.verticalAlign = "top";

    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.style.willChange = "transform";
    inner.textContent = token;

    outer.appendChild(inner);
    el.appendChild(outer);
    inners.push(inner);
  });

  return inners;
}

/**
 * Coreografía completa basada en scroll. Se monta cuando `enabled` es true
 * (es decir, cuando la pantalla de carga ya ha terminado), así ScrollTrigger
 * mide las posiciones correctas.
 *
 * Todo vive dentro de un gsap.context(scope) -> limpieza automática y selectores
 * acotados al contenedor de la experiencia.
 */
export function useGsapAnimations(scope, enabled) {
  useEffect(() => {
    if (!enabled || !scope.current) return;

    const ctx = gsap.context(() => {
      // 1) PUENTE GSAP -> THREE.
      //    Un ScrollTrigger que recorre toda la página y vuelca su progreso
      //    (0..1) en scrollStore. El objeto 3D lo lee en su useFrame y muta
      //    rotación / escala / color / distorsión en consecuencia.
      ScrollTrigger.create({
        trigger: scope.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          scrollStore.progress = self.progress;
        },
      });

      // 2) HERO. El título gigante se traslada hacia arriba y se difumina
      //    mientras desplazamos fuera el Hero (efecto "se disuelve").
      gsap.to("[data-hero-title]", {
        yPercent: -140,
        opacity: 0,
        filter: "blur(24px)",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-hero]",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3) REVELADO ESCALONADO de texto (palabra por palabra, enmascarado).
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        const words = splitWords(el);
        gsap.from(words, {
          yPercent: 120,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      // 4) TARJETAS del hub: aparecen escalonadas al entrar en viewport.
      //    Las ocultamos primero (gsap.set) y ScrollTrigger.batch las anima en
      //    grupos según van entrando -> el stagger se respeta por fila.
      gsap.set("[data-card]", { opacity: 0, y: 40 });
      ScrollTrigger.batch("[data-card]", {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });

      // Recalcula posiciones tras inyectar los spans del split.
      ScrollTrigger.refresh();
    }, scope);

    return () => ctx.revert(); // revierte tweens, triggers y el DOM del split
  }, [scope, enabled]);
}
