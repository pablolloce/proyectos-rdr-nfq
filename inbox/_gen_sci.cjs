/* Generador del deck FUNCIONAL · Instrucciones de Confirmación y Notificación (SCIS)
   Reformatea pendientes/SCIS-InstruccionesConfirmacion-Presentacion.html al formato
   de las formaciones BBVA × NFQ (deck 16:9, tokens, navegación, quiz, certificado). */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'formacion', 'form-tecnico-1-tecnologias-rdr.html');
const OUT = path.join(ROOT, 'formacion', 'form-functional-2-instrucciones-confirmacion.html');
const src = fs.readFileSync(SRC, 'utf8');

// ── Andamiaje del deck técnico ─────────────────────────────────────────────
const headEnd = src.indexOf('</head>');
const HEAD = src.slice(0, headEnd + 7)
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Instrucciones de Confirmación · Formación BBVA × NFQ</title>');
const NAV_A = src.indexOf('<script>', src.indexOf('Envolver cada slide') - 200);
const NAV_SCRIPT = src.slice(NAV_A, src.indexOf('</script>', NAV_A) + 9);
const CERT_A = src.indexOf('CERTIFICADO PDF');
const CERT_SCRIPT_A = src.lastIndexOf('<script>', CERT_A);
const CERT_SCRIPT = src.slice(CERT_SCRIPT_A, src.indexOf('</script>', CERT_SCRIPT_A) + 9);
const LOGO_INJ_A = src.lastIndexOf('<script>', src.indexOf('Inyectar logos al sistema'));
const LOGO_INJ = src.slice(LOGO_INJ_A, src.indexOf('</script>', LOGO_INJ_A) + 9);

// ── Logos transparentes ────────────────────────────────────────────────────
const LG = JSON.parse(fs.readFileSync(path.join(__dirname, '_logos.json'), 'utf8'));
const BBVA_W = LG[0], NFQ_ISO = LG[1], NFQ_WORD = LG[2];
const isDark = (c) => c === 'electric' || c === 'midnight';
const bbvaLogo = (combo) => isDark(combo)
  ? '<span class="lg lg-bbva lg--white" role="img" aria-label="BBVA"></span>'
  : '<span class="lg lg-bbva lg--blue" role="img" aria-label="BBVA"></span>';

function slide(combo, aria, crumbMain, crumbSub, footerLabel, main, extraStyle) {
  const sub = crumbSub ? `<span class="breadcrumb__sub">${crumbSub}</span>` : '';
  return `
<section class="slide bbva-combo--${combo}" aria-label="${aria}"${extraStyle ? ` style="${extraStyle}"` : ''}>
  <header class="slide__header">
    <nav class="breadcrumb"><span>${crumbMain}</span>${sub}</nav>
    ${bbvaLogo(combo)}
  </header>
  ${main}
  <footer class="slide__footer">
    <span>${footerLabel}</span>
    <div class="nfq-credit"><span class="nfq-credit__label">Hecho por</span><span class="lg lg-nfq-iso" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`;
}

const slides = [];

/* 1 · PORTADA */
slides.push(`
<section class="slide bbva-combo--electric" aria-label="Portada">
  <header class="slide__header">
    <span style="font-family:var(--bbva-font-body);font-weight:700;font-size:var(--bbva-fs-label);letter-spacing:.08em;text-transform:uppercase;color:var(--bbva-serene-blue);">Formación Funcional · Nivel 02</span>
    <span class="lg lg-bbva--xl lg--white" role="img" aria-label="BBVA"></span>
  </header>
  <div style="align-self:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">RDR · CONFIRMACIÓN Y NOTIFICACIÓN</p>
    <h1 class="bbva-hero" style="line-height:.95;">Instrucciones de<br>Confirmación</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:66ch;">Standard Confirmation Instructions (SCIS): cómo RDR gestiona el maestro de datos de confirmación y notificación, sus canales de envío y el soporte a la migración.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;">
      <span class="pill">~55K registros</span><span class="pill">Confirmation · Notification</span><span class="pill">EMAIL · SWIFT · FAX</span><span class="pill">Calypso</span>
    </div>
  </div>
  <footer class="slide__footer">
    <span style="color:var(--bbva-serene-blue);">BBVA CIB · RDR</span>
    <div class="nfq-credit"><span class="nfq-credit__label" style="color:var(--bbva-sand);">Hecho por</span><span class="lg lg-nfq-word" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`);

/* 2 · ÍNDICE */
slides.push(slide('sand', 'Índice', 'INSTRUCCIONES DE CONFIRMACIÓN', 'ÍNDICE', '01 · Índice', `
  <main>
    <p class="ante-title">Qué vas a aprender</p>
    <h1 style="margin-bottom:var(--bbva-space-3);">Recorrido</h1>
    <div class="section-index">
      <div class="section-index__item"><p class="section-index__label">01</p><p class="section-index__title">Qué es una SCIS</p></div>
      <div class="section-index__item"><p class="section-index__label">02</p><p class="section-index__title">Tipos y características</p></div>
      <div class="section-index__item"><p class="section-index__label">03</p><p class="section-index__title">Canales y plataformas</p></div>
      <div class="section-index__item"><p class="section-index__label">04</p><p class="section-index__title">Modelo de datos</p></div>
      <div class="section-index__item"><p class="section-index__label">05</p><p class="section-index__title">Gestión y ciclo de vida</p></div>
      <div class="section-index__item"><p class="section-index__label">06</p><p class="section-index__title">Difusión y volumetría</p></div>
      <div class="section-index__item"><p class="section-index__label">07</p><p class="section-index__title">Migración y simulacros</p></div>
    </div>
  </main>`));

/* 3 · ¿QUÉ ES UNA SCIS? */
slides.push(slide('sand', 'Qué es una SCIS', 'INSTRUCCIONES DE CONFIRMACIÓN', '01 · Introducción', '01 · Introducción', `
  <main>
    <p class="ante-title">01 · Introducción</p>
    <h1>¿Qué es una SCIS?</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-2);max-width:82ch;">Una <strong>Standard Confirmation Instruction</strong> es un acuerdo operativo entre BBVA y una contraparte que codifica las instrucciones de <strong>confirmación / notificación</strong> de operaciones financieras.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Confirmación de operaciones</h3><p>Cuando un trade se ejecuta, el sistema confirma según las SCIs válidas para <em>Contraparte + Producto + Branch + Fechas</em>. Define a quién se envía, por qué medio y para qué productos.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>RDR, el maestro</h3><p>RDR es el <strong>sistema maestro</strong> de instrucciones de confirmación y notificación. Las suministra al BO (Calypso, SWIFT, plataformas de post-trade matching).</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);"><strong>Analogía rápida:</strong> si las <strong>SSI</strong> determinan <em>"por dónde paga el dinero"</em> (bancos, cuentas, rutas SWIFT), las <strong>SCIS</strong> determinan <em>"cómo se confirma que se hizo la operación"</em> — a quién, por qué medio y para qué productos.</div>
  </main>`));

/* 4 · 6 PREGUNTAS */
slides.push(slide('sand', 'Seis preguntas que responde una SCIS', 'CONCEPTO', '01 · Concepto', '01 · Concepto', `
  <main>
    <p class="ante-title">01 · Concepto</p>
    <h1 style="margin-bottom:var(--bbva-space-2);">6 preguntas que responde una SCIS</h1>
    <div class="sg3">
      <div class="scard"><h3>¿Quién?</h3><p>Quién envía y/o recibe la confirmación (indicadores <strong>Sender / Receiver</strong>).</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>¿Qué?</h3><p>Qué productos financieros cubre (un tipo específico o <strong>ALL</strong>).</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>¿Cuáles branches?</h3><p>Qué sucursales BBVA aplican (exactamente <strong>1 branch activa</strong>).</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>¿Cómo?</h3><p>Por qué medio se envía: <strong>SWIFT, EMAIL, FAX</strong>, plataformas electrónicas…</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>¿Cuándo?</h3><p>Período de vigencia (<strong>Date From / Date To</strong>). Por defecto, sin caducidad.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-mandarin);"><h3>¿A quién?</h3><p>El <strong>contacto</strong> responsable destinatario de la confirmación/notificación.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Datos clave:</strong> contrapartida, producto, branch, Sender/Receiver, canal de envío (media), contacto destinatario, fechas de vigencia y códigos electrónicos de plataforma.</div>
  </main>`));

