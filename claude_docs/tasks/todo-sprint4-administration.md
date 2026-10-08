# TODO — Sprint 4 · módulo `administration` + consultas restantes · HU‑008, 009, 015…020

Plan: `claude_docs/tasks/plan-sprint4-administration.md` (**aprobado 2026‑10‑08**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T3 completos y revisados (T3: APPROVE, 2 Optional aplicados). Listo para
commit. Sigue T4 (`GET /events` trazabilidad general + `GET /documents/summary`).**
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
- [ ] `GET /events`, `requireAuth("Verificador", "Administrador")` — llama a
  `GetAllEvents`, ordena por `timestamp` (D2), responde
  `[{documentId, action, user, txId, timestamp, result?}, ...]`. Mismo nivel de detalle
  para los dos roles (D5/HU‑020‑CA‑02).
- [ ] `GET /documents/summary`, `requireAuth("Administrador")` — totales por `status`
  vía Mongo (`countDocuments` x4 o un `aggregate` agrupado, lo que sea más simple de
  escribir correctamente) — `{total, pendiente, verificado, alterado}` (D6, nunca
  limitado a los 100 de `GET /documents`).

**Verificación:**
- [ ] Manual contra la red real: con documentos en distintos estados, `GET /events`
  devuelve todos los eventos reales en orden cronológico; `GET /documents/summary` da
  totales que coinciden con un conteo manual en Mongo.
- [ ] Tests: `GET /events` éxito, orden cronológico confirmado con eventos
  deliberadamente desordenados en el mock, 403 Empleado, 401; `GET /documents/summary`
  éxito con números exactos, 403 no-Administrador.
- [ ] Build/test/lint del backend en verde.
- [ ] Ronda de `code-reviewer`.

**Dependencias:** T2.

**Archivos:** `backend/src/routes/documents.ts` (o un archivo nuevo si crece — considerar
`backend/src/routes/events.ts`), `backend/src/services/documentService.ts`, tests.

**Alcance:** M.

---

### T5: Backend — Gestión de usuarios (Administrador)

**Descripción:** RF‑43…47, la porción de `identity` pendiente desde Sprint 1.

**Criterios de aceptación:**
- [ ] `userRepository.ts` gana `listUsers()`, `insertUser(user)` (creación real,
  password temporal fija — D7b), `updateUser(userId, {name, email, role})`,
  `deactivateUser(userId)` (`status: "Inactivo"`, baja lógica — RF‑47, nunca borra nada).
- [ ] `GET /users`, `POST /users`, `PUT /users/:id`, `POST /users/:id/deactivate` — los 4,
  `requireAuth("Administrador")`. `POST /users` rechaza un correo ya registrado (mismo
  índice único que ya existe, `ensureIndexes`) con un mensaje claro, no un 500 de Mongo
  crudo.
- [ ] Ninguna ruta expone `passwordHash` (mismo criterio que `toPublicUser`, ya usado en
  `/auth/verify-otp`).

**Verificación:**
- [ ] Manual contra la red real (bueno, contra Mongo real — esto no toca el chaincode):
  Administrador crea un usuario nuevo → puede loguearse con la contraseña temporal →
  cambia su contraseña con `/auth/change-password` (ya existe); edita nombre/correo/rol
  de un usuario; lo desactiva → ya no puede loguearse (RF‑02‑CA‑02, ya lo valida
  `authService` desde Sprint 1) pero su trazabilidad histórica sigue intacta.
- [ ] Tests: los 4 endpoints, éxito y error (correo duplicado, usuario inexistente, rol
  distinto de Administrador, 401), confirmación de que `passwordHash` nunca viaja en
  ninguna respuesta.
- [ ] Build/test/lint del backend en verde.
- [ ] Ronda de `code-reviewer` (foco: que la contraseña temporal esté bien documentada
  como decisión deliberada, no un hueco de seguridad sin avisar — D7b).

**Dependencias:** ninguna (no depende del chaincode).

**Archivos:** `backend/src/repositories/userRepository.ts`,
`backend/src/services/userService.ts` (nuevo), `backend/src/routes/users.ts` (nuevo),
`backend/src/server.ts` (wiring), tests.

**Alcance:** M.

---

### ✅ Checkpoint: backend↔ledger real (consultas)
- [ ] Los 5 endpoints nuevos (`GET /documents/:id/events`, `GET /events`,
  `GET /documents/summary`, `GET /users`, `POST /users`, `PUT /users/:id`,
  `POST /users/:id/deactivate` — y el filtro por rol de `GET /documents`) probados de
  punta a punta contra la red/Mongo real.
- [ ] Revisado por `code-reviewer`.

---

## Fase 3 — Frontend

### T6: Frontend — Empleado: `MisDocumentosPage` + `MiTrazabilidadPage`

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana las funciones que falten (reusar `listDocuments`
  existente si el filtro por rol ya lo cubre del lado del backend; agregar
  `getDocumentEvents(token, documentId)`).
- [ ] `MisDocumentosPage` y `MiTrazabilidadPage` dejan de usar `useAppData()` (el mock).
- [ ] `npm run build`/`npm run lint` pasan.

**Verificación:**
- [ ] Manual en navegador (o mecánico si no hay navegador, mismo criterio de siempre):
  Empleado ve solo sus documentos y su propia trazabilidad.

**Dependencias:** T3.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/empleado/MisDocumentosPage.tsx`,
`frontend/src/pages/empleado/MiTrazabilidadPage.tsx`.

**Alcance:** M.

---

### T7: Frontend — Verificador: `DocumentosPage` + `TrazabilidadGlobalPage`

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `getAllEvents(token)`.
- [ ] Las dos pantallas dejan de usar `useAppData()`.
- [ ] `npm run build`/`npm run lint` pasan.

**Verificación:**
- [ ] Manual (o mecánico): Verificador ve todos los documentos registrados y toda la
  trazabilidad general.

**Dependencias:** T3, T4.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/verificador/DocumentosPage.tsx`,
`frontend/src/pages/verificador/TrazabilidadGlobalPage.tsx`.

**Alcance:** M.

---

### T8: Frontend — Administrador: `DashboardPage` + `DocumentosPage` + `TrazabilidadPage`

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `getDocumentsSummary(token)`.
- [ ] Las tres pantallas dejan de usar `useAppData()` para estos datos (reusan
  `listDocuments`/`getAllEvents` ya agregados en T7 donde aplique).
- [ ] `npm run build`/`npm run lint` pasan.

**Verificación:**
- [ ] Manual (o mecánico): el panel muestra totales reales que coinciden con Mongo; los
  listados de documentos/trazabilidad muestran lo mismo que ve el Verificador (mismo
  nivel de detalle, HU‑020‑CA‑02).

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
