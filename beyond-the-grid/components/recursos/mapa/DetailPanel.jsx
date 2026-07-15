"use client";

import { rgba } from "@/lib/ui";
import { C } from "../explorer/lib";
import { useAcc, TypePill, CodePanel, InfoRow, WfFlow, ChainChips, TagList, CxText } from "../explorer/ui";

/* Panel de detalle del Mapa de flujos: toda la información del nodo clicado,
   reutilizando las primitivas del Process Explorer (CodePanel estilo
   CmdDrawer, InfoRow, WfFlow…). En lg+ flota a la derecha del canvas; en <lg
   es un sheet inferior. */

/* Detalle de un paso/listener crudo (mismos campos que ChainDetail). */
function StepInfo({ s }) {
  if (!s) return null;
  return (
    <CodePanel className="mt-3">
      {s.SCRIPT_O_EJECUTABLE && <InfoRow k="Ejecutable">{s.SCRIPT_O_EJECUTABLE}</InfoRow>}
      {s.PARAMETRO && <InfoRow k="Parámetro">{s.PARAMETRO}</InfoRow>}
      {s.EVENTO_GS && <InfoRow k="Evento" hex={C.serene}>{s.EVENTO_GS}</InfoRow>}
      {s.WORKFLOW_GS && <InfoRow k="Workflow" hex={C.purple}>{s.WORKFLOW_GS}</InfoRow>}
      {s.JAVAS && <InfoRow k="JARs" hex={C.lime}>{s.JAVAS}</InfoRow>}
      {s.SCRIPTS && <InfoRow k="Scripts" hex={C.canary}>{s.SCRIPTS}</InfoRow>}
      {s.COLA_JMS && <InfoRow k="Cola JMS" hex={C.mandarin}>{s.COLA_JMS}</InfoRow>}
      {s.COLA_ESCUCHA && <InfoRow k="Cola escucha" hex={C.mandarin}>{s.COLA_ESCUCHA}</InfoRow>}
      {s.CLASE_EVENTO && <InfoRow k="Clase evento" hex={C.serene}>{s.CLASE_EVENTO}</InfoRow>}
      {s.TIPO_ENTRADA && <InfoRow k="Entrada">{s.TIPO_ENTRADA}</InfoRow>}
      <WfFlow s={s.CONTENIDO_WF} />
      <ChainChips s={s.SUB_WORKFLOWS} />
    </CodePanel>
  );
}

