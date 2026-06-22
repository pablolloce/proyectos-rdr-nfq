"use client";

import { motion } from "framer-motion";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";

const COLORS = {
  serene: "#85C8FF",
  lime: "#88E783",
  sand: "#F7F8F8",
  aqua: "#8BE1E9",
  purple: "#9694FF",
  mandarin: "#FFB56B",
  canary: "#FFE761",
};

function rgba(hex, a) {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

/**
 * Enlaces del hub aplanados en "chips" (1 acción por chip). Editar aquí = editar
 * el hub. URLs externas en public/links/links.json.
 */
const SECTIONS = [
  {
    num: "01",
    title: "Formaciones",
    items: [
      { color: "serene", label: "¿Qué es RDR?", href: "que-es-rdr.html" },
      { color: "lime", label: "HUB Formativo", href: "rdr-formacion.html" },
      { color: "sand", label: "Portal BBVA CIB", copy: "portalBBVACIB" },
    ],
  },
  {
    num: "02",
    title: "Equipo RDR",
    items: [
      { color: "aqua", label: "Vacaciones", href: "vacaciones.html" },
      { color: "purple", label: "Time Report · BBVA", copy: "timeReportBBVA" },
      { color: "purple", label: "Time Report · NFQ", open: "timeReportNFQ" },
      { color: "mandarin", label: "Retrospectiva", href: "retro.html" },
      { color: "canary", label: "Comidas", href: "comidas.html" },
    ],
  },
  {
    num: "03",
    title: "Proyectos RDR",
    items: [
      { color: "serene", label: "Planificación", open: "planificacionNFQ" },
      { color: "canary", label: "Pases Calendados", href: "pases-calendados.html" },
      { color: "sand", label: "Drive BBVA", copy: "driveBBVA" },
      { color: "sand", label: "GitHub BBVA", copy: "githubBBVA" },
    ],
  },
];

/** Chip de cristal flotante. Acción: → interno · ↗ externo · ⧉ copiar. */
function Chip({ item, delay }) {
  const { getUrl, copyLink } = useLinks();
  const accent = COLORS[item.color] || COLORS.serene;
  const arrow = item.copy ? "⧉" : item.open ? "↗" : "→";

  const props = {
    "data-hover": true,
    className:
      "group inline-flex items-center gap-3 rounded-full border px-6 py-3.5 shadow-lg transition-colors",
    // Cristal oscuro Midnight (sin backdrop-blur -> sin coste por frame).
    style: { borderColor: rgba(accent, 0.45), backgroundColor: "rgba(10, 18, 74, 0.72)" },
    // Entrada + flotación continua (cada chip con su fase via delay).
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, y: [0, -5, 0] },
    transition: {
      opacity: { duration: 0.5, delay },
      scale: { duration: 0.4, delay },
      y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay },
    },
    whileHover: {
      scale: 1.06,
      backgroundColor: "rgba(10, 18, 74, 0.85)",
      boxShadow: `0 12px 30px -8px ${rgba(accent, 0.5)}`,
    },
  };

  const inner = (
    <>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <span className="font-display text-base font-bold text-sand md:text-lg">{item.label}</span>
      <span aria-hidden className="text-base transition-transform group-hover:translate-x-0.5" style={{ color: accent }}>
        {arrow}
      </span>
    </>
  );

  if (item.href) return <motion.a {...props} href={item.href}>{inner}</motion.a>;
  if (item.open)
    return (
      <motion.a {...props} href={getUrl(item.open) || "#"} target="_blank" rel="noopener noreferrer">
        {inner}
      </motion.a>
    );
  return (
    <motion.button {...props} type="button" onClick={() => copyLink(item.copy)}>
      {inner}
    </motion.button>
  );
}

// Sección solo para coordinadores (coordinador:true en equipo.json).
const COORD_SECTION = {
  num: "04",
  title: "Coordinación",
  items: [{ color: "purple", label: "Control RDR", href: "control.html" }],
};

export default function LinkCloud() {
  const { isCoordinador } = useAuth();
  const sections = isCoordinador ? [...SECTIONS, COORD_SECTION] : SECTIONS;
  let i = 0;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-7 px-6">
      {sections.map((section) => (
        <div key={section.num} className="flex max-w-3xl flex-col items-center gap-3">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-serene/80">
            <span className="text-serene/40">{section.num}</span> · {section.title}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {section.items.map((item) => (
              <Chip key={item.label} item={item} delay={i++ * 0.08} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
