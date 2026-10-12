# TODO — Sprint 4 · módulo `administration` + consultas restantes · HU‑008, 009, 015…020

Plan: `claude_docs/tasks/plan-sprint4-administration.md` (**aprobado 2026‑10‑08**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T5 completos y revisados (T4 y T5: REQUEST CHANGES → aplicado). T6 y T7
implementados y probados mecánicamente contra el stack real (falta confirmación en
navegador); limitaciones de T7 resueltas; `origin/Feat/Front` (Laura) integrado en
`feat/sprint4-frontend`. T8 implementado y probado mecánicamente. Sigue T9 (frontend:
Administrador — `UsuariosPage`, CRUD real).**
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1 — Chaincode

### T1: Chaincode — `GetDocumentEvents` + `GetAllEvents` + tests unitarios

**Descripción:** Las dos funciones de lectura de eventos que ningún sprint anterior
construyó (D1/D2 del plan). Sin red todavía — solo compila y sus tests pasan.

**Criterios de aceptación:**
- [x] `GetDocumentEvents(ctx, documentID) ([]*Event, error)` — `evaluateTransaction`,
  `GetStateByPartialCompositeKey("event", []string{documentID})`, deserializa cada
  resultado del iterador a `Event`, cierra el iterador. Lista vacía (no error) si el
  documento no tiene eventos o no existe — la validación de "documento existe" la hace
  el backend con `GetDocument` antes de llamar a esto (no duplicar esa lógica acá).
- [x] `GetAllEvents(ctx) ([]*Event, error)` — mismo mecanismo, clave parcial sin
  atributos (`GetStateByPartialCompositeKey("event", []string{})`) — todos los eventos
  de todos los documentos. Sin orden particular garantizado (D2: el orden cronológico se
  resuelve en el backend).
- [x] Ambas cierran el `StateQueryIterator` siempre (con `defer`), incluso si el
  deserializado de un elemento falla a mitad de camino.

**Verificación:**
- [x] Build: `go build ./...`, `go vet ./...` sin errores; `gofmt -l contract/*.go
  main.go` sin salida.
- [x] Tests: 34/34 (26 ya existentes + 8 nuevos) — éxito con 2 eventos y con 0 eventos
  para `GetDocumentEvents`, `documentID` vacío, fallo de la query, fallo de
  `iterator.Next()` a mitad de camino (confirma `Close()` llamado igual), fallo de
  unmarshal; éxito con eventos de 2 documentos distintos para `GetAllEvents` (confirma
  que la clave parcial se pasó vacía, no `nil`), fallo de la query. Nuevo helper
  `newIterator()` que por fin ejercita el mock `StateQueryIterator` (existía desde
  Sprint 2, nunca se había usado activamente en un test).
- [x] Ronda de `code-reviewer` (verdict: **REQUEST CHANGES** → aplicado, 1 Required):
  confirmó de forma independiente (no solo por los tests) que ambos `return nil, err`
  dentro del loop descartan lo ya acumulado — nunca se devuelve una lista parcial — y
  que `defer iterator.Close()` corre en los dos casos de error. Encontró que
  `chaincode/README.md` seguía diciendo "cuando exista esa consulta (todavía no existe —
  Sprint 4)" — justo lo que esta tarea acababa de construir — y que no documentaba el
  caso `GetAllEvents` (clave vacía) en absoluto. Corregido: la tabla y una nota nueva
  explican las dos funciones, por qué `[]string{""}` no es lo mismo que `[]string{}`
  (un typo da `[]` silencioso, no "todos"), y que ninguna de las dos verifica que el
  documento exista (decisión explícita, no un descuido). Aplicado también el hallazgo
  Optional de fijar con un comentario en el código qué formas de `keys` son válidas, para
  que un futuro tercer caller no construya una clave dinámica mal armada sin que nada lo
  avise. Re-verificado: 34/34 tests, build/vet/gofmt limpios.

**Dependencias:** ninguna (Sprint 3 ya cerrado).

**Archivos:** `chaincode/contract/smartcontract.go`, `chaincode/contract/smartcontract_test.go`.

**Alcance:** M.

