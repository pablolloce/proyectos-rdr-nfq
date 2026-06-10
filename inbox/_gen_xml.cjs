/* Generador del deck TÉCNICO · XML en RDR (XML · XSD · XPath · XSLT)
   Formato de las formaciones BBVA × NFQ (deck 16:9, tokens, navegación, quiz, certificado). */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'formacion', 'form-tecnico-1-tecnologias-rdr.html');
const OUT = path.join(ROOT, 'formacion', 'form-tecnico-2-xml.html');
const src = fs.readFileSync(SRC, 'utf8');

// ── Andamiaje del deck técnico ─────────────────────────────────────────────
const headEnd = src.indexOf('</head>');
const HEAD = src.slice(0, headEnd + 7)
  .replace(/<title>[\s\S]*?<\/title>/, '<title>XML en RDR · Formación BBVA × NFQ</title>');
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
const E = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // escape para code

const slides = [];

/* 1 · PORTADA */
slides.push(`
<section class="slide bbva-combo--electric" aria-label="Portada">
  <header class="slide__header">
    <span style="font-family:var(--bbva-font-body);font-weight:700;font-size:var(--bbva-fs-label);letter-spacing:.08em;text-transform:uppercase;color:var(--bbva-serene-blue);">Formación Técnica · Nivel 02</span>
    <span class="lg lg-bbva--xl lg--white" role="img" aria-label="BBVA"></span>
  </header>
  <div style="align-self:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">RDR · TECNOLOGÍAS XML</p>
    <h1 class="bbva-hero" style="line-height:.95;">XML en RDR</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:66ch;">El ecosistema XML — <strong>XML · XSD · XPath · XSLT</strong> — explicado de cero y aplicado al motor declarativo de RDR sobre GoldenSource 8.7.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;">
      <span class="pill">XML</span><span class="pill">XSD</span><span class="pill">XPath</span><span class="pill">XSLT</span><span class="pill">FiXML · ESB</span>
    </div>
  </div>
  <footer class="slide__footer">
    <span style="color:var(--bbva-serene-blue);">BBVA CIB · RDR</span>
    <div class="nfq-credit"><span class="nfq-credit__label" style="color:var(--bbva-sand);">Hecho por</span><span class="lg lg-nfq-word" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`);

/* 2 · ÍNDICE */
slides.push(slide('sand', 'Índice', 'XML EN RDR', 'ÍNDICE', '01 · Índice', `
  <main>
    <p class="ante-title">Qué vas a aprender</p>
    <h1 style="margin-bottom:var(--bbva-space-3);">Recorrido</h1>
    <div class="section-index">
      <div class="section-index__item"><p class="section-index__label">01</p><p class="section-index__title">Qué es XML</p></div>
      <div class="section-index__item"><p class="section-index__label">02</p><p class="section-index__title">El ecosistema XML</p></div>
      <div class="section-index__item"><p class="section-index__label">03</p><p class="section-index__title">XSD · XPath · XSLT</p></div>
      <div class="section-index__item"><p class="section-index__label">04</p><p class="section-index__title">Quién es quién</p></div>
      <div class="section-index__item"><p class="section-index__label">05</p><p class="section-index__title">XML en RDR</p></div>
      <div class="section-index__item"><p class="section-index__label">06</p><p class="section-index__title">Online vs Batch</p></div>
      <div class="section-index__item"><p class="section-index__label">07</p><p class="section-index__title">Resumen</p></div>
    </div>
  </main>`));

/* 3 · ¿QUÉ ES XML? */
slides.push(slide('sand', 'Qué es XML', 'FUNDAMENTOS XML', '01 · Fundamentos', '01 · Fundamentos', `
  <main style="display:grid;grid-template-columns:1.05fr .95fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">01 · Fundamentos</p>
      <h1>¿Qué es XML?</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">XML (<em>Extensible Markup Language</em>) es un lenguaje de marcado que estructura la información en forma de <strong>árbol de nodos</strong> (etiquetas con padres e hijos). Es el <strong>contenedor de los datos</strong>: dice <em>qué</em> información tenemos.</p>
      <div class="snote" style="margin-top:var(--bbva-space-3);">Por sí solo es muy libre: puedes inventar las etiquetas que quieras. Para usarlo en entornos profesionales necesita <strong>control de calidad (XSD)</strong>, un <strong>buscador (XPath)</strong> y capacidad de <strong>transformarse (XSLT)</strong>.</div>
    </div>
    <div class="scode">${E(`<factura>
  <cliente>ACME S.A.</cliente>
  <lineas>
    <linea>
      <concepto>Licencia</concepto>
      <importe>1200</importe>
    </linea>
  </lineas>
  <total>1200</total>
</factura>`)}</div>
  </main>`));

