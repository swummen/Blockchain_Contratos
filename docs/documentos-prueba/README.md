# Documentos de prueba

Conjunto de **20 documentos sintéticos** para las pruebas del OE4 (alcance del trabajo
de grado: 12 contratos laborales y 8 acuerdos de confidencialidad). Todos los datos son
ficticios: empresa, nombres, cédulas y salarios.

| Carpeta / archivo | Contenido |
|---|---|
| `originales/` | Los 20 documentos tal como se registran en el sistema |
| `alterados/` | Una copia modificada de cada uno; el nombre dice qué alteración tiene |
| `manifiesto.json` | Por documento: tipo, alteración aplicada y SHA-256 del original y del alterado |

Los genera [`tests/integrity/generar-documentos.mjs`](../../tests/integrity/README.md);
no se editan a mano.

## Alteraciones

Cinco tipos, 4 documentos de cada uno, repartidos entre contratos y acuerdos:

| Tipo | Qué cambia | Documentos |
|---|---|---|
| Texto | Una condición: el salario (contratos) o la vigencia (acuerdos) | C01, C06, C11, N04 |
| Firma | El nombre de quien firma pasa a ser "Persona No Autorizada Ficticia" | C02, C07, C12, N05 |
| Metadatos | El autor y la fecha de modificación; **el contenido visible queda idéntico** | C03, C08, N01, N06 |
| Un carácter | El punto final de la primera cláusula pasa a ser coma | C04, C09, N02, N07 |
| Anexo | Se agrega una página "Otrosí" al final | C05, C10, N03, N08 |

Resultado de la prueba: [`docs/evidencias/integridad-mutacion.md`](../evidencias/integridad-mutacion.md).
