/* Generador del deck CROSS · Modelo de Datos de RDR  (v2 con cambios de instrucciones.md)
   Reutiliza el andamiaje del deck técnico (head/estilos, navegación, quiz, certificado). */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'formacion', 'form-tecnico-1-tecnologias-rdr.html');
const OUT = path.join(ROOT, 'formacion', 'form-cross-2-modelo-datos-rdr.html');
const src = fs.readFileSync(SRC, 'utf8');

// ── Andamiaje extraído del deck técnico ────────────────────────────────────
const headEnd = src.indexOf('</head>');
const HEAD = src.slice(0, headEnd + 7)
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Modelo de Datos de RDR · Formación BBVA × NFQ</title>');
const NAV_A = src.indexOf('<script>', src.indexOf('Envolver cada slide') - 200);
const NAV_SCRIPT = src.slice(NAV_A, src.indexOf('</script>', NAV_A) + 9);
const CERT_A = src.indexOf('CERTIFICADO PDF');
const CERT_SCRIPT_A = src.lastIndexOf('<script>', CERT_A);
const CERT_SCRIPT = src.slice(CERT_SCRIPT_A, src.indexOf('</script>', CERT_SCRIPT_A) + 9);
const LOGO_INJ_A = src.lastIndexOf('<script>', src.indexOf('Inyectar logos al sistema'));
const LOGO_INJ = src.slice(LOGO_INJ_A, src.indexOf('</script>', LOGO_INJ_A) + 9);

// ── Logos transparentes (PNG con alfa) del deck técnico ────────────────────
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
const tbl = (n) => `<code class="t">${n}</code>`;

const slides = [];

/* 1 · PORTADA (electric) */
slides.push(`
<section class="slide bbva-combo--electric" aria-label="Portada">
  <header class="slide__header">
    <span style="font-family:var(--bbva-font-body);font-weight:700;font-size:var(--bbva-fs-label);letter-spacing:.08em;text-transform:uppercase;color:var(--bbva-serene-blue);">Formación Cross · Nivel 02</span>
    <span class="lg lg-bbva--xl lg--white" role="img" aria-label="BBVA"></span>
  </header>
  <div style="align-self:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">MODELO DE DATOS · RDR</p>
    <h1 class="bbva-hero" style="line-height:.95;">Modelo de Datos<br>de RDR</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:60ch;">El modelo relacional de RDR explicado por entidades: las entidades principales, sus tablas, las claves y cómo se conectan entre sí.</p>
    <hr style="border:0;border-top:2px solid var(--bbva-canary);width:90px;margin:var(--bbva-space-3) 0;">
    <p style="font-size:var(--bbva-fs-caption);color:var(--bbva-serene-blue);">GoldenSource Enterprise 8.7 · Oracle 19c · 5 entidades principales · cientos de tablas <code>FT_T_*</code></p>
  </div>
  <footer class="slide__footer">
    <span style="color:var(--bbva-serene-blue);">Repositorio de Datos de Referencia</span>
    <div class="nfq-credit"><span class="nfq-credit__label" style="color:var(--bbva-sand);">Hecho por</span><span class="lg lg-nfq-word" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`);

/* 2 · ÍNDICE (sand) — títulos cortos, sin item de quiz */
slides.push(slide('sand', 'Índice', 'MODELO DE DATOS · RDR', 'ÍNDICE', '01 · Índice', `
  <main>
    <p class="ante-title">Qué vas a aprender</p>
    <h1 style="margin-bottom:var(--bbva-space-3);">Recorrido por el modelo</h1>
    <div class="section-index">
      <div class="section-index__item"><p class="section-index__label">01</p><p class="section-index__title">Qué es el modelo</p></div>
      <div class="section-index__item"><p class="section-index__label">02</p><p class="section-index__title">Nomenclatura y claves</p></div>
      <div class="section-index__item"><p class="section-index__label">03</p><p class="section-index__title">Hub · Link · Satélite</p></div>
      <div class="section-index__item"><p class="section-index__label">04</p><p class="section-index__title">Entidades principales</p></div>
      <div class="section-index__item"><p class="section-index__label">05</p><p class="section-index__title">Entidad a entidad</p></div>
      <div class="section-index__item"><p class="section-index__label">06</p><p class="section-index__title">Cómo se conecta todo</p></div>
      <div class="section-index__item"><p class="section-index__label">07</p><p class="section-index__title">Ejemplo y buenas prácticas</p></div>
    </div>
  </main>`));

/* 3 · QUÉ ES (sand) — recuento de tablas matizado */
slides.push(slide('sand', 'Qué es el modelo de datos', 'MODELO DE DATOS · RDR', '01 · Introducción', '01 · Introducción', `
  <main style="display:grid;grid-template-columns:1.25fr .75fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">01 · Introducción</p>
      <h1>Un único modelo para los datos de referencia</h1>
      <p style="margin-top:var(--bbva-space-3);max-width:58ch;line-height:1.6;">RDR centraliza la información maestra de BBVA CIB: <strong>contrapartidas, acuerdos legales, emisiones e instrucciones de liquidación y confirmación</strong>, con sus datos auxiliares. Todo vive en un modelo relacional sobre Oracle, implementado en <strong>GoldenSource 8.7</strong>.</p>
      <p style="margin-top:var(--bbva-space-2);max-width:58ch;line-height:1.6;">Es un modelo <strong>canónico por entidades</strong>: cada entidad se organiza igual y se conecta con el resto mediante un puñado de claves.</p>
      <aside class="conclusion__box" style="margin-top:var(--bbva-space-4);">Entender las <em>claves</em> que unen las tablas es entender el modelo entero.</aside>
    </div>
    <div style="display:grid;gap:var(--bbva-space-3);">
      <div class="stat-box"><div class="stat-box__value">5</div><div class="stat-box__label">Entidades principales</div></div>
      <div class="stat-box"><div class="stat-box__value">cientos</div><div class="stat-box__label">de tablas <code>FT_T_*</code> (las ~60 conocidas son solo las principales)</div></div>
      <div class="stat-box"><div class="stat-box__value">8.7</div><div class="stat-box__label">GoldenSource · Oracle 19c</div></div>
    </div>
  </main>`));

