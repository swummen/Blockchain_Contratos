# TODO — Sprint 3 · módulo `verification` · HU‑010…014

Plan: `claude_docs/tasks/plan-sprint3-verification.md` (**aprobado 2026‑10‑07**).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T6 completos. Sprint 3 (`verification`, HU‑010…014) cerrado — confirmado
por Sofia en navegador real. Listo para commit final.**
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
- [x] `frontend/src/lib/api.ts` gana `getDocument(token, documentId)` y
  `verifyDocument(token, documentId, file)`. De paso, factorizado `parseJsonResponse()`
  compartido (ya era el tercer/cuarto call site repitiendo el mismo parseo de error —
  hallazgo Optional que había quedado anotado en el review de T6 de Sprint 2).
- [x] `VerificarIntegridadPage` deja de usar `useAppData()` (el mock) por completo —
  **decisión de diseño no anticipada en el plan, tomada ahora**: como todavía no existe
  ningún listado de documentos (RF‑37…40, Sprint 4), el modo "Desde el sistema" (un
  `<Select>` poblado del mock) no tenía ningún equivalente real para conectar. Tampoco
  "Ingresar manualmente" (pegar un hash a mano) — el backend real siempre compara contra
  el hash *registrado* de un `documentId` conocido, nunca contra un hash arbitrario que
  el cliente proponga. Las dos pestañas se reemplazaron por un único flujo real: tipeás
  el identificador, "Buscar" (`GET /documents/:id`, confirma existencia + muestra la
  huella registrada — HU‑010/011), después cargás el PDF a comparar y "Comparar huellas"
  (`POST /documents/:id/verifications` — HU‑012/013/014). Error de búsqueda o de
  comparación se muestra en la UI existente.
- [x] El hallazgo del review de T3 (`name`/`responsibleUser`/`registeredAt` pueden venir
  `undefined`) ya está cubierto: la tarjeta del documento solo renderiza `name`/
  `registeredAt` si vienen presentes (`document.name &&`/`document.registeredAt &&`), sin
  asumir que siempre están.
- [x] `npm run build`/`npm run lint` pasan. El chequeo de "sin infraestructura directa"
  sigue sin encontrar nada.

**Verificación:**
- [x] Mecánico, sin navegador disponible en este entorno (mismo criterio que T6 de
  Sprint 2): se simuló contra el stack real la secuencia exacta que hace la página —
  login Empleado real → `POST /documents` con un PDF real → login Verificador real →
  `GET /documents/:id` (misma forma que `getDocument()` del frontend) → `200` con la
  huella real → `POST /documents/:id/verifications` con el mismo PDF (misma forma que
  `verifyDocument()`) → `200 {status:"Verificado", matches:true, ...}` con los dos
  hashes idénticos; un `documentId` inexistente → `404`. Se reconstruyó el contenedor
  `frontend` y se confirmó que sirve `200`. Sin regresión: `bash docker/smoke-test.sh` →
  `PASS`. **Pendiente de Sofia:** click-through real en el navegador.
- [x] Ronda de `code-reviewer` (verdict: **REQUEST CHANGES** → aplicado, 3 Required):
  1. La tarjeta de resultado mostraba `document?.registeredAt` (la fecha de **registro**
     original del documento) como si fuera la fecha de la **verificación** — bug real de
     copiar mal el patrón de `CargarDocumentoPage` (ahí sí correspondía mostrar la fecha
     de carga, acá no). Corregido: siempre `new Date().toISOString()`, mismo criterio que
     ya usa `CargarDocumentoPage` cuando el backend no devuelve timestamp. **Causa raíz
     real, no resuelta todavía (fuera de alcance de T5, anotada para un sprint futuro):**
     `verifyDocument` (T4, backend) descarta el `Event` real que devuelve
     `RecordVerification` (con su `Timestamp`/`TxID` determinista del ledger) — ninguna
     capa tiene hoy el momento real de la verificación para mostrar, solo una
     aproximación del reloj del navegador. Si RNF‑05/HU‑014 necesitan ese dato como
     evidencia real, hay que hacer que `verifyDocument` capture y devuelva el `Event`.
  2. Condición de carrera real: el input del id solo se deshabilitaba con
     `disabled={!!document}`, no mientras la búsqueda estaba en curso (`lookupLoading`)
     — si el usuario cambiaba el id mientras la respuesta vieja todavía no volvía, podía
     terminar mostrando el documento del id viejo con el id nuevo ya escrito en el campo.
     Corregido: `disabled={!!document || lookupLoading}` (mismo criterio que ya usaba el
     botón "Buscar").
  3. El paso 1 no estaba envuelto en un `<form>`, rompiendo la convención del resto del
     proyecto (`LoginPage`, `UsuariosPage`): Enter no disparaba la búsqueda. Corregido con
     `<form onSubmit>` + botón `type="submit"`.
  Hallazgos Optional: `AppDataContext.verifyDocument` quedó sin ningún consumidor real en
  todo el frontend (confirmado por el reviewer con grep) — código muerto, pero no se
  tocó `AppDataContext` en esta tarea (fuera de alcance de T5; el resto del contexto —
  `documents`, `eventsForDocument`, etc. — sigue en uso real por otras pantallas
  mockeadas); queda anotado para una limpieza futura. Se agregó la nota de cambio
  pendiente en `SPEC.md` RF‑24 (la ficha detallada describe también un listado como
  alternativa — eso depende de RF‑37…40, Sprint 4; hasta entonces la selección es por
  identificador directo). Se borró el `onChange` muerto que limpiaba `document`/
  `lookupError` (inalcanzable: el input está deshabilitado exactamente cuando esas
  limpiezas importarían). Re-verificado tras los 3 fixes: build/lint limpios, contenedor
  `frontend` reconstruido, `bash docker/smoke-test.sh` → `PASS` de nuevo.

