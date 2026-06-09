# **SQL Y PL/SQL**

¡Bienvenido a la **Formación Estándar de SQL y PL/SQL**\! Este itinerario está diseñado para llevarte desde los fundamentos de la manipulación de datos hasta la programación procedural avanzada en bases de datos (orientado principalmente a Oracle, el estándar para PL/SQL).

## **Módulo 1: Fundamentos de SQL (Sentencias Básicas)**

El lenguaje SQL (Structured Query Language) se divide en varias capas. Aquí nos enfocaremos en el **DML** (Data Manipulation Language), que sirve para gestionar los datos de las tablas.

### **1.1. Sentencias CRUD Básicas**

* **`SELECT`**: Recupera datos de la base de datos.

```sql
SELECT nombre, salario FROM empleados;
```

* **`INSERT INTO`**: Añade nuevos registros.

```sql
INSERT INTO empleados (id, nombre, salario) VALUES (1, 'Ana Gómez', 3000);
```

* **`UPDATE`**: Modifica registros existentes. *¡Cuidado sin el WHERE\!*

```sql
UPDATE empleados SET salario = 3500 WHERE id = 1;
```

* **`DELETE`**: Elimina registros.

```sql
DELETE FROM empleados WHERE id = 1;
```

### **1.2. Filtrado y Ordenación**

* **`WHERE`**: Restringe las filas devueltas (operadores `>`, `<`, `=`, `LIKE`, `IN`, `BETWEEN`).  
* **`ORDER BY`**: Ordena el resultado de forma ascendente (`ASC`) o descendente (`DESC`).

## **Módulo 2: SQL Avanzado y Consultas Complejas**

Cuando una sola tabla no es suficiente y los datos requieren transformaciones analíticas, recurrimos a herramientas avanzadas.

### **2.1. Tipos de JOIN (Combinación de Tablas)**

Los `JOIN` permiten relacionar tablas mediante columnas comunes (llaves foráneas).

* **`INNER JOIN`**: Devuelve solo las filas donde hay una coincidencia en ambas tablas.  
* **`LEFT JOIN` (o Left Outer)**: Devuelve todas las filas de la tabla izquierda y las coincidentes de la derecha (si no hay coincidencia, llena con `NULL`).  
* **`RIGHT JOIN`**: Lo opuesto al LEFT JOIN.  
* **`FULL JOIN`**: Devuelve todos los registros de ambas tablas, rellenando con `NULL` donde no haya coincidencia.  
* **`CROSS JOIN`**: Producto cartesiano (combina cada fila de la primera tabla con todas las de la segunda).

```sql
SELECT e.nombre, d.nombre_departamento
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id;
```

### **2.2. CTEs (`WITH ... AS`)**

Las **Common Table Expressions** (CTEs) actúan como tablas temporales dentro de la misma consulta. Mejoran drásticamente la legibilidad y permiten recursividad.

```sql
WITH SalariosAltos AS (
    SELECT departamento_id, AVG(salario) AS promedio
    FROM empleados
    GROUP BY departamento_id
)
SELECT d.nombre_departamento, s.promedio
FROM departamentos d
JOIN SalariosAltos s ON d.id = s.departamento_id
WHERE s.promedio > 5000;
```

### **2.3. `INSERT INTO SELECT`**

Permite realizar inserciones masivas de datos basándose en el resultado de otra consulta. Es ideal para procesos de migración o históricos.

```sql
INSERT INTO historico_empleados (id, nombre, fecha_baja)
SELECT id, nombre, SYSDATE 
FROM empleados 
WHERE activo = 0;
```

### **2.4. `PIVOT` (Rotación de filas a columnas)**

La cláusula `PIVOT` transforma valores de una columna en columnas individuales, realizando una agregación simultánea.

```sql
-- Supongamos una tabla de ventas con las columnas: Año, Trimestre, Monto
SELECT * FROM (
    SELECT anio, trimestre, monto FROM ventas
)
PIVOT (
    SUM(monto) 
    FOR trimestre IN ('T1' AS Trimestre_1, 'T2' AS Trimestre_2, 'T3' AS Trimestre_3, 'T4' AS Trimestre_4)
);
```

## **Módulo 3: Fundamentos de PL/SQL (Programación Procedural)**

PL/SQL es la extensión de Oracle que permite añadir lógica de programación (variables, bucles, condiciones) al SQL tradicional.

### **3.1. Tipos de Bloques en PL/SQL**

El código PL/SQL se organiza en bloques estructurados que constan de tres partes básicas: `DECLARE` (opcional), `BEGIN` (obligatorio) y `EXCEPTION` (opcional).