/* 4 · EL ECOSISTEMA XML */
slides.push(slide('sand', 'El ecosistema XML', 'FUNDAMENTOS XML', '01 · Ecosistema', '01 · Ecosistema', `
  <main>
    <p class="ante-title">01 · Ecosistema</p>
    <h1 style="margin-bottom:var(--bbva-space-1);">El ecosistema XML</h1>
    <p class="sub2" style="margin-bottom:var(--bbva-space-3);max-width:84ch;">Tres tecnologías rodean al XML para hacerlo útil. Cada una responde a una pregunta distinta.</p>
    <div class="sg3">
      <div class="scard scard--l"><h3>XSD · el guardián</h3><p>El esquema que define la estructura y las reglas. Responde: <em>¿cumple este archivo las reglas?</em></p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>XPath · el GPS</h3><p>El lenguaje de consulta para navegar y seleccionar nodos. Responde: <em>¿dónde está el dato que busco?</em></p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>XSLT · el camaleón</h3><p>El motor que transforma un XML en otro formato (otro XML, JSON, CSV…). Responde: <em>¿cómo lo convierto al formato que necesita el destino?</em></p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);"><strong>La idea:</strong> XML es el contenido; XSD lo valida, XPath lo navega y XSLT lo transforma. Juntos forman el <em>motor declarativo</em> que da flexibilidad a RDR.</div>
  </main>`));

/* 5 · XSD */
slides.push(slide('sand', 'XSD el guardián', 'FUNDAMENTOS XML', '01 · XSD', '01 · XSD', `
  <main style="display:grid;grid-template-columns:1.05fr .95fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">01 · XSD — el guardián de las reglas</p>
      <h1>XSD · validación</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">El <strong>XSD</strong> (XML Schema Definition) define la gramática y las reglas que debe cumplir un XML. Sirve para <strong>validar</strong> antes de procesar.</p>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><strong>Analogía:</strong> es el plano de una casa. Si el plano dice 2 plantas, el constructor no puede hacer 4.</p>
      <ul class="slist" style="margin-top:var(--bbva-space-2);"><li>• Qué etiquetas son obligatorias u opcionales</li><li>• El orden exacto de los elementos</li><li>• El tipo de dato (<code>&lt;edad&gt;</code> entero, <code>&lt;fecha&gt;</code> AAAA-MM-DD)</li></ul>
    </div>
    <div>
      <div class="scode">${E(`<xs:element name="total"
   type="xs:decimal" minOccurs="1"/>
<xs:element name="fecha"
   type="xs:date"/>`)}</div>
      <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);">Si una factura no incluye <code>&lt;total&gt;</code>, el validador XSD <strong>rechaza el archivo</strong> inmediatamente, evitando que el sistema falle más adelante.</div>
    </div>
  </main>`));

