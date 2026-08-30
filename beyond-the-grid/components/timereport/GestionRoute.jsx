"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PALETTE } from "@/lib/palette";
import { GLASS, FIELD, TEXT, Kpi, EmptyCard, PanelSkeleton } from "../coordinacion/ui";
import { IconClock, IconAlert, IconPlus, IconX, IconReload } from "../coordinacion/icons";
import { useTimeReport, useFestivos, useEquipo } from "./datos";
import {
  num, curQ, hoyISO, quincenasDeQ, quincenaDe, horasDe, horasProyecto, esFinde,
  repartir, capacidadMaxima, NIVELES2, NIVEL2_ANALISIS, SOPORTE_ID,
} from "./model";

/* Gestión del Time Report · Coordinación.
   Pestaña RESUMEN: proyectos del Q con horas incurridas/pendientes (con
   desglose por quincena), total pendiente y capacidad máxima informativa.
   Pestaña PROYECTOS Y REPARTO: alta de proyectos, estados (Nivel 2) por
   quincena, personas bloqueadas y el botón de repartir (previsualiza,
   avisa de a quién notificar y guarda al confirmar). */

const ACCENT = PALETTE.canary;

const qsSelector = (extra) => {
  const año = new Date().getFullYear();
  const set = new Set(extra || []);
  [año - 1, año, año + 1].forEach((a) => { for (let i = 1; i <= 4; i++) set.add(`${a}Q${i}`); });
  return [...set].sort();
};

