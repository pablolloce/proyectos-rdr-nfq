"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/chrome/AuthGate";
import { useLinks } from "@/lib/links";
import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { DEMO } from "./model";
import { PanelSkeleton, GLASS } from "./ui";
import { IconShield } from "@/components/icons";
import { IconList, IconGauge, IconEuro, IconUsers, IconWallet, IconReceipt, IconStar, IconReload, IconBack } from "./icons";
import TabIniciativas from "./TabIniciativas";
import TabEjecucion from "./TabEjecucion";
import TabEconomia from "./TabEconomia";
import TabCapacidad from "./TabCapacidad";
import TabBolsa from "./TabBolsa";
import TabGastos from "./TabGastos";
import TabEncuestas from "./TabEncuestas";
import ArtBanner from "@/components/chrome/ArtBanner";
import { ART } from "@/lib/art";

/**
 * Control RDR — migración de public/control.html a ruta Next.
 *
 * CONTRATO BACKEND (Apps Script, clave "controlBackend" de links.json) — idéntico
 * al legacy:
 *   - Lectura:  GET  {url}?action=snapshot[&token=...]  -> { ok, data } | { ok:false, error }
 *   - Escritura: POST {url} con Content-Type "text/plain;charset=utf-8" y body
 *     JSON.stringify({ action, token, ...params }). text/plain evita el preflight
 *     CORS de Apps Script (patrón "simple request").
 *   - Acciones usadas: updateRow{sheet,row,patch} · append{sheet,data} ·
 *     appendClone{sheet,data} · write{sheet,a1,value} · batch{updates:[{sheet,a1,value}]}
 *
 * Modos: "Simulación" (por defecto; TODO local, nada se escribe) y "Normal"
 * (las ediciones persisten vía backend; requiere controlBackend + controlToken).
 */

const TABS = [
  { id: "iniciativas", label: "Iniciativas", icon: IconList, C: TabIniciativas },
  { id: "ejecucion", label: "Ejecución", icon: IconGauge, C: TabEjecucion },
  { id: "economia", label: "Economía", icon: IconEuro, C: TabEconomia },
  { id: "capacidad", label: "Capacidad", icon: IconUsers, C: TabCapacidad },
  { id: "bolsa", label: "Bolsa / Adelantos", icon: IconWallet, C: TabBolsa },
  { id: "gastos", label: "Gastos", icon: IconReceipt, C: TabGastos },
  { id: "encuestas", label: "Encuestas", icon: IconStar, C: TabEncuestas },
];

function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
      <span className="rdr-blob left-[-8%] top-[4%] h-80 w-80" style={{ background: PALETTE.purple }} />
      <span className="rdr-blob right-[-6%] top-[24%] h-72 w-72" style={{ background: PALETTE.royal, animationDelay: "-4s" }} />
      <span className="rdr-blob bottom-[-14%] left-[22%] h-96 w-96" style={{ background: PALETTE.purple, animationDelay: "-8s", opacity: 0.35 }} />
    </div>
  );
}

/* Acceso restringido: la ruta es SOLO de coordinación. (El legacy vivía oculto
   tras la tarjeta de coordinación del hub; aquí el criterio se aplica en la
   propia ruta con useAuth().isCoordinador.) */
function Restricted() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 pb-24 pt-28">
      <AmbientBackground />
      <div className={`${GLASS} w-full max-w-md p-10 text-center`} style={{ borderColor: rgba(PALETTE.purple, 0.4) }}>
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border text-purple"
          style={{ borderColor: rgba(PALETTE.purple, 0.35), background: rgba(PALETTE.purple, 0.12) }}
        >
          <IconShield size={28} />
        </span>
        <p className="mt-5 font-sans text-xs uppercase tracking-[0.3em] text-purple">Control RDR</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-sand">Acceso restringido a coordinación</h1>
        <p className="mt-3 text-pretty text-sm text-sand/70">
          Esta sección es exclusiva del equipo de coordinación. Si crees que deberías tener acceso, habla con tu responsable.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-purple/40 bg-purple/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-purple transition hover:border-purple/70 hover:bg-purple/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        >
          <IconBack size={15} /> Volver al hub
        </Link>
      </div>
    </main>
  );
}

