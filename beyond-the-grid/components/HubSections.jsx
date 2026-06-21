"use client";

import Card from "./Card";

/**
 * Contenido REAL del hub RDR, portado del index.html original:
 * 3 secciones (Formaciones, Equipo, Proyectos) con sus tarjetas.
 * Editar aquí = editar el hub. Las URLs externas viven en links/links.json.
 */
const SECTIONS = [
  {
    num: "01",
    title: "Formaciones",
    hint: "Welcome pack y materiales de referencia",
    cards: [
      {
        color: "serene",
        phase: "Welcome · Fase 1",
        title: "¿Qué es RDR?",
        desc: "Definición, entidades, arquitectura y ecosistema. Punto de partida.",
        href: "que-es-rdr.html",
      },
      {
        color: "lime",
        phase: "Welcome · Fase 2",
        title: "HUB Formativo",
        desc: "Plan de capacitación técnica y funcional para el equipo RDR.",
        href: "rdr-formacion.html",
      },
      {
        color: "sand",
        phase: "Portal interno",
        title: "Portal BBVA CIB",
        desc: "Acceso al portal del equipo. Pulsa para copiar el enlace.",
        copy: "portalBBVACIB",
      },
    ],
  },
  {
    num: "02",
    title: "Equipo RDR",
    hint: "Operativa diaria del equipo",
    cards: [
      {
        color: "aqua",
        phase: "Política y calendario",
        title: "Vacaciones RDR",
        desc: "Política, calendario y coordinación de días libres del equipo.",
        href: "vacaciones.html",
      },
      {
        color: "purple",
        phase: "Reporte de horas",
        title: "Time Report",
        desc: "Imputación semanal de tiempos para BBVA y NFQ.",
        pills: [
          { label: "BBVA", copy: "timeReportBBVA" },
          { label: "NFQ", open: "timeReportNFQ" },
        ],
      },
      {
        color: "mandarin",
        phase: "Mejora continua",
        title: "Retrospectiva",
        desc: "Aprendizajes, decisiones técnicas y áreas de mejora del proyecto.",
        href: "retro.html",
      },
      {
        color: "canary",
        phase: "Comidas de los jueves",
        title: "Comidas RDR",
        desc: "Vota el restaurante del jueves y coordínate con el equipo.",
        href: "comidas.html",
      },
    ],
  },
  {
    num: "03",
    title: "Proyectos RDR",
    hint: "Releases, código y documentación",
    cards: [
      {
        color: "serene",
        phase: "Planificación",
        title: "Planificación RDR",
        desc: "Planificación de proyectos y asignación del equipo RDR-NFQ.",
        open: "planificacionNFQ",
      },
      {
        color: "canary",
        phase: "Operativa",
        title: "Pases Calendados",
        desc: "Planificación de releases y trazabilidad de despliegues por entorno.",
        href: "pases-calendados.html",
      },
      {
        color: "sand",
        phase: "Recursos BBVA",
        title: "Drive y Repositorio",
        desc: "Documentación compartida en Drive y código fuente en GitHub BBVA.",
        pills: [
          { label: "Drive BBVA", copy: "driveBBVA" },
          { label: "GitHub BBVA", copy: "githubBBVA" },
        ],
      },
    ],
  },
];

export default function HubSections() {
  return (
    <div className="relative mx-auto max-w-7xl px-6 pb-32">
      {SECTIONS.map((section) => (
        <section key={section.num} className="border-t border-white/10 py-20">
          <div className="mb-10 flex items-baseline gap-4">
            <span className="font-display text-sm font-bold text-white/40">
              {section.num}
            </span>
            <h2
              data-reveal
              className="font-display text-4xl font-bold text-white md:text-6xl"
            >
              {section.title}
            </h2>
            <span className="ml-auto hidden text-xs uppercase tracking-[0.3em] text-white/40 md:block">
              {section.hint}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.cards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
