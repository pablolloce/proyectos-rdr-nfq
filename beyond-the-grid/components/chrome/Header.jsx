"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "./AuthGate";
import { useLinks } from "@/lib/links";
import { useTheme, useAccentMap } from "@/lib/theme";
import { menuSections, activeSectionId, trailFor } from "@/lib/nav";
import { rgba } from "@/lib/ui";
import CommandPalette from "./CommandPalette";
import {
  IconSearch, IconMenu, IconClose, IconChevronDown, IconExternal, IconHome,
} from "../icons";

/**
 * Cabecera fija (barra opaca con blur) + navegación global:
 *  - Desktop (lg+): fila de secciones con menús desplegables (click; Escape /
 *    click fuera cierran; flechas dentro del menú). La sección ACTIVA queda
 *    señalada con subrayado en su color. La marca "RDR Knowledge" enlaza a /.
 *  - Subtítulo: en la raíz, el lema del hub; en secciones, su descripción; en
 *    rutas anidadas, MIGAS clicables ("Recursos → Process Explorer").
 *  - Móvil (<lg): marca compacta + Buscar + hamburguesa → sheet a pantalla
 *    completa con acordeones por sección, Inicio, tema y Salir.
 *  - Botón Buscar (⌘K) → paleta de comandos (CommandPalette).
 */

/* ── Item de menú (compartido por dropdown desktop y sheet móvil) ─────── */
function MenuLink({ item, color, onNavigate, big = false }) {
  const { getUrl } = useLinks();
  const mapAccent = useAccentMap();
  const Icon = item.icon;
  const pathname = usePathname() || "/";
  const current =
    item.action === "route" &&
    (pathname === item.target || pathname.startsWith(item.target + "/"));

  const cls = `group flex w-full items-center gap-3 rounded-xl px-3 ${big ? "py-3" : "py-2.5"} text-left transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${current ? "bg-white/[0.06]" : ""}`;

  const inner = (
    <>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
        style={{ borderColor: rgba(color, 0.3), background: rgba(color, 0.1), color: mapAccent(color) }}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] font-bold text-sand">
          <span className="truncate">{item.label}</span>
          {item.action === "open" && (
            <IconExternal size={12} className="shrink-0 text-sand/45" aria-hidden />
          )}
        </span>
        {item.desc && <span className="block truncate text-xs text-sand/60">{item.desc}</span>}
      </span>
    </>
  );

  if (item.action === "route")
    return (
      <Link
        href={item.target}
        role="menuitem"
        aria-current={current ? "page" : undefined}
        className={cls}
        onClick={onNavigate}
      >
        {inner}
      </Link>
    );
  if (item.action === "page")
    return (
      <a href={item.target} role="menuitem" data-prerender className={cls} onClick={onNavigate}>
        {inner}
      </a>
    );
  // open (externo vía links.json)
  const url = getUrl(item.target);
  if (!url)
    return (
      <span role="menuitem" aria-disabled="true" title="Enlace no disponible aún" className={`${cls} cursor-not-allowed opacity-50`}>
        {inner}
      </span>
    );
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" role="menuitem" className={cls} onClick={onNavigate}>
      {inner}
    </a>
  );
}

