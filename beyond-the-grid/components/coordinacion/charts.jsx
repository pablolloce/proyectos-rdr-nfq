"use client";

// Gráficas ligeras de Coordinación (sin librerías): barras verticales en divs
// y donut SVG. Los COLORES de serie son superficies sólidas con el hex BBVA
// literal (convención del repo: idénticos en ambos temas); los textos usan
// utilidades temadas (text-sand) para ser legibles en claro y oscuro.
import { rgba } from "@/lib/ui";

/* Barras verticales. items: [{ label, short, value, hex, title }]
   `linea` pinta una referencia discontinua (p.ej. 100 %). */
export function BarChart({ items, max = 120, linea = 100, unidad = "%", alto = 150 }) {
  if (!items || !items.length) return null;
  const M = Math.max(max, ...items.map((i) => i.value));
  return (
    <div>
      <div className="relative" style={{ height: alto }}>
        {linea != null && (
          <div
            aria-hidden
            className="absolute inset-x-0 border-t border-dashed border-white/30"
            style={{ bottom: `${(linea / M) * 100}%` }}
          >
            <span className="absolute -top-2 right-0 text-[9px] tabular-nums text-sand/40">{linea}{unidad}</span>
          </div>
        )}
        <div className="flex h-full items-end gap-1.5">
          {items.map((it, i) => (
            <div key={i} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end" title={it.title || it.label}>
              <span className="mb-0.5 text-[9px] font-bold tabular-nums text-sand/70">{Math.round(it.value)}{unidad}</span>
              <div
                className="w-full max-w-[38px] rounded-t-md transition-all"
                style={{ height: `${Math.max(2, (it.value / M) * 100)}%`, backgroundColor: it.hex, boxShadow: `0 0 0 1px ${rgba(it.hex, 0.4)}` }}
                role="img"
                aria-label={`${it.label}: ${Math.round(it.value)}${unidad}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex gap-1.5">
        {items.map((it, i) => (
          <span key={i} className="min-w-0 flex-1 truncate text-center text-[9px] leading-tight text-sand/55" title={it.title || it.label}>
            {it.short || it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Donut SVG. segments: [{ label, value, hex }] · centro/sub: texto central. */
export function Donut({ segments, centro, sub, size = 168 }) {
  const total = (segments || []).reduce((a, s) => a + s.value, 0);
  const R = 40;
  const C = 2 * Math.PI * R;
  let acum = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={centro ? `${centro} — ${sub || ""}` : "Distribución"}>
          <circle cx="50" cy="50" r={R} fill="none" className="stroke-white/10" strokeWidth="12" />
          {total > 0 &&
            segments.filter((s) => s.value > 0).map((s, i) => {
              const frac = s.value / total;
              const el = (
                <circle
                  key={i}
                  cx="50" cy="50" r={R} fill="none"
                  stroke={s.hex} strokeWidth="12" strokeLinecap="butt"
                  strokeDasharray={`${frac * C} ${C}`}
                  strokeDashoffset={-acum * C}
                  transform="rotate(-90 50 50)"
                />
              );
              acum += frac;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl font-bold tabular-nums text-sand">{centro}</p>
            {sub && <p className="text-[10px] text-sand/55">{sub}</p>}
          </div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {(segments || []).map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-[12px] text-sand/80">
            <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.hex }} />
            <span className="min-w-0">{s.label}</span>
            <span className="ml-auto pl-3 font-bold tabular-nums text-sand">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
