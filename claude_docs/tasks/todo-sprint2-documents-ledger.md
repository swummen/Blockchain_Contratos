# TODO — Sprint 2 · módulos `documents` + `ledger` · HU‑005…007

Plan: `claude_docs/tasks/plan-sprint2-documents-ledger.md` (**aprobado 2026‑09‑20**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T4 completos, verificados y revisados. Pausado acá a pedido de Sofia — T5
arrancado pero sin terminar: `docker/up.sh` ya apunta a `deploy-cc.sh` (arreglado, ya no
está roto), pero falta actualizar `docker/README.md` y volver a verificar con un ciclo
`down.sh`+`up.sh` completo desde cero (el stack quedó abajo, `down.sh` fue lo último que se
corrió). Retomar T5 desde ahí.**
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
- [x] Tests: `go test ./...` (10/10 tras la ronda de review) — registro exitoso (confirma
  con `PutStateArgsForCall` que ambas escrituras —documento y evento— llevan la clave y el
  JSON esperados, y con `CreateCompositeKeyArgsForCall` que la clave del evento se arma
  con `(documentID, txID)`, D5), documento ya existente, hash con formato inválido,
  `documentID`/`user` vacíos, fallo de `GetState`, fallo del primer `PutState` (documento),
  fallo del segundo `PutState` (evento — rama distinta, agregada en el review), fallo de
  `GetTxTimestamp`, fallo de `CreateCompositeKey`.
- [x] Ronda de `code-reviewer` (verdict: APPROVE): confirmó que no hay ningún riesgo de
  no-determinismo (sin mapas, sin `time.Now()`, sin concurrencia — el orden alfabético de
  los campos es solo estilo, `encoding/json` en Go ya serializa por orden de declaración),
  que el manejo de errores es más estricto que el propio snippet ilustrativo de `SPEC.md`
  §7 (ese descarta errores con `_`), y que el PDF no tiene forma de colarse (los 3
  parámetros son `string`, `sha256Hex` pasa por una regex de 64 hex chars). Encontró 3
  huecos reales de cobertura de tests (`GetTxTimestamp`/`CreateCompositeKey` fallando sin
  test, y la falla del *segundo* `PutState` nunca ejercitada porque el test existente solo
  cubría la primera) — los 3 agregados. También señaló que la ausencia de chequeo de
  identidad dentro del chaincode no estaba documentada como decisión — se agregó D6b al
  plan explicando por qué es deliberado (el backend ya gatekeepea con JWT+OTP+RBAC antes
  de tocar Fabric).

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
- [x] `docker/deploy-cc.sh` (nuevo, reemplaza a `deploy-sample-cc.sh`): empaqueta, instala,
  aprueba y hace commit de `chaincode/` como `contracts` en `contratoschannel`.
  `network.sh`/`packageCC.sh` sí corre `go mod vendor` solo al empaquetar (confirmado
  leyendo `fabric-samples/test-network/scripts/packageCC.sh` — `pushd $CC_SRC_PATH &&
  GO111MODULE=on go mod vendor && popd`); el `vendor/` resultante queda en
  `chaincode/vendor/`, agregado a `.gitignore` (no hace falta versionarlo, `go.sum` ya
  alcanza para reproducibilidad).
- [x] Script idempotente (mismo patrón que `deploy-sample-cc.sh`: detecta si ya está
  desplegado antes de reintentar, vía `querycommitted`).
- [x] `docker/deploy-sample-cc.sh` eliminado (D9 de Sprint 0). **Nota de cambio:**
  `docker/up.sh` todavía lo invoca (línea 30) — queda roto hasta que T5 lo actualice; es
  el orden de tareas que ya fija el plan (T5 depende de T4, que depende de esta), no un
  descuido.

**Verificación:**
- [x] Manual, **cuatro** corridas limpias completas desde cero (`network-down.sh` +
  `network-up.sh` + `deploy-cc.sh`) a lo largo de la tarea: la 1ª destapó los bugs #1 y
  #2; la 2ª (ya con el fix de #1 y un primer intento de fix de #2) destapó que ese primer
  intento no alcanzaba (hallazgo Required del `code-reviewer`, ver abajo); la 3ª y 4ª, ya
  con el fix definitivo de #2 (`sleep` proactivo), pasaron limpias las dos —
  `peer chaincode invoke` con `RegisterDocument` confirma un `txID` real
  (`"Chaincode invoke successful. result: status:200 payload:{...TxID...}"`), y una
  invocación repetida con el mismo `documentID` es rechazada
  (`"document ... already registered"`).
- [x] Ronda de `code-reviewer` (verdict: REQUEST CHANGES → aplicado): encontró que el
  retry-loop del chequeo de duplicado tenía un hueco real — si un intento tenía éxito
  inesperadamente (la carrera de sincronización, no un rechazo), el loop lo trataba igual
  que "todavía no rechazado, reintentar" en vez de fallar de inmediato, así que una
  carrera real podía quedar enmascarada por un intento posterior que sí acertaba a
  rechazar. Corregido: un éxito inesperado ahora es fatal al toque (nunca reintentable),
  y ESE cambio fue justamente lo que expuso que el fix original de la carrera (solo
  reactivo) no alcanzaba — de ahí el `sleep 3` proactivo agregado después. También se
  aplicaron los hallazgos Optional: `set +e`/`set -e` reemplazado por `if cmd; then...`
  (mismo estilo que ya usa `deploy-sample-cc.sh`, menor superficie de error), y
  `SMOKE_DOC_ID` con `$$` agregado para evitar colisiones si dos corridas caen en el
  mismo segundo.

**Bugs reales encontrados y corregidos (no en el diseño, en la ejecución real contra la
red — exactamente el tipo de cosa que un test unitario con mocks no puede atrapar):**
1. **Schema de `contractapi` rechazaba el retorno de `RegisterDocument` en producción.**
  El primer intento de invocar falló con `"value did not match schema: Result is
  required"` — `contractapi` genera un JSON Schema del tipo de retorno por reflection y
  marca todo campo exportado como obligatorio salvo que lleve la etiqueta
  `metadata:",optional"` (confirmado leyendo `fabric-contract-api-go/v2@v2.2.0/metadata/schema.go:144-156`
  en el módulo cacheado) — el `,omitempty` del tag `json` no cuenta para esa validación,
  solo para el marshal. `Event.Result` queda vacío en un registro normal (no hay
  resultado de verificación todavía), así que **toda** invocación real de
  `RegisterDocument` fallaba. Corregido agregando `metadata:",optional"` al campo.
  Redeploy como versión 1.1/secuencia 2 para probarlo (upgrade puntual, no forma parte
  del flujo idempotente normal del script).
2. **El chequeo de duplicado podía dar falso negativo por el mismo desfase de
  sincronización ya documentado en Sprint 0 (`deploy-sample-cc.sh`, InitLedger→
  GetAllAssets).** `peer chaincode invoke` reporta éxito apenas el peer endosante simula
  la transacción, pero el world state recién refleja el bloque un instante después (una
  vez que el orderer lo corta y el peer lo valida). Verificado en la práctica: sin
  reintentos, la segunda invocación (esperando el rechazo) llegaba antes de ese commit y
  `documentExists` todavía veía el mundo vacío, **registrando un duplicado en vez de
  rechazarlo**. Primer intento de fix (solo un retry-loop reactivo) resultó insuficiente
  — ver el hallazgo Required del `code-reviewer` abajo, que expuso que el propio
  retry-loop podía enmascarar la carrera en vez de detectarla. Fix final: `sleep 3`
  **proactivo** después del primer invoke (el `BatchTimeout` por defecto de Fabric es
  ~2s) más el retry-loop como red de seguridad — no solo reintentar hasta ver el error
  esperado, sino directamente darle tiempo al bloque antes de intentar.

**Dependencias:** T1.

**Archivos:** `docker/deploy-cc.sh` (nuevo), `docker/deploy-sample-cc.sh` (eliminado),
`.gitignore` (`chaincode/vendor/`), `chaincode/contract/smartcontract.go` (fix del tag
`metadata:",optional"`).

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
- [x] `submitChaincodeTransaction(fcn: string, ...args: string[]): Promise<string>` —
  mismo `contract`/conexión que `queryChaincode` (factorizado en un `getContract()`
  interno compartido). **Nombre distinto al de la firma que sugería el plan
  (`submitTransaction`)**: ese nombre choca con el método del SDK
  (`contract.submitTransaction`) que la función envuelve — se siguió el mismo criterio ya
  usado para `queryChaincode` (que tampoco se llama `evaluateTransaction`), no un nombre
  que sea ambiguo al leer el call site.
- [x] Se agregaron deadlines propios para las 3 fases de un submit (`endorseOptions`,
  `submitOptions`, `commitStatusOptions`), no reutilizando el `EVALUATE_TIMEOUT_MS` de
  3s — D8 pedía explícitamente no usar ese deadline corto, pero dejar las otras fases sin
  ningún límite habría reabierto el mismo problema de "colgado para siempre" que ya se
  resolvió en todos lados (Mongo, evaluate, `fetch` del frontend). `COMMIT_TIMEOUT_MS` es
  el más largo (15s) porque tiene que esperar el corte real del bloque (~2s de
  `BatchTimeout` de Fabric, con margen).
- [x] `backend/src/config/fabric.ts`: `chaincodeName` default pasa de `"basic"` a
  `"contracts"` (D7).
- [x] Manejo de error: `submitChaincodeTransaction` no atrapa nada, deja propagar el error
  del SDK tal cual (mismo criterio que `queryChaincode`) — la decisión de **qué tanto**
  exponer de ese error le corresponde a la ruta que lo llame (ver hallazgo importante
  para T4 más abajo), no a `gateway.ts`.

**Verificación:**
- [x] Manual contra la red real (con T2 ya desplegado): un script descartable (`tsx`,
  borrado al terminar, nunca commiteado) llamó a `connectFabric()` +
  `submitChaincodeTransaction("RegisterDocument", ...)` de verdad, desde el backend en el
  host contra el peer publicado en `localhost:7051` → devolvió el `Event` con `txID` real
  (`{"Action":"registro",...,"TxID":"8388211d..."}`). Un segundo intento con el mismo
  `documentID` confirmó que el rechazo del chaincode también se propaga correctamente
  como error del lado del SDK (`EndorseError`, código gRPC `ABORTED`).
- [x] Tests: `backend/tests/gateway.test.ts` (nuevo — ver Ronda de `code-reviewer` abajo,
  terminó siendo Required, no algo que se pudiera saltar del todo como en un principio
  pensé). Mockea el SDK de verdad (`@hyperledger/fabric-gateway`, `@grpc/grpc-js`,
  `node:fs`, `node:crypto`) para poder controlar `contract.submitTransaction` — 2 casos:
  éxito (decodifica el resultado), y que un error del SDK se propaga **tal cual**
  (`.details` sobrevive, no se envuelve ni se descarta).
- [x] Build: `npm run build`, `npm run lint` (0 warnings), `npm test` (52/52, sin
  regresión — el mock existente de `fabric.test.ts` solo mockea `queryChaincode`, no se
  rompe con la función nueva).

**Hallazgo importante para T4** (no accionable en T3, `gateway.ts` no debe hacer esto —
ver arriba): el error que tira `submitTransaction` del SDK cuando el chaincode rechaza
algo (ej. documento duplicado) NO trae el mensaje real del chaincode en `.message` — ese
es un texto gRPC genérico ("failed to endorse transaction, see attached details for more
info"). El mensaje real del chaincode (`"document ... already registered"`) vive en
`.details[0].message` (`GatewayError.details: ErrorDetail[]`, confirmado leyendo
`node_modules/@hyperledger/fabric-gateway/dist/gatewayerror.d.ts`). `routes/fabric.ts` ya
tiene una nota propia advirtiendo esto exact: *"Antes de copiar este patrón [exponer
`err.message` crudo] a un endpoint real (Sprint 2+), reconsiderar si conviene sanitizar
como `/health`."* — T4 tiene que extraer `details[].message` explícitamente si quiere
mostrar el motivo real del rechazo, no confiar en `.message`.

- [x] Ronda de `code-reviewer` (verdict: APPROVE, con 1 Required): confirmó que el
  naming (`submitChaincodeTransaction`), la separación de capas (el formateo del error le
  toca a la ruta, no a `gateway.ts`), y los deadlines nuevos son razonables. Encontró que
  la verificación manual (real, pero con un script `tsx` descartable ya borrado) no deja
  ninguna protección permanente en el repo de que `submitChaincodeTransaction` siga
  propagando el error del SDK *tal cual* — si alguien más adelante envuelve
  `submitTransaction` en un try/catch "para loguear", rompería en silencio justo lo que
  T4 necesita (`GatewayError.details`) sin que ningún test lo note. Agregado
  `gateway.test.ts` con exactamente esos 2 casos (no un mocking exhaustivo del SDK
  entero). También se aplicó el hallazgo Optional: comentario junto a
  `ENDORSE_TIMEOUT_MS`/`SUBMIT_TIMEOUT_MS` (5s) advirtiendo el riesgo de cold-start justo
  después de un `network-up.sh` (el peer todavía levantando el contenedor del chaincode) —
  no se agregó retry especulativo, solo la nota para no diagnosticar mal un timeout futuro
  como bug del chaincode. Re-verificado: `npm run build`/`lint` (0 warnings)/`test`
  (54/54, incluye los 2 nuevos).

**Dependencias:** T2.

**Archivos:** `backend/src/fabric/gateway.ts` (ampliado: `getContract()` compartido,
`submitChaincodeTransaction`, deadlines de endorse/submit/commit + nota de cold-start),
`backend/src/config/fabric.ts` (`chaincodeName` default), `backend/tests/gateway.test.ts`
(nuevo).

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
- [x] `POST /documents`, protegido con `requireAuth("Empleado")` (D12 — primer uso real de
  la variante con roles del middleware de Sprint 1).
- [x] `multer.memoryStorage()` (D9), un solo campo de archivo (`document`, RF‑10), límite
  `20MB` (RF‑11/RNF‑24); rechaza con `400` claro si se excede.
- [x] Valida la firma de archivo (`%PDF-` al inicio del buffer, D10) antes de aceptar —
  rechaza con `400` un archivo que no sea PDF de verdad, sin confiar solo en el
  `Content-Type` del request.
- [x] Calcula la huella con `crypto.createHash("sha256")` sobre el buffer completo
  (RF‑14/RNF‑11) — determinista: el mismo contenido siempre da el mismo hash (HU‑006‑CA‑02).
- [x] Genera `documentId` (`crypto.randomUUID()`, D11), llama a
  `submitChaincodeTransaction("RegisterDocument", documentId, hash, userId)` (T3). Si
  falla: **no** guarda nada en Mongo, responde `502` (nunca un `200`/mensaje de éxito —
  D13/HU‑007‑CA‑02). El motivo real del error se loguea server-side (usando
  `.details[0].message` del hallazgo de T3), nunca se expone crudo al cliente — a
  diferencia de `/fabric/ping`, este es un endpoint de negocio real.
- [x] Si el registro en el ledger tiene éxito: guarda en Mongo `documents`
  (`{_id: documentId, name, responsibleUser: userId, registeredAt, hash, status:
  "Pendiente"}` — RF‑13, RF‑19, RF‑20) y responde `201` con el `documentId` (RF‑17).
- [x] **Caso no listado en el AC original, agregado por consistencia (RNF‑13):** si el
  registro en el ledger tuvo éxito pero el guardado en Mongo falla después (documento ya
  inmutable en la blockchain — RNF‑05, no hay forma de revertir), se loguea como una
  inconsistencia real (no un error silencioso) y se responde `500` — nunca un `200` falso.
  No se construyó un mecanismo de compensación/saga automático (sobre-ingeniería para un
  caso límite de un MVP de tesis); queda documentado como reconciliación manual.

**Verificación:**
- [x] Manual contra el stack real (rebuild del backend, red con el chaincode real de T2
  arriba): login real como Empleado → `POST /documents` con un PDF real (`%PDF-1.4...`) →
  `201` con `documentId` real. Confirmado en Mongo (`docker exec mongo mongosh`): el
  documento quedó con `hash`/`name`/`responsibleUser`/`status:"Pendiente"` correctos.
  Confirmado en el ledger real: un `peer chaincode invoke RegisterDocument` manual con ese
  mismo `documentId`+hash fue rechazado por `"already registered"` — prueba que el hash
  realmente quedó anclado on-chain, no solo en Mongo (RNF‑13). Archivo no-PDF renombrado a
  `.pdf` → `400` ("El archivo no es un PDF válido."). Request sin archivo → `400`. Login
  como Verificador e intentar subir → `403` ("No tenés permiso para esta acción."). Sin
  regresión: `/health`, `/fabric/ping`, `/` y `/system-status` del frontend siguen en `200`.
- [x] Tests: `backend/tests/documents.test.ts` (9 casos: éxito con verificación de que
  `submitChaincodeTransaction`/`insertDocument` reciben los datos correctos, mismo hash
  para el mismo contenido en dos subidas distintas, sin JWT, rol distinto de Empleado,
  sin archivo, PDF con firma inválida, archivo más grande que el límite, falla del
  registro en el ledger —confirma que `insertDocument` **no** se llama—, y Mongo fallando
  después de un registro exitoso en el ledger) — 63/63 tests del backend en verde.
- [x] Build: `npm run build` sin errores. `npm run lint` (oxlint) en 0 warnings/errores.
- [x] Ronda de `code-reviewer` (verdict: REQUEST CHANGES → aplicado): confirmó que D13
  se cumple de verdad en todos los caminos (rastreado línea por línea: Mongo nunca se
  toca antes de confirmar el chain-write, y Express 5 reenvía cualquier excepción no
  prevista al `handleUnexpectedError` existente, no hace falta un try/catch manual
  alrededor de toda la ruta). Encontró un hueco real: el manejador de errores de `multer`
  no logueaba nada — un error real (no del usuario) habría desaparecido sin rastro,
  mostrando siempre "archivo inválido" sin nada que mirar en el servidor. Agregado el log.
  También se aplicó el hallazgo Optional de recortar `file.originalname` a 255
  caracteres antes de guardarlo en Mongo (dato del cliente sin sanitizar más allá de
  eso). Confirmó además, revisando el chaincode, que la clave de deduplicación es el
  `documentID` (no el hash) — con `crypto.randomUUID()` la colisión es prácticamente
  imposible, así que no exponer `.details[0].message` al cliente no le cuesta nada a un
  usuario real hoy. Re-verificado: build/lint/test (63/63) limpios, rebuild del backend en
  Docker, un PDF real subido de nuevo con éxito.

**Dependencias:** T3.

**Archivos:** `backend/src/routes/documents.ts` (nuevo), `backend/src/services/documentService.ts`
(nuevo), `backend/src/repositories/documentRepository.ts` (nuevo), `backend/src/server.ts`
(wiring + CORS de `/documents`, mismo criterio que `/auth` — acotado a `FRONTEND_ORIGIN`),
`backend/package.json` (dependencia `multer` + `@types/multer`),
`backend/tests/documents.test.ts` (nuevo).

**Alcance:** M.

---

### ✅ Checkpoint: backend↔ledger real
- [x] `POST /documents` de punta a punta contra la red real, con y sin fallas forzadas
  (PDF inválido, sin archivo, rol no autorizado — todas verificadas en vivo).
- [x] Revisado por `code-reviewer` (foco: D13 — confirmado que ninguna escritura parcial
  es silenciosa; validación de archivo por firma real, no por `Content-Type`; el PDF en sí
  nunca se loguea, solo su hash/metadata).

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