* **Bloques Anónimos**: No se guardan en la base de datos. Se compilan y ejecutan al vuelo.  
* **Bloques Nominados (Objetos de BD)**: Se guardan en el diccionario de la base de datos.  
  * *Procedimientos (`PROCEDURE`)*: Ejecutan acciones, pueden o no devolver parámetros.  
  * *Funciones (`FUNCTION`)*: Obligatoriamente devuelven un único valor (`RETURN`).  
  * *Triggers*: Bloques que se disparan automáticamente ante eventos (INSERT, UPDATE, DELETE).  
  * *Paquetes (`PACKAGE`)*: Contenedores que agrupan procedimientos, funciones y variables relacionadas.

### **3.2. Estructura Básica y `SELECT INTO`**

En PL/SQL, cualquier consulta `SELECT` debe guardar el resultado en variables mediante `SELECT INTO`.

⚠️ **Regla de oro del `SELECT INTO`**: Debe devolver **exactamente una fila**. Si devuelve cero, lanzará la excepción `NO_DATA_FOUND`. Si devuelve más de una, lanzará `TOO_MANY_ROWS`.

```sql
DECLARE
    v_nombre empleados.nombre%TYPE; -- Hereda el tipo de dato de la columna
    v_salario NUMBER;
BEGIN
    SELECT nombre, salario 
    INTO v_nombre, v_salario
    FROM empleados
    WHERE id = 101;
    
    DBMS_OUTPUT.PUT_LINE('Empleado: ' || v_nombre || ' gana: ' || v_salario);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('El empleado no existe.');
END;
/
```

### **3.3. Estructuras Condicionales**

Permiten ramificar la lógica del programa.

* **`IF - THEN - ELSIF - ELSE`**:

```sql
IF v_salario > 5000 THEN
    v_bono := 500;
ELSIF v_salario BETWEEN 3000 AND 5000 THEN
    v_bono := 300;
ELSE
    v_bono := 100;
END IF;
```

* **`CASE`**: Excelente para evaluar múltiples valores de una misma variable.

```sql
v_categoria := CASE v_departamento
    WHEN 10 THEN 'IT'
    WHEN 20 THEN 'Ventas'
    ELSE 'General'
END;
```

### **3.4. Estructuras de Control de Bucles (Loops)**

PL/SQL ofrece tres mecanismos para repetir bloques de código:

* **Bucle Básico (`LOOP`)**: Ejecuta el código infinitamente hasta que se topa con un `EXIT WHEN`. Equivale a un *do-while*.

```sql
DECLARE
    v_contador NUMBER := 1;
BEGIN
    LOOP
        DBMS_OUTPUT.PUT_LINE('Contador: ' || v_contador);
        v_contador := v_contador + 1;
        EXIT WHEN v_contador > 5;
    END LOOP;
END;
/
```

* **Bucle `WHILE`**: Evalúa una condición antes de entrar al bloque.

```sql
WHILE v_contador <= 5 LOOP
    v_contador := v_contador + 1;
END LOOP;
```

* **Bucle `FOR` (Numérico o de Cursor)**: Ideal cuando conoces el número de iteraciones de antemano o recorres un set de datos fila por fila. *La variable del índice se declara automáticamente.*

```sql
-- For Numérico
FOR i IN 1..5 LOOP
    DBMS_OUTPUT.PUT_LINE('Iteración: ' || i);
END LOOP;

-- For de Cursor (Lee registros de un SELECT directamente)
FOR r_emp IN (SELECT nombre, salario FROM empleados WHERE departamento_id = 10) LOOP
    DBMS_OUTPUT.PUT_LINE(r_emp.nombre || ' gana ' || r_emp.salario);
END LOOP;
```

# 

# **SQL en RDR**

En RDR, la base de datos no es solo un componente de almacenamiento, sino el núcleo arquitectónico y operativo del sistema. Al estar construido sobre el producto GoldenSource 8.7, RDR hereda un modelo de datos altamente normalizado (tablas FT\_T\_\*) que actúa como la "fuente de la verdad" para todos los activos financieros, contrapartidas e instrucciones de liquidación de BBVA CIB.

El **SQL** es el lenguaje vehicular con el que interactuamos con esta "caja negra" de datos en nuestro día a día, permitiéndonos desde la supervisión operativa hasta la integración en tiempo real con otros sistemas.

### **La Centralidad de la BBDD en RDR**

La base de datos es el punto de convergencia de todos los flujos de información:

