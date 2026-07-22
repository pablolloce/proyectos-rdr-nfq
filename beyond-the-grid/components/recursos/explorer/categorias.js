// Categorías funcionales del Process Explorer — fuente única de la taxonomía.
//
// La clasificación se derivó ANALIZANDO el dataset (public/recursos/
// procesos-rdr-data.json): prefijos y tokens de las 216 cadenas Control-M
// (ALERT_, CON_/DIF_, CARGA/EXTRACCION/FICH, REINICIO/MANTENIMIENTO, MEX…),
// las colas KLYO/KYRS de los 562 listeners (SSIS/SCIS/PARTY/CONTACT/
// SECURITIES/AGREEMENT/PORTFOLIO/CALENDAR/INDEX…), y ENTIDADES ×
// SISTEMAS_CONECTADOS del inventario (FINS 40, ISSU 23, SSIS 12, LAGR 9,
// MKTD 8…). Cada proceso recibe 1–3 categorías ordenadas por relevancia
// (coincidencia en el NOMBRE pesa más que en campos secundarios).
//
// Colores: solo acentos ya usados en el sitio (lib/palette.js + RED del
// explorer + hielo #B9D4EE, presente en LIGHT_EQ de lib/theme.js). Con 15
// categorías algunos matices se repiten entre familias semánticamente
// lejanas; la pill siempre lleva el nombre, así que no hay ambigüedad.
// Convención del repo: el hex ORIGINAL tinta fondos/bordes (rgba) en ambos
// temas; el color de TEXTO pasa por useAcc/useAccentMap.
import { PALETTE } from "@/lib/palette";
import { RED } from "./lib";

export const CATEGORIAS = [
  { id: "alertas", nombre: "Alertas y excepciones", color: RED, desc: "Avisos operativos, gestión de excepciones, reenvíos y aprobaciones" },
  { id: "conciliacion", nombre: "Conciliación", color: PALETTE.mandarin, desc: "Conciliaciones, diferencias, duplicados, auditoría y calidad de datos" },
  { id: "liquidacion", nombre: "Liquidación (SSIs)", color: PALETTE.serene, desc: "Instrucciones de liquidación, SDIs y settlement details" },
  { id: "confirmaciones", nombre: "Confirmaciones (SCIs)", color: PALETTE.aqua, desc: "Instrucciones de confirmación y matching" },
  { id: "contrapartidas", nombre: "Contrapartidas y clientes", color: PALETTE.royal, desc: "Altas, bajas y datos de contrapartidas, clientes, cuentas y carteras" },
  { id: "contactos", nombre: "Contactos", color: PALETTE.lime, desc: "Datos de contacto y su mantenimiento" },
  { id: "emisiones", nombre: "Emisiones y valores", color: PALETTE.purple, desc: "Emisiones, instrumentos, ISINs y corporate actions (MoCA)" },
  { id: "acuerdos", nombre: "Acuerdos legales", color: PALETTE.royal, desc: "Legal agreements, contratos, garantías, colaterales y opiniones legales" },
  { id: "mercado", nombre: "Datos de mercado", color: PALETTE.mandarin, desc: "Precios, ratings, índices, calendarios y feeds Bloomberg/Refinitiv/Mentor" },
  { id: "regulatorio", nombre: "Reporting y regulatorio", color: PALETTE.purple, desc: "MiFID/MiFIR/EMIR, LEIs, LOPD, informes y reporting" },
  { id: "publicacion", nombre: "Publicación y difusión", color: PALETTE.lime, desc: "Difusión y publicación de datos hacia sistemas consumidores" },
  { id: "ficheros", nombre: "Cargas y ficheros", color: PALETTE.canary, desc: "Cargas, descargas, extracciones y envíos de ficheros" },
  { id: "mexico", nombre: "México y Latam", color: PALETTE.serene, desc: "Operativa de México (Bancomer), Colombia y Altamira Latam" },
  { id: "mantenimiento", nombre: "Mantenimiento", color: PALETTE.aqua, desc: "Arranques, reinicios, housekeeping, monitorización y cachés" },
  { id: "otros", nombre: "Otros", color: "#B9D4EE", desc: "Procesos sin familia funcional clara" },
];

export const CATEGORIA_MAP = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c]));

/* ── Reglas de clasificación ────────────────────────────────────────────────
   Cada regla es una regex probada sobre el texto PRIMARIO (nombre del
   proceso, peso 2) y el SECUNDARIO (colas, workflows, entidades, sistemas,
   descripciones…, peso 1). El orden de las reglas desempata a igualdad de
   peso: primero dominios de negocio concretos, después funciones genéricas
   (ficheros, mantenimiento), para que la categoría principal sea la más
   específica. Máximo 3 categorías por proceso. */
