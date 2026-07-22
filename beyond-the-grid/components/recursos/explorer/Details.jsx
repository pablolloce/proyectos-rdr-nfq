"use client";

import { rgba } from "@/lib/ui";
import { C, cxColor, stepColor, deriveQueues, TABS } from "./lib";
import { useAcc, TypePill, CatPill, CxText, CodePanel, InfoRow, WfFlow, ChainChips, TagList, Step, DetailHeader } from "./ui";

const TAB_LABEL = Object.fromEntries(TABS.map((t) => [t.id, t.label]));

/* ── Procesos relacionados: comparten workflow o cola JMS con el actual ─────
   `related` = { list: [{ tab, id, key, name, via, token }], extra } lo calcula
   ProcessExplorer con los índices de lib.js. Cada fila navega al proceso
   (entra en el historial de la URL vía onNavigate). */
export function RelatedProcesses({ related, onNavigate }) {
  const acc = useAcc();
  if (!related || !related.list.length) return null;
  return (
    <section aria-label="Procesos relacionados" className="mt-8 border-t border-white/12 pt-5">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-sand/55">
        Procesos relacionados
      </h3>
      <ul className="space-y-1.5">
        {related.list.map((r) => (
          <li key={`${r.tab}:${r.id}`}>
            <button
              type="button"
              onClick={() => onNavigate(r.tab, r.key)}
              aria-label={`Ir al proceso ${r.name}`}
              className="group grid w-full grid-cols-[auto,1fr,auto] items-center gap-x-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                style={{ color: acc(C.aqua), backgroundColor: rgba(C.aqua, 0.12), border: `1px solid ${rgba(C.aqua, 0.25)}` }}
              >
                {TAB_LABEL[r.tab] || r.tab}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-sand">{r.name}</span>
                {r.token && (
                  <span className="block truncate text-[10px] text-sand/50">
                    {r.via.includes("workflow") ? "workflow" : "cola"}: {r.token}
                  </span>
                )}
              </span>
              <span aria-hidden className="shrink-0 text-sand/40 transition group-hover:translate-x-0.5">→</span>
            </button>
          </li>
        ))}
      </ul>
      {related.extra > 0 && (
        <p className="mt-2 px-1 text-[10.5px] tabular-nums text-sand/45">+{related.extra} más</p>
      )}
    </section>
  );
}

/* Las 4 vistas de detalle del Process Explorer, portadas de showChain(),
   showOnline(), showPub() y showInv() del HTML original. Cada vista recibe
   además `cats` (ids de categoría funcional precalculados en
   ProcessExplorer) y muestra TODAS sus etiquetas en la cabecera. */

const CatPills = ({ cats }) =>
  (cats || []).map((id) => <CatPill key={id} id={id} />);

