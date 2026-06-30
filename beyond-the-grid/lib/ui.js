// Helpers de UI compartidos por el hub y la ruta de formación.

/** HEX (#rrggbb) -> rgba(r,g,b,a). Para tintar bordes/fondos/spotlights por acento. */
export const rgba = (hex, a) => {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

/** Entero -> cadena de 2 cifras con cero a la izquierda (01, 02, … para niveles). */
export const n2 = (n) => String(n).padStart(2, "0");
