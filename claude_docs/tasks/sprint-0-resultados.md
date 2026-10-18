# Sprint 0: resultados (HU-021, evidencia para el PPS)

Fecha de verificación: **2026-09-19**.

## Versiones de imágenes

| Componente | Versión |
|---|---|
| Hyperledger Fabric (orderer, peers) | 2.5.16 |
| Fabric CA | 1.5.22 |
| MongoDB | 7.0.41 |
| Backend (Node runtime dentro del contenedor, `node:20-alpine`) | v20.20.2 |
| Frontend (build de Vite servido por `nginx:alpine`) | build de producción, sin runtime de Node |

## Comando ejecutado

```
bash docker/up.sh && bash docker/smoke-test.sh
```

`docker/up.sh` ya estaba corrido de la verificación de T7 (stack completo arriba: orderer,
2 peers, 3 CA, mongo, backend, frontend); `docker/smoke-test.sh` se corrió tal cual contra
ese stack real.

## Salida del smoke test (CA-01 y CA-02): PASS

```
==> CA-01: servicios arriba (orderer, 2 peers, mongo, backend, frontend)
OK: orderer.example.com -> Up 31 minutes
OK: peer0.org1.example.com -> Up 31 minutes
OK: peer0.org2.example.com -> Up 31 minutes
OK: mongo -> Up 30 minutes (healthy)
OK: backend -> Up 7 seconds
OK: frontend -> Up 30 minutes

==> CA-01: el chaincode responde en contratoschannel (GET /fabric/ping)
OK: /fabric/ping devolvió activos del ledger.

==> CA-02: frontend/src no referencia infraestructura directamente
OK: frontend/src no referencia Fabric/Mongo directamente (solo VITE_API_URL).

==> Smoke test HU-021: PASS (CA-01 y CA-02).
```

Exit code: `0`.

## Verificación del camino de fallo (exit code ≠ 0)

Para confirmar que el script realmente detecta y reporta problemas (no solo que el camino
feliz "se ve bien"), se paró el contenedor `backend` (`docker stop backend`) y se corrió de
nuevo:

```
==> CA-01: servicios arriba (orderer, 2 peers, mongo, backend, frontend)
...
FALLO: 'backend' no está corriendo (docker ps no lo muestra).
...
==> CA-01: el chaincode responde en contratoschannel (GET /fabric/ping)
FALLO: GET /fabric/ping no devolvió datos del ledger. Salida: curl: (7) Failed to connect
to localhost port 8080 after 2242 ms: Could not connect to server
...
==> Smoke test HU-021: FALLÓ. Ver mensajes arriba.
```

Exit code: `1`. Se reinició `backend` (`docker start backend`) y una corrida posterior
volvió a dar `PASS` con exit code `0` (salida reproducida arriba).

## Trazabilidad DoD (SPEC §10.2, HU-021)

1. Revisión por pares + merge a `main`: pendiente de PR (ver mensaje de commit redactado en
   `claude_docs/tasks/todo.md`).
2. Casos del PPS de HU-021 (CA-01, CA-02) en PASS: **cubierto**, evidencia arriba.
3. RNF-19, 20, 21, 22 implementados: cubierto por T1-T7 (red reproducible, frontend sin
   acceso directo a infraestructura, versiones fijadas, entorno de una sola orden).
4. Desplegado y verificado en Docker Compose: **cubierto**, `docker/up.sh` + este smoke test.
5. Aceptación de dirección/codirección: pendiente (fuera del alcance de este documento).
