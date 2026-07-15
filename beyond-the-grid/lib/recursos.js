// Catálogo de RECURSOS RDR — fuente única del sub-hub /recursos.
// Para añadir un recurso nuevo: (1) deja el material en public/recursos/
// (HTML autocontenido) o crea una ruta Next, y (2) añade una entrada aquí.
// tipo: "page" (HTML estático de public/, href con basePath /team-hub)
//     | "route" (ruta Next interna, href sin basePath).
import { PALETTE } from "./palette";

export const RECURSOS = [
  {
    slug: "procesos-rdr-explorer",
    titulo: "Process Explorer",
    desc: "Cadenas batch, listeners online, publishers e inventario de procesos RDR, con el flujo de ejecución paso a paso de cada uno.",
    tipo: "route",
    href: "/recursos/procesos",
    color: PALETTE.aqua,
    etiqueta: "Herramienta interactiva",
    tags: ["Batch", "Online", "Publish", "Inventario"],
  },
  {
    slug: "mapa-procesos",
    titulo: "Mapa de flujos",
    desc: "Viaja por el flujo de ejecución de cada proceso: pasos, workflows, eventos y colas conectados entre sí.",
    tipo: "route",
    href: "/recursos/mapa",
    color: PALETTE.purple,
    etiqueta: "Mapa interactivo",
    tags: ["Flujos", "Batch", "Online", "Eventos"],
  },
  // ── Próximos recursos: añadir aquí ──
];