/* 6 · XPath */
slides.push(slide('sand', 'XPath el GPS', 'FUNDAMENTOS XML', '01 · XPath', '01 · XPath', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">01 · XPath — el GPS del XML</p>
      <h1>XPath · navegación</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">XML es un árbol; cuando es enorme, encontrar un dato es difícil. <strong>XPath</strong> es el lenguaje de consultas para <strong>navegar y seleccionar</strong> fragmentos sin recorrerlo a mano.</p>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><strong>Analogía:</strong> es como la ruta de carpetas de tu ordenador (<code>C:/Usuarios/Documentos/archivo.pdf</code>), pero entre etiquetas XML.</p>
    </div>
    <div>
      <div class="scode">/catalogo/libro/autor

/catalogo/libro[precio &lt; 20]

//usuario[@id='123']</div>
      <ul class="slist" style="margin-top:var(--bbva-space-2);"><li>• <strong>Ruta directa</strong> a un nodo</li><li>• <strong>Predicados</strong>: "libros que cuesten menos de 20€"</li><li>• <strong>Atributos</strong>: <code>@id='123'</code></li></ul>
    </div>
  </main>`));

/* 7 · XSLT */
slides.push(slide('sand', 'XSLT el camaleón', 'FUNDAMENTOS XML', '01 · XSLT', '01 · XSLT', `
  <main style="display:grid;grid-template-columns:1.05fr .95fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">01 · XSLT — el camaleón</p>
      <h1>XSLT · transformación</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><strong>XSLT</strong> transforma un documento XML en <strong>otro formato</strong> y puede <strong>reordenar o modificar su contenido</strong>. La salida puede ser otro XML, pero también <strong>JSON, CSV</strong>, texto u HTML. Es la clave de la <strong>interoperabilidad</strong>.</p>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><strong>Analogía:</strong> es un traductor — reescribe la información con otra estructura y vocabulario.</p>
      <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>En RDR</strong> se usa principalmente para <strong>re-estructurar el XML a otro sistema de etiquetas</strong>: el formato que necesita cada sistema destino. Vive de <strong>XPath</strong>, que usa para apuntar a los datos a transformar.</div>
    </div>
    <div class="scode">${E(`<xsl:template match="contrapartida">
  <party>
    <xsl:value-of select="nombre"/>
  </party>
</xsl:template>`)}</div>
  </main>`));

/* 8 · QUIÉN ES QUIÉN */
slides.push(slide('sand', 'Quién es quién', 'FUNDAMENTOS XML', '01 · Resumen', '01 · Quién es quién', `
  <main>
    <p class="ante-title">01 · Quién es quién</p>
    <h1>Las cuatro piezas, de un vistazo</h1>
    <table class="stable" style="margin-top:var(--bbva-space-3);">
      <thead><tr><th>Tecnología</th><th>¿Qué es en una frase?</th><th>Pregunta a la que responde</th><th>Equivalente en JSON</th></tr></thead>
      <tbody>
        <tr><td><strong>XML</strong></td><td>El contenedor de los datos</td><td>¿Qué información tenemos?</td><td>JSON plano</td></tr>
        <tr><td><strong>XSD</strong></td><td>El validador y esquema</td><td>¿Cumple este archivo las reglas?</td><td>JSON Schema</td></tr>
        <tr><td><strong>XPath</strong></td><td>El buscador / navegador</td><td>¿Dónde está el dato que busco?</td><td>JSONPath</td></tr>
        <tr><td><strong>XSLT</strong></td><td>El transformador de formato</td><td>¿Cómo convierto este XML a otro formato?</td><td>JOLT / scripts de mapeo</td></tr>
      </tbody>
    </table>
    <div class="snote" style="margin-top:var(--bbva-space-3);">Estas cuatro tecnologías no son solo formatos de datos: son el <strong>motor declarativo</strong> que permite la flexibilidad de GoldenSource 8.7 en BBVA.</div>
  </main>`));

/* 9 · DIVIDER · XML EN RDR (electric) */
slides.push(slide('electric', 'XML en RDR', 'XML EN RDR', '02 · RDR', '02 · XML en el ecosistema RDR', `
  <main style="display:grid;place-content:center;text-align:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">Parte 2</p>
    <h1 class="bbva-hero" style="font-size:clamp(34px,4.4vw,68px);line-height:1.05;">XML en el ecosistema RDR</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:74ch;margin-inline:auto;">El lenguaje fundamental de interoperabilidad de RDR: comunica el repositorio maestro con <strong>más de 40 sistemas consumidores</strong> y múltiples proveedores de mercado.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
      <span class="pill">Queries .sql</span><span class="pill">FiXML · ESB</span><span class="pill">servicesRDR</span><span class="pill">Control-M</span>
    </div>
  </main>`));

/* 10 · XML EN RDR */
slides.push(slide('sand', 'XML en RDR', 'XML EN RDR', '02 · XML', '02 · XML en RDR', `
  <main>
    <p class="ante-title">02 · XML — definición, extracción y mensajería</p>
    <h1>XML: configurar, extraer y mensajear</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:92ch;">En RDR, XML es el estándar para la configuración y para extraer datos de la BBDD y generar los mensajes que se publican a los consumidores.</p>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Configuración (GoldenSource)</h3><ul class="slist"><li>• <strong>Interfaz (Workstation)</strong>: las pantallas (SpeedScreens) y la lógica (Models) se definen en XML</li><li>• <strong>Workflows</strong>: pequeños programas integrados en la aplicación que reciben mensajes e introducen lógica (<code>if</code>, bucles…). Usan mucho <strong>XPath</strong> para extraer datos de una petición o ACK y, según el valor, ejecutar unas u otras acciones sobre la BBDD</li><li>• <strong>Filtros de carga</strong>: <code>ILQ_Filter.xml</code> define qué registros procesar o descartar en batch</li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>Extracción de datos → mensajes XML</h3><ul class="slist"><li>• Las <strong>queries</strong> (ficheros <code>.sql</code>) y las <strong>Extracciones Genéricas</strong> sacan datos de Oracle (<code>FT_T_*</code>) con <code>XMLELEMENT</code> y <code>XMLAGG</code>, generando mensajes <strong>XML</strong></li><li>• <strong>Queries de GoldenSource → Online</strong>: publicación y petición/respuesta</li><li>• <strong>Extracciones Genéricas → Batch</strong>: información en masa</li></ul></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);"><strong>Mismo origen, distinta salida:</strong> en ambos casos la información se saca en <strong>XML</strong> y luego se transforma si hace falta — en <strong>Online</strong> a <strong>FiXML</strong> (estándar para mercados financieros, viaja encriptado por el ESB KYRS) y en <strong>Batch</strong> al formato que necesita cada consumidor.</div>
  </main>`));

/* 11 · XSLT EN RDR */
slides.push(slide('sand', 'XSLT en RDR', 'XML EN RDR', '02 · XSLT', '02 · XSLT en RDR', `
  <main>
    <p class="ante-title">02 · XSLT — el motor de transformación</p>
    <h1>XSLT: adaptar el dato a cada consumidor</h1>
    <div class="sg3" style="margin-top:var(--bbva-space-3);">
      <div class="scard"><h3>Re-estructuración a cada sistema</h3><p>Re-estructura el XML maestro de GoldenSource al <strong>sistema de etiquetas</strong> que requiere cada consumidor (<strong>ABACO, Murex, Calypso</strong>) o el reporting regulatorio.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Pipeline servicesRDR</h3><p>En el framework de servicios síncronos, extrae dinámicamente el <strong>nombre de la query y sus parámetros</strong> a partir del mensaje de entrada.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Mapping</h3><p>Dualidad: los ficheros de mapeo <code>.mfl</code> definen la estructura y el XSLT define la <strong>salida final</strong> hacia vendors o clientes (p. ej. cestas al formato <strong>DUCO</strong>).</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);">XSLT no vive sin XPath: usa expresiones XPath para apuntar a los datos a transformar.</div>
  </main>`));

/* 12 · XSD EN RDR */
slides.push(slide('sand', 'XSD en RDR', 'XML EN RDR', '02 · XSD', '02 · XSD en RDR', `
  <main>
    <p class="ante-title">02 · XSD — contratos de datos</p>
    <h1>XSD: el contrato con cada consumidor</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:94ch;"><strong>Cada XML que se mueve en RDR tiene su XSD asociado.</strong> Es la forma de entenderse con los consumidores: cada mensaje pasa un XSD que valida que el formato es correcto.</p>
    <div class="sg3" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Un XSD por cada mensaje</h3><ul class="slist"><li>• XSD por cada <strong>petición</strong> que nos hacen</li><li>• XSD por cada <strong>respuesta</strong> que damos</li><li>• XSD para la <strong>publicación</strong></li><li>• XSD que valida las <strong>Extracciones Genéricas</strong></li></ul></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>Recursos compartidos · online y batch</h3><p>La mayoría de los XSD son <strong>recursos</strong> de RDR — igual que los XSLT — y se ejecutan tanto en la parte <strong>Online</strong> como en la <strong>Batch</strong>.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-mandarin);"><h3>Sin XSD, caos</h3><p>Cada mensaje que se genera o consume valida su formato. En Batch, <code>RDR_GenericValidatorXSD.jar</code> es el gate en Control-M: si un fichero no cumple, el proceso se detiene antes de distribuir.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);">Sin esa validación común, cualquier cambio de formato rompería a los +40 consumidores. El XSD es lo que mantiene el orden.</div>
  </main>`));

/* 13 · XPath EN RDR */
slides.push(slide('sand', 'XPath en RDR', 'XML EN RDR', '02 · XPath', '02 · XPath en RDR', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">02 · XPath — localización y reglas</p>
      <h1>XPath: navegar dentro de los componentes</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">XPath es la herramienta de navegación que se usa <strong>dentro</strong> de los demás componentes: <strong>workflows</strong>, XSLT, Models y enrutado del ESB.</p>
    </div>
    <div class="sg2" style="grid-template-columns:1fr;gap:var(--bbva-space-2);">
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>En los workflows</h3><p>Los workflows lo usan mucho: extraen datos de una <strong>petición o ACK</strong> recibido y, según el valor, deciden qué <strong>acciones ejecutar sobre la BBDD</strong>.</p></div>
      <div class="scard scard--l"><h3>Validaciones en Models</h3><p>Dentro de los <code>model_*.xml</code> se usa XPath para definir <strong>reglas de validación complejas</strong> sobre los campos de las pantallas.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>Extracción y enrutado</h3><p>Localiza nodos en mensajes complejos (los <strong>FiXML</strong> de la ESB) para procesarlos o enrutarlos — p. ej. separar una consulta de <em>ratings</em> de una de <em>contrapartidas</em>.</p></div>
    </div>
  </main>`));

