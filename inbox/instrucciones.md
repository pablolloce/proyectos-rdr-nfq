# Instrucciones Comidas

## Objetivo
Montar una web sobre un Google Sheet que permita a mis compañeros coordinarse para elegir un restaurante todos los jueves (no festivos o con teletrabajo). La web será en html en Github Pages, como el resto de webs del proyecto, que debe mantener homogeneidad visual. 

## Google Sheets - Explicación
El Google Sheets tiene 3 pestañas. La primera "Restaurantes" tiene un listado con los restaurantes a elegir (podrá ampliarse), cada uno con su descripción, link a su carta y un link con una foto -> la web debe tener un seleccionador, donde puedas ver las fotos y una descripción corta, y un link para que te lleve a la carta, que se pueda ver más y leer la descripción larga. La segunda pestaña "Equipo", recoge la opinión o selección de los compañeros, (2 elecciones, prioridad 1 y prioridad 2), se puede poder elegir "El que más se vote", las 2 opciones más votadas deben salir separadas, por si solo quiere unirse al resto. Y, siempre las dos opciones (No estoy, si ese jueves no estará en la oficina) (Taper/Glovo si decide no comer fuera). La tercera pestaña "Semana" recoge las 2 opciones más votadas por semana, están indicadas qué semanas (jueves) se va a la oficina y estará abierta la votación y el número de compañeros que ha elegido cada opción (Restaurante 1, 2, No estoy o Taper/Glovo). Importante, puede que todos quieran ir al mismo y el Restaurante 2 no se rellene. 

## Web - HTML
Hay una primera versión "dummy" en la carpeta, pero peudes crear una de 0
La web debe mostrar las distintas opciones:
- Listado
- Opciones más votadas (con cantidad de votos)
- Taper/Glovo (con cantidad de votos)
- No estoy (con cantidad de votos)
Y, debe tener una segunda pestaña donde se puede ver el histórico de semanas anteriores.
Para seleccionar quien eres, debe hacer fetch al json de equipo (como hicimos con las formaciones)

## En la carpeta inbox
En la carpeta tienes:
- La distribución de cada pestaña del Google Sheets en .csv
- El Code.gs que será el backend y que estará en appscript sobre el Google Sheets (si consideras que debe cambiarse, puedes crear una nueva versión)
- Una primera versión "dummy" de la web, debes crearla de 0, pero como base.