/* 4 · NOMENCLATURA (sand) */
slides.push(slide('sand', 'Nomenclatura de tablas', 'NOMENCLATURA Y CLAVES', '02 · Convenciones', '02 · Convenciones', `
  <main>
    <p class="ante-title">02 · Convenciones</p>
    <h1>Cómo leer el nombre de una tabla</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:70ch;line-height:1.6;">Las tablas siguen el patrón <code>FT_T_XXXX</code> — <strong>F</strong>inancial <strong>T</strong>able · <strong>T</strong>ransactional. Los cuatro últimos caracteres identifican la entidad y su papel.</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--bbva-space-3);margin-top:var(--bbva-space-4);">
      <div class="info-card info-card--accent"><p style="font-weight:700;">Identificador</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Códigos externos. Sufijos <code>ID</code>: ${tbl('FT_T_FIID')} ${tbl('FT_T_ISID')} ${tbl('FT_T_LAID')}</p></div>
      <div class="info-card info-card--accent"><p style="font-weight:700;">Núcleo / Maestro</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">La entidad en sí: ${tbl('FT_T_FINS')} ${tbl('FT_T_ISSU')} ${tbl('FT_T_LAGR')}</p></div>
      <div class="info-card info-card--accent"><p style="font-weight:700;">Rol / Relación</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Conectan entidades: ${tbl('FT_T_ISSR')} ${tbl('FT_T_FLAR')} ${tbl('FT_T_SSIR')}</p></div>
      <div class="info-card info-card--accent"><p style="font-weight:700;">Atributo / Satélite</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Datos descriptivos: ${tbl('FT_T_FIST')} ${tbl('FT_T_ISMC')} ${tbl('FT_T_SAT1')}</p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-4);font-size:var(--bbva-fs-h3);">Misma entidad = mismo prefijo. Distinto sufijo = distinto papel (id, núcleo, rol, atributo).</aside>
  </main>`));

/* 5 · CAMPOS COMUNES + AUDITORÍA (sand) */
slides.push(slide('sand', 'Campos comunes y auditoría', 'NOMENCLATURA Y CLAVES', '02 · Convenciones', '02 · Convenciones', `
  <main>
    <p class="ante-title">02 · Convenciones</p>
    <h1>Campos que verás en todas las tablas</h1>
    <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:var(--bbva-space-4);margin-top:var(--bbva-space-3);align-items:start;">
      <div style="display:grid;gap:var(--bbva-space-2);">
        <div class="info-card"><p style="font-weight:700;"><code>*_OID</code> — Object ID</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Clave subrogada (PK técnica) de cada fila: <code>SSI_OID</code>, <code>FLAR_OID</code>, <code>CONTCT_OID</code>…</p></div>
        <div class="info-card"><p style="font-weight:700;"><code>DATA_STAT_TYP</code></p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Estado del registro: se filtra <code>= 'ACTIVE'</code> para quedarse con lo vigente.</p></div>
        <div class="info-card"><p style="font-weight:700;">Patrón contexto/valor</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Muchos campos guardan <code>*_CTXT_TYP</code> (qué es) + valor. Ej.: ${tbl('FT_T_FIID')}.</p></div>
      </div>
      <div style="background:var(--bbva-electric-blue);color:var(--bbva-sand);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-4);">
        <p style="font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-h3);color:var(--bbva-canary);">Columnas de auditoría</p>
        <p style="font-size:var(--bbva-fs-caption);margin-top:8px;line-height:1.55;">Están en <strong>todas</strong> las tablas y son clave para entender el versionado:</p>
        <ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:10px;gap:10px;">
          <li><code style="background:rgba(255,255,255,.16);color:var(--bbva-sand);padding:1px 6px;border-radius:6px;">START_TMS</code> · <code style="background:rgba(255,255,255,.16);color:var(--bbva-sand);padding:1px 6px;border-radius:6px;">END_TMS</code> — vigencia temporal de cada versión del registro</li>
          <li><code style="background:rgba(255,255,255,.16);color:var(--bbva-sand);padding:1px 6px;border-radius:6px;">LAST_CHG_TMS</code> — fecha-hora del último cambio</li>
          <li><code style="background:rgba(255,255,255,.16);color:var(--bbva-sand);padding:1px 6px;border-radius:6px;">LAST_CHG_USR_ID</code> — usuario que lo modificó</li>
        </ul>
      </div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);">Cada registro se versiona: <code>START_TMS</code>/<code>END_TMS</code> definen su ventana de validez. Para la foto actual: versión vigente + <code>DATA_STAT_TYP='ACTIVE'</code>.</aside>
  </main>`));

/* 6 · LAS CLAVES (sand) — todas las entidades por igual, sin CCRF */
slides.push(slide('sand', 'Claves de cada entidad', 'NOMENCLATURA Y CLAVES', '02 · Convenciones', '02 · Convenciones', `
  <main>
    <p class="ante-title">02 · Convenciones</p>
    <h1>Cada entidad tiene su clave</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:78ch;line-height:1.6;">El <code>*_OID</code> es la clave principal de cada entidad. <code>INST_MNEM</code> e <code>INSTR_ID</code> aparecen más veces en el modelo, pero <strong>no son más importantes</strong> que el resto.</p>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-4);">
      <div class="keycard"><p class="keycard__e">Legal Entities</p><p class="keycard__k"><code>INST_MNEM</code></p></div>
      <div class="keycard"><p class="keycard__e">Legal Agreements</p><p class="keycard__k"><code>LEG_AGRMNT_ID</code></p></div>
      <div class="keycard"><p class="keycard__e">Issues</p><p class="keycard__k"><code>INSTR_ID</code></p></div>
      <div class="keycard"><p class="keycard__e">Settlement Instr.</p><p class="keycard__k"><code>SSI_OID</code></p></div>
      <div class="keycard"><p class="keycard__e">Confirmation Instr.</p><p class="keycard__k"><code>SCIS_OID</code></p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-4);font-size:var(--bbva-fs-h3);">Que <code>INST_MNEM</code> se repita más no lo hace más relevante: todas las claves pesan lo mismo.</aside>
  </main>`));

/* 7 · HUB·LINK·SATÉLITE (sand) — antes midnight; arregla blanco-sobre-acento */
slides.push(slide('sand', 'Patrón Hub Link Satélite', 'PATRÓN ARQUITECTÓNICO', '03 · Patrón', '03 · Patrón', `
  <main>
    <p class="ante-title">03 · El patrón que se repite</p>
    <h1>Hub · Link · Satélite</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:74ch;line-height:1.6;">Cada entidad se organiza igual. Si entiendes una, entiendes todas.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-3);margin-top:var(--bbva-space-4);">
      <div class="pat" style="background:var(--bbva-serene-blue);">
        <p class="pat__t">1 · Hub</p>
        <p class="pat__d">Identificador + núcleo de la entidad (su clave de negocio). Ej.: ${tbl('FT_T_FINS')} + ${tbl('FT_T_FIID')}.</p>
      </div>
      <div class="pat" style="background:var(--bbva-canary);">
        <p class="pat__t">2 · Link</p>
        <p class="pat__d">Tablas de rol/relación que conectan la entidad con otras. Ej.: ${tbl('FT_T_ISSR')}, ${tbl('FT_T_FLAR')}, ${tbl('FT_T_SSIR')}.</p>
      </div>
      <div class="pat" style="background:var(--bbva-lime);">
        <p class="pat__t">3 · Satélite</p>
        <p class="pat__d">Atributos, estadísticas y clasificaciones. Cuelgan del hub por su clave. Ej.: ${tbl('FT_T_FIST')}, ${tbl('FT_T_RSME')}.</p>
      </div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-4);">Todos los satélites de una entidad comparten la misma clave de unión con el hub.</aside>
  </main>`));

