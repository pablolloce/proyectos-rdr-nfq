"use client";

import { C } from "@/components/recursos/explorer/lib";
import { Tag, TypePill, CodePanel, InfoRow, WfFlow, DetailHeader } from "@/components/recursos/explorer/ui";
import { splitMulti, splitVars, FLAG_DEFS, ACCENT } from "./lib";
import { CodeChip } from "./ui";
import RawViewer from "./RawViewer";

/* Detalle de un fichero .properties: ficha de metadatos + visor del raw
   (el protagonista). Reutiliza las primitivas del Process Explorer. */

function TagGroup({ label, items, hex }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-[86px,1fr] items-baseline gap-x-2 py-1 text-[12px]">
      <span className="whitespace-nowrap font-bold text-sand/55">{label}</span>
      <div className="flex min-w-0 flex-wrap gap-1">
        {items.map((t, i) => (
          <Tag key={i} hex={hex} className="max-w-[240px]">{t}</Tag>
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetail({ p }) {
  const javas = splitMulti(p.javas);
  const scripts = splitMulti(p.scripts);
  const workflows = splitMulti(p.workflows);
  const vars = splitVars(p.variablesGlobales);
  const activeFlags = FLAG_DEFS.filter((f) => p.flags[f.k]);

  return (
    <article>
      <DetailHeader title={`${p.fichero}.properties`}>
        {p.businessFeed && <TypePill hex={ACCENT}>{p.businessFeed}</TypePill>}
        {p.messageType && <TypePill hex={C.serene}>{p.messageType}</TypePill>}
        {p.successAction && <TypePill hex={C.lime}>{p.successAction}</TypePill>}
        {p.modEjecucion && <TypePill hex={C.purple}>{p.modEjecucion}</TypePill>}
        {activeFlags.map((f) => (
          <Tag key={f.k} hex={f.hex} strong>{f.label}</Tag>
        ))}
        {p.numPasos > 0 && (
          <span className="tabular-nums">
            {p.numPasos} {p.numPasos === 1 ? "paso" : "pasos"}
          </span>
        )}
      </DetailHeader>

      {/* Ficha de metadatos */}
      {(p.ruta || p.file || p.servicio || p.delta || p.preprocesado || p.flujoEjecucion ||
        javas.length > 0 || scripts.length > 0 || workflows.length > 0 || vars.length > 0) && (
        <CodePanel>
          {p.servicio && <InfoRow k="Servicio" hex={C.serene}>{p.servicio}</InfoRow>}
          {p.delta && <InfoRow k="Delta">{p.delta}</InfoRow>}
          {p.preprocesado && <InfoRow k="Preproc.">{p.preprocesado}</InfoRow>}
          {p.ruta && (
            <div className="py-1"><CodeChip label="Ruta" value={p.ruta} /></div>
          )}
          {p.file && (
            <div className="py-1"><CodeChip label="File" value={p.file} /></div>
          )}
          {/* WfFlow ya pinta su propio rótulo "Flujo" y las flechas → */}
          {p.flujoEjecucion && <WfFlow s={p.flujoEjecucion} />}
          <TagGroup label="JARs" items={javas} hex={C.serene} />
          <TagGroup label="Scripts" items={scripts} hex={C.lime} />
          <TagGroup label="Workflows" items={workflows} hex={C.purple} />
          <TagGroup label="Variables" items={vars} hex={C.mandarin} />
        </CodePanel>
      )}

      {/* Visor del .properties tal cual está escrito */}
      <RawViewer fichero={p.fichero} raw={p.raw} />
    </article>
  );
}
