# TODO — Sprint 0 · módulo `infra` · HU‑021

Plan: `claude_docs/tasks/plan.md` (**aprobado**). Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **no iniciado**.
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1 — Fundación: red Hyperledger Fabric

### T1: Levantar red Fabric + canal `contratoschannel`

**Descripción:** Script que garantiza la presencia de `fabric-samples` (descarga con versión
fijada si falta), levanta la test‑network con Fabric CA y crea/une el canal
`contratoschannel`. Es la base de todo el sprint.

**Criterios de aceptación:**
- [ ] `docker/network-up.sh` deja corriendo: 1 orderer, 2 peers (org1/org2), 3 Fabric CA.
- [ ] El canal `contratoschannel` se crea y ambos peers quedan unidos (log `Channel successfully joined`).
- [ ] `docker/network-down.sh` elimina contenedores, volúmenes y material cripto (entorno limpio para volver a `up`).
- [ ] `fabric-samples/` está en `docker/.gitignore`; versión de Fabric fijada a 2.5.x / CA 1.5.x en el script.
- [ ] `.gitattributes` fuerza `*.sh eol=lf`.

**Verificación:**
- [ ] Manual: `bash docker/network-up.sh` en Git Bash → `docker ps` muestra los 6 contenedores; repetir `up` tras `down` funciona sin errores.
- [ ] Build: n/a.

**Dependencias:** ninguna.

**Archivos:** `docker/network-up.sh`, `docker/network-down.sh`, `docker/.gitignore`, `.gitattributes`, `docker/README.md` (sección prerequisitos).

**Alcance:** M.

---

### T2: Desplegar chaincode de ejemplo como prueba de pipeline

**Descripción:** Desplegar `asset-transfer-basic` (Go) de `fabric-samples` en
`contratoschannel` para probar todo el ciclo de vida del chaincode (package → install →
approve → commit → invoke). Placeholder hasta el chaincode real de Sprint 2.

**Criterios de aceptación:**
- [ ] `docker/deploy-sample-cc.sh` empaqueta, instala, aprueba y hace commit del chaincode `basic` en `contratoschannel`.
- [ ] Tras `InitLedger`, `peer chaincode query -C contratoschannel -n basic -c '{"Args":["GetAllAssets"]}'` devuelve la lista de activos.
- [ ] El script es idempotente o falla con mensaje claro si ya está desplegado.

**Verificación:**
- [ ] Manual: ejecutar el script tras T1 → la query devuelve JSON con 6 activos.

**Dependencias:** T1.

**Archivos:** `docker/deploy-sample-cc.sh`.

**Alcance:** S.

---

### ✅ Checkpoint: red Fabric operativa
- [ ] `network-up.sh` + `deploy-sample-cc.sh` desde checkout limpio dejan una query del ledger respondiendo.
- [ ] `network-down.sh` limpia todo.
- [ ] Revisar con el equipo antes de seguir.

---

## Fase 2 — Datos y esqueletos de aplicación

### T3: Servicio MongoDB + red Docker de la app

**Descripción:** Compose de servicios de aplicación con `mongo`, volumen persistente y
healthcheck, unido a la red Docker `fabric_test` que crea la test‑network.

**Criterios de aceptación:**
- [ ] `docker/compose.app.yml` define el servicio `mongo` (imagen 7.x) con volumen nombrado y healthcheck.
- [ ] El servicio se une a la red externa `fabric_test`.
- [ ] `docker/.env.example` documenta `MONGO_*`, puertos y `VITE_API_URL`; `.env` está gitignoreado (ya lo está en la raíz).

**Verificación:**
- [ ] Manual: `docker compose -f docker/compose.app.yml up -d mongo` → contenedor `healthy`; `docker exec ... mongosh --eval "db.runCommand({ping:1})"` responde `ok: 1`.

**Dependencias:** ninguna (la red `fabric_test` la crea T1 en tiempo de ejecución).

**Archivos:** `docker/compose.app.yml`, `docker/.env.example`.

**Alcance:** S.

---

### T4: Esqueleto del `backend` (`/health` + conexión a Mongo)

**Descripción:** *Walking skeleton* del `backend`: Express + TypeScript (D6), estructura por
capas de SPEC §6, `GET /health`, conexión a MongoDB al arrancar, Dockerfile. Sin lógica de
negocio. Fija las convenciones de `backend/`.

**Criterios de aceptación:**
- [ ] `GET /health` responde `200` con `{ "status": "ok", "mongo": "connected" }` (o `"mongo": "down"` + `503` si no conecta).
- [ ] Estructura creada: `src/routes/`, `src/services/`, `src/repositories/`, `src/fabric/`, `src/config/` (aunque algunas queden vacías con `.gitkeep`).
- [ ] `backend/Dockerfile` multi‑stage; el servicio `backend` en `compose.app.yml` construye y arranca.
- [ ] `backend/.env.example`, `backend/.dockerignore`, script de lint definido en `package.json`.
- [ ] Comandos añadidos a `SPEC.md` §5 y `CLAUDE.md` (Commands): `npm run dev`, `npm test`, `npm run lint`, `npm run build`.

**Verificación:**
- [ ] Tests: `npm test` (una prueba de `/health` con Mongo mockeado o efímero).
- [ ] Build: `npm run build` sin errores de `tsc`.
- [ ] Manual: `docker compose -f docker/compose.app.yml up -d mongo backend` → `curl localhost:8080/health` devuelve el JSON esperado.

**Dependencias:** T3.

**Archivos:** `backend/package.json`, `backend/tsconfig.json`, `backend/Dockerfile`, `backend/.dockerignore`, `backend/.env.example`, `backend/src/server.ts`, `backend/src/config/*`, `backend/src/routes/health.ts`, `backend/tests/health.test.ts`. *(Cerca del límite; si crece, separar la config de lint/tsconfig en un sub‑paso.)*

**Alcance:** M.

---

### T5: `backend` ↔ Fabric Gateway (`/fabric/ping`)

**Descripción:** Cablear el Fabric Gateway SDK en el `backend`: cargar connection profile con
nombres DNS de contenedor + identidad Admin de Org1 desde el material de `fabric-samples`,
y exponer `GET /fabric/ping` que hace una query al chaincode de ejemplo. **Slice de mayor
riesgo del sprint** — retira la incógnita SDK↔Fabric antes de Sprint 2.

**Criterios de aceptación:**
- [ ] `GET /fabric/ping` responde `200` con el resultado de `GetAllAssets` del chaincode `basic` en `contratoschannel`.
- [ ] La conexión usa `grpcs://` con TLS y `peer0.org1.example.com` / `orderer.example.com` como hosts (no `localhost`).
- [ ] La identidad se lee en el arranque desde una ruta montada del `fabric-samples/organizations/...`; si falta, `/fabric/ping` devuelve `503` con mensaje claro.
- [ ] `src/fabric/gateway.ts` encapsula la conexión; las rutas no tocan el SDK directamente.

**Verificación:**
- [ ] Manual: con red + chaincode + `backend` arriba → `curl localhost:8080/fabric/ping` devuelve los activos del ledger.
- [ ] Build: `npm run build` ok.

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
- [ ] `backend` `/health` verde y `/fabric/ping` devuelve datos del ledger.
- [ ] `frontend` muestra el estado y no referencia infraestructura.
- [ ] Todos los tests y builds (`backend`, `frontend`) pasan.
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
