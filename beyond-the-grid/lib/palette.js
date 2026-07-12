// Única fuente de los acentos BBVA usados como color de categoría (hub, tracks
// de formación...). Mismos valores que theme.extend.colors en tailwind.config.js
// (ahí viven como clases de utilidad; aquí, como hex para estilos inline/JS).
// Si el manual de marca cambia un HEX, se edita en AMBOS sitios.
export const PALETTE = {
  serene: "#85C8FF",
  mandarin: "#FFB56B",
  lime: "#88E783",
  purple: "#9694FF",
  canary: "#FFE761",
  aqua: "#8BE1E9",
  // Azul decorativo propio de la app (gradiente de app/icon.svg), no es un
  // token oficial BBVA. Se repite en los blobs ambientales del index y de
  // /formacion — centralizado aquí por la misma razón que los de arriba.
  royal: "#1D7CF4",
};
