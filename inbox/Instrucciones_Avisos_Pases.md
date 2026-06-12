
# Instrucciones cambios avisos y web Pases Calendados

## Contexto

Quiero hacer modificaciones sobre el fichero Avisos.gs - Se utiliza para ir marcando el ritmo de los pases calendados e ir avisando de las distintas casuísticas. Se parte de la web: pases-calendados.html, cuyo Backend es Pases_Code.gs. Quiero realizar varios cambios sobre los avisos principalmente, y un detalle de la web.

## Envío del correo

Los correos de avisos deben enviarse desde noreply@nfq.es

## Días de avisos

Han cambiado el sistema.

ANTES:
Lunes 2 semanas antes del pase: correo de inicio
Viernes de la semana de antes del pase: último día para OKs y Pruebas workstation
Martes de la semana del pase: último día para cerrar el Pase (CRQ+ Todos los componentes + Orden + Instalación Técnica)
Viernes de la semana del pase: último día para comprobar la pre-instalación
Sábado de la semana del pase: IMPLANTACIÓN
Lunes de la semana siguiente al pase: MERGEOS

AHORA:
Lunes 2 semanas antes del pase: correo de inicio
Miércoles de la semana de antes del pase: último día para OKs y Pruebas workstation
Lunes de la semana del pase: último día para cerrar el Pase (CRQ+ Todos los componentes + Orden + Instalación Técnica)
Viernes de la semana del pase: último día para comprobar la pre-instalación
Sábado de la semana del pase: IMPLANTACIÓN
Lunes de la semana siguiente al pase: MERGEOS

Entonces los recordatorios del viernes de la seman anterior pasan al miércoles. Y, los del lunes de la semana del pase al viernes de la semana anterior. Y los del martes de la semana del pase al lunes de esa misma semana. El resto se mantiene.

## Contenido de los correos

Reformula el contenido para que sea más profesional (Quita Good Morning Vietnam, o Bomba Nuclear...). Y, deben incluir más información del pase, tabla resumen de proyectos y componentes, con los Oks que falten... Añade mucha más información en todos los correos, que no se centren tanto en solo lo que es importante ese día, tmb un poco estado general y cosas que van faltando.

## Correos visualmente

Deben parecerse a los que has montado de comidas, visualmente.

## Web pases-calendados.html

El título "RELEASE" no coincide con el check. Yo además cambiaba un poco este concepto porque no se entiende. cambia donde pone "RELEASE" por "tech-kytl", y en el aviso: Todos los componentes tienen el check 'Release' -> Todas las historias de usuario tienen el "tech-kytl" informado.

Y, permite la opción de añadir N "Features" a un proyecto separados por ";", lo mismo que las historias de usuario. Cuando alguien escriba tanto en Historias de Usuario como en Feature y luego haga click en otro sitio, debería añadirse el ";" solo por si luego quiere escribir otra. Y, que si no pone nada más que se coja bien.



