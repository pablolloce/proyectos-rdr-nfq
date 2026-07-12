// Constantes y helpers del calendario de vacaciones. Portados 1:1 del legacy
// public/vacaciones.html (fuente de verdad funcional) — solo cambia el envase.

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Diccionario de motivos (mismos códigos y textos que el legacy). Los colores
// de fondo son acentos claros -> texto Electric Blue (regla nº9); la baja (BA)
// es roja con texto blanco, como en el original.
export const MOTIVOS = {
  VA: { texto: "Vacaciones",   bg: "#88E783", text: "#001391" },
  FO: { texto: "Formación",    bg: "#85C8FF", text: "#001391" },
  ES: { texto: "Permiso esp.", bg: "#9694FF", text: "#001391" },
  BA: { texto: "Baja",         bg: "#C53030", text: "#FFFFFF" },
};

export const motivoDe = (codigo) =>
  MOTIVOS[codigo] || { texto: codigo, bg: "rgba(247,248,248,0.4)", text: "#070E46" };

// Umbral de alerta de personal disponible (idéntico al legacy: < 10).
export const UMBRAL_ALERTA = 10;

// Máximo de puntos visibles por día antes del "+N" (idéntico al legacy).
export const MAX_DOTS = 8;

/** "2026-07-12" -> "Domingo 12 de julio" (portado del legacy). */
export function formatearFechaLegible(dateStr) {
  const p = dateStr.split("-");
  const d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  return `${NOMBRES_DIA[d.getDay()]} ${parseInt(p[2], 10)} de ${MESES[parseInt(p[1], 10) - 1].toLowerCase()}`;
}

/** Date -> "YYYY-MM-DD" local (mismo formato de clave que usa el backend). */
export const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Aclara colores demasiado oscuros para que sean visibles sobre Midnight
 * (portado del bloque "rdr-color-dark" del legacy: mismos umbrales y mezcla).
 */
export function visColor(c) {
  if (typeof c !== "string") return c;
  const s = c.trim().toLowerCase();
  if (s === "#001391" || s === "#070e46" || s.includes("electric") || s.includes("midnight")) return "#4D8BFF";
  const m = s.match(/^#([0-9a-f]{6})$/);
  if (!m) return c;
  const r = parseInt(s.slice(1, 3), 16);
  const g = parseInt(s.slice(3, 5), 16);
  const b = parseInt(s.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.3) {
    const mix = (x) => Math.round(x + (255 - x) * 0.55);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }
  return c;
}

/**
 * Espejo de visColor para MODO CLARO: oscurece colores demasiado claros para
 * que sean visibles sobre Sand (mismos umbral y mezcla, invertidos). Electric
 * y Midnight ya contrastan sobre claro, se dejan tal cual.
 */
export function visColorLight(c) {
  if (typeof c !== "string") return c;
  const s = c.trim().toLowerCase();
  if (s === "#001391" || s === "#070e46" || s.includes("electric") || s.includes("midnight")) return c;
  const m = s.match(/^#([0-9a-f]{6})$/);
  if (!m) return c;
  const r = parseInt(s.slice(1, 3), 16);
  const g = parseInt(s.slice(3, 5), 16);
  const b = parseInt(s.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum > 0.6) {
    const mix = (x) => Math.round(x * 0.55);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }
  return c;
}

/** Normalización de visibilidad por tema: aclara en oscuro, oscurece en claro. */
export const visColorTema = (c, theme) => (theme === "light" ? visColorLight(c) : visColor(c));

/**
 * Aplica visColorTema a empleados, empleadosMap y paletaEquipos. A diferencia
 * del legacy NO muta los datos: devuelve una copia temada, de modo que al
 * conmutar el tema se pueda recalcular desde los colores originales del backend.
 */
export function normalizarColores(datos, theme = "dark") {
  try {
    const vis = (c) => visColorTema(c, theme);
    const out = { ...datos };
    if (datos.empleados)
      out.empleados = datos.empleados.map((e) => (e && e.color ? { ...e, color: vis(e.color) } : e));
    if (datos.empleadosMap) {
      out.empleadosMap = {};
      Object.keys(datos.empleadosMap).forEach((k) => {
        const e = datos.empleadosMap[k];
        out.empleadosMap[k] = e && e.color ? { ...e, color: vis(e.color) } : e;
      });
    }
    if (datos.paletaEquipos) {
      out.paletaEquipos = {};
      Object.keys(datos.paletaEquipos).forEach((k) => { out.paletaEquipos[k] = vis(datos.paletaEquipos[k]); });
    }
    return out;
  } catch {
    /* datos parciales: se pinta lo que haya */
    return datos;
  }
}

// Estilos de festivos sobre fondo Midnight (mismos valores que el override
// oscuro del legacy: rayas diagonales ES/MX/común).
const rayas = (c1, c2) =>
  `repeating-linear-gradient(45deg, ${c1}, ${c1} 6px, ${c2} 6px, ${c2} 12px)`;

export const FESTIVO_STYLE = {
  ES: { backgroundImage: rayas("rgba(133,200,255,0.13)", "rgba(133,200,255,0.20)"), borderColor: "rgba(133,200,255,0.55)" },
  MX: { backgroundImage: rayas("rgba(136,231,131,0.13)", "rgba(136,231,131,0.20)"), borderColor: "rgba(136,231,131,0.55)" },
  AMBOS: { backgroundImage: rayas("rgba(255,181,107,0.13)", "rgba(255,181,107,0.20)"), borderColor: "rgba(255,181,107,0.6)" },
};

// Variante para MODO CLARO: mismos tonos oscurecidos que LIGHT_EQ de lib/theme
// (serene #155FA8, lime #1B7A3E, mandarin #C05621) — las rayas rgba de los
// acentos claros son invisibles sobre Sand.
export const FESTIVO_STYLE_LIGHT = {
  ES: { backgroundImage: rayas("rgba(21,95,168,0.10)", "rgba(21,95,168,0.20)"), borderColor: "rgba(21,95,168,0.55)" },
  MX: { backgroundImage: rayas("rgba(27,122,62,0.10)", "rgba(27,122,62,0.20)"), borderColor: "rgba(27,122,62,0.55)" },
  AMBOS: { backgroundImage: rayas("rgba(192,86,33,0.10)", "rgba(192,86,33,0.20)"), borderColor: "rgba(192,86,33,0.6)" },
};

export const FESTIVO_NUM_COLOR = { ES: "#85C8FF", MX: "#88E783", AMBOS: "#FFB56B" };
export const FESTIVO_NUM_COLOR_LIGHT = { ES: "#155FA8", MX: "#1B7A3E", AMBOS: "#C05621" };

/** Estilo/color de número de un festivo según tema. */
export const festivoStyle = (k, theme) => (theme === "light" ? FESTIVO_STYLE_LIGHT : FESTIVO_STYLE)[k];
export const festivoNumColor = (k, theme) => (theme === "light" ? FESTIVO_NUM_COLOR_LIGHT : FESTIVO_NUM_COLOR)[k];

/** Rojo de alerta (<10 disponibles): salmón sobre Midnight, rojo BBVA-safe sobre Sand. */
export const alertColor = (theme) => (theme === "light" ? "#C53030" : "#FF7A7A");

export const FESTIVO_LABEL = { ES: "Festivo España", MX: "Festivo México", AMBOS: "Festivo común" };