/* 8 · ENTIDADES PRINCIPALES (electric · divider de impacto) */
slides.push(slide('electric', 'Entidades principales', 'ENTIDADES PRINCIPALES', '04 · Mapa', '04 · Mapa del modelo', `
  <main>
    <p class="ante-title" style="color:var(--bbva-canary);">04 · Vista global</p>
    <h1>5 entidades principales + auxiliares</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:76ch;line-height:1.6;color:var(--bbva-sand);">El modelo gira en torno a cinco entidades principales. Todo lo demás (contactos, mercados, direcciones, geografía, clasificaciones, logs…) son tablas <strong>auxiliares</strong>.</p>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-4);">
      <div class="dom dom--core"><p class="dom__k">Legal Entities</p><p class="dom__d">Contrapartidas<br><code>INST_MNEM</code></p></div>
      <div class="dom dom--core"><p class="dom__k">Legal Agreements</p><p class="dom__d">Acuerdos<br><code>LEG_AGRMNT_ID</code></p></div>
      <div class="dom dom--core"><p class="dom__k">Issues</p><p class="dom__d">Emisiones<br><code>INSTR_ID</code></p></div>
      <div class="dom dom--core"><p class="dom__k">Settlement Instr.</p><p class="dom__d">Liquidación · SSI<br><code>SSI_OID</code></p></div>
      <div class="dom dom--core"><p class="dom__k">Confirmation Instr.</p><p class="dom__d">Confirmación · SCI<br><code>SCIS_OID</code></p></div>
    </div>
    <div style="margin-top:var(--bbva-space-3);background:rgba(133,200,255,.16);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-2) var(--bbva-space-3);">
      <p style="font-size:var(--bbva-fs-caption);color:var(--bbva-serene-blue);"><strong style="color:var(--bbva-sand);">Auxiliares:</strong> Contactos · Mercados (entidad secundaria) · Direcciones · Unidades geográficas · Clasificaciones · Transacciones · Logs.</p>
    </div>
  </main>`));

/* 9 · LEGAL ENTITIES overview (sand) */
slides.push(slide('sand', 'Legal Entities', 'ENTIDAD · LEGAL ENTITIES', '05 · Legal Entities', '05 · Legal Entities', `
  <main>
    <p class="ante-title">05 · Entidad 1 — el corazón del modelo</p>
    <h1>Legal Entities · Contrapartidas</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:74ch;line-height:1.6;">Una contrapartida se identifica por su <code>INST_MNEM</code>. Casi todo el dominio se une por ese mnemónico. ${tbl('FT_T_FINS')} es el núcleo (Institution Name) y ${tbl('FT_T_FIID')} guarda sus identificadores externos.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Núcleo & ID</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_FINS')} · institución</li><li>${tbl('FT_T_FIID')} · LEI, BDI, Clientela, FISCALID</li><li>${tbl('FT_T_FLG1')} · Legal Name</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Roles & relación</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_FINR')} · Entity Role</li><li>${tbl('FT_T_FIRL')} · Global/Local/Operativo</li><li>${tbl('FT_T_FRID')} · identificadores por rol (STAR, SWIFT/BIC)</li><li>${tbl('FT_T_FRCL')} · CNAE, CNO</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Satélites</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_FIST')} · estadísticas</li><li>${tbl('FT_T_RSME')} · Risk Level / riesgo país</li><li>${tbl('FT_T_FIGU')} · país de residencia</li><li>${tbl('FT_T_FAB1')} · atributos de rama</li></ul></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">Las contrapartidas son el punto de unión: el resto de entidades se conecta con ellas.</aside>
  </main>`));

