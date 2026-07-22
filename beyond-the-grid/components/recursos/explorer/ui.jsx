"use client";

import { useCallback } from "react";
import { rgba } from "@/lib/ui";
import { useAccentMap, useTheme } from "@/lib/theme";
import { RED, RED_LIGHT, C, cxColor, splitWf, wfTagStyle } from "./lib";
import { CATEGORIA_MAP } from "./categorias";

/* Primitivas visuales compartidas del Process Explorer.
   Convención del repo: hex ORIGINAL para tintes (fondos/bordes rgba) y
   useAccentMap para el COLOR DE TEXTO (legible en ambos temas). El rojo de
   errores no está en LIGHT_EQ, así que se oscurece aquí para el modo claro. */

export function useAcc() {
  const acc = useAccentMap();
  const { theme } = useTheme();
  return useCallback(
    (hex) => (hex === RED ? (theme === "light" ? RED_LIGHT : RED) : acc(hex)),
    [acc, theme]
  );
}

/* Etiqueta pequeña (wt-* del original). strong = con borde; dim = atenuada. */
export function Tag({ hex, strong, dim, className = "", children }) {
  const acc = useAcc();
  return (
    <span
      className={`inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${dim ? "opacity-75" : ""} ${className}`}
      style={{
        color: acc(hex),
        backgroundColor: rgba(hex, strong ? 0.14 : 0.09),
        border: `1px solid ${rgba(hex, strong ? 0.3 : 0)}`,
      }}
    >
      {children}
    </span>
  );
}

/* Píldora de CATEGORÍA funcional (taxonomía de ./categorias.js). Mismo
   patrón de color que Tag/TypePill: tinte rgba con el hex original (idéntico
   en ambos temas) y texto vía useAcc (legible en claro y oscuro). */
export function CatPill({ id, className = "" }) {
  const acc = useAcc();
  const c = CATEGORIA_MAP[id];
  if (!c) return null;
  return (
    <span
      title={c.desc}
      className={`inline-block max-w-full truncate whitespace-nowrap rounded-full px-2 py-0.5 text-[9.5px] font-bold leading-4 tracking-wide ${className}`}
      style={{ color: acc(c.color), backgroundColor: rgba(c.color, 0.12), border: `1px solid ${rgba(c.color, 0.28)}` }}
    >
      {c.nombre}
    </span>
  );
}

/* Píldora de tipología (tg-* del original: BATCH / ONLINE / PUBLICACIÓN / cola). */
export function TypePill({ hex, children }) {
  const acc = useAcc();
  return (
    <span
      className="inline-block max-w-full truncate rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ color: acc(hex), backgroundColor: rgba(hex, 0.12), border: `1px solid ${rgba(hex, 0.25)}` }}
    >
      {children}
    </span>
  );
}

/* Complejidad ALTA/MEDIA/BAJA como texto coloreado (cxCls original). */
export function CxText({ cx, className = "" }) {
  const acc = useAcc();
  if (!cx) return null;
  return (
    <span className={`text-[10px] font-bold ${className}`} style={{ color: acc(cxColor(cx)) }}>
      {cx}
    </span>
  );
}

/* Panel de código/metadatos (cd del original), estilo CmdDrawer: inset oscuro
   en tema oscuro, panel claro con borde en tema claro. */
export function CodePanel({ className = "", children }) {
  const { theme } = useTheme();
  const bg = theme === "light" ? "bg-white/[0.07] border-white/15" : "bg-black/30 border-white/10";
  return <div className={`rounded-xl border ${bg} px-3.5 py-3 ${className}`}>{children}</div>;
}

/* Fila clave→valor dentro de un CodePanel (rw/k/v del original). */
export function InfoRow({ k, hex, children }) {
  const acc = useAcc();
  return (
    <div className="grid grid-cols-[86px,1fr] items-baseline gap-x-2 gap-y-1 py-0.5 text-[12px]">
      <span className="whitespace-nowrap font-bold text-sand/55">{k}</span>
      <span className="min-w-0 break-words font-mono text-[11.5px]" style={hex ? { color: acc(hex) } : undefined}>
        {children}
      </span>
    </div>
  );
}

/* Flujo de contenido del workflow (wfTags original): "Flujo  A → B → C". */
export function WfFlow({ s }) {
  if (!s || s === "Dummy/Empty") return null;
  const parts = splitWf(s);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      <span className="mr-1 text-[10px] font-bold text-sand/55">Flujo</span>
      {parts.map((t, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1">
          {i > 0 && <span aria-hidden className="text-[9px] text-sand/40">→</span>}
          <Tag {...wfTagStyle(t)}>{t}</Tag>
        </span>
      ))}
    </div>
  );
}

/* Cadena de sub-workflows (subC original): chips violeta unidos por flechas. */
export function ChainChips({ s, sep = "→" }) {
  if (!s) return null;
  const parts = Array.isArray(s) ? s : s.split(" > ");
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {parts.map((w, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-[9px] text-sand/40">{sep}</span>}
          <Tag hex={C.purple} className="max-w-[190px]" strong>
            {String(w).trim()}
          </Tag>
        </span>
      ))}
    </div>
  );
}

/* tags() original: lista CSV → chips de un mismo color (tecnologías, entidades…). */
export function TagList({ s, hex }) {
  if (!s) return null;
  const items = s.split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {items.map((t, i) => (
        <Tag key={i} hex={hex}>{t}</Tag>
      ))}
    </div>
  );
}

/* Paso del timeline (st/sn/vl/sb del original): nodo numerado + raíl vertical. */
export function Step({ n, hex, last, title, badge, sub, children }) {
  const acc = useAcc();
  const nodeStyle = hex
    ? { borderColor: rgba(hex, 0.55), color: acc(hex), backgroundColor: rgba(hex, 0.08) }
    : undefined;
  return (
    <li className="relative grid grid-cols-[40px,1fr] gap-x-3.5">
      {!last && <span aria-hidden className="absolute bottom-0 left-[19px] top-11 w-0.5 rounded bg-white/12" />}
      <span
        aria-hidden
        className={`z-[1] grid h-10 w-10 place-items-center rounded-xl border-2 text-xs font-bold tabular-nums ${hex ? "" : "border-white/15 bg-white/[0.04] text-sand/55"}`}
        style={nodeStyle}
      >
        {n}
      </span>
      <div className={`min-w-0 pt-1.5 ${last ? "pb-1" : "pb-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-words text-[13px] font-bold text-sand">{title}</span>
          {badge && (
            <span className="whitespace-nowrap rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-sand/60">
              {badge}
            </span>
          )}
        </div>
        {sub && <div className="mt-1 break-all font-mono text-[11px] text-sand/60">{sub}</div>}
        {children}
      </div>
    </li>
  );
}

/* Cabecera del panel de detalle (fh del original). */
export function DetailHeader({ title, natural, desc, children }) {
  const acc = useAcc();
  return (
    <header className="mb-6">
      <h2 className="break-words font-display text-xl font-bold leading-snug tracking-tight text-sand">{title}</h2>
      {natural && (
        <p className="mt-1 text-[13px] font-bold" style={{ color: acc(C.aqua) }}>{natural}</p>
      )}
      {desc && <p className="mt-2 max-w-2xl text-pretty text-xs leading-relaxed text-sand/65">{desc}</p>}
      {children && <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-sand/60">{children}</div>}
    </header>
  );
}
