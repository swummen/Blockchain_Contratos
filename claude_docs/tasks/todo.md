# TODO: Sprint 0 · módulo `infra` · HU‑021

Plan: `claude_docs/tasks/plan.md` (**aprobado**). Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T8 completos y verificados (Sprint 0 / módulo `infra` cerrado en lo técnico, 
PASS de CA-01/CA-02, evidencia en `claude_docs/tasks/sprint-0-resultados.md`; quedan
pendientes la revisión por pares/PR y la aceptación de dirección, criterios 1 y 5 del DoD,
fuera del alcance de este repo). El frontend real (rama `Feat/Front`, ya en `main`) sigue
corriendo con datos de mentira en sus pantallas de negocio: T6 solo prueba la
conectividad de infraestructura vía una ruta de diagnóstico aparte (`/system-status`), no
conecta el login/documentos/etc. reales al backend; eso es Sprint 1 (`identity`).**
No hacer `git commit` automático: solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1: Fundación: red Hyperledger Fabric

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
- [x] El script es idempotente o falla con mensaje claro si ya está desplegado. (InitLedger se invoca siempre: es idempotente por diseño del chaincode de ejemplo, no por detección.)

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

## Fase 2: Datos y esqueletos de aplicación

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
- [x] Estructura creada: `src/routes/`, `src/services/`, `src/repositories/`, `src/fabric/`, `src/config/` (`services/` y `fabric/` vacías con `.gitkeep`, llegan en T5+).
- [x] `backend/Dockerfile` multi‑stage; el servicio `backend` en `compose.app.yml` construye y arranca. Corre como usuario no-root (`node`, uid 1000).
- [x] `backend/.env.example`, `backend/.dockerignore`, script de lint definido en `package.json` (oxlint, mismo linter que `frontend/`).
- [x] Comandos añadidos a `SPEC.md` §5 y `CLAUDE.md` (Commands): `npm run dev`, `npm test`, `npm run lint`, `npm run build`.

**Verificación:**
- [x] Tests: `npm test` (2 pruebas de `/health` con `isMongoHealthy` mockeado, camino feliz y de error).
- [x] Build: `npm run build` sin errores de `tsc`.
- [x] Manual: `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo backend` → `curl localhost:8080/health` devuelve el JSON esperado. Verificado también con Mongo real apagado (503 en ~3s gracias a los timeouts del cliente, no el default de 30s) y con `PORT` inválido (error claro en vez de stack trace crudo).

**Dependencias:** T3.

**Archivos:** `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.json`,
`backend/jest.config.js`, `backend/Dockerfile`, `backend/.dockerignore`,
`backend/.env.example`, `backend/README.md`, `backend/src/server.ts`,
`backend/src/config/env.ts`, `backend/src/routes/health.ts`,
`backend/src/repositories/mongoClient.ts`, `backend/src/services/.gitkeep`,
`backend/src/fabric/.gitkeep`, `backend/tests/health.test.ts`. *(Terminó pasado el límite
de ≤5 archivos por tarea de SPEC.md §10.3: quedó como una sola tarea porque son piezas de
un mismo esqueleto mínimo sin lógica de negocio, no módulos independientes; no se dividió
en sub-pasos.)*

**Alcance:** M.

---

### T5: `backend` ↔ Fabric Gateway (`/fabric/ping`)

**Descripción:** Cablear el Fabric Gateway SDK en el `backend`: cargar connection profile con
nombres DNS de contenedor + identidad Admin de Org1 desde el material de `fabric-samples`,
y exponer `GET /fabric/ping` que hace una query al chaincode de ejemplo. **Slice de mayor
riesgo del sprint**: retira la incógnita SDK↔Fabric antes de Sprint 2.

**Criterios de aceptación:**
- [x] `GET /fabric/ping` responde `200` con el resultado de `GetAllAssets` del chaincode `basic` en `contratoschannel`.
- [x] La conexión usa `grpcs://` con TLS y `peer0.org1.example.com` como host (no `localhost`). Nota de diseño: la Fabric Gateway API (a diferencia del SDK viejo `fabric-network`) solo dialoga con un peer, ese peer resuelve el endorsement y reenvía al orderer por su cuenta en `submitTransaction`, así que el backend nunca necesita una conexión gRPC aparte a `orderer.example.com`. `GetAllAssets` además es una `evaluateTransaction` (query de solo lectura), que ni siquiera pasa por el orderer.
- [x] La identidad se lee en el arranque desde una ruta montada del `fabric-samples/organizations/...`; si falta, `/fabric/ping` devuelve `503` con mensaje claro (verificado apuntando `FABRIC_CRYPTO_PATH` a una ruta inexistente).
- [x] `src/fabric/gateway.ts` encapsula la conexión; las rutas no tocan el SDK directamente.

**Verificación:**
- [x] Manual: con red + chaincode + `backend` arriba → `curl localhost:8080/fabric/ping` devuelve los activos del ledger. Verificado local (contra `localhost:7051`) y dockerizado (contra `peer0.org1.example.com:7051` real, vía el volumen `/crypto` montado de solo lectura) en una reconstrucción completa desde cero.
- [x] Build: `npm run build` ok. `npm test` también (4/4: se agregó `tests/fabric.test.ts` con el mismo patrón de mocks que `health.test.ts`).

