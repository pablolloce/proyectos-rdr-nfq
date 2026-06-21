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

/**
 * Tarjeta del hub. Según los datos que reciba se comporta como:
 *   - href  -> enlace interno a una subpágina estática (.html en public/)
 *   - open  -> enlace externo cuya URL sale de links.json (abre en pestaña nueva)
 *   - copy  -> botón que copia al portapapeles la URL de links.json
 *   - pills -> tarjeta múltiple con varios mini-botones (copy/open)
 */
export default function Card({ card }) {
  const { getUrl, copyLink } = useLinks();
  const bg = COLORS[card.color] || COLORS.sand;
  const base =
    "card group flex flex-col gap-3 rounded-2xl p-6 text-left transition-transform duration-300 will-change-transform hover:-translate-y-1";
  const style = { backgroundColor: bg, color: TEXT };

  const Head = (
    <>
      {card.phase && (
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">
          {card.phase}
        </p>
      )}
      <h3 className="font-display text-2xl font-bold leading-tight">{card.title}</h3>
      <p className="text-sm leading-relaxed opacity-80">{card.desc}</p>
    </>
  );

  const Action = ({ label, arrow }) => (
    <div className="mt-2 flex items-center justify-between text-sm font-bold uppercase tracking-wider">
      <span>{label}</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-1">
        {arrow}
      </span>
    </div>
  );

  // --- Tarjeta múltiple (pills) ---
  if (card.pills) {
    return (
      <div data-card className="card" style={style}>
        <div className={base.replace("hover:-translate-y-1", "")}>
          {Head}
          <div className="mt-2 flex flex-wrap gap-2">
            {card.pills.map((p) => {
              const inner = (
                <>
                  <span>{p.label}</span>
                  <span aria-hidden>{p.open ? "↗" : "⧉"}</span>
                </>
              );
              const pillCls =
                "pill inline-flex items-center gap-2 rounded-full border border-current/30 px-4 py-2 text-xs font-bold transition-colors hover:bg-black/5";
              if (p.open) {
                const url = getUrl(p.open);
                return (
                  <a
                    key={p.label}
                    data-hover
                    href={url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={pillCls}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <button
                  key={p.label}
                  data-hover
                  type="button"
                  onClick={() => copyLink(p.copy)}
                  className={pillCls}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Enlace interno a subpágina estática ---
  if (card.href) {
    return (
      <a data-card data-hover href={card.href} className={base} style={style}>
        {Head}
        <Action label="Abrir" arrow="→" />
      </a>
    );
  }

  // --- Enlace externo (abre URL de links.json) ---
  if (card.open) {
    const url = getUrl(card.open);
    return (
      <a
        data-card
        data-hover
        href={url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        style={style}
      >
        {Head}
        <Action label="Abrir" arrow="↗" />
      </a>
    );
  }

  // --- Copiar URL de links.json ---
  return (
    <button
      data-card
      data-hover
      type="button"
      onClick={() => copyLink(card.copy)}
      className={base}
      style={style}
    >
      {Head}
      <Action label="Copiar enlace" arrow="⧉" />
    </button>
  );
}
