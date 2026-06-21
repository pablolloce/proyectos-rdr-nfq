"use client";

import { useAuth } from "./AuthGate";

/** Cabecera compacta. Incluye sesión + cerrar sesión (antes en el footer). */
export default function Header() {
  const { email, logout } = useAuth();

  return (
    <header className="mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between gap-6 px-6 pb-5 pt-7">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold leading-tight text-sand md:text-3xl">
          RDR Knowledge
        </h1>
        <p className="mt-0.5 text-sm text-serene/80">Hub de documentación · BBVA × NFQ</p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {email && <span className="hidden text-xs text-sand/50 lg:inline">{email}</span>}
        <button
          data-hover
          type="button"
          onClick={logout}
          className="rounded-full border border-serene/30 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-sand transition-colors hover:border-serene"
        >
          Cerrar sesión
        </button>
        <span className="font-sans text-xl font-black tracking-tight text-sand">BBVA</span>
      </div>
    </header>
  );
}
