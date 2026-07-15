"use client";

import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { TABS } from "./lib";
import { useAcc } from "./ui";

/* Sidebar del Process Explorer: buscador + tabs segmentadas + lista de
   resultados. Los items llegan ya filtrados y normalizados desde
   ProcessExplorer ({ id, badge, badgeHex, name, sub, right, rightHex }). */

const ACCENT = PALETTE.aqua;

const IconSearch = (p) => (
  <svg width={p.size || 15} height={p.size || 15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);

function Tabs({ tab, onTab }) {
  // Pestaña activa: superficie aqua literal con tinta midnight fija — como
  // superficie sólida funciona igual en ambos temas (convención del repo).
  return (
    <div role="tablist" aria-label="Tipo de proceso" className="grid grid-cols-4 overflow-hidden rounded-xl border border-white/12 bg-white/[0.04]">
      {TABS.map((t, i) => {
        const on = tab === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            id={`rdr-tab-${t.id}`}
            aria-selected={on}
            aria-controls="rdr-explorer-list"
            type="button"
            onClick={() => onTab(t.id)}
            className={`px-1 py-2 text-[10.5px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-serene ${
              i > 0 ? "border-l border-white/12" : ""
            } ${on ? "" : "text-sand/60 hover:bg-white/[0.07] hover:text-sand"}`}
            style={on ? { backgroundColor: ACCENT, color: "#070E46" } : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ItemRow({ it, selected, onSelect }) {
  const acc = useAcc();
  return (
    <li>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(it.id)}
        className={`grid w-full grid-cols-[34px,1fr,auto] items-center gap-x-2.5 border-l-2 px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-serene ${
          selected ? "bg-white/[0.09]" : "border-transparent hover:bg-white/[0.06]"
        }`}
        style={selected ? { borderLeftColor: acc(ACCENT) } : undefined}
      >
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[10px] font-bold tabular-nums"
          style={{ borderColor: rgba(it.badgeHex, 0.5), color: acc(it.badgeHex), backgroundColor: rgba(it.badgeHex, 0.07) }}
        >
          {it.badge}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold text-sand">{it.name}</span>
          {it.sub && <span className="block truncate text-[10.5px] text-sand/55">{it.sub}</span>}
        </span>
        <span
          className="max-w-[110px] truncate text-[10px] font-bold text-sand/50"
          style={it.rightHex ? { color: acc(it.rightHex) } : undefined}
        >
          {it.right}
        </span>
      </button>
    </li>
  );
}

export default function Sidebar({ tab, onTab, query, onQuery, items, selectedId, onSelect }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] backdrop-blur-md">
      <div className="flex flex-col gap-2.5 border-b border-white/12 p-3">
        <label className="relative block">
          <span className="sr-only">Buscar proceso, evento, JAR o workflow</span>
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand/40">
            <IconSearch />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar proceso, evento, JAR, workflow…"
            autoComplete="off"
            className="w-full rounded-xl border border-white/12 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-sand placeholder:text-sand/40 focus:border-serene/60 focus:outline-none focus:ring-2 focus:ring-serene/25"
          />
        </label>
        <Tabs tab={tab} onTab={onTab} />
        <p aria-live="polite" className="px-0.5 text-[10.5px] tabular-nums text-sand/50">
          {items.length} {items.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      <div id="rdr-explorer-list" role="tabpanel" aria-labelledby={`rdr-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-sand/55">Sin resultados para esta búsqueda.</p>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {items.map((it) => (
              <ItemRow key={it.id} it={it} selected={selectedId === it.id} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
