# TODO — Sprint 0 · módulo `infra` · HU‑021

Plan: `claude_docs/tasks/plan.md` (**aprobado**). Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T5 completos y verificados. T6-T8 quedan fuera de alcance por ahora — el
aplicativo real (front+back) lo construye otro colaborador; su UI ya existe (rama
`Feat/Front`, mergeada a `main`) pero corre con datos de mentira, sin conectar a este
backend todavía.**
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1 — Fundación: red Hyperledger Fabric

### T1: Levantar red Fabric + canal `contratoschannel`

**Descripción:** Script que garantiza la presencia de `fabric-samples` (descarga con versión
fijada si falta), levanta la test‑network con Fabric CA y crea/une el canal
`contratoschannel`. Es la base de todo el sprint.

**Criterios de aceptación:**
- [x] `docker/network-up.sh` deja corriendo: 1 orderer, 2 peers (org1/org2), 3 Fabric CA.
- [x] El canal `contratoschannel` se crea y ambos peers quedan unidos (log `Channel successfully joined`).
- [x] `docker/network-down.sh` elimina contenedores, volúmenes y material cripto (entorno limpio para volver a `up`).
- [x] `fabric-samples/` está en `docker/.gitignore`; versión de Fabric fijada a 2.5.16 / CA 1.5.22 en el script.
- [x] `.gitattributes` fuerza `*.sh eol=lf`.

**Verificación:**
- [x] Manual: `bash docker/network-up.sh` en Git Bash → `docker ps` muestra los 6 contenedores; repetir `up` tras `down` funciona sin errores. Verificado varias veces, incluyendo desde cero tras `network-down.sh`.
- [x] Build: n/a.

**Dependencias:** ninguna.

**Archivos:** `docker/network-up.sh`, `docker/network-down.sh`, `docker/.gitignore`, `.gitattributes`, `docker/README.md` (sección prerequisitos).

**Alcance:** M.

---

### T2: Desplegar chaincode de ejemplo como prueba de pipeline

**Descripción:** Desplegar `asset-transfer-basic` (Go) de `fabric-samples` en
`contratoschannel` para probar todo el ciclo de vida del chaincode (package → install →
approve → commit → invoke). Placeholder hasta el chaincode real de Sprint 2.

**Criterios de aceptación:**
- [x] `docker/deploy-sample-cc.sh` empaqueta, instala, aprueba y hace commit del chaincode `basic` en `contratoschannel`.
- [x] Tras `InitLedger`, `peer chaincode query -C contratoschannel -n basic -c '{"Args":["GetAllAssets"]}'` devuelve la lista de activos.
- [x] El script es idempotente o falla con mensaje claro si ya está desplegado. (InitLedger se invoca siempre — es idempotente por diseño del chaincode de ejemplo, no por detección.)

**Verificación:**
- [x] Manual: ejecutar el script tras T1 → la query devuelve JSON con 6 activos. Verificado en corrida limpia desde cero y en una segunda corrida inmediata (idempotencia).

**Dependencias:** T1.

**Archivos:** `docker/deploy-sample-cc.sh`.

**Alcance:** S.

---

### ✅ Checkpoint: red Fabric operativa
- [x] `network-up.sh` + `deploy-sample-cc.sh` desde checkout limpio dejan una query del ledger respondiendo.
- [x] `network-down.sh` limpia todo.
- [x] Revisado (2 rondas de `code-reviewer` sobre T1 y T2, hallazgos aplicados).

---

## Fase 2 — Datos y esqueletos de aplicación

### T3: Servicio MongoDB + red Docker de la app

**Descripción:** Compose de servicios de aplicación con `mongo`, volumen persistente y
healthcheck, unido a la red Docker `fabric_test` que crea la test‑network.

**Criterios de aceptación:**
- [x] `docker/compose.app.yml` define el servicio `mongo` (imagen fijada `7.0.41`) con volumen nombrado y healthcheck.
- [x] El servicio se une a la red externa `fabric_test`.
- [x] `docker/.env.example` documenta `MONGO_*` y deja el lugar para `VITE_API_URL` (llega en T6); `.env` está gitignoreado.

**Verificación:**
- [x] Manual: `cp docker/.env.example docker/.env` (requerido, ver `docker/README.md`), luego `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo` → contenedor `healthy`; `docker exec mongo mongosh -u root -p changeme --authenticationDatabase admin --eval "db.adminCommand('ping')"` responde `{ ok: 1 }`.

**Dependencias:** ninguna (la red `fabric_test` la crea T1 en tiempo de ejecución).

**Archivos:** `docker/compose.app.yml`, `docker/.env.example`.

**Alcance:** S.

---

### T4: Esqueleto del `backend` (`/health` + conexión a Mongo)

**Descripción:** *Walking skeleton* del `backend`: Express + TypeScript (D6), estructura por
capas de SPEC §6, `GET /health`, conexión a MongoDB al arrancar, Dockerfile. Sin lógica de
negocio. Fija las convenciones de `backend/`.

