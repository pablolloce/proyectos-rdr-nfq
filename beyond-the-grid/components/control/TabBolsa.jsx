"use client";

import { num, eur, h } from "./model";
import { GLASS, Chip } from "./ui";

/**
 * Bolsa / Adelantos — portado de renderBolsa() del legacy.
 * Tarjeta agrupada: IZQUIERDA = proyecto que APORTA horas, DERECHA = los que
 * las SACAN. Toggle para ocultar las consumidas (restante 0).
 */
function EntryCard({ e }) {
  const cons = e.consumos || [];
  const consumido = cons.reduce((a, c) => a + num(c.horas), 0);
  return (
    <div className={`${GLASS} p-4 transition hover:border-purple/40`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-serene">Aporta horas</p>
          <h4 className="font-display text-base font-bold text-sand">{e.proyecto || "—"}</h4>
          {e.responsable && <p className="text-xs text-sand/50">{e.responsable}</p>}
          <p className="mt-2 text-sm tabular-nums text-sand/80">
            Adelantadas <b className="text-sand">{h(e.horasAdelantadas)}</b> · Restante <b className="text-lime">{h(e.restante)}</b>
            {e.importe ? <> · {eur.format(e.importe)}</> : null}
          </p>
        </div>
        <div className="sm:border-l sm:border-serene/15 sm:pl-4">
          <p className="text-[11px] uppercase tracking-wider text-mandarin">Consume ({h(consumido)})</p>
          {cons.length ? (
            cons.map((c, i) => (
              <div key={i} className="flex justify-between gap-2 text-sm tabular-nums">
                <span className="truncate text-sand/80">{c.proyecto || c.detalle || "—"}</span>
                <span className="shrink-0 text-sand">{h(c.horas)}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-sand/40">Sin consumos</p>
          )}
        </div>
      </div>
    </div>
  );
}

const Grid = ({ arr }) =>
  arr.length ? (
    <div className="grid gap-3 lg:grid-cols-2">{arr.map((e, i) => <EntryCard key={i} e={e} />)}</div>
  ) : (
    <p className="text-sm text-sand/40">Sin entradas activas.</p>
  );

export default function TabBolsa({ data, ui, redraw }) {
  const hide = !!ui.bolsaHideZero;
  const allB = data.bolsa || [];
  const allA = data.adelantos || [];
  const nz = (arr) => arr.filter((e) => num(e.restante) > 0);
  const bolsa = hide ? nz(allB) : allB;
  const adel = hide ? nz(allA) : allA;
  const ocultas = allB.length - nz(allB).length + (allA.length - nz(allA).length);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Chip on={hide} accent="lime" onClick={() => { ui.bolsaHideZero = !ui.bolsaHideZero; redraw(); }}>
          Ocultar restante 0h
        </Chip>
        {hide && ocultas > 0 && <span className="text-xs tabular-nums text-sand/40">{ocultas} ocultas (consumidas)</span>}
      </div>

      <h3 className="mb-3 font-display text-lg font-bold text-sand">
        Bolsa BBVA <span className="text-xs font-normal text-sand/50">· {bolsa.length} (las cerradas/tachadas no se muestran)</span>
      </h3>
      <Grid arr={bolsa} />

      <h3 className="mb-3 mt-7 font-display text-lg font-bold text-sand">
        Adelantos <span className="text-xs font-normal text-sand/50">· {adel.length}</span>
      </h3>
      <Grid arr={adel} />
    </div>
  );
}