/* 5 · CONFIRMATION vs NOTIFICATION */
slides.push(slide('sand', 'Confirmation vs Notification', 'TIPOS', '01 · Tipos', '01 · Tipos', `
  <main>
    <p class="ante-title">01 · Tipos</p>
    <h1>Confirmation vs. Notification</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">El campo <code>CONFIRM_INSTRUC_DESC</code> discrimina dos tipos de instrucción con propósitos distintos.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>CONFIRMATION</h3><p>Confirmación de ejecución de operaciones (<strong>trade confirm</strong>). Es el tipo principal.</p><ul class="slist"><li>• Confirma que la operación se ha realizado</li><li>• Requiere <strong>matching / respuesta</strong> de la contraparte</li><li>• Campo <code>TRADE_TYP</code> vacío</li><li>• Canal típico: SWIFT (MT300/320/360), EMAIL</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-canary);"><h3>NOTIFICATION</h3><p>Notificación informativa — <strong>no requiere matching ni respuesta</strong>.</p><ul class="slist"><li>• Incluye sub-tipo en <code>TRADE_TYP</code></li><li>• 3 eventos: <strong>fixing</strong>, <strong>pago/liquidación</strong>, <strong>vencimiento</strong></li><li>• Una contrapartida puede tener de 0 a 3 tipos</li></ul></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>En una migración:</strong> no se paraliza el GoLive si falta una SCI, pero es <strong>muy importante</strong> dar de alta y publicar todas las de la operativa que migra <em>antes del GoLive</em> para que el flujo productivo continúe.</div>
  </main>`));

/* 6 · CARACTERÍSTICAS */
slides.push(slide('sand', 'Características principales', 'CONCEPTO', '01 · Características', '01 · Características', `
  <main>
    <p class="ante-title">01 · Características</p>
    <h1 style="margin-bottom:var(--bbva-space-2);">Características principales</h1>
    <div class="sg3">
      <div class="scard"><h3>Clave funcional</h3><p>(Counterparty, Product, Branch, Media) determina la SCIS aplicable.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Jerarquía padre-hijo</h3><p>SCIS genérica (ALL) &gt; SCIS específica por instrumento &gt; override temporal.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>Vigencia temporal</h3><p>Los campos <code>Date From</code>/<code>Date To</code> (DATEFROM/DATETO) planifican altas/bajas futuras. Por defecto, sin caducidad.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>STP (Straight-Through)</h3><p>Flag <code>STPCONF</code>: asignación automática de la SCIS a las confirmaciones sin intervención manual.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Sender / Receiver</h3><p>Indica si la contraparte envía o recibe. <strong>Sender XOR Receiver</strong>, nunca ambos.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>Trazabilidad</h3><p>Cada cambio queda auditado. La cadena <strong>SCISDENE</strong> (REL_NEW) reconstruye el historial completo.</p></div>
    </div>
  </main>`));

/* 7 · CANALES */
slides.push(slide('sand', 'Canales de confirmación', 'CANALES Y PLATAFORMAS', '02 · Canales', '02 · Canales', `
  <main>
    <p class="ante-title">02 · Canales</p>
    <h1>Canales de confirmación</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">Los medios reales por los que viaja la confirmación (~58K registros en <code>FT_T_SCMO</code>).</p>
    <table class="stable" style="margin-top:var(--bbva-space-2);">
      <thead><tr><th>Canal</th><th>Registros</th><th>%</th><th>Categoría</th><th>Uso</th></tr></thead>
      <tbody>
        <tr><td><span class="sbadge sbadge--g">EMAIL</span></td><td>42.569</td><td>70,8%</td><td>Manual</td><td>Canal dominante — la mayoría de contrapartes</td></tr>
        <tr><td><span class="sbadge sbadge--o">FAX</span></td><td>8.488</td><td>14,1%</td><td>Manual</td><td>Contrapartes legacy</td></tr>
        <tr><td><span class="sbadge sbadge--b">SWIFT</span></td><td>4.879</td><td>8,1%</td><td>Electrónico</td><td>OTC, repos, renta fija (MT300/320/360)</td></tr>
        <tr><td><span class="sbadge sbadge--y">FX ALL</span></td><td>1.840</td><td>3,1%</td><td>Electrónico</td><td>Plataforma FX</td></tr>
        <tr><td><span class="sbadge sbadge--y">MISYS</span></td><td>363</td><td>0,6%</td><td>Electrónico</td><td>Misys/Finastra</td></tr>
        <tr><td><span class="sbadge sbadge--y">BBG / TRADENEXUS</span></td><td>142</td><td>0,2%</td><td>Electrónico</td><td>Bloomberg / TradeNexus (en implantación)</td></tr>
      </tbody>
    </table>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Conclusión:</strong> EMAIL (71%) + FAX (14%) = <strong>85%</strong> de las instrucciones. SWIFT, pese a ser el estándar de referencia, es solo el 8% — concentrado en derivados OTC, repos y renta fija.</div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-1);"><strong>Canal ≠ identificador electrónico:</strong> el <em>canal</em> (<code>CONFIRM_MEDIA_TYP</code>) es el transporte real; el <em>identificador electrónico</em> (<code>DATA_SRC_ID</code>) es el código de la contraparte en plataformas externas. No confundirlos.</div>
  </main>`));

/* 8 · ELECTRONIC CODES */
slides.push(slide('sand', 'Electronic codes', 'CANALES Y PLATAFORMAS', '02 · Plataformas', '02 · Electronic codes', `
  <main>
    <p class="ante-title">02 · Plataformas</p>
    <h1>Electronic codes (identificadores de plataforma)</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:86ch;">Identificadores de la contraparte en plataformas externas de post-trade. Se guardan en <code>STAND_CONF_ASSIGNMENT</code> con <code>PURP_TYP='ELEC_COD'</code>.</p>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th>Código</th><th>Plataforma</th><th>Uso</th></tr></thead>
      <tbody>
        <tr><td><span class="sbadge sbadge--b">DTCCID</span></td><td>DTCC ALERT / CTM</td><td>Matching renta variable y bonos (Deal Manager)</td></tr>
        <tr><td><span class="sbadge sbadge--y">FXALLBIC</span></td><td>FXAll</td><td>Plataforma de ejecución FX</td></tr>
        <tr><td><span class="sbadge sbadge--g">ICELINKID</span></td><td>IceLink</td><td>Confirmación derivados ICE</td></tr>
        <tr><td><span class="sbadge sbadge--o">MISYSBIC</span></td><td>Misys/Finastra</td><td>Plataforma Misys</td></tr>
        <tr><td><span class="sbadge sbadge--y">BBGBIC</span></td><td>Bloomberg</td><td>Confirmación vía Bloomberg</td></tr>
        <tr><td><span class="sbadge sbadge--y">MARKITBIC</span></td><td>Markit Wire</td><td>Confirmación derivados OTC</td></tr>
        <tr><td><span class="sbadge sbadge--b">REGISTRID</span></td><td>Regis TR</td><td>Trade repository europeo</td></tr>
        <tr><td><span class="sbadge sbadge--g">SWIFT_CNT</span></td><td>SWIFT (contraparte)</td><td>BIC SWIFT a nivel de contacto</td></tr>
      </tbody>
    </table>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Importante:</strong> DTCC no es el canal de derivados OTC. El <code>DTCCID</code> es el identificador en DTCC ALERT/CTM, para matching de <strong>renta variable y bonos</strong>. Los derivados OTC se confirman por SWIFT MT3xx o email.</div>
  </main>`));

