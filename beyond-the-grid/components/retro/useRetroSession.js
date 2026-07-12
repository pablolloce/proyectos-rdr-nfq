"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { contarTermometro } from "./constants";

/**
 * Estado en vivo de una sesión de retro. Réplica exacta de la lógica de
 * sincronización de public/retro.html:
 *
 *  - Polling GET datosCompletos cada 3 s.
 *  - Si hay mutaciones en vuelo (inflight > 0), el tick de polling se salta:
 *    la mutación ya devuelve el estado más reciente al terminar.
 *  - Anti-rebote por `rev` (timestamp del servidor): una respuesta de polling
 *    con rev menor que el último aceptado se descarta (llegó tarde y pisaría
 *    un estado más nuevo).
 *  - Dedupe por JSON.stringify para no re-renderizar sin cambios reales.
 *  - Tras cada mutación se reinicia el ciclo de polling (el próximo poll
 *    espera 3 s desde AHORA, no cae en mitad de una ventana antigua).
 */
export function useRetroSession({ gasGet, gasPost, sessionId, onFatal }) {
  const [estado, setEstado] = useState(null); // null = cargando
  const R = useRef({ lastRev: 0, lastStr: "", inflight: 0, timer: null, alive: true }).current;
  const fatalRef = useRef(onFatal);
  fatalRef.current = onFatal;

  const procesar = useCallback(
    (datos, forceRender) => {
      if (!R.alive) return;
      if (!forceRender && datos.rev && datos.rev < R.lastRev) return;
      if (datos.rev) R.lastRev = datos.rev;

      const str = JSON.stringify(datos);
      if (!forceRender && R.lastStr === str) return;
      R.lastStr = str;

      setEstado({
        fase: datos.fase || 1,
        nombreSesion: datos.nombreSesion || "",
        usuarios: datos.usuarios || [],
        votosTermometro: contarTermometro(datos.termometro),
        tarjetas: datos.tarjetas || [],
        mejoras: datos.mejoras || [],
      });
    },
    [R]
  );

  const obtener = useCallback(
    async (isInitial) => {
      if (R.inflight > 0 && !isInitial) return;
      try {
        const datos = await gasGet("datosCompletos", { id: sessionId });
        procesar(datos, false);
      } catch (err) {
        if (isInitial) {
          if (R.alive) fatalRef.current && fatalRef.current(err);
        } else {
          console.warn("Polling falló:", err.message);
        }
      }
    },
    [R, gasGet, sessionId, procesar]
  );

  const reiniciarPolling = useCallback(() => {
    if (R.timer) clearInterval(R.timer);
    R.timer = setInterval(() => obtener(false), 3000);
  }, [R, obtener]);

  useEffect(() => {
    R.alive = true;
    R.lastRev = 0;
    R.lastStr = "";
    R.inflight = 0;
    setEstado(null);
    obtener(true);
    reiniciarPolling();
    return () => {
      R.alive = false;
      if (R.timer) clearInterval(R.timer);
      R.timer = null;
    };
  }, [R, sessionId, obtener, reiniciarPolling]);

  /** Mutación al backend: silencia el polling, aplica la respuesta y reinicia el ciclo. */
  const mutar = useCallback(
    async (accion, payload) => {
      R.inflight++;
      try {
        const datos = await gasPost(accion, { idSesion: sessionId, ...(payload || {}) });
        procesar(datos, true);
        return datos;
      } finally {
        R.inflight = Math.max(0, R.inflight - 1);
        if (R.inflight === 0) reiniciarPolling();
      }
    },
    [R, gasPost, sessionId, procesar, reiniciarPolling]
  );

  return { estado, mutar };
}
