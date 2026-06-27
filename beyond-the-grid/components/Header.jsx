"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthGate";

/**
 * Cabecera fija (glass). Sesión + cerrar sesión + logo BBVA.
 * Detecta la ruta actual (vive en AppFrame, persistente): en /formacion muestra
 * el botón de volver al hub y cambia el subtítulo.
 */
export default function Header() {
  const { email, logout } = useAuth();
  const pathname = usePathname();
  const isFormacion = (pathname || "").startsWith("/formacion");
  const backHref = isFormacion ? "/" : null;
  const subtitle = isFormacion
    ? "Ruta formativa · niveles 00–06"
    : "Hub de documentación · BBVA × NFQ";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Volver al inicio"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-serene/35 bg-midnight/70 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.08em] text-sand shadow-[0_4px_14px_rgba(0,0,0,0.3)] backdrop-blur transition hover:-translate-y-px hover:border-serene/70 hover:bg-midnight/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Inicio
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold leading-tight text-sand sm:text-2xl md:text-3xl">
            RDR Knowledge
          </h1>
          <p className="mt-0.5 truncate text-xs text-serene/80 sm:text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-3 sm:gap-4">
        {email && <span className="hidden text-xs text-sand/70 lg:inline">{email}</span>}
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-serene/30 bg-midnight/70 px-3 py-2 font-sans text-xs font-bold uppercase tracking-wider text-sand backdrop-blur transition-colors hover:border-serene focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene sm:px-4"
        >
          Salir
        </button>
        {/* Logo oficial BBVA (blanco sobre Midnight) — regla dura nº4 CLAUDE.md. */}
        <img src="/team-hub/logos/bbva-white.png?v=2" alt="BBVA" className="h-6 w-auto md:h-7" />
      </div>
    </header>
  );
}
