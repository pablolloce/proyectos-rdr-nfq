"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { useReducedMotion } from "framer-motion";
import { useLinks } from "@/lib/links";
import { useTilt } from "@/hooks/useTilt";
import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { normalizarColores } from "./constants";
import EquipoPanel from "./EquipoPanel";
import Calendario from "./Calendario";
import DaySheet from "./DaySheet";
import { IconExternal, IconAlert, IconArrowLeft, IconRefresh, IconInfo, IconSun } from "./icons";

// Acento de la ruta: mandarin (sección "Equipo" del hub, donde vive Vacaciones).
const ACCENT = PALETTE.mandarin;

function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
      <span className="rdr-blob left-[-8%] top-[4%] h-80 w-80" style={{ background: ACCENT }} />
      <span className="rdr-blob right-[2%] top-[-10%] h-72 w-72" style={{ background: PALETTE.royal, animationDelay: "-4s" }} />
      <span className="rdr-blob bottom-[-14%] left-[20%] h-96 w-96" style={{ background: PALETTE.serene, animationDelay: "-8s" }} />
    </div>
  );
}

/** Skeleton de carga con la misma estructura que la vista real (sin CLS). */
function VacacionesSkeleton() {
  return (
    <div aria-busy="true">
      <div className="mb-8">
        <div className="h-3 w-32 rounded-full rdr-skel" />
        <div className="mt-4 h-9 w-72 max-w-full rounded-lg rdr-skel" />
        <div className="mt-3 h-3 w-80 max-w-full rounded-full rdr-skel" />
      </div>
      <p className="mb-6 font-sans text-xs font-bold uppercase tracking-[0.3em] text-serene/80" role="status" aria-live="polite">
        Cargando calendario…
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="h-72 rounded-2xl rdr-skel" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (<div key={i} className="h-72 rounded-2xl rdr-skel" />))}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ mensaje, onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-[#FF7A7A]/40 bg-[#C53030]/10 p-6 text-center backdrop-blur-md">
      <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl border border-[#FF7A7A]/40 bg-[#C53030]/15 text-[#FF9A9A]">
        <IconAlert size={22} />
      </span>
      <h2 className="font-display text-lg font-bold text-sand">No se pudieron cargar los datos</h2>
      <p className="mt-2 text-sm text-sand/70">{mensaje}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-serene/35 bg-serene/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-serene transition hover:border-serene/70 hover:bg-serene/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
      >
        <IconRefresh size={15} /> Reintentar
      </button>
    </div>
  );
}

/** Tarjeta "Solicitar vacaciones" -> Google Form (clave formularioVacaciones). */
function SolicitarCard({ formUrl }) {
  const reduce = useReducedMotion();
  const tilt = useTilt(reduce);
  const base =
    "rdr-tilt group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border bg-white/[0.055] p-4 backdrop-blur-md transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene";
  const inner = (
    <>
      <span aria-hidden className="rdr-spot" style={{ background: `radial-gradient(140px circle at var(--mx,50%) var(--my,50%), ${rgba(ACCENT, 0.22)}, transparent 70%)` }} />
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border" style={{ borderColor: rgba(ACCENT, 0.3), background: rgba(ACCENT, 0.12), color: ACCENT }}>
        <IconSun size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-sand">Solicitar vacaciones</span>
        <span className="block text-[13px] text-sand/70">Rellena el formulario: tus responsables reciben la petición por correo.</span>
      </span>
      <IconExternal size={17} className="shrink-0 text-sand/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-sand/85" />
    </>
  );
  if (!formUrl)
    return (
      <div {...tilt} aria-disabled="true" title="Enlace no disponible aún" className={`${base} cursor-not-allowed opacity-50`} style={{ borderColor: rgba(ACCENT, 0.5), "--pc": rgba(ACCENT, 0.75) }}>
        {inner}
      </div>
    );
  return (
    <a {...tilt} href={formUrl} target="_blank" rel="noopener noreferrer" className={base} style={{ borderColor: rgba(ACCENT, 0.5), "--pc": rgba(ACCENT, 0.75) }}>
      {inner}
    </a>
  );
}

/**
 * Ruta /vacaciones: calendario anual de ausencias del equipo (solo lectura).
 *
 * Contrato con el backend Apps Script (idéntico al legacy vacaciones.html):
 *   GET  {vacacionesBackend}?modo=publico   (añade & si la URL ya lleva query)
 *   ->   { year, generatedAt, empleados[], empleadosMap{}, paletaEquipos{},
 *          festivos{ "YYYY-MM-DD": "ES"|"MX"|"AMBOS" },
 *          ausenciasPorDia{ "YYYY-MM-DD": [{nombre, motivo}] }, error? }
 * No hay POST ni escritura: las solicitudes van por Google Form.
 */
