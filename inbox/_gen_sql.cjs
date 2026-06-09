/* Generador del deck TÉCNICO · SQL y PL/SQL en RDR
   Formato de las formaciones BBVA × NFQ (deck 16:9, tokens, navegación, quiz, certificado). */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'formacion', 'form-tecnico-1-tecnologias-rdr.html');
const OUT = path.join(ROOT, 'formacion', 'form-tecnico-2-sql.html');
const src = fs.readFileSync(SRC, 'utf8');

// ── Andamiaje del deck técnico ─────────────────────────────────────────────
const headEnd = src.indexOf('</head>');
const HEAD = src.slice(0, headEnd + 7)
  .replace(/<title>[\s\S]*?<\/title>/, '<title>SQL y PL/SQL en RDR · Formación BBVA × NFQ</title>');
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
const E = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slides = [];

/* 1 · PORTADA */
slides.push(`
<section class="slide bbva-combo--electric" aria-label="Portada">
  <header class="slide__header">
    <span style="font-family:var(--bbva-font-body);font-weight:700;font-size:var(--bbva-fs-label);letter-spacing:.08em;text-transform:uppercase;color:var(--bbva-serene-blue);">Formación Técnica · Nivel 02</span>
    <span class="lg lg-bbva--xl lg--white" role="img" aria-label="BBVA"></span>
  </header>
  <div style="align-self:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">RDR · BASE DE DATOS</p>
    <h1 class="bbva-hero" style="line-height:.95;">SQL y PL/SQL</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:66ch;">De los fundamentos de SQL a la programación procedural en Oracle, y cómo se usan para interrogar, extraer y mantener la "fuente de la verdad" de RDR.</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;">
      <span class="pill">SQL · DML</span><span class="pill">JOINs · CTE</span><span class="pill">PL/SQL</span><span class="pill">XMLELEMENT</span><span class="pill">Oracle 19c</span>
    </div>
  </div>
  <footer class="slide__footer">
    <span style="color:var(--bbva-serene-blue);">BBVA CIB · RDR · GoldenSource 8.7</span>
    <div class="nfq-credit"><span class="nfq-credit__label" style="color:var(--bbva-sand);">Hecho por</span><span class="lg lg-nfq-word" role="img" aria-label="NFQ"></span></div>
  </footer>
</section>`);

/* 2 · ÍNDICE */
slides.push(slide('sand', 'Índice', 'SQL Y PL/SQL', 'ÍNDICE', '01 · Índice', `
  <main>
    <p class="ante-title">Qué vas a aprender</p>
    <h1 style="margin-bottom:var(--bbva-space-3);">Recorrido</h1>
    <div class="section-index">
      <div class="section-index__item"><p class="section-index__label">01</p><p class="section-index__title">SQL · fundamentos</p></div>
      <div class="section-index__item"><p class="section-index__label">02</p><p class="section-index__title">SQL avanzado</p></div>
      <div class="section-index__item"><p class="section-index__label">03</p><p class="section-index__title">PL/SQL</p></div>
      <div class="section-index__item"><p class="section-index__label">04</p><p class="section-index__title">SQL en RDR</p></div>
      <div class="section-index__item"><p class="section-index__label">05</p><p class="section-index__title">Extracción y baja lógica</p></div>
      <div class="section-index__item"><p class="section-index__label">06</p><p class="section-index__title">PL/SQL en RDR</p></div>
      <div class="section-index__item"><p class="section-index__label">07</p><p class="section-index__title">Resumen</p></div>
    </div>
  </main>`));