/* ── Batch: cadena Control-M con su flujo de pasos ─────────────────────── */
export function ChainDetail({ name, steps, meta, cats }) {
  const m = meta || {};
  return (
    <article>
      <DetailHeader title={name} natural={m.natural} desc={m.desc}>
        <TypePill hex={C.serene}>Batch</TypePill>
        <CatPills cats={cats} />
        <span className="tabular-nums">{steps.length} pasos</span>
        {m.cx && (
          <>
            <span aria-hidden>·</span>
            <CxText cx={m.cx} />
          </>
        )}
      </DetailHeader>
      <ol className="list-none">
        {steps.map((s, i) => {
          const tipo = s.TIPO_EJECUCION || "Job";
          const conDatos =
            s.EVENTO_GS || s.WORKFLOW_GS || s.JAVAS || s.SCRIPTS || s.SUB_WORKFLOWS || s.CONTENIDO_WF || s.COLA_JMS || s.CLASE_EVENTO;
          return (
            <Step
              key={i}
              n={i + 1}
              hex={stepColor(tipo)}
              last={i === steps.length - 1}
              title={s.NOMBRE || ""}
              badge={tipo}
              sub={(s.SCRIPT_O_EJECUTABLE || s.PARAMETRO) &&
                `${s.SCRIPT_O_EJECUTABLE || ""}${s.PARAMETRO ? ` → ${s.PARAMETRO}` : ""}`}
            >
              {conDatos && (
                <CodePanel className="mt-2">
                  {s.EVENTO_GS && <InfoRow k="Evento" hex={C.serene} term>{s.EVENTO_GS}</InfoRow>}
                  {s.WORKFLOW_GS && <InfoRow k="Workflow" hex={C.purple} term>{s.WORKFLOW_GS}</InfoRow>}
                  {s.JAVAS && <InfoRow k="JARs" hex={C.lime} term>{s.JAVAS}</InfoRow>}
                  {s.SCRIPTS && <InfoRow k="Scripts" hex={C.canary} term>{s.SCRIPTS}</InfoRow>}
                  {s.COLA_JMS && <InfoRow k="Cola JMS" hex={C.mandarin} term>{s.COLA_JMS}</InfoRow>}
                  {s.CLASE_EVENTO && <InfoRow k="Clase evento" hex={C.serene}>{s.CLASE_EVENTO}</InfoRow>}
                  <WfFlow s={s.CONTENIDO_WF} />
                  <ChainChips s={s.SUB_WORKFLOWS} />
                </CodePanel>
              )}
            </Step>
          );
        })}
      </ol>
    </article>
  );
}

/* ── Online: listener JMS → workflow → sub-workflows ───────────────────── */
export function OnlineDetail({ ev, cats }) {
  const acc = useAcc();
  const subs = ev.SUB_WORKFLOWS ? ev.SUB_WORKFLOWS.split(" > ") : [];
  const total = 1 + (ev.WORKFLOW_GS ? 1 : 0) + subs.length;
  let n = 0;
  return (
    <article>
      <DetailHeader title={ev.NOMBRE} natural={ev.NOMBRE_NATURAL} desc={ev.DESC}>
        <TypePill hex={C.canary}>Online</TypePill>
        <CatPills cats={cats} />
        {ev.COLA_ESCUCHA && <TypePill hex={C.purple}>{ev.COLA_ESCUCHA}</TypePill>}
        {ev.CLASE_EVENTO && <span className="font-mono">{ev.CLASE_EVENTO}</span>}
        {ev.CX && (
          <>
            <span aria-hidden>·</span>
            <CxText cx={ev.CX} />
          </>
        )}
      </DetailHeader>
      <ol className="list-none">
        <Step n={++n} hex={C.canary} last={n === total} title="Mensaje entrante" badge={ev.CLASE_EVENTO || "JMS"}
          sub={ev.COLA_ESCUCHA && (
            <>Cola: <strong style={{ color: acc(C.mandarin) }}>{ev.COLA_ESCUCHA}</strong></>
          )}
        />
        {ev.WORKFLOW_GS && (
          <Step n={++n} hex={C.serene} last={n === total} title={ev.WORKFLOW_GS} badge="Workflow">
            {((ev.CONTENIDO_WF && ev.CONTENIDO_WF !== "Dummy/Empty") || ev.SUB_WORKFLOWS) && (
              <CodePanel className="mt-2">
                <WfFlow s={ev.CONTENIDO_WF} />
                <ChainChips s={ev.SUB_WORKFLOWS} />
              </CodePanel>
            )}
          </Step>
        )}
        {subs.map((sw, i) => (
          <Step key={i} n={++n} hex={C.purple} last={n === total} title={sw.trim()} badge="Sub-Workflow" />
        ))}
      </ol>
    </article>
  );
}

