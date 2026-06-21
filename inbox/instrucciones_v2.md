Actúa como un Arquitecto de Software Full-Stack y Analista de Negocio Senior. Tu tarea es diseñar la arquitectura, el modelo de datos y el código base para una aplicación web moderna e interactiva de gestión de proyectos, recursos y rentabilidad económica. 

El stack tecnológico estricto es: 
- Frontend: HTML, CSS (Tailwind o Bootstrap mediante CDN) y Vanilla JavaScript (Arquitectura SPA).
- Backend: Google Apps Script actuando como API REST (funciones doGet y doPost).
- Base de datos: Google Sheets (Excel).

A continuación, detallo exhaustivamente todas las reglas de negocio y los datos exactos que debe contener y calcular cada módulo de la web. 

# INDICACIONES FUNCIONALES

## INICIATIVAS - EJECUCIÓN

Las iniciativas se convierten en proyectos una vez se aprueban. Debe permitir añadir tantas iniciativas como se quieran para cada trimestre (Q). La siniciativas tienen las siguientes caracteríasticas:
- Código de proyecto (SDATOOL-XXX o "BAU")
- Nombre de proyecto
- Horas estimadas
- Id de pedido (Si se eleva oferta)

Por defecto estarán con estado *Pendiente de aprobar*. Una vez nos comenten los clientes podrán pasar a:
- Aprobada
- Rechazada
Visualmente debemos poder ver todas las de estado *Aprobada* y solo las *Rechazadas* del Q actual.

Una vez aprobada, según nos comenten, pasará a:
- Emitido Pago
- Bolsa de Horas
Y, una vez tenga uno de estos estados estará *En curso* para la ejecución.

Si se ha emitido pago, cuando cobremos la oferta, se pasará a *Cobrada*

Y, una vez se complete la ejecución del total de horas a ejecutar, pasará de *En curso* a *Finalizada*. Las "Finalizadas" de Qs anteriores no deben verse tampoco.

Por cada proyecto a ejecutar, tendremos las siguientes horas:
- Elevadas
- A Bolsa
- A Adelantos
- De Bolsa
- De Adelantos

Las horas totales a ejecutar por proyecto serán: Elevadas - A Bolsa - A Adelantos + De Bolsa + De Adelantos.

Se debe indicar por cada Q cuántas horas se están ejecutando. Y cuántas quedan por ejecutar para Qs posteriores. Además un simulador para poder simular próximos Qs en la parte económica. El dato más importante a nivel económico es el sumatorio de horas por cada Q (Horas totales Q).

## ECONOMIA - Por cada Q

La parte de la gestión económica del equipo. Cada Q se indica la Tarifa de proveedor, que es la forma de pasar de horas a dinero.

Ingreso real = Horas totales Q * Tarifa

Respecto a los costes. Tenemos 2 equipos (NFQ, NTER), por equipo habrá que indicar:
- Miembros
- Coste mensual de cada miembro

Se establece por cada mes: 
- Total de horas
- Dedicación de cada miembro
- Ausencias (Formaciones, Vacaciones...)
- Horas Imputadas (Totales * dedicación - Ausencias)
- Coste por miembro (coste mensual * horas imputadas)

Deben indicarse, sumatorio total por mes y total por miembro. Y, sumatorio total de Q, y de miembro por Q.

El sumatorio de coste total del equipo por Q, será el sumatorio total de Q de NFQ + el de NTER + Gastos adicionales.

Los gastos asicionales deben poder indicarse también cada Q.

Cada equipo tiene su rentabilidad objetivo (NFQ, 25% - NTER, 20%). Se debe calcular el Ingreso objetivo con la rentabilidad y el coste cada Q (Coste total Q equipo / (1 - Rentabilidad))

La rentabilidad objetivo total = (Coste por Q NFQ / Coste por Q NFQ + NTER) * 25% + (Coste por Q NTER / Coste por Q NFQ+NTER) * 20%.
Ingreso objetivo total = Coste por Q total / (1 - Rentabilidad objetivo total) -> Indicado en horas también con la Tarifa

Rentabilidad real = 1 - (Coste total Q / Ingreso real)

DEBE PODER PERMITIRSE HACER SIMULACIONES DE COSTES/INGRESOS jugando con iniciativas pendientes en el Q entrante y las horas a ejecutar cada Q.

## CAPACIDAD

Simulación de capacidad para Q entrante.

Estructura del equipo - División en sub-equipos, cada uno con su responsable. Y capacidad cubierta de cada equipo.

Por cada proyecto que queramos para la simulación (Aprobados o Pendientes de aprobar). Con las horas totales a ejecutar en ese Q. Se indica
- Repsonsable y % de implicación
- Ejecutores y % de implicación

Se debe calcular:
- La cobertura del total de horas a ejecutar en ese Q por proyecto
- La capacidad de cada miembro del equipo
- La capacidad de los sub-equipos

## ENCUESTAS - Por cada Q

Se añaden directamente importadas a mano de otra herramienta. Se indica:
- Código de Proyecto
- Satisfacción
- Consigue resultados
- Conocimiento técnico
- Total
- Posibles mejores / comentarios

## TIME REPORT - Por cada Q

Por cada proyecto con horas elevadas en este Q. Se debe indicar:
- Código de proyecto
- Nombre de proyecto
- Horas elevadas
- Feature / task (JIRA) -> Puede haber N por proyecto y todas deben tener horas imputadas

