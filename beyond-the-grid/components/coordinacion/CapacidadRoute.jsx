"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { PALETTE } from "@/lib/palette";
import { useSnapshot } from "./datos";
import { num, h, curQ, horasQPersona } from "./model";
import { GLASS, FIELD, TEXT, Kpi, Chip, EmptyCard, PanelSkeleton, Bar } from "./ui";
import { IconUsers, IconPlus, IconX, IconBack, IconAlert } from "./icons";

/* Capacidad del equipo · Coordinación.
   Sustituye a la pestaña "9) Capacidad" del Excel: lee del snapshot los
   proyectos en ejecución del Q (2) Ejecución Real) y las personas con
   dedicación (3) Control Económico → horas disponibles por persona en el Q),
   y gestiona aquí las asignaciones Persona–Proyecto–%:
     · una persona no puede sumar más del 100 % entre proyectos (se marca);
     · cobertura del proyecto = Σ horasQ(persona) × % vs horas a ejecutar.
   Las asignaciones se guardan en la hoja propia "Capacidad_Web" del Excel vía
   backend (acción guardarCapacidadWeb) — la pestaña antigua no se toca. */

const SAVE_MS = 900;

// Estado de una persona según su carga asignada (Σ % en proyectos).
const cargaCol = (v) => (v > 100 ? "mandarin" : v >= 60 ? "lime" : "serene");
// Cobertura de un proyecto.
const cobCol = (v) => (v >= 0.95 && v <= 1.15 ? "lime" : v > 1.15 ? "serene" : "mandarin");