/* 9 · CAMPOS PRINCIPALES */
slides.push(slide('sand', 'Campos principales de la SCIS', 'MODELO DE DATOS', '03 · Datos', '03 · Modelo de datos', `
  <main>
    <p class="ante-title">03 · Modelo de datos</p>
    <h1>Campos principales de la SCIS</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);">Tabla maestra <code>FT_T_SCIS</code> con PK <code>SCIS_OID</code>: cabecera de la instrucción de confirmación.</p>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th>Campo</th><th>Tabla / Path</th><th>Oblig.</th><th>Descripción</th></tr></thead>
      <tbody>
        <tr><td><strong>SCIS_OID</strong></td><td>FT_T_SCIS</td><td><span class="sbadge sbadge--g">Auto</span></td><td>Identificador único (OID), generado al guardar</td></tr>
        <tr><td><strong>Counterparty</strong></td><td>FT_T_CUST.CST_ID</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Contraparte propietaria de la instrucción</td></tr>
        <tr><td><strong>Instruction Type</strong></td><td>CONFIRM_INSTRUC_DESC</td><td><span class="sbadge sbadge--y">Sí</span></td><td>CONFIRMATION o NOTIFICATION</td></tr>
        <tr><td><strong>Sender / Receiver</strong></td><td>CONFIRM_SENDER/RECEIVER_IND</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Y/N — la contraparte emite o recibe</td></tr>
        <tr><td><strong>Status</strong></td><td>DATA_STAT_TYP</td><td><span class="sbadge sbadge--y">Sí</span></td><td>ACTIVE, INACTIVE, DELETED</td></tr>
        <tr><td><strong>STP</strong></td><td>COA (STPCONF)</td><td>No</td><td>Asignación automática (Y/N)</td></tr>
        <tr><td><strong>Date From / Date To</strong></td><td>COA (DATEFROM/DATETO)</td><td>No</td><td>Vigencia temporal (default: sin caducidad)</td></tr>
        <tr><td><strong>Products / Branches</strong></td><td>STAND_CONF_ASSIGNMENT</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Productos (o ALL) y branch BBVA (exactamente 1)</td></tr>
        <tr><td><strong>Media</strong></td><td>FT_T_SCMO</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Canal de confirmación (EMAIL, SWIFT, FAX…)</td></tr>
        <tr><td><strong>Contact / External IDs</strong></td><td>FT_T_CNTC · CONFIRMATION_IDENTIF</td><td>No</td><td>Contacto destinatario e IDs externos (Mentor, Sentry, Calypso)</td></tr>
      </tbody>
    </table>
  </main>`));

/* 10 · MODELO RELACIONAL */
slides.push(slide('sand', 'Modelo relacional y satélites', 'MODELO DE DATOS', '03 · Relaciones', '03 · Relaciones', `
  <main>
    <p class="ante-title">03 · Relaciones</p>
    <h1>Modelo relacional y tablas satélite</h1>
    <div class="scode" style="margin-top:var(--bbva-space-2);">FT_T_CUST (Counterparty)
   │ CST_ID
   ▼
FT_T_SCIS ──ACCT_OID───► FT_T_ACCT (Cuenta)
   │       ──FINR_OID───► FT_T_FINS (Institución Financiera)
   │       ──INSTR_ID───► FT_T_INSTR (Instrumento)
   │       ──PRNT_SCIS_OID─► FT_T_SCIS (padre)
   ├──SCIS_OID──► FT_T_SCMO (Media Options)          ~58K
   ├──SCIS_OID──► STAND_CONF_ASSIGNMENT (Asignaciones) ~291K
   ├──SCIS_OID──► CONFIRMATION_IDENTIF (Identificadores) ~109K
   ├──SCIS_OID──► CONFIRMATION_ATTRIBUTES (Atributos EAV)
   └──SCIS_OID──► FT_T_SCIP (Payment Instructions)</div>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard"><h3>Tabla polimórfica: STAND_CONF_ASSIGNMENT</h3><p>Discriminada por <code>PURP_TYP</code> (~5,25 asignaciones de media por SCIS):</p><ul class="slist"><li>• <strong>PRODUCT</strong> · producto cubierto</li><li>• <strong>BRANCH</strong> · branch BBVA · <strong>OFFICE</strong> · oficina</li><li>• <strong>ELEC_COD</strong> · código electrónico · <strong>ELEC_COD_CNT</strong> · SWIFT contraparte</li></ul></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Tablas EAV (atributos)</h3><p><strong>CONFIRMATION_ATTRIBUTES:</strong> <code>STPCONF</code>, <code>DATEFROM</code>, <code>DATETO</code> (default 9999-12-31).</p><p style="margin-top:6px;"><strong>CONFIRMATION_IDENTIF:</strong> <code>CONFIRMID</code> (ID interno RDR), <code>REL_NEW</code> (vínculo SCISDENE antigua→nueva).</p></div>
    </div>
  </main>`));

/* 11 · PROCESOS UI */
slides.push(slide('sand', 'Procesos de interfaz', 'GESTIÓN', '04 · Gestión', '04 · Gestión (UI)', `
  <main>
    <p class="ante-title">04 · Gestión</p>
    <h1 style="margin-bottom:var(--bbva-space-2);">Procesos de interfaz de usuario</h1>
    <div class="sg3">
      <div class="scard"><h3>Búsqueda</h3><p>Por contraparte, producto, branch, media, electronic code, sender/receiver, tipo o fechas. Estado ACTIVE por defecto.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-electric-blue);"><h3>Alta (SCIS)</h3><p>Tipo, sender/receiver, contraparte, productos, branch, canal y contacto. OID generado al guardar.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>Modificación</h3><p>UPDATE in-place sobre la misma fila, para cambios menores (prioridad, STP). Mismo <code>SCIS_OID</code>.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>SCISDENE</h3><p>Transacción atómica: inactiva la SCIS actual y crea una nueva vinculada (<code>REL_NEW</code>). Para cambios estructurales.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Copia (SCIS1)</h3><p>Clona una SCIS con nuevo OID, heredando datos. Útil para variantes por producto.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>Historial</h3><p>Historial de cambios (<code>FT_T_CHAL</code>). Trazabilidad completa maker-checker.</p></div>
    </div>
  </main>`));

/* 12 · CICLO DE VIDA SCISDENE */
slides.push(slide('sand', 'Ciclo de vida y SCISDENE', 'GESTIÓN', '04 · Ciclo de vida', '04 · Ciclo de vida', `
  <main>
    <p class="ante-title">04 · Ciclo de vida</p>
    <h1>Ciclo de vida y patrón SCISDENE</h1>
    <div class="scode" style="margin-top:var(--bbva-space-2);"> (ninguno) ──Alta──► ACTIVE ◄──UPDATE──► ACTIVE  (in-place)
                              │
                    Inactivar ▼
                           INACTIVE  (terminal — no reactivable)

 ACTIVE ──SCISDENE──► INACTIVE (antigua) + ACTIVE (nueva)
                       └── vinculadas vía REL_NEW</div>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard"><h3>¿Por qué existe SCISDENE?</h3><p>Ante cambios estructurales (contacto, medio, electronic code), la práctica BBVA es <strong>no actualizar</strong> la existente, sino crear una nueva y marcar la antigua INACTIVE. Preserva la <strong>trazabilidad histórica</strong>.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Cadena de renovaciones</h3><div class="scode" style="font-size:10px;padding:var(--bbva-space-2);margin-top:4px;">SCIS-001 (INACTIVE) ──REL_NEW──►
SCIS-002 (INACTIVE) ──REL_NEW──►
SCIS-003 (ACTIVE)</div><p style="margin-top:6px;">Permite saber qué SCIS estaba vigente cuando se confirmó un trade años atrás.</p></div>
    </div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Transición prohibida:</strong> INACTIVE → ACTIVE. No hay reactivación: si se necesita una SCIS activa similar a una inactiva, se crea una nueva.</div>
  </main>`));