/* 14 · ONLINE vs BATCH */
slides.push(slide('sand', 'Online vs Batch', 'XML EN RDR', '03 · Online / Batch', '03 · Online vs Batch', `
  <main>
    <p class="ante-title">03 · Dónde importa cada tecnología</p>
    <h1>Online vs. Batch</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Online — tiempo real · FiXML + XSD</h3><ul class="slist"><li>• Las <strong>queries de GoldenSource</strong> sacan los datos en XML para <strong>publicación y petición/respuesta</strong>; salen al bus <strong>ESB KYRS</strong> como <strong>FiXML</strong> encriptado (ABACO, Murex al instante)</li><li>• <strong>XSD</strong>: validación mandatoria de entrada/salida en milisegundos</li><li>• <strong>XSLT</strong> (servicesRDR): respuestas síncronas rápidas</li><li>• <strong>XPath</strong>: enrutado del ESB por tipo de mensaje</li></ul><p style="margin-top:8px;color:var(--bbva-electric-blue);font-weight:700;">Garantiza disponibilidad y validez de datos para trading y riesgos.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>Batch — por lotes · XML + XSLT</h3><ul class="slist"><li>• Las <strong>Extracciones Genéricas</strong> sacan grandes volúmenes en XML (p. ej. <code>ThirdParties.xml</code>), vía DataX / SFTP</li><li>• <strong>XSLT</strong>: conversión al formato de cada consumidor (Murex, Calypso, DUCO)</li><li>• <strong>XSD</strong>: <code>RDR_GenericValidatorXSD.jar</code> como gate en Control-M</li><li>• <strong>XPath</strong>: validar completitud en extracciones (<code>RDR_Extraction_CPARTYS.jar</code>)</li></ul><p style="margin-top:8px;color:var(--bbva-electric-blue);font-weight:700;">Distribución masiva y personalizada a +40 aplicaciones al día.</p></div>
    </div>
  </main>`));