**Criterios de aceptación:**
- [x] `GET /health` responde `200` con `{ "status": "ok", "mongo": "connected" }` (o `"mongo": "down"` + `503` si no conecta).
- [x] Estructura creada: `src/routes/`, `src/services/`, `src/repositories/`, `src/fabric/`, `src/config/` (`services/` y `fabric/` vacías con `.gitkeep` — llegan en T5+).
- [x] `backend/Dockerfile` multi‑stage; el servicio `backend` en `compose.app.yml` construye y arranca. Corre como usuario no-root (`node`, uid 1000).
- [x] `backend/.env.example`, `backend/.dockerignore`, script de lint definido en `package.json` (oxlint, mismo linter que `frontend/`).
- [x] Comandos añadidos a `SPEC.md` §5 y `CLAUDE.md` (Commands): `npm run dev`, `npm test`, `npm run lint`, `npm run build`.

**Verificación:**
- [x] Tests: `npm test` (2 pruebas de `/health` con `isMongoHealthy` mockeado — camino feliz y de error).
- [x] Build: `npm run build` sin errores de `tsc`.
- [x] Manual: `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo backend` → `curl localhost:8080/health` devuelve el JSON esperado. Verificado también con Mongo real apagado (503 en ~3s gracias a los timeouts del cliente, no el default de 30s) y con `PORT` inválido (error claro en vez de stack trace crudo).

**Dependencias:** T3.

**Archivos:** `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.json`,
`backend/jest.config.js`, `backend/Dockerfile`, `backend/.dockerignore`,
`backend/.env.example`, `backend/README.md`, `backend/src/server.ts`,
`backend/src/config/env.ts`, `backend/src/routes/health.ts`,
`backend/src/repositories/mongoClient.ts`, `backend/src/services/.gitkeep`,
`backend/src/fabric/.gitkeep`, `backend/tests/health.test.ts`. *(Terminó pasado el límite
de ≤5 archivos por tarea de SPEC.md §10.3 — quedó como una sola tarea porque son piezas de
un mismo esqueleto mínimo sin lógica de negocio, no módulos independientes; no se dividió
en sub-pasos.)*

**Alcance:** M.

---

### T5: `backend` ↔ Fabric Gateway (`/fabric/ping`)

**Descripción:** Cablear el Fabric Gateway SDK en el `backend`: cargar connection profile con
nombres DNS de contenedor + identidad Admin de Org1 desde el material de `fabric-samples`,
y exponer `GET /fabric/ping` que hace una query al chaincode de ejemplo. **Slice de mayor
riesgo del sprint** — retira la incógnita SDK↔Fabric antes de Sprint 2.

**Criterios de aceptación:**
- [x] `GET /fabric/ping` responde `200` con el resultado de `GetAllAssets` del chaincode `basic` en `contratoschannel`.
- [x] La conexión usa `grpcs://` con TLS y `peer0.org1.example.com` como host (no `localhost`). Nota de diseño: la Fabric Gateway API (a diferencia del SDK viejo `fabric-network`) solo dialoga con un peer — ese peer resuelve el endorsement y reenvía al orderer por su cuenta en `submitTransaction`, así que el backend nunca necesita una conexión gRPC aparte a `orderer.example.com`. `GetAllAssets` además es una `evaluateTransaction` (query de solo lectura), que ni siquiera pasa por el orderer.
- [x] La identidad se lee en el arranque desde una ruta montada del `fabric-samples/organizations/...`; si falta, `/fabric/ping` devuelve `503` con mensaje claro (verificado apuntando `FABRIC_CRYPTO_PATH` a una ruta inexistente).
- [x] `src/fabric/gateway.ts` encapsula la conexión; las rutas no tocan el SDK directamente.

**Verificación:**
- [x] Manual: con red + chaincode + `backend` arriba → `curl localhost:8080/fabric/ping` devuelve los activos del ledger. Verificado local (contra `localhost:7051`) y dockerizado (contra `peer0.org1.example.com:7051` real, vía el volumen `/crypto` montado de solo lectura) en una reconstrucción completa desde cero.
- [x] Build: `npm run build` ok. `npm test` también (4/4 — se agregó `tests/fabric.test.ts` con el mismo patrón de mocks que `health.test.ts`).

**Dependencias:** T1, T2, T4.

**Archivos:** `backend/src/fabric/gateway.ts`, `backend/src/routes/fabric.ts`, `backend/src/config/fabric.ts`, wiring en `backend/src/server.ts`, `docker/compose.app.yml` (montaje del volumen de crypto).

**Alcance:** M.

---

### T6: `frontend` en contenedor + página de estado del sistema

**Descripción:** Dockerfile del `frontend` (build Vite → `nginx:alpine`), cliente API mínimo
que lee `VITE_API_URL`, y reemplazo del `App.tsx` de plantilla por una página "Estado del
sistema" que muestra el resultado de `GET /health`. Demuestra RNF‑20 / HU‑021 CA‑02.