/* 13 · VALIDACIONES */
slides.push(slide('sand', 'Validaciones de negocio', 'REGLAS', '05 · Reglas', '05 · Validaciones', `
  <main>
    <p class="ante-title">05 · Reglas</p>
    <h1>Validaciones de negocio</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);"><strong>15 reglas</strong> se aplican al guardar (alta y modificación). Una selección:</p>
    <div class="sg2" style="margin-top:var(--bbva-space-2);align-items:start;">
      <table class="stable" style="font-size:11px;">
        <thead><tr><th>Regla</th><th>Validación</th></tr></thead>
        <tbody>
          <tr><td><strong>SENDER_RECEIVER</strong></td><td>Sender o Receiver = Y (al menos uno)</td></tr>
          <tr><td><strong>SENDER_AND_RECEIVER</strong></td><td>Nunca ambos = Y a la vez</td></tr>
          <tr><td><strong>TRADETYP</strong></td><td>Si CONFIRMATION → TRADE_TYP vacío</td></tr>
          <tr><td><strong>PRODUCT_ALL</strong></td><td>ALL excluye otros productos</td></tr>
          <tr><td><strong>UNIQUE_BRANCH</strong></td><td>Exactamente 1 branch activa</td></tr>
          <tr><td><strong>MEDIATYP</strong></td><td>Al menos 1 canal de media activo</td></tr>
          <tr><td><strong>ELEC_CDE</strong></td><td>Electronic codes únicos</td></tr>
          <tr><td><strong>DATE_FROM_TO</strong></td><td>Date To ≥ Date From siempre</td></tr>
        </tbody>
      </table>
      <div>
        <div class="scard scard--l"><h3>Reglas de oro</h3><ul class="slist"><li>• <strong>Sender XOR Receiver</strong> (nunca ambos)</li><li>• <strong>ALL</strong> excluye otros productos</li><li>• Exactamente <strong>1 branch activa</strong></li><li>• Al menos <strong>1 canal media activo</strong></li><li>• Contactos (FAX/EMAIL) y SWIFT deben estar activos</li><li>• No se puede reactivar → crear nueva</li></ul></div>
      </div>
    </div>
  </main>`));

/* 14 · DIFUSIÓN */
slides.push(slide('sand', 'Difusión a downstream', 'DIFUSIÓN', '06 · Difusión', '06 · Difusión', `
  <main>
    <p class="ante-title">06 · Difusión</p>
    <h1>Difusión a sistemas downstream</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">Cuando una SCIS cambia, se notifica a los sistemas que la consumen para que actualicen sus datos.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-2);align-items:start;">
      <div class="scard"><h3>Eventos de difusión</h3><table class="stable" style="font-size:11px;margin-top:6px;"><thead><tr><th>Evento</th><th>Trigger</th></tr></thead><tbody><tr><td>SCIS_CREATED</td><td>Alta nueva SCIS</td></tr><tr><td>SCIS_MODIFIED</td><td>Cambio en campos clave</td></tr><tr><td>SCIS_SUSPENDED</td><td>Inhibit = Y</td></tr><tr><td>SCIS_ACTIVATED</td><td>Estado → ACTIVE</td></tr><tr><td>SCIS_CANCELLED</td><td>Baja / Date To alcanzado</td></tr></tbody></table></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Consumidores principales</h3><table class="stable" style="font-size:11px;margin-top:6px;"><thead><tr><th>Sistema</th><th>Uso</th></tr></thead><tbody><tr><td><strong>Calypso</strong></td><td>Matching de confirmaciones</td></tr><tr><td><strong>SWIFT</strong></td><td>Envío automático MT300/MT320</td></tr><tr><td><strong>Mentor / Sentry</strong></td><td>Sistemas de confirmación</td></tr><tr><td><strong>DTCC CTM</strong></td><td>Matching renta variable y bonos</td></tr></tbody></table></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Mecanismo:</strong> publicación asíncrona vía cola MQ (<code>SCIS_CHANGE_EVENT</code>). Calypso responde con ACK. SLA &lt;5 min (Calypso), &lt;30 min (SWIFT). Hasta 3 reintentos antes de alerta <code>SCIS_DIFF_FAILED</code>.</div>
  </main>`));

/* 15 · VOLUMETRÍA */
slides.push(slide('sand', 'Volumetría y contexto', 'VOLUMETRÍA', '06 · Volumetría', '06 · Volumetría', `
  <main>
    <p class="ante-title">06 · Volumetría</p>
    <h1>Volumetría y contexto en RDR</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);">SCIS es una de las <strong>5 entidades principales</strong> de RDR. Datos a abril 2026.</p>
    <div class="sg3" style="margin-top:var(--bbva-space-2);">
      <div class="scard" style="text-align:center;"><div class="statn">55.471</div><div class="statl">SCIS totales</div></div>
      <div class="scard" style="text-align:center;border-top-color:var(--bbva-lime);"><div class="statn">44.880</div><div class="statl">Activas (81%)</div></div>
      <div class="scard" style="text-align:center;border-top-color:var(--bbva-gray-5);"><div class="statn">10.590</div><div class="statl">Inactivas (19%)</div></div>
      <div class="scard" style="text-align:center;border-top-color:var(--bbva-serene-blue);"><div class="statn">58.310</div><div class="statl">Media options</div></div>
      <div class="scard" style="text-align:center;border-top-color:var(--bbva-canary);"><div class="statn">291.304</div><div class="statl">Asignaciones (SCA)</div></div>
      <div class="scard" style="text-align:center;border-top-color:var(--bbva-purple);"><div class="statn">108.973</div><div class="statl">Identificadores</div></div>
    </div>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th>Entidad RDR</th><th>Tabla</th><th>Registros</th><th>Función</th></tr></thead>
      <tbody>
        <tr><td>FINS</td><td>FT_T_FINS</td><td>~692K</td><td>Contrapartidas (entidad central)</td></tr>
        <tr><td>ISSU</td><td>FT_T_ISSU</td><td>~12M</td><td>Emisiones</td></tr>
        <tr><td>LAGR</td><td>FT_T_LAGR</td><td>~96K</td><td>Acuerdos legales</td></tr>
        <tr><td>SSIS</td><td>FT_T_SSIS</td><td>~857K</td><td>Instrucciones de liquidación</td></tr>
        <tr style="background:color-mix(in srgb,var(--bbva-serene-blue) 18%,white);"><td><strong>SCIS</strong></td><td><strong>FT_T_SCIS</strong></td><td><strong>~55K</strong></td><td><strong>Instrucciones de confirmación / notificación</strong></td></tr>
      </tbody>
    </table>
  </main>`));

/* 16 · DIVIDER ANEXO (electric) */
slides.push(slide('electric', 'Anexo migración', 'ANEXO · MIGRACIÓN', '07 · Anexo', '07 · Migración y simulacros', `
  <main style="display:grid;place-content:center;text-align:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">Anexo</p>
    <h1 class="bbva-hero" style="font-size:clamp(34px,4vw,64px);line-height:1.05;">Instrucciones de Confirmación<br>en una Migración / Simulacro</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:70ch;margin-inline:auto;">Objetivos, análisis, alta de SCIs y el flujo de trabajo antes, durante y después de los simulacros.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
      <span class="pill">Objetivos</span><span class="pill">Análisis</span><span class="pill">Alta SCIs</span><span class="pill">Pre-simulacro</span><span class="pill">Durante</span><span class="pill">Post-simulacro</span>
    </div>
  </main>`));