export default function GestionRoute() {
  const [q, setQ] = useState(curQ());
  const { snap, reload, post } = useTimeReport(q);
  const festivos = useFestivos();
  const equipo = useEquipo();
  const [tab, setTab] = useState("resumen"); // resumen | proyectos
  const [nuevo, setNuevo] = useState({ nombre: "", sdatool: "", feature: "", horas: "" });
  const [editando, setEditando] = useState(null); // { id, nombre, sdatool, feature, horas }
  const [preview, setPreview] = useState(null); // resultado de repartir() sin guardar
  const [estado, setEstado] = useState(""); // "" | guardando | error:...
  const [verQuincenas, setVerQuincenas] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(null);
  // Pestaña Imputación: quincena que se está viendo (por defecto la actual).
  const [quincenaVista, setQuincenaVista] = useState(() => Math.min(6, Math.max(1, quincenaDe(curQ(), hoyISO()) || 1)));

  const personas = useMemo(() => (equipo || []).map((m) => m.nombre), [equipo]);
  const qs = quincenasDeQ(q);
  const hoy = hoyISO();
  const qActualN = Math.min(6, Math.max(1, quincenaDe(q, hoy) || 1));

  /* Estado LOCAL (optimista): los cambios se pintan al instante y el guardado
     va en segundo plano — sin recargar el snapshot en cada edición (el
     "refresco" molesto). Solo se resincroniza al cambiar de Q o si un
     guardado falla. */
  const [proyectos, setProyectos] = useState(null);
  const [reparto, setReparto] = useState([]);
  const [bloqueadas, setBloqueadas] = useState(() => new Set());
  const seeded = useRef(null);
  useEffect(() => {
    if (!snap?.data) return;
    const key = q + "|" + (snap.data.generadoEn || "");
    if (seeded.current === key) return;
    seeded.current = key;
    setProyectos(snap.data.proyectos || []);
    setReparto(snap.data.reparto || []);
    setBloqueadas(new Set(snap.data.bloqueadas || []));
  }, [snap, q]);

  const cargando = !snap || festivos == null || equipo == null || proyectos == null;

  /* Resumen por proyecto: incurridas (días <= hoy), planificadas, pendientes,
     y desglose por quincena. */
  const resumen = useMemo(() => {
    return (proyectos || []).map((p) => {
      const filas = reparto.filter((r) => r.proyectoId === p.id);
      let incurridas = 0, plan = 0;
      const porQ = [0, 0, 0, 0, 0, 0];
      filas.forEach((r) => {
        Object.entries(r.dias || {}).forEach(([d, h]) => {
          plan += num(h);
          if (d <= hoy) incurridas += num(h);
        });
        if (r.quincena >= 1 && r.quincena <= 6) porQ[r.quincena - 1] += horasDe(r.dias);
      });
      return { ...p, incurridas, plan, pendientes: Math.max(0, num(p.horas) - incurridas), sinRepartir: num(p.horas) - plan, porQ };
    });
  }, [proyectos, reparto, hoy]);

  const totalPendiente = resumen.reduce((a, p) => a + p.pendientes, 0);
  const capMax = useMemo(
    () => capacidadMaxima({ q, personas: personas.filter((p) => !bloqueadas.has(p)), festivos: festivos || {}, hoy }),
    [q, personas, bloqueadas, festivos, hoy]
  );

  /* Guardado en SEGUNDO PLANO: no recarga nada; si falla, resincroniza. */
  const pendientesRef = useRef(0);
  const salva = (fn) => {
    pendientesRef.current++;
    setEstado("guardando");
    Promise.resolve()
      .then(fn)
      .then(() => {
        if (--pendientesRef.current === 0) {
          setEstado("ok");
          setTimeout(() => setEstado((e) => (e === "ok" ? "" : e)), 1800);
        }
      })
      .catch((e) => {
        pendientesRef.current = Math.max(0, pendientesRef.current - 1);
        setEstado("error:" + String(e.message || e));
        seeded.current = null; // resincronizar con lo guardado de verdad
        reload();
      });
  };

  /* Cambia los proyectos en pantalla YA y guarda por detrás. */
  const aplicaProyectos = (next) => {
    setProyectos(next);
    salva(() => post("guardarProyectos", { q, proyectos: next }));
  };

  // Se puede pegar el código completo ("SDATOOL-49780" / "CIBRDR-1088"):
  // se queda el código y el prefijo lo pone la web, sin cortar nada.
  const limpiaSdatool = (v) => String(v).replace(/^\s*sdatool[\s-]*/i, "").trim();
  const limpiaFeature = (v) => String(v).replace(/^\s*cibrdr[\s-]*/i, "").trim();

  const altaProyecto = () => {
    const estados = {};
    for (let i = 1; i <= 6; i++) estados[i] = NIVEL2_ANALISIS;
    const p = {
      id: "p" + Date.now(),
      nombre: nuevo.nombre.trim(),
      sdatool: "SDATOOL-" + limpiaSdatool(nuevo.sdatool),
      feature: nuevo.feature.trim() ? "CIBRDR-" + limpiaFeature(nuevo.feature) : "",
      horas: Math.round(num(nuevo.horas)),
      estados,
      personas: [],
    };
    aplicaProyectos([...proyectos, p]);
    setNuevo({ nombre: "", sdatool: "", feature: "", horas: "" });
  };

  const guardaEdicion = () => {
    const e = editando;
    aplicaProyectos(
      proyectos.map((p) =>
        p.id === e.id
          ? {
              ...p,
              nombre: e.nombre.trim(),
              sdatool: "SDATOOL-" + limpiaSdatool(e.sdatool),
              feature: e.feature.trim() ? "CIBRDR-" + limpiaFeature(e.feature) : "",
              horas: Math.round(num(e.horas)),
            }
          : p
      )
    );
    setEditando(null);
  };

  const togglePersonaProy = (id, nombre) =>
    aplicaProyectos(
      proyectos.map((p) => {
        if (p.id !== id) return p;
        const set = new Set(p.personas || []);
        if (set.has(nombre)) set.delete(nombre);
        else set.add(nombre);
        return { ...p, personas: [...set] };
      })
    );

  const cambiaEstado = (id, quincena, valor) =>
    aplicaProyectos(proyectos.map((p) => (p.id === id ? { ...p, estados: { ...p.estados, [quincena]: valor } } : p)));

  const borraProyecto = (id) => {
    aplicaProyectos(proyectos.filter((p) => p.id !== id));
    setConfirmarBorrado(null);
  };

  const toggleBloqueo = (nombre) => {
    const next = new Set(bloqueadas);
    if (next.has(nombre)) next.delete(nombre);
    else next.add(nombre);
    setBloqueadas(next);
    salva(() => post("guardarBloqueadas", { q, personas: [...next] }));
  };

  const calcularReparto = () => {
    const r = repartir({ q, proyectos, repartoActual: reparto, personas, bloqueadas: [...bloqueadas], festivos: festivos || {}, hoy });
    setPreview(r);
  };

  const confirmarReparto = () => {
    const { desde } = preview;
    setReparto(preview.reparto);
    salva(() => post("guardarReparto", { q, desdeQuincena: desde, filas: preview.reparto.filter((r) => r.quincena >= desde) }));
    setPreview(null);
  };

  const nombreProy = (id) => (id === SOPORTE_ID ? "Soporte usuarios" : proyectos.find((p) => p.id === id)?.nombre || id);

  return (
    <main className="relative min-h-dvh w-full">
      <div aria-hidden className="pointer-events-none fixed inset-[-3%] -z-10 overflow-hidden">
        <span className="rdr-blob left-[-6%] top-[8%] h-80 w-80" style={{ background: ACCENT }} />
        <span className="rdr-blob bottom-[-10%] right-[-2%] h-96 w-96" style={{ background: PALETTE.royal }} />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-6">
        <header className="mb-6">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.4em] text-canary/80">Coordinación</p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-bold leading-none tracking-tight text-sand sm:text-5xl">
            <IconClock size={34} className="text-canary" /> Time Report
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm text-sand/65">
            Proyectos del trimestre y reparto de horas por quincena entre el equipo. Los miembros ven su
            imputación en la página Time Report del hub.
          </p>
          {snap?.error && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-canary/40 bg-canary/10 px-3 py-1.5 text-xs font-bold text-canary">
              <IconAlert size={13} /> {snap.error}
            </p>
          )}
        </header>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sand/60">
            Trimestre
            <select value={q} onChange={(e) => { setPreview(null); setProyectos(null); setQ(e.target.value); }} className={`${FIELD} !py-2 font-bold`}>
              {qsSelector(snap?.data?.qs).map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
          <div role="tablist" className="inline-flex gap-1 rounded-full border border-white/12 bg-white/[0.055] p-1">
            {[["resumen", "Resumen"], ["proyectos", "Proyectos y reparto"], ["imputacion", "Imputación"]].map(([id, label]) => (
              <button
                key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  tab === id ? "bg-[#F5E33D] text-[#001391]" : "text-sand/70 hover:text-sand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {estado === "guardando" && <span className="text-[11px] font-bold text-canary">Guardando…</span>}
          {estado === "ok" && <span className="text-[11px] font-bold text-lime">Guardado ✓</span>}
          {estado.startsWith("error:") && <span className="text-[11px] font-bold text-mandarin">No se pudo guardar ({estado.slice(6)}) — recargando datos</span>}
        </div>

        {cargando ? (
          <PanelSkeleton />
        ) : tab === "resumen" ? (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Proyectos" value={proyectos.length} accent="serene" />
              <Kpi label="Horas de proyectos" value={resumen.reduce((a, p) => a + num(p.horas), 0) + " h"} accent="serene" />
              <Kpi label="Pendientes de incurrir" value={totalPendiente + " h"} accent={totalPendiente > 0 ? "canary" : "lime"} />
              <Kpi label="Capacidad máx. restante" value={capMax + " h"} accent={capMax >= totalPendiente ? "lime" : "mandarin"} />
            </div>
            <p className="mb-4 text-[11px] text-sand/45">
              Capacidad máxima informativa: 24 h × persona no bloqueada × día laborable (sin findes ni
              festivos) desde hoy hasta el 15 del último mes.
            </p>
            <div className="mb-3">
              <button
                type="button" onClick={() => setVerQuincenas((v) => !v)}
                className="rounded-full border border-white/15 bg-white/[0.055] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sand/75 transition hover:border-white/30 hover:bg-white/10"
              >
                {verQuincenas ? "Ocultar quincenas" : "Ver por quincena"}
              </button>
            </div>
            {resumen.length === 0 && <EmptyCard>No hay proyectos en {q}: añádelos en la pestaña &quot;Proyectos y reparto&quot;.</EmptyCard>}
            {resumen.length > 0 && (
              <div className={`${GLASS} overflow-x-auto p-2`}>
                <table className="w-full min-w-[760px] border-collapse text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-sand/50">
                      <th className="p-2">Proyecto</th>
                      <th className="p-2">SDATOOL</th>
                      <th className="p-2">Feature</th>
                      <th className="p-2 text-right">Horas</th>
                      <th className="p-2 text-right">Incurridas</th>
                      <th className="p-2 text-right">Por incurrir</th>
                      {verQuincenas && qs.map((x) => <th key={x.n} className="p-2 text-right">{x.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.map((p) => (
                      <tr key={p.id} className="border-t border-white/[0.07]">
                        <td className="p-2 font-bold text-sand">{p.nombre}{p.sinRepartir > 0 && <span className="ml-1.5 text-[10px] font-bold text-mandarin" title="Horas sin repartir aún">⚠ {p.sinRepartir} sin repartir</span>}</td>
                        <td className="p-2 text-sand/70">{p.sdatool}</td>
                        <td className="p-2 text-sand/70">{p.feature || "—"}</td>
                        <td className="p-2 text-right tabular-nums text-sand/85">{num(p.horas)}</td>
                        <td className="p-2 text-right tabular-nums text-sand/85">{p.incurridas}</td>
                        <td className={`p-2 text-right font-bold tabular-nums ${p.pendientes > 0 ? TEXT.canary : TEXT.lime}`}>{p.pendientes}</td>
                        {verQuincenas && p.porQ.map((h, i) => (
                          <td key={i} className={`p-2 text-right tabular-nums ${i + 1 === qActualN ? "font-bold text-sand" : "text-sand/60"}`}>{h || ""}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : tab === "imputacion" ? (
          /* ── Imputación de TODAS las personas en una quincena ── */
          (() => {
            const qn = qs.find((x) => x.n === quincenaVista);
            const filasQ = reparto.filter((r) => r.quincena === quincenaVista);
            const grupos = personas
              .map((per) => ({
                per,
                filas: [...filasQ.filter((r) => r.persona === per)].sort((a, b) =>
                  a.proyectoId === SOPORTE_ID ? 1 : b.proyectoId === SOPORTE_ID ? -1 : 0
                ),
              }))
              .filter((g) => g.filas.length);
            return (
              <>
                <div role="tablist" aria-label="Quincena" className="mb-4 inline-flex flex-wrap gap-1 rounded-full border border-white/12 bg-white/[0.055] p-1">
                  {qs.map((x) => (
                    <button
                      key={x.n} role="tab" aria-selected={quincenaVista === x.n} onClick={() => setQuincenaVista(x.n)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                        quincenaVista === x.n ? "bg-[#F5E33D] text-[#001391]" : "text-sand/70 hover:text-sand"
                      }`}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
                {grupos.length === 0 ? (
                  <EmptyCard>Sin imputación repartida en {qn?.label} de {q}.</EmptyCard>
                ) : (
                  <div className={`${GLASS} overflow-x-auto p-3`}>
                    <table className="w-full min-w-[980px] border-collapse text-[12px]">
                      <thead>
                        <tr className="text-left text-[9.5px] uppercase tracking-wide text-sand/50">
                          <th className="p-1.5">Persona</th>
                          <th className="p-1.5">Proyecto</th>
                          <th className="p-1.5 text-right">Total</th>
                          {qn.dias.map((d) => (
                            <th key={d} className={`p-1.5 text-center ${esFinde(d) ? "text-sand/25" : ""} ${d === hoy ? "text-serene" : ""}`}>
                              {Number(d.slice(8))}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grupos.map((g) => {
                          const totalPer = g.filas.reduce((a, r) => a + horasDe(r.dias), 0);
                          return g.filas.map((r, i) => (
                            <tr key={g.per + i} className={i === 0 ? "border-t-2 border-white/[0.14]" : "border-t border-white/[0.05]"}>
                              <td className="p-1.5 align-top">
                                {i === 0 && (
                                  <>
                                    <span className="block font-bold text-sand">{g.per}{bloqueadas.has(g.per) ? " 🔒" : ""}</span>
                                    <span className="block text-[10px] tabular-nums text-sand/50">{totalPer} h en la quincena</span>
                                  </>
                                )}
                              </td>
                              <td className="p-1.5 text-sand/80">{nombreProy(r.proyectoId)}</td>
                              <td className="p-1.5 text-right font-bold tabular-nums text-sand/85">{horasDe(r.dias)}</td>
                              {qn.dias.map((d) => (
                                <td key={d} className={`p-1.5 text-center tabular-nums ${num(r.dias[d]) > 0 ? "font-bold text-sand" : "text-sand/15"}`}>
                                  {num(r.dias[d]) > 0 ? num(r.dias[d]) : ""}
                                </td>
                              ))}
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()
        ) : (
          <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_1fr]">
            <section className="space-y-4">
              {/* Alta de proyecto */}
              <div className={`${GLASS} p-4`}>
                <h2 className="mb-3 font-display text-base font-bold text-sand">Añadir proyecto</h2>
                <div className="space-y-2.5">
                  <input type="text" placeholder="Nombre del proyecto" aria-label="Nombre del proyecto" value={nuevo.nombre}
                    onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={`${FIELD} w-full`} />
                  <div className="flex flex-wrap gap-2">
                    <div className={`${FIELD} flex min-w-[180px] flex-1 items-center gap-0 !py-0`}>
                      <span className="shrink-0 py-2 text-sand/45">SDATOOL-</span>
                      <input type="text" placeholder="49780 (o pégalo completo)" aria-label="Código SDATOOL" value={nuevo.sdatool}
                        onChange={(e) => setNuevo({ ...nuevo, sdatool: limpiaSdatool(e.target.value) })}
                        className="w-full bg-transparent py-2 focus:outline-none" />
                    </div>
                    <div className={`${FIELD} flex min-w-[160px] flex-1 items-center gap-0 !py-0`}>
                      <span className="shrink-0 py-2 text-sand/45">CIBRDR-</span>
                      <input type="text" placeholder="1088" aria-label="Feature CIBRDR" value={nuevo.feature}
                        onChange={(e) => setNuevo({ ...nuevo, feature: limpiaFeature(e.target.value) })}
                        className="w-full bg-transparent py-2 focus:outline-none" />
                    </div>
                    <input type="number" min="1" step="1" placeholder="Horas" aria-label="Horas a incurrir" value={nuevo.horas}
                      onChange={(e) => setNuevo({ ...nuevo, horas: e.target.value })} className={`${FIELD} w-28 text-right tabular-nums`} />
                  </div>
                </div>
                <button
                  type="button" disabled={!nuevo.nombre.trim() || !nuevo.sdatool.trim() || num(nuevo.horas) <= 0}
                  onClick={altaProyecto}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#F5E33D] px-3 py-2 text-xs font-bold text-[#001391] transition hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconPlus size={13} /> Añadir
                </button>
              </div>

              {/* Lista de proyectos con estados por quincena */}
              {proyectos.length === 0 && <EmptyCard>Sin proyectos en {q}.</EmptyCard>}
              {proyectos.map((p) => (
                <article key={p.id} className={`${GLASS} p-4`}>
                  {editando?.id === p.id ? (
                    /* ── Edición de los datos del proyecto ── */
                    <div className="mb-3 space-y-2.5">
                      <input type="text" value={editando.nombre} aria-label="Editar nombre"
                        onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className={`${FIELD} w-full`} />
                      <div className="flex flex-wrap gap-2">
                        <div className={`${FIELD} flex min-w-[180px] flex-1 items-center gap-0 !py-0`}>
                          <span className="shrink-0 py-2 text-sand/45">SDATOOL-</span>
                          <input type="text" value={editando.sdatool} aria-label="Editar SDATOOL"
                            onChange={(e) => setEditando({ ...editando, sdatool: limpiaSdatool(e.target.value) })}
                            className="w-full bg-transparent py-2 focus:outline-none" />
                        </div>
                        <div className={`${FIELD} flex min-w-[160px] flex-1 items-center gap-0 !py-0`}>
                          <span className="shrink-0 py-2 text-sand/45">CIBRDR-</span>
                          <input type="text" value={editando.feature} aria-label="Editar Feature"
                            onChange={(e) => setEditando({ ...editando, feature: limpiaFeature(e.target.value) })}
                            className="w-full bg-transparent py-2 focus:outline-none" />
                        </div>
                        <input type="number" min="1" step="1" value={editando.horas} aria-label="Editar horas"
                          onChange={(e) => setEditando({ ...editando, horas: e.target.value })} className={`${FIELD} w-28 text-right tabular-nums`} />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={guardaEdicion} disabled={!editando.nombre.trim() || !editando.sdatool.trim() || num(editando.horas) <= 0}
                          className="rounded-lg bg-[#88E783] px-3 py-1.5 text-xs font-bold text-[#001391] transition hover:brightness-95 disabled:opacity-40">
                          Guardar cambios
                        </button>
                        <button type="button" onClick={() => setEditando(null)}
                          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-sand/70 transition hover:bg-white/10">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="min-w-0 break-words font-display text-base font-bold text-sand">{p.nombre}</h3>
                      <span className="flex items-center gap-2 text-[11px] tabular-nums text-sand/55">
                        {p.sdatool} · {p.feature || "sin feature"} · {num(p.horas)} h
                        <button type="button"
                          onClick={() => setEditando({ id: p.id, nombre: p.nombre, sdatool: limpiaSdatool(p.sdatool), feature: limpiaFeature(p.feature), horas: num(p.horas) })}
                          aria-label={`Editar ${p.nombre}`}
                          className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase text-sand/70 transition hover:border-white/30 hover:bg-white/10">
                          Editar
                        </button>
                        {confirmarBorrado === p.id ? (
                          <span className="flex items-center gap-1.5">
                            <span className="font-bold text-mandarin">¿Eliminar?</span>
                            <button type="button" onClick={() => borraProyecto(p.id)} className="rounded bg-mandarin px-1.5 py-0.5 font-bold text-[#001391]">Sí</button>
                            <button type="button" onClick={() => setConfirmarBorrado(null)} className="rounded border border-white/20 px-1.5 py-0.5 text-sand/70">No</button>
                          </span>
                        ) : (
                          <button type="button" onClick={() => setConfirmarBorrado(p.id)} aria-label={`Eliminar ${p.nombre}`}
                            className="grid h-6 w-6 place-items-center rounded-md text-sand/40 transition hover:bg-white/10 hover:text-mandarin">
                            <IconX size={12} />
                          </button>
                        )}
                      </span>
                    </div>
                  )}

                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-sand/45">Estado (Nivel 2) por quincena</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {qs.map((x) => (
                      <label key={x.n} className="block">
                        <span className="text-[9.5px] text-sand/45">{x.label}</span>
                        <select
                          value={(p.estados || {})[x.n] || NIVEL2_ANALISIS}
                          onChange={(e) => cambiaEstado(p.id, x.n, e.target.value)}
                          aria-label={`Estado de ${p.nombre} en ${x.label}`}
                          className={`${FIELD} block w-full !py-1.5 text-[12px]`}
                        >
                          {NIVELES2.map((n2) => <option key={n2} value={n2}>{n2 === NIVEL2_ANALISIS ? "Análisis y diseño" : n2}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>

                  {/* Personas del proyecto: si se selecciona alguna, el reparto
                      SOLO usa esas (menos las bloqueadas). Sin selección = todas. */}
                  <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-sand/45">
                    Repartir solo entre… <span className="font-normal normal-case text-sand/40">(sin selección = todo el equipo)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {personas.map((n) => {
                      const sel = (p.personas || []).includes(n);
                      return (
                        <button key={n} type="button" onClick={() => togglePersonaProy(p.id, n)} aria-pressed={sel}
                          className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold transition ${
                            sel ? "border-transparent bg-[#85C8FF] text-[#001391]" : "border-white/12 bg-white/[0.03] text-sand/55 hover:border-white/30"
                          }`}>
                          {n}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2.5 text-[10.5px] text-sand/45">Repartidas {horasProyecto(reparto, p.id)} de {num(p.horas)} h</p>
                </article>
              ))}
            </section>

            <section className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              {/* Bloqueos */}
              <div className={`${GLASS} p-4`}>
                <h2 className="mb-1 font-display text-base font-bold text-sand">Personas bloqueadas</h2>
                <p className="mb-3 text-[11px] text-sand/50">
                  Una persona bloqueada conserva su imputación tal cual: el reparto no le añade ni le quita horas.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {personas.map((n) => {
                    const b = bloqueadas.has(n);
                    return (
                      <button
                        key={n} type="button" onClick={() => toggleBloqueo(n)} aria-pressed={b}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                          b ? "border-transparent bg-[#FF7D69] text-[#001391]" : "border-white/15 bg-white/[0.04] text-sand/70 hover:border-white/30"
                        }`}
                      >
                        {b ? "🔒 " : ""}{n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reparto */}
              <div className={`${GLASS} p-4`}>
                <h2 className="mb-1 font-display text-base font-bold text-sand">Repartir horas</h2>
                <p className="mb-3 text-[11px] text-sand/50">
                  Reparte lo pendiente entre las personas no bloqueadas (quincena actual → 15 del último mes,
                  mínimo de personas por proyecto), rellena la jornada con Soporte a Usuarios y deja la última
                  quincena entera a Soporte. Antes de guardar verás quién queda afectado.
                </p>
                <button
                  type="button" onClick={calcularReparto}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#88E783] px-3 py-2 text-xs font-bold text-[#001391] transition hover:brightness-95 active:scale-95"
                >
                  <IconReload size={13} /> Calcular reparto
                </button>

                {preview && preview.error && (
                  <p className="mt-3 rounded-lg border border-mandarin/50 bg-mandarin/10 px-3 py-2 text-xs font-bold text-mandarin">{preview.error}</p>
                )}
                {preview && !preview.error && (
                  <div className="mt-3 space-y-2 text-[12px]">
                    <p className="text-sand/70">
                      Reparto desde la quincena <strong className="text-sand">{qs[preview.desde - 1]?.label}</strong>.
                    </p>
                    {preview.sinHueco.length > 0 && (
                      <p className="rounded-lg border border-mandarin/50 bg-mandarin/10 px-2.5 py-1.5 text-[11.5px] font-bold text-mandarin">
                        ⚠ No caben: {preview.sinHueco.map((s) => `${s.proyecto} (${s.horas} h${s.motivo ? " · " + s.motivo : ""})`).join(" · ")}
                      </p>
                    )}
                    {/* Resumen por persona */}
                    <ul className="space-y-1">
                      {[...new Set(preview.reparto.filter((r) => r.quincena >= preview.desde).map((r) => r.persona))].sort().map((per) => {
                        const filas = preview.reparto.filter((r) => r.persona === per && r.quincena >= preview.desde);
                        const proys = [...new Set(filas.filter((r) => r.proyectoId !== SOPORTE_ID).map((r) => nombreProy(r.proyectoId)))];
                        const total = filas.reduce((a, r) => a + horasDe(r.dias), 0);
                        return (
                          <li key={per} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5">
                            <span className="font-bold text-sand">{per}</span>
                            <span className="tabular-nums text-sand/60"> · {total} h</span>
                            <span className="text-sand/55">{proys.length ? " · " + proys.join(", ") : " · solo Soporte"}</span>
                          </li>
                        );
                      })}
                    </ul>
                    {preview.notificar.length > 0 && (
                      <p className="rounded-lg border border-canary/40 bg-canary/10 px-2.5 py-1.5 text-[11.5px] font-bold text-canary">
                        📣 Al guardar hay que NOTIFICAR el cambio de imputación a: {preview.notificar.join(", ")}
                      </p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={confirmarReparto}
                        className="rounded-lg bg-[#88E783] px-3 py-2 text-xs font-bold text-[#001391] transition hover:brightness-95 active:scale-95">
                        Confirmar y guardar
                      </button>
                      <button type="button" onClick={() => setPreview(null)}
                        className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-sand/70 transition hover:bg-white/10">
                        Descartar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
