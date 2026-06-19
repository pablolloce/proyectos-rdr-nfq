Actúa como un Arquitecto de Software Full-Stack y Analista de Negocio Senior. Tu tarea es diseñar la arquitectura, el modelo de datos y el código base para una aplicación web moderna e interactiva de gestión de proyectos, recursos y rentabilidad económica. 

El stack tecnológico estricto es: 
- Frontend: HTML, CSS (Tailwind o Bootstrap mediante CDN) y Vanilla JavaScript (Arquitectura SPA).
- Backend: Google Apps Script actuando como API REST (funciones doGet y doPost).
- Base de datos: Google Sheets (Excel).

A continuación, detallo exhaustivamente todas las reglas de negocio y los datos exactos que debe contener y calcular cada módulo de la web. 

## 1. MÓDULO DE PROYECTOS (INICIATIVAS Y BOLSAS)
Debe gestionar el estado y la evolución de las horas por Trimestre (Q). Datos obligatorios:
* **Iniciativas:** Listado de proyectos que pueden aprobarse o no en cada Q.
* **Horas estimadas:** Esfuerzo estimado para cada iniciativa.
* **Ofertas elevadas (para proyectos aprobados):** Cuántas horas se han elevado al cliente y su "ID de pedido" asociado.
* **Ejecución por trimestre:** Cuántas horas se ejecutan realmente en cada Q.
* **Total de horas ejecutadas:** Sumatorio del Q actual.
* **Tarifa de la empresa:** Dato global introducido a mano cada Q.
* **Lógica de Bolsas de Horas:**
  - *Bolsa de Adelantos:* Proyectos donde parte de las horas elevadas se "adelantan" pero no se ejecutan en este Q, quedando en una bolsa de adelantos.
  - *Bolsa Oficial:* Horas que se elevan como oferta (incluso sin ejecutarse en el Q) y se guardan en esta bolsa oficial. En Qs siguientes, las horas de ejecución de otros proyectos pueden salir (consumirse) directamente de esta bolsa oficial en lugar de elevar nuevas ofertas.

## 2. MÓDULO DE GESTIÓN ECONÓMICA DEL EQUIPO (POR Q)
Debe contener los siguientes campos y cálculos matemáticos exactos:
* **Datos por persona:** Coste mensual por persona por hora, Horas totales del mes, % de dedicación al equipo (pueden cobrar de otros equipos), y Horas dedicadas a vacaciones / formación.
* **Cálculos por persona:** Horas imputadas finales al equipo, Coste mensual total y Sumatorio del coste trimestral por persona.
* **Cálculos de equipo (Totales):** Sumatorio del coste de todo el equipo.
* **Otros gastos:** Imputación de gastos asociados a proyectos (guardias, horas extra, servicios, etc.).
* **Costes e Ingresos Finales:** - Coste total final (Coste equipo + Otros gastos).
  - Ganancias totales este trimestre (Horas totales ejecutadas * Tarifa de la empresa).
* **Métricas de Rentabilidad:**
  - Rentabilidad real del equipo actual.
  - Rentabilidad Objetivo calculada como la media ponderada de: [Coste equipo funcional / (1 - 25%)] y [Coste equipo técnico / (1 - 20%)].
  - Bolsa Previa y Bolsa Después: Cuántas horas mantener/mover a bolsa en este trimestre para mantener la rentabilidad objetivo.
  - Métricas derivadas: Partiendo de la rentabilidad objetivo, calcular los "Ingresos objetivos" y las "Horas necesarias objetivo a ejecutar" este trimestre.

## 3. MÓDULO DE COORDINACIÓN Y CAPACIDAD
Gestión de personas y su cobertura:
* **Estructura del equipo en el Q:** Definir quiénes son responsables, responsabilizados y equipo técnico cross.
* **Pipeline:** Iniciativas que consideramos que pueden aprobar (probabilidad).
* **Asignación:** Responsable y ejecutores de cada proyecto y el % en el que estarán trabajando en ese proyecto específico.
* **Cobertura y Capacidad:**
  - Cobertura de las horas estimadas vs elevadas.
  - Capacidad: El % del total de horas trabajadas en cada Q cubiertas por persona (para detectar sobrecarga u ociosidad).

## 4. ENTREGABLES INICIALES ESPERADOS
Para empezar este proyecto, necesito que generes ÚNICAMENTE los siguientes dos entregables en bloques de código separados:

1. **Estructura de Base de Datos en CSV:** Genera el contenido en formato CSV crudo (separado por comas) que defina la estructura del backend en Google Sheets. Debe incluir las siguientes columnas: "Pestaña_Sheet", "Nombre_Columna", "Tipo_Dato", "Descripcion". Este CSV debe abarcar **todos** los campos y métricas descritos en los puntos 1, 2 y 3 sin dejarte ni uno solo.
2. **Prototipo Frontend (HTML/JS/CSS):** Genera el código completo de un único archivo `index.html`. Debe incluir:
   - Importación de Tailwind CSS vía CDN.
   - Un diseño moderno tipo SPA con un menú lateral para navegar entre "Proyectos", "Economía" y "Coordinación".
   - Un selector global de "Trimestre (Q)" y el input de "Tarifa de empresa" en la cabecera.
   - Vistas (maquetadas con datos estáticos de ejemplo) que muestren tablas y paneles para visualizar TODA la complejidad solicitada (las bolsas, el simulador de rentabilidad ponderada, y la matriz de capacidad de los miembros del equipo).
   - Lógica básica de JavaScript para navegar por las pestañas.