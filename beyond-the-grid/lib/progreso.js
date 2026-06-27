"use client";

// Lógica de avance de formación. En sitio estático: la semilla compartida
// vive en progreso.json y el avance EN VIVO por usuario en localStorage
// (se actualiza al completar un curso y refresca el mapa al instante).

import { NIVELES, FORMACIONES, isDisponible } from "./formaciones";

const LS_PREFIX = "rdr_prog_";
const EVT = "rdr-progreso";
export const PROGRESO_URL = "/team-hub/progreso.json";

const norm = (e) => String(e || "anon").trim().toLowerCase();
const lsKey = (email) => LS_PREFIX + norm(email);

export function getLocal(email) {
  try {
    return new Set(JSON.parse(localStorage.getItem(lsKey(email)) || "[]"));
  } catch {
    return new Set();
  }
}

function saveLocal(email, set) {
  localStorage.setItem(lsKey(email), JSON.stringify([...set]));
  window.dispatchEvent(new CustomEvent(EVT));
}

/** Marca/desmarca un curso como completado (localStorage) y avisa a la UI. */
export function marcar(email, archivo, done = true) {
  const s = getLocal(email);
  if (done) s.add(archivo);
  else s.delete(archivo);
  saveLocal(email, s);
  return s;
}

/** Conjunto de cursos completados = semilla (progreso.json) ∪ localStorage. */
export function completadasDe(email, seed) {
  const base =
    (seed && seed.usuarios && seed.usuarios[norm(email)] && seed.usuarios[norm(email)].completados) ||
    (seed && seed.porDefecto && seed.porDefecto.completados) ||
    [];
  const s = getLocal(email);
  base.forEach((a) => s.add(a));
  return s;
}

const dispNivel = (n) => FORMACIONES.filter((f) => f.nivel === n && isDisponible(f));

/**
 * Estado de cada nivel a partir de los cursos completados.
 * - completado: tiene cursos y todos hechos.
 * - actual: desbloqueado, con cursos pendientes (el objetivo de ahora).
 * - proximamente: desbloqueado pero sin contenido aún (niveles futuros).
 * - bloqueado: el nivel anterior no está completado.
 * Un nivel se desbloquea cuando el anterior está completado (todos parten de N00).
 */
export function estadoNiveles(completadas) {
  const res = {};
  let prevCompleto = true; // N00 siempre desbloqueado
  for (const lvl of NIVELES) {
    const disp = dispNivel(lvl.n);
    const tieneContenido = disp.length > 0;
    const completado = tieneContenido && disp.every((f) => completadas.has(f.archivo));
    const desbloqueado = prevCompleto;
    let estado;
    if (!desbloqueado) estado = "bloqueado";
    else if (!tieneContenido) estado = "proximamente";
    else if (completado) estado = "completado";
    else estado = "actual";
    res[lvl.n] = {
      ...lvl,
      estado,
      desbloqueado,
      completado,
      tieneContenido,
      hechos: disp.filter((f) => completadas.has(f.archivo)).length,
      total: disp.length,
    };
    prevCompleto = completado;
  }
  return res;
}

/** Estado de un curso concreto. */
export function estadoCurso(f, completadas, niveles) {
  if (completadas.has(f.archivo)) return "completada";
  if (!isDisponible(f)) return "proximamente";
  const nv = niveles[f.nivel];
  return nv && nv.desbloqueado ? "disponible" : "bloqueada";
}

/** Nivel "actual" (objetivo) del usuario: el primero desbloqueado sin completar. */
export function nivelActual(niveles) {
  const ids = Object.keys(niveles).map(Number).sort((a, b) => a - b);
  for (const n of ids) if (niveles[n].estado === "actual") return n;
  // todo lo disponible hecho -> el último con contenido
  const conContenido = ids.filter((n) => niveles[n].tieneContenido);
  return conContenido.length ? conContenido[conContenido.length - 1] : 0;
}

/** Resumen global para barra de progreso. */
export function resumen(completadas) {
  const disponibles = FORMACIONES.filter(isDisponible);
  const hechos = disponibles.filter((f) => completadas.has(f.archivo)).length;
  return { hechos, total: disponibles.length, pct: disponibles.length ? Math.round((hechos / disponibles.length) * 100) : 0 };
}

/** Suscripción a cambios de progreso (misma pestaña + entre pestañas). */
export function onProgreso(cb) {
  const h = () => cb();
  window.addEventListener(EVT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener("storage", h);
  };
}
