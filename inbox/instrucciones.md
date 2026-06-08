# CAMBIOS

## Cantidad de tablas

~60 tablas son solo las principales, el modelo tiene MUCHAS MÁS

## INDICE

Los textos en el índice se cortan (EL quiz se puede quitar del índice)

## QUIZ

Ninguna de las otras formaciones tiene una diapositiva como esta: "Quiz - 25 preguntas sobre el modelo de datos de RDR." quítala. Y quita la última tmb, que el quiz sea el final.

En el propio quiz, muchas de las respuesta son la opción B; cambia un poco para que sea más aleatorio.

## BACKGROUND

Hay muchos cambios de color en el background, reduce la cantidad de cambios.

## DOMINIOS

"Los 7 dominios del modelo", realmente tenemos 4 entidades principales: LEgal Entities, Legal Agreements, Issues, Settlement Instructions y Settlement Confirmation Instructions. El resto son Auxiliares.

## Blanco sobre acento

Revisa porque hay textos en Blanco sobre color de acento que no se leen bien. (Ejemplo: Diapositiva. 03 · El patrón que se repite  Hub · Link · Satélite -> los nombres de las tablas: FT_T_FINS...)

## Tabla FT_T_SSIA

Pese a que se podría conectar con contrapartidas (INST_MNEM) o emisiones (INSTR_ID), solo se utiliza para informar los productos que tiene asociado la instrucción. No conecta con otras entidades principales (Solo con productos -> Que en RDR solo se usan de traducción a otros sistemas). Es la FT_T_SSIR la que une instrucciones con entidades a través de los roles que puede tener esa contrapartida conrespecto a la instrucción: Banco corresponsal, Banco Custodio, Beneficiario, Intermediario...

## CCRF

La tabla FT_T_CCRF no se utiliza para nada, podría conectar todo, pero la realidad es que no se usa. Se conecta todo a través de las entidades.

## EMISIONES

FT_T_MKIS es la tabla que conecta emisiones con mercados (Mercados es una entidad decundaria cuya tabla principal de definición es FT_T_MRKT)

## INST_MNEM y INSTR_ID

Son los OID principales de emisiones y entidades, pero no son más importantes que LEGAL_AGRMT_ID o que SSIS_OID, aunque se repitan más en el modelo.

## Auditoría

Haz algo más de foco en las columnas de auditoría que están en todas las tablas:
START_TMS; END_TMS; LAST_CHG_TMS; LAST_CHG_USR_ID




