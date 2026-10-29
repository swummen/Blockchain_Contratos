# Prueba de integridad por mutación documental (OE4 · RNF-14)

| | |
|---|---|
| **Resultado del KPI** | **CUMPLE**: 20 de 20 alteraciones detectadas (100 %, meta 100 %) |
| Falsos positivos | 0 de 20 originales marcados como alterados (meta 0) |
| Trazabilidad en el ledger | 20 de 20 documentos con registro y sus 2 verificaciones |
| Casos PASS | 20 de 20 |
| Fecha | 29/10/2026, 10:27:07 a. m. |
| Entorno | **Servidor de validación (Azure)** (`https://trazadoc-tesis.eastus2.cloudapp.azure.com/api`) |
| Latencia media | registro 2112 ms · verificación 2112 ms |
| Datos crudos | `tests/integrity/resultados/corrida-2026-10-29-10-27.csv` |

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
| C01 | Contrato laboral | Texto: salario mensual de $3.200.000 a $3.500.000 | Verificado | Alterado | `be896c83b2d72443…` | PASS |
| C02 | Contrato laboral | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `5764dc8c32a8b77c…` | PASS |
| C03 | Contrato laboral | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `8b2ecb8806cf5b4d…` | PASS |
| C04 | Contrato laboral | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `5f11c83c858da7c2…` | PASS |
| C05 | Contrato laboral | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `841e88aa8c3bc57c…` | PASS |
| C06 | Contrato laboral | Texto: salario mensual de $2.300.000 a $2.600.000 | Verificado | Alterado | `ebffe2ea934baf45…` | PASS |
| C07 | Contrato laboral | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `8ff1ed85a8a437f4…` | PASS |
| C08 | Contrato laboral | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `5519fccdd823a293…` | PASS |
| C09 | Contrato laboral | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `96c5ae82b8b2d565…` | PASS |
| C10 | Contrato laboral | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `1b2dd77b0b45305d…` | PASS |
| C11 | Contrato laboral | Texto: salario mensual de $4.500.000 a $4.800.000 | Verificado | Alterado | `37edb00f9cc1e544…` | PASS |
| C12 | Contrato laboral | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `7955b0a1bb15d5a0…` | PASS |
| N01 | Acuerdo de confidencialidad | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `4c4f8fced524278a…` | PASS |
| N02 | Acuerdo de confidencialidad | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `bc4ead5d3e9f76f0…` | PASS |
| N03 | Acuerdo de confidencialidad | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `6c6833516a8c4639…` | PASS |
| N04 | Acuerdo de confidencialidad | Texto: vigencia de un (1) año a diez (10) años | Verificado | Alterado | `8c84da4b9c22c671…` | PASS |
| N05 | Acuerdo de confidencialidad | Firma: el firmante pasa a ser "Persona No Autorizada Ficticia" | Verificado | Alterado | `3a52501ca87e47be…` | PASS |
| N06 | Acuerdo de confidencialidad | Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico) | Verificado | Alterado | `98f2e1957ab6a113…` | PASS |
| N07 | Acuerdo de confidencialidad | Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma | Verificado | Alterado | `08567adbb44e1327…` | PASS |
| N08 | Acuerdo de confidencialidad | Anexo: se agregó una página de otrosí al final | Verificado | Alterado | `08c44fa66d5b8c56…` | PASS |
