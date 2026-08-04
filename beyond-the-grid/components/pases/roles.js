/**
 * Roles de la página de Pases Calendados.
 * admin  → puede activar/desactivar el modo debug (correos al buzón de
 *          pruebas en vez de al equipo) y usar las herramientas de debug.
 * member → resto del equipo (todo lo demás funciona igual).
 *
 * Los correos corresponden a equipo/equipo.json (mismo email con el que se
 * inicia sesión en el hub).
 */
export const ADMIN_EMAILS = [
  "angela.montero@nfq.es", //   Ángela Montero
  "pablo.llorente@nfq.es", //   Pablo Llorente
  "chema.martinez@nter.es", //  Chema Martinez
  "marta.trujillano@nfq.es", // Marta Trujillano
];

export function rolDe(email) {
  const x = String(email || "").trim().toLowerCase();
  return ADMIN_EMAILS.includes(x) ? "admin" : "member";
}