/* 3 · SQL DML / CRUD */
slides.push(slide('sand', 'SQL · DML CRUD', 'SQL · FUNDAMENTOS', '01 · DML', '01 · Fundamentos SQL', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">01 · DML — Data Manipulation Language</p>
      <h1>Las sentencias CRUD</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">El DML gestiona los datos de las tablas. Cuatro sentencias básicas:</p>
      <ul class="slist" style="margin-top:var(--bbva-space-2);"><li>• <code>SELECT</code> — recupera datos</li><li>• <code>INSERT INTO</code> — añade registros</li><li>• <code>UPDATE</code> — modifica registros</li><li>• <code>DELETE</code> — elimina registros</li></ul>
      <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Cuidado:</strong> un <code>UPDATE</code> o <code>DELETE</code> <strong>sin <code>WHERE</code></strong> afecta a <strong>todas</strong> las filas de la tabla.</div>
    </div>
    <div>
      <div class="scode">${E(`SELECT nombre, salario FROM empleados;

INSERT INTO empleados (id, nombre, salario)
  VALUES (1, 'Ana Gómez', 3000);

UPDATE empleados SET salario = 3500
  WHERE id = 1;

DELETE FROM empleados WHERE id = 1;`)}</div>
      <p class="sub2" style="margin-top:var(--bbva-space-2);font-size:var(--bbva-fs-caption);"><code>WHERE</code> filtra filas (<code>=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>LIKE</code>, <code>IN</code>, <code>BETWEEN</code>) · <code>ORDER BY</code> ordena (<code>ASC</code>/<code>DESC</code>).</p>
    </div>
  </main>`));

/* 4 · JOINs */
slides.push(slide('sand', 'JOINs', 'SQL · AVANZADO', '02 · JOINs', '02 · SQL avanzado', `
  <main>
    <p class="ante-title">02 · Combinación de tablas</p>
    <h1>Tipos de JOIN</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:86ch;">Los <code>JOIN</code> relacionan tablas por columnas comunes (llaves foráneas).</p>
    <div class="sg2" style="margin-top:var(--bbva-space-2);align-items:start;">
      <table class="stable">
        <thead><tr><th>JOIN</th><th>Devuelve</th></tr></thead>
        <tbody>
          <tr><td><strong>INNER JOIN</strong></td><td>Solo filas con coincidencia en <strong>ambas</strong> tablas</td></tr>
          <tr><td><strong>LEFT JOIN</strong></td><td>Todas las de la izquierda + coincidentes de la derecha (<code>NULL</code> si no hay)</td></tr>
          <tr><td><strong>RIGHT JOIN</strong></td><td>Lo opuesto al LEFT JOIN</td></tr>
          <tr><td><strong>FULL JOIN</strong></td><td>Todos los registros de ambas, con <code>NULL</code> donde no haya coincidencia</td></tr>
          <tr><td><strong>CROSS JOIN</strong></td><td>Producto cartesiano (cada fila × todas las de la otra)</td></tr>
        </tbody>
      </table>
      <div class="scode">${E(`SELECT e.nombre,
       d.nombre_departamento
FROM empleados e
INNER JOIN departamentos d
  ON e.departamento_id = d.id;`)}</div>
    </div>
  </main>`));

/* 5 · SQL AVANZADO · CTE / INSERT SELECT / PIVOT */
slides.push(slide('sand', 'CTE, INSERT SELECT, PIVOT', 'SQL · AVANZADO', '02 · Consultas', '02 · SQL avanzado', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">02 · SQL avanzado</p>
      <h1>CTE · Common Table Expression</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">Una <strong>CTE</strong> es un resultado temporal <strong>con nombre</strong> que defines al principio con <code>WITH … AS</code> y luego usas como si fuera una tabla en la consulta principal.</p>
      <ul class="slist" style="margin-top:var(--bbva-space-2);"><li>• <strong>Legibilidad:</strong> parte una consulta compleja en pasos con nombre, de arriba abajo</li><li>• <strong>Reutilización:</strong> referencias el bloque varias veces sin repetir el subselect</li><li>• <strong>Recursividad:</strong> permite recorrer jerarquías (árbol de entidades)</li></ul>
      <div class="snote" style="margin-top:var(--bbva-space-2);">Vive solo durante esa consulta: no crea ningún objeto en la BBDD.</div>
    </div>
    <div class="scode">${E(`WITH dep_avg AS (
  SELECT dep_id,
         AVG(salario) AS prom
  FROM   empleados
  GROUP BY dep_id
)
SELECT d.nombre, a.prom
FROM   departamentos d
JOIN   dep_avg a ON a.dep_id = d.id
WHERE  a.prom > 5000;`)}</div>
  </main>`));

