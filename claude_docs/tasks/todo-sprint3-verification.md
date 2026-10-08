# TODO — Sprint 3 · módulo `verification` · HU‑010…014

Plan: `claude_docs/tasks/plan-sprint3-verification.md` (**aprobado 2026‑10‑07**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T2 completos. Checkpoint "chaincode operativo" cerrado — `GetDocument`/
`RecordVerification` funcionando en vivo contra la red real. Listo para commit. Sigue T3
(backend: `GET /documents/:id`).**
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
- [ ] `GET /documents/:id`, `requireAuth(...)` (cualquier rol autenticado puede consultar
  — RF‑25/26 no restringen por rol como sí lo hace la carga; el *enmascarado* es lo que
  varía por rol, no el acceso al endpoint).
- [ ] `200` con `{documentId, hash (completo o enmascarado según rol), status, ...}`;
  `404` si `GetDocument` del chaincode dice que no existe (HU‑010‑CA‑02).
- [ ] Enmascarado server-side (no confiar en que el frontend lo oculte) — mismo criterio
  de enmascarado que ya usa `maskHash` en frontend, ahora también en backend.

**Verificación:**
- [ ] Manual contra la red real: un documento ya registrado (de Sprint 2) consultado
  como Verificador → hash completo; como Empleado (no el dueño) → hash enmascarado; un
  id inexistente → `404`.
- [ ] Tests: `backend/tests/documents.test.ts` (o un archivo nuevo si crece mucho) cubre
  los 3 casos de arriba.
- [ ] Build/test/lint del backend en verde.
- [ ] Ronda de `code-reviewer`.

**Dependencias:** T2.

**Archivos:** `backend/src/routes/documents.ts` (o un archivo nuevo si la ruta crece),
`backend/src/services/documentService.ts`, `backend/src/fabric/gateway.ts` (si hace
falta un wrapper nuevo para `GetDocument`), tests.

**Alcance:** M.

---

### T4: Backend — `POST /documents/:id/verifications` (comparación + registro)

**Descripción:** El Verificador sube un PDF a comparar; el backend calcula su hash, lo
compara contra el registrado, llama `RecordVerification` y actualiza Mongo — slice de
mayor riesgo del sprint (HU‑012/013/014 completas).

**Criterios de aceptación:**
- [ ] `POST /documents/:id/verifications`, `requireAuth("Verificador")`.
- [ ] Valida el PDF a comparar igual que `POST /documents` (firma real, 20MB, un archivo).
- [ ] Calcula el hash, pide el documento registrado, compara; llama
  `RecordVerification(documentId, "confirmada"|"comprometida", userId)`.
- [ ] Mismo criterio ledger-primero-Mongo-después que D13 de Sprint 2: si
  `RecordVerification` falla, no se actualiza el `status` en Mongo ni se muestra éxito.
- [ ] Responde `{status: "Verificado"|"Alterado", registeredHash, computedHash}` (hash
  completo porque quien pregunta ya es Verificador).

**Verificación:**
- [ ] Manual contra la red real: verificar con el mismo PDF ya registrado → `Verificado`;
  con uno distinto → `Alterado`; ambos casos confirmados con un evento real
  (`GetDocument`/consulta directa del ledger) con su propio `txID`.
- [ ] Tests: éxito (coincide), éxito (no coincide), PDF inválido, documento inexistente,
  rol distinto de Verificador, fallo del chaincode (no debe tocar Mongo).
- [ ] Build/test/lint del backend en verde.
- [ ] Ronda de `code-reviewer` (foco: mismo nivel de rigor que T4 de Sprint 2 — ningún
  camino de éxito a medias).

**Dependencias:** T3.

**Archivos:** `backend/src/routes/documents.ts`, `backend/src/services/documentService.ts`
(o un `verificationService.ts` nuevo si la lógica no calza bien en el mismo archivo),
tests.

**Alcance:** M.

---

### ✅ Checkpoint: backend↔ledger real (verificación)
- [ ] `GET /documents/:id` y `POST /documents/:id/verifications` de punta a punta contra
  la red real, con y sin fallas forzadas.
- [ ] Revisado por `code-reviewer`.

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
