# TODO — Sprint 3 · módulo `verification` · HU‑010…014

Plan: `claude_docs/tasks/plan-sprint3-verification.md` (**aprobado 2026‑10‑07**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T4 completos y revisados (T4: APPROVE). Checkpoint "backend↔ledger real
(verificación)" cerrado. Listo para commit. Sigue T5 (frontend:
`VerificarIntegridadPage`).**
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1 — Chaincode

### T1: Chaincode — `GetDocument` + `RecordVerification` + tests unitarios

**Descripción:** Primera función de lectura del chaincode (`GetDocument`) y primera
función que actualiza un documento ya existente (`RecordVerification`). Sin red todavía —
solo compila y sus tests unitarios pasan (D1‑D4 del plan).

**Criterios de aceptación:**
- [x] `GetDocument(ctx, documentID) (*Document, error)` — `evaluateTransaction`, lee el
  `Document` ya guardado por `RegisterDocument`; error claro si `documentID` no existe
  (HU‑010‑CA‑02).
- [x] `RecordVerification(ctx, documentID, result, user) (*Event, error)` — valida
  `documentID`/`user` no vacíos y `result` ∈ `{"confirmada","comprometida"}`; falla si el
  documento no existe (no se puede verificar algo no registrado); actualiza
  `Document.Status` a `"Verificado"`/`"Alterado"` según `result` (RF‑34) y escribe un
  nuevo `Event{Action:"verificacion", Result, Timestamp, TxID, User}` en su propia clave
  compuesta (nunca sobreescribe el evento de `"registro"` original).
- [x] Refactor D4: `putEvent(ctx, doc Document, evt Event) error` recibe el `Document` ya
  armado (ya no hardcodea `Status:"Pendiente"` adentro) — `RegisterDocument` y
  `RecordVerification` arman cada uno su propio `Document` antes de llamarlo.
- [x] Mismo criterio de determinismo que `RegisterDocument`: `GetTxTimestamp()`, nunca
  `time.Now()`.

**Verificación:**
- [x] Build: `go build ./...`, `go vet ./...` sin errores; `gofmt -l contract/*.go main.go`
  sin salida (los archivos de `vendor/` que sí lista `gofmt -l .` son de terceros, nunca
  tocados).
- [x] Tests: 24/24 en verde (10 ya existentes de `RegisterDocument` + 14 nuevos) —
  `GetDocument` éxito, no encontrado, `documentID` vacío, fallo de `GetState`, fallo de
  unmarshal; `RecordVerification` éxito con `"confirmada"` (confirma `Status→"Verificado"`,
  que `Sha256Hex` no cambia, y los 2 `PutState`) y con `"comprometida"`
  (`Status→"Alterado"`), documento no encontrado (sin `PutState`), `result` inválido (sin
  siquiera un `GetState` — falla antes de leer), `documentID`/`user` vacíos, y los mismos
  5 fallos inyectados que ya cubría `RegisterDocument` aplicados a la función nueva.
- [x] Ronda de `code-reviewer` (verdict: **APPROVE**, sin Required): confirmó que ambos
  *callers* de `putEvent` (`RegisterDocument`/`RecordVerification`) arman `doc.DocumentID`
  y `evt.DocumentID` desde el mismo string, así que son consistentes hoy — pero señaló
  que antes del refactor esa invariante la garantizaba el propio diseño de `putEvent`
  (armaba el `Document` adentro) y ahora depende de que cada *caller* lo haga bien.
  Aplicado el guard de una línea en `putEvent` (`doc.DocumentID != evt.DocumentID` →
  error) para que quede chequeado, no solo asumido, ante un tercer *caller* futuro.
  También aplicado el hallazgo Optional de estilo: `validVerificationResults` se movió
  junto a `eventKeyType`/`sha256HexPattern` (las otras constantes que definen formas
  válidas), en vez de quedar en medio de las funciones. Confirmó además, revisando
  HU‑014‑CA‑02 del Gherkin (`SPEC.md:677`), que permitir re-verificar un documento ya
  verificado es correcto (esa HU describe "Nueva verificación" como reset de UI, no como
  una restricción de unicidad — a diferencia de `RegisterDocument`, que sí rechaza un
  duplicado); que el patrón leer-mutar-escribir no introduce ningún riesgo nuevo de
  atomicidad (Fabric ya lo resuelve vía MVCC en la fase de validación, igual que ya
  cubría `RegisterDocument` desde Sprint 2 — un conflicto real se resuelve con
  `MVCC_READ_CONFLICT`, responsabilidad de reintento del backend en T4, no del
  chaincode); y que los nombres/valores (`GetDocument`, `RecordVerification`,
  `"confirmada"`/`"comprometida"`) coinciden exactamente con `SPEC.md` §4.1. Re-verificado
  tras los 2 fixes: 24/24 tests, build/vet/gofmt limpios.

