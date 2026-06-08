/* Generador del deck FUNCIONAL · Instrucciones de Liquidación (SSI/SDI)
   Reformatea pendientes/SSI-InstruccionesLiquidacion-Presentacion.html al formato
   de las formaciones BBVA × NFQ (deck 16:9, tokens, navegación, quiz, certificado). */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'formacion', 'form-tecnico-1-tecnologias-rdr.html');
const OUT = path.join(ROOT, 'formacion', 'form-functional-2-instrucciones-liquidacion.html');
const src = fs.readFileSync(SRC, 'utf8');

// ── Andamiaje del deck técnico ─────────────────────────────────────────────
const headEnd = src.indexOf('</head>');
const HEAD = src.slice(0, headEnd + 7)
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Instrucciones de Liquidación · Formación BBVA × NFQ</title>');
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
    <p class="ante-title" style="color:var(--bbva-canary);">RDR · INSTRUCCIONES DE LIQUIDACIÓN</p>
    <h1 class="bbva-hero" style="line-height:.95;">Instrucciones<br>de Liquidación</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:64ch;">Settlement Instructions (SSI / SDI): cómo RDR gestiona el maestro de datos de liquidación, lo publica al Back Office y da soporte a la migración de operaciones.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;">
      <span class="pill">~857K registros</span><span class="pill">Cash · Securities</span><span class="pill">Calypso · SWIFT</span><span class="pill">Migración</span>
    </div>
  </div>
  <footer class="slide__footer">
    <span style="color:var(--bbva-serene-blue);">BBVA CIB · RDR</span>
    <div class="nfq-credit"><span class="nfq-credit__label" style="color:var(--bbva-sand);">Hecho por</span><span class="lg lg-nfq-word" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`);

/* 2 · ÍNDICE */
slides.push(slide('sand', 'Índice', 'INSTRUCCIONES DE LIQUIDACIÓN', 'ÍNDICE', '01 · Índice', `
  <main>
    <p class="ante-title">Qué vas a aprender</p>
    <h1 style="margin-bottom:var(--bbva-space-3);">Recorrido</h1>
    <div class="section-index">
      <div class="section-index__item"><p class="section-index__label">01</p><p class="section-index__title">Qué es una SSI</p></div>
      <div class="section-index__item"><p class="section-index__label">02</p><p class="section-index__title">Conceptos y características</p></div>
      <div class="section-index__item"><p class="section-index__label">03</p><p class="section-index__title">Tipos y métodos</p></div>
      <div class="section-index__item"><p class="section-index__label">04</p><p class="section-index__title">Datos y participantes</p></div>
      <div class="section-index__item"><p class="section-index__label">05</p><p class="section-index__title">Gestión: UI y batch</p></div>
      <div class="section-index__item"><p class="section-index__label">06</p><p class="section-index__title">Migración y simulacros</p></div>
      <div class="section-index__item"><p class="section-index__label">07</p><p class="section-index__title">Resumen</p></div>
    </div>
  </main>`));

/* 3 · ¿QUÉ ES UNA SSI? */
slides.push(slide('sand', 'Qué es una SSI', 'INSTRUCCIONES DE LIQUIDACIÓN', '01 · Introducción', '01 · Introducción', `
  <main>
    <p class="ante-title">01 · Introducción</p>
    <h1>¿Qué es una SSI?</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-2);max-width:80ch;">Una <strong>Settlement Instruction</strong> es una instrucción permanente que define <em>cómo</em> entregar cash o securities a una contraparte y mediante qué <strong>método de liquidación</strong>.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Liquidación según SDIs válidas</h3><p>Cuando un trade llega al BO, el sistema liquida según las SDIs válidas para la combinación <em>Contraparte + Divisa + Producto + Fechas</em>. Sin intervención manual.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>RDR, el maestro</h3><p>RDR es el <strong>sistema maestro</strong> de instrucciones de liquidación de BBVA CIB. Contiene toda la información para liquidar (contrapartida-divisa-producto-fechas) y la suministra al BO.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);"><strong>Datos clave de una SSI:</strong> contrapartidas/participantes (quién liquida, beneficiario, corresponsal/custodio, intermediario), producto, intervalos de fecha (vigencia), STP (asignación automática Y/N), branch (geografía) y divisa.</div>
  </main>`));

/* 4 · CONCEPTOS BÁSICOS */
slides.push(slide('sand', 'Conceptos básicos', 'CONCEPTOS', '01 · Conceptos', '01 · Conceptos', `
  <main>
    <p class="ante-title">01 · Conceptos</p>
    <h1 style="margin-bottom:var(--bbva-space-2);">Conceptos básicos</h1>
    <div class="sg3">
      <div class="scard"><h3>Liquidación</h3><p>Cálculo final para cerrar o saldar una operación: el <strong>intercambio definitivo</strong> entre el dinero y el activo.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>Flujo de una operación</h3><p>Camino secuencial desde que se pacta hasta que se procesa, se paga definitivamente y se archiva.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Sentido de liquidación</h3><p>Lo que para uno es un gasto, para otro es un ingreso. Se define <strong>desde la entidad que origina</strong> la instrucción.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>MIS (OWNENT)</h3><p>Instrucción de la <strong>PO</strong> (Processing Org): la instrucción propia de la entidad (SPAIN, MEXICO, BSI…).</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>SUS (CPARTY)</h3><p>Instrucción de la <strong>contrapartida</strong>: la SDI que corresponde a la entidad con la que se opera.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-mandarin);"><h3>Liquidación a terceros</h3><p>Cuando la dueña de la instrucción y el beneficiario <strong>no coinciden</strong>.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Regla fundamental:</strong> si una operación liquida, debe existir instrucción tanto de la PO (<strong>MIS</strong>) como de la contraparte (<strong>SUS</strong>), y ambas con el <strong>mismo tipo de método</strong> de liquidación.</div>
  </main>`));

/* 5 · CARACTERÍSTICAS PRINCIPALES */
slides.push(slide('sand', 'Características principales', 'CONCEPTOS', '01 · Características', '01 · Características', `
  <main>
    <p class="ante-title">01 · Características</p>
    <h1 style="margin-bottom:var(--bbva-space-2);">Características principales</h1>
    <div class="sg3">
      <div class="scard"><h3>Clave funcional</h3><p>(Counterparty, Currency, Product, Asset Type) determina la SSI aplicable.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Jerarquía de aplicación</h3><p>SSI específica (divisa+producto) &gt; SSI general (divisa) &gt; SSI por defecto.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>Vigencia temporal</h3><p>Los campos <code>Date From</code>/<code>Date To</code> permiten planificar altas/bajas futuras sin intervención manual.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>STP (Straight-Through)</h3><p><code>STP=Y</code> asigna automáticamente la SDI a las operaciones (si no hay colisión de prioridad).</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Trazabilidad regulatoria</h3><p>BCE/EMIR exigen conservar la SSI original. Cada cambio queda auditado.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>Multi-país</h3><p>Reglas por branch: México (SPEI/SPID), España (A1), Colombia (C1).</p></div>
    </div>
  </main>`));

/* 6 · TIPOS DE PAGO */
slides.push(slide('sand', 'Tipos de SSI', 'TIPOS Y MÉTODOS', '02 · Tipos', '02 · Tipos de pago', `
  <main>
    <p class="ante-title">02 · Tipos de pago</p>
    <h1>Tipos de SSI según instrucción</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">El campo <strong>Instruction Type</strong> discrimina dos grandes familias, cada una con su cadena de participantes y reglas de enrutamiento.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l" style="border-left-color:var(--bbva-canary);"><h3>CASH · Pagos</h3><p>Liquidación de efectivo — transferencias de fondos entre cuentas.</p><ul class="slist"><li>• Mensajes SWIFT <strong>MT103 / MT202</strong></li><li>• Cuenta bancaria del beneficiario (IBAN/CLABE)</li><li>• Cadena: Ordenante → Corresponsal → Beneficiario</li><li>• Colombia: Client Cash obligatorio en C1</li><li>• Código ABA para enrutamiento USA</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>SECURITY · Valores</h3><p>Liquidación de valores — transferencia de títulos entre cuentas de custodia.</p><ul class="slist"><li>• Mensajes SWIFT <strong>MT540/541/542/543</strong></li><li>• Cuenta de custodia (safekeep account)</li><li>• Cadena: Beneficiario → Clearing → Custodio → Depositario</li><li>• Security Account por sucursal</li><li>• Penalización CSDR por settlement fails</li></ul></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Impacto del tipo:</strong> condiciona las sub-secciones visibles en pantalla, los lookups disponibles y los participantes obligatorios de la cadena.</div>
  </main>`));

/* 7 · MÉTODOS DE LIQUIDACIÓN */
slides.push(slide('sand', 'Métodos de liquidación', 'TIPOS Y MÉTODOS', '02 · Métodos', '02 · Métodos', `
  <main>
    <p class="ante-title">02 · Métodos</p>
    <h1>Métodos de liquidación</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">El campo <strong>Settlement Method Type</strong> define el mecanismo de liquidación y qué participantes son obligatorios.</p>
    <table class="stable" style="margin-top:var(--bbva-space-3);">
      <thead><tr><th>Método</th><th>Nombre</th><th>Descripción</th><th>Tipo</th></tr></thead>
      <tbody>
        <tr><td><span class="sbadge sbadge--b">CLS</span></td><td>Continuous Linked Settlement</td><td>Liquidación simultánea multi-divisa para FX (17 divisas principales).</td><td>Cash/FX</td></tr>
        <tr><td><span class="sbadge sbadge--g">EBA / TARGET2</span></td><td>Euro Banking Association</td><td>Métodos exclusivos para divisa <strong>EUR</strong>.</td><td>Cash</td></tr>
        <tr><td><span class="sbadge sbadge--y">CONTABLE/GDI</span></td><td>Account</td><td>Según cuenta beneficiario: si primeros 4 dígitos = 0182 y posiciones 11-13 ≠ 008/220/225/230 → GDI, si no → CONTABLE.</td><td>Cash</td></tr>
        <tr><td><span class="sbadge sbadge--o">SWIFT</span></td><td>SWIFT</td><td>Método para divisa distinta a EUR vía red SWIFT.</td><td>Cash</td></tr>
      </tbody>
    </table>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Nota:</strong> existen más métodos (DVP, RVP, FOP, CORRESP, CLEARING, CUSTODY…) aplicables sobre todo a Securities. Los anteriores son los más relevantes para Cash.</div>
    <div class="snote" style="margin-top:var(--bbva-space-1);"><strong>Regla MIS/SUS:</strong> para cada operación, la SDI MIS y la SDI SUS deben tener el <strong>mismo tipo de método</strong>. Si no coinciden, Calypso no asigna correctamente.</div>
  </main>`));

/* 8 · CAMPOS PRINCIPALES */
slides.push(slide('sand', 'Campos principales de la SSI', 'MODELO DE DATOS', '03 · Datos', '03 · Modelo de datos', `
  <main>
    <p class="ante-title">03 · Modelo de datos</p>
    <h1>Campos principales de la SSI</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);">La pantalla SSIS contiene <strong>258 controles</strong> en 8 páginas. Estos son los campos clave.</p>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th>Campo</th><th>Tabla / Path</th><th>Oblig.</th><th>Descripción</th></tr></thead>
      <tbody>
        <tr><td><strong>ID</strong></td><td>ft_t_sai1.alt_id</td><td><span class="sbadge sbadge--g">Auto</span></td><td>Identificador único, generado al guardar</td></tr>
        <tr><td><strong>Counterparty</strong></td><td>ft_t_fins.inst_mnem</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Contraparte propietaria. No editable post-alta</td></tr>
        <tr><td><strong>Settlement Method</strong></td><td>ssis.clrng_meth_typ</td><td><span class="sbadge sbadge--y">Sí</span></td><td>DVP, RVP, FOP, CORRESP, CLEARING, CLS…</td></tr>
        <tr><td><strong>Side</strong></td><td>ssis.trans_dir_typ</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Pay/Receive o Deliver/Receive</td></tr>
        <tr><td><strong>Instruction Type</strong></td><td>ssis.trn_proc_instruc_typ</td><td><span class="sbadge sbadge--y">Sí</span></td><td>CASH o SECURITY</td></tr>
        <tr><td><strong>Priority</strong></td><td>ssis.settle_instruc_prty_typ</td><td><span class="sbadge sbadge--y">Sí</span></td><td>Prioridad para selección automática</td></tr>
        <tr><td><strong>Status</strong></td><td>ssis.data_stat_typ</td><td><span class="sbadge sbadge--y">Sí</span></td><td>ACTIVE, INACTIVE, LOCKED</td></tr>
        <tr><td><strong>STP</strong></td><td>EAV (SETTATT2)</td><td>No</td><td>Straight-Through Processing</td></tr>
        <tr><td><strong>Date From / Date To</strong></td><td>EAV (SETTATT4/5)</td><td>No</td><td>Rango de fechas de vigencia</td></tr>
        <tr><td><strong>Products / Branches / Currency</strong></td><td>ft_t_ssia (iss_typ / org_id / instr_id)</td><td>No</td><td>Productos, sucursales y divisas aplicables</td></tr>
      </tbody>
    </table>
  </main>`));

/* 9 · CADENA DE PARTICIPANTES */
slides.push(slide('sand', 'Cadena de participantes', 'CADENA', '03 · Cadena', '03 · Cadena de participantes', `
  <main>
    <p class="ante-title">03 · Cadena</p>
    <h1>Cadena de participantes</h1>
    <div class="scode" style="margin-top:var(--bbva-space-2);">  BENEFICIARY ──► CLEARING AGENT ──► CORRESPONDENT
       │                                  │
       │          ┌── INTERMEDIARY 1 ◄────┘
       │          └── INTERMEDIARY 2
       │
       └──────► CUSTODY AGENT ──► LOCAL CUSTODIAN 1 / 2

  ▬▬▬ = Obligatorio     --- = Opcional</div>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th>Rol</th><th>Oblig.</th><th>Función</th><th>Datos clave</th></tr></thead>
      <tbody>
        <tr><td><strong>Dueña (Counterparty)</strong></td><td><span class="sbadge sbadge--y">Siempre</span></td><td>Propietaria de la instrucción</td><td>BIC, Cuenta</td></tr>
        <tr><td><strong>Beneficiary</strong></td><td><span class="sbadge sbadge--y">Siempre</span></td><td>Receptor final de la operación</td><td>BIC, Cuenta, ABA</td></tr>
        <tr><td><strong>Correspondent</strong></td><td><span class="sbadge sbadge--o">Según método</span></td><td>Banco corresponsal (si método = CORRESPONDENT)</td><td>BIC, Cuenta, "Message to"</td></tr>
        <tr><td><strong>Custody Agent</strong></td><td><span class="sbadge sbadge--o">Según método</span></td><td>Custodio de valores (si método = CUSTODY)</td><td>BIC, Cuenta, "Message to"</td></tr>
        <tr><td><strong>Intermediary / Local Custodian</strong></td><td><span class="sbadge sbadge--b">Opcional</span></td><td>Bancos intermediarios / sub-custodios locales</td><td>BIC, Cuenta</td></tr>
      </tbody>
    </table>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Por participante:</strong> contrapartida, account (safekeep/current), SWIFT BIC, ABA (USA), GL Account, "Message to" (flag SWIFT) y validación de cuenta.</div>
  </main>`));

/* 10 · PROCESOS UI */
slides.push(slide('sand', 'Procesos de interfaz', 'GESTIÓN', '04 · Gestión', '04 · Gestión (UI)', `
  <main>
    <p class="ante-title">04 · Gestión</p>
    <h1 style="margin-bottom:var(--bbva-space-2);">Procesos de interfaz de usuario</h1>
    <div class="sg3">
      <div class="scard"><h3>Búsqueda</h3><p>Por contraparte, divisa, producto, método o estado. Filtro ACTIVE por defecto.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-electric-blue);"><h3>Alta</h3><p>Se selecciona contraparte (no editable después), método, side y tipo. El submit genera el ID.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>Modificación</h3><p>Tras el alta, casi todos los campos quedan no editables. Solo se editan campos limitados.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Inactivar + Nuevo</h3><p>Transacción atómica: inactiva la SSI actual y crea una nueva vinculada. Para cambios estructurales.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Copiar</h3><p>Clona una SSI con nuevo ID y todos los campos editables. Útil para variantes por divisa.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>Reasignar</h3><p>Inactiva la vieja y crea una nueva apuntando a otra entity (otra contraparte).</p></div>
    </div>
  </main>`));

/* 11 · BATCH Y CICLO DE VIDA */
slides.push(slide('sand', 'Batch y ciclo de vida', 'GESTIÓN', '04 · Batch', '04 · Batch y ciclo de vida', `
  <main>
    <p class="ante-title">04 · Batch</p>
    <h1 style="margin-bottom:var(--bbva-space-1);">Procesos batch y ciclo de vida</h1>
    <p class="sub2" style="margin-bottom:var(--bbva-space-2);">32 procesos batch gestionan carga, validación, difusión y conciliación de SSIs.</p>
    <div class="sg3" style="margin-bottom:var(--bbva-space-2);">
      <div class="scard"><h3>Carga desde feeds</h3><p>ssis-account, -cedro, -clearing, -corresp, -euro: alimentan SSIs desde ficheros externos.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Difusión a sistemas</h3><p>ssis-trad*: publican a Calypso, SWIFT y Datio.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-aqua);"><h3>Auto-carga / difusión</h3><p>ssis-autocarga(mex), ssis-autodifu(mex): automáticos España y México.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Validación de bajas</h3><p>ssis-validar-bajas: procesa inactivaciones programadas de SSIs expiradas.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Mantenimiento CLS</h3><p>ssis-cs*: gestión específica de SSIs para CLS.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3>Reporting</h3><p>ssis-autocargareporte, -autodifureporte: informes de ejecución.</p></div>
    </div>
    <div class="scode">  (ninguno) ──► ACTIVE ◄──► ACTIVE  (UPDATE in-place)
                      │
            Inactivar ▼
                   INACTIVE  (terminal — no reactivable)
                      │  SSISDENE (REL_NEW)
   ACTIVE ──────────► INACTIVE + nueva SSI ACTIVE</div>
  </main>`));

/* 12 · DIVIDER ANEXO (electric) */
slides.push(slide('electric', 'Anexo migración', 'ANEXO · MIGRACIÓN', '05 · Anexo', '05 · Migración y simulacros', `
  <main style="display:grid;place-content:center;text-align:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">Anexo</p>
    <h1 class="bbva-hero" style="font-size:clamp(34px,4vw,64px);line-height:1.05;">Instrucciones de Liquidación<br>en una Migración / Simulacro</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:70ch;margin-inline:auto;">Objetivos, análisis, alta de SDIs y el flujo de trabajo antes, durante y después de los simulacros.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
      <span class="pill">Objetivos</span><span class="pill">Análisis</span><span class="pill">Alta SDIs</span><span class="pill">Pre-simulacro</span><span class="pill">Durante</span><span class="pill">Post-simulacro</span>
    </div>
  </main>`));

/* 13 · OBJETIVOS MIGRACIÓN */
slides.push(slide('sand', 'Objetivos de la migración', 'ANEXO · MIGRACIÓN', '05 · Objetivos', '05 · Objetivos', `
  <main>
    <p class="ante-title">Anexo · Objetivos</p>
    <h1>Objetivos de la migración</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">Cuando las operaciones migran al nuevo BO (caída de operaciones), deben seguir su curso: <strong>liquidar, confirmar, notificar, reportar</strong>.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>¿Cuándo es necesaria una SDI?</h3><p>Todas las operaciones deben quedar asignadas a una instrucción de liquidación si al menos uno de sus flujos es pasado.</p><ul class="slist"><li>• La migración ocurre en un momento D concreto</li><li>• Una operación puede tener algún flujo hecho pero no todos</li><li>• Si todos los flujos son <strong>posteriores al GoLive</strong> → revisar la necesidad</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>Regla fundamental</h3><p>Por cada operación (<strong>contrapartida + producto + divisa + fecha</strong>) debe existir una SDI en RDR y el BO.</p><ul class="slist"><li>• Instrucción de la <strong>PO (MIS)</strong></li><li>• Instrucción de la <strong>contraparte (SUS)</strong></li><li>• MIS y SUS con el <strong>mismo método</strong></li></ul></div>
    </div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Importante:</strong> el análisis se actualiza periódicamente. Las migraciones se dilatan: instrucciones válidas pueden inactivarse y otras pendientes pueden dejar de ser necesarias.</div>
  </main>`));

/* 14 · ANÁLISIS */
slides.push(slide('sand', 'Análisis de SDIs', 'ANEXO · MIGRACIÓN', '05 · Análisis', '05 · Análisis', `
  <main>
    <p class="ante-title">Anexo · Análisis</p>
    <h1>Análisis de instrucciones de liquidación</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">RDR, como maestro de datos estáticos, identifica el estado de las SDIs para la operativa viva que migra.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard"><h3>Papel de RDR</h3><ul class="slist"><li>• <strong>Diccionario</strong> entre aplicativos (caída de operaciones)</li><li>• <strong>Maestro</strong> que suministra las SDIs al BO</li><li>• <strong>Facilitador</strong> de datos fijos para liquidar y confirmar</li></ul></div>
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3>Análisis requerido</h3><ul class="slist"><li>✓ Operaciones que <strong>ya tienen</strong> SDI válida en RDR y BO</li><li>• Operaciones que <strong>no tienen</strong> SDI válida</li><li>• Para las que no tienen → <strong>revisar cuál dar de alta</strong></li></ul></div>
    </div>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Actualización continua:</strong> el análisis se revisa antes y después de cada simulacro, y para el GoLive. Las migraciones se dilatan y el estado de las instrucciones cambia.</div>
  </main>`));

/* 15 · PROCESO DE ALTA */
slides.push(slide('sand', 'Proceso de alta de SDIs', 'ANEXO · MIGRACIÓN', '05 · Alta', '05 · Alta de SDIs', `
  <main>
    <p class="ante-title">Anexo · Alta de SDIs</p>
    <h1>Proceso de alta de SDIs</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:84ch;">Si falta una SDI para una operación, se da de alta mediante la plantilla de carga masiva de RDR.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard scard--l"><h3>Plantilla de carga</h3><ul class="slist"><li>• Informar la plantilla es responsabilidad del <strong>usuario y/o BO</strong></li><li>• RDR ofrece <strong>soporte</strong> para ayudar a informarla</li><li>• RDR prueba la carga y publicación al BO</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-canary);"><h3>Responsabilidades claras</h3><ul class="slist"><li>✗ RDR IT <strong>no</strong> decide el tipo de SDI</li><li>✓ Es tema de <strong>negocio</strong></li><li>✓ El <strong>usuario</strong> debe estar presente en cada publicación</li></ul></div>
    </div>
    <div class="sflow" style="margin-top:var(--bbva-space-3);">
      <div class="sbox sbox--o"><small>BO detecta</small><b>Falta SDI</b></div><span class="sarrow">→</span>
      <div class="sbox"><small>BO/Usuario</small><b>Informa plantilla</b></div><span class="sarrow">→</span>
      <div class="sbox" style="border-color:var(--bbva-purple);"><small>RDR</small><b>Carga masiva</b></div><span class="sarrow">→</span>
      <div class="sbox sbox--d"><small>RDR</small><b>Publica al BO</b></div><span class="sarrow">→</span>
      <div class="sbox sbox--d"><small>Calypso</small><b>ACK / NACK</b></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);">Tras publicar, se revisa la respuesta <strong>ACK/NACK</strong>. Si todas reciben ACK, se traslada a la plantilla de carga y <strong>se versiona</strong>.</div>
  </main>`));

/* 16 · PREVIO A SIMULACROS */
slides.push(slide('sand', 'Previo a los simulacros', 'ANEXO · MIGRACIÓN', '05 · Pre-simulacro', '05 · Pre-simulacro', `
  <main>
    <p class="ante-title">Anexo · Pre-simulacro</p>
    <h1>Flujo de trabajo: previo a los simulacros</h1>
    <table class="stable" style="margin-top:var(--bbva-space-2);font-size:11px;">
      <thead><tr><th style="width:5%">#</th><th style="width:14%">Responsable</th><th>Acción</th></tr></thead>
      <tbody>
        <tr><td><strong>1</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Extracción de <strong>PRO</strong> de las SDIs existentes para la operativa viva</td></tr>
        <tr><td><strong>2</strong></td><td><span class="sbadge sbadge--g">BO</span></td><td>Extracción de las SDIs de su sistema para la operativa viva</td></tr>
        <tr><td><strong>3</strong></td><td><span class="sbadge sbadge--g">BO</span></td><td>Detectar para qué contrapartida-divisa-producto-fechas <strong>necesita SDI</strong></td></tr>
        <tr><td><strong>4</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Revisar si para lo detectado existe alguna SDI del paso 1 que cumpla</td></tr>
        <tr><td><strong>5</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Las que existan en RDR → <strong>publicar</strong></td></tr>
        <tr><td><strong>6</strong></td><td><span class="sbadge sbadge--g">BO</span></td><td>Las que no existan → informar la <strong>plantilla</strong> con las SDIs a dar de alta</td></tr>
        <tr><td><strong>7</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Ejecutar <strong>carga y publicación</strong> de las SDIs necesarias</td></tr>
        <tr><td><strong>8</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Publicar todas las SDIs al BO antes (o el mismo día) del simulacro</td></tr>
        <tr><td><strong>9</strong></td><td><span class="sbadge sbadge--b">RDR</span></td><td>Revisar <strong>ACK/NACK</strong>. Si todo ACK → trasladar a plantilla y versionar</td></tr>
      </tbody>
    </table>
    <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Atención a los tiempos:</strong> a veces la publicación es el día anterior, pero en ocasiones debe hacerse <strong>el mismo día</strong>. En simulacros y GoLive los tiempos van muy medidos.</div>
  </main>`));

/* 17 · DURANTE SIMULACROS */
slides.push(slide('sand', 'Durante los simulacros', 'ANEXO · MIGRACIÓN', '05 · Durante', '05 · Durante el simulacro', `
  <main>
    <p class="ante-title">Anexo · Durante el simulacro</p>
    <h1>Flujo de trabajo: durante los simulacros</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Tareas durante el simulacro</h3><ul class="slist"><li>✓ Asegurar que el <strong>eepp</strong> está correctamente levantado</li><li>✓ Verificar que el <strong>handler funciona</strong></li><li>• Si surge operación nueva → dar de alta la SDI necesaria</li><li>• <strong>Apuntar</strong> todas las SDIs dadas de alta</li><li>• <strong>Apuntar</strong> todas las publicaciones realizadas</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-mandarin);"><h3>Regla de oro</h3><p style="font-size:var(--bbva-fs-body);color:var(--bbva-electric-blue);font-weight:700;">"De nada sirve solucionar un error si no queda inventariado".</p><p style="margin-top:6px;">Cada SDI dada de alta o publicada debe quedar <strong>registrada en el momento</strong>. Si no se apunta, se pierde.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Post-simulacro inmediato (lunes):</strong> correo con resumen de SDIs — <strong>altas</strong> (a informar en la plantilla por el BO) y <strong>publicaciones</strong> (al inventario de tareas de RDR).</div>
  </main>`));

/* 18 · DESPUÉS DE SIMULACROS */
slides.push(slide('sand', 'Después de un simulacro', 'ANEXO · MIGRACIÓN', '05 · Post-simulacro', '05 · Post-simulacro', `
  <main>
    <p class="ante-title">Anexo · Post-simulacro</p>
    <h1>Flujo de trabajo: después de un simulacro</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard"><h3>Evolución esperada</h3><ul class="slist"><li>• <strong>Primer simulacro:</strong> normal que salgan más errores (técnicos: detectar gaps)</li><li>• <strong>Sucesivos:</strong> los errores se limitan, depurando la plantilla</li><li>• <strong>GoLive:</strong> foto limpia de acciones de carga</li></ul></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Acciones post-simulacro</h3><ul class="slist"><li><strong>1.</strong> BO saca listado de <strong>errores de asignación</strong></li><li><strong>2.</strong> BO analiza el <strong>tipo de error</strong></li><li><strong>3.</strong> ¿Existe en RDR? → <strong>publicar</strong> (inventariando)</li><li><strong>4.</strong> ¿No existe? → BO informa la plantilla para <strong>dar de alta</strong></li><li><strong>5.</strong> Usuario siempre consultado para la SDI correcta</li></ul></div>
    </div>
    <div class="sflow" style="margin-top:var(--bbva-space-3);">
      <div class="sbox sbox--o"><small>Simulacro N</small><b>Errores</b></div><span class="sarrow">→</span>
      <div class="sbox"><small>BO + RDR</small><b>Análisis</b></div><span class="sarrow">→</span>
      <div class="sbox" style="border-color:var(--bbva-purple);"><small>Acciones</small><b>Alta / Publ.</b></div><span class="sarrow">→</span>
      <div class="sbox sbox--d"><small>Simulacro N+1</small><b>Menos errores</b></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Objetivo final:</strong> depurar la plantilla y las SDIs a publicar hasta una <strong>foto limpia de acciones de carga al GoLive</strong>.</div>
  </main>`));

/* 19 · BO CALYPSO ERRORES */
slides.push(slide('sand', 'Calypso · errores de asignación', 'ANEXO · MIGRACIÓN', '05 · Calypso', '05 · BO Calypso', `
  <main>
    <p class="ante-title">Anexo · Calypso</p>
    <h1>BO Calypso · errores de asignación</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-2);">
      <div class="scard"><h3>Requisitos de asignación</h3><ul class="slist"><li>• Por operación se necesita <strong>SDI SUS + SDI MIS</strong></li><li>• MIS y SUS con <strong>mismo tipo de método</strong></li><li>• <strong>STP = Y</strong> permite asignación automática (sin colisión de prioridad)</li></ul></div>
      <div class="scard" style="border-top-color:var(--bbva-mandarin);"><h3>Tipos de errores</h3><ul class="slist"><li>• <strong>Más de una SDI</strong> con misma prioridad válida → no puede elegir</li><li>• <strong>No existe SDI válida</strong>, o la que hay no tiene STP / es a terceros</li><li>• <strong>No hay SDI MIS</strong> para la operación</li></ul></div>
    </div>
    <div class="sg3" style="margin-top:var(--bbva-space-2);">
      <div class="scard" style="border-top-color:var(--bbva-canary);"><h3 style="font-size:var(--bbva-fs-caption);">Colisión de prioridad</h3><p>Varias SDIs válidas con misma prioridad. Calypso no sabe cuál elegir.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-purple);"><h3 style="font-size:var(--bbva-fs-caption);">Sin SDI válida / sin STP</h3><p>No existe instrucción o la que hay no tiene flag automático.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-electric-blue);"><h3 style="font-size:var(--bbva-fs-caption);">Sin MIS (OWNENT)</h3><p>Falta la instrucción de la Processing Org para la operación.</p></div>
    </div>
  </main>`));

/* 20 · RESUMEN (midnight) */
slides.push(slide('midnight', 'Resumen', 'RESUMEN', '06 · Resumen', '06 · Resumen', `
  <main>
    <p class="ante-title" style="color:var(--bbva-canary);">Claves</p>
    <h1>Instrucciones de Liquidación en 5 ideas</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="bridge"><p class="bridge__t">1 · RDR es el maestro</p><p class="bridge__d">Suministra al BO las SDIs necesarias para que las operaciones se liquiden correctamente.</p></div>
      <div class="bridge"><p class="bridge__t">2 · MIS + SUS</p><p class="bridge__d">Cada operación necesita SDI MIS y SDI SUS con el <strong>mismo método</strong> para que Calypso la asigne.</p></div>
      <div class="bridge"><p class="bridge__t">3 · Análisis cíclico</p><p class="bridge__d">Migración/simulacro: extraer, identificar faltantes, cargar y publicar — de forma repetida.</p></div>
      <div class="bridge"><p class="bridge__t">4 · Todo se inventaría</p><p class="bridge__d">"De nada sirve solucionar un error si no queda inventariado": cada cambio se registra al momento.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);background:rgba(133,200,255,.16);border-left-color:var(--bbva-serene-blue);color:var(--bbva-sand);"><strong>5 · Decisión de negocio:</strong> qué SDI dar de alta lo decide negocio/BO. RDR da soporte técnico: carga, publicación y verificación ACK/NACK. <em>Ahora, el quiz.</em></div>
  </main>`));

/* 21 · QUIZ (final) */
slides.push(`
<section class="slide bbva-combo--sand" aria-label="Quiz de evaluación" style="min-height:100vh;">
  <header class="slide__header">
    <nav class="breadcrumb"><span>INSTRUCCIONES DE LIQUIDACIÓN</span><span class="breadcrumb__sub">QUIZ</span></nav>
    <span class="lg lg-bbva lg--blue" role="img" aria-label="BBVA"></span>
  </header>
  <main style="max-width:760px;margin:0 auto;width:100%;">
    <p class="ante-title">07 · Evaluación</p>
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
  .slist{list-style:none;font-size:var(--bbva-fs-caption);line-height:1.85;color:var(--bbva-gray-5);margin-top:6px;}
  .stable{width:100%;border-collapse:collapse;font-size:var(--bbva-fs-caption);}
  .stable th{background:var(--bbva-electric-blue);color:var(--bbva-sand);padding:9px 12px;text-align:left;font-weight:700;}
  .stable td{padding:7px 12px;border-bottom:1px solid var(--bbva-gray-2);color:var(--bbva-gray-5);vertical-align:top;}
  .stable tr:nth-child(even) td{background:var(--bbva-sand);}
  .stable td strong{color:var(--bbva-electric-blue);}
  .sbadge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;}
  .sbadge--b{background:color-mix(in srgb,var(--bbva-serene-blue) 34%,white);color:var(--bbva-electric-blue);}
  .sbadge--g{background:color-mix(in srgb,var(--bbva-lime) 34%,white);color:#1B8C13;}
  .sbadge--y{background:color-mix(in srgb,var(--bbva-canary) 40%,white);color:#8B6914;}
  .sbadge--o{background:color-mix(in srgb,var(--bbva-mandarin) 34%,white);color:#C05621;}
  .snote{background:color-mix(in srgb,var(--bbva-serene-blue) 14%,white);border-left:4px solid var(--bbva-serene-blue);border-radius:0 var(--bbva-radius-sm) var(--bbva-radius-sm) 0;padding:var(--bbva-space-2) var(--bbva-space-3);font-size:var(--bbva-fs-caption);line-height:1.55;color:var(--bbva-electric-blue);}
  .snote--warn{background:color-mix(in srgb,var(--bbva-mandarin) 15%,white);border-left-color:var(--bbva-mandarin);}
  .snote code{font-family:monospace;}
  .scode{background:var(--bbva-sand);border:1px solid var(--bbva-gray-2);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);font-family:monospace;font-size:11px;color:var(--bbva-electric-blue);line-height:1.65;overflow-x:auto;white-space:pre;}
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
  {q:"¿Qué es una SSI (Settlement Instruction)?",opts:["Una operación de trading puntual","Un mensaje SWIFT concreto","Una instrucción permanente que define cómo entregar cash o securities a una contraparte y con qué método","Un informe regulatorio mensual"],c:2,exp:"Una SSI es una instrucción permanente: define cómo liquidar (cash o securities) frente a una contraparte y mediante qué método."},
  {q:"¿Cuál es el sistema maestro de las instrucciones de liquidación en BBVA CIB?",opts:["RDR","Calypso","Datio","SWIFT"],c:0,exp:"RDR es el sistema maestro de SDIs: contiene la información para liquidar y la suministra al Back Office."},
  {q:"¿Qué combinación determina la SSI aplicable (clave funcional)?",opts:["Solo la divisa","Counterparty + Currency + Product + Asset Type","El número de operación","La fecha de trade únicamente"],c:1,exp:"La clave funcional es Contraparte + Divisa + Producto + Asset Type; determina qué SSI aplica a la operación."},
  {q:"¿Qué es la instrucción MIS (OWNENT)?",opts:["La instrucción de la contrapartida","La instrucción de la PO (Processing Org), propia de la entidad","Un tipo de mensaje SWIFT","Un método de liquidación"],c:1,exp:"MIS (OWNENT) es la instrucción de liquidación de la Processing Org: la propia de la entidad (SPAIN, MEXICO, BSI…)."},
  {q:"¿Qué es la instrucción SUS (CPARTY)?",opts:["La instrucción de la contrapartida con la que se opera","La instrucción de la Processing Org","Una SDI inactiva","La cuenta safekeeping"],c:0,exp:"SUS (CPARTY) es la SDI que corresponde a la contrapartida con la que se opera."},
  {q:"Para que una operación liquide automáticamente, deben existir…",opts:["Solo la SDI MIS","Solo la SDI SUS","SDI MIS y SDI SUS, con el mismo tipo de método de liquidación","Cualquier SDI activa, sin más"],c:2,exp:"Regla fundamental: deben existir MIS y SUS, y ambas con el mismo tipo de método de liquidación."},
  {q:"¿Qué significa STP = Y en una SSI?",opts:["Que la SSI está inactiva","Que asigna automáticamente la SDI a las operaciones (Straight-Through)","Que es una SDI a terceros","Que requiere validación manual obligatoria"],c:1,exp:"STP = Y (Straight-Through Processing) permite la asignación automática de la SDI, si no hay colisión de prioridad."},
  {q:"Según el Instruction Type, ¿cuáles son las dos grandes familias de SSI?",opts:["MIS y SUS","Activa e inactiva","CASH y SECURITY","CLS y EBA"],c:2,exp:"El Instruction Type discrimina CASH (pagos/efectivo) y SECURITY (valores), cada una con su cadena y reglas."},
  {q:"Una SSI de tipo CASH genera típicamente mensajes SWIFT…",opts:["MT540 / MT541 / MT542","MT103 / MT202","MT300","MT535"],c:1,exp:"CASH genera MT103/MT202 (transferencias de fondos). Los MT54x son de Securities."},
  {q:"El método CLS (Continuous Linked Settlement) sirve para…",opts:["Liquidación de valores en custodia","Liquidación simultánea multi-divisa para FX","Reporting regulatorio","Confirmaciones por email"],c:1,exp:"CLS es liquidación simultánea multi-divisa para FX (17 divisas principales)."},
  {q:"Los métodos EBA / TARGET2 son exclusivos para…",opts:["Divisa EUR","Divisa USD","Valores","Operativa de México"],c:0,exp:"EBA y TARGET2 son métodos exclusivos para la divisa EUR."},
  {q:"¿Qué campos definen la vigencia temporal de una SSI?",opts:["DATA_STAT_TYP únicamente","Date From / Date To","PRIORITY","INST_MNEM"],c:1,exp:"Los campos Date From / Date To definen la vigencia y permiten planificar altas/bajas futuras sin intervención manual."},
  {q:"En la cadena de participantes, ¿quién es siempre obligatorio?",opts:["El corresponsal","El intermediario","La dueña (Counterparty) y el Beneficiary","El local custodian"],c:2,exp:"La dueña (Counterparty) y el Beneficiary son siempre obligatorios; corresponsal/custodio dependen del método."},
  {q:"El Correspondent es obligatorio cuando…",opts:["Siempre","El método = CORRESPONDENT","La operación es de valores","Hay STP = N"],c:1,exp:"El banco corresponsal es obligatorio si el método de liquidación es CORRESPONDENT."},
  {q:"¿Qué es la operación de UI \"Inactivar + Nuevo\"?",opts:["Borra la SSI definitivamente","Una transacción atómica que inactiva la SSI actual y crea una nueva vinculada","Reactiva una SSI inactiva","Duplica la SSI sin cambios"],c:1,exp:"\"Inactivar + Nuevo\" es atómica: inactiva la SSI actual y crea una nueva vinculada. Se usa para cambios estructurales."},
  {q:"El estado INACTIVE de una SSI es…",opts:["Temporal y reactivable","Terminal: no reactivable","El estado por defecto al crearla","Equivalente a LOCKED"],c:1,exp:"INACTIVE es un estado terminal: no se reactiva. Para volver a operar se crea una nueva SSI."},
  {q:"En una migración, ¿quién decide qué SDI dar de alta?",opts:["RDR IT, de forma autónoma","Negocio / BO (RDR da soporte técnico)","Calypso automáticamente","El proveedor SWIFT"],c:1,exp:"La decisión es de negocio/BO. RDR IT no tiene el conocimiento ni la potestad; da soporte: carga, publicación y verificación."},
  {q:"Tras publicar las SDIs al BO, ¿qué respuesta hay que revisar?",opts:["El log de SWIFT","La respuesta ACK / NACK de Calypso","El informe EMIR","El estado LOCKED"],c:1,exp:"Tras publicar se revisa el ACK/NACK. Si todas reciben ACK, se traslada a la plantilla y se versiona."},
  {q:"¿Cuál es la \"regla de oro\" durante los simulacros?",opts:["Publicar siempre el día anterior","De nada sirve solucionar un error si no queda inventariado","Dar de alta todas las SDIs posibles","Evitar tocar las SDIs MIS"],c:1,exp:"Cada alta o publicación debe registrarse en el momento: \"de nada sirve solucionar un error si no queda inventariado\"."},
  {q:"Un error de asignación por \"colisión de prioridad\" significa que…",opts:["No existe ninguna SDI","Hay varias SDIs válidas con la misma prioridad y Calypso no puede elegir","Falta la SDI MIS","La divisa no es EUR"],c:1,exp:"La colisión de prioridad es tener varias SDIs válidas con la misma prioridad: Calypso no sabe cuál asignar."}
];

// Rebalanceo determinista de la posición de la respuesta correcta (5 por letra)
const TARGET = [2,0,3,1,1,3,0,2,3,1,2,0,0,2,1,3,2,3,0,1];
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
  const statusMsg=passed?'Enhorabuena - dominas las instrucciones de liquidación de RDR.':'Necesitas repasar. Vuelve sobre MIS/SUS, métodos y el flujo de migración, y repite el quiz.';
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
window.COURSE_ID = "form-functional-2-instrucciones-liquidacion";
window.COURSE_NAME = "Instrucciones de Liquidación";
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
