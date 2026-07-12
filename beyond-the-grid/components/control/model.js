// Modelo del Control RDR — lógica y datos portados 1:1 de public/control.html
// (fuente de verdad funcional). Todo es puro: sin React ni DOM.

/* ---------- números y formato ---------- */
export const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return isNaN(n) ? 0 : n;
};

export const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
export const pct = (v) => (v == null ? "—" : (v * 100).toFixed(1) + "%");
export const h = (v) => Math.round(num(v)).toLocaleString("es-ES") + " h";

/* ---------- rentabilidad objetivo ponderada NFQ/NTER ---------- */
export function rentObjetivoTotal(cN, cT, oN = 0.25, oT = 0.2) {
  const t = cN + cT;
  if (!t) return 0;
  return (cN / t) * oN + (cT / t) * oT;
}

/* ---------- "Vista activa": oculta lo cerrado de Qs anteriores ---------- */
export const curQ = () => {
  const d = new Date();
  return d.getFullYear() + "Q" + (Math.floor(d.getMonth() / 3) + 1);
};
export const esCerrado = (s) => {
  s = String(s || "").toLowerCase();
  return s.indexOf("final") >= 0 || s.indexOf("cancel") >= 0 || s.indexOf("rechaz") >= 0;
};
// activo (cualquier Q) o cerrado del Q actual
export const vistaActivaOk = (estado, q, cq) => !esCerrado(estado) || q === cq;

/* ---------- tarifa por Q con fallback a año / valor por defecto ---------- */
export function pickTarifa(data, q) {
  const t = (data && data.tarifas) || {};
  return t[q] || t[String(q).slice(0, 4)] || t["2026"] || 51.22;
}