/* ── Botón de sección + dropdown (desktop) ────────────────────────────── */
function NavSection({ sec, isActive, open, onToggle, onClose }) {
  const mapAccent = useAccentMap();
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Flechas dentro del menú (role=menu): mueve el foco entre items.
  const onPanelKeyDown = (e) => {
    const items = panelRef.current
      ? Array.from(panelRef.current.querySelectorAll('[role="menuitem"]'))
      : [];
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      btnRef.current?.focus();
    } else if (e.key === "Tab") {
      onClose();
    }
  };

  // Al abrir con teclado (Enter/flecha) el primer item recibe el foco.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      panelRef.current?.querySelector('[role="menuitem"]')?.focus();
    }, 10);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`nav-menu-${sec.id}`}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`relative inline-flex items-center gap-1 rounded-lg px-2.5 py-2 font-sans text-xs font-bold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene ${
          isActive || open ? "text-sand" : "text-sand/65 hover:text-sand"
        }`}
        style={isActive ? { color: mapAccent(sec.color) } : undefined}
      >
        {sec.title}
        {isActive && <span className="sr-only">(sección actual)</span>}
        <IconChevronDown
          size={12}
          aria-hidden
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        {/* Indicador de sección activa: subrayado en su color */}
        <span
          aria-hidden
          className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full transition-opacity"
          style={{ background: sec.color, opacity: isActive ? 1 : 0 }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            id={`nav-menu-${sec.id}`}
            ref={panelRef}
            role="menu"
            aria-label={sec.title}
            onKeyDown={onPanelKeyDown}
            /* x:-50% centra el panel bajo el botón (framer gestiona el transform) */
            initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, y: -6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, y: -6, x: "-50%" }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-50 mt-2 w-80 rounded-2xl border border-white/12 bg-midnight/95 p-2 backdrop-blur-xl"
            style={{ boxShadow: `inset 0 2px 0 ${rgba(sec.color, 0.7)}, 0 20px 50px -12px rgba(0,0,0,0.45)` }}
          >
            {sec.items.map((item) => (
              <MenuLink key={item.label} item={item} color={sec.color} onNavigate={onClose} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sheet de navegación móvil (<lg) ──────────────────────────────────── */
function MobileSheet({ open, onClose, sections, activeId }) {
  const { email, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const mapAccent = useAccentMap();
  const reduce = useReducedMotion();
  const pathname = usePathname() || "/";
  const [openAcc, setOpenAcc] = useState(activeId);
  const closeBtnRef = useRef(null);
  const sheetRef = useRef(null);

  // Al abrir: acordeón de la sección actual desplegado + foco en cerrar + scroll lock.
  useEffect(() => {
    if (!open) return;
    setOpenAcc(activeId);
    closeBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, activeId]);

  // Foco contenido en el sheet (es pantalla completa, Tab cicla dentro).
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !sheetRef.current) return;
    const focusables = Array.from(
      sheetRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          onKeyDown={onKeyDown}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[60] flex flex-col bg-midnight lg:hidden"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <span className="font-display text-lg font-bold text-sand">RDR Knowledge</span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="grid h-10 w-10 place-items-center rounded-full border border-serene/30 bg-midnight/70 text-sand transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              <IconClose size={18} />
            </button>
          </div>

          <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-5 py-4">
            <Link
              href="/"
              onClick={onClose}
              aria-current={pathname === "/" ? "page" : undefined}
              className="mb-3 flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-bold text-sand transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              <IconHome size={18} className="text-serene" />
              Inicio · Hub
            </Link>

            {sections.map((sec) => {
              const expanded = openAcc === sec.id;
              const active = activeId === sec.id;
              return (
                <div key={sec.id} className="mb-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]" style={{ boxShadow: `inset 0 2px 0 ${rgba(sec.color, 0.7)}` }}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`sheet-sec-${sec.id}`}
                    onClick={() => setOpenAcc(expanded ? null : sec.id)}
                    className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sec.color }} aria-hidden />
                    <span
                      className="flex-1 font-display text-sm font-bold uppercase tracking-[0.15em] text-sand"
                      style={active ? { color: mapAccent(sec.color) } : undefined}
                    >
                      {sec.title}
                      {active && <span className="sr-only"> (sección actual)</span>}
                    </span>
                    <IconChevronDown
                      size={14}
                      aria-hidden
                      className={`text-sand/50 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expanded && (
                    <div id={`sheet-sec-${sec.id}`} className="px-2 pb-2">
                      {sec.items.map((item) => (
                        <MenuLink key={item.label} item={item} color={sec.color} onNavigate={onClose} big />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] px-5 py-4">
            {email && <p className="mb-3 truncate text-xs text-sand/60">{email}</p>}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggle}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-serene/30 bg-midnight/70 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-sand transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-serene/30 bg-midnight/70 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-sand transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                Salir
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Migas / subtítulo bajo la marca ──────────────────────────────────── */
function Subtitle({ pathname }) {
  const trail = trailFor(pathname);
  if (!trail) {
    return <p className="mt-0.5 truncate text-xs text-serene/80 sm:text-sm">Hub de documentación · BBVA × NFQ</p>;
  }
  if (trail.length === 1) {
    return <p className="mt-0.5 truncate text-xs text-serene/80 sm:text-sm">{trail[0].sub}</p>;
  }
  return (
    <nav aria-label="Miga de pan" className="mt-0.5 min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-xs text-serene/80 sm:text-sm">
        {trail.map((c, i) => (
          <li key={c.label} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <span aria-hidden className="shrink-0 text-sand/40">→</span>}
            {c.href ? (
              <Link
                href={c.href}
                className="shrink-0 rounded-sm underline-offset-2 transition-colors hover:text-sand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate font-bold text-sand/90">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Header ───────────────────────────────────────────────────────────── */
export default function Header() {
  const { email, logout, isCoordinador } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname() || "/";
  const sections = menuSections(isCoordinador);
  const activeId = activeSectionId(pathname);
  const [openMenu, setOpenMenu] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navRef = useRef(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  // Cierra el dropdown con click fuera de la fila de navegación.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeMenu();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openMenu, closeMenu]);

  // Cambio de ruta interna → todo cerrado.
  useEffect(() => {
    setOpenMenu(null);
    setSheetOpen(false);
  }, [pathname]);

  const openSearch = () => window.dispatchEvent(new Event("rdr-open-palette"));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-midnight">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
          {/* ── Marca (→ enlaza al hub) + subtítulo/migas ── */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Botón Inicio: solo móvil (en lg+ la marca y la nav lo hacen redundante) */}
            {pathname !== "/" && (
              <Link
                href="/"
                aria-label="Volver al inicio"
                className="inline-flex shrink-0 items-center rounded-full border-[1.5px] border-serene/35 bg-midnight/70 p-2.5 text-sand shadow-[0_4px_14px_rgba(0,0,0,0.3)] backdrop-blur transition hover:-translate-y-px hover:border-serene/70 hover:bg-midnight/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene lg:hidden"
              >
                <IconHome size={16} aria-hidden />
              </Link>
            )}
            {/* Marca compacta en móviles muy estrechos (<460px) */}
            <Link
              href="/"
              className="rounded-sm font-display text-lg font-bold leading-none text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene min-[460px]:hidden"
            >
              RDR
            </Link>
            <div className="hidden min-w-0 min-[460px]:block">
              <Link
                href="/"
                className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
              >
                <h1 className="truncate font-display text-xl font-bold leading-tight tracking-tight text-sand sm:text-2xl">
                  RDR Knowledge
                </h1>
              </Link>
              <Subtitle pathname={pathname} />
            </div>
          </div>

          {/* ── Navegación de secciones (desktop) ── */}
          <nav ref={navRef} aria-label="Secciones del hub" className="hidden shrink-0 items-center gap-0.5 lg:flex">
            {sections.map((sec) => (
              <NavSection
                key={sec.id}
                sec={sec}
                isActive={activeId === sec.id}
                open={openMenu === sec.id}
                onToggle={() => setOpenMenu((o) => (o === sec.id ? null : sec.id))}
                onClose={closeMenu}
              />
            ))}
          </nav>

          {/* ── Acciones ── */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Buscar (⌘K) */}
            <button
              type="button"
              onClick={openSearch}
              aria-label="Buscar páginas (Ctrl+K)"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-serene/30 bg-midnight/70 px-3 text-sand transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene"
            >
              <IconSearch size={15} aria-hidden />
              <span className="hidden text-xs font-bold uppercase tracking-wider xl:inline">Buscar</span>
              <kbd className="hidden rounded-md border border-white/12 bg-white/[0.05] px-1.5 py-0.5 font-sans text-[10px] font-bold text-sand/60 xl:inline">
                ⌘K
              </kbd>
            </button>

            {email && <span className="hidden max-w-[16ch] truncate text-xs text-sand/70 xl:inline">{email}</span>}

            {/* Tema + Salir: desktop (en móvil viven dentro del sheet) */}
            <button
              type="button"
              onClick={toggle}
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="hidden h-9 w-9 place-items-center rounded-full border border-serene/30 bg-midnight/70 text-sand transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene lg:grid"
            >
              {theme === "dark" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-full border border-serene/30 bg-midnight/70 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-sand backdrop-blur transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene lg:inline-flex"
            >
              Salir
            </button>

            {/* Menú (móvil) */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className="grid h-9 w-9 place-items-center rounded-full border border-serene/30 bg-midnight/70 text-sand transition-colors hover:border-serene active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serene lg:hidden"
            >
              <IconMenu size={17} aria-hidden />
            </button>

            {/* Logo oficial BBVA — WHITE sobre Midnight, RGB sobre claros. */}
            <img
              src={theme === "light" ? "/team-hub/logos/bbva-rgb.png" : "/team-hub/logos/bbva-white.png?v=2"}
              alt="BBVA"
              className="h-5 w-auto sm:h-6 md:h-7"
            />
          </div>
        </div>
      </header>

      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} sections={sections} activeId={activeId} />
      <CommandPalette />
    </>
  );
}