/* 5b · INSERT INTO SELECT */
slides.push(slide('sand', 'INSERT INTO SELECT', 'SQL · AVANZADO', '02 · INSERT SELECT', '02 · SQL avanzado', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">02 · SQL avanzado</p>
      <h1>INSERT INTO SELECT</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">En lugar de insertar fila a fila, inserta <strong>de una sola vez</strong> todas las filas que produce un <code>SELECT</code>.</p>
      <ul class="slist" style="margin-top:var(--bbva-space-2);"><li>• Una sola sentencia, basada en conjuntos: mucho más rápida que un bucle</li><li>• Las columnas del <code>SELECT</code> deben encajar, en orden y tipo, con las de la tabla destino</li><li>• Ideal para <strong>migraciones</strong>, copiar a tablas <strong>históricas</strong> o poblar tablas derivadas</li></ul>
      <div class="snote" style="margin-top:var(--bbva-space-2);">Combínalo con <code>WHERE</code> para mover solo lo que cumpla una condición (p. ej. los dados de baja).</div>
    </div>
    <div class="scode">${E(`INSERT INTO historico_empleados
       (id, nombre, fecha_baja)
SELECT id, nombre, SYSDATE
FROM   empleados
WHERE  activo = 0;`)}</div>
  </main>`));

/* 5c · PIVOT */
slides.push(slide('sand', 'PIVOT', 'SQL · AVANZADO', '02 · PIVOT', '02 · SQL avanzado', `
  <main style="display:grid;grid-template-columns:1.05fr .95fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">02 · SQL avanzado</p>
      <h1>PIVOT · de filas a columnas</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><strong>PIVOT</strong> "gira" los datos: convierte los <strong>valores de una columna en columnas nuevas</strong> y agrega a la vez. Muy útil para informes.</p>
      <div style="display:flex;align-items:center;gap:14px;margin-top:var(--bbva-space-3);flex-wrap:wrap;">
        <table class="stable" style="width:auto;font-size:11px;"><thead><tr><th>Trim</th><th>Monto</th></tr></thead><tbody><tr><td>T1</td><td>100</td></tr><tr><td>T2</td><td>150</td></tr><tr><td>T3</td><td>120</td></tr></tbody></table>
        <span style="font-size:22px;color:var(--bbva-electric-blue);font-weight:700;">→</span>
        <table class="stable" style="width:auto;font-size:11px;"><thead><tr><th>T1</th><th>T2</th><th>T3</th></tr></thead><tbody><tr><td>100</td><td>150</td><td>120</td></tr></tbody></table>
      </div>
      <p class="sub2" style="margin-top:var(--bbva-space-2);font-size:var(--bbva-fs-caption);">Eliges <strong>qué agregar</strong> (<code>SUM(monto)</code>) y <strong>qué columna se despliega</strong> en columnas (<code>FOR trimestre IN …</code>).</p>
    </div>
    <div class="scode">${E(`SELECT * FROM (
  SELECT trimestre, monto FROM ventas
)
PIVOT (
  SUM(monto)
  FOR trimestre IN (
    'T1' AS Trim_1,
    'T2' AS Trim_2,
    'T3' AS Trim_3
  )
);`)}</div>
  </main>`));

/* 6 · DE SQL A PL/SQL (introducción) */
slides.push(slide('sand', 'De SQL a PL/SQL', 'PL/SQL', '03 · Introducción', '03 · PL/SQL', `
  <main style="display:grid;grid-template-columns:1.05fr .95fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">03 · Programación procedural</p>
      <h1>De SQL a PL/SQL</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">Hasta ahora has usado <strong>SQL</strong> para lanzar sentencias sueltas (un <code>SELECT</code>, un <code>UPDATE</code>…). Pero el SQL por sí solo no sabe <strong>tomar decisiones</strong> ni <strong>repetir pasos</strong>.</p>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><strong>PL/SQL</strong> (<em>Procedural Language / SQL</em>) es la extensión de Oracle que <strong>envuelve el SQL con un lenguaje de programación</strong>: variables, condiciones (<code>IF</code>/<code>CASE</code>), bucles y manejo de errores.</p>
      <div class="sg2" style="margin-top:var(--bbva-space-3);">
        <div class="scard scard--l"><h3>SQL · declarativo</h3><p>Dices <strong>qué</strong> quieres y Oracle decide cómo obtenerlo. Una sentencia a la vez.</p></div>
        <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>PL/SQL · procedural</h3><p>Tú escribes el <strong>cómo</strong>, paso a paso: un pequeño programa que ejecuta SQL, decide y repite.</p></div>
      </div>
    </div>
    <div>
      <div class="scode">${E(`BEGIN
  SELECT salario INTO v_sal
  FROM empleados WHERE id = 101;

  IF v_sal > 5000 THEN
    DBMS_OUTPUT.PUT_LINE('Salario alto');
  ELSE
    DBMS_OUTPUT.PUT_LINE('Salario normal');
  END IF;
END;
/`)}</div>
      <div class="snote" style="margin-top:var(--bbva-space-2);">El <strong>SQL</strong> <em>obtiene</em> el dato; el <strong>PL/SQL</strong> <em>decide</em> qué hacer con él. Y se ejecuta dentro de Oracle, junto a los datos: muy rápido para lógica masiva.</div>
    </div>
  </main>`));

/* 6b · PL/SQL · BLOQUES Y OBJETOS */
slides.push(slide('sand', 'PL/SQL bloques y objetos', 'PL/SQL', '03 · Bloques', '03 · PL/SQL', `
  <main>
    <p class="ante-title">03 · Cómo se organiza el código</p>
    <h1>Bloques y objetos</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:92ch;">Todo el código PL/SQL se escribe en <strong>bloques</strong>. Un bloque puede ejecutarse al vuelo o guardarse en la base de datos como un objeto reutilizable.</p>
    <div class="sg3" style="margin-top:var(--bbva-space-3);align-items:start;">
      <div>
        <div class="scard scard--l" style="margin-bottom:8px;min-height:104px;"><h3>Estructura de un bloque</h3><p><code>DECLARE</code> (opcional) · <code>BEGIN</code> (<strong>obligatorio</strong>) · <code>EXCEPTION</code> (opcional).</p></div>
        <div class="scode">${E(`DECLARE
  v_x NUMBER;
BEGIN
  -- lógica + SQL
EXCEPTION
  WHEN OTHERS THEN ...
END;
/`)}</div>
      </div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);min-height:104px;"><h3>Anónimos vs. nominados</h3><p><strong>Anónimos:</strong> se compilan y ejecutan al vuelo; no se guardan.</p><p style="margin-top:6px;"><strong>Nominados:</strong> objetos guardados en el diccionario de la BBDD, reutilizables.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);min-height:104px;"><h3>Objetos nominados</h3><ul class="slist"><li>• <strong>PROCEDURE</strong>: ejecuta acciones</li><li>• <strong>FUNCTION</strong>: devuelve un valor (<code>RETURN</code>)</li><li>• <strong>TRIGGER</strong>: se dispara ante INSERT/UPDATE/DELETE</li><li>• <strong>PACKAGE</strong>: agrupa procedimientos, funciones y variables</li></ul></div>
    </div>
  </main>`));

/* 7 · SELECT INTO */
slides.push(slide('sand', 'SELECT INTO', 'PL/SQL', '03 · SELECT INTO', '03 · PL/SQL', `
  <main style="display:grid;grid-template-columns:.95fr 1.05fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">03 · SELECT INTO</p>
      <h1>Guardar el resultado en variables</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">En PL/SQL, cualquier <code>SELECT</code> debe volcar el resultado en variables con <code>SELECT … INTO</code>.</p>
      <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);"><strong>Regla de oro:</strong> debe devolver <strong>exactamente una fila</strong>. Si devuelve <strong>0</strong> → <code>NO_DATA_FOUND</code>; si devuelve <strong>&gt;1</strong> → <code>TOO_MANY_ROWS</code>.</div>
      <p class="sub2" style="margin-top:var(--bbva-space-2);font-size:var(--bbva-fs-caption);"><code>%TYPE</code> hereda el tipo de dato de una columna.</p>
    </div>
    <div class="scode">${E(`DECLARE
  v_nombre empleados.nombre%TYPE;
  v_salario NUMBER;
BEGIN
  SELECT nombre, salario
    INTO v_nombre, v_salario
  FROM empleados WHERE id = 101;
  DBMS_OUTPUT.PUT_LINE(v_nombre || ': ' || v_salario);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('El empleado no existe.');
END;
/`)}</div>
  </main>`));

/* 8 · CONDICIONALES */
slides.push(slide('sand', 'Condicionales PL/SQL', 'PL/SQL', '03 · Condicionales', '03 · PL/SQL', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">03 · Estructuras condicionales</p>
      <h1>IF y CASE</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);"><code>IF – THEN – ELSIF – ELSE</code> ramifica la lógica. <code>CASE</code> es excelente para evaluar múltiples valores de una misma variable.</p>
      <div class="scode" style="margin-top:var(--bbva-space-2);">${E(`v_categoria := CASE v_departamento
  WHEN 10 THEN 'IT'
  WHEN 20 THEN 'Ventas'
  ELSE 'General'
