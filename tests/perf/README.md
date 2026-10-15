# Pruebas de rendimiento

## Latencia de la verificación de integridad (KPI OE3 · RNF‑10)

**Meta:** P95 ≤ 3000 ms en 50 peticiones consecutivas a
`POST /documents/{id}/verifications`, sobre Docker local. **Se corre dos veces: en las
semanas S11 y S13** del cronograma.

Script: [`latencia-verificacion.mjs`](latencia-verificacion.mjs). No usa dependencias
(Node.js 20+). Genera en `docs/evidencias/` un reporte `.md` (resultado, entorno, método,
estadísticas y las 50 mediciones) y un `.csv` con los datos crudos, que es lo que pide
OBJETIVO 3 como evidencia.

### Cómo correrlo (S11 y S13)

1. Stack arriba y limpio: `bash docker/down.sh && bash docker/up.sh`, luego
   `cd backend && npm run seed && cd ..`.
2. **Registrar un documento solo para la medición** (no mezclarlo con datos de demo):
   entrar como Empleado (`contratosblockchain+empleado@gmail.com`) y subir un **PDF de
   tamaño realista** (un contrato real de 1‑5 MB; el tamaño afecta la subida y el cálculo
   del SHA‑256). Copiar su identificador desde "Mis documentos".
3. Desde la raíz del repo:

   ```bash
   node tests/perf/latencia-verificacion.mjs --document <identificador> --file <ruta-del-mismo-pdf>
   ```

   El script inicia sesión como Verificador y **pide el código** que llega a
   `contratosblockchain@gmail.com`. Luego hace 1 petición de calentamiento (no se cuenta)
   y las 50 medidas. Tarda ~2 minutos.
4. Revisar el reporte en `docs/evidencias/latencia-verificacion-<fecha>.md`, **tomar una
   captura de la consola o del reporte**, y hacer commit de los dos archivos.

Opciones: `--n` (cantidad, 50 por defecto), `--email` (otro Verificador), `--code`
(pasar el código sin que lo pregunte), `--base` (otra URL, p. ej. Azure), `--out` (otra
carpeta). Sale con código 0 si cumple la meta y 2 si no.

> **No mezclar entornos** (observación de OBJETIVO 3): el KPI es sobre Docker local. Si
> se mide en Azure, usar `--base` y guardar ese reporte aparte; el reporte deja escrito el
> entorno y el equipo en que se corrió.

### Qué esperar y por qué

Corrida de prueba del 2026‑10‑15 (Docker local, Ryzen 5 7600X, PDF de 0,1 KB):
**P95 = 2040 ms → PASS**, con todas las mediciones entre 2028 y 2047 ms.

Esos ~2 s **no son trabajo del sistema**: el orderer de Fabric está configurado con
`BatchTimeout: 2s` (`configtx.yaml` de la test-network). Con una sola transacción en curso,
el orderer espera hasta 2 segundos a que lleguen más antes de cortar el bloque. El resto
(subida, SHA‑256, consulta al ledger, endoso de las 2 organizaciones, MongoDB) suma
~30 ms. Por eso la latencia es tan estable y queda ~1 s por debajo de la meta. Si en algún
momento hiciera falta bajarla, el parámetro a ajustar es `BatchTimeout` (cambio de la
red: "Ask first" en el SPEC).

### Efecto en los datos

Cada petición es una verificación real: **51 eventos nuevos** en el ledger para ese
documento (con su TxID) y su estado queda en *Verificado*. La trazabilidad general
(`GET /events`) muestra los 200 más recientes, así que después de medir conviene
`bash docker/down.sh && bash docker/up.sh` antes de una demo.