/* 17 · OBJETIVOS */
slides.push(slide('sand', 'Objetivos de la migración', 'ANEXO · MIGRACIÓN', '07 · Objetivos', '07 · Objetivos', `
  <main>
    <p class="ante-title">Anexo · Objetivos</p>
    <h1>Objetivos de la migración</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">Cuando las operaciones migran al nuevo BO, deben seguir su curso: liquidar, <strong>confirmar</strong>, notificar, reportar.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>¿Cuándo es necesaria una SCI?</h3><p>Por cada <strong>contrapartida + producto</strong> debe existir una instrucción de confirmación.</p><ul class="slist"><li>• Relevante cuando la contrapartida dueña <strong>no es sender</strong></li><li>• Si es sender, no es indispensable</li><li>• Se da de alta con un contacto por defecto para facilitar el flujo</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>Criticidad en la migración</h3><p>No paraliza el GoLive ni es KO si falta alguna SCI, pero:</p><ul class="slist"><li>• Es <strong>muy importante</strong> dar de alta y publicar antes del GoLive</li><li>• Para que el flujo productivo continúe</li><li>• Tras la migración, la SCI debe estar disponible en BO</li></ul></div>
    </div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Notificaciones:</strong> se dan de alta solo si la contrapartida las tiene en el BO origen. Una contrapartida puede no tener notificación, o tener uno, dos o los tres tipos (fixing, pago, vencimiento).</div>
  </main>`));

/* 18 · ANÁLISIS */
slides.push(slide('sand', 'Análisis de SCIs', 'ANEXO · MIGRACIÓN', '07 · Análisis', '07 · Análisis', `
  <main>
    <p class="ante-title">Anexo · Análisis</p>
    <h1>Análisis de SCIs para la migración</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">RDR, como maestro de datos estáticos, identifica el estado de las SCIs para la operativa viva que migra.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard"><h3>Papel de RDR</h3><ul class="slist"><li>• <strong>Maestro</strong> que suministra al BO las instrucciones de confirmación/notificación</li><li>• <strong>Facilitador</strong> de datos fijos para confirmar y notificar</li><li>• Identifica qué operaciones tienen SCI válida y cuáles no</li></ul></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Análisis requerido</h3><ul class="slist"><li>✓ Operaciones que <strong>ya tienen</strong> confirmación en RDR y BO</li><li>• Operaciones que <strong>no tienen</strong> SCI válida</li><li>• Para las que no tienen → <strong>revisar cuál dar de alta</strong></li></ul></div>
    </div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Nota:</strong> en los simulacros de IT no se valida confirmación/notificación. Si después hay un ciclo <strong>UAT/Realtime</strong>, se itera con usuarios y BO para definir y validar la plantilla. El análisis se actualiza antes y después de cada simulacro.</div>
  </main>`));

/* 19 · PROCESO DE ALTA */
slides.push(slide('sand', 'Proceso de alta de SCIs', 'ANEXO · MIGRACIÓN', '07 · Alta', '07 · Alta de SCIs', `
  <main>
    <p class="ante-title">Anexo · Alta de SCIs</p>
    <h1>Proceso de alta de SCIs</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">Si falta una SCI para una operación, se da de alta mediante la plantilla de carga masiva de RDR (Excel/CSV).</p>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard scard--l"><h3>Plantilla de carga</h3><ul class="slist"><li>• Informarla es responsabilidad del <strong>usuario y/o BO</strong></li><li>• RDR ofrece <strong>soporte</strong> para ayudar</li><li>• RDR prueba la carga y publicación al BO</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-canary);"><h3>Responsabilidades claras</h3><ul class="slist"><li>✗ RDR IT <strong>no</strong> decide la SCI</li><li>✓ Es tema de <strong>negocio</strong></li><li>✓ El <strong>usuario de confirmaciones</strong> facilita la información</li></ul></div>
    </div>
    <div class="sflow" style="margin-top:var(--bbva-space-3);">
      <div class="sbox sbox--o"><small>BO detecta</small><b>Falta SCI</b></div><span class="sarrow">→</span>
      <div class="sbox"><small>BO/Usuario</small><b>Informa plantilla</b></div><span class="sarrow">→</span>
      <div class="sbox" style="border-color:var(--bbva-purple);"><small>RDR</small><b>Carga masiva</b></div><span class="sarrow">→</span>
      <div class="sbox sbox--d"><small>RDR</small><b>Publica al BO</b></div><span class="sarrow">→</span>
      <div class="sbox sbox--d"><small>Calypso</small><b>ACK / NACK</b></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);">Tras publicar, se revisa el <strong>ACK/NACK</strong>. Si todas reciben ACK, se traslada a la plantilla de carga y <strong>se versiona</strong>.</div>
  </main>`));

/* 20 · FLUJO SIMULACROS */
slides.push(slide('sand', 'Flujo de simulacros', 'ANEXO · MIGRACIÓN', '07 · Simulacros', '07 · Simulacros', `
  <main>
    <p class="ante-title">Anexo · Simulacros</p>
    <h1>Flujo: pre / durante / post simulacro</h1>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th style="width:5%">#</th><th style="width:14%">Responsable</th><th>Acción</th></tr></thead>
      <tbody>
        <tr><td><strong>1</strong></td><td><span class="sbadge sbadge--g">BO</span></td><td>Extracción de las SCIs de su sistema para la operativa viva</td></tr>
        <tr><td><strong>2</strong></td><td><span class="sbadge sbadge--g">BO</span></td><td>Detectar para qué contrapartida-producto <strong>necesita SCI</strong></td></tr>
        <tr><td><strong>3</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Revisar si existe alguna SCI que cumpla los requisitos</td></tr>
        <tr><td><strong>4</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Las que existan en RDR → <strong>publicar</strong></td></tr>
        <tr><td><strong>5</strong></td><td><span class="sbadge sbadge--g">BO</span></td><td>Las que no existan → informar la <strong>plantilla</strong></td></tr>
        <tr><td><strong>6</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Ejecutar <strong>carga y publicación</strong> de las SCIs necesarias</td></tr>
        <tr><td><strong>7</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Revisar <strong>ACK/NACK</strong>. Si todo ACK → versionar plantilla</td></tr>
      </tbody>
    </table>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard scard--l"><h3>Durante el simulacro</h3><ul class="slist"><li>✓ eepp levantado y handler funcionando</li><li>• Si surge operación nueva → dar de alta SCI</li><li>• <strong>Apuntar</strong> todas las altas y publicaciones</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-mandarin);"><h3>Post-simulacro (lunes)</h3><ul class="slist"><li>• Revisar si ha salido operativa viva nueva</li><li>• Enviar correo con resumen de acciones</li><li>• Repetir el análisis si es necesario</li></ul></div>
    </div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>"De nada sirve solucionar un error si no queda inventariado".</strong> Cada SCI dada de alta o publicada se registra en el momento. Los tiempos van muy medidos.</div>
  </main>`));