/* 15 · RESUMEN APLICACIÓN POR ÁREAS */
slides.push(slide('sand', 'Aplicación por áreas', 'XML EN RDR', '03 · Aplicación', '03 · Aplicación por áreas', `
  <main>
    <p class="ante-title">03 · Mapa de uso</p>
    <h1>Cada tecnología, su papel en RDR</h1>
    <table class="stable" style="margin-top:var(--bbva-space-3);">
      <thead><tr><th style="width:18%">Tecnología</th><th>Uso principal en RDR</th></tr></thead>
      <tbody>
        <tr><td><strong>XML</strong></td><td>Configuración (Models, SpeedScreens), extracción de datos a XML (queries .sql y Extracciones Genéricas) y mensajería FiXML</td></tr>
        <tr><td><strong>XSLT</strong></td><td>Adaptación de formatos para los consumidores (ABACO, Murex, Calypso, DUCO)</td></tr>
        <tr><td><strong>XSD</strong></td><td>Contrato de datos: cada mensaje (petición, respuesta, publicación, extracción) valida su formato — online y batch</td></tr>
        <tr><td><strong>XPath</strong></td><td>Generación/navegación de mensajes, reglas de validación en pantallas y enrutado ESB</td></tr>
      </tbody>
    </table>
    <div class="snote" style="margin-top:var(--bbva-space-3);">Juntas hacen del repositorio maestro un sistema <strong>interoperable</strong>: el mismo dato, validado y traducido al idioma de cada uno de los +40 consumidores.</div>
  </main>`));