const REGLAS = [
  // México/Latam: sufijos MEX (CARGASCIS_MEX, AUDITMEX, ISSUEMEX…), Bancomer
  // (BNCM), CLABE y Altamira Colombia. OJO: los códigos de script MEKYTL####
  // NO son México (ME genérico), por eso se exige MEX como token/afijo real.
  { id: "mexico", re: /\bMEX|MEX\b|MEXSDI|BANCOMER|BNCM|COLOMBIA|CLABE/i },
  // Alertas + excepciones: cadenas ALERT_/GESTIONDEALERTAS, colas ALERT_SSI,
  // y toda la familia workstation del online (Exceptions, Resubmit, Hold,
  // maker-checker, aprobaciones, notificaciones por email).
  { id: "alertas", re: /ALERT|AVISO|NOTIFIC|EXCEPTION|RESUBMIT|\bHELD\b|HOLD MESSAGE|RELEASE (SINGLE|MULTIPLE|HOLD)|MAKER.?CHECKER|APPROV|REJECT|WORKSTATION|SUSPECT|EMAIL|PROACTIVE/i },
  // Conciliación: CON_/CONCI/DIF_ de las cadenas, DQ_/DUPLI (calidad de
  // datos), AUDIT, y Compare/Verification/FuzzyMatch/DataCertification del
  // online (conciliación de datos de vendors).
  { id: "conciliacion", re: /CONCI|CONCILIA|\bDIF\b|DIFERENCIA|DUPLI|\bDQ\b|DUPS|AUDIT|COMPARE|FUZZY|RECONCIL|VERIFICA|VERIFICATION|DATA.?CERTIF|DATA.?QUALITY|GAP.?DATOS/i },
  // Regulatorio y reporting: MiFID/MiFIR/EMIR, LEIs (GLEIF), LOPD, BCBS,
  // informes/reportes y gobierno OSI.
  { id: "regulatorio", re: /MIFID|MIFIR|EMIR\b|LOPD|BCBS|\bLEIS?\b|REGULAT|REPORTE|INFORME|\bREPORT\b|GOBIERNO|\bOSI\b|SIRE|OFAC|DATOS.?REGU|LEGAL.?ENTITY/i },
  // Liquidación: SSI/SSIS/SDI en nombres y colas SETTLEMENT/SISETUP/MODSDI
  // del ESB (KYRS.RDR.SETTLEMENT.*).
  { id: "liquidacion", re: /SSIS?\b|SDIS?\b|MODSDI|SETTLEMENT|SISETUP|LIQUIDACION/i },
  // Confirmaciones: SCIS/SCI y colas CONFIRMATIONS.
  { id: "confirmaciones", re: /SCIS?\b|CONFIRMATION/i },
  // Contactos: entidad CNTC y colas CONTACT/MODCONTACT.
  { id: "contactos", re: /CNTC|CONTACT/i },
  // Acuerdos legales: entidad LAGR/GUNT, agreements, contratos (C460),
  // garantías, colaterales y opiniones legales.
  { id: "acuerdos", re: /LAGR|GUNT|AGREEMENT|LEGAL|CONTRATO|CONTRACT|GARANTIA|COLLATERAL|OPINION|C?460\b/i },
  // Emisiones y valores: entidad ISSU/FIGR, emisiones/emisores, ISINs
  // (ANNA), warrants, securities y corporate actions (MoCA, entitlements).
  { id: "emisiones", re: /ISSU|EMISION|EMISORES|SECURIT|ISIN\b|WARRANT|\bANNA\b|MoCA|ENTITLEMENT|CORPS\b|CORPORATE|FIGR|GENESIS|BONO/i },
  // Contrapartidas y clientes: FINS/CPTY/PARTY, clientela/BDI, cuentas y
  // carteras (ACCT/PORTFOLIO), onboarding, oficinas, gestoras.
  { id: "contrapartidas", re: /CPTY|CPART|COUNTERPART|\bFINS\b|PARTY|CLIENT|CLIENTELA|CLIENTES|\bBDI\b|ONBOARDING|BANCARIZACION|OFICINAS?|CIERREOFI|THIRDPART|SUBACCOUNT|PORTFOLIO|ACCOUNT|\bACCT\b|GESTORAS|SCFF|COMEX|FONDOS/i },
  // Datos de mercado y referencia: Bloomberg (BBG), Refinitiv, Mentor,
  // precios (PriceValidation…), ratings, índices, baskets/sponsors,
  // calendarios/fechas/plazas y referencia (dictionary, dealtypes, tenor).
  { id: "mercado", re: /\bBBG\b|BLOOMBERG|REFINIT|MENTOR|RATING|PRICE|PRECIO|RMDS|XENOMORPH|INDEX|INDICE|FECHAS|CALENDAR|TENOR\b|BASIS\b|MKTD|CADF|DICTIONARY|DICCIONARIO|DEALTYPE|DEALMANDATE|BASKET|SPONSOR|BENCHMARK|SECTOR|COUNTRY|PLAZAS|NIVELES|MARKET|MERCADO|GOLDEN|TOLERANCE|STALE|VENDOR/i },
  // Publicación y difusión: DIFUSION/DIFU en cadenas, workflows *Publish*
  // y colas *.PUBLISH/INITIALLOAD del ESB.
  { id: "publicacion", re: /DIFUS|DIFU\b|PUBLISH|PUBLICACION|PUBLICATION|INITIALLOAD|OLAP/i },
  // Cargas y ficheros: CARGA/DESCARGA/EXTRACCION/FICH/LOAD/ENVIO/SEND,
  // file-loads del online y transmisiones.
  { id: "ficheros", re: /CARGA|DESCARGA|FICH\b|FICHERO|EXTRAC|ENVIO|LOAD|FILE|UPLOAD|\bCSV\b|TRANSMISION|SEND|RECEP|RECEIVE|DOWNLOAD|\bFEED\b/i },
  // Mantenimiento y operación: arranques/paradas/reinicios, housekeeping de
  // logs y tablas, monitorización, morning checks, cachés, purgas y pruebas.
  { id: "mantenimiento", re: /MANTENIMIENTO|REINICIO|RESTART|ARRANQUE|ARRANCAR|PARADA|ARCHIVADO|\bLOGS?\b|BORRALOG|PURG|CLEANUP|CLEAN|COMPRIME|HISTORIFICACION|\bHIST\b|MONITOR|MORNING|CHECK|ENGINES|CONTINGENCIA|STATS|CACHE|HOUSEKEEP|PRUEBA|\bTEST\b|CONSUMO|PLANIFICADOR|SCHEDUL|TRAZAS|EXPIRED|LOCK|MAINTENANCE|REFRESH|DIAGNOSTIC/i },
];