/* 21 · RESUMEN (midnight) */
slides.push(slide('midnight', 'Resumen', 'RESUMEN', '08 · Resumen', '08 · Resumen', `
  <main>
    <p class="ante-title" style="color:var(--bbva-canary);">Claves</p>
    <h1>Confirmación y Notificación en 5 ideas</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="bridge"><p class="bridge__t">1 · RDR es el maestro</p><p class="bridge__d">Suministra al BO las SCIs para que las operaciones se confirmen correctamente.</p></div>
      <div class="bridge"><p class="bridge__t">2 · 6 preguntas</p><p class="bridge__d">Quién, qué, cuáles branches, cómo, cuándo y a quién se envía la confirmación o notificación.</p></div>
      <div class="bridge"><p class="bridge__t">3 · EMAIL + FAX = 85%</p><p class="bridge__d">SWIFT (8%) se concentra en OTC, repos y renta fija. No confundir canal con electronic code.</p></div>
      <div class="bridge"><p class="bridge__t">4 · SCISDENE</p><p class="bridge__d">Inactivar + Nuevo preserva la trazabilidad. No hay reactivación: siempre una nueva SCIS.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);background:rgba(133,200,255,.16);border-left-color:var(--bbva-serene-blue);color:var(--bbva-sand);"><strong>5 · Decisión de negocio:</strong> qué SCI dar de alta lo decide negocio/BO. RDR da soporte técnico: carga, publicación y ACK/NACK. <em>Ahora, el quiz.</em></div>
  </main>`));

/* 22 · QUIZ (final) */
slides.push(`
<section class="slide bbva-combo--sand" aria-label="Quiz de evaluación" style="min-height:100vh;">
  <header class="slide__header">
    <nav class="breadcrumb"><span>INSTRUCCIONES DE CONFIRMACIÓN</span><span class="breadcrumb__sub">QUIZ</span></nav>
    <span class="lg lg-bbva lg--blue" role="img" aria-label="BBVA"></span>
  </header>
  <main style="max-width:760px;margin:0 auto;width:100%;">
    <p class="ante-title">08 · Evaluación</p>
    <h2 style="font-family:var(--bbva-font-display);">Quiz · 20 preguntas</h2>
    <div id="qz-quiz" style="margin-top:var(--bbva-space-4);">
      <div style="height:4px;border-radius:2px;background:var(--bbva-gray-2);margin-bottom:var(--bbva-space-2);overflow:hidden;">
        <div id="qz-bar" style="height:100%;width:0;background:var(--bbva-electric-blue);border-radius:2px;transition:width 300ms;"></div>
      </div>
      <p id="qz-counter" style="font-size:12px;color:var(--bbva-gray-5);margin-bottom:var(--bbva-space-1);"></p>
      <h3 id="qz-question" style="margin-bottom:var(--bbva-space-2);font-size:var(--bbva-fs-body);"></h3>
      <div id="qz-options"></div>
      <div id="qz-fb" class="qz-fb" style="display:none;"></div>
      <div style="text-align:right;margin-top:var(--bbva-space-2);">
        <button id="qz-next" disabled style="cursor:pointer;font-size:var(--bbva-fs-caption);padding:var(--bbva-space-2) var(--bbva-space-3);background:var(--bbva-electric-blue);color:var(--bbva-sand);border:0;border-radius:var(--bbva-radius-full);font-family:var(--bbva-font-body);font-weight:700;">Siguiente</button>
      </div>
    </div>
  </main>
  <footer class="slide__footer">
    <span>08 · Quiz</span>
    <div class="nfq-credit"><span class="nfq-credit__label">Hecho por</span><span class="lg lg-nfq-iso" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`);

// ── CSS extra ──────────────────────────────────────────────────────────────
const EXTRA_CSS = `
<style>
  .lg{display:inline-block;background-repeat:no-repeat;background-position:center;background-size:contain;flex:none;}
  .lg-bbva{height:30px;aspect-ratio:3.273;}
  .lg-bbva--xl{height:60px;aspect-ratio:3.273;}
  .lg--white{background-image:url("${BBVA_W}");}
  .lg--blue{background-color:var(--bbva-electric-blue);-webkit-mask:url("${BBVA_W}") center/contain no-repeat;mask:url("${BBVA_W}") center/contain no-repeat;}
  .lg-nfq-iso{height:26px;aspect-ratio:0.818;background-image:url("${NFQ_ISO}");}
  .lg-nfq-word{height:32px;aspect-ratio:2.074;background-image:url("${NFQ_WORD}");}
  .section-index__title{font-size:var(--bbva-fs-body)!important;line-height:1.2;overflow:visible;}
  .section-index__item{min-height:170px;overflow:visible;}
  .sub2{font-size:var(--bbva-fs-body);line-height:1.6;color:var(--bbva-gray-5);}
  .pill{display:inline-block;background:rgba(133,200,255,.15);border:1px solid rgba(133,200,255,.4);border-radius:20px;padding:6px 14px;font-size:12px;color:var(--bbva-serene-blue);}
  .sg2{display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-3);}
  .sg3{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-2);}
  .scard{background:var(--bbva-white);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);border-top:3px solid var(--bbva-serene-blue);box-shadow:0 2px 12px rgba(0,0,0,.06);}
  .scard h3{font-size:var(--bbva-fs-body);font-weight:700;color:var(--bbva-electric-blue);margin-bottom:6px;}
  .scard p{font-size:var(--bbva-fs-caption);line-height:1.55;color:var(--bbva-gray-5);}
  .scard--l{border-top:none;border-left:4px solid var(--bbva-electric-blue);}
  .scard code{font-family:monospace;font-size:.85em;background:color-mix(in srgb,var(--bbva-electric-blue) 9%,white);color:var(--bbva-electric-blue);padding:1px 5px;border-radius:5px;}
  .statn{font-family:var(--bbva-font-display);font-weight:800;font-size:var(--bbva-fs-h2);color:var(--bbva-electric-blue);line-height:1;}
  .statl{font-size:var(--bbva-fs-caption);color:var(--bbva-gray-5);margin-top:4px;}
  .slist{list-style:none;font-size:var(--bbva-fs-caption);line-height:1.85;color:var(--bbva-gray-5);margin-top:6px;}
  .stable{width:100%;border-collapse:collapse;font-size:var(--bbva-fs-caption);}
  .stable th{background:var(--bbva-electric-blue);color:var(--bbva-sand);padding:8px 12px;text-align:left;font-weight:700;}
  .stable td{padding:7px 12px;border-bottom:1px solid var(--bbva-gray-2);color:var(--bbva-gray-5);vertical-align:top;}
  .stable tr:nth-child(even) td{background:var(--bbva-sand);}
  .stable td strong{color:var(--bbva-electric-blue);}
  .scard .stable th{padding:6px 10px;}.scard .stable td{padding:5px 10px;}
  .sbadge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;}
  .sbadge--b{background:color-mix(in srgb,var(--bbva-serene-blue) 34%,white);color:var(--bbva-electric-blue);}
  .sbadge--g{background:color-mix(in srgb,var(--bbva-lime) 34%,white);color:#1B8C13;}
  .sbadge--y{background:color-mix(in srgb,var(--bbva-canary) 40%,white);color:#8B6914;}
  .sbadge--o{background:color-mix(in srgb,var(--bbva-mandarin) 34%,white);color:#C05621;}
  .snote{background:color-mix(in srgb,var(--bbva-serene-blue) 14%,white);border-left:4px solid var(--bbva-serene-blue);border-radius:0 var(--bbva-radius-sm) var(--bbva-radius-sm) 0;padding:var(--bbva-space-2) var(--bbva-space-3);font-size:var(--bbva-fs-caption);line-height:1.55;color:var(--bbva-electric-blue);}
  .snote--warn{background:color-mix(in srgb,var(--bbva-mandarin) 15%,white);border-left-color:var(--bbva-mandarin);}
  .snote code{font-family:monospace;}
  .scode{background:var(--bbva-sand);border:1px solid var(--bbva-gray-2);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);font-family:monospace;font-size:11px;color:var(--bbva-electric-blue);line-height:1.6;overflow-x:auto;white-space:pre;}
  .sflow{display:flex;align-items:center;gap:4px;justify-content:center;flex-wrap:wrap;}
  .sbox{background:var(--bbva-white);border:2px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:9px 13px;text-align:center;min-width:104px;box-shadow:0 2px 10px rgba(0,0,0,.05);}
  .sbox small{display:block;font-size:10px;color:var(--bbva-gray-5);margin-bottom:3px;}
  .sbox b{font-size:var(--bbva-fs-caption);color:var(--bbva-electric-blue);}
  .sbox--o{border-color:var(--bbva-canary);}
  .sbox--d{border-color:var(--bbva-lime);}
  .sarrow{font-size:18px;color:var(--bbva-electric-blue);font-weight:700;}
  .bridge{background:rgba(255,255,255,.10);border-left:4px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);}
  .bridge__t{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-h3);color:var(--bbva-sand);}
  .bridge__d{font-size:var(--bbva-fs-caption);color:var(--bbva-serene-blue);margin-top:6px;}
  .bridge__d strong{color:var(--bbva-sand);}
</style>`;