**Dependencias:** ninguna (Sprint 2 ya cerrado).

**Archivos:** `chaincode/contract/smartcontract.go`, `chaincode/contract/smartcontract_test.go`.

**Alcance:** M.

---

### T2: Deploy del chaincode actualizado

**Descripción:** Subir de versión el chaincode ya desplegado (upgrade, no deploy desde
cero — mismo mecanismo que el bugfix de `metadata:",optional"` en Sprint 2 T2) y probar
`GetDocument`/`RecordVerification` contra la red real.

**Criterios de aceptación:**
- [x] Upgrade manual del chaincode ya desplegado: `./network.sh deployCC -c
  contratoschannel -ccn contracts -ccp ../../../chaincode -ccl go -ccv 1.1` (bypaseando
  el guard de idempotencia de `deploy-cc.sh`, que solo chequea "¿hay *alguna* versión
  committed?" — no detecta cambios de código, mismo criterio que el redeploy puntual de
  Sprint 2 T2). Confirmado `querycommitted` en ambos orgs: `Version: 1.1, Sequence: 2,
  Approvals: [Org1MSP: true, Org2MSP: true]`.
- [x] **No se tocó `docker/deploy-cc.sh`** — decisión explícita, no un olvido: su propia
  idempotencia (nunca reintenta si ya hay algo committed) significa que no vuelve a
  desplegar nada en un ciclo normal de `up.sh`; agregarle `GetDocument`/`RecordVerification`
  a su smoke test de un solo despliegue inicial habría sido construir para un caso que no
  se repite (YAGNI) — la verificación real de punta a punta ya quedó hecha a mano abajo,
  con más profundidad de la que un script automatizado necesitaría cubrir para esto.
- [x] Prueba real de extremo a extremo: un documento registrado se consulta con
  `GetDocument`, y dos verificaciones reales (una `"confirmada"`, otra `"comprometida"`)
  actualizan su estado correctamente.

**Verificación:**
- [x] Manual, contra la red ya arriba (upgrade sin bajar la red): `RegisterDocument` →
  `GetDocument` devuelve `Status:"Pendiente"` real; `RecordVerification(..., "confirmada",
  ...)` → `GetDocument` devuelve `Status:"Verificado"`, con `txID` real
  (`0c19c1fd...`); un segundo documento con `RecordVerification(..., "comprometida", ...)`
  → `Status:"Alterado"` (`txID` real `4f377f56...`); un `result` inválido
  (`"tal-vez"`) rechazado con el mensaje exacto del chaincode; `GetDocument` de un
  `documentID` inexistente rechazado con `"document ... not found"`.
- [x] **Bug real encontrado y corregido — no del chaincode, de mis propias pruebas
  manuales:** las primeras invocaciones de `RegisterDocument`/`GetDocument` con un solo
  peer endosando (`--peerAddresses localhost:7051` únicamente, calcando sin pensar el
  patrón del *segundo* invoke de `deploy-cc.sh`, que deliberadamente usa un solo peer
  porque ahí el rechazo esperado ocurre en la simulación, nunca llega a comprometerse)
  parecían tener éxito (`status:200`) pero nunca anclaban nada — confirmado con
  `--waitForEvent`: `ENDORSEMENT_POLICY_FAILURE`. La política real del canal (2
  organizaciones, `MAJORITY` implícita = 2 de 2) exige el endoso de **ambos** peers para
  cualquier invocación que de verdad vaya a comprometerse — exactamente el patrón que ya
  usa `network.sh`'s propio `chaincodeInvoke` (`scripts/ccutils.sh:305`, dos
  `--peerAddresses`) para el *primer* invoke de `deploy-cc.sh`. Nada que corregir en el
  repo — era mi propio comando manual el que estaba mal armado; se documenta acá para que
  quien pruebe algo a mano en el futuro no pierda tiempo con el mismo diagnóstico.

**Dependencias:** T1.

**Archivos:** `chaincode/` sin cambios de código (solo el upgrade de versión desplegado).

**Alcance:** S.

---

### ✅ Checkpoint: chaincode operativo
- [x] `GetDocument`/`RecordVerification` compilan, sus tests pasan (24/24), y una
  invocación real en la red devuelve un `txID` y actualiza el estado de un documento real
  (confirmado dos veces: `"confirmada"→Verificado`, `"comprometida"→Alterado`).
