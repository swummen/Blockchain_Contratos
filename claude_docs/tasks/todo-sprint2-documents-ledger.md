# TODO — Sprint 2 · módulos `documents` + `ledger` · HU‑005…007

Plan: `claude_docs/tasks/plan-sprint2-documents-ledger.md` (**aprobado 2026‑09‑20**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1 completo y verificado. Arrancando T2.**
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1 — Chaincode real

### T1: Chaincode — contrato `RegisterDocument` + tests unitarios

**Descripción:** Primer código Go del proyecto. `ContractsContract.RegisterDocument`
(firma exacta de `SPEC.md` §7) ancla la huella SHA‑256 de un documento y un evento
`"registro"`, sin recibir nunca el PDF. Sin red todavía — solo compila y sus tests
unitarios pasan (D1‑D4 del plan).

**Criterios de aceptación:**
- [x] `chaincode/go.mod` (módulo `github.com/contratos/chaincode`, dependencias fijadas a
  las mismas versiones que `docker/fabric-samples/asset-transfer-basic/chaincode-go/go.mod`,
  D3 — resueltas con `go mod tidy`, `go.sum` generado). `chaincode/main.go` (entrypoint
  `contractapi.NewChaincode` + `.Start()`).
- [x] `chaincode/contract/smartcontract.go`: `ContractsContract` (embebe
  `contractapi.Contract`), `Event{Action, DocumentID, Result, Timestamp, TxID, User}` y
  `Document{DocumentID, Sha256Hex, Status}` (campos en orden alfabético), `RegisterDocument`
  con la firma exacta del ejemplo de `SPEC.md` §7 — además valida `documentID`/`user` no
  vacíos (regla propia de estilo de `SPEC.md` §7: "validar todo argumento").
- [x] `validateHash(sha256Hex string) error`: valida formato hex de 64 caracteres (SHA‑256)
  con `regexp`.
- [x] `documentExists`/`putEvent` como helpers internos (no funciones de contrato, D6):
  `putEvent` hace `PutState(documentID, docJSON)` (documento con `Status:"Pendiente"`) +
  `PutState` en la clave compuesta `CreateCompositeKey("event", [documentID, txID])` con
  el `Event` (D5) — dos escrituras, nunca sobreescribe un evento ya puesto.
- [x] `RegisterDocument` rechaza un `documentID` ya registrado, un hash con formato
  inválido, y usa `ctx.GetStub().GetTxTimestamp()` para el timestamp (nunca `time.Now()`
  — determinismo entre peers endosantes).
- [x] `chaincode/contract/mocks/` — copiados de `asset-transfer-basic` (D4): `ChaincodeStub`,
  `TransactionContext`, `StateQueryIterator`. No hicieron falta ajustes de import path (los
  mocks son genéricos, solo importan el SDK de Fabric, nunca el módulo de
  `asset-transfer-basic`) — sí hubo que normalizar sus finales de línea de CRLF a LF
  (venían así del clon externo de `fabric-samples`) para que `gofmt -l` quedara limpio; se
  agregó `*.go eol=lf` a `.gitattributes` (mismo criterio que `*.sh eol=lf` de Sprint 0)
  para que no vuelva a pasar.

**Verificación:**
- [x] Build: `go build ./...`, `go vet ./...` sin errores. `gofmt -l .` sin salida (nada
  por formatear).
- [x] Tests: `go test ./...` (7/7) — registro exitoso (confirma con
  `PutStateArgsForCall` que ambas escrituras —documento y evento— llevan la clave y el
  JSON esperados), documento ya existente, hash con formato inválido, `documentID`/`user`
  vacíos, fallo de `GetState` propagado, fallo de `PutState` propagado.

**Dependencias:** ninguna.

**Archivos:** `chaincode/go.mod`, `chaincode/go.sum`, `chaincode/main.go`,
`chaincode/contract/smartcontract.go`, `chaincode/contract/smartcontract_test.go`,
`chaincode/contract/mocks/*.go`, `.gitattributes`.

**Alcance:** M.

---

### T2: Deploy del chaincode real a la red

**Descripción:** Reemplazar `docker/deploy-sample-cc.sh` (`asset-transfer-basic`, D9 de
Sprint 0) por el deploy del chaincode real `contracts` (D7 del plan) en
`contratoschannel`, usando el mismo mecanismo de `network.sh deployCC` ya probado en
Sprint 0.

**Criterios de aceptación:**
- [ ] `docker/deploy-cc.sh` (nuevo, reemplaza a `deploy-sample-cc.sh`): empaqueta, instala,
  aprueba y hace commit de `chaincode/` como `contracts` en `contratoschannel`. Si
  `network.sh deployCC` necesita `go mod vendor` para un módulo sin `vendor/` (riesgo
  anotado en el plan), resolverlo acá.
- [ ] Script idempotente (mismo patrón que `deploy-sample-cc.sh`: detecta si ya está
  desplegado antes de reintentar).
- [ ] `docker/deploy-sample-cc.sh` se elimina (D9 de Sprint 0: "se elimina cuando entre el
  chaincode real").

**Verificación:**
- [ ] Manual: tras `network-up.sh`, correr `deploy-cc.sh` → `peer chaincode invoke` con
  `RegisterDocument` (un `documentID`/hash/usuario de prueba) confirma un `txID` real;
  una invocación repetida con el mismo `documentID` falla con el error esperado (ya
  registrado). Verificar en una corrida limpia desde cero.

**Dependencias:** T1.

**Archivos:** `docker/deploy-cc.sh` (nuevo), `docker/deploy-sample-cc.sh` (eliminado).

**Alcance:** M.

---

### ✅ Checkpoint: chaincode operativo
- [ ] `chaincode/` compila, sus tests pasan, y una invocación real en la red devuelve un
  `txID`.
- [ ] Revisado por `code-reviewer` (foco: determinismo del chaincode — nada de
  `time.Now()`/`rand`/mapas sin orden que puedan divergir entre peers endosantes;
  manejo de errores; que el PDF nunca aparezca en ningún argumento).

---

## Fase 2 — Backend: escritura real al ledger

### T3: Backend — `submitTransaction` en el Gateway + prueba mínima

**Descripción:** `backend/src/fabric/gateway.ts` gana la contraparte de escritura de
`queryChaincode()` (D8 del plan): `submitTransaction(fcn, ...args)`, que sí pasa por el
proceso de endoso + orden real (a diferencia de `evaluateTransaction`, de solo lectura).

**Criterios de aceptación:**
- [ ] `submitTransaction(fcn: string, ...args: string[]): Promise<Uint8Array>` — mismo
  `contract`/conexión que `queryChaincode`, sin deadline artificial de 3s (D8: un
  `submitTransaction` real puede tardar más que una query, tiene que pasar por el
  orderer).
- [ ] `backend/src/config/fabric.ts`: `chaincodeName` default pasa de `"basic"` a
  `"contracts"` (D7).
- [ ] Manejo de error igual de claro que `queryChaincode` (mensaje legible, no un stack
  crudo) si Fabric no está disponible o el endoso falla.

**Verificación:**
- [ ] Manual contra la red real (con T2 ya desplegado): un `submitTransaction("RegisterDocument", ...)`
  mínimo desde un script/REPL de prueba confirma que el backend puede escribir al ledger
  de verdad (no solo leer, que ya probó T5 de Sprint 1).
- [ ] Tests: Jest — mockeando el SDK de Fabric, igual que ya hace `fabric.test.ts`.
- [ ] Build: `npm run build`.

**Dependencias:** T2.

**Archivos:** `backend/src/fabric/gateway.ts` (ampliado), `backend/src/config/fabric.ts`
(`chaincodeName` default), `backend/tests/gateway.test.ts` (nuevo, o ampliar el existente).

**Alcance:** M.

---

### T4: Backend — `POST /documents` (validación + hash + registro)

**Descripción:** El primer endpoint de negocio real: el Empleado sube un PDF, se valida
(formato por firma de archivo, tamaño, un solo archivo — D10), se calcula su huella
SHA‑256, se registra en el chaincode (`RegisterDocument`, vía T3) y se guarda en Mongo
(`documents`, D11 para el id). **Slice de mayor riesgo del sprint** — primera escritura
real de negocio al ledger, primera vez que un fallo de blockchain no debe verse como
éxito (D13, HU‑007‑CA‑02).

**Criterios de aceptación:**
- [ ] `POST /documents`, protegido con `requireAuth("Empleado")` (D12 — primer uso real de
  la variante con roles del middleware de Sprint 1).
- [ ] `multer.memoryStorage()` (D9), un solo campo de archivo (RF‑10), límite `20MB`
  (RF‑11/RNF‑24); rechaza con `400` claro si se excede.
- [ ] Valida la firma de archivo (`%PDF-` al inicio del buffer, D10) antes de aceptar —
  rechaza con `400` un archivo que no sea PDF de verdad, sin confiar solo en el
  `Content-Type` del request.
- [ ] Calcula la huella con `crypto.createHash("sha256")` sobre el buffer completo
  (RF‑14/RNF‑11) — determinista: el mismo contenido siempre da el mismo hash (HU‑006‑CA‑02).
- [ ] Genera `documentId` (`crypto.randomUUID()`, D11), llama a
  `submitTransaction("RegisterDocument", documentId, hash, userId)`. Si falla: **no**
  guarda nada en Mongo, responde un error claro (nunca un `200`/mensaje de éxito —
  D13/HU‑007‑CA‑02).
- [ ] Si el registro en el ledger tiene éxito: guarda en Mongo `documents`
  (`{_id: documentId, name, responsibleUser: userId, registeredAt, hash, status:
  "Pendiente"}` — RF‑13, RF‑19, RF‑20) y responde `201` con el `documentId` (RF‑17).

**Verificación:**
- [ ] Manual contra el stack real: subir un PDF real de prueba (< 20MB) → `201` con
  `documentId`; verificar en Mongo que el documento quedó guardado y en la red (`peer
  chaincode query`, o una invocación de prueba) que el hash coincide. Subir el mismo PDF
  de nuevo (mismo contenido, `documentId` nuevo) → mismo hash exactamente (HU‑006‑CA‑02).
  Subir un archivo no-PDF renombrado a `.pdf` → `400`. Subir un PDF > 20MB → `400`. Subir
  dos archivos en el mismo request → rechazado (un solo campo).
- [ ] Tests: Jest — éxito, PDF inválido (firma), tamaño excedido, falla de
  `submitTransaction` (confirma que Mongo no se tocó y la respuesta no es de éxito), rol
  no autorizado (`403`/`401` vía `requireAuth`).
- [ ] Build: `npm run build`. `npm run lint`.

**Dependencias:** T3.

**Archivos:** `backend/src/routes/documents.ts` (nuevo), `backend/src/services/documentService.ts`
(nuevo), `backend/src/repositories/documentRepository.ts` (nuevo), `backend/src/server.ts`
(wiring + CORS de `/documents`, mismo criterio que `/auth` — acotado a `FRONTEND_ORIGIN`),
`backend/package.json` (dependencia `multer` + `@types/multer`),
`backend/tests/documents.test.ts` (nuevo).

**Alcance:** M.

---

### ✅ Checkpoint: backend↔ledger real
- [ ] `POST /documents` de punta a punta contra la red real, con y sin fallas forzadas.
- [ ] Revisado por `code-reviewer` (foco: D13 — ninguna escritura parcial silenciosa;
  validación de archivo no confiada solo al `Content-Type`; el PDF nunca llega a un log
  ni a un `console.error` con su contenido).

---

## Fase 3 — Orquestación y frontend

### T5: `docker/up.sh` usa el chaincode real

**Descripción:** `docker/up.sh` pasa de desplegar el chaincode de ejemplo a desplegar
`contracts` (T2). Actualizar documentación de puertos/comandos si aplica (no debería
cambiar ninguno).

**Criterios de aceptación:**
- [ ] `docker/up.sh` llama a `deploy-cc.sh` (no a `deploy-sample-cc.sh`, que ya no existe).
- [ ] `docker/README.md`: notas de T2 de Sprint 0 sobre el chaincode de ejemplo
  actualizadas/retiradas donde ya no apliquen; nueva nota si el deploy real necesitó algo
  distinto (ej. `go mod vendor`).

**Verificación:**
- [ ] Manual: `bash docker/down.sh && bash docker/up.sh` desde cero → stack completo arriba
  con el chaincode `contracts` desplegado (no `basic`).

**Dependencias:** T4.

**Archivos:** `docker/up.sh`, `docker/README.md`.

**Alcance:** S.

---

### T6: Frontend — `CargarDocumentoPage` real

**Descripción:** La pantalla de carga de documentos del Empleado (hoy mock, con datos de
`frontend/src/data/*.ts`) pasa a llamar a `POST /documents` real, usando el JWT que
`SessionContext` ya guarda desde Sprint 1.

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `uploadDocument(token, file)` — `multipart/form-data`,
  no JSON (distinto de todo lo que ya existe en `api.ts`).
- [ ] `CargarDocumentoPage` llama a la función real; error de validación (formato, tamaño)
  o de registro en el ledger se muestra en la UI existente.
- [ ] **Primer caso real de un 401 autenticado en una pantalla de negocio** (a diferencia
  de Sprint 1, donde no había ninguna) — decidir acá si conviene el interceptor global
  que T7 de Sprint 1 dejó pendiente para "cuando exista una llamada real que lo necesite".
- [ ] `npm run build`/`npm run lint` pasan. El chequeo de "sin infraestructura directa"
  (`grep` de Sprint 0/1) sigue sin encontrar nada.

**Verificación:**
- [ ] Manual en navegador (o mecánico si no hay navegador disponible en el entorno, mismo
  criterio que T6/T7 de Sprint 1): login como Empleado → cargar un PDF real → confirma
  éxito con el `documentId`; cargar un archivo inválido → error visible.

**Dependencias:** T4.

**Archivos:** `frontend/src/lib/api.ts`, `frontend/src/pages/empleado/CargarDocumentoPage.tsx`.

**Alcance:** M.

---

### ✅ Checkpoint: HU‑005…007 de punta a punta
- [ ] Flujo completo probado (navegador o mecánico + confirmación de Sofia): login →
  cargar documento → confirmación con `documentId` → verificable en Mongo y en el ledger.
- [ ] `npm run build`/`lint`/`test` de frontend y backend pasan; `go build`/`vet`/`test`
  del chaincode pasan.

---

## Fase 4 — Documentación y cierre

### T7: Documentación y trazabilidad SPEC

**Descripción:** Mismo cierre que T8 de Sprint 1: env vars nuevas, comandos nuevos,
trazabilidad de RF/RNF, y esta vez además `chaincode/README.md` (hoy un placeholder de
una línea) con contenido real.

**Criterios de aceptación:**
- [ ] `chaincode/README.md`: qué hace el contrato, cómo correr `go build`/`test`/`vet`,
  cómo desplegarlo (`docker/deploy-cc.sh`), el modelo de datos (`Event`, documento).
- [ ] `backend/.env.example`/`docker/.env.example`: cualquier env var nueva (`FABRIC_CHAINCODE_NAME`
  ya tenía default, confirmar si hace falta documentarlo explícito ahora que cambió).
- [ ] `backend/README.md`: sección de `documents` con el contrato de `POST /documents`
  (mismo formato de tabla que ya se usó para `/auth/*` en Sprint 1).
- [ ] `CLAUDE.md`/`claude_docs/SPEC.md` §5: la fila de `chaincode/` dice "nada todavía" —
  actualizar con los comandos reales (`go build ./...`, `go test ./...`, `go vet ./...`).
- [ ] `claude_docs/SPEC.md`: marcar RF‑08…17 y RNF‑04, 05, 09, 11, 13, 23, 24 como
  implementados (mismo lugar que se usó en Sprint 1, junto al mapa de capacidades §3).

**Verificación:**
- [ ] Manual: `docker/down.sh && docker/up.sh` desde cero + smoke test completo de
  HU‑005…007 una vez más, ya con toda la documentación al día.

**Dependencias:** T1‑T6.

**Archivos:** `chaincode/README.md`, `backend/README.md`, `backend/.env.example`,
`docker/.env.example`, `CLAUDE.md`, `claude_docs/SPEC.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑005…007 terminadas (DoD — SPEC §10.2)
- [ ] Los 6 escenarios Gherkin de HU‑005…007 (CA‑01/CA‑02 cada una) en PASS.
- [ ] RF‑08…17 y RNF‑04, 05, 09, 11, 13, 23, 24 marcados como implementados.
- [ ] Entorno verificado en Docker Compose.
- [ ] PR abierto y revisado; mensaje de commit redactado (sin commit automático).
- [ ] Aceptación de dirección/codirección registrada.