// ── Quiz · 20 preguntas ────────────────────────────────────────────────────
const QUES = [
  {q:"¿Qué es una SCIS (Standard Confirmation Instruction)?",opts:["Una instrucción de liquidación de efectivo","Un acuerdo operativo que codifica las instrucciones de confirmación/notificación de operaciones","Un mensaje SWIFT MT103","Un informe regulatorio EMIR"],c:1,exp:"Una SCIS es un acuerdo operativo entre BBVA y una contraparte que codifica cómo se confirman/notifican las operaciones."},
  {q:"¿Qué determina una SCIS frente a una SSI?",opts:["Por dónde paga el dinero (bancos, cuentas, rutas)","La prioridad de liquidación","Cómo se confirma que se hizo la operación: a quién, por qué medio y para qué productos","El tipo de cambio aplicable"],c:2,exp:"La SSI define por dónde paga el dinero; la SCIS define cómo se confirma la operación (a quién, por qué medio y para qué productos)."},
  {q:"¿Cuántas preguntas clave responde una SCIS?",opts:["3","6","10","15"],c:1,exp:"Responde a 6: quién, qué, cuáles branches, cómo, cuándo y a quién."},
  {q:"¿Cuál es la diferencia entre CONFIRMATION y NOTIFICATION?",opts:["CONFIRMATION es informativa; NOTIFICATION requiere matching","CONFIRMATION requiere matching/respuesta; NOTIFICATION es informativa y no requiere respuesta","Son sinónimos","NOTIFICATION solo aplica a FX"],c:1,exp:"CONFIRMATION confirma la operación y requiere matching/respuesta; NOTIFICATION es informativa y no requiere respuesta."},
  {q:"¿Qué campo discrimina entre confirmación y notificación?",opts:["DATA_STAT_TYP","CONFIRM_INSTRUC_DESC","SCIS_OID","TRADE_TYP"],c:1,exp:"CONFIRM_INSTRUC_DESC indica si la instrucción es CONFIRMATION o NOTIFICATION."},
  {q:"¿Cuáles son los 3 eventos por los que se emite una NOTIFICATION?",opts:["Alta, baja y modificación","Fixing, pago/liquidación y vencimiento","CLS, EBA y SWIFT","Sender, Receiver y Branch"],c:1,exp:"Una notificación se emite por evento de fixing, de pago/liquidación o de vencimiento (de 0 a 3 por contrapartida)."},
  {q:"¿Cuál es el canal de confirmación dominante?",opts:["SWIFT","FAX","EMAIL (~71%)","Bloomberg"],c:2,exp:"EMAIL es el canal dominante (~71%); con FAX (~14%) suman el 85% de las instrucciones."},
  {q:"EMAIL + FAX representan aproximadamente…",opts:["50% de los canales","85% de los canales","8% de los canales","100% de los canales"],c:1,exp:"EMAIL (71%) + FAX (14%) = 85%. SWIFT es solo ~8%, concentrado en OTC, repos y renta fija."},
  {q:"¿Qué distingue el canal del identificador electrónico?",opts:["Son lo mismo","El canal (CONFIRM_MEDIA_TYP) es el transporte real; el electronic code (DATA_SRC_ID) es el id de la contraparte en plataformas","El canal es interno y el electronic code regulatorio","El electronic code sustituye al canal"],c:1,exp:"El canal es el medio de transporte (CONFIRM_MEDIA_TYP); el electronic code (DATA_SRC_ID) identifica a la contraparte en plataformas externas. No se confunden."},
  {q:"¿Para qué se usa el DTCCID?",opts:["Confirmar derivados OTC","Matching de renta variable y bonos en DTCC ALERT/CTM","Pagos en EUR","Enrutamiento SWIFT"],c:1,exp:"DTCCID identifica al participante en DTCC ALERT/CTM, para matching de renta variable y bonos — no es el canal de derivados OTC."},
  {q:"¿Cuál es la tabla maestra de la SCIS y su PK?",opts:["FT_T_SCMO · SCMO_OID","FT_T_SCIS · SCIS_OID","STAND_CONF_ASSIGNMENT · SCA_OID","FT_T_CUST · CST_ID"],c:1,exp:"FT_T_SCIS es la tabla maestra; su clave primaria es SCIS_OID."},
  {q:"¿Qué regla aplica a Sender / Receiver?",opts:["Ambos deben ser Y","Sender XOR Receiver: al menos uno, nunca ambos a la vez","Solo Receiver puede ser Y","Ninguno es obligatorio"],c:1,exp:"Sender XOR Receiver: debe haber al menos uno en Y, pero nunca ambos a la vez."},
  {q:"¿Cuántas branches activas debe tener una SCIS?",opts:["Ninguna","Exactamente 1","Al menos 2","Tantas como productos"],c:1,exp:"Regla UNIQUE_BRANCH: exactamente 1 branch activa por SCIS."},
  {q:"¿Qué implica asignar el producto ALL?",opts:["Excluye a los demás productos","Se combina con productos específicos","Desactiva la SCIS","Obliga a usar SWIFT"],c:0,exp:"La regla PRODUCT_ALL: ALL excluye otros productos (no se combina con productos específicos)."},
  {q:"¿Qué campos definen la vigencia temporal de una SCIS?",opts:["START_TMS / END_TMS","Date From / Date To (DATEFROM/DATETO)","PRIORITY","SCIS_OID"],c:1,exp:"Date From / Date To (DATEFROM/DATETO) definen la vigencia; por defecto sin caducidad (DATETO 9999-12-31)."},
  {q:"¿Qué hace el patrón SCISDENE?",opts:["Reactiva una SCIS inactiva","Inactiva la SCIS actual y crea una nueva vinculada (REL_NEW), preservando la trazabilidad","Borra la SCIS","Duplica la SCIS sin cambios"],c:1,exp:"SCISDENE inactiva la SCIS actual y crea una nueva vinculada por REL_NEW; preserva la trazabilidad histórica."},
  {q:"¿Qué transición de estado está prohibida?",opts:["ACTIVE → INACTIVE","INACTIVE → ACTIVE (reactivación)","ninguno → ACTIVE","ACTIVE → ACTIVE"],c:1,exp:"No hay reactivación: INACTIVE → ACTIVE está prohibido. Se crea una nueva SCIS."},
  {q:"¿Qué hace el flag STPCONF?",opts:["Marca la SCIS como inactiva","Permite la asignación automática de la SCIS a las confirmaciones (Straight-Through)","Define el canal de envío","Fija la prioridad"],c:1,exp:"STPCONF habilita el Straight-Through Processing: asignación automática de la SCIS sin intervención manual."},
  {q:"En una migración, si falta una SCI…",opts:["Se paraliza el GoLive (KO)","No paraliza el GoLive, pero es muy importante darla de alta y publicar antes del GoLive","Se ignora siempre","La crea Calypso automáticamente"],c:1,exp:"Faltar una SCI no paraliza el GoLive, pero es muy importante darla de alta y publicarla antes del GoLive para que el flujo continúe."},
  {q:"Tras publicar una SCI al BO, ¿qué se revisa?",opts:["El log de SWIFT","La respuesta ACK / NACK de Calypso","El informe EMIR","El estado DELETED"],c:1,exp:"Tras publicar se revisa el ACK/NACK; si todas reciben ACK, se traslada a la plantilla y se versiona."}
];