- [x] Revisado por `code-reviewer` (determinismo, atomicidad del update, invariante
  `doc.DocumentID == evt.DocumentID` ahora chequeada en `putEvent`).

---

## Fase 2 — Backend

### T3: Backend — `GET /documents/:id` (consulta con enmascarado de hash)

**Descripción:** Primer uso real de `queryChaincode`/`evaluateTransaction` para datos de
negocio (hasta ahora solo lo usaba el diagnóstico de `/fabric/ping`). Consulta un
documento por id; enmascara el hash completo salvo rol Verificador/Administrador (D5).

**Criterios de aceptación:**
- [x] `GET /documents/:id`, `requireAuth()` sin roles (cualquier rol autenticado puede
  consultar — RF‑25/26 no restringen por rol como sí lo hace la carga; el *enmascarado*
  es lo que varía por rol, no el acceso al endpoint).
- [x] `200` con `{documentId, name?, responsibleUser?, registeredAt?, hash, status}`
  (`hash` completo o enmascarado según rol); `404` si `GetDocument` del chaincode dice
  que no existe (HU‑010‑CA‑02); `502` si la consulta al chaincode falla por otro motivo.
- [x] Enmascarado server-side (`maskHash`, mismo algoritmo que ya usa el frontend,
  copiado — no importado, son paquetes npm distintos sin un módulo compartido todavía) —
  no se confía en que el frontend lo oculte.
- [x] No se necesitó ningún wrapper nuevo en `gateway.ts` — `queryChaincode(fcn, ...args)`
  ya era genérico desde Sprint 2 (T5 lo usaba para `GetMetadata`), alcanza tal cual para
  `GetDocument`.
- [x] `findDocumentById` nuevo en `documentRepository.ts` (Mongo da nombre/usuario/fecha;
  el ledger sigue siendo la autoridad para `hash`/`status`, `SPEC.md` §4.1) — si el
  documento existe en el ledger pero no en Mongo (inconsistencia real, ya logueada en
  `registerDocument` si ocurrió ahí), se responde `200` igual con lo que el ledger sí
  tiene, en vez de un `404` falso.

**Verificación:**
- [x] Manual contra la red real: login Empleado → `POST /documents` con un PDF real →
  `GET /documents/:id` como el mismo Empleado → hash enmascarado (`6a0fe4fc•••...•••695e82df`);
  login Verificador → mismo `GET` → hash completo idéntico en el prefijo/sufijo
  (`6a0fe4fc1d2818ed...695e82df`); un id inexistente → `404`; sin token → `401`. Sin
  regresión: `bash docker/smoke-test.sh` → `PASS`.
- [x] Tests: 7 casos nuevos en `backend/tests/documents.test.ts` (Verificador/Administrador
  con hash completo, Empleado con hash enmascarado, 404, 502, 401, ledger-sin-Mongo) — 70/70
  tests del backend en verde.
- [x] Build/lint del backend en 0 errores/warnings.
- [x] Ronda de `code-reviewer` (verdict: **REQUEST CHANGES** → aplicado, 2 Required): el
  chequeo de "no encontrado" (`describeFabricError(err).includes("not found")`) era
  correcto para el chaincode (confirmado: ese substring literal aparece en un único
  lugar de `smartcontract.go`), pero demasiado frágil un nivel más arriba — un error de
  **transporte** (peer caído, canal/chaincode mal configurado, timeout) nunca trae
  `.details` poblado, pero si su mensaje genérico mencionara "not found" por coincidencia,
  se habría disfrazado de un `404` de negocio en vez de un `502` de infraestructura.
  Corregido: nuevo `isDocumentNotFoundError()` que exige `.details` poblado (prueba real
  de que el error vino del peer) antes de mirar el texto — un error de transporte nunca
  puede pasar ese chequeo. Agregado un test nuevo que prueba exactamente ese caso
  (mensaje con "not found" pero sin `.details` → `502`, no `404`). También encontró que
  el comentario "el ledger es la autoridad para hash/status" citaba `SPEC.md` §4.1 sin
  que el documento dijera eso realmente — la tabla original (de antes de Sprint 3) solo
  tenía a MongoDB como dueño de `status`, correcto hasta que `RecordVerification` (T1 de
  este sprint) empezó a mutarlo on-chain. Corregido `SPEC.md` con nota de cambio. Hallazgo
  Optional aplicado: la exposición sin enmascarar de `responsibleUser` a cualquier rol
  quedó documentada como decisión consciente (D5b del plan), no implícita. Re-verificado
  tras los fixes: 17/17 tests (incluye el nuevo), build/lint limpios, y el `404` real
  sigue funcionando contra la red (rebuild del contenedor `backend` + prueba en vivo).