* **Repositorio Maestro (Golden Source):** Centraliza la información que antes estaba dispersa, como ocurrió en el proyecto de inversión de flujo donde RDR pasó a ser el maestro de instrucciones de liquidación (SSI) frente a sistemas como ABACO.  
* **Calidad y Cumplimiento:** La BBDD no solo guarda datos, sino que aplica reglas de integridad y calidad regulatoria (EMIR, MiFID, DFA) para asegurar que la información sea apta para el reporting.  
* **Observabilidad:** A través de tablas de control como FT\_T\_RLT1 (conocida como "streetlamp"), la base de datos registra el pulso de todos los procesos batch, permitiendo monitorizar errores y latencias.

### **SQL: Nuestro Idioma de Comunicación Diario**

Utilizamos SQL para traducir las complejas estructuras de GoldenSource en información accionable a través de varios mecanismos:

#### **1\. Consultas de Extracción y Publicación**

Para comunicarnos con sistemas consumidores (Murex, Calypso, ABACO), empleamos un patrón de SQL embebido que genera mensajes XML directamente desde la base de datos.

* **Denormalización con XML:** Usamos sentencias con XMLELEMENT y XMLAGG para transformar las filas de tablas como FT\_T\_ISSU (emisiones) o FT\_T\_FINS (entidades) en estructuras jerárquicas que los sistemas externos puedan entender.  
* **Paginación Eficiente:** Para manejar volúmenes de millones de registros sin saturar el sistema, nuestras consultas SQL incorporan marcadores de paginación (como L\_pagina\<N\>) que permiten extraer los datos en bloques controlados.

#### **2\. Mantenimiento y Salud del Sistema**

Incluso las tareas de "limpieza" se realizan mediante scripts SQL que purgan registros antiguos o liberan bloqueos, garantizando que el motor de la base de datos rinda de manera óptima para los procesos nocturnos.

Concepto de Baja lógica: en RDR, en vez de realizar DELETE; se intenta ejecutar bajas lógicas que mantengan el registro en BBDD para auditorías posteriores pero que la información no sea accesible mediante ningún medio. Para ello se establece: DATA\_STAT\_TYP=’INACTIVE’ y END\_TMS=sysdate \- El END\_TMS distingue entre registros inactivos, que se muestran y pueden re-activarse y registros dados de baja que solo se mantienen por auditoría en la BBDD.

En definitiva, entender RDR es entender su modelo relacional; y dominar RDR pasa necesariamente por dominar el SQL que nos permite interrogar, validar y distribuir la riqueza de datos que contiene su base de datos.

Esta es una propuesta detallada para el módulo de formación centrado exclusivamente en **SQL para Extracción de Datos** en el ecosistema RDR, cubriendo tanto procesos Batch como servicios Online.

### **Arquitectura de Extracción SQL en RDR: "At a Glance"**

En RDR, el SQL no es solo una consulta; es la base de un pipeline que transforma datos relacionales en mensajes XML estructurados.

* **Batch (Extracciones Genéricas)**: Consultas pesadas que se ejecutan sobre el planificador para generar ficheros masivos (ej. ThirdParties.xml, ExtraccionContingencia.xml).  
* **Online (Petición/Respuesta)**: Consultas dinámicas invocadas por servicios REST o workflows bajo demanda para consumidores externos.

### ---

**Módulo 1: SQL en RDR**

El estándar en RDR para evitar transformaciones pesadas en Java es delegar la estructura del mensaje a Oracle.

* **Funciones de Agregación XML**:  
  * Uso de XMLELEMENT para definir etiquetas.  
  * XMLATTRIBUTES para atributos de nodo.  
  * XMLAGG para agrupar múltiples registros (ej. todas las posiciones de un cliente) en un único CLOB XML.  
* **Filtros Canónicos**: Aplicación estricta de filtros de estado (data\_stat\_typ \= 'ACTIVE') y origen de datos (data\_src\_id \= 'RDR') para garantizar la integridad de la extracción.

### ---

### **Módulo 2\. Sentencias de Extracción XML (Patrón XMLELEMENT)**

En RDR, el SQL no solo recupera filas, sino que construye el mensaje XML final para los consumidores utilizando funciones nativas de Oracle.

* **Estructura Jerárquica**: Se utilizan sentencias XMLELEMENT anidadas para replicar el modelo de datos XML.  
  * **Ejemplo de sintaxis**:

    `SELECT XMLELEMENT("SSI",`  
             `XMLELEMENT("ID", sai1.alt_id),`  
             `XMLELEMENT("Counterparty", fins.inst_nme),`  
             `XMLELEMENT("Method", ssis.clrng_meth_typ),`  
             `XMLELEMENT("Attributes",`  
               `XMLATTRIBUTES(ssis.trans_dir_typ AS "Side")`  
             `)`  
           `) AS XML_RESULT`  
    `FROM FT_T_SSIS ssis`  
    `JOIN FT_T_SAI1 sai1 ON ...`  
    `JOIN FT_T_FINS fins ON ...`  
