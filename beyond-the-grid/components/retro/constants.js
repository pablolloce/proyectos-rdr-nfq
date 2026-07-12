import { PALETTE } from "@/lib/palette";

// Acento de la ruta /retro: mandarin, el color de la sección "Equipo" del hub.
export const ACCENT = PALETTE.mandarin;

// ── Contrato funcional heredado de public/retro.html (NO cambiar textos/ids:
//    los ids op1..op5 y las categorías viajan tal cual al backend Apps Script).
export const FASES_NOMBRES = ["Termómetro de confianza", "Grupo", "Votar", "Comentamos", "Completo"];

export const TERMOMETRO_OPCIONES = [
  { id: "op1", texto: "Plena confianza", emoji: "🤩", color: PALETTE.royal },
  { id: "op2", texto: "Cómodo", emoji: "😌", color: PALETTE.purple },
  { id: "op3", texto: "Un poco cauto", emoji: "🤔", color: PALETTE.canary },
  { id: "op4", texto: "Reservado", emoji: "🤐", color: PALETTE.mandarin },
  { id: "op5", texto: "Prefiero escuchar", emoji: "👂", color: "#ADB8C2" },
];

export const CATEGORIAS = [
  { id: "ÉXITO", titulo: "Éxito 🤩", desc: "Lo que logramos y debemos celebrar", color: PALETTE.canary, colId: "exito" },
  { id: "OBSTÁCULOS", titulo: "Obstáculos 🤬", desc: "Esos dolorsitos o trabas del día a día", color: PALETTE.mandarin, colId: "obstaculos" },
  { id: "RECONOCIMIENTO", titulo: "Reconocimiento 🏆", desc: "Agradecimientos entre compañeros", color: PALETTE.serene, colId: "reconocimiento" },
];

export const MEJORAS_COLOR = PALETTE.lime;

/** Extrae el prefijo "[PARA:destinatario]" de los reconocimientos (formato del backend). */
export function parseReconocimiento(t) {
  let txt = t.texto || "";
  let dest = null;
  if (t.categoria === "RECONOCIMIENTO" && txt.startsWith("[PARA:")) {
    const idx = txt.indexOf("]");
    if (idx !== -1) {
      dest = txt.substring(6, idx);
      txt = txt.substring(idx + 1);
    }
  }
  return { txt, dest };
}

/** A partir de la fase 4 las tarjetas se ordenan por votos (desempate por id), como en el legacy. */
export function ordenarTarjetas(tarjetas, fase) {
  const arr = [...tarjetas];
  if (fase >= 4) arr.sort((a, b) => (b.votos - a.votos) || String(a.id).localeCompare(String(b.id)));
  return arr;
}

/** Cuenta votos del termómetro { op1..op5 } a partir de la lista cruda del backend. */
export function contarTermometro(termometro) {
  const votos = { op1: 0, op2: 0, op3: 0, op4: 0, op5: 0 };
  (termometro || []).forEach((t) => {
    if (votos[t.voto] !== undefined) votos[t.voto]++;
  });
  return votos;
}
