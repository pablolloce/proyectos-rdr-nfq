"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Cursor personalizado con "retraso/spring" (Framer Motion).
 *
 * - Seguimos la posición del ratón con motion values y les aplicamos un spring
 *   -> el punto persigue al cursor con inercia suave.
 * - Crece y baja su opacidad al pasar sobre cualquier elemento con [data-hover].
 * - mix-blend-difference hace que se invierta sobre fondos claros/oscuros.
 * - Oculto en táctil (hidden md:block) y con pointer-events-none para no estorbar.
 */
export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 450, damping: 32, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 450, damping: 32, mass: 0.6 });

  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      if (e.target.closest("[data-hover]")) setHovering(true);
    };
    const out = (e) => {
      if (e.target.closest("[data-hover]")) setHovering(false);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
    };
  }, [x, y]);

  return (
    // Capa externa: posición (transform x/y del spring).
    <motion.div
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden mix-blend-difference md:block"
    >
      {/* Capa interna: centrado + escala animada al hover. */}
      <motion.div
        animate={{ scale: hovering ? 3 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />
    </motion.div>
  );
}