**Dependencias:** T1, T2, T4.

**Archivos:** `backend/src/fabric/gateway.ts`, `backend/src/routes/fabric.ts`, `backend/src/config/fabric.ts`, wiring en `backend/src/server.ts`, `docker/compose.app.yml` (montaje del volumen de crypto).

**Alcance:** M.

---

### T6: `frontend` en contenedor + página de estado del sistema

**Descripción:** Dockerfile del `frontend` (build Vite → `nginx:alpine`), cliente API mínimo
que lee `VITE_API_URL`, y una página "Estado del sistema" que muestra el resultado de
`GET /health`. Demuestra RNF‑20 / HU‑021 CA‑02.

**Nota de cambio (post-replanificación):** para cuando se hizo esta tarea, `frontend/`
ya no era la plantilla de Vite, la rama `Feat/Front` (otro colaborador) ya había
construido la app real (login, OTP, páginas de los 3 roles) y se había mergeado a `main`.
"Reemplazar `App.tsx` por la página de estado" habría destruido ese trabajo, así que la
página de estado se agregó como ruta independiente (`/system-status`, fuera del layout de
autenticación y de `ProtectedRoute`) en vez de reemplazar `App.tsx`. Además, al ser el
frontend y el backend orígenes distintos para el navegador (puertos distintos), hizo falta
agregar CORS (`Access-Control-Allow-Origin: *`) en `backend/src/server.ts`, sin eso el
`fetch` se bloquea aunque el backend responda bien; no estaba contemplado en el AC original.

**Criterios de aceptación:**
- [x] `frontend/Dockerfile` construye la SPA y la sirve como estático; el servicio `frontend` en `compose.app.yml` la publica.
- [x] La página de estado (`/system-status`) llama a `${VITE_API_URL}/health` y muestra estado de `backend` y `mongo`.
- [x] `grep -rE "7051|9051|7050|27017|:5984|fabric|mongodb://" frontend/src` no encuentra endpoints de infraestructura (solo `VITE_API_URL`).
- [x] `npm run build` y `npm run lint` (oxlint) pasan.

**Verificación:**
- [x] Manual: `docker compose --env-file docker/.env -f docker/compose.app.yml up -d` → `http://localhost:5173/` y `http://localhost:5173/system-status` responden `200` (fallback SPA de nginx incluido). Verificado en reconstrucción completa desde cero.
- [x] Manual: revisión de código confirma que el frontend solo habla con `VITE_API_URL` (`frontend/src/lib/api.ts`).
- [x] Backend: `npm test` 7/7 (se agregó `tests/cors.test.ts` tras el review, prueba que el header CORS está en `/health` y `/fabric/ping`, y que **no** aparece fuera de esas dos rutas, confirmando que el middleware quedó acotado a propósito y no global).
- [x] Render real en un navegador: confirmado por la usuaria en `http://localhost:5173/system-status`, se ve el estado en verde. (Claude no tiene navegador disponible en este entorno; todo lo demás sí se verificó mecánicamente antes de este último paso.)

**Dependencias:** T4.

**Archivos:** `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/nginx.conf`,
`frontend/src/lib/api.ts`, `frontend/src/pages/SystemStatusPage.tsx`,
`frontend/src/routes/AppRoutes.tsx` (ruta nueva, sin tocar las existentes),
`frontend/.env.example`, `backend/src/server.ts` (CORS acotado a `/health` y `/fabric`,
no contemplado en el AC original), `backend/tests/cors.test.ts`.

**Alcance:** M.

---

### ✅ Checkpoint: esqueleto de app conectado a Fabric + Mongo
- [x] `backend` `/health` verde y `/fabric/ping` devuelve datos del ledger.
- [ ] `frontend` muestra el estado y no referencia infraestructura. **No aplica todavía**:
  el frontend real (rama `Feat/Front`, ya en `main`) es un prototipo visual con datos
  hardcodeados en `src/data/*.ts`, no llama a `VITE_API_URL` ni a ningún backend. T6
  (dockerizar el frontend + página de estado) sigue sin hacerse.
- [ ] Todos los tests y builds (`backend`, `frontend`) pasan. Backend sí (`npm test`,
  `npm run build`); frontend no se tocó en este checkpoint.
- [ ] Revisar con el equipo antes de seguir.

---

## Fase 3: Orquestación de una sola orden y documentación

### T7: `up.sh` / `down.sh` + documentación

**Descripción:** Orden única que encadena red Fabric → chaincode de ejemplo → compose de
app; y su inversa. Documentar prerequisitos, puertos y comandos. Actualizar `CLAUDE.md` y
`SPEC.md`.