const MAX_CATS = 3;

const join = (...vs) => vs.filter(Boolean).join(" ");

/* Texto primario (nombre) y secundario (contexto) por tipo de proceso. */
function textos(tipo, item, extras = {}) {
  if (tipo === "batch") {
    // item = nombre de la cadena; extras.steps = pasos, extras.meta = chainsMeta
    const steps = extras.steps || [];
    return [
      join(item, extras.meta && extras.meta.natural),
      steps.map((s) => join(s.NOMBRE, s.PARAMETRO, s.WORKFLOW_GS, s.SUB_WORKFLOWS, s.JAVAS, s.SCRIPTS, s.COLA_JMS)).join(" "),
    ];
  }
  if (tipo === "online")
    return [
      join(item.NOMBRE, item.NOMBRE_NATURAL),
      join(item.COLA_ESCUCHA, item.WORKFLOW_GS, item.SUB_WORKFLOWS, item.PARAMETRO, item.EVENTO_GS, item.CLASE_EVENTO, item.COLA_JMS),
    ];
  if (tipo === "publish")
    return [
      join(item.WORKFLOW, item.NOMBRE_NATURAL),
      join(item.DESCRIPCION, item.ENTIDADES, item.SISTEMAS_CONECTADOS, (item.CALLERS || []).join(" "), (item.QUEUES || []).join(" "), item.CADENAS_CONTROLM),
    ];
  // inv
  return [
    join(item.NOMBRE_NATURAL, item.ID),
    join(item.DESCRIPCION, item.ENTIDADES, item.SISTEMAS_CONECTADOS, item.CADENAS_CONTROLM, item.EVENTOS_JMS),
  ];
}

/** Clasifica un proceso → array de 1–3 ids de categoría por relevancia. */
/* Los nombres técnicos van en snake_case o con puntos (colas JMS): se
   normalizan los separadores a espacios para que los \b de las reglas
   funcionen (p. ej. \bBDI\b debe casar en "RDR_CON_BDI"). */
const norm = (s) => s.replace(/[_.,;:/()-]+/g, " ");

export function clasificar(tipo, item, extras) {
  const [pri, sec] = textos(tipo, item, extras).map(norm);
  const hits = [];
  REGLAS.forEach((r, orden) => {
    const enPri = r.re.test(pri);
    const enSec = !enPri && r.re.test(sec);
    if (enPri || enSec) hits.push({ id: r.id, peso: enPri ? 2 : 1, orden });
  });
  hits.sort((a, b) => b.peso - a.peso || a.orden - b.orden);
  const ids = hits.slice(0, MAX_CATS).map((h) => h.id);
  return ids.length ? ids : ["otros"];
}

/* Índice precalculado (UNA vez tras el fetch, no en cada render):
   { batch: {nombreCadena: ids[]}, online: ids[][], publish: ids[][], inv: ids[][] } */
export function buildCatIndex(data) {
  const batch = {};
  Object.keys(data.chains || {}).forEach((n) => {
    batch[n] = clasificar("batch", n, { steps: data.chains[n], meta: (data.chainsMeta || {})[n] });
  });
  return {
    batch,
    online: (data.online || []).map((e) => clasificar("online", e)),
    publish: (data.publishing || []).map((p) => clasificar("publish", p)),
    inv: (data.inventory || []).map((p) => clasificar("inv", p)),
  };
}

/** ¿Alguna de las categorías de `ids` casa con el texto de búsqueda `q`?
    Permite que escribir "alertas" o "mercado" encuentre procesos por su
    categoría además de por sus campos. */
export function catsMatchQuery(ids, q) {
  if (!q) return false;
  return (ids || []).some((id) => {
    const c = CATEGORIA_MAP[id];
    return c && (c.nombre.toLowerCase().includes(q) || c.id.includes(q));
  });
}
