"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../chrome/AuthGate";
import { PROGRESO_URL, completadasDe, estadoNiveles, nivelActual, marcar, onProgreso, cargarRemoto, getRemotoCache } from "@/lib/progreso";
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

  // Progreso real del backend (por email -> userId), patrón SWR:
  //  - si hay caché del último progreso, se muestra AL INSTANTE (sin skeleton)
  //    y se refresca en 2º plano en silencio.
  //  - primera visita (sin caché): skeleton hasta que resuelva (tope 5s).
  useEffect(() => {
    let alive = true;
    if (!email) { setRemotoReady(true); return; }
    const cached = getRemotoCache(email);
    if (cached) { setRemoto(cached); setRemotoReady(true); } // SWR: instantáneo
    else setRemotoReady(false);
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

  // No-flash: si la carga acaba en <300ms no se muestra skeleton (evita parpadeo).
  const ready = seed !== null && remotoReady;
  const [showSkel, setShowSkel] = useState(false);
  useEffect(() => {
    if (ready) { setShowSkel(false); return; }
    const t = setTimeout(() => setShowSkel(true), 300);
    return () => clearTimeout(t);
  }, [ready]);

  if (!ready) return showSkel ? <ProgresoSkeleton /> : null;

  return <ProgresoTorre niveles={niveles} completadas={completadas} current={current} onMarcar={onMarcar} />;
}