// Rebalanceo determinista de la posición de la respuesta correcta (5 por letra)
const TARGET = [0,3,1,2,2,0,3,1,1,2,0,3,3,1,2,0,2,0,1,3];
QUES.forEach((q,i)=>{ const t=TARGET[i], c=q.c; if(t!==c){ const tmp=q.opts[t]; q.opts[t]=q.opts[c]; q.opts[c]=tmp; q.c=t; } });

const QUIZ_SCRIPT = `<script>
const QUES = ${JSON.stringify(QUES)};
const PASS_THRESHOLD = 13;
let cur = 0, score = 0, answered = false;
function renderQ() {
  document.getElementById('qz-bar').style.width = ((cur/QUES.length)*100)+'%';
  document.getElementById('qz-counter').textContent = 'Pregunta '+(cur+1)+' de '+QUES.length;
  document.getElementById('qz-question').textContent = QUES[cur].q;
  const opts = document.getElementById('qz-options'); opts.innerHTML='';
  QUES[cur].opts.forEach((o,i)=>{ const b=document.createElement('button'); b.className='qz-opt'; b.textContent=o; b.onclick=()=>pick(i); opts.appendChild(b); });
  document.getElementById('qz-fb').style.display='none';
  document.getElementById('qz-next').disabled=true;
  document.getElementById('qz-next').textContent = cur<QUES.length-1?'Siguiente':'Ver resultado';
  answered=false;
}
function pick(i){ if(answered) return; answered=true; const q=QUES[cur];
  document.querySelectorAll('.qz-opt').forEach((b,idx)=>{ b.disabled=true; if(idx===q.c) b.classList.add('ok'); else if(idx===i&&i!==q.c) b.classList.add('ko'); });
  if(i===q.c) score++;
  const fb=document.getElementById('qz-fb'); fb.style.display='block'; fb.className='qz-fb '+(i===q.c?'qz-fb--ok':'qz-fb--ko'); fb.innerHTML=(i===q.c?'Correcto. ':'Incorrecto. ')+q.exp;
  document.getElementById('qz-next').disabled=false;
}
function nextQ(){ cur++; if(cur>=QUES.length){showRes();return;} renderQ(); }
function showRes(){ const pct=Math.round((score/QUES.length)*100); const passed=score>=PASS_THRESHOLD;
  const statusColor=passed?'#2e7d32':'#c62828'; const statusBg=passed?'#e8f5e9':'#ffebee';
  const statusLabel=passed?'FORMACIÓN SUPERADA':'FORMACIÓN NO SUPERADA';
  const statusMsg=passed?'Enhorabuena - dominas las instrucciones de confirmación y notificación de RDR.':'Necesitas repasar. Vuelve sobre los tipos, canales, SCISDENE y el flujo de migración, y repite el quiz.';
  const detailMsg='Has acertado <strong>'+score+'</strong> de <strong>'+QUES.length+'</strong> preguntas. El mínimo para superar la formación es <strong>'+PASS_THRESHOLD+'</strong>.';
  document.getElementById('qz-quiz').innerHTML='<div style="text-align:center;padding:var(--bbva-space-6) 0;">'+
    '<div style="font-family:var(--bbva-font-display);font-size:var(--bbva-fs-hero);font-weight:700;color:var(--bbva-electric-blue);">'+score+' / '+QUES.length+'</div>'+
    '<div style="font-size:var(--bbva-fs-lead);margin:var(--bbva-space-2) 0;color:var(--bbva-gray-5);">'+pct+'% de acierto</div>'+
    '<div style="margin:var(--bbva-space-4) auto;max-width:580px;padding:var(--bbva-space-3) var(--bbva-space-4);border-radius:var(--bbva-radius-md);background:'+statusBg+';border:2px solid '+statusColor+';">'+
    '<div style="font-family:var(--bbva-font-display);font-size:var(--bbva-fs-h3);font-weight:700;color:'+statusColor+';margin-bottom:var(--bbva-space-1);">'+statusLabel+'</div>'+
    '<div style="font-size:var(--bbva-fs-body);color:var(--bbva-gray-5);margin-bottom:var(--bbva-space-2);">'+detailMsg+'</div>'+
    '<div style="font-size:var(--bbva-fs-body);color:var(--bbva-gray-5);">'+statusMsg+'</div>'+
    '</div>'+
    '<button onclick="location.reload()" style="cursor:pointer;margin-top:var(--bbva-space-3);background:var(--bbva-electric-blue);color:var(--bbva-sand);border:0;border-radius:var(--bbva-radius-full);font-family:var(--bbva-font-body);font-weight:700;padding:var(--bbva-space-2) var(--bbva-space-4);">Repetir quiz</button>'+
    '</div>';
  if (score >= PASS_THRESHOLD && window.CertSystem) { window.CertSystem.showCertBlock({ score: score, total: QUES.length }); }
}
document.addEventListener('DOMContentLoaded',()=>{ document.getElementById('qz-next').onclick=nextQ; renderQ(); });
</script>`;

const COURSE_CFG = `<script>
window.COURSE_ID = "form-functional-2-instrucciones-confirmacion";
window.COURSE_NAME = "Instrucciones de Confirmación";
window.COURSE_TAG = "Funcional";
window.COURSE_LEVEL = "Nivel 2";
</script>`;

const HASH_NAV = `<script>
  function _goHash(){ const n=parseInt(location.hash.replace('#',''),10); if(!isNaN(n)&&typeof goTo==='function') goTo(Math.max(0,n)); }
  window.addEventListener('hashchange', _goHash);
  window.addEventListener('load', ()=> setTimeout(_goHash, 250));
</script>`;

const BODY_PREAMBLE = `
<body>
<a href="../rdr-formacion.html" class="back-to-hub" title="Volver al hub de formaciones">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
  Formaciones
</a>
<nav class="nav-dots nav-dots--dark" id="navDots" aria-label="Navegación de slides"></nav>
<div class="nav-arrows" id="navArrows">
  <button id="prevBtn" aria-label="Diapositiva anterior"><svg viewBox="0 0 24 24"><polyline points="15 5 8 12 15 19"></polyline></svg></button>
  <button id="nextBtn" aria-label="Diapositiva siguiente"><svg viewBox="0 0 24 24"><polyline points="9 5 16 12 9 19"></polyline></svg></button>
</div>
<div class="deck" id="deck">
`;

const html = HEAD + '\n' + EXTRA_CSS + '\n' + BODY_PREAMBLE + slides.join('\n') + '\n</div>\n'
  + NAV_SCRIPT + '\n' + QUIZ_SCRIPT + '\n' + COURSE_CFG + '\n' + CERT_SCRIPT + '\n' + LOGO_INJ + '\n' + HASH_NAV + '\n</body>\n</html>';

fs.writeFileSync(OUT, html, 'utf8');
const dist = {A:0,B:0,C:0,D:0}; QUES.forEach(q=>dist['ABCD'[q.c]]++);
console.log('OK ->', OUT);
console.log('slides:', slides.length, 'questions:', QUES.length, 'bytes:', html.length, 'dist:', JSON.stringify(dist));
