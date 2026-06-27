"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthGate";
import { PROGRESO_URL, completadasDe, estadoNiveles, nivelActual, marcar, onProgreso, cargarRemoto } from "@/lib/progreso";
import ProgresoTorre from "./ProgresoTorre";

const FALLBACK_SEED = { porDefecto: { completados: [] }, usuarios: {} };

export default function FormacionRoute() {
  const { email } = useAuth();
  const [seed, setSeed] = useState(null);
  const [remoto, setRemoto] = useState(() => new Set()); // progreso real del backend
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

  // Progreso real desde el backend de formaciones (por email -> userId).
  useEffect(() => {
    let alive = true;
    if (email) cargarRemoto(email).then((s) => alive && setRemoto(s)).catch(() => {});
    return () => { alive = false; };
  }, [email]);

  // Avance = semilla ∪ localStorage ∪ backend; se recalcula al completar cursos.
  const recompute = useCallback(() => {
    if (seed) setCompletadas(completadasDe(email, seed, remoto));
  }, [email, seed, remoto]);
  useEffect(() => { recompute(); }, [recompute]);
  useEffect(() => onProgreso(recompute), [recompute]);

  const niveles = useMemo(() => estadoNiveles(completadas), [completadas]);
  const current = useMemo(() => nivelActual(niveles), [niveles]);
  const onMarcar = useCallback((archivo, done) => marcar(email, archivo, done), [email]);

  if (seed === null) return null; // el splash cubre la espera

  return <ProgresoTorre niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />;
}