export default function CapacidadRoute() {
  const { snap, post } = useSnapshot();
  const data = snap?.data;

  /* ---------- Q ---------- */
  const qs = useMemo(() => {
    const deEco = (data?.economico?.bloques || []).map((b) => b.q);
    const deEje = data?.ejecucion?.qColumns || [];
    return deEco.filter((q) => deEje.includes(q)).length ? deEco.filter((q) => deEje.includes(q)) : deEco;
  }, [data]);
  const [q, setQ] = useState(null);
  useEffect(() => {
    if (!qs.length || q) return;
    setQ(qs.includes(curQ()) ? curQ() : qs[qs.length - 1]);
  }, [qs, q]);

  /* ---------- personas y proyectos del Q (solo lectura del Excel) ---------- */
  const personas = useMemo(() => {
    const bloque = (data?.economico?.bloques || []).find((b) => b.q === q);
    return (bloque?.personas || [])
      .map((p) => ({ nombre: p.nombre, equipo: p.equipo, horasQ: Math.round(horasQPersona(p)) }))
      .filter((p) => p.horasQ > 0);
  }, [data, q]);

  const proyectos = useMemo(
    () =>
      (data?.ejecucion?.records || [])
        .filter((r) => num(r.data?.[q]) > 0)
        .map((r) => ({ nombre: String(r.data.Proyecto || r.data.proyecto || "Proyecto"), horas: num(r.data[q]) })),
    [data, q]
  );

  /* ---------- asignaciones (persistidas en Capacidad_Web) ---------- */
  const [asigs, setAsigs] = useState(null); // [{proyecto, persona, pct}]
  const [saveState, setSaveState] = useState("ok"); // ok | saving | error | demo
  const saveTimer = useRef();
  const seededQ = useRef(null);

  useEffect(() => {
    if (!data || !q || seededQ.current === q) return;
    seededQ.current = q;
    setAsigs((data.capacidadWeb || []).filter((a) => a.q === q).map((a) => ({ proyecto: a.proyecto, persona: a.persona, pct: num(a.pct) })));
    setSaveState(snap?.demo ? "demo" : "ok");
  }, [data, q, snap]);

  const persist = useCallback(
    (next) => {
      setAsigs(next);
      clearTimeout(saveTimer.current);
      if (snap?.demo) { setSaveState("demo"); return; }
      setSaveState("saving");
      saveTimer.current = setTimeout(async () => {
        try {
          await post("guardarCapacidadWeb", { q, asignaciones: next.filter((a) => a.persona && a.proyecto) });
          setSaveState("ok");
        } catch {
          setSaveState("error");
        }
      }, SAVE_MS);
    },
    [post, q, snap]
  );

  const setPct = (proyecto, persona, pct) =>
    persist(asigs.map((a) => (a.proyecto === proyecto && a.persona === persona ? { ...a, pct } : a)));
  const addAsig = (proyecto, persona) => {
    if (!persona || asigs.some((a) => a.proyecto === proyecto && a.persona === persona)) return;
    persist([...asigs, { proyecto, persona, pct: 10 }]);
  };
  const delAsig = (proyecto, persona) => persist(asigs.filter((a) => !(a.proyecto === proyecto && a.persona === persona)));

  /* ---------- derivados ---------- */
  const der = useMemo(() => {
    if (!asigs) return null;
    const horasDe = Object.fromEntries(personas.map((p) => [p.nombre, p.horasQ]));
    const carga = {}; // persona → Σ pct
    asigs.forEach((a) => { carga[a.persona] = (carga[a.persona] || 0) + num(a.pct); });
    const proys = proyectos.map((pr) => {
      const del = asigs.filter((a) => a.proyecto === pr.nombre);
      const horasAsig = del.reduce((acc, a) => acc + ((horasDe[a.persona] || 0) * num(a.pct)) / 100, 0);
      return { ...pr, asigs: del, horasAsig, cobertura: pr.horas > 0 ? horasAsig / pr.horas : 0 };
    });
    const pers = personas.map((p) => ({ ...p, carga: carga[p.nombre] || 0 }));
    return {
      proys,
      pers,
      sobrecargadas: pers.filter((p) => p.carga > 100),
      infra: pers.filter((p) => p.carga < 60),
      sinCubrir: proys.filter((p) => p.cobertura < 0.95),
      horasSinAsignar: proys.reduce((a, p) => a + Math.max(0, p.horas - p.horasAsig), 0),
    };
  }, [asigs, personas, proyectos]);

  const saveTxt = {
    ok: ["text-lime", "Guardado"],
    saving: ["text-canary", "Guardando…"],
    error: ["text-mandarin", "Error al guardar — reintenta con cualquier cambio"],
    demo: ["text-canary", "Modo demo: los cambios no se guardan"],
  }[saveState];

  return (
    <main className="relative min-h-dvh w-full">
      <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
        <span className="rdr-blob left-[-6%] top-[8%] h-80 w-80" style={{ background: PALETTE.purple }} />
        <span className="rdr-blob bottom-[-10%] right-[-2%] h-96 w-96" style={{ background: PALETTE.royal }} />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-6">
        <header className="mb-6">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.4em] text-purple/80">Coordinación</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="flex items-center gap-3 font-display text-4xl font-bold leading-none tracking-tight text-sand sm:text-5xl">
              <IconUsers size={34} className="text-purple" /> Capacidad del equipo
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wide text-sand/80 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              <IconBack size={14} /> Inicio
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-pretty text-sm text-sand/65">
            Asigna personas a los proyectos del Q con su % de dedicación y comprueba coberturas y cargas.
            Se guarda automáticamente para todo el equipo.
          </p>
          {snap?.demo && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-canary/40 bg-canary/10 px-3 py-1.5 text-xs font-bold text-canary">
              <IconAlert size={13} /> Modo demo ({snap.error}) — datos de ejemplo, sin guardado.
            </p>
          )}
        </header>

        {!snap || !der ? (
          <PanelSkeleton />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {qs.map((x) => (
                <Chip key={x} on={q === x} onClick={() => { seededQ.current = null; setQ(x); }}>{x}</Chip>
              ))}
              <span aria-live="polite" className={`ml-auto text-[11px] font-bold ${saveTxt[0]}`}>{saveTxt[1]}</span>
            </div>

            {/* KPIs resumen */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Proyectos sin cubrir" value={`${der.sinCubrir.length} / ${der.proys.length}`} accent={der.sinCubrir.length ? "mandarin" : "lime"} />
              <Kpi label="Horas sin asignar" value={h(der.horasSinAsignar)} accent={der.horasSinAsignar > 0 ? "canary" : "lime"} />
              <Kpi label="Personas sobrecargadas" value={der.sobrecargadas.length} accent={der.sobrecargadas.length ? "mandarin" : "lime"} />
              <Kpi label="Personas por debajo del 60%" value={der.infra.length} accent={der.infra.length ? "canary" : "lime"} />
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_1fr]">
              {/* ── Proyectos con asignaciones ── */}
              <section className="space-y-3" aria-label="Proyectos del Q">
                {der.proys.length === 0 && <EmptyCard>No hay proyectos con horas en {q}.</EmptyCard>}
                {der.proys.map((pr) => (
                  <article key={pr.nombre} className={`${GLASS} p-4`}>
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="min-w-0 break-words font-display text-base font-bold text-sand">{pr.nombre}</h3>
                      <span className="text-[11px] tabular-nums text-sand/55">{h(pr.horas)} a ejecutar</span>
                    </div>
                    <Bar
                      label="Cobertura"
                      v={pr.cobertura}
                      col={cobCol(pr.cobertura)}
                      fmt={`${h(pr.horasAsig)} (${Math.round(pr.cobertura * 100)}%)`}
                    />
                    <ul className="mt-3 space-y-1.5">
                      {pr.asigs.map((a) => {
                        const per = der.pers.find((p) => p.nombre === a.persona);
                        const sobre = per && per.carga > 100;
                        return (
                          <li key={a.persona} className="flex flex-wrap items-center gap-2">
                            <span className={`min-w-0 flex-1 truncate text-[12.5px] ${sobre ? "font-bold text-mandarin" : "text-sand"}`}>
                              {a.persona}
                              {sobre && <span className="ml-1 text-[10px]">({per.carga}% total ⚠)</span>}
                            </span>
                            <input
                              type="range" min="0" max="100" step="5" value={a.pct}
                              aria-label={`% de ${a.persona} en ${pr.nombre}`}
                              onChange={(e) => setPct(pr.nombre, a.persona, Number(e.target.value))}
                              className="w-28 accent-[#9694FF]"
                            />
                            <span className="w-14 text-right text-[12px] font-bold tabular-nums text-sand/80">
                              {a.pct}% <span className="text-[10px] font-normal text-sand/45">({h(((per?.horasQ || 0) * a.pct) / 100)})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => delAsig(pr.nombre, a.persona)}
                              aria-label={`Quitar a ${a.persona} de ${pr.nombre}`}
                              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-sand/40 transition hover:bg-white/10 hover:text-mandarin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                            >
                              <IconX size={12} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-2 flex items-center gap-2">
                      <IconPlus size={12} className="shrink-0 text-sand/40" aria-hidden />
                      <select
                        value=""
                        aria-label={`Añadir persona a ${pr.nombre}`}
                        onChange={(e) => addAsig(pr.nombre, e.target.value)}
                        className={`${FIELD} !py-1 text-xs`}
                      >
                        <option value="">Añadir persona…</option>
                        {der.pers
                          .filter((p) => !pr.asigs.some((a) => a.persona === p.nombre))
                          .map((p) => (
                            <option key={p.nombre} value={p.nombre}>
                              {p.nombre} · libre {Math.max(0, 100 - p.carga)}%
                            </option>
                          ))}
                      </select>
                    </div>
                  </article>
                ))}
              </section>

              {/* ── Personas: carga asignada ── */}
              <section className={`${GLASS} sticky top-24 p-4`} aria-label="Carga por persona">
                <h2 className="mb-1 font-display text-lg font-bold text-sand">Carga por persona</h2>
                <p className="mb-3 text-[11px] text-sand/50">
                  % asignado entre todos los proyectos del Q (las horas de cada persona salen del Control Económico).
                </p>
                {der.pers.length === 0 ? (
                  <EmptyCard>No hay personas con dedicación en {q}.</EmptyCard>
                ) : (
                  <div className="space-y-3">
                    {der.pers
                      .slice()
                      .sort((a, b) => b.carga - a.carga)
                      .map((p) => (
                        <Bar
                          key={p.nombre}
                          label={p.nombre}
                          extra={`· ${h(p.horasQ)}`}
                          v={p.carga / 100}
                          col={cargaCol(p.carga)}
                          fmt={`${p.carga}%`}
                        />
                      ))}
                  </div>
                )}
                {(der.sobrecargadas.length > 0 || der.sinCubrir.length > 0) && (
                  <div className="mt-4 space-y-1.5 border-t border-white/[0.08] pt-3 text-[12px]">
                    {der.sobrecargadas.map((p) => (
                      <p key={p.nombre} className={TEXT.mandarin}>⚠ {p.nombre} está al {p.carga}% (más del 100%).</p>
                    ))}
                    {der.sinCubrir.map((p) => (
                      <p key={p.nombre} className={TEXT.canary}>
                        ◔ {p.nombre}: faltan {h(Math.max(0, p.horas - p.horasAsig))} por cubrir.
                      </p>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
