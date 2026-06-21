"use client";

/**
 * Overlay del Hero (HTML normal por encima del Canvas 3D).
 * Ocupa 100vh. El título se anima con GSAP (ver useGsapAnimations) a través
 * de los atributos [data-hero] / [data-hero-title].
 */
export default function Hero() {
  return (
    <section
      data-hero
      className="relative flex h-screen w-full flex-col items-center justify-center px-6 text-center"
    >
      <h1
        data-hero-title
        className="font-display font-bold tracking-tighter text-white"
        style={{ fontSize: "clamp(3rem, 14vw, 16rem)", lineHeight: 0.88 }}
      >
        BEYOND
        <br />
        THE GRID
      </h1>

      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-display text-xs uppercase tracking-[0.35em] text-white/60">
        Scroll para explorar
      </span>
    </section>
  );
}
