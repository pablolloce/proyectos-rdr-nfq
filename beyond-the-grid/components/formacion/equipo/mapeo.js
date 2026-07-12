// Mapeo record del backend -> archivo de curso del catálogo (lib/formaciones).
//
// ⚠️ Copia LOCAL de archivoDeRecord() de lib/progreso.js: allí la función NO
// está exportada y los ficheros existentes de lib/ no se pueden modificar.
// Si algún día se exporta, borrar este fichero e importar la original.
// La cascada de matching es idéntica (kw -> courseId -> nombre -> nivel+track).

import { FORMACIONES, isDisponible } from "@/lib/formaciones";

// NFD + quitar todo lo no alfanumérico (los diacríticos quedan fuera de a-z0-9).
const slug = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");

export function archivoDeRecord(rec) {
  const m = rec.courseMeta || {};
  const blob = slug(rec.courseId) + "|" + slug(m.nombre); // todo el texto identificable del record
  // 1) palabras clave distintivas (resuelve cursos que comparten nivel+track).
  let f = FORMACIONES.find((x) => isDisponible(x) && (x.kw || []).some((k) => blob.includes(slug(k))));
  if (f) return f.archivo;
  // 2) courseId coincide con el archivo
  f = FORMACIONES.find((x) => x.archivo && (x.archivo === rec.courseId || slug(x.archivo) === slug(rec.courseId)));
  if (f) return f.archivo;
  // 3) por nombre exacto/contenido
  if (m.nombre) {
    const nm = slug(m.nombre);
    f = FORMACIONES.find((x) => { const t = slug(x.titulo); return t === nm || t.includes(nm) || nm.includes(t); });
    if (f) return f.archivo;
  }
  // 4) por (nivel, track) si es único y disponible
  if (m.nivel != null && m.track) {
    const cand = FORMACIONES.filter((x) => x.nivel === Number(m.nivel) && x.track === m.track && isDisponible(x));
    if (cand.length === 1) return cand[0].archivo;
  }
  return null;
}