export default function ControlRoute() {
  const { isCoordinador } = useAuth();
  const { getUrl, error: linksError } = useLinks();
  const reduce = useReducedMotion();

  const [snap, setSnap] = useState(null); // { data, demo, error }
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false); // false = simulación (seguro, por defecto)
  const [tab, setTab] = useState("iniciativas");
  const [flashMsg, setFlashMsg] = useState(null); // { msg, bad }
  const [ver, setVer] = useState(0); // versión del snapshot -> remonta las tablas
  const [, redraw] = useReducer((x) => x + 1, 0); // el modelo se muta in-place (como el legacy)

  // Estado de UI que sobrevive al cambio de pestaña (equivale al `state` legacy).
  const ui = useRef({ iniActiva: true, ejeActiva: true, ecoScenario: {}, capHoras: {}, capTeams: {} }).current;
  // URL + token del backend (para las escrituras).
  const cfg = useRef({ url: null, token: "" }).current;

  const flashT = useRef();
  const flash = useCallback((msg, bad) => {
    setFlashMsg({ msg, bad: !!bad });
    clearTimeout(flashT.current);
    flashT.current = setTimeout(() => setFlashMsg(null), 2800);
  }, []);
  useEffect(() => () => clearTimeout(flashT.current), []);

  /* ---------- snapshot (GET action=snapshot), con fallback a DEMO ---------- */
  const loadSnapshot = useCallback(async () => {
    let url = null;
    let token = "";
    let err = "";
    if (linksError) err = "no se pudo leer links.json";
    else {
      url = getUrl("controlBackend"); // null si falta o es placeholder PEGAR_AQUI
      token = getUrl("controlToken") || "";
    }
    cfg.url = url;
    cfg.token = token;
    if (url) {
      try {
        const u = url + (url.indexOf("?") < 0 ? "?" : "&") + "action=snapshot" + (token ? "&token=" + encodeURIComponent(token) : "");
        const res = await fetch(u).then((r) => r.json());
        if (res && res.ok && res.data) {
          setSnap({ data: res.data, demo: false, error: "" });
          setVer((v) => v + 1);
          return;
        }
        err = res && res.error ? "backend: " + res.error : "respuesta inesperada del backend";
      } catch (e) {
        err = "sin conexión con el backend (CORS/red)";
      }
    } else if (!err) {
      err = "falta controlBackend en links.json";
    }
    setSnap({ data: DEMO, demo: true, error: err });
    setVer((v) => v + 1);
  }, [getUrl, linksError, cfg]);

  // Arranque: espera a que LinksProvider tenga links.json cargado (getUrl
  // devuelve null tanto "cargando" como "clave ausente": se desambigua con las
  // claves-centinela _updated/_comment, siempre presentes en links.json).
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    const ready =
      linksError ||
      getUrl("controlBackend") != null ||
      getUrl("_updated") != null ||
      getUrl("_comment") != null;
    if (!ready) return;
    booted.current = true;
    loadSnapshot().finally(() => setLoading(false));
  }, [getUrl, linksError, loadSnapshot]);
  // Red de seguridad: si links.json no resuelve en 8s, arranca igualmente (demo).
  useEffect(() => {
    const t = setTimeout(() => {
      if (!booted.current) {
        booted.current = true;
        loadSnapshot().finally(() => setLoading(false));
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [loadSnapshot]);

  /* ---------- escrituras (POST text/plain, sin preflight) ---------- */
  const apiWrite = useCallback(
    async (action, params) => {
      if (!cfg.url) throw new Error("Sin backend (controlBackend en links.json).");
      if (!cfg.token) throw new Error("Falta controlToken en links.json para escribir.");
      const body = Object.assign({ action, token: cfg.token }, params);
      const res = await fetch(cfg.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
      }).then((r) => r.json());
      if (!res || !res.ok) throw new Error((res && res.error) || "error del backend");
      return res.data;
    },
    [cfg]
  );

  // Persiste SOLO en Modo normal; tras escribir, recarga el snapshot (fórmulas
  // recalculadas en el Excel). En simulación el caller ya mutó el modelo local.
  const liveRef = useRef(live);
  liveRef.current = live;
  const persist = useCallback(
    async (writeFn, label) => {
      if (!liveRef.current) {
        flash("Simulación: cambio local (no se guarda en el Excel).", true);
        return;
      }
      try {
        flash("Guardando…");
        await writeFn();
        await loadSnapshot();
        flash((label || "Guardado") + " ✓");
      } catch (e) {
        flash(String((e && e.message) || e), true);
      }
    },
    [flash, loadSnapshot]
  );

  const toggleMode = () => {
    if (!live && (!cfg.url || !cfg.token))
      flash("Para Modo normal hace falta controlBackend + controlToken en links.json.", true);
    setLive((v) => !v); // como el legacy: avisa pero permite el toggle
  };

  const reload = async () => {
    setLoading(true);
    await loadSnapshot();
    setLoading(false);
  };

  if (!isCoordinador) return <Restricted />;

  const Active = TABS.find((t) => t.id === tab) || TABS[0];
  const TabC = Active.C;

  return (
    <main className="relative min-h-dvh">
      <ArtBanner src={ART.coordinacion} />
      <AmbientBackground />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-6">
        {/* Cabecera de la sección (el chrome global pone título/logos/sesión) */}
        <header className={`mb-6 ${reduce ? "" : "rdr-rise"}`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-purple">Coordinación</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-sand sm:text-4xl">Control RDR</h1>
              <p className="mt-1 text-sm text-sand/70">
                Ejecución · Economía · Capacidad —{" "}
                <span className="text-mandarin">
                  {snap ? (snap.demo ? "modo demo" + (snap.error ? " · " + snap.error : "") : "datos en vivo") : "conectando…"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-live="polite"
                className={`text-xs font-bold transition-opacity duration-300 ${flashMsg ? "opacity-100" : "opacity-0"} ${flashMsg && flashMsg.bad ? "text-mandarin" : "text-lime"}`}
              >
                {flashMsg ? flashMsg.msg : ""}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                aria-pressed={live}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${
                  live
                    ? "border-mandarin/80 bg-mandarin/10 text-mandarin"
                    : "border-serene/40 bg-white/[0.055] text-serene hover:border-serene/70"
                }`}
              >
                {live ? "● Modo normal (escribe)" : "○ Modo simulación"}
              </button>
              <button
                type="button"
                onClick={reload}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.055] px-4 py-2 text-xs font-bold uppercase tracking-wider text-sand backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                <IconReload size={13} /> Recargar
              </button>
            </div>
          </div>
        </header>

        {/* Pestañas */}
        <nav role="tablist" aria-label="Secciones del control" className={`mb-6 flex flex-wrap gap-2 ${reduce ? "" : "rdr-rise"}`} style={{ animationDelay: "60ms" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls="control-panel"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-bold backdrop-blur-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${
                tab === id
                  ? "border-purple/70 bg-purple/15 text-purple"
                  : "border-white/12 bg-white/[0.055] text-sand/80 hover:border-purple/40 hover:bg-white/10 hover:text-sand"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <section id="control-panel" role="tabpanel" aria-labelledby={`tab-${Active.id}`} className="min-h-[50vh]">
          {loading || !snap ? (
            <PanelSkeleton />
          ) : (
            <TabC
              key={`${Active.id}:${ver}`}
              data={snap.data}
              live={live}
              ui={ui}
              redraw={redraw}
              flash={flash}
              persist={persist}
              apiWrite={apiWrite}
            />
          )}
        </section>

        <p className="mt-10 text-center text-xs text-sand/40">
          Simulaciones 100% en cliente — no modifican el Excel. Sólo lectura del snapshot del backend.
        </p>
      </div>
    </main>
  );
}
