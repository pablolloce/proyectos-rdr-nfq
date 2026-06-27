// Catálogo único del HUB Formativo RDR (fuente: rdr-formacion.html).
// Niveles 00–06. 8 formaciones disponibles (con quiz), resto "próximamente".
// Colores por track en su variante clara (legibles sobre Midnight).

export const TRACKS = {
  welcome: { nombre: "Welcome", color: "#FFE761" },
  funcional: { nombre: "Funcional", color: "#85C8FF" },
  tecnico: { nombre: "Técnico", color: "#88E783" },
  cross: { nombre: "Cross", color: "#9694FF" },
};

export const NIVELES = [
  { n: 0, titulo: "Welcome Pack", subtitulo: "Onboarding inicial al ecosistema RDR" },
  { n: 1, titulo: "Fundamentos", subtitulo: "Base imprescindible para cualquier perfil" },
  { n: 2, titulo: "Modelado y operativa core", subtitulo: "Datos, liquidación y confirmación" },
  { n: 3, titulo: "Servicios y procesos", subtitulo: "Online, batch y entidades de negocio" },
  { n: 4, titulo: "Workstation y GoldenSource", subtitulo: "Configuración, master data y reglas" },
  { n: 5, titulo: "Integraciones y contrapartidas", subtitulo: "Cargas, extracciones y conciliaciones" },
  { n: 6, titulo: "Arquitectura, riesgos y reporting", subtitulo: "Visión global y procesos finales" },
];

// archivo -> se sirve en /team-hub/formacion/<archivo>
export const FORMACIONES = [
  // ── Disponibles ───────────────────────────────────────────────
  { track: "welcome", nivel: 0, titulo: "¿Qué es RDR?", archivo: "form-welcome-0-que-es-rdr.html", duracion: "~20 min", estado: "disponible" },
  { track: "funcional", nivel: 1, titulo: "Finanzas Básico", archivo: "form-functional-1-finance-basic.html", duracion: "~65 min", estado: "disponible" },
  { track: "tecnico", nivel: 1, titulo: "Tecnologías RDR", archivo: "form-tecnico-1-tecnologias-rdr.html", duracion: "~65 min", estado: "disponible" },
  { track: "funcional", nivel: 2, titulo: "Instrucciones de Confirmación", archivo: "form-functional-2-instrucciones-confirmacion.html", duracion: "~50 min", estado: "disponible" },
  { track: "funcional", nivel: 2, titulo: "Instrucciones de Liquidación", archivo: "form-functional-2-instrucciones-liquidacion.html", duracion: "~50 min", estado: "disponible" },
  { track: "tecnico", nivel: 2, titulo: "SQL · PL/SQL", archivo: "form-tecnico-2-sql.html", duracion: "~55 min", estado: "disponible" },
  { track: "tecnico", nivel: 2, titulo: "XML", archivo: "form-tecnico-2-xml.html", duracion: "~45 min", estado: "disponible" },
  { track: "cross", nivel: 2, titulo: "Modelo de datos", archivo: "form-cross-2-modelo-datos-rdr.html", duracion: "~50 min", estado: "disponible" },
  // ── Próximamente (bolas bloqueadas) ───────────────────────────
  { track: "tecnico", nivel: 3, titulo: "Servicio Online", estado: "proximamente" },
  { track: "tecnico", nivel: 3, titulo: "Procesos Batch", estado: "proximamente" },
  { track: "funcional", nivel: 3, titulo: "Otras entidades clave", estado: "proximamente" },
  { track: "funcional", nivel: 3, titulo: "Emisiones", estado: "proximamente" },
  { track: "tecnico", nivel: 4, titulo: "Workstation", estado: "proximamente" },
  { track: "tecnico", nivel: 4, titulo: "Procesos GoldenSource", estado: "proximamente" },
  { track: "tecnico", nivel: 4, titulo: "Mensajes GoldenSource", estado: "proximamente" },
  { track: "tecnico", nivel: 4, titulo: "RDRRULES", estado: "proximamente" },
  { track: "funcional", nivel: 4, titulo: "Legal Agreements", estado: "proximamente" },
  { track: "tecnico", nivel: 5, titulo: "Cargadores", estado: "proximamente" },
  { track: "tecnico", nivel: 5, titulo: "Extracciones", estado: "proximamente" },
  { track: "tecnico", nivel: 5, titulo: "Conciliaciones y Cargas", estado: "proximamente" },
  { track: "funcional", nivel: 5, titulo: "Contrapartidas", estado: "proximamente" },
  { track: "funcional", nivel: 5, titulo: "Caída de operaciones", estado: "proximamente" },
  { track: "tecnico", nivel: 6, titulo: "Arquitectura RDR", estado: "proximamente" },
  { track: "funcional", nivel: 6, titulo: "Reporting Regulatorio", estado: "proximamente" },
  { track: "funcional", nivel: 6, titulo: "Cálculo de Riesgos", estado: "proximamente" },
  { track: "funcional", nivel: 6, titulo: "Contabilidad", estado: "proximamente" },
];

export const FORMACION_BASE = "/team-hub/formacion/";
export const PROGRESO_EQUIPO = FORMACION_BASE + "equipo-formaciones.html";

export const isDisponible = (f) => f.estado === "disponible";
export const hrefDe = (f) => (isDisponible(f) ? FORMACION_BASE + f.archivo : null);
