"use client";

// Datos del Time Report web (backend Codigo_TimeReport.gs, clave
// "timereportBackend" de links.json) + festivos del backend de vacaciones
// + equipo de equipo.json. Todo con el patrón habitual: GET para leer,
// POST text/plain JSON para escribir (simple request, sin preflight).
import { useCallback, useEffect, useRef, useState } from "react";
import { useLinks } from "@/lib/links";

export function useTimeReport(q) {
  const { getUrl, error: linksError } = useLinks();
  const [snap, setSnap] = useState(null); // { data, error }
  const urlRef = useRef(null);

  const load = useCallback(async () => {
    let url = null;
    if (!linksError) url = getUrl("timereportBackend");
    urlRef.current = url;
    if (!url) {
      setSnap({ data: null, error: linksError ? "no se pudo leer links.json" : "falta timereportBackend en links.json" });
      return;
    }
    if (!q) return;
    setSnap(null);
    try {
      const u = url + (url.indexOf("?") < 0 ? "?" : "&") + "action=snapshot&q=" + encodeURIComponent(q);
      const res = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(60000) }).then((r) => r.json());
      if (!res || !res.ok) throw new Error((res && res.error) || "respuesta inesperada");
      setSnap({ data: res.data, error: "" });
    } catch (e) {
      setSnap({ data: null, error: String(e.message || e) });
    }
  }, [getUrl, linksError, q]);

  useEffect(() => {
    const ready = linksError || getUrl("timereportBackend") != null || getUrl("_updated") != null || getUrl("_comment") != null;
    if (!ready || !q) return;
    load();
  }, [getUrl, linksError, q, load]);

  const post = useCallback(async (action, params) => {
    const url = urlRef.current;
    if (!url) throw new Error("Backend no configurado (timereportBackend en links.json).");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...params }),
    }).then((r) => r.json());
    if (!res || !res.ok) throw new Error((res && res.error) || "error del backend");
    return res.data;
  }, []);

  return { snap, reload: load, post };
}

/* Festivos del backend de vacaciones ({iso: "ES"|"MX"|"AMBOS"}); {} si falla. */
export function useFestivos() {
  const { getUrl, error: linksError } = useLinks();
  const [festivos, setFestivos] = useState(null);
  useEffect(() => {
    const url = getUrl("vacacionesBackend");
    if (!url) {
      if (linksError || getUrl("_updated") != null || getUrl("_comment") != null) setFestivos({});
      return;
    }
    fetch(url + (url.includes("?") ? "&" : "?") + "modo=publico")
      .then((r) => r.json())
      .then((d) => setFestivos(d.festivos || {}))
      .catch(() => setFestivos({}));
  }, [getUrl, linksError]);
  return festivos; // null = cargando
}

/* Equipo (equipo.json): [{nombre, email, coordinador, ...}]; null = cargando. */
export function useEquipo() {
  const [equipo, setEquipo] = useState(null);
  useEffect(() => {
    fetch("/team-hub/equipo/equipo.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEquipo(d.team || []))
      .catch(() => setEquipo([]));
  }, []);
  return equipo;
}
