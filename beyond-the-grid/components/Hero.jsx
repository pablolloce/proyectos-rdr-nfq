"use client";

/**
 * Overlay del hero (HTML sobre el Canvas 3D). Ocupa 100vh. Título tipográfico
 * enorme en Space Grotesk bold: "BEYOND THE GRID".
 */
export default function Hero() {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center px-6 text-center">
      <h1
        className="font-grotesk font-bold tracking-tighter text-sand"
        style={{ fontSize: "clamp(3rem, 14vw, 16rem)", lineHeight: 0.85, textShadow: "0 8px 60px rgba(7,14,70,.6)" }}
      >
        BEYOND
        <br />
        THE GRID
      </h1>
      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-grotesk text-xs uppercase tracking-[0.4em] text-serene/60">
        Scroll para explorar
      </span>
    </section>
  );
}