---

### T2: Deploy del chaincode actualizado

**Descripción:** Subir de versión el chaincode ya desplegado y probar
`GetDocumentEvents`/`GetAllEvents` contra la red real — mismo patrón que T2 de Sprint 3.

**Criterios de aceptación:**
- [x] Upgrade manual (`./network.sh deployCC -c contratoschannel -ccn contracts -ccp
  ../../../chaincode -ccl go -ccv 1.1`, bypaseando el guard de idempotencia de
  `deploy-cc.sh` — no detecta cambios de código, mismo criterio ya documentado en
  Sprint 2/3). Confirmado `querycommitted` en ambos orgs: `Version: 1.1, Sequence: 2`.

**Verificación:**
- [x] Manual contra la red real: `RegisterDocument` + `RecordVerification` reales sobre
  un documento nuevo → `GetDocumentEvents` devuelve los 2 eventos reales (registro +
  verificación, con `Result:"confirmada"` en el segundo) con sus `TxID` reales, en el
  orden en que se escribieron. `GetAllEvents` (probado con cero argumentos — la forma
  exacta que va a usar `queryChaincode("GetAllEvents")` desde el backend) devuelve 6
  eventos de 3 documentos distintos, acumulados de pruebas de sprints anteriores que
  siguen vivos en el ledger. `GetDocumentEvents` de un `documentID` inventado → `[]` sin
  error (comportamiento documentado en T1, no un bug).

**Dependencias:** T1.

**Archivos:** ninguno de código (solo el upgrade desplegado).

**Alcance:** S.

---

### ✅ Checkpoint: chaincode operativo
- [x] `GetDocumentEvents`/`GetAllEvents` compilan, sus tests pasan (34/34), y una
  consulta real en la red devuelve eventos reales (registro + verificación, con `TxID`
  reales; `GetAllEvents` agregando 3 documentos distintos).
- [x] Revisado por `code-reviewer` (REQUEST CHANGES → aplicado).

---

## Fase 2 — Backend

### T3: Backend — `GET /documents` acotado por rol + `GET /documents/:id/events`

**Descripción:** Completa RF‑18…22 (Empleado) y la mitad de RF‑37…40 (Verificador) que
faltaba — el listado ya existía (D8 de Sprint 3), falta que el Empleado lo use acotado a
lo suyo, y la trazabilidad por documento (nadie la tiene todavía).

**Criterios de aceptación:**
- [x] `GET /documents` (ya existía) se abre a `requireAuth()` sin roles — si
  `req.user.role === "Empleado"`, el service filtra por `responsibleUser ===
  req.user.sub` (Mongo, un `find({responsibleUser: ...})` en vez de `find()`); otros
  roles, sin cambio (D3).
- [x] `GET /documents/:id/events` (nuevo): llama a `queryLedgerDocument` (confirma que
  existe — mismo helper que ya usan `getDocument`/`verifyDocument`) + `GetDocumentEvents`;
  si `req.user.role === "Empleado"` y `document.responsibleUser !== req.user.sub` →
  `403` (D4/RF‑21‑CA‑02) — incluido el caso "existe en el ledger pero no en Mongo"
  (fail closed: sin Mongo no hay forma de confirmar el dueño, se niega por defecto, no
  se asume). Devuelve `[{documentId, action, user, txId, timestamp, result?}, ...]`
  ordenados por `timestamp` (comparación lexicográfica de un string RFC3339 en UTC
  siempre con el mismo formato — alcanza sin parsear a `Date`, D2 del plan).

**Verificación:**
- [x] Manual contra la red real: Empleado real (`m.lopez`) ve solo sus 2 documentos en
  `GET /documents` (confirmado `responsibleUser === "U001"` en los dos) mientras el
  Verificador ve el mismo total sin filtro; Empleado consultando la trazabilidad de su
  propio documento → `200` con el evento de registro real; `documentId` inexistente →
  `404`. El caso "Empleado consultando un documento ajeno → 403" no se probó en vivo
  (solo hay un Empleado sembrado) — sí está cubierto por 2 tests unitarios (ajeno +
  ledger-sin-Mongo). Sin regresión: `bash docker/smoke-test.sh` → `PASS`.
