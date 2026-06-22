"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "@/components/Toast";

/**
 * Capa de enlaces del hub (porta la lógica de data-link-key del index.html).
 *
 * - Carga links/links.json (fuente única de URLs) con cache:'no-store'.
 * - getUrl(key): devuelve la URL si existe y no es un placeholder.
 * - copyLink(key): copia al portapapeles y muestra un toast.
 * - showToast(msg): aviso flotante.
 *
 * La ruta es relativa ('links/...') igual que en el original: con basePath
 * "/team-hub" se resuelve a /team-hub/links/links.json (el fichero vive en
 * public/links/links.json).
 */
const LinksContext = createContext(null);

export function LinksProvider({ children }) {
  const [links, setLinks] = useState(null);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef();

  useEffect(() => {
    fetch("links/links.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(setLinks)
      .catch(() => setError(true));
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const getUrl = useCallback(
    (key) => {
      if (!links) return null;
      const entry = links[key];
      const url = entry && (typeof entry === "string" ? entry : entry.url);
      if (!url || url.indexOf("PEGAR_AQUI") !== -1) return null;
      return url;
    },
    [links]
  );

  const copyLink = useCallback(
    async (key) => {
      if (error) return showToast("No se pudieron cargar los enlaces");
      const url = getUrl(key);
      if (!url) return showToast("Enlace no disponible — revisa links.json");
      try {
        await navigator.clipboard.writeText(url);
        showToast("Enlace copiado al portapapeles");
      } catch {
        showToast("No se pudo copiar el enlace");
      }
    },
    [error, getUrl, showToast]
  );

  return (
    <LinksContext.Provider value={{ getUrl, copyLink, showToast, error }}>
      {children}
      <Toast message={toast} />
    </LinksContext.Provider>
  );
}

export const useLinks = () => useContext(LinksContext);