export default function VacacionesRoute() {
  const { getUrl, error: linksError } = useLinks();
  // La autenticación la pone el chrome (AuthGate en AppFrame): esta vista es
  // de solo lectura y no necesita email ni rol.
  const apiUrl = getUrl("vacacionesBackend");
  const formUrl = getUrl("formularioVacaciones");

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filtros, setFiltros] = useState(() => new Set());
  const [sheet, setSheet] = useState(null); // { dateStr, ausencias }

  // Carga de datos (idéntica al legacy: GET simple, sin headers -> sin preflight).
  useEffect(() => {
    if (!apiUrl) {
      if (linksError) setError("No se pudieron cargar los enlaces (links.json). Recarga la página.");
      return;
    }
    let cancelado = false;
    setError("");
    setDatos(null);
    (async () => {
      try {
        const url = apiUrl + (apiUrl.includes("?") ? "&" : "?") + "modo=publico";
        const resp = await fetch(url, { method: "GET" });
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        const d = await resp.json();
        if (d.error) throw new Error(d.error);
        if (cancelado) return;
        normalizarColores(d);
        // Activos primero, luego alfabético (igual que el legacy).
        (d.empleados || []).sort((a, b) => {
          if (a.activo === b.activo) return a.nombre.localeCompare(b.nombre);
          return a.activo ? -1 : 1;
        });
        setDatos(d);
      } catch (err) {
        if (!cancelado) setError(String(err && err.message ? err.message : err));
      }
    })();
    return () => { cancelado = true; };
  }, [apiUrl, linksError, reloadKey]);

  // Si links.json cargó pero falta la clave vacacionesBackend, no esperamos
  // el skeleton para siempre: avisamos pasados unos segundos.
  useEffect(() => {
    if (apiUrl || error) return;
    const t = setTimeout(() => {
      setError((e) => e || "No se ha configurado el enlace “vacacionesBackend” en links.json.");
    }, 8000);
    return () => clearTimeout(t);
  }, [apiUrl, error]);

  const toggleFiltro = useCallback((nombre) => {
    setFiltros((prev) => {
      const next = new Set(prev);
      if (next.has(nombre)) next.delete(nombre);
      else next.add(nombre);
      return next;
    });
  }, []);
  const limpiarFiltros = useCallback(() => setFiltros(new Set()), []);
  const abrirDia = useCallback((dateStr, ausencias) => setSheet({ dateStr, ausencias }), []);
  const cerrarDia = useCallback(() => setSheet(null), []);

  const totalActivos = datos ? datos.empleados.filter((e) => e.activo).length : 0;
  const actualizado =
    datos && datos.generatedAt
      ? new Date(datos.generatedAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })
      : null;

  return (
    <main className="relative min-h-dvh w-full">
      <AmbientBackground />
      <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-6">
        {error ? (
          <>
            <Hero actualizado={null} />
            <ErrorCard mensaje={error} onRetry={() => { setError(""); setReloadKey((k) => k + 1); }} />
          </>
        ) : !datos ? (
          <VacacionesSkeleton />
        ) : (
          <>
            <Hero actualizado={actualizado} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              {/* Columna izquierda: solicitar + equipo/filtros + nota (sticky en desktop) */}
              <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <SolicitarCard formUrl={formUrl} />
                <EquipoPanel
                  empleados={datos.empleados}
                  paletaEquipos={datos.paletaEquipos}
                  filtros={filtros}
                  onToggle={toggleFiltro}
                  onClear={limpiarFiltros}
                />
                <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-sand/55">
                  <IconInfo size={14} className="mt-0.5 shrink-0" />
                  Las aprobaciones las gestionan los responsables desde el panel interno (les llega un enlace en el correo de aviso).
                </p>
              </div>

              {/* Calendario anual */}
              <Calendario datos={datos} filtros={filtros} totalActivos={totalActivos} onOpenDay={abrirDia} />
            </div>
            <DaySheet sheet={sheet} empleadosMap={datos.empleadosMap || {}} onClose={cerrarDia} />
          </>
        )}
      </div>
    </main>
  );
}

function Hero({ actualizado }) {
  return (
    <header className="mb-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-sand/60 transition hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
      >
        <IconArrowLeft size={14} /> Hub
      </Link>
      <p className="font-sans text-xs font-bold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
        Equipo · RDR
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-sand sm:text-4xl">
        Vacaciones del equipo
      </h1>
      <p className="mt-2 max-w-xl text-pretty text-sm text-sand/65">
        Calendario anual de ausencias (vista de solo lectura). Toca un día con puntos para ver quién falta y por qué.
      </p>
      {actualizado && (
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-sand/45">
          Actualizado · {actualizado}
        </p>
      )}
    </header>
  );
}
