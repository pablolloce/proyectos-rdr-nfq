/**
 * Estado mutable compartido FUERA de React.
 *
 * Es el "puente" entre dos mundos que corren a ritmos distintos:
 *   - GSAP / ScrollTrigger  ->  ESCRIBE aquí el progreso de scroll y el ratón.
 *   - Three.js (useFrame)   ->  LEE estos valores en cada frame.
 *
 * Al ser un objeto plano (no estado de React) podemos mutarlo 60 veces por
 * segundo sin disparar re-renders del árbol de componentes. Esto es lo que
 * mantiene la animación 3D fluida.
 */
export const scrollStore = {
  progress: 0, // 0 (arriba del todo) .. 1 (final de la página)
  mouseX: 0, // -1 (izq) .. 1 (der)
  mouseY: 0, // -1 (arriba) .. 1 (abajo)
};
