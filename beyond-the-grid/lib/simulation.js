/**
 * ============================================================================
 *  MOTOR DE SIMULACIÓN  ·  RDR BBVA   (100% en cliente, NO toca el backend)
 * ----------------------------------------------------------------------------
 *  Replica las fórmulas del Excel "Control - RDR BBVA" para poder simular
 *  escenarios del próximo Q sin escribir en el Sheet:
 *    - Ejecución: redistribuir las horas de un proyecto entre Qs.
 *    - Economía:  ingreso/coste/rentabilidad; añadir/quitar personas, cambiar
 *                 dedicación... y ver el efecto en este Q y en el siguiente.
 *    - Capacidad: cobertura por proyecto y capacidad por persona.
 *
 *  Se alimenta del JSON de `action=snapshot` del Code.gs. Todo son funciones
 *  puras: dado un escenario, devuelven números. La UI compone estas piezas.
 * ============================================================================
 */

const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return isNaN(n) ? 0 : n;
};

/* ===========================================================================
 * ECONOMÍA
 * =========================================================================== */

/** Horas imputadas de una persona en el Q = Σ_mes (teóricas - ausencias) * dedicación. */
export function horasImputadas(persona) {
  const t = persona.horasTeoricas || [];
  const a = persona.ausencias || [];
  const d = persona.dedicacion || [];
  let h = 0;
  for (let m = 0; m < t.length; m++) h += (num(t[m]) - num(a[m])) * num(d[m]);
  return h;
}

/** Coste de una persona en el Q = coste/hora * horas imputadas. */
export function costePersonaQ(persona) {
  return num(persona.costeHora) * horasImputadas(persona);
}

/** Costes agregados por equipo {NFQ, NTER, total}. */
export function costesEquipo(personas) {
  let NFQ = 0, NTER = 0;
  (personas || []).forEach((p) => {
    const c = costePersonaQ(p);
    if (p.equipo === "NTER") NTER += c;
    else NFQ += c;
  });
  return { NFQ, NTER, total: NFQ + NTER };
}

/** Rentabilidad objetivo total = ponderación de los objetivos por peso de coste. */
export function rentObjetivoTotal(costeNFQ, costeNTER, objNFQ = 0.25, objNTER = 0.2) {
  const total = costeNFQ + costeNTER;
  if (!total) return 0;
  return (costeNFQ / total) * objNFQ + (costeNTER / total) * objNTER;
}

/**
 * Calcula la economía de un Q.
 * @param personas        lista (puede ser un escenario modificado)
 * @param horasTotalesQ   sumatorio de horas a ejecutar en el Q (de Ejecución)
 * @param tarifa          €/hora del proveedor en ese Q
 * @param gastos          gastos adicionales del Q
 * @param objNFQ/objNTER  rentabilidades objetivo (25% / 20% por defecto)
 */
export function economiaQ({ personas, horasTotalesQ, tarifa, gastos = 0, objNFQ = 0.25, objNTER = 0.2 }) {
  const c = costesEquipo(personas);
  const costeTotal = c.total + num(gastos);
  const ingresoReal = num(horasTotalesQ) * num(tarifa);
  const rObj = rentObjetivoTotal(c.NFQ, c.NTER, objNFQ, objNTER);
  const ingresoObjetivo = rObj < 1 ? costeTotal / (1 - rObj) : 0;
  return {
    costeNFQ: c.NFQ,
    costeNTER: c.NTER,
    costeTotal,
    ingresoReal,
    rentObjetivoTotal: rObj,
    ingresoObjetivo,
    ingresoObjetivoHoras: tarifa ? ingresoObjetivo / num(tarifa) : 0,
    rentabilidadReal: ingresoReal ? 1 - costeTotal / ingresoReal : null,
  };
}

/**
 * Aplica un escenario a la lista de personas (para simular el próximo Q):
 *   - quitar:     [nombre, ...]                       -> baja del equipo
 *   - anadir:     [{equipo,nombre,costeHora,horasTeoricas[],dedicacion[],ausencias[]}, ...]
 *   - dedicacion: { nombre: nuevaDedicacion(0..1) }   -> aplica a todos los meses
 */
export function aplicarEscenarioPersonas(personas, escenario = {}) {
  let res = (personas || []).slice();
  if (escenario.quitar && escenario.quitar.length)
    res = res.filter((p) => escenario.quitar.indexOf(p.nombre) < 0);
  if (escenario.dedicacion)
    res = res.map((p) =>
      escenario.dedicacion[p.nombre] != null
        ? { ...p, dedicacion: (p.dedicacion || [0, 0, 0]).map(() => escenario.dedicacion[p.nombre]) }
        : p
    );
  if (escenario.anadir && escenario.anadir.length) res = res.concat(escenario.anadir);
  return res;
}

