"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "./AuthGate";
import { PROGRESO_URL, completadasDe, estadoNiveles, nivelActual, marcar, onProgreso } from "@/lib/progreso";
import ProgresoPanel from "./ProgresoPanel";

// Mapa 3D (WebGL) solo cliente.
const Mapa = dynamic(() => import("./ProgresoMapa"), { ssr: false });

const FALLBACK_SEED = { porDefecto: { completados: [] }, usuarios: {} };

function useIsDesktop() {
  const [d, setD] = useState(null);
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
  const { email } = useAuth();
  const desktop = useIsDesktop();
  const [seed, setSeed] = useState(null);
  const [completadas, setCompletadas] = useState(() => new Set());

  // Semilla compartida (progreso.json): todos parten de nivel 0.
  useEffect(() => {
    let alive = true;
    fetch(PROGRESO_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => alive && setSeed(s || FALLBACK_SEED))
      .catch(() => alive && setSeed(FALLBACK_SEED));
    return () => { alive = false; };
  }, []);

  // Avance del usuario = semilla ∪ localStorage; se recalcula al completar cursos.
  const recompute = useCallback(() => {
    if (seed) setCompletadas(completadasDe(email, seed));
  }, [email, seed]);
  useEffect(() => { recompute(); }, [recompute]);
  useEffect(() => onProgreso(recompute), [recompute]);

  const niveles = useMemo(() => estadoNiveles(completadas), [completadas]);
  const current = useMemo(() => nivelActual(niveles), [niveles]);
  const onMarcar = useCallback((archivo, done) => marcar(email, archivo, done), [email]);

  if (desktop === null || seed === null) return null; // el splash cubre la espera

  if (desktop) return <Mapa niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />;

  // Móvil/tablet: roadmap con progreso (sin WebGL).
  return (
    <main className="relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="rdr-blob left-[-10%] top-[6%] h-64 w-64" style={{ background: "#1D7CF4" }} />
        <span className="rdr-blob right-[-8%] top-[34%] h-72 w-72" style={{ background: "#9694FF", animationDelay: "-6s" }} />
      </div>
      <div className="mx-auto w-full max-w-xl px-5 pb-24 pt-28">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.35em] text-serene/80">Ruta formativa</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-sand">Tu progreso por niveles</h2>
        <p className="mt-2 text-sm text-sand/65">Completa cada nivel para desbloquear el siguiente.</p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <ProgresoPanel niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />
        </div>
      </div>
    </main>
  );
}