/* 10 · LEGAL ENTITIES detalle (sand) */
slides.push(slide('sand', 'Legal Entities en detalle', 'ENTIDAD · LEGAL ENTITIES', '05 · Legal Entities', '05 · Legal Entities', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:start;">
    <div>
      <p class="ante-title">05 · En detalle</p>
      <h2 style="font-family:var(--bbva-font-display);">El patrón contexto/valor de ${tbl('FT_T_FIID')}</h2>
      <p style="margin-top:var(--bbva-space-2);line-height:1.6;font-size:var(--bbva-fs-body);">Una misma tabla guarda todos los identificadores. Cada fila dice <em>qué</em> identificador es (<code>FINS_ID_CTXT_TYP</code>) y <em>cuál</em> es su valor (<code>FINS_ID</code>).</p>
      <div style="margin-top:var(--bbva-space-3);background:var(--bbva-electric-blue);color:var(--bbva-sand);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);font-family:monospace;font-size:13px;line-height:1.6;">SELECT * FROM FT_T_FIID<br>WHERE FINS_ID_CTXT_TYP='LEIID'<br>&nbsp;&nbsp;AND DATA_STAT_TYP='ACTIVE'<br>&nbsp;&nbsp;AND INST_MNEM=?;</div>
      <p style="margin-top:var(--bbva-space-2);font-size:var(--bbva-fs-caption);">Contextos típicos: <code>FINSID</code>, <code>LEIID</code>, <code>BDIID</code>, <code>CLIENTELAID</code>, <code>CODTESID</code>.</p>
    </div>
    <div>
      <p class="ante-title">Jerarquía de contrapartidas</p>
      <h2 style="font-family:var(--bbva-font-display);">Global → Local → Operativo</h2>
      <p style="margin-top:var(--bbva-space-2);font-size:var(--bbva-fs-body);line-height:1.6;">${tbl('FT_T_FIRL')} conecta los tres niveles vía <code>INST_MNEM</code> ↔ <code>PARENT</code>: el Global es padre del Local, y el Local del Operativo.</p>
      <div style="margin-top:var(--bbva-space-3);display:grid;gap:10px;">
        <div class="hier hier--1">GLOBAL <span>padre</span></div>
        <div class="hier hier--2">LOCAL <span>hijo de Global · padre de Operativo</span></div>
        <div class="hier hier--3">OPERATIVO <span>nivel de operación</span></div>
      </div>
      <p style="margin-top:var(--bbva-space-2);font-size:var(--bbva-fs-caption);">Enterprises (${tbl('FT_T_ENTR')}/${tbl('FT_T_ENFR')}, <code>ORG_ID</code>) y subdivisiones (${tbl('FT_T_SUBD')}, <code>SUBDIV_ID</code>) agrupan instituciones y oficinas.</p>
    </div>
  </main>`));

/* 11 · ISSUES overview (sand) */
slides.push(slide('sand', 'Issues', 'ENTIDAD · ISSUES', '05 · Issues', '05 · Issues', `
  <main>
    <p class="ante-title">05 · Entidad 2</p>
    <h1>Issues · Emisiones (valores)</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:74ch;line-height:1.6;">Una emisión se identifica por <code>INSTR_ID</code>. ${tbl('FT_T_ISSU')} es el núcleo (tipo, clase, estado, fecha) e ${tbl('FT_T_ISID')} guarda sus códigos: <code>RDR_ID</code>, <code>CUSIP</code>, <code>SEDOL</code>…</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Núcleo & ID</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_ISSU')} · emisión</li><li>${tbl('FT_T_ISID')} · CUSIP, SEDOL, RDR_ID</li><li>${tbl('FT_T_ISTY')} · tipo (<code>ISS_TYP</code>)</li><li>${tbl('FT_T_ISCL')} · clasificación</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Emisor & mercado</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_ISSR')} · <strong>Issuer</strong> → Legal Entities</li><li>${tbl('FT_T_MKIS')} · → Mercados</li><li>${tbl('FT_T_IRGU')} · jurisdicción</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Satélites</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_ISMC')} · market cap</li><li>${tbl('FT_T_ISAN')} · analytics (volatilidad)</li><li>${tbl('FT_T_ISST')} · ticker, BBGCID</li><li>${tbl('FT_T_ISDE')} · descripción</li></ul></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);">Los satélites de emisión se unen por <code>INSTR_ID</code>; el emisor por <code>INSTR_ISSR_ID</code>.</aside>
  </main>`));

/* 12 · ISSUER & MERCADOS (sand) */
slides.push(slide('sand', 'Issuer y Mercados', 'ENTIDAD · ISSUES', '05 · Issues', '05 · Issues', `
  <main>
    <p class="ante-title">05 · Los puentes de Issues</p>
    <h1>Emisor y mercado</h1>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-4);margin-top:var(--bbva-space-3);align-items:start;">
      <div>
        <p style="font-weight:700;">Issuer → Legal Entities</p>
        <p style="margin-top:8px;font-size:var(--bbva-fs-body);line-height:1.55;">El <strong>emisor</strong> de un valor es una contrapartida. ${tbl('FT_T_ISSR')} cose los dos dominios.</p>
        <div class="erflow erflow--v" style="margin-top:var(--bbva-space-3);">
          <div class="erbox"><p class="erbox__t">Emisión</p><p class="erbox__s">${tbl('FT_T_ISSU')}</p></div>
          <div class="erlink erlink--v"><span>INSTR_ISSR_ID</span><b>↓</b></div>
          <div class="erbox erbox--hub"><p class="erbox__t">Issuer</p><p class="erbox__s">${tbl('FT_T_ISSR')}</p></div>
          <div class="erlink erlink--v"><span>FINS_INST_MNEM</span><b>↓</b></div>
          <div class="erbox"><p class="erbox__t">Contrapartida</p><p class="erbox__s">${tbl('FT_T_FINS')}</p></div>
        </div>
      </div>
      <div>
        <p style="font-weight:700;">Issue → Mercados</p>
        <p style="margin-top:8px;font-size:var(--bbva-fs-body);line-height:1.55;">${tbl('FT_T_MKIS')} conecta la emisión con los <strong>mercados</strong>. Mercados es una <em>entidad secundaria</em>, cuya tabla principal de definición es ${tbl('FT_T_MRKT')}.</p>
        <div class="erflow erflow--v" style="margin-top:var(--bbva-space-3);">
          <div class="erbox"><p class="erbox__t">Emisión</p><p class="erbox__s">${tbl('FT_T_ISSU')}</p></div>
          <div class="erlink erlink--v"><span>FT_T_MKIS</span><b>↓</b></div>
          <div class="erbox erbox--hub"><p class="erbox__t">Mercado</p><p class="erbox__s">${tbl('FT_T_MRKT')}</p></div>
        </div>
      </div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-4);font-size:var(--bbva-fs-h3);">Desde una emisión llegas a su emisor (una contrapartida) y a sus mercados.</aside>
  </main>`));

/* 13 · LEGAL AGREEMENTS (sand) */
slides.push(slide('sand', 'Legal Agreements', 'ENTIDAD · LEGAL AGR.', '05 · Legal Agreements', '05 · Legal Agreements', `
  <main>
    <p class="ante-title">05 · Entidad 3</p>
    <h1>Legal Agreements · Acuerdos legales</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:74ch;line-height:1.6;">Un acuerdo se identifica por <code>LEG_AGRMNT_ID</code>. ${tbl('FT_T_LAGR')} es el núcleo (fechas, tipo) y ${tbl('FT_T_FLAR')} es el puente que lo relaciona con las contrapartidas y con sus participantes (clave <code>FLAR_OID</code>).</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Núcleo & ID</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_LAID')} · identificadores</li><li>${tbl('FT_T_LAGR')} · acuerdo</li><li>${tbl('FT_T_LAT1')} · atributos</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Puente a entidades</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_FLAR')} · FI ↔ Agreement (<code>INST_MNEM</code> + <code>FLAR_OID</code>)</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Participantes</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_LAIP')} · involved party</li><li>${tbl('FT_T_LAAP')} · annex participant</li><li>${tbl('FT_T_LAAT')} · ratings/umbrales</li><li>${tbl('FT_T_LPS1')} · estadísticas</li></ul></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">${tbl('FT_T_LAAT')} guarda ratings y umbrales que pueden <em>disparar eventos</em> para un participante.</aside>
  </main>`));

/* 14 · SETTLEMENT INSTRUCTIONS (sand) — corrección SSIR / SSIA */
slides.push(slide('sand', 'Settlement Instructions', 'ENTIDAD · SSIs', '05 · Settlement Instr.', '05 · Settlement Instructions', `
  <main>
    <p class="ante-title">05 · Entidad 4</p>
    <h1>Settlement Instructions · SSIs</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:78ch;line-height:1.6;">Instrucciones de <strong>liquidación</strong>: cómo y dónde se liquida una operación. Núcleo ${tbl('FT_T_SSIS')} (clave <code>SSI_OID</code>).</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Núcleo & atributos</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_SSIS')} · instrucción</li><li>${tbl('FT_T_SAT1')} · Val Date, STP, MT210</li><li>${tbl('FT_T_SAI1')} · SSI relacionadas</li><li>${tbl('FT_T_SSAC')} · cuenta safekeeping</li></ul></div>
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Asignación</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_SSIA')} · productos asociados a la instrucción</li></ul></div>
      <div class="info-card" style="border-left:4px solid var(--bbva-lime);"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">${tbl('FT_T_SSIR')} — unión con entidades</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;line-height:1.5;">Es <strong>la que une la instrucción con las contrapartidas</strong>, según el <strong>rol</strong> de la entidad en la liquidación: Banco corresponsal, Banco custodio, Beneficiario, Intermediario…</p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">La contrapartida se une a la instrucción por su <em>rol</em>, a través de ${tbl('FT_T_SSIR')}.</aside>
  </main>`));

/* 15 · CONFIRMATION INSTRUCTIONS (sand) */
slides.push(slide('sand', 'Confirmation Instructions', 'ENTIDAD · SCIs', '05 · Confirmation Instr.', '05 · Confirmation Instructions', `
  <main style="display:grid;grid-template-columns:1.1fr .9fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">05 · Entidad 5</p>
      <h1>Confirmation Instructions · SCIs</h1>
      <p style="margin-top:var(--bbva-space-2);line-height:1.6;">Instrucciones de <strong>confirmación</strong>: cómo se confirma una operación con la contraparte. Núcleo ${tbl('FT_T_SCIS')} (clave <code>SCIS_OID</code>), unido a la contrapartida por <code>FINR_INST_MNEM</code> y por el rol del FRID.</p>
      <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">${tbl('FT_T_SCMO')} define el <em>medio</em> de envío de la confirmación y el contacto asociado.</aside>
    </div>
    <div style="display:grid;gap:var(--bbva-space-2);">
      <div class="info-card"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Estructura de la entidad</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_SCIS')} · instrucción de confirmación</li><li>${tbl('FT_T_COI1')} · identificadores</li><li>${tbl('FT_T_COA1')} · atributos (Val Date, STP)</li><li>${tbl('FT_T_SCMO')} · media options / contacto</li><li>${tbl('FT_T_SCA1')} · asignación (Enterprise + ${tbl('FT_T_FRID')})</li></ul></div>
    </div>
  </main>`));

/* 16 · AUXILIARES (sand) — incluye Contactos, Mercados, CCRF (no usado) */
slides.push(slide('sand', 'Tablas auxiliares', 'AUXILIARES', '05 · Auxiliares', '05 · Auxiliares', `
  <main>
    <p class="ante-title">05 · Todo lo demás</p>
    <h1>Tablas auxiliares</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:80ch;line-height:1.6;">Dan servicio a las entidades principales. No son entidades de negocio en sí, salvo <strong>Mercados</strong>, que es una entidad <em>secundaria</em>.</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="info-card info-card--accent"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Contactos & Mercados</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_CNTC')} · contacto</li><li>${tbl('FT_T_CNTA')} · asignación a FI/emisión</li><li>${tbl('FT_T_MRKT')} · mercados (secundaria)</li></ul></div>
      <div class="info-card info-card--accent"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Direcciones</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_ADTP')} · tipo (FISCAL, LEGAL, EMAIL…)</li><li>${tbl('FT_T_MADR')} · postal / física</li><li>${tbl('FT_T_EADR')} · electrónica</li></ul></div>
      <div class="info-card info-card--accent"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">Geo, clasif. & logs</p><ul class="bbva-list" style="font-size:var(--bbva-fs-caption);margin-top:6px;"><li>${tbl('FT_T_GUNT')} · unidad geográfica</li><li>${tbl('FT_T_INCL')} · clasificación</li><li>${tbl('FT_T_RLT1')} · logs · ${tbl('FT_T_TRID')} · transacciones</li></ul></div>
      <div class="info-card info-card--accent"><p style="font-weight:700;font-size:var(--bbva-fs-caption);">${tbl('FT_T_CCRF')} — cross-reference</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;line-height:1.5;">Cruza identificadores de entidades, emisiones, contactos y geo. Cumple esa función de referencia, pero no es de las tablas principales: la conexión habitual va por las contrapartidas.</p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);">${tbl('FT_T_ADTP')} enlaza la entidad (<code>INST_MNEM</code>) con su dirección postal (<code>MAIL_ADDR_ID</code>) o electrónica (<code>ELEC_ADDR_ID</code>).</aside>
  </main>`));

/* 17 · CÓMO SE CONECTA TODO (sand) — a través de las entidades, sin CCRF */
slides.push(slide('sand', 'Cómo se conecta todo', 'CONEXIONES', '06 · Conexiones', '06 · Cómo se conecta todo', `
  <main>
    <p class="ante-title">06 · El hilo conductor</p>
    <h1>Todo se conecta a través de las entidades</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:80ch;line-height:1.6;">La vía principal no es un cross-reference central (${tbl('FT_T_CCRF')} cumple esa función de referencia, pero es secundaria). Cada entidad se relaciona con las <strong>contrapartidas</strong> mediante una tabla de <strong>rol</strong>:</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="bridge"><p class="bridge__t">${tbl('FT_T_ISSR')}</p><p class="bridge__d">Issues ↔ Legal Entities — el emisor (<code>FINS_INST_MNEM</code>)</p></div>
      <div class="bridge"><p class="bridge__t">${tbl('FT_T_FLAR')}</p><p class="bridge__d">Legal Agreements ↔ Legal Entities — firmante / participante</p></div>
      <div class="bridge"><p class="bridge__t">${tbl('FT_T_SSIR')}</p><p class="bridge__d">Settlement Instr. ↔ Legal Entities — por rol (corresponsal, custodio, beneficiario…)</p></div>
      <div class="bridge"><p class="bridge__t">${tbl('FT_T_SCA1')} / FRID</p><p class="bridge__d">Confirmation Instr. ↔ Legal Entities — rol en la confirmación</p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">Las <strong>contrapartidas</strong> son el centro: cada entidad se une a ellas por su rol.</aside>
  </main>`));

/* 18 · EJEMPLO END-TO-END (sand) — usa SSIR */
slides.push(slide('sand', 'Ejemplo end-to-end', 'NAVEGACIÓN', '06 · Ejemplo', '06 · Ejemplo end-to-end', `
  <main>
    <p class="ante-title">06 · Una consulta que cruza el modelo</p>
    <h1>De una contrapartida a su liquidación</h1>
    <p style="margin-top:var(--bbva-space-2);max-width:80ch;line-height:1.6;">Pregunta: <em>"Dame la instrucción de liquidación activa en la que la contrapartida X actúa como banco custodio, junto con su SWIFT (BIC)".</em> El recorrido:</p>
    <div style="display:grid;gap:9px;margin-top:var(--bbva-space-3);">
      <div class="step"><span class="step__n">1</span><span><strong>${tbl('FT_T_FIID')}</strong> — localiza <code>INST_MNEM</code> a partir del LEI (<code>FINS_ID_CTXT_TYP='LEIID'</code>).</span></div>
      <div class="step"><span class="step__n">2</span><span><strong>${tbl('FT_T_FINS')}</strong> — confirma la contrapartida y su nombre.</span></div>
      <div class="step"><span class="step__n">3</span><span><strong>${tbl('FT_T_SSIR')}</strong> — las instrucciones donde esa contrapartida tiene el <strong>rol</strong> de custodio.</span></div>
      <div class="step"><span class="step__n">4</span><span><strong>${tbl('FT_T_SSIS')} + ${tbl('FT_T_SAT1')}</strong> — la SSI y sus atributos. Filtra <code>DATA_STAT_TYP='ACTIVE'</code>.</span></div>
      <div class="step"><span class="step__n">5</span><span><strong>${tbl('FT_T_FRID')}</strong> — el <strong>SWIFT (BIC)</strong>: no es una dirección, sino un identificador externo <em>por rol</em> (la entidad puede tener SWIFT como banco corresponsal o como entidad principal).</span></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">El nexo entre instrucción y entidad es el <strong>rol</strong> (${tbl('FT_T_SSIR')}). Así se navega RDR.</aside>
  </main>`));

/* 19 · BUENAS PRÁCTICAS (sand) */
slides.push(slide('sand', 'Buenas prácticas', 'BUENAS PRÁCTICAS', '06 · Buenas prácticas', '06 · Buenas prácticas', `
  <main>
    <p class="ante-title">06 · Antes de consultar</p>
    <h1>Buenas prácticas con el modelo</h1>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-3);">
      <div class="info-card"><p style="font-weight:700;">1 · Quédate con la versión vigente</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">Filtra <code>DATA_STAT_TYP='ACTIVE'</code> y respeta <code>START_TMS</code>/<code>END_TMS</code>: cada registro está versionado.</p></div>
      <div class="info-card"><p style="font-weight:700;">2 · Une por la clave de la entidad</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">El <code>*_OID</code> correspondiente; <code>INST_MNEM</code> e <code>INSTR_ID</code> aparecen más, pero ninguna clave manda sobre las otras.</p></div>
      <div class="info-card"><p style="font-weight:700;">3 · Para cruzar entidades, ve por el rol</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">${tbl('FT_T_ISSR')}, ${tbl('FT_T_FLAR')}, ${tbl('FT_T_SSIR')}. El cruce entre entidades pasa por las <strong>contrapartidas</strong>.</p></div>
      <div class="info-card"><p style="font-weight:700;">4 · Identifica el papel de la tabla</p><p style="font-size:var(--bbva-fs-caption);margin-top:6px;">¿Identificador, núcleo, rol o satélite? El sufijo te lo dice y orienta el JOIN.</p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-3);font-size:var(--bbva-fs-h3);">Une por la clave de cada entidad y cruza siempre a través de las contrapartidas.</aside>
  </main>`));

/* 20 · RESUMEN (midnight · impacto) */
slides.push(slide('midnight', 'Resumen', 'RESUMEN', '06 · Resumen', '06 · Resumen', `
  <main>
    <p class="ante-title" style="color:var(--bbva-canary);">En una frase</p>
    <h1>El modelo de RDR, en cuatro ideas</h1>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--bbva-space-2);margin-top:var(--bbva-space-4);">
      <div class="bridge"><p class="bridge__t">5 entidades, 1 patrón</p><p class="bridge__d">Hub · Link · Satélite se repite en Legal Entities, Legal Agreements, Issues, SSIs y SCIs.</p></div>
      <div class="bridge"><p class="bridge__t">Cada clave pesa igual</p><p class="bridge__d"><code>INST_MNEM</code> e <code>INSTR_ID</code> se repiten más, pero no mandan sobre <code>LEG_AGRMNT_ID</code> o <code>SSI_OID</code>.</p></div>
      <div class="bridge"><p class="bridge__t">Se conecta por entidades</p><p class="bridge__d">Vía roles (Issuer, FLAR, SSIR). ${tbl('FT_T_CCRF')} es un cross-reference secundario.</p></div>
      <div class="bridge"><p class="bridge__t">Disciplina al consultar</p><p class="bridge__d">Versión vigente (<code>ACTIVE</code> + <code>START/END_TMS</code>) y conoce el papel de cada tabla.</p></div>
    </div>
    <aside class="conclusion__box" style="margin-top:var(--bbva-space-4);">Ahora, el quiz: 25 preguntas sobre entidades, claves y relaciones.</aside>
  </main>`));

/* 21 · QUIZ (sand · slide final) */
slides.push(`
<section class="slide bbva-combo--sand" aria-label="Quiz de evaluación" style="min-height:100vh;">
  <header class="slide__header">
    <nav class="breadcrumb"><span>MODELO DE DATOS · RDR</span><span class="breadcrumb__sub">QUIZ</span></nav>
    <span class="lg lg-bbva lg--blue" role="img" aria-label="BBVA"></span>
  </header>
  <main style="max-width:760px;margin:0 auto;width:100%;">
    <p class="ante-title">07 · Evaluación</p>
    <h2 style="font-family:var(--bbva-font-display);">Quiz · 25 preguntas</h2>
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
    <span>07 · Quiz</span>
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
  code.t{font-family:monospace;font-size:.82em;background:color-mix(in srgb,var(--bbva-electric-blue) 9%,white);color:var(--bbva-electric-blue);padding:1px 6px;border-radius:6px;white-space:nowrap;}
  .bbva-combo--electric code.t,.bbva-combo--midnight code.t{background:rgba(255,255,255,.16);color:var(--bbva-sand);}
  /* chips sobre cajas claras (acento) → texto azul SIEMPRE, aunque la slide sea oscura */
  .pat code,.pat code.t,.erbox code,.erbox code.t,.dom--core code,.dom--core code.t,.hier code,.keycard code{background:color-mix(in srgb,var(--bbva-electric-blue) 12%,white)!important;color:var(--bbva-electric-blue)!important;}
  .section-index__title{font-size:var(--bbva-fs-body)!important;line-height:1.2;overflow:visible;}
  .section-index__item{min-height:180px;overflow:visible;}
  .pat{border-radius:var(--bbva-radius-md);padding:var(--bbva-space-4);color:var(--bbva-electric-blue);}
  .pat__t{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-h3);}
  .pat__d{font-size:var(--bbva-fs-caption);margin-top:8px;line-height:1.5;}
  .keycard{background:var(--bbva-white);border:1px solid var(--bbva-gray-2);border-top:4px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);min-height:120px;display:grid;align-content:start;gap:8px;}
  .keycard__e{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-body);color:var(--bbva-electric-blue);line-height:1.1;}
  .keycard__k code{font-family:monospace;font-size:.8em;}
  .dom{background:rgba(255,255,255,.10);border:1px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);min-height:120px;display:grid;align-content:start;gap:6px;}
  .dom--core{background:var(--bbva-canary);border-color:var(--bbva-canary);}
  .dom--core .dom__k,.dom--core .dom__d{color:var(--bbva-electric-blue);}
  .dom__k{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-body);color:var(--bbva-sand);line-height:1.1;}
  .dom__d{font-size:var(--bbva-fs-caption);color:var(--bbva-serene-blue);}
  .hier{border-radius:var(--bbva-radius-md);padding:var(--bbva-space-2) var(--bbva-space-3);font-weight:700;color:var(--bbva-electric-blue);}
  .hier span{display:block;font-weight:400;font-size:var(--bbva-fs-caption);opacity:.85;margin-top:2px;}
  .hier--1{background:var(--bbva-canary);}
  .hier--2{background:var(--bbva-lime);margin-left:24px;}
  .hier--3{background:var(--bbva-mandarin);margin-left:48px;}
  .erbox{background:var(--bbva-sand);color:var(--bbva-electric-blue);border:1px solid var(--bbva-gray-2);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-2) var(--bbva-space-3);text-align:center;min-width:118px;}
  .erbox--hub{background:var(--bbva-canary);border-color:var(--bbva-canary);}
  .erbox__t{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-body);}
  .erbox__s{font-size:var(--bbva-fs-caption);margin-top:4px;}
  .erlink{color:var(--bbva-electric-blue);font-weight:700;font-size:var(--bbva-fs-caption);text-align:center;display:grid;}
  .erlink span{font-family:monospace;font-size:11px;opacity:.85;}
  .erflow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .erflow--v{flex-direction:column;align-items:stretch;gap:6px;max-width:300px;}
  .erflow--v .erbox{width:100%;min-width:0;}
  .erlink--v{display:flex;flex-direction:column;align-items:center;line-height:1;color:var(--bbva-electric-blue);}
  .erlink--v b{font-size:16px;margin-top:1px;}
  .bridge{background:rgba(255,255,255,.10);border-left:4px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);}
  .bbva-combo--sand .bridge,.bbva-combo--serene .bridge{background:var(--bbva-white);border-left-color:var(--bbva-serene-blue);}
  .bbva-combo--midnight .bridge,.bbva-combo--electric .bridge{background:rgba(255,255,255,.10);}
  .bridge__t{font-family:monospace;font-weight:700;font-size:var(--bbva-fs-body);color:var(--bbva-electric-blue);}
  .bbva-combo--midnight .bridge__t,.bbva-combo--electric .bridge__t{color:var(--bbva-sand);}
  .bridge__d{font-size:var(--bbva-fs-caption);color:var(--bbva-gray-5);margin-top:6px;}
  .bbva-combo--midnight .bridge__d,.bbva-combo--electric .bridge__d{color:var(--bbva-serene-blue);}
  .step{display:flex;align-items:flex-start;gap:var(--bbva-space-2);background:var(--bbva-white);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-2) var(--bbva-space-3);font-size:var(--bbva-fs-body);line-height:1.45;}
  .step__n{flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:var(--bbva-electric-blue);color:var(--bbva-sand);font-weight:700;display:grid;place-items:center;font-size:14px;}
