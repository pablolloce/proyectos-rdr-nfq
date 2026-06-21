"use client";

import { useAuth } from "./AuthGate";

/** Pie del hub: identidad + sesión activa + cerrar sesión. */
export default function Footer() {
  const { email, logout } = useAuth();

  return (
    <footer className="mx-auto mt-auto flex max-w-7xl flex-col items-start gap-4 border-t border-serene/15 px-6 py-10 text-sm text-sand/50 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-sand">RDR Knowledge</span>
        <span className="opacity-40">·</span>
        <span>BBVA × NFQ</span>
      </div>

      <div className="flex items-center gap-4">
        {email && <span className="hidden sm:inline">{email}</span>}
        <button
          data-hover
          type="button"
          onClick={logout}
          className="rounded-full border border-serene/30 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-sand transition-colors hover:border-serene"
        >
          Cerrar sesión
        </button>
      </div>
    </footer>
  );
}
