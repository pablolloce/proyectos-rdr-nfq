"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useAuth } from "./AuthGate";
import { useLinks } from "@/lib/links";
import { useAccentMap } from "@/lib/theme";
import { pagesFor } from "@/lib/nav";
import { rgba } from "@/lib/ui";
import { IconSearch, IconExternal, IconArrow } from "../icons";

/**
 * Paleta de comandos (Ctrl/Cmd+K) — busca sobre TODAS las páginas de
 * lib/nav.js (label + sección + descripción, sin acentos) y navega:
 *   route → router.push · page → location · open → window.open.
 * Sin dependencias nuevas: overlay glass propio, foco atrapado en el input,
 * flechas + Enter, Escape cierra. ARIA combobox/listbox.
 *
 * Se abre también con el evento "rdr-open-palette" (botón Buscar del Header).
 */

const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const { isCoordinador } = useAuth();
  const { getUrl, showToast } = useLinks();
  const mapAccent = useAccentMap();
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const restoreRef = useRef(null);

  const pages = useMemo(() => pagesFor(isCoordinador), [isCoordinador]);

  const results = useMemo(() => {
    const q = norm(query).trim();
    if (!q) return pages;
    const words = q.split(/\s+/);
    return pages.filter((p) => {
      const hay = norm(`${p.label} ${p.section} ${p.desc || ""}`);
      return words.every((w) => hay.includes(w));
    });
  }, [pages, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    // Devuelve el foco a quien abrió la paleta.
    const el = restoreRef.current;
    if (el && typeof el.focus === "function") el.focus();
  }, []);

  const openPalette = useCallback(() => {
    restoreRef.current = document.activeElement;
    setOpen(true);
  }, []);

  // Atajo global Ctrl/Cmd+K + evento del botón Buscar del Header.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) restoreRef.current = document.activeElement;
          return !o;
        });
      }
    };
    const onOpen = () => openPalette();
    window.addEventListener("keydown", onKey);
    window.addEventListener("rdr-open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("rdr-open-palette", onOpen);
    };
  }, [openPalette]);

  // Foco al input + scroll lock mientras está abierta.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // La navegación interna cierra la paleta (por si acaso).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Mantén la opción activa visible.
  useEffect(() => {
    const el = listRef.current?.querySelector(`#rdr-cmdk-opt-${active}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const run = useCallback(
    (item) => {
      if (!item) return;
      if (item.action === "route") {
        close();
        router.push(item.target);
        return;
      }
      if (item.action === "page") {
        close();
        window.location.assign(item.target);
        return;
      }
      // open (links.json)
      const url = getUrl(item.target);
      if (!url) {
        showToast("Enlace no disponible — revisa links.json");
        return;
      }
      close();
      window.open(url, "_blank", "noopener");
    },
    [close, router, getUrl, showToast]
  );

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Home" && results.length) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && results.length) {
      e.preventDefault();
      setActive(results.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Tab") {
      // Foco atrapado: la paleta es un único campo.
      e.preventDefault();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-midnight/70 px-4 pt-[12vh] backdrop-blur-sm"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar páginas del hub"
        className={`w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-midnight/95 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl ${reduce ? "" : "rdr-rise"}`}
      >
        <div className="flex items-center gap-3 border-b border-white/12 px-4 py-3">
          <IconSearch size={17} className="shrink-0 text-sand/50" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="rdr-cmdk-list"
            aria-activedescendant={results.length ? `rdr-cmdk-opt-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Buscar páginas"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Buscar páginas, herramientas…"
            className="w-full bg-transparent text-sm text-sand placeholder:text-sand/40 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-md border border-white/12 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-bold text-sand/50 sm:inline">
            Esc
          </kbd>
        </div>

        <ul
          id="rdr-cmdk-list"
          ref={listRef}
          role="listbox"
          aria-label="Resultados"
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-sand/55" role="presentation">
              Sin resultados para «{query}»
            </li>
          )}
          {results.map((item, i) => {
            const Icon = item.icon || IconArrow;
            const activeRow = i === active;
            return (
              <li
                key={`${item.section}-${item.label}-${item.target}`}
                id={`rdr-cmdk-opt-${i}`}
                role="option"
                aria-selected={activeRow}
                onPointerMove={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault() /* no robar el foco al input */}
                onClick={() => run(item)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${activeRow ? "bg-white/[0.1]" : ""}`}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
                  style={{
                    borderColor: rgba(item.sectionColor, 0.3),
                    background: rgba(item.sectionColor, 0.1),
                    color: mapAccent(item.sectionColor),
                  }}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-sand">
                    <span className="truncate">{item.label}</span>
                    {item.action === "open" && (
                      <IconExternal size={12} className="shrink-0 text-sand/45" aria-hidden />
                    )}
                  </span>
                  {item.desc && (
                    <span className="block truncate text-xs text-sand/60">{item.desc}</span>
                  )}
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: mapAccent(item.sectionColor), backgroundColor: rgba(item.sectionColor, 0.12) }}
                >
                  {item.section}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-white/12 px-4 py-2 text-[11px] text-sand/45">
          <kbd className="font-sans font-bold">↑↓</kbd> navegar · <kbd className="font-sans font-bold">Enter</kbd> abrir ·{" "}
          <kbd className="font-sans font-bold">Esc</kbd> cerrar
        </p>
      </div>
    </div>
  );
}