</style>`;

// ── Quiz · 25 preguntas (respuestas correctas repartidas A/B/C/D) ───────────
const QUES = [
  {q:"¿Sobre qué plataforma está implementado el modelo de datos de RDR?",opts:["GoldenSource Enterprise 8.7 (sobre Oracle)","SAP Master Data Management","Informatica MDM","Collibra Data Governance"],c:0,exp:"RDR está implementado sobre GoldenSource Enterprise 8.7, con Oracle como motor."},
  {q:"¿Qué patrón de nombre llevan las tablas del modelo?",opts:["RDR_*","T_FT_*","GS_T_*","FT_T_*"],c:3,exp:"FT_T_XXXX = Financial Table · Transactional. Los cuatro últimos caracteres identifican la entidad y su papel."},
  {q:"¿Cuál es la tabla núcleo de las contrapartidas (Legal Entities)?",opts:["FT_T_FIID","FT_T_FINS","FT_T_FINR","FT_T_FIST"],c:1,exp:"FT_T_FINS (Financial Institution) es el núcleo de Legal Entities y recoge el Institution Name."},
  {q:"¿Qué clave identifica el dominio de Legal Entities (contrapartidas)?",opts:["INST_MNEM","INSTR_ID","LEG_AGRMNT_ID","SSI_OID"],c:0,exp:"INST_MNEM (mnemónico de institución) une el dominio de contrapartidas."},
  {q:"¿En qué tabla están los identificadores de una contrapartida (LEI, BDI, Clientela)?",opts:["FT_T_FLG1","FT_T_FRID","FT_T_FIID","FT_T_FAB1"],c:2,exp:"FT_T_FIID (Financial Institution Identifier) recoge LEI, BDI, Clientela, CODTES, FISCALID…"},
  {q:"En FT_T_FIID, ¿cómo se almacena un identificador concreto como el LEI?",opts:["Una columna fija por cada tipo","Como par contexto/valor: FINS_ID_CTXT_TYP + FINS_ID","Concatenado dentro del INST_MNEM","En una tabla distinta por cada código"],c:1,exp:"Patrón contexto/valor: FINS_ID_CTXT_TYP indica el tipo (p. ej. 'LEIID') y FINS_ID guarda el valor."},
  {q:"¿Qué tabla modela la jerarquía Global → Local → Operativo de las contrapartidas?",opts:["FT_T_FINR","FT_T_SUFR","FT_T_EERL","FT_T_FIRL"],c:3,exp:"FT_T_FIRL conecta los niveles vía INST_MNEM ↔ PARENT: Global es padre del Local y éste del Operativo."},
  {q:"¿Cuáles son las entidades PRINCIPALES del modelo?",opts:["Solo Legal Entities e Issues","Todas las tablas FT_T_ por igual","Legal Entities, Legal Agreements, Issues, Settlement Instructions y Confirmation Instructions","Contactos, Direcciones y Mercados"],c:2,exp:"Esas cinco son las entidades principales; el resto (contactos, mercados, direcciones, geo, logs…) son auxiliares."},
  {q:"Sobre el número de tablas del modelo, ¿qué es cierto?",opts:["Las ~60 conocidas son solo las principales; el modelo tiene muchas más","El modelo tiene exactamente 60 tablas","Hay una tabla por entidad, 5 en total","Todas las tablas están documentadas"],c:0,exp:"Las ~60 tablas habituales son solo las principales; el modelo completo tiene muchas más."},
  {q:"¿Qué clave identifica una emisión (Issue)?",opts:["ISSUE_OID","SSI_OID","INST_MNEM","INSTR_ID"],c:3,exp:"INSTR_ID es la clave que une los satélites del dominio Issues."},
  {q:"¿Cuál es la tabla núcleo de las emisiones?",opts:["FT_T_ISID","FT_T_ISSU","FT_T_ISSR","FT_T_ISTY"],c:1,exp:"FT_T_ISSU (Issue) es el núcleo: tipo, clase, estado y fecha."},
  {q:"¿Dónde se guardan identificadores de emisión como CUSIP, SEDOL o RDR_ID?",opts:["FT_T_ISSU","FT_T_ISST","FT_T_ISID","FT_T_ISCL"],c:2,exp:"FT_T_ISID (Issue Identifier) recoge RDR_ID, CUSIP, SEDOL…"},
  {q:"¿Qué tabla conecta una emisión con su emisor (Legal Entity)?",opts:["FT_T_ISSR","FT_T_IRGU","FT_T_MKIS","FT_T_RIDF"],c:0,exp:"FT_T_ISSR (Issuer) une la emisión (INSTR_ISSR_ID) con la contrapartida emisora (FINS_INST_MNEM)."},
  {q:"¿Qué tabla conecta las emisiones con los mercados?",opts:["FT_T_ISGU","FT_T_ISAN","FT_T_ISMC","FT_T_MKIS"],c:3,exp:"FT_T_MKIS conecta emisiones con mercados. Mercados es una entidad secundaria definida en FT_T_MRKT."},
  {q:"¿Es INST_MNEM más importante que LEG_AGRMNT_ID o SSI_OID?",opts:["Sí, es la clave maestra del modelo","Sí, porque aparece en más tablas","No: aparece más veces, pero todas las claves pesan igual","No existe INST_MNEM en el modelo"],c:2,exp:"INST_MNEM e INSTR_ID se repiten más, pero no son más importantes: cada entidad tiene su clave."},
  {q:"¿Qué clave identifica el dominio de Legal Agreements?",opts:["FLAR_OID","LEG_AGRMNT_ID","AGREEMENT_KEY","INST_MNEM"],c:1,exp:"LEG_AGRMNT_ID une LAID, LAGR, LAT1 y FLAR (FLAR_OID enlaza a los participantes)."},
  {q:"¿Qué tabla relaciona los Legal Agreements con las contrapartidas?",opts:["FT_T_LAIP","FT_T_LAAP","FT_T_LPS1","FT_T_FLAR"],c:3,exp:"FT_T_FLAR (FI / Agreement Role) es el puente acuerdo ↔ contrapartida y raíz de los participantes."},
  {q:"¿Qué significan las siglas SSI?",opts:["Standard Settlement Instruction","Secure Settlement Identifier","System Settlement Index","Standard Securities Issue"],c:0,exp:"SSI = Standard Settlement Instruction: instrucción de liquidación."},
  {q:"¿Cuál es la tabla núcleo de las instrucciones de liquidación?",opts:["FT_T_SSIA","FT_T_SAT1","FT_T_SSIS","FT_T_SSIR"],c:2,exp:"FT_T_SSIS es el núcleo de las SSIs; su clave es SSI_OID."},
  {q:"¿Qué tabla une la instrucción de liquidación con las contrapartidas según su rol (corresponsal, custodio, beneficiario, intermediario)?",opts:["FT_T_SSIA","FT_T_SSIR","FT_T_SAT1","FT_T_SSAC"],c:1,exp:"FT_T_SSIR une instrucción y entidad por el ROL de la contrapartida en la liquidación."},
  {q:"¿Dónde se almacena el SWIFT (BIC) de una contrapartida?",opts:["En FT_T_MADR, como dirección física","En FT_T_FRID, como identificador externo por rol","En FT_T_ADTP, como tipo de dirección","En FT_T_GUNT, como unidad geográfica"],c:1,exp:"El SWIFT/BIC no es una dirección: es un identificador externo por rol (FT_T_FRID). Una entidad puede tener SWIFT como banco corresponsal o como entidad principal."},
  {q:"¿Cuál es la tabla núcleo de las instrucciones de confirmación (SCI)?",opts:["FT_T_SCIS","FT_T_COI1","FT_T_SCMO","FT_T_SCA1"],c:0,exp:"FT_T_SCIS es el núcleo del dominio SCIs (clave SCIS_OID)."},
  {q:"¿Cuál es la tabla núcleo de los Legal Agreements (acuerdos legales)?",opts:["FT_T_LAID","FT_T_FLAR","FT_T_LAGR","FT_T_LAT1"],c:2,exp:"FT_T_LAGR es el núcleo del dominio Legal Agreements (fechas y tipo del acuerdo); su clave es LEG_AGRMNT_ID. LAID son identificadores, FLAR el puente con las contrapartidas y LAT1 los atributos."},
  {q:"¿Qué columnas de auditoría están presentes en todas las tablas?",opts:["Solo CREATED_BY","START_TMS, END_TMS, LAST_CHG_TMS y LAST_CHG_USR_ID","Únicamente DATA_SRC_ID","No hay columnas de auditoría"],c:1,exp:"START_TMS/END_TMS (vigencia temporal), LAST_CHG_TMS (último cambio) y LAST_CHG_USR_ID (usuario) están en todas las tablas."},
  {q:"¿Qué patrón sigue cada entidad del modelo?",opts:["Una única tabla desnormalizada","Esquema en estrella con tabla de hechos central","Grafo sin claves, todo por nombre","Hub (id/núcleo) + Links (roles) + Satélites (atributos), unidos por la clave de la entidad"],c:3,exp:"Modelo canónico Hub·Link·Satélite: identificador y núcleo, tablas de rol y satélites de atributos unidos por la clave."}
];

const QUIZ_SCRIPT = `<script>
const QUES = ${JSON.stringify(QUES)};
const PASS_THRESHOLD = 17;
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
  const statusMsg=passed?'Enhorabuena - dominas el modelo de datos de RDR. Ya puedes navegar las tablas con criterio.':'Necesitas repasar. Vuelve sobre las entidades y las claves, y repite el quiz cuando estés listo/a.';
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
window.COURSE_ID = "form-cross-2-modelo-datos-rdr";
window.COURSE_NAME = "Modelo de Datos de RDR";
window.COURSE_TAG = "Cross";
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
console.log('slides:', slides.length, 'questions:', QUES.length, 'bytes:', html.length, 'answer dist:', JSON.stringify(dist));
