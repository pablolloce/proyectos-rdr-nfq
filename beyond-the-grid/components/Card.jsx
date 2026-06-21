"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useLinks } from "@/lib/links";

// Acentos BBVA (claros) usados como TINTE/glow sobre el cristal oscuro.
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

function rgba(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const BASE =
  "group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-md";

/**
 * Tarjeta de CRISTAL (glassmorphism):
 *   - superficie translúcida -> deja ver el 3D de fondo como resplandor.
 *   - el color de acento se usa como tinte de fondo, borde y glow al hover.
 *   - tilt 3D + spotlight que siguen al ratón (Framer Motion).
 * Texto en Sand (legible sobre Midnight); el acento da el toque de color.
 */
export default function Card({ card }) {
  const { getUrl, copyLink } = useLinks();
  const accent = COLORS[card.color] || COLORS.serene;

  // Tilt + posición del spotlight (sin re-render).
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${px}% ${py}%, ${rgba(accent, 0.35)}, transparent 65%)`;

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ry.set((x - 0.5) * 8);
    rx.set(-(y - 0.5) * 8);
    px.set(x * 100);
    py.set(y * 100);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
    px.set(50);
    py.set(50);
  }

  const common = {
    "data-hover": true,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    className: BASE,
    style: {
      backgroundColor: rgba(accent, 0.1),
      borderColor: rgba(accent, 0.35),
      color: SAND,
      rotateX: srx,
      rotateY: sry,
      transformPerspective: 700,
    },
    whileHover: {
      scale: 1.02,
      backgroundColor: rgba(accent, 0.18),
      boxShadow: `0 14px 40px -12px ${rgba(accent, 0.55)}`,
    },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  };

  const Spot = (
    <motion.span
      aria-hidden
      style={{ background: spotlight }}
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
  );

  const Head = (
    <>
      {card.phase && (
        <p className="relative text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
          {card.phase}
        </p>
      )}
      <h3 className="relative font-display text-xl font-bold leading-tight text-sand">{card.title}</h3>
      <p className="relative line-clamp-2 text-sm leading-snug text-sand/65">{card.desc}</p>
    </>
  );

  const Action = ({ label, arrow }) => (
    <div
      className="relative mt-auto flex items-center justify-between pt-2 text-xs font-bold uppercase tracking-wider"
      style={{ color: accent }}
    >
      <span>{label}</span>
      <span aria-hidden className="text-base transition-transform group-hover:translate-x-1">
        {arrow}
      </span>
    </div>
  );

  // --- Tarjeta múltiple (pills) ---
  if (card.pills) {
    const pillStyle = { borderColor: rgba(accent, 0.5), color: SAND };
    const pillCls =
      "pill inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors hover:bg-white/10";
    return (
      <motion.div {...common}>
        {Spot}
        {Head}
        <div className="relative mt-auto flex flex-wrap gap-2 pt-2">
          {card.pills.map((p) =>
            p.open ? (
              <a key={p.label} data-hover href={getUrl(p.open) || "#"} target="_blank" rel="noopener noreferrer" className={pillCls} style={pillStyle}>
                <span>{p.label}</span>
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <button key={p.label} data-hover type="button" onClick={() => copyLink(p.copy)} className={pillCls} style={pillStyle}>
                <span>{p.label}</span>
                <span aria-hidden>⧉</span>
              </button>
            )
          )}
        </div>
      </motion.div>
    );
  }

  // --- Enlace interno a subpágina estática ---
  if (card.href) {
    return (
      <motion.a {...common} href={card.href}>
        {Spot}
        {Head}
        <Action label="Abrir" arrow="→" />
      </motion.a>
    );
  }

  // --- Enlace externo (URL de links.json) ---
  if (card.open) {
    return (
      <motion.a {...common} href={getUrl(card.open) || "#"} target="_blank" rel="noopener noreferrer">
        {Spot}
        {Head}
        <Action label="Abrir" arrow="↗" />
      </motion.a>
    );
  }

  // --- Copiar URL de links.json ---
  return (
    <motion.button {...common} type="button" onClick={() => copyLink(card.copy)}>
      {Spot}
      {Head}
      <Action label="Copiar enlace" arrow="⧉" />
    </motion.button>
  );
}
