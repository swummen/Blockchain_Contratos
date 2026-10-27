# Prueba de integridad por mutación documental (OE4 · RNF-14)

| | |
|---|---|
| **Resultado del KPI** | **CUMPLE**: 20 de 20 alteraciones detectadas (100 %, meta 100 %) |
| Falsos positivos | 0 de 20 originales marcados como alterados (meta 0) |
| Trazabilidad en el ledger | 20 de 20 documentos con registro y sus 2 verificaciones |
| Casos PASS | 20 de 20 |
| Fecha | 27/10/2026, 3:29:37 p. m. |
| Entorno | **Docker local** (`http://localhost:5173/api`) |
| Latencia media | registro 2040 ms · verificación 2036 ms |
| Datos crudos | `tests/integrity/resultados/corrida-2026-10-27-15-29.csv` |

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
| C01 | Contrato laboral | Texto: salario mensual de $3.200.000 a $3.500.000 | Verificado | Alterado | `a57eb5c0554c7962…` | PASS |
| C02 | Contrato laboral | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `e05ba774acda05e8…` | PASS |
| C03 | Contrato laboral | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `b1f45bcfb66fd399…` | PASS |
| C04 | Contrato laboral | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `390bc5e4199e77fa…` | PASS |
| C05 | Contrato laboral | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `29bf7f024e3c88aa…` | PASS |
| C06 | Contrato laboral | Texto: salario mensual de $2.300.000 a $2.600.000 | Verificado | Alterado | `6e3a3066e2fea724…` | PASS |
| C07 | Contrato laboral | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `80876ebdd3c84da6…` | PASS |
| C08 | Contrato laboral | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `21051e57b4904f33…` | PASS |
| C09 | Contrato laboral | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `75818073e8b86393…` | PASS |
| C10 | Contrato laboral | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `1c465e53d09fec24…` | PASS |
| C11 | Contrato laboral | Texto: salario mensual de $4.500.000 a $4.800.000 | Verificado | Alterado | `f4c0f07e2bcb501c…` | PASS |
| C12 | Contrato laboral | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `1d096e26cbdb504c…` | PASS |
| N01 | Acuerdo de confidencialidad | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `def5324364f4d492…` | PASS |
| N02 | Acuerdo de confidencialidad | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `636c8cd87937a750…` | PASS |
| N03 | Acuerdo de confidencialidad | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `f4d89eb124b83ad9…` | PASS |
| N04 | Acuerdo de confidencialidad | Texto: vigencia de un (1) año a diez (10) años | Verificado | Alterado | `a5a56906149cc5d8…` | PASS |
| N05 | Acuerdo de confidencialidad | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `807107caaf59200b…` | PASS |
| N06 | Acuerdo de confidencialidad | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `1c80f451974177d1…` | PASS |
| N07 | Acuerdo de confidencialidad | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `bb18368531ae07ee…` | PASS |
| N08 | Acuerdo de confidencialidad | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `b49298cbce8b17b1…` | PASS |