Habrá que indicar a nuestros compañeros, cuántas horas debe imputar en cada proyecto por quincena (por persona):
- SDATOOL (Si tiene SDATOOL-XXXX)
- Proyecto (Nombre)
- Feature / task
- Otras Tecnologías (Solo si en el Nivel 3 se indica Otras Tecnologías -> o "GoldenSource" o nulo)
- Nivel 1 (Catálogo)
- Nivel 2 (Catálogo)
- Nivel 3 (Catálogo)
- Horas en cada día de la quincena
> Debe permitirse copiar toda la información para pegarla en un Excel

En el resumen se debe incluir los proyectos, las horas imputadas totales por proyetco y las pendientes. también incluir por quincena cuántas horas se han imputado.
Incluir tmb, si hay algunas horas a Bolsa en estos proyetcos, cuántas se han metido en bolsa y cuántas se han consumido de bolsa.

## TRASPASOS

Por cada proyecto, cuando se indique el Id de Traspaso:
- Pasa a Abierto
Mientras está abierto, se parte de "Documentación Pendiente", hatsa que incluyamos toda la documentaicón, en ese momento pasa a "Documentación Entregada". Una vez en "Documentación Entregada", pasa a:
- Pendiente del ANS
Hasta que cierren el traspaso qu entonces pasa a:
- Cerrado
Una vez se cierra, se indica a fecha de Cierre. Y pasa a:
- En garantía
Hasta que hayan pasado 6 meses de la fecha de cierre, entonces pasa a:
- Garantía finalizada

# INDICACIONES BACK-END

El limitador PRINCIPAL de la aplicación. El Backend debe ser el Google Sheets "Control - RDR BBVA". Toda la web debe recibir la información de aquí y poder modificar este excel con las limitaciones existentes.  Se establece como ejemplo el backend creado, pero puede adaptarse para las funcionalidades descritas. (.\outbox\apps-script\Codigo.gs). La parte del Time Report y Traspasos, están en otros Google Sheet, pero la idea es incluirlos en este mismo. Puedes crear el back que necesites y la estructura de excel que quieras.

# INDICACIONES FRONT-END

Debes incorporar todas las reglas funcionales, como mejor consideres. El usuario debe sentir que está navegando por un entorno digital fluido, no solo bajando por un documento.

## STACK TECNOLÓGICO REQUERIDO:
Debes utilizar las siguientes tecnologías para construir la experiencia:
- React / Next.js: Como estructura principal y enrutamiento.
- Three.js (@react-three/fiber y @react-three/drei): Para integrar un elemento 3D interactivo en la sección principal (Hero).
- GSAP (GreenSock) y ScrollTrigger: Para la coreografía de las animaciones, transiciones de entrada y efectos complejos basados en el scroll. NO uses animaciones CSS básicas para los elementos principales.
- Framer Motion: (Opcional, si prefieres usarlo en lugar de GSAP para las interacciones de UI, como el cursor o los botones).
- Tailwind CSS: Para el estilado de la interfaz de usuario (tipografía, grid, posicionamiento absoluto de los overlays).

## REQUERIMIENTOS TÉCNICOS Y VISUALES (Paso a paso):
- Custom Cursor: Implementa un cursor personalizado suave que cambie de estado (ej. se agrande) cuando pase sobre enlaces o botones (usa JavaScript/Framer Motion para el efecto de "retraso/spring").
- Loading Screen: Una pantalla de carga inicial brutalista que desaparezca con una animación compleja de GSAP, revelando el contenido principal.
- Hero Section (El Canvas 3D):
    - Debe ocupar el 100% de la pantalla (100vh).
    - En el fondo (usando Three.js), crea una forma abstracta (puede ser una esfera distorsionada con ruido perlin, un toroide de partículas o un plano que simule agua oscura).
    - Aplica un Shader personalizado básico o usa un material físico con refracción/cristal (MeshPhysicalMaterial) para que se vea premium.
    - El objeto 3D debe reaccionar levemente al movimiento del ratón del usuario (efecto parallax).
    - Por encima del Canvas, en HTML normal (overlay), coloca un título tipográfico enorme (ej. fuente 'Inter' o 'Space Grotesk' en negrita) que diga "BEYOND THE GRID".
- Scroll Experience:
    - Implementa "Smooth Scrolling" (puedes sugerir usar librerías como Lenis o Locomotive Scroll).
    - Al hacer scroll hacia abajo, el título del Hero debe desaparecer con un efecto de difuminado o traslación hacia arriba.
    - El elemento 3D debe mutar, cambiar de posición o de color según el progreso del scroll (vincula la rotación o escala del objeto en Three.js con el ScrollTrigger de GSAP).
- Sección de Contenido: Tras el Hero, añade una sección con texto descriptivo que aparezca usando el efecto de revelado de texto letra por letra o línea por línea (Staggered Text Reveal) usando GSAP.

## INSTRUCCIONES DE SALIDA:
No me des un solo archivo gigante y confuso.
1. Primero, explícame brevemente la arquitectura de componentes que vas a usar.
2. Proporciona el código del componente principal (App.jsx o index.js).
3. Proporciona el código del componente 3D (Scene.jsx).
4. Proporciona el código de las animaciones/GSAP.
5. Asume que ya tengo el entorno de desarrollo montado. Asegúrate de que el código sea limpio, moderno y comentado en las partes complejas (especialmente la integración de Three.js con GSAP).