END;`)}</div>
    </div>
    <div class="scode">${E(`IF v_salario > 5000 THEN
  v_bono := 500;
ELSIF v_salario BETWEEN 3000 AND 5000 THEN
  v_bono := 300;
ELSE
  v_bono := 100;
END IF;`)}</div>
  </main>`));

/* 9 · BUCLES */
slides.push(slide('sand', 'Bucles PL/SQL', 'PL/SQL', '03 · Bucles', '03 · PL/SQL', `
  <main>
    <p class="ante-title">03 · Control de bucles</p>
    <h1>LOOP · WHILE · FOR</h1>
    <div class="sg3" style="margin-top:var(--bbva-space-2);align-items:start;">
      <div><div class="scard scard--l" style="margin-bottom:8px;"><h3>LOOP básico</h3><p>Repite hasta un <code>EXIT WHEN</code> (equivale a un <em>do-while</em>).</p></div><div class="scode">${E(`LOOP
  v_c := v_c + 1;
  EXIT WHEN v_c > 5;
END LOOP;`)}</div></div>
      <div><div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);margin-bottom:8px;"><h3>WHILE</h3><p>Evalúa la condición <strong>antes</strong> de entrar.</p></div><div class="scode">${E(`WHILE v_c <= 5 LOOP
  v_c := v_c + 1;
END LOOP;`)}</div></div>
      <div><div class="scard scard--l" style="border-left-color:var(--bbva-lime);margin-bottom:8px;"><h3>FOR (numérico / cursor)</h3><p>Cuando conoces las iteraciones o recorres un <code>SELECT</code>. El índice se declara solo.</p></div><div class="scode">${E(`FOR r IN (
  SELECT nombre FROM empleados
) LOOP
  ... r.nombre ...
END LOOP;`)}</div></div>
    </div>
  </main>`));

/* 10 · DIVIDER · SQL EN RDR (electric) */
slides.push(slide('electric', 'SQL en RDR', 'SQL EN RDR', '04 · RDR', '04 · SQL en el ecosistema RDR', `
  <main style="display:grid;place-content:center;text-align:center;">
    <p class="ante-title" style="color:var(--bbva-canary);">Parte 2</p>
    <h1 class="bbva-hero" style="font-size:clamp(34px,4.4vw,68px);line-height:1.05;">SQL en el ecosistema RDR</h1>
    <p style="font-size:var(--bbva-fs-h3);margin-top:var(--bbva-space-3);color:var(--bbva-sand);max-width:76ch;margin-inline:auto;">La BBDD no es solo almacenamiento: es el <strong>núcleo arquitectónico</strong> de RDR. SQL es el idioma con el que interrogamos, validamos y distribuimos la "fuente de la verdad".</p>
    <div style="margin-top:var(--bbva-space-4);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
      <span class="pill">GoldenSource 8.7</span><span class="pill">FT_T_*</span><span class="pill">XMLELEMENT</span><span class="pill">Baja lógica</span>
    </div>
  </main>`));

/* 11 · CENTRALIDAD BBDD */
slides.push(slide('sand', 'La centralidad de la BBDD', 'SQL EN RDR', '04 · BBDD', '04 · La BBDD en RDR', `
  <main>
    <p class="ante-title">04 · El núcleo de RDR</p>
    <h1>La centralidad de la base de datos</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:90ch;">Sobre <strong>GoldenSource 8.7</strong>, RDR hereda un modelo muy normalizado (tablas <code>FT_T_*</code>) que es la "fuente de la verdad" de activos, contrapartidas e instrucciones de BBVA CIB.</p>
    <div class="sg3" style="margin-top:var(--bbva-space-3);">
      <div class="scard"><h3>Repositorio maestro</h3><p>Centraliza información antes dispersa: p. ej. RDR pasó a ser el maestro de instrucciones de liquidación (SSI) frente a sistemas como ABACO.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Calidad y cumplimiento</h3><p>Aplica reglas de integridad y calidad regulatoria (<strong>EMIR, MiFID, DFA</strong>) para que el dato sea apto para el reporting.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Observabilidad</h3><p>Tablas de control como <code>FT_T_RLT1</code> (la "<em>streetlamp</em>") registran el pulso de los procesos batch: errores y latencias.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);">Entender RDR es entender su modelo relacional; y dominarlo pasa por dominar el SQL que lo interroga, valida y distribuye.</div>
  </main>`));

