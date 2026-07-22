"use client";

import { Link } from "next-view-transitions";
import { useAuth } from "@/components/chrome/AuthGate";
import { useAccentMap } from "@/lib/theme";
import { menuSections } from "@/lib/nav";
import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { IconHome, IconArrow } from "@/components/icons";

/**
 * 404 con la marca: mensaje claro + salidas útiles (hub y la primera página
 * de cada sección de lib/nav.js). Sin callejones sin salida.
 */
export default function NotFound() {
  const { isCoordinador } = useAuth();
  const mapAccent = useAccentMap();
  const sections = menuSections(isCoordinador);

  return (
    <main className="relative min-h-dvh w-full">
      <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
        <span className="rdr-blob left-[-6%] top-[8%] h-80 w-80" style={{ background: PALETTE.serene }} />
        <span className="rdr-blob bottom-[-10%] right-[-2%] h-96 w-96" style={{ background: PALETTE.royal }} />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-5 pb-24 pt-28 text-center sm:px-6">
        <p className="font-display text-7xl font-bold tracking-tight text-serene sm:text-8xl" aria-hidden>
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-sand sm:text-3xl">
          Esta página no existe
        </h1>
        <p className="mt-3 max-w-md text-pretty text-sm text-sand/70">
          La dirección que has abierto no corresponde a ninguna página del hub RDR Knowledge.
          Puede que el enlace haya cambiado de sitio.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-serene/35 bg-serene/10 px-5 py-2.5 text-sm font-bold text-serene backdrop-blur transition hover:border-serene/70 hover:bg-serene/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        >
          <IconHome size={16} aria-hidden /> Volver al inicio
        </Link>

        <nav aria-label="Secciones del hub" className="mt-10 w-full">
          <p className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.3em] text-sand/50">
            O ve directamente a…
          </p>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {sections.map((sec) => {
              const first = sec.items.find((it) => it.action === "route");
              if (!first) return null;
              return (
                <li key={sec.id}>
                  <Link
                    href={first.target}
                    className="group flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-left backdrop-blur-md transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                    style={{ boxShadow: `inset 0 2px 0 ${rgba(sec.color, 0.7)}` }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sec.color }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-sand" style={{ color: mapAccent(sec.color) }}>
                        {sec.title}
                      </span>
                      <span className="block truncate text-xs text-sand/60">{first.label}</span>
                    </span>
                    <IconArrow size={16} className="shrink-0 text-sand/40 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </main>
  );
}