* **Agregación de Nodos (XMLAGG)**: Fundamental para agrupar múltiples registros (como todos los identificadores de un instrumento) en una sola etiqueta padre.

### ---

### **Módulo 3\. Sentencias de Consulta Online (Petición/Respuesta)**

Estas sentencias se almacenan en la tabla FT\_CFG\_QRDF y son invocadas por servicios REST o workflows bajo demanda.

* **Uso de Bind Variables**: Las sentencias deben usar parámetros tipados para evitar la inyección de código y optimizar el plan de ejecución de Oracle.  
  * **Ejemplo**: SELECT ... FROM FT\_T\_SSIS WHERE alt\_id \= :id\_peticion AND data\_stat\_typ \= 'ACTIVE'.  
* **Validación de Vigencia**: Es crítico el uso de sentencias que filtren por timestamps para obtener la "foto" correcta del dato.  
  * **Filtro estándar**: WHERE (start\_tms \<= :fecha\_proceso AND (end\_tms IS NULL OR end\_tms \> :fecha\_proceso)).

# **PL /SQL en RDR**

En el ecosistema RDR, el uso de **PL/SQL** es fundamental para la lógica de negocio pesada, la integridad de los datos y la orquestación de procesos masivos que el SQL simple no puede gestionar por sí solo. Su aplicación se divide principalmente en cargadores de datos, procesos de mantenimiento (Batch) y servicios de validación (Online).

### **1\. Carga Masiva y Cargadores de Datos**

El patrón de cargador masivo en RDR utiliza PL/SQL para la persistencia y validación final tras el pre-procesado en Java.

* **Validaciones Complejas:** Procedimientos como PCK\_SDIS\_LOADER.PR\_LOAD ejecutan más de 120 validaciones discretas antes de insertar datos en las tablas core (como FT\_T\_SSIS para instrucciones de liquidación).  
* **Gestión de Lotes (Batch & Execute):** PL/SQL permite procesar miles de registros de forma atómica. Por ejemplo, los cargadores de contrapartidas o de emisiones utilizan paquetes específicos para realizar el INSERT o UPDATE masivo, minimizando el tráfico de red.  
* **Tratamiento de CLOBs:** Debido a la longitud de algunas queries de extracción (como la de *ThirdParties*), se utilizan scripts PL/SQL (parseClob\_\*) para ensamblar estas consultas línea a línea y almacenarlas en la tabla ACTIONS\_TO\_EXECUTE.

### **2\. Procesos Batch y Conciliaciones**

PL/SQL es el motor de los procesos nocturnos orquestados por Control-M:

* **Conciliación y Handshake:** por la noche se reciben ficheros de otras BBDD y se concilian con la información que existe en RDR a través de PL/SQL realizando masivamente UPDATE, INSERT o bajas lógicas, según corresponda.  
* **Limpieza y Purga (Cleanup):** Existen procedimientos automáticos como KYTL\_GC.PROC\_WORKFLOW\_CLEANUP que purgan workflows antiguos de la base de datos para mantener el rendimiento del sistema.

### **3\. Inactivación de Entidades y Ciclo de Vida**

RDR gestiona la trazabilidad mediante patrones PL/SQL específicos que aseguran que no se pierda el histórico:

* **Patrón DENE (Inactivar \+ Nuevo):** Para cambios estructurales (como el cambio de un BIC de agente en una SSI), no se hace un UPDATE in-place. Se ejecuta una transacción atómica PL/SQL que marca la entidad antigua como INACTIVE y crea una nueva, vinculándolas mediante un identificador con el contexto REL\_NEW.  
* **Inactivación en Cascada:** Al dar de baja una entidad (ej. una *Enterprise*), PL/SQL gestiona la inactivación de las entidades dependientes (libros contables, oficinas, etc.) para garantizar la consistencia organizacional.  
* **Crear copiando:** algunas entidades permiten la posibilidad de crear una nueva entidad a partir de la información de otra existente, para simplificar el proceso de creación de entidades y no tener que empezar de 0\. La mayoría de estos procesos aprovechan la tecnología PL/SQL para recuperar la información de la entidad origen, aplicar los cambios y dar el alta de la nueva entidad.