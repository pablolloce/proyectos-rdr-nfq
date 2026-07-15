"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { motion, useReducedMotion } from "framer-motion";
import { PALETTE } from "@/lib/palette";
import { useAccentMap } from "@/lib/theme";
import { C, DATA_URL, cxColor, filterChains, filterOnline, filterPublish, filterInv } from "./lib";
import Sidebar from "./Sidebar";
import { ChainDetail, OnlineDetail, PublishDetail, InventoryDetail } from "./Details";

/* Process Explorer RDR — versión Next del antiguo HTML estático
   public/recursos/procesos-rdr-explorer.html. Misma información y lógica
   (5 vistas, búsqueda multi-campo, flujos paso a paso), integrada en el
   design system del sitio. Los datos (la "D" del original) viven en
   public/recursos/procesos-rdr-data.json y se cargan en cliente. */

const ACCENT = PALETTE.aqua; // acento de la sección Recursos

const IconArrowLeft = (p) => (
  <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

function StatPill({ n, label }) {
  const acc = useAccentMap();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[11px] text-sand/70">
      <strong className="font-bold tabular-nums" style={{ color: acc(ACCENT) }}>{n}</strong>
      {label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(300px,360px),1fr]" aria-hidden>
      <div className="space-y-2 rounded-2xl border border-white/12 bg-white/[0.055] p-3 backdrop-blur-md">
        <div className="rdr-skel h-9 rounded-xl" />
        <div className="rdr-skel h-9 rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rdr-skel h-12 rounded-xl" />
        ))}
      </div>
      <div className="hidden space-y-3 rounded-2xl border border-white/12 bg-white/[0.055] p-6 backdrop-blur-md lg:block">
        <div className="rdr-skel h-7 w-2/3 rounded-lg" />
        <div className="rdr-skel h-4 w-1/3 rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rdr-skel h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-2xl border border-white/12 bg-white/[0.055] p-8 text-center backdrop-blur-md">
      <p className="font-display text-lg font-bold text-sand">No se pudieron cargar los procesos</p>
      <p className="mt-2 text-sm text-sand/65">
        Falló la descarga del inventario (procesos-rdr-data.json). Revisa la conexión e inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full border border-serene/40 bg-serene/10 px-5 py-2 text-sm font-bold text-serene transition hover:bg-serene/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
      >
        Reintentar
      </button>
    </div>
  );
}

const EMPTY_SEL = { batch: null, online: null, publish: null, inv: null };

