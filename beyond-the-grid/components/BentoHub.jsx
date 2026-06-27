"use client";

import Link from "next/link";
import { useLinks } from "@/lib/links";
import { useAuth } from "./AuthGate";
import {
  IconBook, IconLink, IconUtensils, IconCalendar, IconRefresh, IconClock,
  IconRocket, IconCode, IconFolder, IconShield, IconArrow, IconExternal,
  IconCopy, IconGrad, IconOrbit,
} from "./icons";

const rgba = (hex, a) => {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

// action: "page" (html estático /team-hub/..) · "open" (externo links.json) · "copy" (portapapeles)
const SECTIONS = [
  {
    title: "Formación",
    items: [
      { label: "¿Qué es RDR?", desc: "Presentación de introducción al proyecto", icon: IconBook, accent: "#85C8FF", action: "page", target: "/team-hub/que-es-rdr.html" },
      { label: "Portal BBVA CIB", desc: "Copiar el enlace del portal corporativo", icon: IconLink, accent: "#8BE1E9", action: "copy", target: "portalBBVACIB" },
    ],
  },
  {
    title: "Equipo",
    items: [
      { label: "Comidas", desc: "Restaurante del equipo los jueves", icon: IconUtensils, accent: "#FFE761", action: "page", target: "/team-hub/comidas.html" },
      { label: "Vacaciones", desc: "Calendario y política del equipo", icon: IconCalendar, accent: "#85C8FF", action: "page", target: "/team-hub/vacaciones.html" },
      { label: "Retrospectiva", desc: "Retros y acciones de mejora", icon: IconRefresh, accent: "#FFB56B", action: "page", target: "/team-hub/retro.html" },
      { label: "Time Report · NFQ", desc: "Imputación de horas NFQ", icon: IconClock, accent: "#9694FF", action: "open", target: "timeReportNFQ" },
      { label: "Time Report · BBVA", desc: "Copiar el enlace de TR BBVA", icon: IconCopy, accent: "#9694FF", action: "copy", target: "timeReportBBVA" },
    ],
  },
  {
    title: "Proyectos",
    items: [
      { label: "Pases Calendados", desc: "Planificación de releases por entorno", icon: IconRocket, accent: "#88E783", action: "page", target: "/team-hub/pases-calendados.html" },
      { label: "Planificación", desc: "Hoja de planificación del equipo", icon: IconCalendar, accent: "#8BE1E9", action: "open", target: "planificacionNFQ" },
      { label: "GitHub BBVA", desc: "Copiar el enlace del repositorio", icon: IconCode, accent: "#85C8FF", action: "copy", target: "githubBBVA" },
      { label: "Drive BBVA", desc: "Copiar el enlace de Drive", icon: IconFolder, accent: "#88E783", action: "copy", target: "driveBBVA" },
    ],
  },
];

const COORD_SECTION = {
  title: "Coordinación",
  items: [
    { label: "Control RDR", desc: "Control económico (solo coordinación)", icon: IconShield, accent: "#9694FF", action: "page", target: "/team-hub/control.html" },
  ],
};

const TILE =
  "rdr-rise group relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-5 text-left backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

function Tile({ item, delay }) {
  const { getUrl, copyLink } = useLinks();
  const { icon: Icon, accent } = item;
  const Hint = item.action === "copy" ? IconCopy : item.action === "open" ? IconExternal : IconArrow;

  const inner = (
    <>
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30" style={{ background: accent }} />
      <div className="relative flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl border" style={{ borderColor: rgba(accent, 0.3), background: rgba(accent, 0.12), color: accent }}>
          <Icon size={22} />
        </span>
        <Hint size={18} className="mt-1 text-sand/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-sand/85" />
      </div>
      <div className="relative">
        <h3 className="font-display text-base font-bold leading-snug text-sand">{item.label}</h3>
        <p className="mt-1 text-sm leading-snug text-sand/65">{item.desc}</p>
      </div>
    </>
  );

  const style = { animationDelay: `${delay}ms` };

  if (item.action === "page")
    return <a href={item.target} className={TILE} style={style}>{inner}</a>;

  if (item.action === "open") {
    const url = getUrl(item.target);
    if (!url)
      return <div className={`${TILE} cursor-not-allowed opacity-50`} style={style} aria-disabled="true" title="Enlace no disponible aún">{inner}</div>;
    return <a href={url} target="_blank" rel="noopener noreferrer" className={TILE} style={style}>{inner}</a>;
  }

  return <button type="button" onClick={() => copyLink(item.target)} className={TILE} style={style}>{inner}</button>;
}

function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="rdr-blob left-[-6%] top-[8%] h-72 w-72" style={{ background: "#001391" }} />
      <span className="rdr-blob right-[-4%] top-[18%] h-80 w-80" style={{ background: "#85C8FF", animationDelay: "-4s" }} />
      <span className="rdr-blob bottom-[-8%] left-[28%] h-80 w-80" style={{ background: "#9694FF", animationDelay: "-8s" }} />
    </div>
  );
}

export default function BentoHub() {
  const { isCoordinador } = useAuth();
  const sections = isCoordinador ? [...SECTIONS, COORD_SECTION] : SECTIONS;
  let delay = 0;

  return (
    <main className="relative">
      <AmbientBackground />
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
        {/* Hero compacto */}
        <p className="rdr-rise font-sans text-xs font-bold uppercase tracking-[0.35em] text-serene/80">
          Bienvenido al hub
        </p>
        <h2 className="rdr-rise mt-2 max-w-2xl font-display text-2xl font-bold leading-tight text-sand sm:text-3xl" style={{ animationDelay: "60ms" }}>
          Documentación, formación y proyectos del equipo RDR
        </h2>

        {/* Feature: HUB Formativo -> esfera 3D por niveles */}
        <Link
          href="/formacion"
          className="rdr-rise group relative mt-8 flex flex-col gap-4 overflow-hidden rounded-3xl border border-serene/25 bg-gradient-to-br from-white/[0.09] to-white/[0.025] p-6 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-serene/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene focus-visible:ring-offset-2 focus-visible:ring-offset-midnight sm:p-8"
          style={{ animationDelay: "120ms" }}
        >
          <div aria-hidden className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 text-serene/20 transition-transform duration-500 group-hover:rotate-12 sm:block">
            <IconOrbit size={190} />
          </div>
          <span className="flex w-fit items-center gap-2 rounded-full border border-serene/30 bg-serene/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-serene">
            <IconGrad size={15} /> Ruta formativa
          </span>
          <div className="relative max-w-xl">
            <h3 className="font-display text-2xl font-bold text-sand sm:text-3xl">HUB Formativo</h3>
            <p className="mt-2 text-sm text-sand/70 sm:text-base">
              Explora la ruta de aprendizaje RDR por niveles 00–06 en un mapa interactivo. Formaciones disponibles y niveles que se irán desbloqueando.
            </p>
          </div>
          <span className="relative flex items-center gap-2 font-sans text-sm font-bold text-serene">
            Explorar la ruta
            <IconArrow size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>

        {/* Secciones bento */}
        {sections.map((sec) => (
          <section key={sec.title} className="mt-10" aria-labelledby={`sec-${sec.title}`}>
            <h2 id={`sec-${sec.title}`} className="mb-4 font-display text-sm font-bold uppercase tracking-[0.25em] text-sand/55">
              {sec.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {sec.items.map((item) => (
                <Tile key={item.label} item={item} delay={(delay += 40)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