- [x] Tests: 9 casos nuevos — filtro por rol en `GET /documents` (Empleado acotado,
  Verificador sin filtro), `GET /documents/:id/events` éxito con orden cronológico
  confirmado (eventos deliberadamente desordenados en el mock), Empleado dueño, Empleado
  ajeno (403, nunca llega a pedir los eventos), Empleado con ledger-sin-Mongo (403, fail
  closed), 404, 502, 401 — 91/91 tests del backend en verde.
- [x] Build/lint del backend en 0 errores/warnings.
- [x] Ronda de `code-reviewer` (verdict: **APPROVE**, sin Required): confirmó leyendo el
  chaincode que las dos consultas en serie a Fabric (`GetDocument` + `GetDocumentEvents`)
  no son redundantes — `GetDocumentEvents` nunca devuelve "not found", solo `[]`, así que
  la primera consulta es la única fuente real del 404 — y que el costo de dos queries de
  solo lectura en serie es insignificante para el volumen de un MVP de tesis. Confirmó que
  `GET /documents` y `GET /documents/:id/events` usan el mismo criterio de "dueño"
  (`responsibleUser`/`req.user.sub`), sin inconsistencia entre los dos. Aplicados los 2
  hallazgos Optional: **(1)** el chequeo de propiedad de `getDocumentEvents` dejó de
  depender de Mongo (`findDocumentById`) — ahora compara contra el `User` del propio
  evento `"registro"` que ya devuelve `GetDocumentEvents` (una consulta menos, y cierra
  del todo el caso límite "ledger-sin-Mongo" que antes negaba el acceso al dueño real por
  una inconsistencia de Mongo). **(2)** Sembrado un segundo Empleado de prueba
  (`c.ruiz@empresa.com`, U002 — ya existía en el mock del frontend, solo faltaba en el
  seed) para poder probar el `403` de verdad contra la red real, no solo con mocks.
  Re-verificado tras los 2 fixes: 91/91 tests, build/lint limpios, y en vivo: `c.ruiz`
  (U002) pidiendo la trazabilidad del documento de `m.lopez` (U001) → `403` real.

**Dependencias:** T2.

**Archivos:** `backend/src/routes/documents.ts`, `backend/src/services/documentService.ts`
(`listDocuments` con filtro por rol, `getDocumentEvents` nuevo — propiedad desde el
ledger, no Mongo), `backend/src/repositories/documentRepository.ts` (filtro por
`responsibleUser`), `backend/src/scripts/seedUsers.ts` (segundo Empleado), tests.

**Alcance:** M.

---

### T4: Backend — `GET /events` (trazabilidad general) + `GET /documents/summary` (panel)

**Descripción:** RF‑39/40/50/51 (trazabilidad general) y RF‑41/42 (panel del
Administrador).

**Criterios de aceptación:**
- [x] `GET /events` (ruta nueva, archivo nuevo `backend/src/routes/events.ts` — no tenía
  sentido meterlo en `documents.ts`, no es un recurso anidado bajo `/documents`),
  `requireAuth("Verificador", "Administrador")` — llama a `GetAllEvents`, ordena por
  `timestamp` (D2), responde `[{documentId, action, user, txId, timestamp, result?},
  ...]`. Mismo nivel de detalle para los dos roles (D5/HU‑020‑CA‑02) — una sola
  respuesta, no una versión recortada.
- [x] `GET /documents/summary`, `requireAuth("Administrador")` — totales por `status`
  vía un `aggregate` de Mongo agrupado (`$group` por `status`) — `{total, pendiente,
  verificado, alterado}` (D6, nunca limitado a los 100 de `GET /documents`). Registrada
  **antes** de `GET /documents/:id` en el router (si no, Express la tomaría como
  `id="summary"`) — hay un test dedicado a confirmar justo esto.
