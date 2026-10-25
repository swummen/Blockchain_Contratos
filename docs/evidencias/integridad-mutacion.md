# Prueba de integridad por mutación documental (OE4 · RNF-14)

| | |
|---|---|
| **Resultado del KPI** | **CUMPLE**: 20 de 20 alteraciones detectadas (100 %, meta 100 %) |
| Falsos positivos | 0 de 20 originales marcados como alterados (meta 0) |
| Trazabilidad en el ledger | 20 de 20 documentos con registro y sus 2 verificaciones |
| Casos PASS | 20 de 20 |
| Fecha | 25/10/2026, 6:05:18 p. m. |
| Entorno | **Docker local** (`http://localhost:5173/api`) |
| Latencia media | registro 2044 ms · verificación 2039 ms |
| Datos crudos | `tests/integrity/resultados/corrida-2026-10-25-18-05.csv` |

## Método

Conjunto de 20 documentos sintéticos con datos ficticios: 12 contratos laborales y
8 acuerdos de confidencialidad (`docs/documentos-prueba/`), cada uno con una copia
alterada. Por documento: el Empleado registra el original; el Verificador lo verifica
con el original (debe dar **Verificado**, control de falsos positivos) y con el
alterado (debe dar **Alterado**). Se comprueba además que los hashes devueltos por la
API sean los calculados al generar los archivos y que el ledger registre las 3 acciones.

## Detección por tipo de alteración

| Alteración | Documentos | Detectadas |
|---|---|---|
| texto | 4 | 4 de 4 |
| firma | 4 | 4 de 4 |
| metadatos | 4 | 4 de 4 |
| caracter | 4 | 4 de 4 |
| anexo | 4 | 4 de 4 |

## Resultado por documento

| Código | Tipo | Alteración aplicada | Original | Alterado | TxID del registro | Resultado |
|---|---|---|---|---|---|---|
| C01 | Contrato laboral | Texto: salario de $3.200.000 a $3.500.000 | Verificado | Alterado | `9a510d53545c6b8b…` | PASS |
| C02 | Contrato laboral | Firma: se reemplazó el nombre de quien firma | Verificado | Alterado | `1ec7535c83533737…` | PASS |
| C03 | Contrato laboral | Metadatos: autor y fecha de modificación (contenido visible idéntico) | Verificado | Alterado | `e22e31b7a625ac5d…` | PASS |
| C04 | Contrato laboral | Un solo carácter: el punto final de la primera cláusula pasa a ser coma | Verificado | Alterado | `e52a7bedf8b8af37…` | PASS |
| C05 | Contrato laboral | Anexo: se agregó una página al final | Verificado | Alterado | `dbdeefbdbbe79c42…` | PASS |
| C06 | Contrato laboral | Texto: salario de $2.300.000 a $2.600.000 | Verificado | Alterado | `126756fdd7de146b…` | PASS |
| C07 | Contrato laboral | Firma: se reemplazó el nombre de quien firma | Verificado | Alterado | `e500eeeae689369a…` | PASS |
| C08 | Contrato laboral | Metadatos: autor y fecha de modificación (contenido visible idéntico) | Verificado | Alterado | `487e15612b01fdb3…` | PASS |
| C09 | Contrato laboral | Un solo carácter: el punto final de la primera cláusula pasa a ser coma | Verificado | Alterado | `14cde1e67d7ac8ef…` | PASS |
| C10 | Contrato laboral | Anexo: se agregó una página al final | Verificado | Alterado | `f1820d1d2a20c457…` | PASS |
| C11 | Contrato laboral | Texto: salario de $4.500.000 a $4.800.000 | Verificado | Alterado | `0187693072b1b470…` | PASS |
| C12 | Contrato laboral | Firma: se reemplazó el nombre de quien firma | Verificado | Alterado | `589cf9ba4d670c66…` | PASS |
| N01 | Acuerdo de confidencialidad | Metadatos: autor y fecha de modificación (contenido visible idéntico) | Verificado | Alterado | `f30b294e23447f58…` | PASS |
| N02 | Acuerdo de confidencialidad | Un solo carácter: el punto final de la primera cláusula pasa a ser coma | Verificado | Alterado | `1e098c040b1f8cde…` | PASS |
| N03 | Acuerdo de confidencialidad | Anexo: se agregó una página al final | Verificado | Alterado | `c7d0c9ed5748a107…` | PASS |
| N04 | Acuerdo de confidencialidad | Texto: vigencia de un (1) año a diez (10) años | Verificado | Alterado | `43c16f8f239b2300…` | PASS |
| N05 | Acuerdo de confidencialidad | Firma: se reemplazó el nombre de quien firma | Verificado | Alterado | `46cbaa1bc84bc83d…` | PASS |
| N06 | Acuerdo de confidencialidad | Metadatos: autor y fecha de modificación (contenido visible idéntico) | Verificado | Alterado | `3e73d5f61a8b6a84…` | PASS |
| N07 | Acuerdo de confidencialidad | Un solo carácter: el punto final de la primera cláusula pasa a ser coma | Verificado | Alterado | `0f60fca65c6a96be…` | PASS |
| N08 | Acuerdo de confidencialidad | Anexo: se agregó una página al final | Verificado | Alterado | `50df9c1372ae72d3…` | PASS |
