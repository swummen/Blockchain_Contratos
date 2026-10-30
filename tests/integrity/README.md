# Prueba de integridad por mutación documental

**KPI OE4 · RNF-14:** el sistema debe detectar como alterados el **100 %** de los 20
documentos modificados, sin marcar como alterado ningún original.

| Archivo | Qué hace |
|---|---|
| [`generar-documentos.py`](generar-documentos.py) | Crea los 20 documentos sintéticos y sus copias alteradas en [`docs/documentos-prueba/`](../../docs/documentos-prueba/README.md) a partir de las plantillas del equipo (contrato laboral y acuerdo de confidencialidad). Usa Microsoft Word para exportar a PDF (solo Windows) |
| [`ejecutar-prueba.mjs`](ejecutar-prueba.mjs) | Registra, verifica y comprueba la trazabilidad de los 20 documentos por la API; escribe el informe |
| `resultados/` | Un `.csv` por corrida, con los datos crudos |

El informe de la última corrida queda en
[`docs/evidencias/integridad-mutacion.md`](../../docs/evidencias/integridad-mutacion.md).

**Corrida oficial:** 29/10/2026 contra el servidor de validación en Azure: 20 de 20 alteraciones detectadas, 0 falsos positivos y 20 de 20 con su trazabilidad en el ledger.

## Qué comprueba por cada documento

1. El Empleado registra el original: su hash queda en el ledger.
2. El Verificador lo verifica **con el original**: debe dar **Verificado**. Es el
   control de falsos positivos: sin él, un sistema que respondiera "Alterado" a todo
   también sacaría 100 %.
3. El Verificador lo verifica **con el alterado**: debe dar **Alterado**.
4. Los hashes que devuelve la API son los que se calcularon al generar los archivos.
5. La trazabilidad del ledger tiene el registro y las 2 verificaciones.

## Ejecución oficial contra Azure

No cambia nada en el servidor: el script usa la API igual que el navegador. Desde la
raíz del repositorio, en tu PC:

```bash
node tests/integrity/ejecutar-prueba.mjs --api https://<tu-dominio>/api
```

El script pide, para el Empleado y luego para el Verificador: el correo (Enter acepta
el sugerido), la contraseña (no se ve al escribirla) y el código que llega a
`contratosblockchain@gmail.com`. Después corre solo, unos 2 minutos.

Al terminar, `docs/evidencias/integridad-mutacion.md` dice **Entorno: Servidor de
validación (Azure)**. Ese es el informe que va al documento de grado. Haz commit del
informe y del `.csv` de `resultados/`.

Cada corrida registra los 20 documentos otra vez (con identificadores nuevos). Se puede
repetir sin problema.

## Ejecución local (ensayo)

Con el sistema local arriba y el backend sin correo (`SMTP_HOST` vacío), el script lee
los códigos de `docker logs backend`:

```bash
node tests/integrity/ejecutar-prueba.mjs --otp-desde-logs
```

## Volver a generar los documentos

Solo si cambian las plantillas, los datos o las alteraciones (requiere Windows con
Microsoft Word y el paquete de Python `pymupdf`):

```bash
python tests/integrity/generar-documentos.py
```

Cada generación produce PDF nuevos (Word escribe la fecha de creación en el archivo),
así que los hashes de [`manifiesto.json`](../../docs/documentos-prueba/manifiesto.json)
cambian. Después de regenerar hay que volver a correr la prueba.
