"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { rgba } from "@/lib/ui";
import { PALETTE } from "@/lib/palette";
import { useTilt } from "@/hooks/useTilt";
import { ACCENT } from "./constants";
import { GLASS, Modal, Skel, Spinner } from "./ui";
import {
  IconArchive, IconArrowR, IconCalendarPlus, IconEnter, IconEyeOff,
  IconHistory, IconRestore, IconTrash, IconX,
} from "./icons";

const INPUT =
  "w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-sand placeholder:text-sand/40 transition focus:border-mandarin/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene";
const LABEL = "mb-1 block text-xs font-bold uppercase tracking-wider text-sand/60";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-mandarin px-4 py-2 text-sm font-bold text-electric shadow transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-medium text-sand/80 transition hover:border-white/30 hover:bg-white/[0.1] hover:text-sand active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene";

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

/** Meta de una sesión archivada/inactiva: "fecha · N participantes · N tarjetas [· N votos]". */
function metaSesion(s, conVotos) {
  return [
    s.fecha,
    `${s.participantes || 0} participante${s.participantes !== 1 ? "s" : ""}`,
    `${s.tarjetas || 0} tarjeta${s.tarjetas !== 1 ? "s" : ""}`,
    ...(conVotos ? [`${s.votosTermometro || 0} voto${s.votosTermometro !== 1 ? "s" : ""}`] : []),
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Menú inicial: unirse a una sesión activa, panel de organizador (crear /
 * archivar / inactivar / gestionar inactivas) e histórico de retrospectivas.
 * El login/nombre/rol del legacy desaparecen: la identidad viene del chrome.
 */
export default function MenuView({
  gasGet, gasPost, nombre, role, isCoordinador, comoParticipante, setComoParticipante,
  onEntrar, onAbrirArchivo, alerta, confirma, toast,
}) {
  const reduce = useReducedMotion();
  const tiltJoin = useTilt(reduce);
  const tiltHist = useTilt(reduce);

  // null = cargando · false = error · array = datos
  const [sesiones, setSesiones] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [seleccion, setSeleccion] = useState("");
  const [fecha, setFecha] = useState(hoyISO);
  const [nombreSesion, setNombreSesion] = useState("");
  const [busy, setBusy] = useState(false);

  const cargarSesiones = useCallback(async () => {
    setSesiones(null);
    try {
      setSesiones((await gasGet("listaSesiones")) || []);
    } catch (err) {
      console.error("Error cargando sesiones:", err);
      setSesiones(false);
      alerta("⚠️ No se pudo conectar con el servidor.\n\nComprueba que links.json → retroBackend apunte a tu Web App desplegada.\n\nDetalle: " + err.message);
    }
  }, [gasGet, alerta]);

  const cargarHistorico = useCallback(async () => {
    setHistorico(null);
    try {
      setHistorico((await gasGet("historico")) || []);
    } catch (err) {
      setHistorico(false);
    }
  }, [gasGet]);

  useEffect(() => {
    cargarSesiones();
    cargarHistorico();
  }, [cargarSesiones, cargarHistorico]);

  const entrarSesion = () => {
    if (!seleccion) return alerta("Selecciona una sesión de la lista primero.");
    onEntrar(seleccion);
  };

  const crearNuevaSesion = async () => {
    if (!fecha) return alerta("Selecciona una fecha.");
    const partes = fecha.split("-");
    const fechaStr = `${partes[2]}/${partes[1]}/${partes[0]}`;
    setBusy(true);
    toast.progress("Creando nueva sesión...");
    try {
      const nuevoId = await gasPost("crearSesion", { fechaStr, nombreSesion: nombreSesion.trim() });
      toast.hide();
      onEntrar(nuevoId);
    } catch (err) {
      toast.hide();
      alerta("⚠️ Error al crear la sesión.\n\n" + err.message);
    } finally {
      setBusy(false);
    }
  };

  const cambiarEstadoSeleccionada = (estado) => {
    if (!seleccion) return alerta("Selecciona una sesión en el desplegable primero.");
    const sel = (sesiones || []).find((s) => String(s.id) === String(seleccion));
    const nombreSel = sel ? sel.fecha : "";
    const verbo = estado === "ARCHIVED" ? "archivar" : "marcar como inactiva";
    const tras =
      estado === "ARCHIVED"
        ? "Pasará al histórico (lectura) y dejará de aparecer en el desplegable."
        : 'Se ocultará del desplegable. Podrás reactivarla desde "Gestionar sesiones inactivas".';
    confirma(`¿Seguro que quieres ${verbo} esta sesión?\n\n"${nombreSel}"\n\n${tras}`, async () => {
      setBusy(true);
      toast.progress("Actualizando estado...");
      try {
        const actualizadas = await gasPost("cambiarEstadoSesion", { idSesion: seleccion, estado });
        toast.success(estado === "ARCHIVED" ? "Sesión archivada." : "Sesión marcada como inactiva.");
        setSesiones(actualizadas || []);
        setSeleccion("");
        if (estado === "ARCHIVED") cargarHistorico();
      } catch (err) {
        toast.hide();
        alerta("⚠️ Error al cambiar el estado.\n\n" + err.message);
      } finally {
        setBusy(false);
      }
    });
  };

  // ── Modal de sesiones inactivas (solo organizador) ──
  const [inactivasOpen, setInactivasOpen] = useState(false);
  const [inactivas, setInactivas] = useState(null);

  const refrescarInactivas = useCallback(async () => {
    setInactivas(null);
    try {
      setInactivas((await gasGet("inactivas")) || []);
    } catch (err) {
      setInactivas(false);
    }
  }, [gasGet]);

  const abrirInactivas = () => {
    setInactivasOpen(true);
    refrescarInactivas();
  };

  const reactivarInactiva = (s) => {
    const titulo = s.nombre || s.fecha || "Sin nombre";
    confirma(`¿Reactivar "${titulo}"?\n\nVolverá a aparecer en el desplegable de sesiones activas.`, async () => {
      toast.progress("Reactivando sesión...");
      try {
        const activas = await gasPost("cambiarEstadoSesion", { idSesion: s.id, estado: "ACTIVE" });
        toast.success("Sesión reactivada.");
        setSesiones(activas || []);
        await refrescarInactivas();
      } catch (err) {
        toast.hide();
        alerta("⚠️ Error al reactivar.\n\n" + err.message);
      }
    });
  };

  const eliminarInactiva = (s) => {
    const titulo = s.nombre || s.fecha || "Sin nombre";
    confirma(
      `⚠️ ¿Eliminar PERMANENTEMENTE "${titulo}"?\n\nSe borrarán todos sus datos (tarjetas, mejoras, votos, participantes). Esta acción es irreversible.`,
      async () => {
        toast.progress("Eliminando sesión...");
        try {
          await gasPost("eliminarSesion", { idSesion: s.id });
          toast.success("Sesión eliminada.");
          await refrescarInactivas();
        } catch (err) {
          toast.hide();
          alerta("⚠️ Error al eliminar.\n\n" + err.message);
        }
      }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* ══ Sesión: unirse / organizar ══ */}
      <section
        {...tiltJoin}
        aria-labelledby="retro-menu-sesion"
        className={`rdr-rise rdr-tilt group relative overflow-hidden ${GLASS} p-6 transition hover:border-mandarin/40 hover:bg-white/[0.08]`}
        style={{ "--pc": rgba(ACCENT, 0.6) }}
      >
        <span aria-hidden className="rdr-spot" style={{ background: `radial-gradient(220px circle at var(--mx,50%) var(--my,50%), ${rgba(ACCENT, 0.14)}, transparent 70%)` }} />
        <div className="relative">
          <h2 id="retro-menu-sesion" className="flex items-center gap-2.5 font-display text-xl font-bold text-sand">
            <span className="grid h-9 w-9 place-items-center rounded-xl border" style={{ borderColor: rgba(ACCENT, 0.3), background: rgba(ACCENT, 0.12), color: ACCENT }}>
              <IconEnter size={18} />
            </span>
            Sesión en vivo
          </h2>
          <p className="mt-1 text-sm text-sand/65">
            Entras como <b className="text-sand">{nombre}</b>{" "}
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: rgba(role === "organizador" ? PALETTE.purple : PALETTE.serene, 0.16), color: role === "organizador" ? PALETTE.purple : PALETTE.serene }}>
              {role}
            </span>
          </p>
          {isCoordinador && (
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-xs text-sand/70">
              <input
                type="checkbox"
                checked={comoParticipante}
                onChange={(e) => setComoParticipante(e.target.checked)}
                className="h-4 w-4 accent-[#FFB56B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              />
              Entrar como participante (sin controles de organizador)
            </label>
          )}

          <div className="mt-5">
            <label htmlFor="retro-selector" className={LABEL}>Unirse a una sesión</label>
            {sesiones === null ? (
              <Skel className="h-10 w-full" />
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  id="retro-selector"
                  value={seleccion}
                  onChange={(e) => setSeleccion(e.target.value)}
                  className={`${INPUT} flex-1`}
                  disabled={sesiones === false || !sesiones.length}
                >
                  <option value="" disabled>
                    {sesiones === false ? "Error al cargar" : sesiones.length ? "-- Selecciona una sesión --" : "No hay sesiones creadas"}
                  </option>
                  {(sesiones || []).length > 0 &&
                    sesiones.map((s) => (
                      <option key={s.id} value={s.id}>{s.fecha}</option>
                    ))}
                </select>
                {sesiones === false ? (
                  <button type="button" onClick={cargarSesiones} className={BTN_GHOST}>Reintentar</button>
                ) : (
                  <button type="button" onClick={entrarSesion} disabled={busy} className={BTN_PRIMARY}>
                    Entrar <IconArrowR size={15} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Panel de organizador */}
          {role === "organizador" && (
            <div className="mt-6 space-y-5 border-t border-white/10 pt-5">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
                  <IconCalendarPlus size={14} /> Crear nueva sesión
                </p>
                <div className="space-y-3 rounded-xl border p-3.5" style={{ borderColor: rgba(ACCENT, 0.25), background: rgba(ACCENT, 0.06) }}>
                  <div>
                    <label htmlFor="retro-nueva-fecha" className="mb-1 block text-xs text-sand/60">Fecha:</label>
                    <input id="retro-nueva-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label htmlFor="retro-nueva-nombre" className="mb-1 block text-xs text-sand/60">Nombre (opcional):</label>
                    <input id="retro-nueva-nombre" type="text" value={nombreSesion} onChange={(e) => setNombreSesion(e.target.value)} placeholder="Ej: Cierre Q2" className={INPUT} />
                  </div>
                  <button type="button" onClick={crearNuevaSesion} disabled={busy} className={`${BTN_PRIMARY} w-full`}>
                    {busy ? <Spinner /> : null} Crear y entrar
                  </button>
                </div>
              </div>

              <div>
                <p className={LABEL}>Acciones sobre la sesión seleccionada arriba</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => cambiarEstadoSeleccionada("ARCHIVED")} disabled={busy} className={BTN_GHOST}>
                    <IconArchive size={15} className="text-serene" /> Archivar
                  </button>
                  <button type="button" onClick={() => cambiarEstadoSeleccionada("INACTIVE")} disabled={busy} className={BTN_GHOST}>
                    <IconEyeOff size={15} /> Marcar inactiva
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-sand/50">
                  <b className="text-sand/70">Archivar:</b> retrospectivas terminadas que pasan al histórico.<br />
                  <b className="text-sand/70">Marcar inactiva:</b> pruebas o errores que quieres ocultar.
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={abrirInactivas}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-sand/60 transition hover:bg-white/[0.06] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                >
                  <IconRestore size={14} /> Gestionar sesiones inactivas
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ Histórico ══ */}
      <section
        {...tiltHist}
        aria-labelledby="retro-menu-historico"
        className={`rdr-rise rdr-tilt group relative overflow-hidden ${GLASS} p-6 transition hover:border-serene/40 hover:bg-white/[0.08]`}
        style={{ "--pc": rgba(PALETTE.serene, 0.6), animationDelay: "60ms" }}
      >
        <span aria-hidden className="rdr-spot" style={{ background: `radial-gradient(220px circle at var(--mx,50%) var(--my,50%), ${rgba(PALETTE.serene, 0.14)}, transparent 70%)` }} />
        <div className="relative">
          <h2 id="retro-menu-historico" className="flex items-center gap-2.5 font-display text-xl font-bold text-sand">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-serene/30 bg-serene/10 text-serene">
              <IconHistory size={18} />
            </span>
            Histórico
          </h2>
          <p className="mt-1 text-sm text-sand/65">Sesiones archivadas, en modo lectura. La carga puede tardar unos segundos.</p>

          <div className="mt-5 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {historico === null && (
              <>
                <Skel className="h-16 w-full" />
                <Skel className="h-16 w-full" />
                <Skel className="h-16 w-full" />
              </>
            )}
            {historico === false && (
              <div className="rounded-xl border border-mandarin/30 bg-mandarin/10 p-4 text-sm text-sand/80">
                ⚠️ No se pudo cargar el histórico.
                <button type="button" onClick={cargarHistorico} className="ml-2 font-bold text-mandarin underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene">
                  Reintentar
                </button>
              </div>
            )}
            {Array.isArray(historico) && historico.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm italic text-sand/50">
                No hay sesiones archivadas todavía.
              </p>
            )}
            {Array.isArray(historico) &&
              historico.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onAbrirArchivo(s)}
                  className="group/item flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition hover:-translate-y-0.5 hover:border-serene/50 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-sand group-hover/item:text-serene">
                      {s.nombre || s.fecha || "Retrospectiva"}
                    </span>
                    <span className="block truncate text-xs text-sand/55">{metaSesion(s)}</span>
                  </span>
                  <IconArrowR size={16} className="shrink-0 text-sand/40 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-serene" />
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* ══ Modal: gestionar inactivas ══ */}
      <Modal open={inactivasOpen} onClose={() => setInactivasOpen(false)} labelledBy="retro-inactivas-title" maxW="max-w-2xl">
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 id="retro-inactivas-title" className="flex items-center gap-2 font-display text-lg font-bold text-sand">
              <IconEyeOff size={17} className="text-mandarin" /> Sesiones inactivas
            </h3>
            <p className="mt-1 text-xs text-sand/60">Reactivar las que sean válidas, eliminar las que no sirvan.</p>
          </div>
          <button
            type="button"
            onClick={() => setInactivasOpen(false)}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-sand/50 transition hover:bg-white/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="min-h-[120px] space-y-2">
          {inactivas === null && (
            <>
              <Skel className="h-14 w-full" />
              <Skel className="h-14 w-full" />
            </>
          )}
          {inactivas === false && <p className="text-sm italic text-mandarin">Error al cargar inactivas.</p>}
          {Array.isArray(inactivas) && inactivas.length === 0 && (
            <p className="py-8 text-center text-sm italic text-sand/50">No hay sesiones inactivas.</p>
          )}
          {Array.isArray(inactivas) &&
            inactivas.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-sand">{s.nombre || s.fecha || "Sin nombre"}</p>
                  <p className="truncate text-xs text-sand/55">{metaSesion(s, true)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => reactivarInactiva(s)}
                    title="Volver a activa"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-lime/40 bg-lime/10 px-3 py-1.5 text-xs font-bold text-lime transition hover:bg-lime/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                  >
                    <IconRestore size={13} /> Reactivar
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarInactiva(s)}
                    title="Borrar permanentemente"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-mandarin/40 bg-mandarin/10 px-3 py-1.5 text-xs font-bold text-mandarin transition hover:bg-mandarin/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                  >
                    <IconTrash size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setInactivasOpen(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-sand/70 transition hover:bg-white/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}
