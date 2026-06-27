"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthGate";
import { PROGRESO_URL, completadasDe, estadoNiveles, nivelActual, marcar, onProgreso, cargarRemoto } from "@/lib/progreso";
import ProgresoTorre from "./ProgresoTorre";
import ProgresoSkeleton from "./ProgresoSkeleton";

const FALLBACK_SEED = { porDefecto: { completados: [] }, usuarios: {} };

export default function FormacionRoute() {
  const { email } = useAuth();
  const [seed, setSeed] = useState(null);
  const [remoto, setRemoto] = useState(() => new Set()); // progreso real del backend
  const [remotoReady, setRemotoReady] = useState(false); // ¿ya resolvió la info de cuenta?
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
  // remotoReady gobierna el skeleton: esperamos a la info de cuenta para no
  // pintar "nivel 0" y saltar luego. Tope de 5s para no bloquear si el backend
  // tarda/falla (entonces se muestra lo que haya: semilla + localStorage).
  useEffect(() => {
    let alive = true;
    setRemotoReady(false);
    if (!email) { setRemotoReady(true); return; }
    const done = () => { if (alive) setRemotoReady(true); };
    cargarRemoto(email).then((s) => { if (alive) setRemoto(s); }).catch(() => {}).finally(done);
    const t = setTimeout(done, 5000);
    return () => { alive = false; clearTimeout(t); };
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

  // Skeleton mientras carga semilla + info de cuenta (sin blanco ni salto).
  if (seed === null || !remotoReady) return <ProgresoSkeleton />;

  return <ProgresoTorre niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />;
}
