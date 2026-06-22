"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLinks } from "@/lib/links";

const COLORS = {
  serene: "#85C8FF",
  lime: "#88E783",
  sand: "#F7F8F8",
  aqua: "#8BE1E9",
  purple: "#9694FF",
  mandarin: "#FFB56B",
  canary: "#FFE761",
};
const SAND = "#F7F8F8";

/**
 * Contenido REAL del hub (3 secciones + enlaces). Editar aquí = editar el hub.
 * Las URLs externas viven en public/links/links.json.
 */
const SECTIONS = [
  {
    num: "01",
    title: "Formaciones",
    items: [
      { color: "serene", title: "¿Qué es RDR?", desc: "Definición, entidades y arquitectura.", href: "que-es-rdr.html" },
      { color: "lime", title: "HUB Formativo", desc: "Plan de capacitación del equipo.", href: "rdr-formacion.html" },
      { color: "sand", title: "Portal BBVA CIB", desc: "Portal interno (copiar enlace).", copy: "portalBBVACIB" },
    ],
  },
  {
    num: "02",
    title: "Equipo RDR",
    items: [
      { color: "aqua", title: "Vacaciones RDR", desc: "Política y calendario del equipo.", href: "vacaciones.html" },
      { color: "purple", title: "Time Report", desc: "Imputación semanal de horas.", pills: [{ label: "BBVA", copy: "timeReportBBVA" }, { label: "NFQ", open: "timeReportNFQ" }] },
      { color: "mandarin", title: "Retrospectiva", desc: "Aprendizajes y mejora continua.", href: "retro.html" },
      { color: "canary", title: "Comidas RDR", desc: "Vota el restaurante del jueves.", href: "comidas.html" },
    ],
  },
  {
    num: "03",
    title: "Proyectos RDR",
    items: [
      { color: "serene", title: "Planificación RDR", desc: "Proyectos y asignación del equipo.", open: "planificacionNFQ" },
      { color: "canary", title: "Pases Calendados", desc: "Releases y despliegues por entorno.", href: "pases-calendados.html" },
      { color: "sand", title: "Drive y Repositorio", desc: "Documentación y código fuente.", pills: [{ label: "Drive", copy: "driveBBVA" }, { label: "GitHub", copy: "githubBBVA" }] },
    ],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } } };
const rowVar = { hidden: { opacity: 0, x: 14 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } } };

/** Fila de enlace: punto de color + título + flecha (→ interno · ↗ externo · ⧉ copiar). */
function Row({ item }) {
  const { getUrl, copyLink } = useLinks();
  const accent = COLORS[item.color] || COLORS.serene;
  const [h, setH] = useState(false);

  const Dot = (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full transition-shadow"
      style={{ backgroundColor: accent, boxShadow: h ? `0 0 10px ${accent}` : "none" }}
    />
  );
  const Title = (
    <span className="truncate font-display text-lg font-bold transition-colors md:text-xl" style={{ color: h ? accent : SAND }}>
      {item.title}
    </span>
  );
  const hover = { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false), "data-hover": true, title: item.desc };
  const rowCls = "flex w-full items-center justify-between gap-4 py-3.5";

  // --- Múltiple (pills) ---
  if (item.pills) {
    return (
      <motion.li variants={rowVar} className="border-b border-serene/10">
        <div className={rowCls} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} title={item.desc}>
          <span className="flex min-w-0 items-center gap-3">{Dot}{Title}</span>
          <span className="flex shrink-0 gap-4">
            {item.pills.map((p) =>
              p.open ? (
                <a key={p.label} data-hover href={getUrl(p.open) || "#"} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-wider text-sand/55 transition-colors hover:text-sand">
                  {p.label} ↗
                </a>
              ) : (
                <button key={p.label} data-hover type="button" onClick={() => copyLink(p.copy)} className="text-xs font-bold uppercase tracking-wider text-sand/55 transition-colors hover:text-sand">
                  {p.label} ⧉
                </button>
              )
            )}
          </span>
        </div>
      </motion.li>
    );
  }

  const arrow = item.copy ? "⧉" : item.open ? "↗" : "→";
  const Arrow = (
    <span aria-hidden className="text-lg transition-transform" style={{ color: h ? accent : "rgba(247,248,248,0.45)", transform: h ? "translateX(4px)" : "none" }}>
      {arrow}
    </span>
  );
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-3">{Dot}{Title}</span>
      {Arrow}
    </>
  );

  if (item.href) {
    return (
      <motion.li variants={rowVar} className="border-b border-serene/10">
        <a {...hover} href={item.href} className={rowCls}>{body}</a>
      </motion.li>
    );
  }
  if (item.open) {
    return (
      <motion.li variants={rowVar} className="border-b border-serene/10">
        <a {...hover} href={getUrl(item.open) || "#"} target="_blank" rel="noopener noreferrer" className={rowCls}>{body}</a>
      </motion.li>
    );
  }
  return (
    <motion.li variants={rowVar} className="border-b border-serene/10">
      <button {...hover} type="button" onClick={() => copyLink(item.copy)} className={rowCls}>{body}</button>
    </motion.li>
  );
}

export default function LinkList() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex w-full flex-col gap-7">
      {SECTIONS.map((section) => (
        <div key={section.num}>
          <p className="mb-1 flex items-baseline gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-serene">
            <span className="text-serene/40">{section.num}</span>
            {section.title}
          </p>
          <ul>
            {section.items.map((item) => (
              <Row key={item.title} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </motion.div>
  );
}
