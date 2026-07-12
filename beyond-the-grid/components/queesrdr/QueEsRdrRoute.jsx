"use client";

// Página "¿Qué es RDR?" — migración de la presentación legacy
// public/que-es-rdr.html (33 slides) a una landing editorial de scroll
// vertical integrada en la app: mismo chrome (AuthGate/Header/footer NFQ),
// mismos tokens, barra de progreso .rdr-scrollbar y revelado por viewport.
//
// El orden narrativo del deck se conserva módulo a módulo:
//   00 Contexto bancario → 01 ¿Qué es RDR? → 02 Entidades de dominio →
//   03 Entidades en detalle → 04 Canales de comunicación →
//   05 Ecosistema de integración → RDR en cifras + cierre.

import { useReducedMotion } from "framer-motion";
import { useLowPower } from "@/hooks/useLowPower";
import { PALETTE } from "@/lib/palette";
import { rgba } from "@/lib/ui";
import { Reveal } from "./ui";
import SeccionContexto from "./SeccionContexto";
import SeccionOverview from "./SeccionOverview";
import SeccionEntidades from "./SeccionEntidades";
import SeccionDetalle from "./SeccionDetalle";
import SeccionCanales from "./SeccionCanales";
import SeccionEcosistema from "./SeccionEcosistema";
import SeccionCierre from "./SeccionCierre";
import ArtBanner from "@/components/chrome/ArtBanner";
import { ART } from "@/lib/art";

// Índice de módulos (equivale a la agenda del deck; ancla a cada sección).
const MODULOS = [
  { n: "00", id: "contexto", t: "Contexto bancario", color: PALETTE.serene },
  { n: "01", id: "overview", t: "¿Qué es RDR?", color: PALETTE.canary },
  { n: "02", id: "entidades", t: "Entidades de dominio", color: PALETTE.lime },
  { n: "03", id: "detalle", t: "Entidades en detalle", color: PALETTE.purple },
  { n: "04", id: "canales", t: "Canales de comunicación", color: PALETTE.mandarin },
  { n: "05", id: "ecosistema", t: "Ecosistema de integración", color: PALETTE.aqua },
  { n: "★", id: "cifras", t: "RDR en cifras", color: PALETTE.serene },
];

function AmbientBackground({ lite }) {
  if (lite) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
      <span className="rdr-blob left-[-10%] top-[4%] h-80 w-80 opacity-40" style={{ background: PALETTE.royal }} />
      <span className="rdr-blob right-[-6%] top-[28%] h-72 w-72 opacity-30" style={{ background: PALETTE.serene, animationDelay: "-4s" }} />
      <span className="rdr-blob bottom-[-14%] left-[10%] h-96 w-96 opacity-30" style={{ background: PALETTE.purple, animationDelay: "-9s" }} />
    </div>
  );
}

function Hero({ reduce }) {
  return (
    <header className="pb-4 pt-6 sm:pt-10">
      <Reveal>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.4em] text-serene/80">
          Mayo 2026 · Datos de Referencia
        </p>
        <span aria-hidden className="mt-5 block h-px w-12 bg-serene/50" />
        <h1 className="mt-5 font-display text-6xl font-bold leading-[0.95] tracking-tight text-sand sm:text-7xl md:text-8xl">
          ¿Qué es
          <br />
          RDR?
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-sand/75 sm:text-lg">
          El Repositorio de Datos de Referencia de BBVA: entidades, arquitectura, flujo de datos e integraciones.
        </p>
      </Reveal>

      {/* Índice de módulos */}
      <Reveal delay={0.12} as="nav" className="mt-12" aria-label="Módulos de la página">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((m) => (
            <li key={m.id}>
              <a
                href={`#${m.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-sm transition hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                style={{ borderLeft: `3px solid ${m.color}` }}
              >
                <span className="font-display text-xs font-bold tabular-nums" style={{ color: m.color }}>{m.n}</span>
                <span className="flex-1 text-sm font-semibold text-sand/85 transition group-hover:text-sand">{m.t}</span>
                <span aria-hidden className="text-sand/35 transition-transform group-hover:translate-x-0.5 group-hover:text-sand/70">→</span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      {!reduce && (
        <div aria-hidden className="mt-12 flex justify-center text-serene/50">
          <span className="animate-bounce text-xl">↓</span>
        </div>
      )}
    </header>
  );
}

export default function QueEsRdrRoute() {
  const reduce = useReducedMotion();
  const lite = useLowPower();

  return (
    <main className="relative">
      <ArtBanner src={ART.formacion} />
      {/* Barra de progreso de scroll (scroll-driven CSS, como /formacion) */}
      <div aria-hidden className="rdr-scrollbar" />
      <AmbientBackground lite={lite} />

      {/* Contenedor de lectura */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-24 pt-28 sm:px-6">
        <Hero reduce={reduce} />

        <SeccionContexto />
        <SeccionOverview />
        <SeccionEntidades />
        <SeccionDetalle />
        <SeccionCanales />
        <SeccionEcosistema />
        <SeccionCierre />
      </div>
    </main>
  );
}
