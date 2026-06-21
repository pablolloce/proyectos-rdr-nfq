"use client";

import { useAuth } from "./AuthGate";

/** Pie del hub: identidad + sesión activa + cerrar sesión. */
export default function Footer() {
  const { email, logout } = useAuth();

  return (
    <footer className="mx-auto flex max-w-7xl flex-col items-start gap-4 border-t border-white/10 px-6 py-12 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-white">RDR Knowledge</span>
        <span className="opacity-50">·</span>
        <span>BBVA × NFQ</span>
      </div>

      <div className="flex items-center gap-4">
        {email && <span className="hidden sm:inline">{email}</span>}
        <button
          data-hover
          type="button"
          onClick={logout}
          className="rounded-full border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white"
        >
          Cerrar sesión
        </button>
      </div>
    </footer>
  );
}