/* 16 · RESUMEN (midnight) */
slides.push(slide('midnight', 'Resumen', 'RESUMEN', '04 · Resumen', '04 · Resumen', `
  <main>
    <p class="ante-title" style="color:var(--bbva-canary);">Claves</p>
    <h1>XML en RDR, en 5 ideas</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="bridge"><p class="bridge__t">1 · XML es el contenido</p><p class="bridge__d">Estructura los datos en árbol. En RDR: configuración (Models, UI), extracción de datos a XML (queries <code>.sql</code> y Extracciones Genéricas) y mensajería FiXML.</p></div>
      <div class="bridge"><p class="bridge__t">2 · XSD valida</p><p class="bridge__d">Cada XML tiene su XSD: el contrato con cada consumidor. Valida petición, respuesta, publicación y extracción — online y batch. Sin él, caos.</p></div>
      <div class="bridge"><p class="bridge__t">3 · XPath navega</p><p class="bridge__d">Localiza nodos. En RDR: reglas en <code>model_*.xml</code> y enrutado de mensajes ESB.</p></div>
      <div class="bridge"><p class="bridge__t">4 · XSLT transforma</p><p class="bridge__d">De un XML a otro XML con distinto etiquetado: el que necesita cada consumidor (ABACO, Murex, Calypso…).</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);background:rgba(133,200,255,.16);border-left-color:var(--bbva-serene-blue);color:var(--bbva-sand);"><strong>5 · Online vs Batch:</strong> FiXML + XSD para tiempo real (trading/riesgos); XML + XSLT para distribución masiva a +40 sistemas. <em>Ahora, el quiz.</em></div>
  </main>`));

