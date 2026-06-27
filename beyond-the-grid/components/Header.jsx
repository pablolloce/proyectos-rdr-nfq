"use client";

import { useAuth } from "./AuthGate";

/** Cabecera compacta. Incluye sesión + cerrar sesión (antes en el footer). */
export default function Header() {
  const { email, logout } = useAuth();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 pt-7">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold leading-tight text-sand md:text-3xl">
          RDR Knowledge
        </h1>
        <p className="mt-0.5 text-sm text-serene/80">Hub de documentación · BBVA × NFQ</p>
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-4">
        {email && <span className="hidden text-xs text-sand/70 lg:inline">{email}</span>}
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-serene/30 bg-midnight/70 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-sand transition-colors hover:border-serene focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        >
          Cerrar sesión
        </button>
        {/* Logo oficial BBVA (blanco sobre Midnight) — regla dura nº4 CLAUDE.md. */}
        <img src="/team-hub/logos/bbva-white.png" alt="BBVA" className="h-6 w-auto md:h-7" />
      </div>
    </header>
  );
}
