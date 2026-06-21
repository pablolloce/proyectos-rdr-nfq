"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Splash de marca BBVA. Ligero y se ejecuta UNA sola vez:
 *   - estado interno `visible`; a los ~900ms se oculta con un fundido.
 *   - sin props onComplete (evita el bug de re-ejecución por cambio de
 *     identidad del callback que hacía aparecer el loader dos veces).
 *   - fondo Electric Blue (#001391), nunca negro.
 */
export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-electric"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-sans text-xs uppercase tracking-[0.4em] text-serene"
          >
            BBVA × NFQ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-3 font-display text-4xl font-bold text-sand md:text-6xl"
          >
            RDR Knowledge
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="mt-8 h-px w-40 origin-left bg-serene/60"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