**Dependencias:** T2.

**Archivos:** `backend/src/routes/documents.ts` (`GET /documents/:id`),
`backend/src/services/documentService.ts` (`getDocument`, `maskHash`),
`backend/src/repositories/documentRepository.ts` (`findDocumentById`),
`backend/tests/documents.test.ts`.

**Alcance:** M.

---

### T4: Backend — `POST /documents/:id/verifications` (comparación + registro)

**Descripción:** El Verificador sube un PDF a comparar; el backend calcula su hash, lo
compara contra el registrado, llama `RecordVerification` y actualiza Mongo — slice de
mayor riesgo del sprint (HU‑012/013/014 completas).

**Criterios de aceptación:**
- [x] `POST /documents/:id/verifications`, `requireAuth("Verificador")`.
- [x] Valida el PDF a comparar igual que `POST /documents` (firma real, 20MB, un archivo)
  — el multer de ambas rutas se factorizó en `handleUpload()` compartido, no copy-paste.
- [x] Calcula el hash, pide el documento registrado (`queryLedgerDocument`, el mismo
  helper interno que ya usaba `getDocument` de T3 — mismo chequeo 404/502), compara;
  llama `RecordVerification(documentId, "confirmada"|"comprometida", userId)`.
- [x] Mismo criterio ledger-primero-Mongo-después que D13 de Sprint 2: si
  `RecordVerification` falla, no se actualiza el `status` en Mongo (`updateDocumentStatus`,
  nuevo en `documentRepository.ts`) ni se muestra éxito. Si el ledger tiene éxito pero
  Mongo falla después, se loguea como inconsistencia y se responde `500` (mismo patrón
  que `registerDocument`).
- [x] Responde `{status: "Verificado"|"Alterado", matches, registeredHash, computedHash}`
  (hash completo en los dos porque quien pregunta ya es Verificador — `requireAuth` ya
  lo garantiza, no hace falta enmascarar nada acá).

**Verificación:**
- [x] Manual contra la red real: login Empleado → registrar un PDF real → login
  Verificador → verificar con el **mismo** PDF → `200 {status:"Verificado", matches:true,
  ...}` con hashes idénticos; verificar el mismo documento con un PDF **distinto** →
  `200 {status:"Alterado", matches:false, ...}`; `GetDocument` después confirma
  `status:"Alterado"` reflejado en el ledger; un `documentId` inexistente → `404`; un
  Empleado intentando verificar → `403`; sin token → `401`. Sin regresión:
  `bash docker/smoke-test.sh` → `PASS`.
- [x] Tests: 7 casos nuevos (coincide/Verificado, no coincide/Alterado, PDF inválido,
  documento inexistente, rol distinto de Verificador, fallo de `RecordVerification` —
  confirma que `updateDocumentStatus` nunca se llama —, Mongo falla después del éxito en
  el ledger) — 78/78 tests del backend en verde.
- [x] Build/lint del backend en 0 errores/warnings.
- [x] Ronda de `code-reviewer` (verdict: **APPROVE**, sin Required): confirmó con `git
  diff` que el refactor de `queryLedgerDocument` no cambió el comportamiento de
  `getDocument` (T3) — solo renombró `ledgerDoc` a `ledgerResult.doc`, línea por línea
  igual. Confirmó revisando `RecordVerification` (T1) que un reintento tras un crash del
  backend entre el commit al ledger y el `updateDocumentStatus` es seguro (sin guard de
  "ya verificado", cada evento tiene su propio `TxID` en su propia clave compuesta — no
  hay colisión ni duplicado silencioso), aunque sí deja dos eventos reales de verificación
  para lo que el humano percibe como una sola acción — consecuencia ya aceptada en D13 de
  Sprint 2, no un bug nuevo. Aplicado el único hallazgo Optional: comentario agregado
  junto al `submitChaincodeTransaction("RecordVerification", ...)` dejando esa
  consecuencia explícita en vez de implícita. Confirmó además que el hash siempre
  completo en la respuesta es correcto (RF‑23…40 son exclusivamente "Rol Verificador",
  ninguna HU de verificación incluye a Administrador — si eso cambia algún día,
  `requireAuth("Verificador","Administrador")` es un cambio de una línea), y que validar
  el PDF antes de consultar el ledger tiene una ventaja real (evita un round-trip a
  Fabric para un archivo que de todas formas termina en `400`, confirmado por el test que
  verifica que `queryChaincode` nunca se llama en ese caso). Re-verificado: build/lint
  limpios (el cambio es solo un comentario, no hizo falta rebuild del contenedor).