export default function ProcessExplorer() {
  const acc = useAccentMap();
  const reduce = useReducedMotion();

  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  const [tab, setTab] = useState("batch");
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query).trim().toLowerCase();
  const [sel, setSel] = useState(EMPTY_SEL); // selección independiente por pestaña
  const [mobileDetail, setMobileDetail] = useState(false); // <lg: lista ↔ detalle apilados

  useEffect(() => {
    let vivo = true;
    setError(false);
    setData(null);
    fetch(DATA_URL, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((d) => vivo && setData(d))
      .catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, [intento]);

  /* Lista normalizada de la pestaña activa (misma info por fila que el original). */
  const items = useMemo(() => {
    if (!data) return [];
    if (tab === "batch")
      return filterChains(data.chains, data.chainsMeta, q).map((n) => {
        const m = (data.chainsMeta || {})[n] || {};
        return {
          id: n, badge: data.chains[n].length, badgeHex: C.serene,
          name: m.natural || n, sub: n, right: m.cx || "", rightHex: m.cx ? cxColor(m.cx) : null,
        };
      });
    if (tab === "online")
      return filterOnline(data.online, q).map(([e, i]) => ({
        id: i, badge: "IN", badgeHex: C.canary,
        name: e.NOMBRE_NATURAL || e.NOMBRE,
        sub: e.COLA_ESCUCHA ? `🔊 ${e.COLA_ESCUCHA}` : e.NOMBRE,
        right: e.WORKFLOW_GS || "",
      }));
    if (tab === "publish")
      return filterPublish(data.publishing, q).map(([p, i]) => ({
        id: i, badge: p.COUNT, badgeHex: C.lime,
        name: p.WORKFLOW, sub: (p.QUEUES || []).slice(0, 2).join(", "),
        right: p.CALLERS && p.CALLERS.length ? p.CALLERS[0] : "",
      }));
    return filterInv(data.inventory, q).map(([p, i]) => ({
      id: i, badge: (p.ID || "").replace("P-", ""), badgeHex: p.TIPO === "ONLINE" ? C.canary : C.serene,
      name: p.NOMBRE_NATURAL || "",
      sub: `${p.TIPO || ""}${p.EJECUCIONES_ANUAL && p.EJECUCIONES_ANUAL !== "0" ? ` · ${p.EJECUCIONES_ANUAL} ej/a` : ""}`,
      right: p.COMPLEJIDAD || "", rightHex: p.COMPLEJIDAD ? cxColor(p.COMPLEJIDAD) : null,
    }));
  }, [data, tab, q]);

  const onTab = useCallback((t) => {
    setTab(t);
    setMobileDetail(false);
  }, []);

  const onSelect = useCallback((id) => {
    setSel((s) => ({ ...s, [tab]: id }));
    setMobileDetail(true);
  }, [tab]);

  const selectedId = sel[tab];

  /* Panel de detalle según pestaña + selección. */
  let detail = null;
  let detailKey = `${tab}:${selectedId}`;
  if (data && selectedId != null) {
    if (tab === "batch" && data.chains[selectedId])
      detail = <ChainDetail name={selectedId} steps={data.chains[selectedId]} meta={(data.chainsMeta || {})[selectedId]} />;
    else if (tab === "online" && data.online[selectedId]) detail = <OnlineDetail ev={data.online[selectedId]} />;
    else if (tab === "publish" && data.publishing[selectedId]) detail = <PublishDetail p={data.publishing[selectedId]} />;
    else if (tab === "inv" && data.inventory[selectedId]) detail = <InventoryDetail p={data.inventory[selectedId]} />;
  }

  const stats = data?.stats;

  return (
    <main className="relative min-h-dvh w-full">
      <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
        <span className="rdr-blob left-[-6%] top-[8%] h-80 w-80" style={{ background: PALETTE.aqua }} />
        <span className="rdr-blob bottom-[-10%] right-[-2%] h-96 w-96" style={{ background: PALETTE.royal }} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-6">
        <header className="mb-8">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.4em]" style={{ color: acc(ACCENT) }}>
            Recursos · Biblioteca
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-4xl font-bold leading-none tracking-tight text-sand sm:text-5xl">
              Process Explorer
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {/* La antigua pestaña "Mapa" vive ahora en /recursos/mapa. */}
              <Link
                href="/recursos/mapa"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                style={{ backgroundColor: PALETTE.purple, borderColor: PALETTE.purple, color: "#070E46" }}
              >
                Mapa interactivo <span aria-hidden>→</span>
              </Link>
              <Link
                href="/recursos"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wide text-sand/80 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                <IconArrowLeft /> Recursos
              </Link>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-pretty text-sm text-sand/65">
            Cadenas batch de Control-M, listeners online, publishers e inventario de procesos RDR, con el flujo de
            ejecución paso a paso de cada uno.
          </p>
          {stats && (
            <div className="mt-4 flex flex-wrap gap-2">
              <StatPill n={stats.chains_count} label="cadenas" />
              <StatPill n={stats.online_count} label="listeners" />
              <StatPill n={stats.publishing_count} label="publishers" />
              <StatPill n={stats.inventory_count || 0} label="procesos" />
            </div>
          )}
        </header>

        {error ? (
          <ErrorState onRetry={() => setIntento((n) => n + 1)} />
        ) : !data ? (
          <Skeleton />
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(300px,360px),1fr]">
            {/* Sidebar: en <lg se oculta cuando el detalle está abierto. */}
            <div
              className={`${mobileDetail ? "hidden lg:block" : ""} lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] [&>div]:max-h-[70dvh] lg:[&>div]:h-full lg:[&>div]:max-h-none`}
            >
              <Sidebar
                tab={tab}
                onTab={onTab}
                query={query}
                onQuery={setQuery}
                items={items}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </div>

            {/* Panel de detalle: en <lg sustituye a la lista, con botón volver. */}
            <section
              aria-label="Detalle del proceso"
              className={`${mobileDetail ? "" : "hidden lg:block"} min-w-0 rounded-2xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-md sm:p-6`}
            >
              <button
                type="button"
                onClick={() => setMobileDetail(false)}
                className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] font-bold text-sand/75 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene lg:hidden"
              >
                <IconArrowLeft size={12} /> Volver a la lista
              </button>
              {detail ? (
                <motion.div
                  key={detailKey}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {detail}
                </motion.div>
              ) : (
                <div className="grid min-h-[300px] place-items-center text-center">
                  <div>
                    <p aria-hidden className="text-3xl opacity-30">▶</p>
                    <p className="mt-2 text-sm text-sand/55">Selecciona un proceso para ver su flujo de ejecución</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
