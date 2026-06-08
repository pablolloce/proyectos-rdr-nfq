## **El Ecosistema XML: Roles y Relaciones**

Para que un archivo de texto con etiquetas (XML) sea útil en entornos profesionales, necesita control de calidad (XSD), un motor de búsqueda interno (XPath) y la capacidad de adaptarse a otros formatos (XSLT).

Aquí tienes el desglose de qué hace cada componente:

## **1\. XSD (XML Schema Definition) — *El Guardián de las Reglas***

Un archivo XML por sí solo es muy libre: puedes inventarte las etiquetas que quieras. Pero en el mundo real, los sistemas necesitan orden. **XSD es el documento que define la estructura gramatical y las reglas que debe cumplir un XML.**

* **¿Para qué sirve?** Para la **validación**. Antes de que tu sistema procese un XML enviado por un cliente o proveedor, el XSD comprueba si todo está en su sitio.  
* **La analogía:** Es como el plano de una casa o un contrato de datos. Si el plano dice que la casa solo puede tener 2 plantas, el constructor no puede hacer 4\.  
* **¿Qué puedes definir en un XSD?**  
  * Qué etiquetas son obligatorias y cuáles opcionales.  
  * El orden exacto de los elementos.  
  * El tipo de datos (por ejemplo, que \<edad\> solo acepte números enteros y \<fecha\> siga el formato AAAA-MM-DD).

**Ejemplo práctico:** Si un XML de una factura no incluye la etiqueta \<total\>, el validador XSD rechazará el archivo inmediatamente, evitando que el sistema falle más adelante.

## **2\. XPath (XML Path Language) — *El GPS del XML***

XML estructura la información en forma de árbol (con nodos padres e hijos). Cuando el documento es enorme, encontrar un dato específico puede ser una pesadilla. **XPath es el lenguaje de consultas que sirve para navegar y seleccionar fragmentos específicos de un XML.**

* **¿Para qué sirve?** Para **extraer información** sin tener que recorrer todo el archivo a mano línea por línea.  
* **La analogía:** Es exactamente como la ruta de carpetas de tu ordenador (C:/Usuarios/Documentos/archivo.pdf), pero adaptada para viajar entre etiquetas XML.  
* **¿Qué puedes hacer con XPath?**  
  * Ir directo a un nodo: /catalogo/libro/autor  
  * Usar filtros avanzados (predicados): /catalogo/libro\[precio \< 20\] *(Traducción: "Dame solo los libros que cuesten menos de 20€")*.  
  * Buscar atributos específicos: //usuario\[@id='123'\]

## **3\. XSLT (Extensible Stylesheet Language Transformations) — *El Camaleón***

A veces recibes un XML con una estructura fantástica, pero tu sistema necesita un archivo HTML para mostrarlo en una web, un PDF para imprimir, o simplemente otro XML con etiquetas diferentes. **XSLT es el lenguaje que transforma un documento XML en cualquier otro formato.**

* **¿Para qué sirve?** Para la **interoperabilidad y presentación**. Permite mapear y traducir datos entre sistemas que no hablan el mismo "idioma" visual o estructural.  
* **La analogía:** Es como una máquina de reciclaje industrial: introduces botellas de plástico (XML original) y, mediante unas instrucciones (el archivo XSLT), la máquina las transforma en una camiseta de fibra sintética (HTML o un nuevo XML).  
* **Su relación con XPath:** XSLT no podría vivir sin XPath. XSLT utiliza expresiones XPath para "apuntar" a los datos del XML original que quiere transformar o reordenar.

## **Resumen de la Formación: ¿Quién es quién?**

Para consolidar el aprendizaje, mira esta tabla comparativa que resume el propósito de cada tecnología:

| Tecnología | ¿Qué es en una frase? | Pregunta a la que responde | Herramienta equivalente en JSON |
| :---- | :---- | :---- | :---- |
| **XML** | El contenedor de los datos. | *¿Qué información tenemos?* | JSON plano |
| **XSD** | El validador y esquema. | *¿Cumple este archivo las reglas?* | JSON Schema |
| **XPath** | El buscador/navegador. | *¿Dónde está el dato que busco?* | JSONPath |
| **XSLT** | El transformador de formato. | *¿Cómo convierto este dato a otro formato?* | Scripts de mapeo (JOLT / JavaScript) |

Para tu formación sobre XML, XSLT, XSD y XPath dentro del ecosistema RDR (Reference Data Repository), es fundamental entender que estas tecnologías no son solo formatos de datos, sino el motor declarativo que permite la flexibilidad del sistema GoldenSource 8.7 en BBVA.

A continuación, detallo los usos principales de cada tecnología basándome en la arquitectura de RDR:

### **1\. XML: El Lenguaje de Definición y Mensajería**

En RDR, el XML es el estándar para casi toda la configuración y el transporte de datos internos:

* **Workflows y Queries (.gsp):** Los flujos de negocio y las consultas SQL a la base de datos Oracle (FT\_T\_\*) se declaran como objetos XML con extensión .gsp.  
* **Definición de Interfaz (Workstation):** Las pantallas de la aplicación (SpeedScreens) y la lógica de negocio (Models) se definen íntegramente en archivos XML.  
* **Filtros de Carga:** Archivos como ILQ\_Filter.xml definen qué registros deben procesarse o descartarse durante las cargas masivas (batch).  
* **Mensajería ESB:** La integración con el bus corporativo (UUAA KYRS) utiliza mensajes en formato **FiXML** (un estándar XML para mercados financieros) que viajan encriptados.

### **2\. XSLT: El Motor de Transformación**

El uso de XSLT es crítico para la interoperabilidad de RDR con sistemas consumidores y proveedores:

* **Transformaciones Outbound:** Se utiliza para convertir los datos maestros de GoldenSource a formatos específicos requeridos por consumidores como ABACO, Murex, Calypso o sistemas de reporting regulatorio.  
* **Pipeline de Servicios (servicesRDR):** En el framework de servicios síncronos, se emplea XSLT para extraer dinámicamente el nombre de la query y sus parámetros a partir de un mensaje de entrada.  
* **Mapping:** Existe una dualidad donde los archivos de mapeo (.mfl) definen la estructura y el XSLT define la salida final hacia vendors o clientes.

### **3\. XSD: Contratos de Datos y Validación**

Los esquemas XSD actúan como los "guardias" de la integridad de los datos:

* **Validación de Mensajes:** Se usan para validar tanto la entrada como la salida de los mensajes JMS en el framework servicesRDR.  
* **Gatekeeper de Carga:** El componente RDR\_GenericValidatorXSD.jar funciona como una puerta de enlace (gate) en Control-M para asegurar que los ficheros recibidos cumplen el contrato antes de intentar cargarlos.  
* **Contratos de Interfaz:** Definen la estructura de los mensajes que RDR intercambia con sistemas externos, asegurando que ambas partes hablen el mismo "idioma" de datos.

### **4\. XPath: Localización y Reglas de Negocio**

XPath es la herramienta de navegación utilizada dentro de los otros componentes:

* **Validaciones en Models:** Dentro de los archivos model\_\*.xml, se utiliza XPath para definir reglas de validación complejas sobre los campos de las pantallas.  
* **Extracción en pipelines:** Se emplea para localizar nodos específicos en mensajes XML complejos (como los FiXML de la ESB) para su posterior procesamiento o enrutado.

### **Resumen de Aplicación por Áreas**

| Tecnología | Uso Principal en RDR | Ubicación Clave |
| :---- | :---- | :---- |
| **XML** | Configuración de Workflows, Queries y UI | custom/configuration/ |
| **XSLT** | Adaptación de formatos para consumidores (ABACO, Murex) | dat/properties/ |
| **XSD** | Validación de integridad y contratos de servicios | custom/configuration/resources/ |
| **XPath** | Reglas de validación en pantallas y lógica de negocio | configGS/models/ |