- [x] **Hallazgo real durante esta tarea, fuera del AC original pero imposible de no
  arreglar**: el CORS de `/documents` en `server.ts` nunca se actualizó desde Sprint 2
  (seguía en `"POST, OPTIONS"`) — un preflight real confirmó que el navegador habría
  bloqueado cualquier `GET` desde que Sprint 3 agregó el primero. Corregido a `"GET,
  POST, OPTIONS"`, y agregado un bloque de CORS nuevo para `/events` (antes no existía
  ningún `GET` bajo ese prefijo).

**Verificación:**
- [x] Manual contra la red real: `GET /events` como Verificador devuelve 8 eventos
  reales ya ordenados cronológicamente; `GET /documents/summary` como Administrador da
  `{total:3, pendiente:2, verificado:0, alterado:1}`, confirmado idéntico contra un
  `aggregate` manual directo en Mongo; `GET /events`/`GET /documents/summary` con el rol
  equivocado → `403` real en los dos. Preflight real de `/documents` y `/events`
  confirmado con `Access-Control-Allow-Methods` incluyendo `GET` después del fix. Sin
  regresión: `bash docker/smoke-test.sh` → `PASS`.
- [x] Tests: 9 casos nuevos — `GET /events` éxito con orden cronológico confirmado
  (eventos deliberadamente desordenados en el mock), Administrador (mismo detalle),
  Empleado 403, falla del chaincode 502, sin JWT 401; `GET /documents/summary` éxito con
  números exactos, Verificador 403, sin JWT 401, y un test dedicado a que la ruta no
  quede atrapada por `/documents/:id`. 100/100 tests del backend en verde.
- [x] Build/lint del backend en 0 errores/warnings.
- [x] Ronda de `code-reviewer` (verdict: **REQUEST CHANGES** → aplicado, 2 Required):
  1. **La narrativa del hallazgo de CORS estaba mal.** Dije que "un preflight real
     confirmó que el navegador lo habría bloqueado" — falso: `curl` no aplica ninguna
     política de CORS, solo muestra los headers de la respuesta. El reviewer señaló (y
     confirmó contra la spec de Fetch, no de memoria) que `GET` es un "CORS-safelisted
     method" — el chequeo de método del preflight pasa igual aunque
     `Access-Control-Allow-Methods` no lo liste, así que ningún navegador real rechazó
     esto nunca por este motivo específico. El valor seguía estando mal (y el fix sigue
     siendo correcto), pero por una razón distinta: el riesgo real es que un método que
     **no** esté en esa lista de excepción (`PUT`/`DELETE`/`PATCH`) agregado más adelante
     sin actualizar esto sí quedaría bloqueado, sin excepción, por cualquier navegador.
     Corregido el comentario en `server.ts` para contar la historia real, no la
     inventada — esto estaba a punto de quedar mal explicado en `SPEC.md`/
     `backend/README.md` cuando llegue T10.
  2. **`getAllEvents()` no tenía ningún límite, a diferencia de `listDocuments` (100,
     D8) y sin ninguna nota explicando por qué no** — inconsistente con la postura
     explícita que el resto del archivo ya tiene sobre su propio crecimiento. El ledger
     de eventos es estrictamente de solo-anexado (cada documento deja mínimo 1 evento, y
     HU‑014‑CA‑02 permite re-verificar sin límite) — crece para siempre, en cada reuso
     del mismo entorno de pruebas. Agregado el mismo tipo de límite defensivo (200 más
     recientes, `.slice(-200)` después de ordenar) con el mismo criterio ya documentado
     para `listDocuments`.
  Aplicado también el hallazgo Optional barato: test de `Empleado: 403` agregado a la
  suite de `GET /documents/summary` (ya existía el equivalente para `GET /events`).
  Quedaron anotados, no aplicados (Optional, no bloqueantes): la inconsistencia real
  entre el total del panel y el listado truncado si algún día hay más de 100
  documentos (nota para T8/SPEC), y una constricción de forma UUID sobre el parámetro
  `:id` como alternativa más robusta que "comentario + test" para el riesgo de orden de
  rutas (no aplicada ahora — Express 5 cambió la sintaxis de `path-to-regexp` para
  constricciones inline y no quise arriesgar una ruta mal armada por adivinarla sin
  confirmar la sintaxis exacta de la v8). Re-verificado tras los 2 fixes: 101/101 tests,
  build/lint limpios, contenedor `backend` reconstruido, `bash docker/smoke-test.sh` →
  `PASS` de nuevo.

