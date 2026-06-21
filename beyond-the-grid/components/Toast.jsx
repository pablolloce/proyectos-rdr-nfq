"use client";

import { AnimatePresence, motion } from "framer-motion";

/** Aviso flotante (reemplaza el #toast del index.html original). */
export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="pointer-events-none fixed bottom-8 left-1/2 z-[9998] -translate-x-1/2 rounded-full bg-white px-6 py-3 font-display text-sm font-bold text-black shadow-xl"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