En el ecosistema de RDR (Reference Data Repository), las tecnologías XML, XSLT, XSD y XPath constituyen el lenguaje fundamental para la interoperabilidad de datos, permitiendo que el repositorio maestro se comunique con más de 40 sistemas consumidores y diversos proveedores de mercado.

A continuación, se detalla la base de estas tecnologías y su importancia crítica en los flujos **Online** (tiempo real) y **Batch** (procesamiento por lotes):

### **1\. XML (Extensible Markup Language): El Contrato Universal**

Es la base sobre la cual se estructuran los datos maestros en RDR. Su importancia radica en que actúa como el "idioma común" entre sistemas heterogéneos.

* **Salidas Online:** Los mensajes que viajan por el bus corporativo (**ESB KYRS**) utilizan el formato **FiXML** (estándar XML para mercados financieros). Toda publicación de cambios en contrapartidas o emisiones se emite en este formato encriptado para que sistemas como ABACO o Murex los procesen al instante.  
* **Salidas Batch:** Las extracciones diarias de gran volumen, como las de contrapartidas (ThirdParties.xml), se generan nativamente en XML desde la base de datos de GoldenSource para asegurar que la jerarquía de los datos se mantenga intacta al ser distribuidos vía DataX o SFTP.

### **2\. XSLT (Extensible Stylesheet Language Transformations): El Traductor Dinámico**

XSLT es el motor que transforma el XML interno de RDR en el formato específico que necesita cada sistema consumidor.

* **Salidas Online:** Dentro del pipeline de servicios (**servicesRDR**), se emplean hojas de estilo XSLT para extraer dinámicamente nombres de consultas y parámetros a partir de mensajes XML de entrada, permitiendo respuestas síncronas rápidas.  
* **Salidas Batch:** Es fundamental en el framework de cesiones para convertir datos maestros a formatos propietarios de consumidores como **Murex** o **Calypso**. Por ejemplo, se usa XSLT para transformar cestas de instrumentos al formato requerido por DUCO.

### **3\. XSD (XML Schema Definition): El Guardián de la Integridad**

Los esquemas XSD definen la estructura legal y las reglas que debe cumplir un archivo XML antes de ser procesado o enviado.

* **Salidas Online:** Se utiliza para la **validación mandatoria** de los mensajes de entrada y salida en el bus ESB, garantizando que ninguna consulta mal formada llegue a la base de datos y que ninguna respuesta incompleta salga del sistema.  
* **Salidas Batch:** RDR emplea un componente específico, el RDR\_GenericValidatorXSD.jar, que actúa como un control de calidad (gatekeeper) en Control-M. Si un fichero generado no cumple con el XSD definido, el proceso se detiene antes de ser distribuido a los consumidores, evitando errores en cascada.

### **4\. XPath (XML Path Language): El Navegador de Datos**

XPath es la tecnología de navegación que permite localizar nodos o campos específicos dentro de un documento XML.

* **Salidas Online:** Se usa en los enrutamientos del ESB para identificar el tipo de mensaje y dirigirlo al servicio correcto (por ejemplo, separar una consulta de ratings de una de contrapartidas).  
* **Salidas Batch:** Se emplea durante las validaciones de las extracciones (como en RDR\_Extraction\_CPARTYS.jar) para verificar la completitud de entidades y separar datos, como los de ratings, del cuerpo general de la contrapartida antes de la partición final de ficheros.

### **Resumen de Importancia Estratégica**

| Escenario | Tecnología Clave | Impacto en RDR |
| :---- | :---- | :---- |
| **Online** | **FiXML \+ XSD** | Garantiza la disponibilidad y validez de los datos en milisegundos para trading y riesgos. |
| **Batch** | **XML \+ XSLT** | Permite la distribución masiva y personalizada de datos a más de 40 aplicaciones consumidoras diariamente. |