/* ---------- DEMO: snapshot de respaldo si no hay backend ---------- */
export const DEMO = {
  tarifas: { "2026Q1": 52.8, 2026: 51.22, 2025: 51.87 },
  ejecucion: {
    qColumns: ["2026Q1", "2026Q2", "2026Q3"],
    totalesHorasQ: { "2026Q1": 4200, "2026Q2": 3500, "2026Q3": 1200 },
    records: [
      { row: 6, data: { Proyecto: "Maestro de Emisiones", "2026Q2": 800, "2026Q3": 0 } },
      { row: 7, data: { Proyecto: "OTC Fase IV", "2026Q2": 400, "2026Q3": 200 } },
      { row: 8, data: { Proyecto: "Migración Midas", "2026Q2": 300, "2026Q3": 600 } },
    ],
  },
  economico: {
    bloques: [
      {
        q: "2026Q2",
        rentObjetivoNFQ: 0.25,
        rentObjetivoNTER: 0.2,
        personas: [
          { equipo: "NFQ", nombre: "Bello Gonzalez, Luis", costeHora: 15.2, horasTeoricas: [171, 168, 186], dedicacion: [1, 1, 1], ausencias: [0, 0, 0] },
          { equipo: "NFQ", nombre: "Montero Nuñez, Ángela", costeHora: 53.7, horasTeoricas: [171, 162, 186], dedicacion: [1, 1, 1], ausencias: [0, 0, 18] },
          { equipo: "NFQ", nombre: "Llorente Cerezuela, Pablo", costeHora: 32.0, horasTeoricas: [171, 162, 186], dedicacion: [1, 1, 1], ausencias: [0, 0, 0] },
          { equipo: "NTER", nombre: "Rodriguez Paez, Jose Luis", costeHora: 60.3, horasTeoricas: [171, 162, 186], dedicacion: [1, 1, 1], ausencias: [0, 0, 0] },
          { equipo: "NTER", nombre: "Fernandez Garrido, Veronica", costeHora: 25.8, horasTeoricas: [171, 162, 186], dedicacion: [1, 1, 1], ausencias: [0, 0, 0] },
        ],
      },
      {
        q: "2026Q3",
        rentObjetivoNFQ: 0.25,
        rentObjetivoNTER: 0.2,
        personas: [
          { equipo: "NFQ", nombre: "Bello Gonzalez, Luis", costeHora: 15.2, horasTeoricas: [138, 126, 177], dedicacion: [1, 1, 1], ausencias: [0, 66, 33] },
          { equipo: "NFQ", nombre: "Montero Nuñez, Ángela", costeHora: 53.7, horasTeoricas: [138, 126, 186], dedicacion: [1, 1, 1], ausencias: [78, 30, 0] },
          { equipo: "NFQ", nombre: "Llorente Cerezuela, Pablo", costeHora: 32.0, horasTeoricas: [138, 126, 186], dedicacion: [1, 1, 1], ausencias: [30, 30, 0] },
          { equipo: "NTER", nombre: "Rodriguez Paez, Jose Luis", costeHora: 60.3, horasTeoricas: [138, 126, 186], dedicacion: [0.5, 0.5, 0.5], ausencias: [48, 36, 33] },
        ],
      },
    ],
  },
  capacidad: {
    bloques: [
      {
        q: "2026Q3",
        horasQ: 360,
        equipos: [
          { lider: "Pablo", miembros: ["Pablo", "Iker", "Juanlu"], horasEquipo: 1080 },
          { lider: "Marta", miembros: ["Marta", "Laura"], horasEquipo: 720 },
        ],
        proyectos: [
          { nombre: "Eventos Corporativos 26Q3", horas: 150, asignaciones: [{ rol: "responsable", persona: "Pablo", pct: 0.05 }, { rol: "ejecutor", persona: "Iker", pct: 0.25 }] },
          { nombre: "Migración Midas 26Q3", horas: 550, asignaciones: [{ rol: "responsable", persona: "Marta", pct: 0.2 }, { rol: "ejecutor", persona: "Laura", pct: 0.65 }] },
          { nombre: "Adopción IA RDR", horas: 390, asignaciones: [{ rol: "responsable", persona: "Pablo", pct: 0.4 }, { rol: "ejecutor", persona: "Juanlu", pct: 0.7 }] },
        ],
        capacidadPersona: [
          { persona: "Pablo", capacidad: 1.1 },
          { persona: "Iker", capacidad: 0.92 },
          { persona: "Marta", capacidad: 0.77 },
          { persona: "Laura", capacidad: 0.99 },
        ],
      },
    ],
  },
  iniciativas: [
    { data: { Estado: "Finalizado", "Q facturación": "2026Q1", "Código Pedido": "8542254162", Detalle: "SDATOOL-46848 Institutional Clients", "Horas propuesta": 205, "Estado facturación": "Cobrada", "Horas ejecutadas": 205, "¿Ejecutado?": "Finalizado" } },
    { data: { Estado: "En curso", "Q facturación": "2026Q2", "Código Pedido": "-", Detalle: "SDATOOL-51125 Migración Midas 26Q2", "Horas propuesta": 1325, "Estado facturación": "Bolsa horas", "Horas ejecutadas": 600, "¿Ejecutado?": "En curso" } },
    { data: { Estado: "Finalizado", "Q facturación": "2026Q2", "Código Pedido": "8542284285", Detalle: "OTC Fase IV 26Q2", "Horas propuesta": 400, "Estado facturación": "Cobrada", "Horas ejecutadas": 400, "¿Ejecutado?": "Finalizado" } },
    { data: { Estado: "Cancelado", "Q facturación": "2026Q2", "Código Pedido": "-", Detalle: "Estimación descartada", "Horas propuesta": 150, "Estado facturación": "-", "Horas ejecutadas": 0, "¿Ejecutado?": "Cancelado" } },
  ],
  bolsa: [
    { responsable: "Daría Gonzalez", proyecto: "Cambio Peticiones XMAS", horasAdelantadas: 168, restante: 66, consumos: [{ detalle: "Modificación Conexión XMAS", horas: 42 }, { detalle: "Estimación Q1 CSVToXML", horas: 60 }] },
    { responsable: "Alejandro García", proyecto: "Sec. Finance MMF BRS", horasAdelantadas: 99, restante: 0, consumos: [{ detalle: "Análisis Instrucciones liquidación", horas: 3 }] },
  ],
  adelantos: [
    { responsable: "Alejandro García", proyecto: "SDATOOL-48154 OSI Gobierno Riesgo", horasAdelantadas: 310, restante: 0, importe: 0, consumos: [{ proyecto: "AFIIR Alta emisores", horas: 55 }, { proyecto: "CTM Colombia Q4", horas: 165 }, { proyecto: "BSI 2.0 Impact", horas: 90 }] },
    { responsable: "Pablo Rodríguez", proyecto: "SDATOOL-53765 Life Global", horasAdelantadas: 274, restante: 54, importe: 2851.2, consumos: [{ proyecto: "Desarrollos pendientes", horas: 220 }] },
  ],
  encuestasQ4: [
    { data: { "Código de proyecto/servicio": "SDATOOL-46848", "NOMBRE DEL PROYECTO/SERVICIO": "Institutional Clients: Onboarding", "SATISFACCIÓN ENTREGA": 10, "CONSIGUE RESULTADOS": 10, "CONOCIMIENTO TÉCNICO ADECUADO": 10, "CALIDAD TOTAL NUEVA": 10 } },
    { data: { "Código de proyecto/servicio": "SDATOOL-34546", "NOMBRE DEL PROYECTO/SERVICIO": "Calypso Back-Office OTC España", "SATISFACCIÓN ENTREGA": 9, "CONSIGUE RESULTADOS": 10, "CONOCIMIENTO TÉCNICO ADECUADO": 9, "CALIDAD TOTAL NUEVA": 9 } },
  ],
};