**Dependencias:** T2.

**Archivos:** `backend/src/routes/events.ts` (nuevo), `backend/src/routes/documents.ts`
(`GET /documents/summary`), `backend/src/services/documentService.ts` (`getAllEvents`,
`getDocumentsSummary`), `backend/src/repositories/documentRepository.ts`
(`countDocumentsByStatus`), `backend/src/server.ts` (CORS de `/documents` corregido +
bloque nuevo para `/events`, router de `events` montado), `backend/tests/events.test.ts`
(nuevo), `backend/tests/documents.test.ts`.

**Alcance:** M.

---

### T5: Backend — Gestión de usuarios (Administrador)

**Descripción:** RF‑43…47, la porción de `identity` pendiente desde Sprint 1.

**Criterios de aceptación:**
- [x] `userRepository.ts` gana `listUsers()`, `insertUser(user)` (creación real,
  password temporal fija — D7b), `updateUser(userId, {name, email, role})`,
  `deactivateUser(userId)` (`status: "Inactivo"`, baja lógica — RF‑47, nunca borra nada).
- [x] `GET /users`, `POST /users`, `PUT /users/:id`, `POST /users/:id/deactivate` — los 4,
  `requireAuth("Administrador")`. `POST /users` rechaza un correo ya registrado (mismo
  índice único que ya existe, `ensureIndexes`) con un mensaje claro, no un 500 de Mongo
  crudo.
- [x] Ninguna ruta expone `passwordHash` (mismo criterio que `toPublicUser`, ya usado en
  `/auth/verify-otp`).

**Verificación:**
- [x] Manual contra la red real (bueno, contra Mongo real — esto no toca el chaincode):
  Administrador (`admin@empresa.com`) crea un usuario nuevo → el usuario nuevo se loguea
  con la contraseña temporal `Contratos123!` → Administrador edita su nombre/correo/rol →
  lo desactiva → ya no puede loguearse (401 "Credenciales inválidas", lo valida
  `authService` desde Sprint 1) y `GET /users` lo sigue listando con `status: "Inactivo"`.
  Confirmado también: `Empleado` recibe 403 en los 4 endpoints; sin JWT, 401.
- [x] Tests: 25 casos — los 4 endpoints, éxito y error (correo duplicado por pre‑chequeo
  y por carrera contra el índice único, usuario inexistente, rol distinto de
  Administrador, 401, body inválido), confirmación de que `passwordHash` nunca viaja en
  ninguna respuesta, normalización de email en la respuesta, revocación de sesión al
  desactivar, bloqueo de auto‑desactivación.
- [x] Build/test/lint del backend en verde (126/126 tests, 0 errores de build, 0
  warnings de lint).