**Ampliación de alcance (pedida por Sofia al probar el flujo a mano, D8 del plan):**
mientras probaba manualmente se encontraron dos huecos reales de UX que bloqueaban la
prueba en sí, no solo "se vería mejor":
- `CargarDocumentoPage` (Sprint 2 T6) nunca mostraba el `documentId` generado — solo el
  hash y la fecha. Sin eso, el Empleado no tenía ninguna forma de pasarle el id al
  Verificador. Agregado: el id visible con un botón de copiar (`navigator.clipboard`).
- No había ninguna manera de ver qué documentos existen sin memorizar/transcribir un
  UUID de 36 caracteres a mano. Agregado `GET /documents` (backend, nuevo — lee de
  MongoDB, nunca del chaincode, D6 intacto): devuelve `{documentId, name,
  responsibleUser, registeredAt, status}` de los últimos 100 documentos, **nunca el
  hash**. `VerificarIntegridadPage` lo usa para poblar un `<Select>` como alternativa a
  escribir el id — elegirlo de la lista dispara la misma consulta real (`GetDocument`)
  que ya hacía la búsqueda manual, la lista nunca es la fuente de la verdad. Deliberadamente
  mínimo (sin paginación/filtros/buscador) para no adelantar todo RF‑37…40 de Sprint 4.
- Tests nuevos: 3 casos de `GET /documents` (resumen sin hash, lista vacía, sin JWT) — 81/81
  tests del backend en verde. Verificado en vivo: el listado real devuelve los documentos
  ya registrados en esta misma sesión de pruebas, ordenados por más reciente.
- Nota de cambio actualizada en `SPEC.md` RF‑24 (ya no dice "sin listado hasta Sprint 4" —
  ahora hay uno mínimo; RF‑37…40 sigue siendo el alcance completo con filtros/búsqueda).
- [x] Ronda de `code-reviewer` para esta ampliación (verdict: **REQUEST CHANGES** →
  aplicado, 2 Required): encontró que `GET /documents` con `requireAuth()` sin roles
  dejaba que **cualquier Empleado** enumerara los documentos de **todos** los usuarios
  (incluido `responsibleUser`) — exactamente el escenario que la propia decisión D5b de
  este plan ya había marcado como "revisar si una consulta general permite enumerar
  documentos". Corregido a `requireAuth("Verificador", "Administrador")` (RF‑37 ya lo
  nombra como del Verificador; Administrador entra por el mismo criterio que el hash
  completo, RF‑27) — un Empleado hoy no lo necesita, y RF‑18 (Sprint 4) le va a dar su
  propio listado acotado a sus documentos, más angosto que esto. Agregado un test de
  `403` para Empleado y uno de `200` para Administrador. También encontró que el texto
  nuevo de `CargarDocumentoPage` decía "el listado llega en un sprint posterior" — falso
  en el momento de escribirlo, porque esta misma ampliación ya lo trae. Corregido el
  texto. Re-verificado tras los 2 fixes: 83/83 tests del backend, build/lint limpios en
  los dos lados, contenedores `backend`/`frontend` reconstruidos, confirmado en vivo que
  un Empleado real recibe `403` y un Verificador real sigue viendo el listado,
  `bash docker/smoke-test.sh` → `PASS`.

**Dependencias:** T4.

**Archivos:** `frontend/src/lib/api.ts` (`getDocument`, `verifyDocument`, `listDocuments`,
`parseJsonResponse` compartido), `frontend/src/pages/verificador/VerificarIntegridadPage.tsx`
(reescrita — ya no usa `AppDataContext`; `<Select>` de documentos agregado),
`frontend/src/pages/empleado/CargarDocumentoPage.tsx` (botón de copiar el `documentId`),
`backend/src/routes/documents.ts` (`GET /documents`),
`backend/src/services/documentService.ts` (`listDocuments`),
`backend/src/repositories/documentRepository.ts` (`listDocuments`),
`backend/tests/documents.test.ts`, `claude_docs/SPEC.md` (RF‑24).

