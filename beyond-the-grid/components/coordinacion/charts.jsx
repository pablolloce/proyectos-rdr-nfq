"use client";

// Gráficas ligeras de Coordinación (sin librerías): barras verticales en divs
// y donut SVG. Los COLORES de serie son superficies sólidas con el hex BBVA
// literal (convención del repo: idénticos en ambos temas); los textos usan
// utilidades temadas (text-sand) para ser legibles en claro y oscuro.
import { rgba } from "@/lib/ui";

/* Barras horizontales compactas, en 2 columnas a partir de sm.
   Con 20+ personas los nombres bajo barras verticales no se leen; aquí cada
   fila lleva el nombre completo (truncado con tooltip), su barra con la marca
   del 100 % y el valor. items: [{ label, value, hex, title }]. */
export function BarList({ items, max = 120, linea = 100, unidad = "%" }) {
  if (!items || !items.length) return null;
  const M = Math.max(max, ...items.map((i) => i.value));
  const marca = linea != null ? Math.min(100, (linea / M) * 100) : null;
  return (
    <div>
      <ul className="grid gap-x-7 gap-y-2 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2.5" title={it.title || `${it.label}: ${Math.round(it.value)}${unidad}`}>
            <span className="w-[124px] shrink-0 truncate text-[11.5px] leading-tight text-sand/80">{it.label}</span>
            <div className="relative h-2.5 min-w-0 flex-1 rounded-full bg-white/10">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${Math.max(1.5, Math.min(100, (it.value / M) * 100))}%`,
                  backgroundColor: it.hex,
                  boxShadow: `0 0 0 1px ${rgba(it.hex, 0.35)}`,
                }}
                role="img"
                aria-label={`${it.label}: ${Math.round(it.value)}${unidad}`}
              />
              {marca != null && (
                <span
                  aria-hidden
                  className="absolute inset-y-[-2px] w-0 border-l border-dashed border-white/35"
                  style={{ left: `${marca}%` }}
                />
              )}
            </div>
            <span className="w-11 shrink-0 text-right text-[11px] font-bold tabular-nums text-sand/85">
              {Math.round(it.value)}{unidad}
            </span>
          </li>
        ))}
      </ul>
      {linea != null && (
        <p className="mt-2 text-right text-[9.5px] text-sand/40">┆ marca del {linea}{unidad}</p>
      )}
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