**Criterios de aceptación:**
- [ ] `frontend/Dockerfile` construye la SPA y la sirve como estático; el servicio `frontend` en `compose.app.yml` la publica.
- [ ] La página inicial llama a `${VITE_API_URL}/health` y muestra estado de `backend` y `mongo`.
- [ ] `grep -rE "7051|9051|7050|27017|:5984|fabric|mongodb://" frontend/src` no encuentra endpoints de infraestructura (solo `VITE_API_URL`).
- [ ] `npm run build` y `npm run lint` (oxlint) pasan.

**Verificación:**
- [ ] Manual: `docker compose -f docker/compose.app.yml up -d` → abrir `http://localhost:5173` (o el puerto configurado) muestra el estado del backend en verde.
- [ ] Manual: revisión de código confirma que el frontend solo habla con `VITE_API_URL`.

**Dependencias:** T4.

**Archivos:** `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/nginx.conf`, `frontend/src/lib/api.ts`, `frontend/src/App.tsx`, `frontend/.env.example`.

**Alcance:** M.

---

### ✅ Checkpoint: esqueleto de app conectado a Fabric + Mongo
- [x] `backend` `/health` verde y `/fabric/ping` devuelve datos del ledger.
- [ ] `frontend` muestra el estado y no referencia infraestructura. **No aplica todavía**:
  el frontend real (rama `Feat/Front`, ya en `main`) es un prototipo visual con datos
  hardcodeados en `src/data/*.ts` — no llama a `VITE_API_URL` ni a ningún backend. T6
  (dockerizar el frontend + página de estado) sigue sin hacerse.
- [ ] Todos los tests y builds (`backend`, `frontend`) pasan. Backend sí (`npm test`,
  `npm run build`); frontend no se tocó en este checkpoint.
- [ ] Revisar con el equipo antes de seguir.

---

## Fase 3 — Orquestación de una sola orden y documentación

### T7: `up.sh` / `down.sh` + documentación

**Descripción:** Orden única que encadena red Fabric → chaincode de ejemplo → compose de
app; y su inversa. Documentar prerequisitos, puertos y comandos. Actualizar `CLAUDE.md` y
`SPEC.md`.

**Criterios de aceptación:**
- [ ] `docker/up.sh` deja corriendo: orderer, 2 peers, 3 CA, `mongo`, `backend`, `frontend` — todos `healthy`/`Up`.
- [ ] `docker/down.sh` elimina todo lo anterior + volúmenes (entorno limpio).
- [ ] `docker/README.md`: prerequisitos (Docker Desktop, Git Bash/WSL2), lista de puertos, comandos, nota de CRLF.
- [ ] `CLAUDE.md` → *Commands* y `claude_docs/SPEC.md` §5 actualizados con los comandos de `docker/` y `backend/`.

**Verificación:**
- [ ] Manual: desde un checkout limpio (`git clean -xfd` en una copia), `bash docker/up.sh` → todos los contenedores arriba; `frontend` carga; `/fabric/ping` responde. Luego `bash docker/down.sh` → `docker ps` vacío de este proyecto.

**Dependencias:** T1‑T6.

**Archivos:** `docker/up.sh`, `docker/down.sh`, `docker/README.md`, `CLAUDE.md`, `claude_docs/SPEC.md`.

**Alcance:** M.

---

### T8: Verificación de HU‑021 (smoke test CA‑01 / CA‑02)

**Descripción:** Script que asevera los dos escenarios Gherkin de HU‑021 y deja evidencia
para el PPS.

**Criterios de aceptación:**
- [ ] `docker/smoke-test.sh` verifica **CA‑01**: los servicios `orderer`, `peer0.org1`, `peer0.org2`, `mongo`, `backend`, `frontend` están `Up`, y el chaincode responde en `contratoschannel`.
- [ ] Verifica **CA‑02**: `grep` sobre `frontend/src` no encuentra llamadas directas a nodos Fabric ni a Mongo (falla el script si aparece alguna).
- [ ] El script sale con código `0` en éxito y `≠0` describiendo qué falló.
- [ ] Se guarda `claude_docs/tasks/sprint-0-resultados.md` con la fecha, versión de imágenes y salida del smoke test (evidencia DoD criterios 2 y 4).

**Verificación:**
- [ ] Manual: `bash docker/up.sh && bash docker/smoke-test.sh` → exit 0.

**Dependencias:** T7.

**Archivos:** `docker/smoke-test.sh`, `claude_docs/tasks/sprint-0-resultados.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑021 terminada (DoD — SPEC §10.2)
- [ ] Smoke test en PASS (CA‑01 y CA‑02) — criterio DoD 2.
- [ ] RNF‑19, 20, 21, 22 marcados como implementados en la trazabilidad — criterio DoD 3.
- [ ] Entorno verificado en Docker Compose — criterio DoD 4.
- [ ] PR abierto y revisado; mensaje de commit redactado (sin commit automático) — criterio DoD 1.
- [ ] Aceptación de dirección/codirección registrada — criterio DoD 5.
