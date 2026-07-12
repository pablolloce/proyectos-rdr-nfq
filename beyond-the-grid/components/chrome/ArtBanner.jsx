"use client";

/**
 * Franja de arte generativo tras el hero de una sección. Decorativa pura:
 * aria-hidden, lazy, y si la imagen falla (CDN caído/expirado) se elimina el
 * nodo entero — quedan los .rdr-blob de la página, que nunca dependen de ella.
 * Se funde con el Midnight con una máscara vertical para no crear "bordes".
 */
export default function ArtBanner({ src, className = "" }) {
  if (!src) return null;
  return (
    <div
      aria-hidden
      className={`rdr-art pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46vh] overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={(e) => e.currentTarget.parentElement?.remove()}
        className="h-full w-full object-cover opacity-[0.22]"
        style={{
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 15%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 15%, transparent 85%)",
        }}
      />
    </div>
  );
}
