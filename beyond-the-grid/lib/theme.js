"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Tema claro/oscuro de toda la app.
 *
 * - La CLASE `rdr-light` en <html> activa el set de variables CSS del modo
 *   claro (app/globals.css); las utilidades Tailwind (bg-midnight, text-sand,
 *   border-white/12…) leen esas variables, así que el 90% del sitio se
 *   re-tematiza solo.
 * - La preferencia persiste en localStorage("rdr_theme"). Un script inline en
 *   app/layout.jsx aplica la clase ANTES del primer paint (sin FOUC).
 * - useAccent(hex): para estilos inline en JS (PALETTE, TRACKS…) devuelve el
 *   equivalente LEGIBLE en claro de un acento pensado para fondo Midnight.
 */
const KEY = "rdr_theme";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    try {
      return localStorage.getItem(KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("rdr-light", theme === "light");
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

/* Equivalentes de acento para fondo claro (Sand). Los acentos BBVA claros
   (Serene, Lime, Canary…) no contrastan como TEXTO sobre Sand; estos tonos
   mantienen el matiz con contraste AA. Como SUPERFICIE sólida (botones,
   tiles) se sigue usando el hex original literal — funciona en ambos temas. */
const LIGHT_EQ = {
  "#85C8FF": "#155FA8", // serene  -> azul medio
  "#FFB56B": "#C05621", // mandarin-> naranja oscuro
  "#88E783": "#1B7A3E", // lime    -> verde oscuro
  "#9694FF": "#5B4BD6", // purple  -> violeta oscuro
  "#FFE761": "#8A6D00", // canary  -> ocre
  "#8BE1E9": "#0E7490", // aqua    -> cian oscuro
  "#1D7CF4": "#1456CC", // royal   -> azul intenso
  "#F7F8F8": "#070E46", // sand    -> tinta midnight
};

/** Hex temado para UN acento (estilos inline). */
export function useAccent(hex) {
  const { theme } = useTheme();
  if (theme !== "light" || !hex) return hex;
  return LIGHT_EQ[hex.toUpperCase()] || hex;
}

/** Función de mapeo para varios acentos a la vez (p. ej. objetos TRACKS). */
export function useAccentMap() {
  const { theme } = useTheme();
  return useCallback(
    (hex) => (theme === "light" && hex ? LIGHT_EQ[hex.toUpperCase()] || hex : hex),
    [theme]
  );
}