/* 17 · QUIZ (final) */
slides.push(`
<section class="slide bbva-combo--sand" aria-label="Quiz de evaluación" style="min-height:100vh;">
  <header class="slide__header">
    <nav class="breadcrumb"><span>XML EN RDR</span><span class="breadcrumb__sub">QUIZ</span></nav>
    <span class="lg lg-bbva lg--blue" role="img" aria-label="BBVA"></span>
  </header>
  <main style="max-width:760px;margin:0 auto;width:100%;">
    <p class="ante-title">05 · Evaluación</p>
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
    <span>05 · Quiz</span>
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
  .sub2 code,.slist code,.snote code,.scard code,.stable code{font-family:monospace;font-size:.85em;background:color-mix(in srgb,var(--bbva-electric-blue) 9%,white);color:var(--bbva-electric-blue);padding:1px 5px;border-radius:5px;}
  .pill{display:inline-block;background:rgba(133,200,255,.15);border:1px solid rgba(133,200,255,.4);border-radius:20px;padding:6px 14px;font-size:12px;color:var(--bbva-serene-blue);}
  .sg2{display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-3);}
  .sg3{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bbva-space-2);}
  .scard{background:var(--bbva-white);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);border-top:3px solid var(--bbva-serene-blue);box-shadow:0 2px 12px rgba(0,0,0,.06);}
  .scard h3{font-size:var(--bbva-fs-body);font-weight:700;color:var(--bbva-electric-blue);margin-bottom:6px;}
  .scard p{font-size:var(--bbva-fs-caption);line-height:1.55;color:var(--bbva-gray-5);}
  .scard--l{border-top:none;border-left:4px solid var(--bbva-electric-blue);}
  .slist{list-style:none;font-size:var(--bbva-fs-caption);line-height:1.85;color:var(--bbva-gray-5);margin-top:6px;}
  .stable{width:100%;border-collapse:collapse;font-size:var(--bbva-fs-caption);}
  .stable th{background:var(--bbva-electric-blue);color:var(--bbva-sand);padding:9px 12px;text-align:left;font-weight:700;}
  .stable td{padding:8px 12px;border-bottom:1px solid var(--bbva-gray-2);color:var(--bbva-gray-5);vertical-align:top;}
  .stable tr:nth-child(even) td{background:var(--bbva-sand);}
  .stable td strong{color:var(--bbva-electric-blue);}
  .snote{background:color-mix(in srgb,var(--bbva-serene-blue) 14%,white);border-left:4px solid var(--bbva-serene-blue);border-radius:0 var(--bbva-radius-sm) var(--bbva-radius-sm) 0;padding:var(--bbva-space-2) var(--bbva-space-3);font-size:var(--bbva-fs-caption);line-height:1.55;color:var(--bbva-electric-blue);}
  .snote--warn{background:color-mix(in srgb,var(--bbva-mandarin) 15%,white);border-left-color:var(--bbva-mandarin);}
  .bbva-combo--serene .scard{background:var(--bbva-white);}
  .bbva-combo--serene .snote{background:rgba(255,255,255,.55);}
  .scode{background:var(--bbva-electric-blue);color:var(--bbva-sand);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);font-family:monospace;font-size:13px;line-height:1.65;overflow-x:auto;white-space:pre;}
  .scode .k{color:var(--bbva-canary);}
  .bridge{background:rgba(255,255,255,.10);border-left:4px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);}
  .bridge__t{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-h3);color:var(--bbva-sand);}
  .bridge__d{font-size:var(--bbva-fs-caption);color:var(--bbva-serene-blue);margin-top:6px;}
  .bridge__d strong{color:var(--bbva-sand);}
  .bridge__d code{font-family:monospace;font-size:.85em;background:rgba(255,255,255,.14);color:var(--bbva-sand);padding:1px 5px;border-radius:5px;}
</style>`;

// ── Quiz · 20 preguntas ────────────────────────────────────────────────────
const QUES = [
  {q:"¿Qué es XML?",opts:["Un lenguaje de marcado en árbol de nodos","Un motor de base de datos relacional como Oracle","Un lenguaje de programación procedural","Un protocolo de transporte en red"],c:0,exp:"XML estructura la información en forma de árbol de etiquetas. Responde a '¿qué información tenemos?': es el contenedor de los datos."},
  {q:"¿Cuál es la función principal de un XSD?",opts:["Define la estructura y valida el XML","Transforma el XML a otro formato distinto","Navega y selecciona nodos del documento","Cifra el contenido del mensaje al enviarlo"],c:0,exp:"XSD (XML Schema Definition) define la gramática/reglas y valida que el XML las cumpla. Responde: '¿cumple este archivo las reglas?'."},
  {q:"¿Para qué sirve XPath?",opts:["Navegar y seleccionar nodos del XML","Validar los tipos de dato del documento","Transformar el XML a una página HTML","Comprimir el archivo para enviarlo"],c:0,exp:"XPath es el lenguaje de consultas para navegar el árbol y seleccionar nodos. Responde: '¿dónde está el dato que busco?'."},
  {q:"¿Qué hace XSLT?",opts:["Transforma un XML en otro formato distinto","Define el esquema de validación del documento","Almacena los documentos XML en disco","Enruta los paquetes por la red"],c:0,exp:"XSLT transforma el XML en otro formato (otro XML, JSON, CSV…) y puede modificar su contenido. En RDR se usa sobre todo para re-estructurar el XML a otro sistema de etiquetas."},
  {q:"¿Qué puede definir un XSD sobre un documento XML?",opts:["Qué etiquetas son obligatorias, su orden y su tipo","El color y la fuente con que se mostrará en pantalla","La ruta de red por la que viajará el documento","El usuario con permiso para leer el archivo"],c:0,exp:"Un XSD define qué etiquetas son obligatorias u opcionales, el orden exacto de los elementos y el tipo de dato de cada uno (p. ej. que <fecha> siga AAAA-MM-DD)."},
  {q:"¿Con qué se generan los mensajes XML a partir de los datos de Oracle en RDR?",opts:["Con XMLELEMENT y XMLAGG (SQL/XML)","Con hojas de estilo XSLT aplicadas al vuelo","Con un esquema XSD de generación","Escribiéndolos a mano, uno por uno"],c:0,exp:"Las queries (.sql) y las Extracciones Genéricas usan funciones SQL/XML como XMLELEMENT y XMLAGG para extraer los datos de Oracle (FT_T_*) y formar los mensajes XML."},
  {q:"¿Qué selecciona la expresión XPath /catalogo/libro[precio < 20]?",opts:["Los libros que cuestan menos de 20","Todos los libros del catálogo entero","El primer libro de la lista de precios","Solo el atributo precio de cada libro"],c:0,exp:"El predicado [precio < 20] filtra: devuelve solo los libros que cuestan menos de 20."},
  {q:"¿Qué busca //usuario[@id='123']?",opts:["El usuario con el atributo id '123'","Todos los usuarios del documento XML","El elemento hijo número 123 del nodo","La ruta absoluta /usuario/123 exacta"],c:0,exp:"@id apunta a un atributo: selecciona el usuario con atributo id igual a '123'."},
  {q:"¿De qué tecnología depende XSLT para apuntar a los datos?",opts:["XPath","XSD","JSON","SQL"],c:0,exp:"XSLT usa expresiones XPath para localizar los datos del XML original que va a transformar o reordenar."},
  {q:"Si un XML de factura no incluye la etiqueta <total>, el XSD…",opts:["Rechaza el archivo al validar","La crea con un valor por defecto","La ignora y continúa procesando","La convierte automáticamente a otro tipo"],c:0,exp:"El validador XSD rechaza el archivo inmediatamente, evitando que el sistema falle más adelante."},
  {q:"En RDR, ¿qué da servicio Online (publicación y petición/respuesta) y qué da servicio Batch (extracción masiva)?",opts:["Online: queries · Batch: extracciones","Online: Extracciones Genéricas · Batch: queries","Ambos usan exactamente las mismas queries","Online: FiXML · Batch: ficheros CSV"],c:0,exp:"Las queries de GoldenSource dan servicio Online; las Extracciones Genéricas dan servicio Batch. En ambos casos la salida es XML, que luego se transforma si hace falta (Online a FiXML, Batch al formato de cada consumidor)."},
  {q:"¿Cómo se definen las pantallas (SpeedScreens) y la lógica (Models) de Workstation?",opts:["En XML","En sentencias SQL","En Java ya compilado","En documentos JSON"],c:0,exp:"Las pantallas (SpeedScreens) y los Models se definen íntegramente en archivos XML."},
  {q:"¿Qué formato XML usa la mensajería del bus corporativo (ESB KYRS)?",opts:["FiXML, un estándar XML financiero","SOAP sobre HTTP con un contrato WSDL","HTML embebido en el cuerpo del mensaje","CSV delimitado por punto y coma"],c:0,exp:"La integración con el ESB (UUAA KYRS) usa mensajes FiXML, que viajan encriptados."},
  {q:"¿Para qué se usa principalmente XSLT en RDR?",opts:["Para adaptar el dato a cada consumidor","Para validar la entrada de los mensajes recibidos","Para almacenar los datos en Oracle","Para definir las pantallas de la UI"],c:0,exp:"XSLT adapta los datos maestros de GoldenSource a los formatos requeridos por cada consumidor (ABACO, Murex, Calypso)."},
  {q:"¿Qué relación tienen los mensajes XML de RDR con los XSD?",opts:["Cada XML que se mueve en RDR tiene su XSD","Solo las extracciones batch usan un XSD","Los XSD se usan únicamente en desarrollo","El XSD reemplaza por completo al XSLT"],c:0,exp:"Cada XML —cada petición, respuesta, publicación y extracción— tiene su XSD asociado: es la forma de entenderse con los consumidores. Sin esa validación común sería un caos."},
  {q:"Dentro de los model_*.xml, ¿para qué se usa XPath?",opts:["Para validar los campos de las pantallas","Para transformar el XML a una página HTML","Para abrir la conexión con Oracle","Para cifrar los datos sensibles"],c:0,exp:"En los Models, XPath define reglas de validación complejas sobre los campos de las pantallas."},
  {q:"¿Qué tipo de operativa da el servicio Online de RDR?",opts:["Publicación y petición/respuesta en vivo","Extracción masiva nocturna en ficheros grandes","Copias de seguridad de la base de datos","Compilación de los Models al desplegar"],c:0,exp:"El servicio Online da publicación y petición/respuesta en tiempo real; los mensajes salen al bus ESB KYRS en FiXML encriptado — crítico para trading y riesgos."},
  {q:"En el servicio Batch, ¿cómo se distribuyen las extracciones masivas a los consumidores?",opts:["Vía DataX / SFTP","En tiempo real por el bus ESB","Por una API REST síncrona","No se distribuyen; se consultan online"],c:0,exp:"Las Extracciones Genéricas (p. ej. ThirdParties.xml) se generan en XML y se distribuyen a los +40 consumidores vía DataX / SFTP."},
  {q:"En ambos servicios (Online y Batch), ¿en qué formato se saca primero la información de la BBDD?",opts:["En XML, que luego se transforma si hace falta","Directamente en el formato de cada consumidor","En binario comprimido para ahorrar espacio","En texto plano, sin ninguna estructura"],c:0,exp:"En ambos casos la información se saca primero en XML; luego se transforma si hace falta — Online a FiXML, Batch al formato de cada consumidor."},
  {q:"¿Con cuántos sistemas consumidores se comunica RDR mediante estas tecnologías?",opts:["Más de 40","Menos de 5","Alrededor de 10","Exactamente 2"],c:0,exp:"XML/XSLT/XSD/XPath permiten que el repositorio maestro se comunique con más de 40 sistemas consumidores."}
];

// Rebalanceo determinista de la posición de la respuesta correcta (5 por letra)
const TARGET = [0,3,1,2,2,0,3,1,1,3,0,2,3,0,1,2,2,0,1,3];
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
  const statusMsg=passed?'Enhorabuena - dominas el ecosistema XML y su uso en RDR.':'Necesitas repasar. Vuelve sobre XSD/XPath/XSLT y su uso en RDR, y repite el quiz.';
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
window.COURSE_ID = "form-tecnico-2-xml";
window.COURSE_NAME = "XML en RDR";
window.COURSE_TAG = "Técnico";
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
