"use client";

/**
 * Overlay del Hero (HTML por encima del Canvas 3D). Ocupa 100vh.
 * El título se anima con GSAP (ver useGsapAnimations) vía [data-hero-title].
 */
export default function Hero() {
  return (
    <section
      data-hero
      className="relative flex h-screen w-full flex-col items-center justify-center px-6 text-center"
    >
      <p className="mb-6 font-display text-xs uppercase tracking-[0.4em] text-white/60">
        BBVA × NFQ
      </p>

      <h1
        data-hero-title
        className="font-display font-bold tracking-tighter text-white"
        style={{ fontSize: "clamp(3rem, 13vw, 15rem)", lineHeight: 0.85 }}
      >
        RDR
        <br />
        KNOWLEDGE
      </h1>

      <p className="mt-6 max-w-md font-sans text-base text-white/60">
        El hub de documentación, formación y proyectos del Repositorio de Datos de
        Referencia.
      </p>

      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-display text-xs uppercase tracking-[0.35em] text-white/50">
        Scroll para explorar
      </span>
    </section>
  );
}