**Segunda ronda de feedback de Sofia, probando ya en el navegador real:** confirmó que la
verificación funciona, pero señaló que la tarjeta de resultado no dejaba "defender" el
resultado — solo mostraba los dos hashes, sin decir qué documento registrado ni qué
archivo subido se compararon. Agregado un bloque de evidencia (nombre del documento
registrado + nombre del archivo cargado) arriba de los hashes en el resultado — cierra
mejor RF‑33 ("mostrar la huella original y la obtenida como evidencia del resultado": la
evidencia ahora tiene contexto, no son solo hashes crudos). Build/lint limpios,
contenedor `frontend` reconstruido, `bash docker/smoke-test.sh` → `PASS`. Cambio chico de
solo-UI (datos que ya estaban en el estado del componente, sin tocar ningún endpoint) —
no se lanzó una ronda completa de `code-reviewer` para esto.

También aclarado para Sofia (sin cambio de código, pregunta conceptual): el Verificador
no "tiene los contratos definitivos" — nunca se guarda el PDF en ningún lado (RNF‑04), el
Verificador sube cualquier copia que tenga a mano para chequear si esa copia puntual
sigue siendo idéntica a la huella anclada originalmente, mismo principio que un checksum.

**Alcance:** M (original) + ampliación chica pedida en el camino + ajuste de evidencia.

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
- [x] `chaincode/README.md`: agregadas `GetDocument`/`RecordVerification` a la sección de
  qué hace el contrato, tabla de modelo de datos actualizada (`Status` ya cambia,
  `Action` ya tiene los dos valores), conteo de tests actualizado (24), "Qué no hace
  todavía" corregido (ya cambia `Status`; sigue sin listar nada — eso es MongoDB vía el
  backend, no el chaincode).
- [x] `backend/README.md`: sección `verification` nueva con la tabla de los 3 endpoints
  (`GET /documents`, `GET /documents/:id`, `POST /documents/:id/verifications`), mismo
  formato que `documents`/`identity`; explica `queryLedgerDocument` compartido, por qué
  nunca hay éxito a medias, y los 2 huecos conocidos que dejó el review de T4/T5 (el
  `Event` real descartado, el reintento tras un crash). Intro y Referencias del archivo
  actualizadas para mencionar Sprint 3.
- [x] `claude_docs/SPEC.md`: párrafo de "Estado de implementación" (§3) con RF‑23…36 y
  RNF‑05, 08, 23, 24, 27 marcados como implementados y verificados. **Corrección respecto
  al AC original** — RNF‑10 y RNF‑14 (los dos benchmarks formales: P95≤3000ms/50
  peticiones, 100% de detección sobre 20 documentos de validación) NO se marcaron como
  implementados — son benchmarks reales que nunca se corrieron, solo se verificó
  funcionalmente que la comparación de hashes detecta alteraciones. RNF‑09/RNF‑11
  (marcadas parciales en Sprint 2) ahora sí quedan completas — Sprint 3 agregó la
  consulta y la comparación que les faltaban. Aclarado que RF‑37…40 (consulta general
  del Verificador) siguen sin su alcance completo, más allá del listado mínimo de D8.

**Verificación:**
- [x] Manual: `docker/down.sh` + `docker/up.sh` desde cero (red Fabric + chaincode real,
  versión 1.0 fresca con `GetDocument`/`RecordVerification` ya incluidas desde el primer
  deploy) + `npm run seed` + smoke test completo de HU‑010…014 por `curl`: login Empleado
  → `POST /documents` real → login Verificador → `GET /documents` (listado real, 1
  documento) → `GET /documents/:id` (huella completa) → verificar con el mismo PDF →
  `Verificado` (hashes idénticos) → verificar con un PDF distinto → `Alterado` (hashes
  distintos) → id inexistente → `404` → Empleado intentando listar/verificar → `403` en
  los dos casos. `bash docker/smoke-test.sh` (HU‑021, Sprint 0) → `PASS`. Sin regresión.
- [x] Build/test/lint de los tres: chaincode (`go build`/`vet`/`test`, 24/24, `gofmt`
  limpio), backend (`npm run build`/`test` 83/83/`lint`, 0 errores), frontend (`npm run
  build`/`lint`, 0 errores, mismos 4 warnings preexistentes de siempre).

**Dependencias:** T1‑T5.

**Archivos:** `chaincode/README.md`, `backend/README.md`, `claude_docs/SPEC.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑010…014 terminadas (DoD — SPEC §10.2)
- [x] Los 10 escenarios Gherkin de HU‑010…014 (CA‑01/CA‑02, HU‑014 con CA‑01/CA‑02
  además del "Nueva verificación") en PASS — confirmados a mano por Sofia en el
  navegador real (login Verificador → buscar/elegir documento → comparar con el mismo
  PDF → confirmado; comparar con uno distinto → comprometido, evidencia con nombres de
  archivo visible) y mecánicamente contra el stack real en T3‑T6.
- [x] RF‑23…36 y RNF‑05, 08, 23, 24, 27 marcados como implementados (RNF‑10/14 quedan
  explícitamente parciales — son benchmarks formales nunca corridos, no una omisión).
- [x] Entorno verificado en Docker Compose (ciclo completo desde cero, smoke test PASS).
- [ ] Commit(s) de cierre con mensaje redactado (sin commit automático) — pendiente.
- [ ] Aceptación de dirección/codirección registrada.
