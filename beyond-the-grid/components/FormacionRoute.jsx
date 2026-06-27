"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LevelsPanel from "./LevelsPanel";

// Esfera 3D (WebGL) solo cliente.
const Sphere = dynamic(() => import("./FormacionHub"), { ssr: false });

function useIsDesktop() {
  const [d, setD] = useState(null); // null hasta conocer el viewport (evita montar WebGL en móvil)
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const f = () => setD(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return d;
}

export default function FormacionRoute() {
  const desktop = useIsDesktop();
  if (desktop === null) return null;

  // Desktop: esfera 3D inmersiva.
  if (desktop) return <Sphere />;

  // Móvil/tablet: roadmap de niveles (sin WebGL -> rápido y táctil).
  return (
    <main className="relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="rdr-blob left-[-10%] top-[6%] h-64 w-64" style={{ background: "#001391" }} />
        <span className="rdr-blob right-[-8%] top-[30%] h-72 w-72" style={{ background: "#9694FF", animationDelay: "-6s" }} />
      </div>
      <div className="mx-auto w-full max-w-xl px-5 pb-24 pt-28">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.35em] text-serene/80">Ruta formativa</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-sand">Niveles 00–06</h2>
        <p className="mt-2 text-sm text-sand/65">
          Recorre las formaciones disponibles. Las bloqueadas se desbloquearán pronto.
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <LevelsPanel />
        </div>
      </div>
    </main>
  );
}
