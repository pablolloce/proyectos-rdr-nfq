"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/lib/theme";
import {
  dateKey, motivoDe, motivoChipStyle, rangosDePersona, fechaVuelta,
  formatRango, formatFechaCorta,
} from "./constants";
import { IconSearch } from "./icons";

/** Normaliza para buscar sin acentos ni mayúsculas. */
const norm = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function RangoChip({ rango, theme }) {
  const m = motivoDe(rango.motivo);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
      style={motivoChipStyle(rango.motivo, theme)}
      title={`${m.texto} · ${rango.dias} día${rango.dias === 1 ? "" : "s"} laborable${rango.dias === 1 ? "" : "s"}`}
    >
      {formatRango(rango.inicio, rango.fin)} <span className="opacity-75">· {m.texto}</span>
    </span>
  );
}

function PersonaRow({ persona, theme }) {
  const { emp, rangos, totalLaborables, ausenteHoy, motivoHoy, vuelve } = persona;
  const sinAusencias = rangos.length === 0;

  return (
    <li
      className={`rounded-2xl border border-white/12 bg-white/[0.055] backdrop-blur-md ${sinAusencias ? "px-4 py-2.5" : "p-4"}`}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/15" style={{ backgroundColor: emp.color }} aria-hidden />
        <span className={`min-w-0 truncate text-[14px] font-bold ${emp.activo ? "text-sand" : "font-normal text-sand/45 line-through"}`}>
          {emp.nombre}
        </span>

        {ausenteHoy ? (
          <>
            <span className="shrink-0 rounded-full bg-[#FFB56B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#001391]">
              Ausente hoy{motivoHoy ? ` · ${motivoDe(motivoHoy).texto}` : ""}
            </span>
            {vuelve && (
              <span className="shrink-0 text-[11px] font-bold text-sand/65">Vuelve el {formatFechaCorta(vuelve)}</span>
            )}
          </>
        ) : (
          <span className="shrink-0 text-[11px] text-sand/40">Disponible</span>
        )}

        <span className="ml-auto shrink-0 text-[11px] tabular-nums text-sand/55">
          {sinAusencias ? "" : `${totalLaborables} día${totalLaborables === 1 ? "" : "s"} lab.`}
        </span>
      </div>

      {sinAusencias ? (
        <p className="mt-0.5 pl-5 text-[11.5px] text-sand/40">Sin ausencias registradas</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-1.5 pl-5" aria-label={`Ausencias de ${emp.nombre}`}>
          {rangos.map((r, i) => (
            <li key={`${r.inicio}-${i}`}>
              <RangoChip rango={r} theme={theme} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Vista "Personas": responde a "¿está X de vacaciones? ¿cuándo falta?".
 * Una fila por persona (activos primero, alfabético — el orden ya viene así
 * de VacacionesRoute) con su estado de hoy y sus rangos de ausencia del año
 * (días consecutivos agrupados saltando huecos 100% no laborables).
 */
export default function PersonasView({ datos, hoy }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");

  const hoyStr = dateKey(hoy);
  const mismoAnio = (datos.year || hoy.getFullYear()) === hoy.getFullYear();

  // Índice nombre -> fechas de ausencia, a partir de ausenciasPorDia (contrato
  // del backend intacto: solo se agrega en cliente). Dataset pequeño.
  const personas = useMemo(() => {
    const porPersona = new Map(); // nombre -> [{dateStr, motivo}]
    const dias = Object.keys(datos.ausenciasPorDia || {}).sort();
    for (const d of dias) {
      for (const a of datos.ausenciasPorDia[d] || []) {
        if (!porPersona.has(a.nombre)) porPersona.set(a.nombre, []);
        porPersona.get(a.nombre).push({ dateStr: d, motivo: a.motivo });
      }
    }
    const festivos = datos.festivos || {};
    return (datos.empleados || []).map((emp) => {
      const fechas = porPersona.get(emp.nombre) || [];
      const rangos = rangosDePersona(fechas, festivos);
      const totalLaborables = rangos.reduce((acc, r) => acc + r.dias, 0);
      const hoyEntry = mismoAnio ? fechas.find((f) => f.dateStr === hoyStr) : null;
      const ausenteHoy = !!hoyEntry;
      const vuelve = ausenteHoy
        ? fechaVuelta(hoyStr, new Set(fechas.map((f) => f.dateStr)), festivos)
        : null;
      return { emp, rangos, totalLaborables, ausenteHoy, motivoHoy: hoyEntry?.motivo, vuelve };
    });
  }, [datos, hoyStr, mismoAnio]);

  const q = norm(query.trim());
  const visibles = q ? personas.filter((p) => norm(p.emp.nombre).includes(q)) : personas;

  return (
    <div>
      {/* Buscador */}
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">Buscar persona por nombre</span>
        <IconSearch size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/45" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar persona…"
          className="w-full rounded-full border border-white/15 bg-white/[0.055] py-2.5 pl-10 pr-4 text-sm text-sand placeholder:text-sand/40 backdrop-blur-md transition focus:border-serene/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
        />
      </label>

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-white/12 bg-white/[0.055] p-6 text-center text-sm text-sand/55 backdrop-blur-md" role="status">
          Ninguna persona coincide con «{query.trim()}».
        </p>
      ) : (
        <ul className="space-y-2.5" aria-label="Ausencias por persona">
          {visibles.map((p) => (
            <PersonaRow key={p.emp.nombre} persona={p} theme={theme} />
          ))}
        </ul>
      )}
    </div>
  );
}
