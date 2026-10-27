# Medición de latencia: verificación de integridad (RNF-10)

| | |
|---|---|
| **Resultado** | **PASS**: P95 = **2059 ms** (meta ≤ 3000 ms) |
| Fecha | 27/10/2026, 1:12:23 p. m. |
| Entorno | **Docker local** (no Azure) |
| Equipo | Windows_NT 10.0.26200 · AMD Ryzen 5 7600X 6-Core Processor (12 hilos) · 31.1 GB RAM |
| Docker / Node | 28.5.2 / v22.19.0 |
| Contenedores | backend (contratos-backend), mongo (mongo:7.0.41), orderer.example.com (hyperledger/fabric-orderer:latest), peer0.org2.example.com (hyperledger/fabric-peer:latest), peer0.org1.example.com (hyperledger/fabric-peer:latest) |
| Endpoint | `POST http://127.0.0.1:8080/documents/{id}/verifications` (rol Verificador) |
| Documento | `a06d26f5-d8b9-4d5e-99bb-c7c241b2ae5a` · archivo `contrato-medicion-latencia.pdf` (2710.6 KB) |

## Método

- Herramienta: `tests/perf/latencia-verificacion.mjs` (Node.js, `fetch` + `performance.now()`), sin dependencias externas.
- 50 peticiones **consecutivas** (cada una empieza cuando termina la anterior), más 1 de calentamiento que no se cuenta.
- Se mide el tiempo completo visto por el cliente: subida del PDF, validación, SHA-256, consulta de la huella al ledger, transacción `RecordVerification` (endoso de Org1 y Org2, ordenamiento y confirmación del bloque) y actualización de MongoDB.
- P95 por el método del rango más cercano: valor en la posición ⌈0,95 · n⌉ de las mediciones ordenadas.
- Respuestas correctas: 50 de 50.

## Resultados

| Mínimo | Promedio | P50 | P90 | **P95** | P99 | Máximo |
|---|---|---|---|---|---|---|
| 2041 ms | 2049 ms | 2048 ms | 2057 ms | **2059 ms** | 2072 ms | 2072 ms |

## Las 50 mediciones

| # | Latencia (ms) | HTTP | Resultado |
|---|---|---|---|
| 1 | 2057 | 200 | Verificado |
| 2 | 2057 | 200 | Verificado |
| 3 | 2049 | 200 | Verificado |
| 4 | 2058 | 200 | Verificado |
| 5 | 2046 | 200 | Verificado |
| 6 | 2053 | 200 | Verificado |
| 7 | 2049 | 200 | Verificado |
| 8 | 2049 | 200 | Verificado |
| 9 | 2044 | 200 | Verificado |
| 10 | 2049 | 200 | Verificado |
| 11 | 2046 | 200 | Verificado |
| 12 | 2049 | 200 | Verificado |
| 13 | 2042 | 200 | Verificado |
| 14 | 2049 | 200 | Verificado |
| 15 | 2049 | 200 | Verificado |
| 16 | 2044 | 200 | Verificado |
| 17 | 2050 | 200 | Verificado |
| 18 | 2043 | 200 | Verificado |
| 19 | 2053 | 200 | Verificado |
| 20 | 2044 | 200 | Verificado |
| 21 | 2047 | 200 | Verificado |
| 22 | 2043 | 200 | Verificado |
| 23 | 2060 | 200 | Verificado |
| 24 | 2048 | 200 | Verificado |
| 25 | 2051 | 200 | Verificado |
| 26 | 2045 | 200 | Verificado |
| 27 | 2047 | 200 | Verificado |
| 28 | 2047 | 200 | Verificado |
| 29 | 2049 | 200 | Verificado |
| 30 | 2056 | 200 | Verificado |
| 31 | 2048 | 200 | Verificado |
| 32 | 2047 | 200 | Verificado |
| 33 | 2047 | 200 | Verificado |
| 34 | 2045 | 200 | Verificado |
| 35 | 2042 | 200 | Verificado |
| 36 | 2046 | 200 | Verificado |
| 37 | 2044 | 200 | Verificado |
| 38 | 2049 | 200 | Verificado |
| 39 | 2053 | 200 | Verificado |
| 40 | 2042 | 200 | Verificado |
| 41 | 2047 | 200 | Verificado |
| 42 | 2045 | 200 | Verificado |
| 43 | 2050 | 200 | Verificado |
| 44 | 2041 | 200 | Verificado |
| 45 | 2047 | 200 | Verificado |
| 46 | 2059 | 200 | Verificado |
| 47 | 2049 | 200 | Verificado |
| 48 | 2052 | 200 | Verificado |
| 49 | 2072 | 200 | Verificado |
| 50 | 2054 | 200 | Verificado |

Datos crudos: `latencia-verificacion-2026-10-27-13-12.csv`.