/* 12 · EXTRACCIÓN A XML */
slides.push(slide('sand', 'Extracción a XML', 'SQL EN RDR', '04 · Extracción', '04 · Extracción a XML', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">04 · El SQL construye el mensaje</p>
      <h1>Extracción y publicación a XML</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">El estándar en RDR es <strong>delegar la estructura del mensaje a Oracle</strong> en vez de transformar en Java. El SQL no solo recupera filas: <strong>construye el XML</strong> para los consumidores (Murex, Calypso, ABACO).</p>
      <ul class="slist" style="margin-top:var(--bbva-space-2);"><li>• <code>XMLELEMENT</code> — define etiquetas</li><li>• <code>XMLATTRIBUTES</code> — atributos de nodo</li><li>• <code>XMLAGG</code> — agrupa registros en un único CLOB XML</li></ul>
      <div class="snote" style="margin-top:var(--bbva-space-2);"><strong>Filtros canónicos:</strong> <code>data_stat_typ='ACTIVE'</code> y <code>data_src_id='RDR'</code>. Paginación con marcadores (<code>L_pagina&lt;N&gt;</code>) para millones de registros.</div>
    </div>
    <div class="scode">${E(`SELECT XMLELEMENT("SSI",
  XMLELEMENT("ID", sai1.alt_id),
  XMLELEMENT("Counterparty", fins.inst_nme),
  XMLELEMENT("Method", ssis.clrng_meth_typ),
  XMLELEMENT("Attributes",
    XMLATTRIBUTES(ssis.trans_dir_typ AS "Side")
  )
) AS XML_RESULT
FROM FT_T_SSIS ssis
JOIN FT_T_SAI1 sai1 ON ...
JOIN FT_T_FINS fins ON ...`)}</div>
  </main>`));

/* 13 · BATCH vs ONLINE */
slides.push(slide('sand', 'Batch vs Online', 'SQL EN RDR', '04 · Batch / Online', '04 · Batch vs Online', `
  <main>
    <p class="ante-title">04 · Arquitectura de extracción</p>
    <h1>Batch vs. Online</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Batch · Extracciones Genéricas</h3><p>Consultas pesadas sobre el planificador que generan <strong>ficheros masivos</strong> (p. ej. <code>ThirdParties.xml</code>, <code>ExtraccionContingencia.xml</code>).</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>Online · Petición/Respuesta</h3><p>Consultas dinámicas bajo demanda (REST / workflows). Se almacenan en <code>FT_CFG_QRDF</code> y usan <strong>bind variables</strong> tipadas (<code>:id_peticion</code>) — evitan inyección y optimizan el plan.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);"><strong>Validación de vigencia (Online):</strong> es crítico filtrar por timestamps para obtener la "foto" correcta:</div>
    <div class="scode" style="margin-top:8px;">${E(`WHERE (start_tms <= :fecha_proceso
   AND (end_tms IS NULL OR end_tms > :fecha_proceso))`)}</div>
  </main>`));

/* 14 · BAJA LÓGICA */
slides.push(slide('sand', 'Baja lógica', 'SQL EN RDR', '05 · Baja lógica', '05 · Baja lógica', `
  <main style="display:grid;grid-template-columns:1.05fr .95fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">05 · No se borra, se inactiva</p>
      <h1>Baja lógica</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">En RDR, en vez de <code>DELETE</code> se hacen <strong>bajas lógicas</strong>: el registro permanece en la BBDD para auditoría, pero deja de ser accesible.</p>
      <div class="snote" style="margin-top:var(--bbva-space-2);">Se marca <code>DATA_STAT_TYP='INACTIVE'</code> y <code>END_TMS=sysdate</code>.</div>
      <div class="snote snote--warn" style="margin-top:var(--bbva-space-2);">El <code>END_TMS</code> distingue: <strong>inactivos</strong> (se muestran y se pueden re-activar) frente a <strong>dados de baja</strong> (solo se mantienen por auditoría).</div>
    </div>
    <div class="scode">${E(`-- Baja lógica (no DELETE)
UPDATE FT_T_SSIS
   SET data_stat_typ = 'INACTIVE',
       end_tms       = SYSDATE
 WHERE ssi_oid = :id;`)}</div>
  </main>`));

/* 15 · PL/SQL EN RDR · CARGA MASIVA */
slides.push(slide('sand', 'PL/SQL en RDR · carga masiva', 'PL/SQL EN RDR', '06 · Cargadores', '06 · PL/SQL en RDR', `
  <main>
    <p class="ante-title">06 · Carga masiva y cargadores</p>
    <h1>PL/SQL: la lógica de negocio pesada</h1>
    <p class="sub2" style="margin-top:var(--bbva-space-1);max-width:92ch;">PL/SQL gestiona lo que el SQL simple no puede: validación, integridad y orquestación de procesos masivos. La persistencia final tras el pre-procesado en Java es PL/SQL.</p>
    <div class="sg3" style="margin-top:var(--bbva-space-3);">
      <div class="scard"><h3>Validaciones complejas</h3><p>Procedimientos como <code>PCK_SDIS_LOADER.PR_LOAD</code> ejecutan <strong>+120 validaciones</strong> antes de insertar en tablas core (<code>FT_T_SSIS</code>).</p></div>
      <div class="scard" style="border-top-color:var(--bbva-serene-blue);"><h3>Gestión de lotes</h3><p><em>Batch &amp; execute</em>: procesa miles de registros de forma <strong>atómica</strong> (INSERT/UPDATE masivo) minimizando el tráfico de red.</p></div>
      <div class="scard" style="border-top-color:var(--bbva-lime);"><h3>Tratamiento de CLOBs</h3><p>Queries largas (como la de <em>ThirdParties</em>) se ensamblan línea a línea con scripts <code>parseClob_*</code> y se guardan en <code>ACTIONS_TO_EXECUTE</code>.</p></div>
    </div>
  </main>`));

/* 16 · PL/SQL EN RDR · BATCH Y CONCILIACIÓN */
slides.push(slide('sand', 'PL/SQL en RDR · batch', 'PL/SQL EN RDR', '06 · Batch', '06 · PL/SQL en RDR', `
  <main style="display:grid;grid-template-columns:1fr 1fr;gap:var(--bbva-space-5);align-items:center;">
    <div>
      <p class="ante-title">06 · Procesos nocturnos</p>
      <h1>Batch y conciliaciones</h1>
      <p class="sub2" style="margin-top:var(--bbva-space-2);">PL/SQL es el motor de los procesos nocturnos orquestados por <strong>Control-M</strong>.</p>
    </div>
    <div style="display:grid;gap:var(--bbva-space-2);">
      <div class="scard scard--l"><h3>Conciliación y handshake</h3><p>Por la noche se reciben ficheros de otras BBDD y se concilian con RDR vía PL/SQL: <code>UPDATE</code>, <code>INSERT</code> o bajas lógicas masivas, según corresponda.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>Limpieza y purga</h3><p>Procedimientos como <code>KYTL_GC.PROC_WORKFLOW_CLEANUP</code> purgan workflows antiguos para mantener el rendimiento.</p></div>
    </div>
  </main>`));

/* 17 · PL/SQL EN RDR · INACTIVACIÓN / CICLO DE VIDA */
slides.push(slide('sand', 'PL/SQL en RDR · ciclo de vida', 'PL/SQL EN RDR', '06 · Ciclo de vida', '06 · PL/SQL en RDR', `
  <main>
    <p class="ante-title">06 · Trazabilidad y ciclo de vida</p>
    <h1>Inactivación sin perder histórico</h1>
    <div class="sg3" style="margin-top:var(--bbva-space-3);">
      <div class="scard scard--l"><h3>Patrón DENE (Inactivar + Nuevo)</h3><p>Ante cambios estructurales (p. ej. el BIC de un agente en una SSI) <strong>no se hace UPDATE in-place</strong>: una transacción atómica PL/SQL marca la antigua <code>INACTIVE</code> y crea una nueva, vinculadas con el contexto <code>REL_NEW</code>.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-serene-blue);"><h3>Inactivación en cascada</h3><p>Al dar de baja una entidad (p. ej. una <em>Enterprise</em>), PL/SQL inactiva las dependientes (libros contables, oficinas…) para garantizar la consistencia.</p></div>
      <div class="scard scard--l" style="border-left-color:var(--bbva-lime);"><h3>Crear copiando</h3><p>Se crea una entidad a partir de otra existente: PL/SQL recupera el origen, aplica los cambios y da el alta — sin empezar de cero.</p></div>
    </div>
  </main>`));

/* 18 · RESUMEN (midnight) */
slides.push(slide('midnight', 'Resumen', 'RESUMEN', '07 · Resumen', '07 · Resumen', `
  <main>
    <p class="ante-title" style="color:var(--bbva-canary);">Claves</p>
    <h1>SQL y PL/SQL en RDR, en 5 ideas</h1>
    <div class="sg2" style="margin-top:var(--bbva-space-3);">
      <div class="bridge"><p class="bridge__t">1 · SQL declarativo, PL/SQL procedural</p><p class="bridge__d">SQL dice <em>qué</em>; PL/SQL añade lógica (variables, IF/CASE, bucles) y se organiza en bloques y objetos (PROCEDURE, FUNCTION, TRIGGER, PACKAGE).</p></div>
      <div class="bridge"><p class="bridge__t">2 · La BBDD es el núcleo</p><p class="bridge__d">GoldenSource 8.7, tablas <code>FT_T_*</code>: la "fuente de la verdad". SQL la interroga, valida y distribuye.</p></div>
      <div class="bridge"><p class="bridge__t">3 · El SQL construye el XML</p><p class="bridge__d"><code>XMLELEMENT</code>/<code>XMLAGG</code> generan los mensajes; filtros canónicos <code>ACTIVE</code> + <code>data_src_id='RDR'</code>.</p></div>
      <div class="bridge"><p class="bridge__t">4 · Baja lógica, no DELETE</p><p class="bridge__d"><code>INACTIVE</code> + <code>END_TMS</code> mantienen el histórico para auditoría.</p></div>
    </div>
    <div class="snote" style="margin-top:var(--bbva-space-3);background:rgba(133,200,255,.16);border-left-color:var(--bbva-serene-blue);color:var(--bbva-sand);"><strong>5 · PL/SQL mueve lo pesado:</strong> cargadores (+120 validaciones), conciliaciones nocturnas (Control-M) y el patrón DENE (REL_NEW). <em>Ahora, el quiz.</em></div>
  </main>`));

/* 19 · QUIZ (final) */
slides.push(`
<section class="slide bbva-combo--sand" aria-label="Quiz de evaluación" style="min-height:100vh;">
  <header class="slide__header">
    <nav class="breadcrumb"><span>SQL Y PL/SQL</span><span class="breadcrumb__sub">QUIZ</span></nav>
    <span class="lg lg-bbva lg--blue" role="img" aria-label="BBVA"></span>
  </header>
  <main style="max-width:760px;margin:0 auto;width:100%;">
    <p class="ante-title">08 · Evaluación</p>
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
  .snote code{font-family:monospace;}
  .scode{background:var(--bbva-electric-blue);color:var(--bbva-sand);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);font-family:monospace;font-size:12.5px;line-height:1.55;overflow-x:auto;white-space:pre;}
  .bridge{background:rgba(255,255,255,.10);border-left:4px solid var(--bbva-serene-blue);border-radius:var(--bbva-radius-md);padding:var(--bbva-space-3);}
  .bridge__t{font-family:var(--bbva-font-display);font-weight:700;font-size:var(--bbva-fs-h3);color:var(--bbva-sand);}
  .bridge__d{font-size:var(--bbva-fs-caption);color:var(--bbva-serene-blue);margin-top:6px;}
  .bridge__d strong{color:var(--bbva-sand);}
  .bridge__d code{font-family:monospace;font-size:.85em;background:rgba(255,255,255,.14);color:var(--bbva-sand);padding:1px 5px;border-radius:5px;}