**Dependencias:** T3.

**Archivos:** `backend/src/routes/documents.ts` (`POST /documents/:id/verifications`,
`handleUpload` factorizado), `backend/src/services/documentService.ts`
(`verifyDocument`, `queryLedgerDocument` compartido con `getDocument`),
`backend/src/repositories/documentRepository.ts` (`updateDocumentStatus`),
`backend/tests/documents.test.ts`.

**Alcance:** M.

---

### ✅ Checkpoint: backend↔ledger real (verificación)
- [x] `GET /documents/:id` y `POST /documents/:id/verifications` de punta a punta contra
  la red real, con y sin fallas forzadas (PDF inválido, documento inexistente, rol
  equivocado — todas verificadas en vivo).
- [x] Revisado por `code-reviewer` (T3: REQUEST CHANGES → aplicado; T4: APPROVE).

---

## Fase 3 — Frontend

### T5: Frontend — `VerificarIntegridadPage` real

**Descripción:** La pantalla de verificación del Verificador (hoy mock) pasa a llamar a
los endpoints reales.

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `getDocument(token, documentId)` y
  `verifyDocument(token, documentId, file)`.
- [ ] `VerificarIntegridadPage` deja de usar `useAppData().verifyDocument` (el mock) para
  la llamada real; error de validación o de comparación se muestra en la UI existente.
- [ ] **Contrato a tener en cuenta (hallazgo del review de T3):** `GET /documents/:id`
  puede responder `name`/`responsibleUser`/`registeredAt` ausentes (`undefined`) si el
  documento existe en el ledger pero no en Mongo (inconsistencia real, poco común) — la
  UI tiene que mostrar un placeholder razonable en ese caso, no asumir que esos campos
  siempre vienen.
- [ ] `npm run build`/`npm run lint` pasan. El chequeo de "sin infraestructura directa"
  sigue sin encontrar nada.

**Verificación:**
- [ ] Manual en navegador (o mecánico si no hay navegador disponible, mismo criterio que
  T6 de Sprint 2): Verificador consulta un documento real → ve su huella completa; sube
  un PDF idéntico → `Verificado`; sube uno distinto → `Alterado`.

**Dependencias:** T4.

**Archivos:** `frontend/src/lib/api.ts`,
`frontend/src/pages/verificador/VerificarIntegridadPage.tsx`.

**Alcance:** M.

---

### ✅ Checkpoint: HU‑010…014 de punta a punta
- [ ] Flujo completo probado (navegador o mecánico + confirmación de Sofia).
- [ ] `npm run build`/`lint`/`test` de frontend y backend pasan; `go build`/`vet`/`test`
  del chaincode pasan.

---

## Fase 4 — Documentación y cierre

### T6: Documentación y trazabilidad SPEC

**Descripción:** Mismo cierre que T7 de Sprint 2.

**Criterios de aceptación:**
- [ ] `chaincode/README.md`: agregar `GetDocument`/`RecordVerification` a la sección de
  qué hace el contrato.
- [ ] `backend/README.md`: sección de `verification` con el contrato de los 2 endpoints
  nuevos (mismo formato de tabla que `documents`/`identity`).
- [ ] `claude_docs/SPEC.md`: marcar RF‑23…36 y RNF‑05, 08, 10, 14, 23, 24, 27 como
  implementados junto al mapa de capacidades (§3). Aclarar que RF‑37…40 (consulta
  general del Verificador) no están — Sprint 4.

**Verificación:**
- [ ] Manual: ciclo completo desde cero + smoke test de HU‑010…014.

**Dependencias:** T1‑T5.

**Archivos:** `chaincode/README.md`, `backend/README.md`, `claude_docs/SPEC.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑010…014 terminadas (DoD — SPEC §10.2)
- [ ] Los 10 escenarios Gherkin de HU‑010…014 (CA‑01/CA‑02, HU‑014 con CA‑01/CA‑02
  además del "Nueva verificación") en PASS.
- [ ] RF‑23…36 y RNF‑05, 08, 10, 14, 23, 24, 27 marcados como implementados.
- [ ] Entorno verificado en Docker Compose.
- [ ] Commit(s) de cierre con mensaje redactado (sin commit automático).
- [ ] Aceptación de dirección/codirección registrada.
