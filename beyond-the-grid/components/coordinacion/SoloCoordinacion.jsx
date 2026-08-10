"use client";

import { Link } from "next-view-transitions";
import { useAuth } from "../chrome/AuthGate";
import { GLASS } from "./ui";
import { IconAlert } from "./icons";

/* Guarda de las páginas de Coordinación (/simulador, /capacidad, /ofertas):
   solo entran quienes tienen "coordinador": true en equipo/equipo.json —
   el mismo rol que muestra u oculta la sección Coordinación del hub. Quien
   llegue por URL directa sin el rol ve este aviso en lugar de la página. */
export default function SoloCoordinacion({ children }) {
  const { isCoordinador } = useAuth();
  if (isCoordinador) return children;
  return (
    <main className="relative min-h-dvh w-full">
      <div className="mx-auto grid min-h-dvh w-full max-w-xl place-items-center px-5">
        <div className={`${GLASS} p-8 text-center`}>
          <IconAlert size={30} className="mx-auto text-canary" />
          <h1 className="mt-3 font-display text-2xl font-bold text-sand">Sección de Coordinación</h1>
          <p className="mt-2 text-sm text-sand/65">
            Esta página es solo para el equipo de coordinación. Si crees que deberías tener acceso,
            pide que te añadan el rol en la configuración del equipo.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-5 py-2 text-xs font-bold uppercase tracking-wider text-sand/85 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
