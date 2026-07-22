"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { motion, useReducedMotion } from "framer-motion";
import { PALETTE } from "@/lib/palette";
import { useAccentMap } from "@/lib/theme";
import {
  C, DATA_URL, cxColor, filterChains, filterOnline, filterPublish, filterInv,
  TAB_IDS, buildHash, parseHash, processKey, resolveKey, buildRefIndex, relatedProcesses,
} from "./lib";
import { buildCatIndex, catsMatchQuery } from "./categorias";
import { ExplorerActions } from "./ui";
import Sidebar from "./Sidebar";
import { ChainDetail, OnlineDetail, PublishDetail, InventoryDetail, RelatedProcesses } from "./Details";

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

const IconArrowRight = (p) => (
  <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const IconLink = (p) => (
  <svg width={p.size || 13} height={p.size || 13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
  </svg>
);

const IconCheck = (p) => (
  <svg width={p.size || 13} height={p.size || 13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* Escapa el valor para un selector de atributo CSS. */
const cssAttr = (v) => String(v).replace(/["\\]/g, "\\$&");

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
  const [selCats, setSelCats] = useState([]); // filtro por categorías (OR)
  const [mobileDetail, setMobileDetail] = useState(false); // <lg: lista ↔ detalle apilados
  const [activeId, setActiveId] = useState(null); // resaltado de teclado en la lista
  const [copied, setCopied] = useState(false); // feedback del botón "Copiar enlace"

  const searchRef = useRef(null);
  const hashReadyRef = useRef(false); // no escribir el hash hasta restaurar el inicial

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

  /* Clasificación por categorías funcionales, precalculada UNA sola vez tras
     el fetch (no en cada render): { batch: {cadena: ids}, online/publish/inv:
     ids[] por índice }. */
  const catIndex = useMemo(() => (data ? buildCatIndex(data) : null), [data]);

  /* Índices de referencias cruzadas (workflow→procesos, cola JMS→procesos),
     precalculados una vez tras el fetch para "Procesos relacionados". */
  const refIndex = useMemo(() => (data ? buildRefIndex(data) : null), [data]);

  /* Lista normalizada de la pestaña activa tras la BÚSQUEDA (misma info por
     fila que el original + cats). La búsqueda también casa con el nombre de
     la categoría (escribir "alertas" encuentra los de esa categoría). */
  const searched = useMemo(() => {
    if (!data || !catIndex) return [];
    if (tab === "batch") {
      const ok = new Set(filterChains(data.chains, data.chainsMeta, q));
      return Object.keys(data.chains)
        .filter((n) => ok.has(n) || catsMatchQuery(catIndex.batch[n], q))
        .map((n) => {
          const m = (data.chainsMeta || {})[n] || {};
          return {
            id: n, badge: data.chains[n].length, badgeHex: C.serene, cats: catIndex.batch[n],
            name: m.natural || n, sub: n, right: m.cx || "", rightHex: m.cx ? cxColor(m.cx) : null,
          };
        });
    }
    if (tab === "online") {
      const ok = new Set(filterOnline(data.online, q).map(([, i]) => i));
      return data.online
        .map((e, i) => [e, i])
        .filter(([, i]) => ok.has(i) || catsMatchQuery(catIndex.online[i], q))
        .map(([e, i]) => ({
          id: i, badge: "IN", badgeHex: C.canary, cats: catIndex.online[i],
          name: e.NOMBRE_NATURAL || e.NOMBRE,
          sub: e.COLA_ESCUCHA ? `🔊 ${e.COLA_ESCUCHA}` : e.NOMBRE,
          right: e.WORKFLOW_GS || "",
        }));
    }
    if (tab === "publish") {
      const ok = new Set(filterPublish(data.publishing, q).map(([, i]) => i));
      return data.publishing
        .map((p, i) => [p, i])
        .filter(([, i]) => ok.has(i) || catsMatchQuery(catIndex.publish[i], q))
        .map(([p, i]) => ({
          id: i, badge: p.COUNT, badgeHex: C.lime, cats: catIndex.publish[i],
          name: p.WORKFLOW, sub: (p.QUEUES || []).slice(0, 2).join(", "),
          right: p.CALLERS && p.CALLERS.length ? p.CALLERS[0] : "",
        }));
    }
    const ok = new Set(filterInv(data.inventory, q).map(([, i]) => i));
    return data.inventory
      .map((p, i) => [p, i])
      .filter(([, i]) => ok.has(i) || catsMatchQuery(catIndex.inv[i], q))
      .map(([p, i]) => ({
        id: i, badge: (p.ID || "").replace("P-", ""), badgeHex: p.TIPO === "ONLINE" ? C.canary : C.serene,
        cats: catIndex.inv[i],
        name: p.NOMBRE_NATURAL || "",
        sub: `${p.TIPO || ""}${p.EJECUCIONES_ANUAL && p.EJECUCIONES_ANUAL !== "0" ? ` · ${p.EJECUCIONES_ANUAL} ej/a` : ""}`,
        right: p.COMPLEJIDAD || "", rightHex: p.COMPLEJIDAD ? cxColor(p.COMPLEJIDAD) : null,
      }));
  }, [data, catIndex, tab, q]);

  /* Contador por categoría para la pestaña activa + búsqueda vigente
     (ANTES de aplicar el filtro de categorías, para que los chips no
     "desaparezcan" al seleccionar uno). */
  const catCounts = useMemo(() => {
    const c = {};
    searched.forEach((it) => (it.cats || []).forEach((id) => { c[id] = (c[id] || 0) + 1; }));
    return c;
  }, [searched]);

  /* Filtro de categorías: OR entre las seleccionadas. */
  const items = useMemo(
    () => (selCats.length ? searched.filter((it) => (it.cats || []).some((id) => selCats.includes(id))) : searched),
    [searched, selCats]
  );

  const onToggleCat = useCallback((id) => {
    setSelCats((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }, []);
  const onClearCats = useCallback(() => setSelCats([]), []);

  const selectedId = sel[tab];

  /* Índice del proceso seleccionado dentro de la LISTA FILTRADA vigente
     (para Anterior/Siguiente y para acotar los extremos). */
  const curIdx = useMemo(() => items.findIndex((it) => it.id === selectedId), [items, selectedId]);

  /* Escribe el hash con history.pushState SOLO ante una navegación explícita
     del usuario (cambio de pestaña, selección, prev/next, relacionados). La
     restauración desde el hash NO llama aquí → sin bucles. Compara antes de
     empujar para no duplicar entradas de historial. */
  const pushHash = useCallback((navTab, navId) => {
    if (!data || !hashReadyRef.current || typeof window === "undefined") return;
    const key = navId != null ? processKey(navTab, data, navId) : null;
    const desired = buildHash(navTab, key);
    if ((window.location.hash || "") !== desired) window.history.pushState(null, "", desired);
  }, [data]);

  const onTab = useCallback((t) => {
    setTab(t);
    setMobileDetail(false);
    setActiveId(null);
    pushHash(t, sel[t]);
  }, [pushHash, sel]);

  const onSelect = useCallback((id) => {
    setSel((s) => ({ ...s, [tab]: id }));
    setActiveId(id);
    setMobileDetail(true);
    pushHash(tab, id);
  }, [tab, pushHash]);

  /* Anterior/Siguiente por la lista filtrada (botones ← → y Alt+↑/↓). */
  const goRelative = useCallback((delta) => {
    if (curIdx < 0) return;
    const ni = curIdx + delta;
    if (ni < 0 || ni >= items.length) return;
    const nid = items[ni].id;
    setSel((s) => ({ ...s, [tab]: nid }));
    setActiveId(nid);
    setMobileDetail(true);
    pushHash(tab, nid);
  }, [curIdx, items, tab, pushHash]);

  /* Navega a un proceso concreto de cualquier pestaña (relacionados). */
  const onNavigate = useCallback((navTab, key) => {
    if (!data) return;
    const id = resolveKey(navTab, data, key);
    if (id == null) return;
    setTab(navTab);
    setSel((s) => ({ ...s, [navTab]: id }));
    setActiveId(id);
    setMobileDetail(true);
    setSelCats([]);
    pushHash(navTab, id);
  }, [data, pushHash]);

  /* Referencia cruzada clicable → rellena el buscador global. Si la pestaña
     activa no tiene resultados para ese término, salta a la primera que sí. */
  const onTerm = useCallback((term) => {
    const t = String(term || "").trim();
    setQuery(t);
    setSelCats([]);
    if (data && t) {
      const lower = t.toLowerCase();
      const hasResults = (tb) =>
        tb === "batch" ? filterChains(data.chains, data.chainsMeta, lower).length > 0
        : tb === "online" ? filterOnline(data.online, lower).length > 0
        : tb === "publish" ? filterPublish(data.publishing, lower).length > 0
        : filterInv(data.inventory, lower).length > 0;
      if (!hasResults(tab)) {
        const alt = TAB_IDS.find(hasResults);
        if (alt) { setTab(alt); setMobileDetail(false); setActiveId(null); pushHash(alt, sel[alt]); }
      }
    }
    if (searchRef.current) { searchRef.current.focus(); }
  }, [data, tab, sel, pushHash]);

  /* Copia el enlace canónico (con el hash del proceso) al portapapeles. */
  const copyLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    const key = selectedId != null ? processKey(tab, data, selectedId) : null;
    const href = `${window.location.origin}${window.location.pathname}${window.location.search}${buildHash(tab, key)}`;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard no disponible: sin feedback, no rompemos la navegación */
    }
  }, [tab, data, selectedId]);

  const actions = useMemo(() => ({ onTerm, onNavigate }), [onTerm, onNavigate]);

  const related = useMemo(
    () => (data && refIndex && selectedId != null ? relatedProcesses(data, refIndex, tab, selectedId, 8) : null),
    [data, refIndex, tab, selectedId]
  );

  /* Lleva a la vista una fila de la lista por su id (block: "nearest"). */
  const scrollItemIntoView = useCallback((id) => {
    if (id == null || typeof document === "undefined") return;
    const list = document.getElementById("rdr-explorer-list");
    const el = list && list.querySelector(`[data-rdr-item="${cssAttr(id)}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, []);

  /* Restaura pestaña + proceso desde el hash al montar y en cada hashchange
     (Atrás/Adelante del navegador). No escribe el hash → sin bucles. */
  useEffect(() => {
    if (!data) return;
    const apply = () => {
      const p = parseHash(window.location.hash);
      if (p) {
        setTab(p.tab);
        if (p.key) {
          const id = resolveKey(p.tab, data, p.key);
          setSel((s) => ({ ...s, [p.tab]: id }));
          if (id != null) { setActiveId(id); setMobileDetail(true); }
          else setMobileDetail(false);
        } else {
          setSel((s) => ({ ...s, [p.tab]: null }));
          setActiveId(null);
          setMobileDetail(false);
        }
      } else {
        // Hash vacío (p. ej. Atrás hasta el inicio): deselecciona.
        setSel(EMPTY_SEL);
        setActiveId(null);
        setMobileDetail(false);
      }
      hashReadyRef.current = true;
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [data]);

  /* Al cambiar de proceso o pestaña, lleva el seleccionado a la vista (tras
     el commit, con rAF para que la fila exista en el DOM). */
  useEffect(() => {
    if (selectedId == null || typeof window === "undefined") return;
    const raf = window.requestAnimationFrame(() => scrollItemIntoView(selectedId));
    return () => window.cancelAnimationFrame(raf);
  }, [selectedId, tab, scrollItemIntoView]);

  /* Mantiene el resaltado de teclado dentro de la lista filtrada vigente. */
  useEffect(() => {
    if (activeId != null && !items.some((it) => it.id === activeId)) setActiveId(null);
  }, [items, activeId]);

  /* Atajos globales: "/" enfoca el buscador; Alt+↑/↓ recorren prev/siguiente. */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (searchRef.current) { searchRef.current.focus(); searchRef.current.select(); }
        return;
      }
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        if (selectedId == null) return;
        e.preventDefault();
        goRelative(e.key === "ArrowDown" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, goRelative]);

  /* Teclado dentro del buscador o la lista: ↑/↓ mueven el resaltado, Enter
     abre el resaltado (desde el buscador), Escape limpia el buscador. */
  const onListKeyDown = useCallback((e) => {
    if (e.altKey) return; // Alt+↑/↓ lo gestiona el atajo global
    const t = e.target;
    const inSearch = t === searchRef.current;
    const inList = !!(t.closest && t.closest("#rdr-explorer-list"));
    if (!inSearch && !inList) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      const cur = activeId != null ? items.findIndex((it) => it.id === activeId) : -1;
      let ni;
      if (cur === -1) ni = e.key === "ArrowDown" ? 0 : items.length - 1;
      else ni = Math.max(0, Math.min(items.length - 1, cur + (e.key === "ArrowDown" ? 1 : -1)));
      const nid = items[ni].id;
      setActiveId(nid);
      if (typeof window !== "undefined") window.requestAnimationFrame(() => scrollItemIntoView(nid));
    } else if (e.key === "Enter") {
      if (inSearch && activeId != null) { e.preventDefault(); onSelect(activeId); }
    } else if (e.key === "Escape") {
      if (inSearch) { e.preventDefault(); setQuery(""); setActiveId(null); }
    }
  }, [items, activeId, onSelect, scrollItemIntoView]);

  /* Panel de detalle según pestaña + selección (con TODAS sus categorías). */
  let detail = null;
  let detailKey = `${tab}:${selectedId}`;
  if (data && catIndex && selectedId != null) {
    if (tab === "batch" && data.chains[selectedId])
      detail = (
        <ChainDetail
          name={selectedId}
          steps={data.chains[selectedId]}
          meta={(data.chainsMeta || {})[selectedId]}
          cats={catIndex.batch[selectedId]}
        />
      );
    else if (tab === "online" && data.online[selectedId])
      detail = <OnlineDetail ev={data.online[selectedId]} cats={catIndex.online[selectedId]} />;
    else if (tab === "publish" && data.publishing[selectedId])
      detail = <PublishDetail p={data.publishing[selectedId]} cats={catIndex.publish[selectedId]} />;
    else if (tab === "inv" && data.inventory[selectedId])
      detail = <InventoryDetail p={data.inventory[selectedId]} cats={catIndex.inv[selectedId]} />;
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
              onKeyDown={onListKeyDown}
              className={`${mobileDetail ? "hidden lg:block" : ""} lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] [&>div]:max-h-[70dvh] lg:[&>div]:h-full lg:[&>div]:max-h-none`}
            >
              <Sidebar
                tab={tab}
                onTab={onTab}
                query={query}
                onQuery={setQuery}
                items={items}
                selectedId={selectedId}
                activeId={activeId}
                onSelect={onSelect}
                searchRef={searchRef}
                catCounts={catCounts}
                selCats={selCats}
                onToggleCat={onToggleCat}
                onClearCats={onClearCats}
              />
            </div>

            {/* Panel de detalle: en <lg sustituye a la lista, con botón volver. */}
            <section
              aria-label="Detalle del proceso"
              className={`${mobileDetail ? "" : "hidden lg:block"} min-w-0 rounded-2xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-md sm:p-6`}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDetail(false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] font-bold text-sand/75 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene lg:hidden"
                >
                  <IconArrowLeft size={12} /> Volver a la lista
                </button>
                {detail && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => goRelative(-1)}
                      disabled={curIdx <= 0}
                      aria-disabled={curIdx <= 0}
                      aria-label="Proceso anterior de la lista (Alt+Flecha arriba)"
                      title="Anterior (Alt+↑)"
                      className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.05] p-2 text-sand/75 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white/[0.05]"
                    >
                      <IconArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => goRelative(1)}
                      disabled={curIdx < 0 || curIdx >= items.length - 1}
                      aria-disabled={curIdx < 0 || curIdx >= items.length - 1}
                      aria-label="Proceso siguiente de la lista (Alt+Flecha abajo)"
                      title="Siguiente (Alt+↓)"
                      className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.05] p-2 text-sand/75 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white/[0.05]"
                    >
                      <IconArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={copyLink}
                      aria-label="Copiar enlace a este proceso"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[11px] font-bold text-sand/75 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                    >
                      {copied ? <IconCheck /> : <IconLink />}
                      <span aria-live="polite">{copied ? "Copiado" : "Copiar enlace"}</span>
                    </button>
                  </div>
                )}
              </div>
              {detail ? (
                <ExplorerActions.Provider value={actions}>
                  <motion.div
                    key={detailKey}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {detail}
                    {related && related.list.length > 0 && (
                      <RelatedProcesses related={related} onNavigate={onNavigate} />
                    )}
                  </motion.div>
                </ExplorerActions.Provider>
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