- [x] Ronda de `code-reviewer` (verdict: **REQUEST CHANGES** → aplicado, 2 Required + 1
  recomendación de judgment aplicada):
  - **Required — desactivar no revocaba sesiones ya abiertas.** `requireAuth` solo valida
    que el `jti` siga existiendo en Mongo; nunca relee `status`. Antes de este fix, un
    usuario desactivado con una sesión ya abierta conservaba acceso completo hasta que su
    JWT expirara solo (hasta `jwtExpiresMinutes`, default 60 min) — el primer hueco real
    de este tipo, porque T5 es la primera feature que cambia `status` de un usuario vivo
    vía la API. Fix: `sessionRepository.deleteSessionsByUserId(userId)` (un
    `deleteMany({ userId })`), llamado desde `userService.deactivateUser` justo después
    de la baja lógica. Verificado en vivo: con una sesión real abierta de un usuario de
    prueba, `GET /documents` daba 200 antes de desactivarlo y 401 inmediatamente después,
    sin esperar a que el JWT expirara.
  - **Required — la respuesta de `POST /users`/`PUT /users/:id` podía mostrar un email
    con otra capitalización que la persistida.** `normalizeEmail` (`.trim().toLowerCase()`)
    se aplicaba adentro de `insertUser`/`updateUser` (repositorio), pero el servicio ya
    había construido el objeto de respuesta con el email crudo del input — un admin que
    tipeaba `"Foo@Bar.COM"` veía esa forma en la respuesta mientras Mongo guardaba
    `"foo@bar.com"`. Fix: se exportó `normalizeEmail` desde `userRepository.ts` y el
    servicio la aplica antes de construir el objeto que se devuelve, en ambos casos.
  - **Recomendación aplicada — sin guardia de auto‑desactivación.** El reviewer
    distinguió dos riesgos: "Administrador se desactiva a sí mismo por error" (barato de
    evitar, un chequeo de una línea) vs. "queda cero Administradores activos" (correcto
    de resolver requeriría un conteo con las mismas condiciones de carrera que ya se
    decidió no perseguir para la reactivación, D8 — mismo criterio YAGNI). Se aplicó solo
    el primero: `POST /users/:id/deactivate` devuelve 400 si `req.user.sub === req.params.id`.
  - Preguntas de diseño que el reviewer confirmó aceptables tal cual, sin cambios: D7b
    (contraseña temporal fija, documentada, con `/auth/change-password` como vía de
    escape — ya existente desde Sprint 1); el manejo de la carrera de email duplicado
    (chequeo previo + `catch` de `MongoServerError` código 11000, correcto en ambos
    sentidos — rastreado el interleaving real); la falta de validación de formato de
    email (la única invariante que importa, unicidad, ya la garantiza el índice único —
    un email mal formado es, como mucho, una confusión de UX en el primer login del
    usuario nuevo, no un hueco de seguridad).

**Dependencias:** ninguna (no depende del chaincode).

**Archivos:** `backend/src/repositories/userRepository.ts`,
`backend/src/repositories/sessionRepository.ts` (nueva función
`deleteSessionsByUserId`), `backend/src/services/userService.ts` (nuevo),
`backend/src/routes/users.ts` (nuevo), `backend/src/server.ts` (wiring),
`backend/tests/users.test.ts` (nuevo, 25 tests).

**Alcance:** M.

---

### ✅ Checkpoint: backend↔ledger real (consultas)
- [x] Los 5 endpoints nuevos (`GET /documents/:id/events`, `GET /events`,
  `GET /documents/summary`, `GET /users`, `POST /users`, `PUT /users/:id`,
  `POST /users/:id/deactivate` — y el filtro por rol de `GET /documents`) probados de
  punta a punta contra la red/Mongo real.
- [x] Revisado por `code-reviewer`.

---

## Fase 3 — Frontend

### T6: Frontend — Empleado: `MisDocumentosPage` + `MiTrazabilidadPage`

**Criterios de aceptación:**
- [x] `frontend/src/lib/api.ts` gana las funciones que falten (reusar `listDocuments`
  existente si el filtro por rol ya lo cubre del lado del backend; agregar
  `getDocumentEvents(token, documentId)`). Se reusó `listDocuments` (el backend ya acota
  a los del Empleado, T3) y se agregó `getDocumentEvents` + el tipo `DocumentEvent`.
- [x] `MisDocumentosPage` y `MiTrazabilidadPage` dejan de usar `useAppData()` (el mock).
  `MiTrazabilidadPage` arma la trazabilidad pidiendo `GET /documents/:id/events` por cada
  documento propio (el Empleado no tiene acceso a `GET /events`), ordenada de más reciente
  a más antiguo, mostrando el nombre del archivo en vez del UUID.
- [x] **Extra (problema del ID, `para_sofi.md` §3):** cada documento de "Mis documentos"
  muestra su identificador completo con botón "Copiar" — el Empleado ya puede recuperar
  su ID en cualquier momento, no solo en la pantalla de éxito de la carga. El botón se
  extrajo a `components/shared/CopyButton.tsx` y `CargarDocumentoPage` lo reusa.
- [x] `DocumentListItem` acepta documentos sin `hash`/`sizeLabel` (el listado real no
  los trae); `TraceabilityTimeline` usa `txId` como clave (los eventos reales no tienen
  `eventId`) y acepta un mapa opcional `documentNames`. Las pantallas que siguen en mock
  (T7/T8) no cambian de comportamiento.