</style>`;

// ── Quiz · 25 preguntas ────────────────────────────────────────────────────
const QUES = [
  {q:"¿Qué sentencia SQL recupera datos de una tabla?",opts:["SELECT","INSERT","UPDATE","DELETE"],c:0,exp:"SELECT recupera datos. INSERT añade, UPDATE modifica y DELETE elimina registros (DML)."},
  {q:"¿Qué ocurre si ejecutas un UPDATE o DELETE sin cláusula WHERE?",opts:["Afecta a todas las filas de la tabla","Falla y no ejecuta nada por seguridad","Solo modifica la primera fila encontrada","Pide confirmación antes de aplicarse"],c:0,exp:"Sin WHERE, la operación se aplica a todas las filas. Es el error más peligroso en DML."},
  {q:"¿Qué cláusula ordena el resultado de un SELECT?",opts:["ORDER BY","GROUP BY, indicando ASC o DESC","SORT BY sobre esa columna","WHERE con el modificador DESC"],c:0,exp:"ORDER BY ordena ascendente (ASC) o descendente (DESC)."},
  {q:"¿Qué devuelve un INNER JOIN?",opts:["Solo las filas que coinciden en ambas tablas","Todas las de la izquierda y sus coincidencias","Todos los registros de ambas, con NULL","El producto cartesiano de las dos tablas"],c:0,exp:"INNER JOIN devuelve únicamente las filas que tienen coincidencia en las dos tablas."},
  {q:"¿Qué devuelve un LEFT JOIN cuando no hay coincidencia en la tabla derecha?",opts:["Rellena con NULL la parte de la derecha","Omite esas filas de la tabla izquierda","Lanza un error de integridad referencial","Duplica la fila izquierda tantas veces"],c:0,exp:"LEFT JOIN devuelve todas las filas de la izquierda; donde no hay coincidencia, las columnas de la derecha quedan a NULL."},
  {q:"¿Qué produce un CROSS JOIN?",opts:["El producto cartesiano de ambas tablas","Solo las filas con coincidencia exacta","Las filas sin pareja en ninguna tabla","Un error de sintaxis si no se indica ON"],c:0,exp:"CROSS JOIN combina cada fila de la primera tabla con todas las de la segunda (producto cartesiano)."},
  {q:"¿Qué es una CTE (WITH … AS)?",opts:["Una tabla temporal con nombre en la consulta","Un índice que acelera las búsquedas frecuentes","Un disparador asociado a una tabla concreta","Una restricción que valida datos al insertar"],c:0,exp:"Las Common Table Expressions actúan como tablas temporales dentro de la consulta; mejoran la legibilidad y permiten recursividad."},
  {q:"¿Para qué sirve INSERT INTO SELECT?",opts:["Inserta masivamente el resultado de un SELECT","Crea una tabla nueva a partir de otra","Elimina los registros duplicados de una tabla","Ordena el resultado antes de mostrarlo"],c:0,exp:"INSERT INTO SELECT inserta masivamente a partir de otra consulta; ideal para migración o históricos."},
  {q:"¿Qué hace la cláusula PIVOT?",opts:["Rota valores de una columna a columnas","Combina dos tablas por su clave foránea","Ordena el resultado de forma descendente","Valida los tipos de dato de cada columna"],c:0,exp:"PIVOT transforma valores de una columna en columnas individuales, realizando una agregación simultánea."},
  {q:"¿Cuál es la diferencia entre SQL y PL/SQL?",opts:["SQL es declarativo; PL/SQL añade lógica procedural","PL/SQL solo sirve para escribir consultas SELECT","Son el mismo lenguaje con distinto nombre comercial","SQL es de Oracle y PL/SQL es de SQL Server"],c:0,exp:"SQL declara qué datos se quieren; PL/SQL es la extensión procedural de Oracle que añade variables, bucles y condiciones."},
  {q:"¿Cuáles son las tres partes de un bloque PL/SQL?",opts:["DECLARE, BEGIN y EXCEPTION","SELECT, FROM y WHERE en ese orden","CREATE, ALTER y DROP de objetos","INPUT, PROCESS y OUTPUT por capas"],c:0,exp:"Un bloque PL/SQL consta de DECLARE (opcional), BEGIN (obligatorio) y EXCEPTION (opcional)."},
  {q:"¿Qué debe devolver obligatoriamente una FUNCTION en PL/SQL?",opts:["Un único valor mediante RETURN","Nada; solo ejecuta acciones","Una tabla completa con varias columnas","Uno o varios cursores de salida"],c:0,exp:"Una FUNCTION devuelve obligatoriamente un único valor mediante RETURN; un PROCEDURE puede no devolver nada."},
  {q:"¿Qué es un TRIGGER?",opts:["Un bloque que se dispara ante eventos","Una variable global del esquema actual","Un tipo especial de JOIN entre tablas","Un fichero de configuración del esquema"],c:0,exp:"Un trigger es un bloque que se ejecuta automáticamente ante eventos de datos (INSERT, UPDATE, DELETE)."},
  {q:"¿Qué agrupa un PACKAGE en PL/SQL?",opts:["Procedimientos, funciones y variables","Únicamente variables compartidas","Tablas, índices y secuencias juntas","Los usuarios y sus permisos de acceso a datos"],c:0,exp:"Un PACKAGE es un contenedor que agrupa procedimientos, funciones y variables relacionadas."},
  {q:"La 'regla de oro' del SELECT INTO es que debe devolver…",opts:["Exactamente una fila","Al menos una fila, sin tope","Cualquier número de filas","Como mucho diez filas por lote"],c:0,exp:"SELECT INTO debe devolver exactamente una fila."},
  {q:"Si un SELECT INTO no devuelve ninguna fila, ¿qué excepción se lanza?",opts:["NO_DATA_FOUND","TOO_MANY_ROWS al asignar","VALUE_ERROR de conversión","ZERO_DIVIDE inesperado"],c:0,exp:"Si devuelve 0 filas se lanza NO_DATA_FOUND; si devuelve más de una, TOO_MANY_ROWS."},
  {q:"Si un SELECT INTO devuelve más de una fila, ¿qué excepción se lanza?",opts:["TOO_MANY_ROWS","NO_DATA_FOUND al buscar","DUP_VAL_ON_INDEX de clave","INVALID_NUMBER al castear"],c:0,exp:"Si devuelve más de una fila se lanza TOO_MANY_ROWS."},
  {q:"¿Qué hace el atributo %TYPE en una declaración de variable?",opts:["Hereda el tipo de dato de una columna","Convierte el valor a una cadena de texto","Define una clave primaria nueva","Declara un array de tamaño fijo"],c:0,exp:"%TYPE declara la variable con el mismo tipo de dato que la columna referenciada (p. ej. empleados.nombre%TYPE)."},
  {q:"¿Qué permite el bucle FOR de cursor en PL/SQL?",opts:["Recorrer fila a fila un SELECT","Repetir siempre un número fijo de iteraciones","Esperar de forma pasiva a un evento externo","Lanzar y capturar una excepción controlada"],c:0,exp:"El FOR de cursor recorre directamente las filas de un SELECT; la variable de índice se declara automáticamente."},
  {q:"¿Sobre qué producto y tablas se construye el modelo de datos de RDR?",opts:["GoldenSource 8.7, tablas FT_T_*","SAP, con tablas de nombre Z* propias","MongoDB, con colecciones de documentos","SQL Server, con tablas del esquema dbo"],c:0,exp:"RDR está construido sobre GoldenSource 8.7 (Oracle) con un modelo muy normalizado de tablas FT_T_*."},
  {q:"¿Con qué funciones de Oracle se generan los mensajes XML desde la BBDD en RDR?",opts:["XMLELEMENT, XMLATTRIBUTES y XMLAGG","TO_XML combinado con PARSE_XML","JSON_OBJECT junto a JSON_ARRAYAGG","CONCAT y SUBSTR encadenados manualmente"],c:0,exp:"XMLELEMENT define etiquetas, XMLATTRIBUTES atributos y XMLAGG agrupa registros en un único CLOB XML."},
  {q:"¿Cuáles son los filtros canónicos de las extracciones en RDR?",opts:["data_stat_typ='ACTIVE' y data_src_id='RDR'","un ROWNUM por debajo de los cien registros","la condición WHERE 1=1, siempre cierta","un ORDER BY por id de forma descendente"],c:0,exp:"Se aplican estrictamente data_stat_typ='ACTIVE' (estado) y data_src_id='RDR' (origen) para garantizar la integridad de la extracción."},
  {q:"En la arquitectura de extracción de RDR, ¿qué distingue Batch de Online?",opts:["Batch: ficheros masivos; Online: bajo demanda","Online usa ficheros y Batch servicios REST","Son lo mismo; solo cambia la hora de ejecución diaria","Batch es en tiempo real y Online es nocturno"],c:0,exp:"Batch genera ficheros masivos (ThirdParties.xml) sobre el planificador; Online responde bajo demanda (REST/workflows) con consultas en FT_CFG_QRDF y bind variables."},
  {q:"¿Cómo se realiza una 'baja lógica' en RDR?",opts:["Con DATA_STAT_TYP='INACTIVE' y END_TMS=SYSDATE","Con un DELETE FROM sobre la tabla afectada","Truncando la tabla y recargándola después","Renombrando la fila para ocultarla del listado"],c:0,exp:"En vez de DELETE se hace baja lógica: DATA_STAT_TYP='INACTIVE' y END_TMS=SYSDATE; el registro permanece en BBDD para auditoría."},
  {q:"¿En qué consiste el patrón DENE (Inactivar + Nuevo)?",opts:["Inactiva la antigua y crea una nueva con REL_NEW","Hace un UPDATE in-place sobre el mismo registro","Borra y reinserta la fila con el mismo id","Duplica la tabla entera en una copia de respaldo"],c:0,exp:"Ante cambios estructurales no se hace UPDATE in-place: una transacción atómica PL/SQL inactiva la antigua y crea una nueva, vinculándolas con el contexto REL_NEW."}
];

// Rebalanceo determinista de la posición de la respuesta correcta (~6-7 por letra)
const TARGET = [2,0,3,1,0,2,1,3,3,1,0,2,1,3,2,0,2,0,3,1,0,2,1,3,2];
QUES.forEach((q,i)=>{ const t=TARGET[i], c=q.c; if(t!==c){ const tmp=q.opts[t]; q.opts[t]=q.opts[c]; q.opts[c]=tmp; q.c=t; } });

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
  const statusMsg=passed?'Enhorabuena - dominas SQL, PL/SQL y su uso en RDR.':'Necesitas repasar. Vuelve sobre JOINs, PL/SQL y la extracción/baja lógica en RDR, y repite el quiz.';
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
window.COURSE_ID = "form-tecnico-2-sql";
window.COURSE_NAME = "SQL y PL/SQL en RDR";
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
