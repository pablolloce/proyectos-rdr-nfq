// Constantes y helpers del calendario de vacaciones. Portados 1:1 del legacy
// public/vacaciones.html (fuente de verdad funcional) — solo cambia el envase.

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const DIAS_CORTO = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
// Letra de día para listas compactas (L M X J V S D).
export const DIA_LETRA = ["D", "L", "M", "X", "J", "V", "S"];

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

/** "2026-07-12" -> "Domingo 12 de julio" (portado del legacy). */
export function formatearFechaLegible(dateStr) {
  const p = dateStr.split("-");
  const d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  return `${NOMBRES_DIA[d.getDay()]} ${parseInt(p[2], 10)} de ${MESES[parseInt(p[1], 10) - 1].toLowerCase()}`;
}

/** Date -> "YYYY-MM-DD" local (mismo formato de clave que usa el backend). */
export const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** "YYYY-MM-DD" -> Date LOCAL (evita el shift UTC de new Date(string)). */
export function parseKey(dateStr) {
  const p = dateStr.split("-");
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const esFindeDate = (d) => d.getDay() === 0 || d.getDay() === 6;

/** ¿Día laborable? (ni fin de semana ni festivo de ningún calendario). */
export const esLaborable = (dateStr, festivos) =>
  !esFindeDate(parseKey(dateStr)) && !(festivos && festivos[dateStr]);

/** "2026-08-03","2026-08-14" -> "3–14 ago" / "28 jul – 3 ago" / "14 ago". */
export function formatRango(inicio, fin) {
  const a = parseKey(inicio);
  const b = parseKey(fin);
  if (inicio === fin) return `${a.getDate()} ${MESES_CORTO[a.getMonth()]}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
    return `${a.getDate()}–${b.getDate()} ${MESES_CORTO[a.getMonth()]}`;
  return `${a.getDate()} ${MESES_CORTO[a.getMonth()]} – ${b.getDate()} ${MESES_CORTO[b.getMonth()]}`;
}

/** "2026-08-17" -> "lun 17 ago" (para "Vuelve el …"). */
export function formatFechaCorta(dateStr) {
  const d = parseKey(dateStr);
  return `${DIAS_CORTO[d.getDay()]} ${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
}

/**
 * ¿El hueco ESTRICTO entre dos fechas (a < b) es completamente no laborable?
 * (true también si son consecutivas: hueco vacío). Se usa para agrupar rangos
 * de ausencia saltando fines de semana/festivos.
 */
function huecoNoLaborable(a, b, festivos) {
  let d = addDays(parseKey(a), 1);
  const end = parseKey(b);
  if (d > end) return false;
  let guard = 0;
  while (d < end && guard++ < 60) {
    if (esLaborable(dateKey(d), festivos)) return false;
    d = addDays(d, 1);
  }
  return guard < 60;
}

/**
 * Agrupa las ausencias de UNA persona en rangos [{inicio, fin, motivo, dias}].
 * `fechas`: [{dateStr, motivo}] ORDENADO ascendente y sin duplicados. Solo se
 * unen días con el mismo motivo cuyo hueco completo sea no laborable.
 * `dias` cuenta los días LABORABLES del rango realmente registrados.
 */
export function rangosDePersona(fechas, festivos) {
  const rangos = [];
  let cur = null;
  for (const f of fechas) {
    const lab = esLaborable(f.dateStr, festivos) ? 1 : 0;
    if (cur && cur.motivo === f.motivo && huecoNoLaborable(cur.fin, f.dateStr, festivos)) {
      cur.fin = f.dateStr;
      cur.dias += lab;
    } else {
      cur = { inicio: f.dateStr, fin: f.dateStr, motivo: f.motivo, dias: lab };
      rangos.push(cur);
    }
  }
  return rangos;
}

/**
 * Primer día laborable, posterior a hoy, en el que la persona YA no está
 * ausente ("Vuelve el …"). `fechasSet`: Set de sus claves de ausencia.
 */
export function fechaVuelta(hoyStr, fechasSet, festivos) {
  let d = addDays(parseKey(hoyStr), 1);
  for (let i = 0; i < 400; i++) {
    const k = dateKey(d);
    if (!fechasSet.has(k) && esLaborable(k, festivos)) return k;
    d = addDays(d, 1);
  }
  return null;
}

/* ── Mapa de calor del calendario (acento mandarin de la ruta) ──
   Tramos: 1 tinte suave · 2-3 medio · 4+ sólido con texto AA
   (Electric sobre mandarin claro en oscuro; blanco sobre #C05621 en claro). */
export function heatStyle(n, theme) {
  const L = theme === "light";
  if (n >= 4)
    return {
      solid: true,
      cell: { background: L ? "#C05621" : "#FFB56B", borderColor: L ? "#C05621" : "#FFB56B" },
      num: { color: L ? "#FFFFFF" : "#001391" },
    };
  if (n >= 2)
    return {
      cell: { background: L ? "rgba(192,86,33,0.24)" : "rgba(255,181,107,0.30)", borderColor: L ? "rgba(192,86,33,0.5)" : "rgba(255,181,107,0.55)" },
      num: { color: L ? "#8A3E17" : "#FFDDB8" },
    };
  return {
    cell: { background: L ? "rgba(192,86,33,0.11)" : "rgba(255,181,107,0.14)", borderColor: L ? "rgba(192,86,33,0.32)" : "rgba(255,181,107,0.32)" },
    num: { color: L ? "#A0491B" : "#FFB56B" },
  };
}

/** Tinta legible (Midnight/blanco) sobre un color sólido #hex o rgb(r,g,b). */
export function textOn(c) {
  if (typeof c !== "string") return "#FFFFFF";
  let r, g, b;
  const hex = c.trim().match(/^#([0-9a-f]{6})$/i);
  const fn = c.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (hex) {
    r = parseInt(hex[1].slice(0, 2), 16); g = parseInt(hex[1].slice(2, 4), 16); b = parseInt(hex[1].slice(4, 6), 16);
  } else if (fn) {
    r = +fn[1]; g = +fn[2]; b = +fn[3];
  } else return "#FFFFFF";
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#070E46" : "#FFFFFF";
}

/* ── Chips de motivo en modo "tinte" (fondo suave + texto temado AA), para el
   resumen "Ahora" y la vista Personas. Los chips sólidos del tooltip/DaySheet
   siguen usando MOTIVOS tal cual. ── */
const MOTIVO_TEXT_DARK = { VA: "#88E783", FO: "#85C8FF", ES: "#9694FF", BA: "#FF9A9A" };
const MOTIVO_TEXT_LIGHT = { VA: "#1B7A3E", FO: "#155FA8", ES: "#5B4BD6", BA: "#C53030" };
const MOTIVO_TINT_DARK = { VA: "rgba(136,231,131,0.14)", FO: "rgba(133,200,255,0.14)", ES: "rgba(150,148,255,0.16)", BA: "rgba(197,48,48,0.24)" };
const MOTIVO_TINT_LIGHT = { VA: "rgba(27,122,62,0.10)", FO: "rgba(21,95,168,0.10)", ES: "rgba(91,75,214,0.10)", BA: "rgba(197,48,48,0.10)" };

export function motivoChipStyle(codigo, theme) {
  const L = theme === "light";
  return {
    background: (L ? MOTIVO_TINT_LIGHT : MOTIVO_TINT_DARK)[codigo] || (L ? "rgba(7,14,70,0.08)" : "rgba(247,248,248,0.1)"),
    color: (L ? MOTIVO_TEXT_LIGHT : MOTIVO_TEXT_DARK)[codigo] || (L ? "#070E46" : "#F7F8F8"),
  };
}

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

/** Normalización de visibilidad por tema. En OSCURO se aclaran los colores
 * demasiado oscuros (legacy). En CLARO el color de equipo se respeta TAL CUAL
 * (es identidad: debe ser el mismo en ambos temas); la visibilidad de puntos
 * y rellenos la garantiza el aro/borde del componente, no el matiz. */
export const visColorTema = (c, theme) => (theme === "light" ? c : visColor(c));

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