- [x] `npm run build`/`npm run lint` pasan (0 errores; 4 warnings ya existentes en
  archivos no tocados).

**Verificación:**
- [x] Mecánico contra el stack real (2026‑10‑12, mismo criterio de siempre): `m.lopez`
  (U001) recibe solo sus 2 documentos en `GET /documents` y la trazabilidad real de uno
  de ellos (`registro` + `verificacion`); `c.ruiz` (U002) recibe `[]` y `403` al pedir
  la trazabilidad del documento de `m.lopez`. Falta la confirmación de Sofia en navegador.

**Dependencias:** T3.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/empleado/MisDocumentosPage.tsx`,
`frontend/src/pages/empleado/MiTrazabilidadPage.tsx`.

**Alcance:** M.

---

### T7: Frontend — Verificador: `DocumentosPage` + `TrazabilidadGlobalPage`

**Criterios de aceptación:**
- [x] `frontend/src/lib/api.ts` gana `getAllEvents(token)`.
- [x] Las dos pantallas dejan de usar `useAppData()`. `DocumentosPage` usa
  `listDocuments` (sin filtro para el Verificador) con el identificador copiable;
  `TrazabilidadGlobalPage` usa `GET /events` (más reciente primero) y muestra el nombre
  del archivo en la columna "Documento" (si el listado falla, cae al identificador sin
  bloquear la tabla). `TraceabilityTable` usa `txId` como clave y acepta
  `documentNames`, igual que `TraceabilityTimeline` en T6.
- [x] `npm run build`/`npm run lint` pasan (0 errores).

**Verificación:**
- [x] Mecánico contra el stack real (2026‑10‑12): `p.gomez` (Verificador) recibe los 2
  documentos de todos los Empleados y los 5 eventos reales del ledger (registros +
  verificaciones `confirmada`/`comprometida`, con `TxID` reales); `m.lopez` (Empleado)
  recibe `403` en `GET /events`. Preflight CORS de `/events` con `GET` permitido. Falta
  la confirmación de Sofia en navegador.
- [x] **Limitaciones de T7 resueltas (2026‑10‑12, pedido de Sofia):**
  - **Nombres en vez de userId.** `GET /documents` gana `responsibleName` y los eventos
    (`GET /events`, `GET /documents/:id/events`) ganan `userName`, resueltos en Mongo con
    una sola consulta por respuesta (`findUserNamesByIds` en `userRepository.ts`). Si el
    id no es un usuario registrado (p. ej. `smoke-test-user`), cae al id, no falla. El
    selector de `VerificarIntegridadPage` (cambio de Laura, `Feat/Front`) también muestra
    el nombre en vez de `U001` — con nombre + fecha ya se distinguen dos "contrato.pdf".
  - **Huella en el listado.** `GET /documents` trae `hash` — completo para
    Verificador/Administrador, enmascarado server-side para el Empleado (RF‑27, mismo
    `maskHash` que `GET /documents/:id`). Sale de la copia de Mongo: es seguro porque la
    huella nunca cambia después del registro (`RecordVerification` solo toca `Status`).
    Confirmado en vivo: el hash del listado coincide con el del ledger en los 2 documentos.
  - Tests: 132/132 del backend (2 nuevos + 3 actualizados); `backend/README.md` al día.

**Dependencias:** T3, T4.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/verificador/DocumentosPage.tsx`,
`frontend/src/pages/verificador/TrazabilidadGlobalPage.tsx`.

**Alcance:** M.

---

### T8: Frontend — Administrador: `DashboardPage` + `DocumentosPage` + `TrazabilidadPage`

**Criterios de aceptación:**
- [x] `frontend/src/lib/api.ts` gana `getDocumentsSummary(token)` (+ tipo `DocumentsSummary`).
- [x] Las tres pantallas dejan de usar `useAppData()` para estos datos (reusan
  `listDocuments`/`getAllEvents` ya agregados en T7 donde aplique). `DashboardPage`:
  totales de `GET /documents/summary` + los 6 eventos más recientes de `GET /events`
  (cargas independientes: si el ledger no responde, los totales se muestran igual);
  `DocumentosPage`: mismo listado que el Verificador, con ID copiable y huella completa;
  `TrazabilidadPage`: misma tabla y mismo detalle que el Verificador (HU‑020‑CA‑02).
  `KpiCard` acepta `"—"` mientras carga.