/* Usos de artefactos (JARs/scripts) según data.jar / data.sh. */
function UsageList({ names, usage, hex, label }) {
  return (
    <div className="mt-3 space-y-3">
      {names.map((n) => {
        const users = [...new Set(usage?.[n] || [])];
        return (
          <div key={n}>
            <p className="break-all font-mono text-[12px] font-bold text-sand">{n}</p>
            {users.length > 0 ? (
              <>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">
                  {label} en {users.length} {users.length === 1 ? "paso" : "pasos"}
                </p>
                <TagList s={users.slice(0, 12).join(",")} hex={hex} />
                {users.length > 12 && (
                  <p className="mt-1 text-[10px] tabular-nums text-sand/50">+{users.length - 12} más</p>
                )}
              </>
            ) : (
              <p className="mt-1 text-[10px] text-sand/50">Sin usos registrados en el inventario.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Body({ node, data }) {
  const d = node.data;
  const p = d.payload || {};

  switch (d.kind) {
    case "paso":
    case "listener":
      return <StepInfo s={p.step || p.ev} />;

    case "workflow":
    case "subwf": {
      const users = [...new Set((data.wfPublish || {})[p.wf] || [])];
      return (
        <>
          {p.contenido && p.contenido !== "Dummy/Empty" && (
            <CodePanel className="mt-3">
              <WfFlow s={p.contenido} />
            </CodePanel>
          )}
          {p.lista && (
            <CodePanel className="mt-3">
              <ChainChips s={p.lista} />
            </CodePanel>
          )}
          {users.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">
                Invocado desde {users.length} {users.length === 1 ? "paso" : "pasos"}
              </p>
              <TagList s={users.slice(0, 14).join(",")} hex={C.purple} />
              {users.length > 14 && <p className="mt-1 text-[10px] tabular-nums text-sand/50">+{users.length - 14} más</p>}
            </div>
          )}
          {p.step && <StepInfo s={p.step} />}
        </>
      );
    }

    case "jars":
      return <UsageList names={p.jars || []} usage={data.jar} hex={C.lime} label="Usado" />;
    case "scripts":
      return <UsageList names={p.scripts || []} usage={data.sh} hex={C.canary} label="Usado" />;

    case "cola": {
      return (
        <>
          <CodePanel className="mt-3">
            <InfoRow k="Cola" hex={C.mandarin}>{p.cola}</InfoRow>
            {p.colaInfo && <InfoRow k="Entidad">{p.colaInfo.entity}</InfoRow>}
            {p.colaInfo && <InfoRow k="Sistema">{p.colaInfo.system}</InfoRow>}
          </CodePanel>
          {d.follow?.length > 0 && (
            <p className="mt-3 text-[11px] text-sand/65">
              <strong className="tabular-nums">{d.follow.length}</strong>{" "}
              {d.follow.length === 1 ? "listener escucha" : "listeners escuchan"} esta cola — usa «Seguir» en el nodo
              para viajar.
            </p>
          )}
          {p.ev && <StepInfo s={p.ev} />}
        </>
      );
    }

    case "evento":
      return (
        <>
          <CodePanel className="mt-3">
            <InfoRow k="Evento" hex={C.serene}>{p.evento || "-"}</InfoRow>
            {p.ev?.CLASE_EVENTO && <InfoRow k="Clase" hex={C.serene}>{p.ev.CLASE_EVENTO}</InfoRow>}
            {p.ev?.TIPO_ENTRADA && <InfoRow k="Entrada">{p.ev.TIPO_ENTRADA}</InfoRow>}
          </CodePanel>
          {p.ev && <StepInfo s={p.ev} />}
        </>
      );

    case "publisher": {
      const pub = p.pub || {};
      return (
        <>
          {pub.DESCRIPCION && <p className="mt-3 text-pretty text-xs leading-relaxed text-sand/70">{pub.DESCRIPCION}</p>}
          <CodePanel className="mt-3">
            {pub.GROUP && <InfoRow k="Grupo">{pub.GROUP}</InfoRow>}
            {pub.EJECUCIONES_ANUAL && pub.EJECUCIONES_ANUAL !== "0" && (
              <InfoRow k="Ejecuciones"><span className="tabular-nums">{pub.EJECUCIONES_ANUAL}/año</span></InfoRow>
            )}
            {pub.EVENTOS_JMS && <InfoRow k="Eventos JMS" hex={C.serene}>{pub.EVENTOS_JMS}</InfoRow>}
          </CodePanel>
          {pub.COMPLEJIDAD && (
            <p className="mt-3 text-[11px] text-sand/60">
              Complejidad <CxText cx={pub.COMPLEJIDAD} />
            </p>
          )}
          {(pub.CALLERS || []).length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">Callers</p>
              <ChainChips s={pub.CALLERS} sep="·" />
            </div>
          )}
          {pub.ENTIDADES && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">Entidades</p>
              <TagList s={pub.ENTIDADES} hex={C.purple} />
            </div>
          )}
          {pub.SISTEMAS_CONECTADOS && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-sand/50">Sistemas conectados</p>
              <TagList s={pub.SISTEMAS_CONECTADOS} hex={C.serene} />
            </div>
          )}
        </>
      );
    }

    case "inicio":
      return (
        <>
          <CodePanel className="mt-3">
            {p.cadena && <InfoRow k="Cadena">{p.cadena}</InfoRow>}
            {p.meta?.natural && <InfoRow k="Nombre">{p.meta.natural}</InfoRow>}
            {p.meta?.cx && <InfoRow k="Complejidad"><CxText cx={p.meta.cx} /></InfoRow>}
          </CodePanel>
          {p.lista && <ChainChips s={p.lista} sep="·" />}
          {p.meta?.desc && <p className="mt-3 text-pretty text-xs leading-relaxed text-sand/70">{p.meta.desc}</p>}
        </>
      );

    default:
      return null;
  }
}

export default function DetailPanel({ node, data, onClose }) {
  const acc = useAcc();
  if (!node) return null;
  const d = node.data;
  const hex = d.hex || C.serene;

  return (
    <aside
      aria-label={`Detalle de ${d.title}`}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[70dvh] overflow-hidden rounded-t-2xl border border-white/12 bg-midnight/90 shadow-2xl backdrop-blur-md lg:absolute lg:inset-x-auto lg:bottom-3 lg:right-3 lg:top-3 lg:z-20 lg:max-h-none lg:w-[360px] lg:rounded-2xl"
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-white/12 p-4">
          <div className="min-w-0">
            <TypePill hex={hex}>{d.badge || d.kind}</TypePill>
            <h2 className="mt-2 break-words font-display text-base font-bold leading-snug text-sand">{d.title}</h2>
            {d.sub && <p className="mt-1 break-all font-mono text-[11px] text-sand/55">{d.sub}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-sand/70 transition hover:bg-white/[0.1] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
          >
            <span aria-hidden>✕</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pt-1">
          <Body node={node} data={data} />
          {d.follow?.length > 0 && (
            <p className="mt-4 rounded-xl border px-3 py-2 text-[11px] text-sand/70" style={{ borderColor: rgba(hex, 0.3), backgroundColor: rgba(hex, 0.06) }}>
              Este nodo conecta con{" "}
              <strong className="tabular-nums" style={{ color: acc(hex) }}>{d.follow.length}</strong>{" "}
              {d.follow.length === 1 ? "proceso" : "procesos"} — botón «Seguir» del nodo para saltar.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