**Criterios de aceptación:**
- [x] `docker/up.sh` deja corriendo: orderer, 2 peers, 3 CA, `mongo`, `backend`, `frontend`, todos `healthy`/`Up`.
- [x] `docker/down.sh` elimina todo lo anterior + volúmenes (entorno limpio). No corre `docker container prune` (afectaría contenedores de otros proyectos en la misma máquina): quedan sueltos los contenedores `Created` que deja el build del chaincode (T2), documentado en `docker/README.md` como cosmético.
- [x] `docker/README.md`: prerequisitos, puertos (incluye `frontend`/5173), comandos, `up.sh`/`down.sh` promovidos al tope de la tabla como la forma recomendada.
- [x] `CLAUDE.md` → *Commands* y `claude_docs/SPEC.md` §5 actualizados con `up.sh`/`down.sh` y el resto de comandos de `docker/`.

**Verificación:**
- [x] Manual: **no** se hizo el `git clean -xfd` en una copia (destructivo/lento para esta verificación: re-descargaría ~2-3 GB de Fabric); en su lugar se validó el ciclo completo dos veces sobre el estado real, `down.sh` → `up.sh` → confirmar `/health`, `/fabric/ping` y `frontend` (`/` y `/system-status`) responden bien → `down.sh` (confirma "docker ps" vacío de los servicios del proyecto, quedan solo los contenedores cosméticos ya documentados) → `up.sh` de nuevo (confirma que la segunda corrida es igual de limpia). Cubre el mismo riesgo funcional que pedía el AC.

**Dependencias:** T1‑T6.

**Archivos:** `docker/up.sh`, `docker/down.sh`, `docker/README.md`, `CLAUDE.md`, `claude_docs/SPEC.md`.

**Alcance:** M.

---

### T8: Verificación de HU‑021 (smoke test CA‑01 / CA‑02)

**Descripción:** Script que asevera los dos escenarios Gherkin de HU‑021 y deja evidencia
para el PPS.

**Criterios de aceptación:**
- [x] `docker/smoke-test.sh` verifica **CA‑01**: los servicios `orderer`, `peer0.org1`, `peer0.org2`, `mongo`, `backend`, `frontend` están `Up`, y el chaincode responde en `contratoschannel` (vía `GET /fabric/ping`, el mismo camino real que ya prueba T5, evita reimplementar el CLI de `peer` a mano).
- [x] Verifica **CA‑02**: `grep` sobre `frontend/src` no encuentra llamadas directas a nodos Fabric ni a Mongo (falla el script si aparece alguna). Mismo patrón de `grep` ya validado en el AC de T6.
- [x] El script sale con código `0` en éxito y `≠0` describiendo qué falló.
- [x] Se guarda `claude_docs/tasks/sprint-0-resultados.md` con la fecha, versión de imágenes y salida del smoke test (evidencia DoD criterios 2 y 4).

**Verificación:**
- [x] Manual: `bash docker/up.sh && bash docker/smoke-test.sh` → exit 0 (stack ya arriba de la verificación de T7). Además se forzó el camino de fallo (`docker stop backend` + correr el script de nuevo) para confirmar que reporta el problema puntual y sale con exit 1, no solo que el camino feliz "se ve bien"; luego se reinició `backend` y una corrida posterior volvió a dar PASS. Evidencia completa de ambos casos en `claude_docs/tasks/sprint-0-resultados.md`.
- [x] Ronda de `code-reviewer`: encontró que la comprobación de CA‑02 conflaba los 3 exit codes de `grep` (0=match, 1=sin match, 2=error) tratando cualquier no-cero como "OK", un directorio ilegible/inexistente daba falso PASS. Corregido capturando `$?` explícito con rama propia para `rc=2`; verificado a mano apuntando el grep a una carpeta inexistente (antes del fix habría dado "OK" falso, después da "FALLO por rc=2" correctamente). También se agregó guarda de `docker`/`docker info` al inicio (mismo patrón que `up.sh`), timeout a `curl` (`--connect-timeout 5 --max-time 15`, evita que el script cuelgue si el backend acepta la conexión pero nunca responde), `127.0.0.1` en vez de `localhost`, y `-rI` en el grep de CA‑02 (ignora binarios). Re-verificado con una corrida real tras los fixes → PASS, exit 0.

**Dependencias:** T7.

**Archivos:** `docker/smoke-test.sh`, `claude_docs/tasks/sprint-0-resultados.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑021 terminada (DoD, SPEC §10.2)
- [x] Smoke test en PASS (CA‑01 y CA‑02): criterio DoD 2. Evidencia en `claude_docs/tasks/sprint-0-resultados.md`.
- [x] RNF‑19, 20, 21, 22 marcados como implementados en la trazabilidad: criterio DoD 3. Cubiertos por T1‑T7 (entorno reproducible, frontend sin acceso directo a infraestructura, versiones fijadas, orden única).
- [x] Entorno verificado en Docker Compose: criterio DoD 4.
- [ ] PR abierto y revisado; mensaje de commit redactado (sin commit automático): criterio DoD 1. Mensaje redactado, pendiente de que Sofia lo commitee/abra el PR.
- [ ] Aceptación de dirección/codirección registrada: criterio DoD 5. Fuera del alcance de este repo/agente.
