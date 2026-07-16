"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useAcc, CodePanel } from "@/components/recursos/explorer/ui";
import { ACCENT } from "./lib";
import { markStyle, CopyButton } from "./ui";

/* Visor del .properties TAL CUAL está escrito: monoespaciado, números de
   línea, resaltado suave (comentarios # atenuados, clave en acento, "=" y
   valor en tinta normal) + buscador interno con salto entre coincidencias. */

/* Colores de sintaxis por tema. El verde-oliva de comentarios no existe en
   PALETTE (es tinta de código, no acento de UI), así que se define aquí con
   su equivalente AA para modo claro. */
const COMMENT_DARK = "#9DB786";
const COMMENT_LIGHT = "#5C7040";

/* Tokens de sintaxis de UNA línea: comentario completo, o clave/=/valor. */
function tokenize(line, colors) {
  if (/^\s*[#!]/.test(line)) return [{ t: line, style: { color: colors.comment, fontStyle: "italic" } }];
  const eq = line.indexOf("=");
  if (eq === -1) return [{ t: line, style: null }];
  return [
    { t: line.slice(0, eq), style: { color: colors.key, fontWeight: 600 } },
    { t: "=", style: { opacity: 0.55 } },
    { t: line.slice(eq + 1), style: null },
  ];
}

/* Trocea los tokens de sintaxis por los rangos de coincidencia del buscador
   interno, de forma que un <mark> pueda cruzar clave/=/valor sin romper el
   coloreado. positions = inicios de match en la línea completa. */
function segments(line, tokens, positions, qlen) {
  const marks = positions.map((p, i) => [p, p + qlen, i]);
  const segs = [];
  let tokStart = 0;
  for (const tk of tokens) {
    const tokEnd = tokStart + tk.t.length;
    const cuts = new Set([tokStart, tokEnd]);
    for (const [a, b] of marks) {
      if (a > tokStart && a < tokEnd) cuts.add(a);
      if (b > tokStart && b < tokEnd) cuts.add(b);
    }
    const sorted = [...cuts].sort((x, y) => x - y);
    for (let i = 0; i < sorted.length - 1; i++) {
      const [a, b] = [sorted[i], sorted[i + 1]];
      const m = marks.find(([ma, mb]) => a >= ma && b <= mb);
      segs.push({ text: line.slice(a, b), style: tk.style, mark: m ? m[2] : null });
    }
    tokStart = tokEnd;
  }
  return segs;
}

function Line({ line, n, colors, fq, baseIdx, currentIdx, markRef }) {
  const tokens = tokenize(line, colors);
  let body;
  if (!fq) {
    body = tokens.map((tk, i) => (tk.style ? <span key={i} style={tk.style}>{tk.t}</span> : tk.t));
  } else {
    const lower = line.toLowerCase();
    const positions = [];
    let p = lower.indexOf(fq);
    while (p !== -1) {
      positions.push(p);
      p = lower.indexOf(fq, p + fq.length);
    }
    body = segments(line, tokens, positions, fq.length).map((s, i) => {
      const inner = s.style ? <span style={s.style}>{s.text}</span> : s.text;
      if (s.mark === null) return <span key={i}>{inner}</span>;
      const gi = baseIdx + s.mark; // índice global de la coincidencia
      const current = gi === currentIdx;
      return (
        <mark key={i} ref={current ? markRef : undefined} style={markStyle(current)}>
          {inner}
        </mark>
      );
    });
  }
  return (
    <div className="grid grid-cols-[3.25rem,1fr]">
      <span aria-hidden className="select-none pr-3 text-right tabular-nums text-sand/30">{n}</span>
      <span className="whitespace-pre-wrap break-all text-sand/85">{body.length ? body : " "}</span>
    </div>
  );
}

export default function RawViewer({ fichero, raw }) {
  const { theme } = useTheme();
  const acc = useAcc();
  const reduce = useReducedMotion();

  const [find, setFind] = useState("");
  const fq = find.trim().toLowerCase();
  const [cur, setCur] = useState(0);
  const markRef = useRef(null);

  const lines = useMemo(() => raw.split("\n"), [raw]);

  /* Coincidencias por línea + acumulado (índice global de cada <mark>). */
  const { perLine, total } = useMemo(() => {
    if (!fq) return { perLine: [], total: 0 };
    let acum = 0;
    const perLine = lines.map((l) => {
      const base = acum;
      let n = 0;
      let p = l.toLowerCase().indexOf(fq);
      while (p !== -1) {
        n++;
        p = l.toLowerCase().indexOf(fq, p + fq.length);
      }
      acum += n;
      return base;
    });
    return { perLine, total: acum };
  }, [lines, fq]);

  useEffect(() => setCur(0), [fq, raw]);
  useEffect(() => {
    markRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [cur, fq, reduce]);

  const jump = useCallback(
    (e) => {
      if (e.key !== "Enter" || !total) return;
      e.preventDefault();
      setCur((c) => (e.shiftKey ? (c - 1 + total) % total : (c + 1) % total));
    },
    [total]
  );

  const colors = {
    comment: theme === "light" ? COMMENT_LIGHT : COMMENT_DARK,
    key: acc(ACCENT),
  };

  if (!raw) {
    return (
      <CodePanel className="mt-3">
        <p className="py-6 text-center text-xs text-sand/55">
          <span aria-hidden className="mb-1 block text-xl opacity-40">∅</span>
          Fichero .properties vacío — no contiene ninguna línea.
        </p>
      </CodePanel>
    );
  }

  return (
    <section aria-label={`Contenido de ${fichero}.properties`} className="mt-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-48">
          <span className="sr-only">Buscar dentro del fichero (Enter salta a la siguiente coincidencia)</span>
          <input
            type="search"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            onKeyDown={jump}
            placeholder="Buscar en el fichero… (Enter = siguiente)"
            autoComplete="off"
            className="w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-sand placeholder:text-sand/40 focus:border-serene/60 focus:outline-none focus:ring-2 focus:ring-serene/25"
          />
        </label>
        <p aria-live="polite" className="min-w-[86px] text-[10.5px] tabular-nums text-sand/55">
          {fq ? (total ? `${cur + 1} / ${total} coincidencias` : "0 coincidencias") : `${lines.length} líneas`}
        </p>
        <CopyButton text={raw} label="Copiar fichero" />
      </div>

      <CodePanel className="!px-0 !py-0">
        <div className="max-h-[65dvh] overflow-auto overscroll-contain py-3 pr-3 font-mono text-[11.5px] leading-[1.65]">
          {lines.map((l, i) => (
            <Line
              key={i}
              line={l}
              n={i + 1}
              colors={colors}
              fq={fq || null}
              baseIdx={perLine[i] || 0}
              currentIdx={cur}
              markRef={markRef}
            />
          ))}
        </div>
      </CodePanel>
    </section>
  );
}
