"use client";

import { motion } from "framer-motion";
import Card from "./Card";

/**
 * Contenido REAL del hub (3 secciones + tarjetas). Editar aquí = editar el hub.
 * Las URLs externas viven en public/links/links.json.
 */
const SECTIONS = [
  {
    num: "01",
    title: "Formaciones",
    cards: [
      { color: "serene", phase: "Welcome · Fase 1", title: "¿Qué es RDR?", desc: "Definición, entidades, arquitectura y ecosistema. Punto de partida.", href: "que-es-rdr.html" },
      { color: "lime", phase: "Welcome · Fase 2", title: "HUB Formativo", desc: "Plan de capacitación técnica y funcional para el equipo RDR.", href: "rdr-formacion.html" },
      { color: "sand", phase: "Portal interno", title: "Portal BBVA CIB", desc: "Acceso al portal del equipo. Pulsa para copiar el enlace.", copy: "portalBBVACIB" },
    ],
  },
  {
    num: "02",
    title: "Equipo RDR",
    cards: [
      { color: "aqua", phase: "Política y calendario", title: "Vacaciones RDR", desc: "Política, calendario y coordinación de días libres del equipo.", href: "vacaciones.html" },
      { color: "purple", phase: "Reporte de horas", title: "Time Report", desc: "Imputación semanal de tiempos para BBVA y NFQ.", pills: [{ label: "BBVA", copy: "timeReportBBVA" }, { label: "NFQ", open: "timeReportNFQ" }] },
      { color: "mandarin", phase: "Mejora continua", title: "Retrospectiva", desc: "Aprendizajes, decisiones técnicas y áreas de mejora del proyecto.", href: "retro.html" },
      { color: "canary", phase: "Comidas de los jueves", title: "Comidas RDR", desc: "Vota el restaurante del jueves y coordínate con el equipo.", href: "comidas.html" },
    ],
  },
  {
    num: "03",
    title: "Proyectos RDR",
    cards: [
      { color: "serene", phase: "Planificación", title: "Planificación RDR", desc: "Planificación de proyectos y asignación del equipo RDR-NFQ.", open: "planificacionNFQ" },
      { color: "canary", phase: "Operativa", title: "Pases Calendados", desc: "Planificación de releases y trazabilidad de despliegues por entorno.", href: "pases-calendados.html" },
      { color: "sand", phase: "Recursos BBVA", title: "Drive y Repositorio", desc: "Documentación compartida en Drive y código fuente en GitHub BBVA.", pills: [{ label: "Drive BBVA", copy: "driveBBVA" }, { label: "GitHub BBVA", copy: "githubBBVA" }] },
    ],
  },
];

// Entrada escalonada al montar (sin scroll): todo accesible al instante.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

export default function HubSections() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 content-start gap-x-5 gap-y-6 px-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 lg:content-stretch"
    >
      {SECTIONS.map((section) => (
        <section key={section.num} className="flex min-h-0 flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-sm font-bold text-serene">{section.num}</span>
            <h2 className="font-display text-xl font-bold text-sand">{section.title}</h2>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {section.cards.map((card) => (
              <motion.div key={card.title} variants={item} className="flex-1">
                <Card card={card} />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </motion.div>
  );
}
