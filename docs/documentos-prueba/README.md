# Documentos de prueba

Conjunto de **20 documentos sintéticos** para las pruebas del OE4 (alcance del trabajo
de grado: 12 contratos laborales y 8 acuerdos de confidencialidad). Todos los datos son
ficticios: empresa, nombres, cédulas y salarios.

| Carpeta / archivo | Contenido |
|---|---|
| `originales/` | Los 20 documentos tal como se registran en el sistema |
| `alterados/` | Una copia modificada de cada uno; el nombre dice qué alteración tiene |
| `manifiesto.json` | Por documento: tipo, alteración aplicada y SHA-256 del original y del alterado |
| `plantillas/` | Las plantillas del equipo: contrato de trabajo (Word) y modelo de acuerdo de confidencialidad de la OEPM (PDF) |

Los genera [`tests/integrity/generar-documentos.py`](../../tests/integrity/README.md) a partir de las plantillas: los contratos llenan la plantilla de Word y los acuerdos siguen el modelo de la OEPM adaptado a Colombia (cédula, NIT y ley colombiana);
no se editan a mano.

## Alteraciones

Cinco tipos, 4 documentos de cada uno, repartidos entre contratos y acuerdos:

| Tipo | Qué cambia | Documentos |
|---|---|---|
| Texto | Una condición: el salario mensual (contratos) o la vigencia de la confidencialidad (acuerdos) | C01, C06, C11, N04 |
| Firma | La firma del empleado o de la Parte B pasa a ser de "Persona No Autorizada Ficticia" | C02, C07, C12, N05 |
| Metadatos | El autor y la fecha de modificación del PDF; **el contenido visible queda idéntico** | C03, C08, N01, N06 |
| Un carácter | El punto final de la cláusula 1.1 pasa a ser coma | C04, C09, N02, N07 |
| Anexo | Se agrega una página de otrosí al final | C05, C10, N03, N08 |

Resultado de la prueba: [`docs/evidencias/integridad-mutacion.md`](../evidencias/integridad-mutacion.md).
