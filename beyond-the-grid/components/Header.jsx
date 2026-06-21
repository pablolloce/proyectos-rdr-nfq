"use client";

/** Cabecera compacta del hub (sustituye al hero a pantalla completa). */
export default function Header() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 pt-10 pb-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold leading-tight text-sand md:text-4xl">
          RDR Knowledge
        </h1>
        <p className="mt-1 text-sm text-serene/80">
          Hub de documentación · BBVA × NFQ
        </p>
      </div>
      <span className="shrink-0 font-sans text-xl font-black tracking-tight text-sand md:text-2xl">
        BBVA
      </span>
    </header>
  );
}