/* ── Publish: callers → workflow → colas de destino derivadas ──────────── */
export function PublishDetail({ p, cats }) {
  const acc = useAcc();
  const queues = deriveQueues(p);
  const tieneCallers = p.CALLERS && p.CALLERS.length > 0;
  return (
    <article>
      <DetailHeader title={p.WORKFLOW}>
        <TypePill hex={C.lime}>Publicación</TypePill>
        <CatPills cats={cats} />
        <span className="break-all font-mono">{(p.GROUP || "").split("/").slice(-2).join("/")}</span>
      </DetailHeader>
      <ol className="list-none">
        {tieneCallers && (
          <Step n={0} last={false} title="Llamado desde" badge="Callers">
            <ChainChips s={p.CALLERS} sep="·" />
            {p.EVENTS && p.EVENTS.length > 0 && (
              <p className="mt-2 break-words text-[11px] text-sand/60">Eventos: {p.EVENTS.join(", ")}</p>
            )}
          </Step>
        )}
        <Step n={1} hex={C.serene} last={queues.length === 0} title={p.WORKFLOW} badge="Workflow">
          <CodePanel className="mt-2">
            <InfoRow k="Grupo">{p.GROUP || "-"}</InfoRow>
          </CodePanel>
        </Step>
        {queues.map((q, i) => (
          <Step
            key={i}
            n={i + 2}
            hex={C.lime}
            last={i === queues.length - 1}
            title={<span style={{ color: acc(C.mandarin) }}>{q.queue}</span>}
            badge="Cola destino"
            sub={`${q.entity} → ${q.system}`}
          />
        ))}
      </ol>
    </article>
  );
}

/* ── Inventario: ficha del proceso ─────────────────────────────────────── */
export function InventoryDetail({ p, cats }) {
  const acc = useAcc();
  const est = p.ESTADO || "ACTIVO";
  const estHex = est === "ACTIVO" ? C.lime : C.red;
  return (
    <article>
      <DetailHeader title={p.NOMBRE_NATURAL || ""} desc={p.DESCRIPCION}>
        <TypePill hex={p.TIPO === "ONLINE" ? C.canary : C.serene}>{p.TIPO || ""}</TypePill>
        <CatPills cats={cats} />
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ color: acc(estHex), backgroundColor: rgba(estHex, 0.12), border: `1px solid ${rgba(estHex, 0.25)}` }}
        >
          {est}
        </span>
        {p.COMPLEJIDAD && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: acc(cxColor(p.COMPLEJIDAD)), backgroundColor: rgba(cxColor(p.COMPLEJIDAD), 0.12) }}
          >
            {p.COMPLEJIDAD}
          </span>
        )}
        {p.EJECUCIONES_ANUAL && p.EJECUCIONES_ANUAL !== "0" && (
          <span className="tabular-nums">{p.EJECUCIONES_ANUAL} ejecuciones/año</span>
        )}
      </DetailHeader>

      <CodePanel>
        {p.CADENAS_CONTROLM && <InfoRow k="Cadenas" term>{p.CADENAS_CONTROLM}</InfoRow>}
        {p.EVENTOS_JMS && <InfoRow k="Eventos JMS" hex={C.serene} term>{p.EVENTOS_JMS}</InfoRow>}
        {p.CRITERIO_COMPLEJIDAD && <InfoRow k="Criterio">{p.CRITERIO_COMPLEJIDAD}</InfoRow>}
        {p.JAVAS_PRINCIPALES && <InfoRow k="JARs" hex={C.lime} term>{p.JAVAS_PRINCIPALES}</InfoRow>}
      </CodePanel>

      {(p.TECNOLOGIAS || p.ENTIDADES || p.SISTEMAS_CONECTADOS) && (
        <div className="mt-4 space-y-2">
          {p.TECNOLOGIAS && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">Tecnologías</p>
              <TagList s={p.TECNOLOGIAS} hex={C.serene} />
            </div>
          )}
          {p.ENTIDADES && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">Entidades</p>
              <TagList s={p.ENTIDADES} hex={C.purple} />
            </div>
          )}
          {p.SISTEMAS_CONECTADOS && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">Sistemas conectados</p>
              <TagList s={p.SISTEMAS_CONECTADOS} hex={C.red} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// La antigua vista "Mapa" (mdMap pre-renderizado) fue sustituida por el mapa
// interactivo de /recursos/mapa (components/recursos/mapa/).