- [x] `npm run build`/`npm run lint` pasan (0 errores).

**Verificación:**
- [x] Mecánico contra el stack real (2026‑10‑12): `GET /documents/summary` como
  `admin@empresa.com` → `{total:2, pendiente:0, verificado:1, alterado:1}`, idéntico a un
  `aggregate` directo en Mongo; `GET /events` → 5 eventos con nombres; `GET /documents` →
  2 documentos con hash completo (64 caracteres) y responsable por nombre; Verificador en
  `GET /documents/summary` → `403`. Falta la confirmación de Sofia en navegador.
- Nota (ya anotada en el review de T4, no bloqueante): el total del panel cuenta todos
  los documentos, mientras que el listado se corta en 100 — con más de 100 documentos los
  dos números dejarían de coincidir a simple vista.

**Dependencias:** T3, T4.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/administrador/DashboardPage.tsx`,
`frontend/src/pages/administrador/DocumentosPage.tsx`,
`frontend/src/pages/administrador/TrazabilidadPage.tsx`.

**Alcance:** M.

---

### T9: Frontend — Administrador: `UsuariosPage` (CRUD real)

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `listUsers`, `createUser`, `updateUser`,
  `deactivateUser` (todas autenticadas).
- [ ] `UsuariosPage` deja de usar `useAppData()` para crear/editar/desactivar — llama a
  los endpoints reales de T5.
- [ ] `npm run build`/`npm run lint` pasan.

**Verificación:**
- [ ] Manual en navegador: crear un usuario nuevo, editarlo, desactivarlo — los tres
  contra el backend real, reflejados en Mongo.

**Dependencias:** T5.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/administrador/UsuariosPage.tsx`.

**Alcance:** M.

---

### ✅ Checkpoint: HU‑008/009/015…020 de punta a punta
- [ ] Flujo completo probado (navegador o mecánico + confirmación de Sofia) para los 3
  roles.
- [ ] `npm run build`/`lint`/`test` de frontend y backend pasan; `go build`/`vet`/`test`
  del chaincode pasan.

---

## Fase 4 — Documentación y cierre

### T10: Documentación y trazabilidad SPEC

**Criterios de aceptación:**
- [ ] `chaincode/README.md`: agregar `GetDocumentEvents`/`GetAllEvents`.
- [ ] `backend/README.md`: secciones de los endpoints nuevos (`/events`,
  `/documents/summary`, `/users/*`) y la ampliación de `GET /documents`/
  `GET /documents/:id/events`.
- [ ] `claude_docs/SPEC.md`: marcar RF‑18…22, RF‑37…51 y las RNF relevantes (06, 08, 09,
  26, 27, 03) como implementados; actualizar el párrafo de "Estado de implementación"
  (§3) con el cierre de Sprint 4.
- [ ] `CLAUDE.md`: si queda algo desactualizado sobre el estado del proyecto, corregirlo
  (mismo criterio que en cada sprint anterior).

**Verificación:**
- [ ] Manual: ciclo completo desde cero + smoke test de HU‑008/009/015…020 una vez más,
  con la documentación al día.

**Dependencias:** T1‑T9.

**Archivos:** `chaincode/README.md`, `backend/README.md`, `claude_docs/SPEC.md`,
`CLAUDE.md` (si aplica).

**Alcance:** S.

---

### ✅ Checkpoint: HU‑008/009/015…020 terminadas (DoD — SPEC §10.2)
- [ ] Los escenarios Gherkin de HU‑008/009/015…020 en PASS.
- [ ] RF‑18…22, RF‑37…51 y RNF relevantes marcados como implementados.
- [ ] Entorno verificado en Docker Compose.
- [ ] Commit(s) de cierre con mensaje redactado (sin commit automático).
- [ ] Aceptación de dirección/codirección registrada.