/* ===========================================================================
 * EJECUCIÓN  (redistribución de horas entre trimestres)
 * =========================================================================== */

/**
 * Recalcula el sumatorio de horas por Q aplicando overrides de redistribución.
 * @param records   ejecucion.records (cada uno con .data["Proyecto"] y columnas de Q)
 * @param qCols     ejecucion.qColumns (["2025Q4","2026Q1",...])
 * @param overrides { "Nombre Proyecto": { "2026Q1": 100, "2026Q2": 100 } }
 *                  Sustituye las horas de ese proyecto en esos Qs (ej. "mitad y mitad").
 */
export function totalesHorasPorQ(records, qCols, overrides = {}) {
  const tot = {};
  qCols.forEach((q) => (tot[q] = 0));
  (records || []).forEach((rec) => {
    const key = rec.data ? rec.data["Proyecto"] : undefined;
    const ov = overrides[key];
    qCols.forEach((q) => {
      const v = ov && q in ov ? ov[q] : rec.data ? rec.data[q] : 0;
      tot[q] += num(v);
    });
  });
  return tot;
}

/* ===========================================================================
 * CAPACIDAD
 * =========================================================================== */

/** Cobertura de un proyecto = (Σ % asignados) * horasQ / horas del proyecto. */
export function coberturaProyecto(proyecto, horasQ) {
  const sum = (proyecto.asignaciones || []).reduce((s, a) => s + num(a.pct), 0);
  return proyecto.horas ? (sum * num(horasQ)) / num(proyecto.horas) : 0;
}

/** Capacidad de una persona = Σ_proyectos (horas * % asignado a esa persona) / horasQ. */
export function capacidadPersona(nombre, proyectos, horasQ) {
  let h = 0;
  (proyectos || []).forEach((p) => {
    (p.asignaciones || []).forEach((a) => {
      if (a.persona === nombre) h += num(p.horas) * num(a.pct);
    });
  });
  return horasQ ? h / num(horasQ) : 0;
}

/** Capacidad de cada persona del listado (1.0 ≈ persona al 100%). */
export function capacidadEquipo(personas, proyectos, horasQ) {
  return (personas || []).map((nombre) => ({
    persona: nombre,
    capacidad: capacidadPersona(nombre, proyectos, horasQ),
  }));
}

/* ===========================================================================
 * EJEMPLO DE USO (en el frontend, tras fetch del snapshot)
 * ---------------------------------------------------------------------------
 * const snap = await fetch(`${API}?action=snapshot&token=${TOKEN}`).then(r=>r.json());
 * const { economico, ejecucion, tarifas, capacidad } = snap.data;
 *
 * // 1) Redistribuir un proyecto: "mitad este Q, mitad el siguiente"
 * const tot = totalesHorasPorQ(ejecucion.records, ejecucion.qColumns, {
 *   "RDR- TM-Maestro de Emisiones Q2": { "2026Q2": 537, "2026Q3": 537 },
 * });
 *
 * // 2) Economía de cada Q con esas horas
 * const blockQ2 = economico.bloques.find(b => b.q === "2026Q2");
 * const ecoQ2 = economiaQ({
 *   personas: blockQ2.personas,
 *   horasTotalesQ: tot["2026Q2"],
 *   tarifa: tarifas["2026Q1"],            // o la que aplique al Q
 *   objNFQ: blockQ2.rentObjetivoNFQ, objNTER: blockQ2.rentObjetivoNTER,
 * });
 *
 * // 3) "¿Y si quito a una persona y subo la dedicación de otra el próximo Q?"
 * const personasSim = aplicarEscenarioPersonas(blockQ2.personas, {
 *   quitar: ["Tejada de Galdo, Fernando"],
 *   dedicacion: { "Llorente Cerezuela, Pablo": 0.5 },
 * });
 * const ecoSim = economiaQ({ personas: personasSim, horasTotalesQ: tot["2026Q3"], tarifa: tarifas["2026"] });
 *
 * // 4) Capacidad: cobertura y capacidad por persona
 * const capQ = capacidad.bloques[0];
 * const cobertura = capQ.proyectos.map(p => ({ p: p.nombre, cob: coberturaProyecto(p, capQ.horasQ) }));
 * ============================================================================
 */
