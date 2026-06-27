"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useLinks } from "@/lib/links";
import { FORMACIONES, isDisponible } from "@/lib/formaciones";
import { useAuth } from "./AuthGate";
import {
  IconBook, IconLink, IconUtensils, IconCalendar, IconRefresh, IconClock,
  IconRocket, IconCode, IconFolder, IconShield, IconArrow, IconExternal,
  IconCopy, IconGrad, IconOrbit,
} from "./icons";

const DISP = FORMACIONES.filter(isDisponible).length;
const PROX = FORMACIONES.length - DISP;

const rgba = (hex, a) => {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

// Color por sección -> agrupación legible en una sola rejilla (con leyenda).
const SECTIONS = [
  {
    id: "form", title: "Formación", color: "#85C8FF",
    items: [
      { label: "¿Qué es RDR?", desc: "Presentación de introducción", icon: IconBook, action: "page", target: "/team-hub/que-es-rdr.html" },
      { label: "Portal BBVA CIB", desc: "Copiar enlace del portal", icon: IconLink, action: "copy", target: "portalBBVACIB" },
    ],
  },
  {
    id: "equipo", title: "Equipo", color: "#FFB56B",
    items: [
      { label: "Comidas", desc: "Restaurante de los jueves", icon: IconUtensils, action: "page", target: "/team-hub/comidas.html" },
      { label: "Vacaciones", desc: "Calendario y política", icon: IconCalendar, action: "page", target: "/team-hub/vacaciones.html" },
      { label: "Retrospectiva", desc: "Retros y mejoras", icon: IconRefresh, action: "page", target: "/team-hub/retro.html" },
      { label: "Time Report · NFQ", desc: "Imputación de horas", icon: IconClock, action: "open", target: "timeReportNFQ" },
      { label: "Time Report · BBVA", desc: "Copiar enlace TR", icon: IconCopy, action: "copy", target: "timeReportBBVA" },
    ],
  },
  {
    id: "proy", title: "Proyectos", color: "#88E783",
    items: [
      { label: "Pases Calendados", desc: "Releases por entorno", icon: IconRocket, action: "page", target: "/team-hub/pases-calendados.html" },
      { label: "Planificación", desc: "Hoja de planificación", icon: IconCalendar, action: "open", target: "planificacionNFQ" },
      { label: "GitHub BBVA", desc: "Copiar el repositorio", icon: IconCode, action: "copy", target: "githubBBVA" },
      { label: "Drive BBVA", desc: "Copiar enlace de Drive", icon: IconFolder, action: "copy", target: "driveBBVA" },
    ],
  },
];

const COORD_SECTION = {
  id: "coord", title: "Coordinación", color: "#9694FF",
  items: [{ label: "Control RDR", desc: "Control económico", icon: IconShield, action: "page", target: "/team-hub/control.html" }],
};

// Tilt 3D dirigido por puntero (transform-only, GPU; desactivado si reduced-motion).
function useTilt(disabled) {
  const ref = useRef(null);
  const raf = useRef(0);
  const onPointerMove = (e) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", ((px - 0.5) * 9).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
      el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    });
  };
  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { ref, onPointerMove, onPointerLeave };
}

const TILE =
  "rdr-rise rdr-tilt group relative flex min-h-[112px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-xl transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene focus-visible:ring-offset-2 focus-visible:ring-offset-midnight lg:min-h-0";

function TileInner({ item, accent }) {
  const { icon: Icon } = item;
  const Hint = item.action === "copy" ? IconCopy : item.action === "open" ? IconExternal : IconArrow;
  return (
    <>
      {/* spotlight que sigue al cursor */}
      <span aria-hidden className="rdr-spot" style={{ background: `radial-gradient(150px circle at var(--mx,50%) var(--my,50%), ${rgba(accent, 0.22)}, transparent 70%)` }} />
      <div className="relative flex items-start justify-between" style={{ transform: "translateZ(45px)" }}>
        <span className="grid h-11 w-11 place-items-center rounded-xl border shadow-lg" style={{ borderColor: rgba(accent, 0.35), background: `linear-gradient(145deg, ${rgba(accent, 0.22)}, ${rgba(accent, 0.06)})`, color: accent, boxShadow: `0 8px 18px -8px ${rgba(accent, 0.6)}` }}>
          <Icon size={22} />
        </span>
        <Hint size={17} className="mt-1 text-sand/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-sand/85" />
      </div>
      <div className="relative" style={{ transform: "translateZ(25px)" }}>
        <h3 className="font-display text-[15px] font-bold leading-snug text-sand">{item.label}</h3>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-sand/65">{item.desc}</p>
      </div>
    </>
  );
}

