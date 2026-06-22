"use client";

/**
 * Secciones de contenido tras el Hero. Los elementos con [data-reveal] se
 * descubren palabra por palabra (staggered reveal) gestionado por
 * useGsapAnimations. Los elementos interactivos llevan [data-hover] para
 * activar el cursor personalizado.
 */
export default function ContentSection() {
  return (
    <div className="relative">
      {/* Bloque 1 ------------------------------------------------------- */}
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-32">
        <span className="font-display text-xs uppercase tracking-[0.35em] text-accent">
          01 — Manifiesto
        </span>

        <h2
          data-reveal
          className="font-display text-4xl font-bold leading-[1.05] text-white md:text-7xl"
        >
          No es una página. Es un espacio por el que te mueves.
        </h2>

        <p
          data-reveal
          className="max-w-2xl font-sans text-lg leading-relaxed text-white/60 md:text-xl"
        >
          Cada gesto tiene respuesta: el objeto reacciona a tu ratón, muta con tu
          scroll y la tipografía respira a tu ritmo. El resultado es una
          experiencia continua, no un documento que se recorre.
        </p>
      </section>

      {/* Bloque 2 ------------------------------------------------------- */}
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-32">
        <span className="font-display text-xs uppercase tracking-[0.35em] text-accent2">
          02 — Materia
        </span>

        <h2
          data-reveal
          className="font-display text-4xl font-bold leading-[1.05] text-white md:text-7xl"
        >
          Luz, ruido y movimiento renderizados en tiempo real.
        </h2>

        <p
          data-reveal
          className="max-w-2xl font-sans text-lg leading-relaxed text-white/60 md:text-xl"
        >
          Three.js dibuja la materia; GSAP dirige el tiempo. Tú solo desplazas.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="#"
            data-hover
            className="rounded-full bg-white px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-accent hover:text-white"
          >
            Empezar
          </a>
          <a
            href="#"
            data-hover
            className="rounded-full border border-white/20 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-white"
          >
            Saber más
          </a>
        </div>
      </section>
    </div>
  );
}
