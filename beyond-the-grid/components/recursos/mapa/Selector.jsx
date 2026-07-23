"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { rgba } from "@/lib/ui";
import { C, filterChains, filterOnline } from "../explorer/lib";
import { useAcc } from "../explorer/ui";
import { PROC_HEX } from "./graph";

/* Selector de proceso del Mapa de flujos: overlay con buscador multi-campo
   (mismos filtros que el Process Explorer, importados de explorer/lib) sobre
   las dos familias viajables: cadenas batch y listeners online. La
   publicación no es un proceso: cada cadena termina en su(s) cola(s) de
   publicación dentro del propio flujo.
   En <lg ocupa la pantalla (sheet); en lg+ es un diálogo sobre el canvas. */

const FAMILIES = [
  { id: "all", label: "Todas" },
  { id: "chain", label: "Batch", hex: PROC_HEX.chain },
  { id: "online", label: "Online", hex: PROC_HEX.online },
];

const MAX_SHOWN = 90;

const IconSearch = (p) => (
  <svg width={p.size || 15} height={p.size || 15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);

export default function Selector({ data, onPick, onClose }) {
  const acc = useAcc();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const q = useDeferredValue(query).trim().toLowerCase();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Resultados por familia con los MISMOS filtros multi-campo del explorer. */
  const results = useMemo(() => {
    if (!data) return { chain: [], online: [] };
    const chain = filterChains(data.chains, data.chainsMeta, q)
      .filter((n) => n !== "SIN_CADENA")
      .map((n) => {
        const m = (data.chainsMeta || {})[n] || {};
        return { kind: "chain", id: n, label: m.natural || n, sub: n, badge: data.chains[n].length };
      });
    const online = filterOnline(data.online, q).map(([e, i]) => ({
      kind: "online", id: i, label: e.NOMBRE_NATURAL || e.NOMBRE,
      sub: e.COLA_ESCUCHA || e.CLASE_EVENTO || e.NOMBRE, badge: "IN",
    }));
    return { chain, online };
  }, [data, q]);

  const list = useMemo(() => {
    const all = family === "all" ? [...results.chain, ...results.online] : results[family];
    return all;
  }, [results, family]);

  const shown = list.slice(0, MAX_SHOWN);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Elegir proceso para el mapa"
      className="fixed inset-0 z-50 flex items-end justify-center bg-midnight/70 p-0 backdrop-blur-sm sm:items-center sm:p-6 lg:absolute lg:z-30"
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClose) onClose();
      }}
    >
      <div className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-white/12 bg-midnight/90 shadow-2xl backdrop-blur-md sm:max-h-[80%] sm:rounded-2xl">
        <div className="flex flex-col gap-2.5 border-b border-white/12 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-sand">Elige un proceso para viajar por su flujo</h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar selector"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-sand/70 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                <span aria-hidden>✕</span>
              </button>
            )}
          </div>

          <label className="relative block">
            <span className="sr-only">Buscar proceso, evento, JAR, cola o workflow</span>
            <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand/40">
              <IconSearch />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar proceso, evento, JAR, cola, workflow…"
              autoComplete="off"
              className="w-full rounded-xl border border-white/12 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-sand placeholder:text-sand/40 focus:border-serene/60 focus:outline-none focus:ring-2 focus:ring-serene/25"
            />
          </label>

          <div role="radiogroup" aria-label="Familia de proceso" className="flex flex-wrap gap-1.5">
            {FAMILIES.map((f) => {
              const on = family === f.id;
              const n = f.id === "all" ? results.chain.length + results.online.length : results[f.id].length;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFamily(f.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${
                    on ? "" : "border-white/12 bg-white/[0.04] text-sand/65 hover:bg-white/[0.08] hover:text-sand"
                  }`}
                  style={on ? { backgroundColor: f.hex || C.purple, borderColor: f.hex || C.purple, color: "#070E46" } : undefined}
                >
                  {f.label}
                  <span className="tabular-nums opacity-80">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-live="polite">
          {shown.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-sand/55">Sin resultados para esta búsqueda.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {shown.map((it) => (
                <li key={`${it.kind}:${it.id}`}>
                  <button
                    type="button"
                    onClick={() => onPick({ kind: it.kind, id: it.id, label: it.label })}
                    className="grid w-full grid-cols-[34px,1fr,auto] items-center gap-x-2.5 px-4 py-2.5 text-left transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-serene"
                  >
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[10px] font-bold tabular-nums"
                      style={{ borderColor: rgba(PROC_HEX[it.kind], 0.5), color: acc(PROC_HEX[it.kind]), backgroundColor: rgba(PROC_HEX[it.kind], 0.07) }}
                    >
                      {it.badge}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-semibold text-sand">{it.label}</span>
                      {it.sub && <span className="block truncate font-mono text-[10.5px] text-sand/55">{it.sub}</span>}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: acc(PROC_HEX[it.kind]) }}>
                      {it.kind === "chain" ? "Batch" : "Online"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {list.length > MAX_SHOWN && (
            <p className="px-4 py-3 text-center text-[11px] tabular-nums text-sand/50">
              Mostrando {MAX_SHOWN} de {list.length} — afina la búsqueda para ver el resto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