function Tile({ item, accent, sectionTitle, reduce, delay }) {
  const { getUrl, copyLink } = useLinks();
  const tilt = useTilt(reduce);
  const aria = `${item.label} — ${sectionTitle}`;
  const style = { animationDelay: `${delay}ms` };

  if (item.action === "page")
    return <a {...tilt} href={item.target} aria-label={aria} className={TILE} style={style}><TileInner item={item} accent={accent} /></a>;

  if (item.action === "open") {
    const url = getUrl(item.target);
    if (!url)
      return <div {...tilt} aria-disabled="true" title="Enlace no disponible aún" className={`${TILE} cursor-not-allowed opacity-50`} style={style}><TileInner item={item} accent={accent} /></div>;
    return <a {...tilt} href={url} target="_blank" rel="noopener noreferrer" aria-label={aria} className={TILE} style={style}><TileInner item={item} accent={accent} /></a>;
  }

  return <button {...tilt} type="button" onClick={() => copyLink(item.target)} aria-label={aria} className={TILE} style={style}><TileInner item={item} accent={accent} /></button>;
}

function FeatureTile({ reduce }) {
  const tilt = useTilt(reduce);
  return (
    <Link
      {...tilt}
      href="/formacion"
      aria-label="HUB Formativo — ruta de aprendizaje por niveles"
      className="rdr-rise rdr-tilt group relative col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-serene/30 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-5 backdrop-blur-xl transition-colors duration-200 hover:border-serene/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene focus-visible:ring-offset-2 focus-visible:ring-offset-midnight sm:p-6"
    >
      <span aria-hidden className="rdr-spot" style={{ background: "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(133,200,255,.22), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute -right-6 -bottom-6 text-serene/15 transition-transform duration-500 group-hover:rotate-[18deg]" style={{ transform: "translateZ(10px)" }}>
        <IconOrbit size={200} />
      </div>
      <div className="relative flex items-center justify-between" style={{ transform: "translateZ(50px)" }}>
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-serene/40 text-serene shadow-lg" style={{ background: "linear-gradient(145deg, rgba(133,200,255,.25), rgba(133,200,255,.06))", boxShadow: "0 10px 22px -8px rgba(133,200,255,.6)" }}>
          <IconGrad size={26} />
        </span>
        <span className="rounded-full border border-serene/30 bg-serene/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-serene">Ruta formativa</span>
      </div>
      <div className="relative" style={{ transform: "translateZ(30px)" }}>
        <h3 className="font-display text-2xl font-bold text-sand sm:text-3xl">HUB Formativo</h3>
        <p className="mt-1.5 max-w-md text-sm text-sand/70">Mapa interactivo por niveles 00–06. Recorre las formaciones disponibles; el resto se irá desbloqueando.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" style={{ transform: "translateZ(20px)" }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-serene/15 px-2.5 py-1 text-xs font-bold text-serene">
            <span className="h-1.5 w-1.5 rounded-full bg-serene" /> {DISP} disponibles
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-sand/55">
            {PROX} próximamente
          </span>
        </div>
        <span className="mt-4 flex items-center gap-2 text-sm font-bold text-serene">
          Explorar la ruta
          <IconArrow size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function BentoHub() {
  const { isCoordinador } = useAuth();
  const reduce = useReducedMotion();
  const sections = isCoordinador ? [...SECTIONS, COORD_SECTION] : SECTIONS;

  let delay = 0;

  return (
    <main className="relative min-h-dvh w-full lg:h-dvh lg:overflow-hidden">
      {/* Campo de color animado tras el cristal (frosted sobre fondo vibrante). */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="rdr-blob left-[-8%] top-[6%] h-80 w-80" style={{ background: "#1D7CF4" }} />
        <span className="rdr-blob right-[6%] top-[-6%] h-72 w-72" style={{ background: "#85C8FF", animationDelay: "-3s" }} />
        <span className="rdr-blob bottom-[-12%] right-[-4%] h-96 w-96" style={{ background: "#9694FF", animationDelay: "-7s" }} />
        <span className="rdr-blob bottom-[2%] left-[18%] h-72 w-72" style={{ background: "#88E783", animationDelay: "-11s" }} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-16 pt-24 sm:px-6 lg:h-full lg:pb-12">
        {/* Hero compacto + leyenda */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.35em] text-serene/80">Bienvenido al hub</p>
            <h2 className="mt-1 font-display text-xl font-bold text-sand sm:text-2xl">Conocimiento RDR a un toque</h2>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Secciones">
            {sections.map((s) => (
              <li key={s.id} className="flex items-center gap-1.5 text-xs font-medium text-sand/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Bento: rellena el viewport (sin scroll en desktop) */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-5 lg:min-h-0 lg:flex-1 lg:auto-rows-fr lg:grid-flow-dense lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          <FeatureTile reduce={reduce} />
          {sections.flatMap((sec) =>
            sec.items.map((item) => (
              <Tile key={item.label} item={item} accent={sec.color} sectionTitle={sec.title} reduce={reduce} delay={(delay += 35)} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
