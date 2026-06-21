"use client";

import { useLinks } from "@/lib/links";

// Paleta de acentos BBVA. Sobre cualquier acento, el texto va en Electric Blue.
const COLORS = {
  serene: "#85C8FF",
  lime: "#88E783",
  sand: "#F7F8F8",
  aqua: "#8BE1E9",
  purple: "#9694FF",
  mandarin: "#FFB56B",
  canary: "#FFE761",
};
const TEXT = "#001391"; // Electric Blue

const BASE =
  "group flex h-full flex-col gap-3 rounded-2xl p-6 text-left transition-transform duration-300 hover:-translate-y-1";

/**
 * Tarjeta del hub. Según los datos se comporta como:
 *   href  -> enlace interno a subpágina estática (.html en public/)
 *   open  -> enlace externo cuya URL sale de links.json (pestaña nueva)
 *   copy  -> botón que copia al portapapeles la URL de links.json
 *   pills -> tarjeta múltiple con mini-botones (copy/open)
 */
export default function Card({ card }) {
  const { getUrl, copyLink } = useLinks();
  const style = { backgroundColor: COLORS[card.color] || COLORS.sand, color: TEXT };

  const Head = (
    <>
      {card.phase && (
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{card.phase}</p>
      )}
      <h3 className="font-display text-2xl font-bold leading-tight">{card.title}</h3>
      <p className="text-sm leading-relaxed opacity-80">{card.desc}</p>
    </>
  );

  const Action = ({ label, arrow }) => (
    <div className="mt-auto flex items-center justify-between pt-2 text-sm font-bold uppercase tracking-wider">
      <span>{label}</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-1">{arrow}</span>
    </div>
  );

  // --- Tarjeta múltiple (pills) ---
  if (card.pills) {
    const pillCls =
      "pill inline-flex items-center gap-2 rounded-full border border-[#001391]/30 px-4 py-2 text-xs font-bold transition-colors hover:bg-black/5";
    return (
      <div className={BASE} style={style}>
        {Head}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {card.pills.map((p) =>
            p.open ? (
              <a
                key={p.label}
                data-hover
                href={getUrl(p.open) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={pillCls}
              >
                <span>{p.label}</span>
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <button key={p.label} data-hover type="button" onClick={() => copyLink(p.copy)} className={pillCls}>
                <span>{p.label}</span>
                <span aria-hidden>⧉</span>
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  // --- Enlace interno a subpágina estática ---
  if (card.href) {
    return (
      <a data-hover href={card.href} className={BASE} style={style}>
        {Head}
        <Action label="Abrir" arrow="→" />
      </a>
    );
  }

  // --- Enlace externo (URL de links.json) ---
  if (card.open) {
    return (
      <a data-hover href={getUrl(card.open) || "#"} target="_blank" rel="noopener noreferrer" className={BASE} style={style}>
        {Head}
        <Action label="Abrir" arrow="↗" />
      </a>
    );
  }

  // --- Copiar URL de links.json ---
  return (
    <button data-hover type="button" onClick={() => copyLink(card.copy)} className={BASE} style={style}>
      {Head}
      <Action label="Copiar enlace" arrow="⧉" />
    </button>
  );
}
