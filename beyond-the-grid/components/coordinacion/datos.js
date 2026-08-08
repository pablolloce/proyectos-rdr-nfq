"use client";

// Carga de datos de Coordinación (/simulador y /capacidad).
//
// CONTRATO BACKEND (Apps Script "controlBackend" de links.json):
//   - Lectura:   GET  {url}?action=snapshot            -> { ok, data } | { ok:false, error }
//   - Escritura: POST text/plain JSON.stringify({ action, ...params })
//     (solo guardarCapacidadWeb: escribe en su hoja propia "Capacidad_Web",
//      JAMÁS en los datos del Excel).
// Sin backend accesible se sirve el snapshot DEMO (banner en las páginas).
import { useCallback, useEffect, useRef, useState } from "react";
import { useLinks } from "@/lib/links";
import { DEMO } from "./model";

export function useSnapshot() {
  const { getUrl, error: linksError } = useLinks();
  const [snap, setSnap] = useState(null); // { data, demo, error }
  const urlRef = useRef(null);

  const load = useCallback(async () => {
    let url = null;
    let err = "";
    if (linksError) err = "no se pudo leer links.json";
    else url = getUrl("controlBackend");
    urlRef.current = url;
    if (url) {
      try {
        const u = url + (url.indexOf("?") < 0 ? "?" : "&") + "action=snapshot";
        // Timeout duro: sin él, un Apps Script colgado deja la página en el
        // esqueleto de carga para siempre (mejor caer a DEMO con aviso).
        const res = await fetch(u, { signal: AbortSignal.timeout(45000) }).then((r) => r.json());
        if (res && res.ok && res.data) {
          setSnap({ data: res.data, demo: false, error: "" });
          return;
        }
        err = res && res.error ? "backend: " + res.error : "respuesta inesperada del backend";
      } catch (e) {
        err = e && e.name === "TimeoutError"
          ? "el backend no respondió en 45 s (¿despliegue con acceso restringido o script colgado?)"
          : "sin conexión con el backend (CORS/red)";
      }
    } else if (!err) {
      err = "falta controlBackend en links.json";
    }
    setSnap({ data: DEMO, demo: true, error: err });
  }, [getUrl, linksError]);

  // Arranque: espera a que links.json esté cargado (claves-centinela).
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    const ready = linksError || getUrl("controlBackend") != null || getUrl("_updated") != null || getUrl("_comment") != null;
    if (!ready) return;
    booted.current = true;
    load();
  }, [getUrl, linksError, load]);

  /* POST de escritura (capacidad). Lanza si no hay backend (modo DEMO). */
  const post = useCallback(async (action, params) => {
    const url = urlRef.current;
    if (!url) throw new Error("Sin backend (modo demo): los cambios no se guardan.");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // simple request, sin preflight
      body: JSON.stringify({ action, ...params }),
    }).then((r) => r.json());
    if (!res || !res.ok) throw new Error((res && res.error) || "error del backend");
    return res.data;
  }, []);

  return { snap, reload: load, post };
}
