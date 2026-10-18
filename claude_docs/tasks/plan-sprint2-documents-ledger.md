# Plan de implementación: Sprint 2, módulos `documents` + `ledger` (HU‑005…007)

> Fuente de verdad: `claude_docs/SPEC.md` (mapa de capacidades §3, modelo de dominio §4.1,
> ejemplo de `RegisterDocument` §7, RF‑08…22 §13, RNF relevantes §14, HU‑005…007 §15,
> Gherkin §16).
> Plan propuesto **2026‑09‑20**. Sprint 0 (`infra`) y Sprint 1 (`identity`) ya cerrados y
> mergeados a `main`.

## Resumen

Reemplazar el chaincode de ejemplo (`asset-transfer-basic`, placeholder de Sprint 0) por
el chaincode real del proyecto (un contrato Go que ancla en Hyperledger Fabric la huella
SHA‑256 de un documento contractual y sus eventos de trazabilidad, sin nunca recibir el
PDF) y el primer endpoint de negocio real del backend: `POST /documents`, que valida un
PDF (formato, tamaño, carga individual), calcula su huella, lo registra en el chaincode y
guarda los metadatos en Mongo.

**Alcance exacto** (igual que con `identity` en Sprint 1, la capacidad completa del módulo
en el mapa de §3 es más ancha que lo que este sprint construye): el mapa de capacidades
describe `documents` como "carga... **y consulta de "mis documentos" y estado**", pero la
tabla de sprints (§3) asigna esa consulta a **HU‑008/009 en Sprint 4**, no acá. Sprint 2
es HU‑005, HU‑006, HU‑007 (carga, huella, registro en blockchain) nada de consultas.

## Decisiones de arquitectura

| # | Decisión | Razón |
|---|---|---|
| D1 | El contrato Go se llama `ContractsContract` (paquete `contract`), con `RegisterDocument(ctx, documentID, sha256Hex, user) (*Event, error)`: **exactamente la firma que ya da `claude_docs/SPEC.md` §7 como ejemplo** (líneas 267‑288), no una inventada. | Fuente de verdad ya fijó el contrato; implementarlo tal cual evita divergencia entre el SPEC y el código (justo lo que las normas del proyecto piden). |
| D2 | Layout: `chaincode/go.mod` + `chaincode/main.go` (entrypoint) + `chaincode/contract/smartcontract.go` (+ `_test.go` + `mocks/`). Sin subcarpeta `chaincode-go/` como en `fabric-samples`: acá `chaincode/` ya es la raíz del módulo Go (lo fija `SPEC.md` §6). | Un nivel de anidamiento menos que el ejemplo de `fabric-samples`; nombres sin "stutter" (`chaincode/chaincode/` habría sido confuso). |
| D3 | Dependencias del `go.mod` fijadas a las mismas versiones que ya usa `docker/fabric-samples/asset-transfer-basic/chaincode-go/go.mod` (`fabric-contract-api-go/v2 v2.2.0`, `fabric-chaincode-go/v2 v2.0.0`, `fabric-protos-go-apiv2 v0.3.4`, Go 1.25). | Es la única combinación de versiones ya probada contra la Fabric 2.5.16 de este proyecto (Sprint 0); no hay razón para arriesgar otra. |
| D4 | Testing del chaincode: se **copian** los 3 mocks generados por `counterfeiter` que ya vienen en `asset-transfer-basic/chaincode-go/chaincode/mocks/` (`ChaincodeStub`, `TransactionContext`, `StateQueryIterator`, son genéricos, mockean las interfaces del SDK, no el asset de ejemplo) en vez de instalar `counterfeiter` y regenerarlos. | Son código genérico ya escrito y probado; regenerarlos no cambiaría una línea. Ladder rung 2 ("¿ya existe en el codebase?"). |
| D5 | Los eventos de trazabilidad (`Event{DocumentID, Action, User, TxID, Timestamp, Result}`) se guardan con **clave compuesta** (`ctx.GetStub().CreateCompositeKey("event", []string{documentID, txID})`), un `PutState` por evento: nunca se sobreescriben. El documento en sí (`{DocumentID, Sha256Hex, Status}`) se guarda aparte con `PutState(documentID, ...)`. | Decisión D3 de Sprint 0 (`claude_docs/tasks/plan.md:25`) ya fijó LevelDB (no CouchDB) y "rangos de clave compuesta" como la técnica de trazabilidad, esto es implementarla. Permite en Sprint 3/4 recuperar *todos* los eventos de un documento con `GetStateByPartialCompositeKey("event", []string{documentID})`, sin rich queries. |
| D6 | `RegisterDocument` es la única función que Sprint 2 expone públicamente. No se agrega todavía ninguna consulta (`GetDocument`, historial): `documentExists` queda como helper interno, no una función de contrato. | HU‑008/009 (consultas) son Sprint 4; agregarlas ahora sería construir para un requisito que todavía no está planeado (YAGNI). |
| D6b | El chaincode **no** valida identidad/MSPID de quien invoca (`ctx.GetClientIdentity()`): cualquier identidad admitida por la política de endorsement del canal puede llamar `RegisterDocument`. Deliberado, no un olvido: el backend ya exige JWT+OTP+RBAC (Sprint 1) antes de tocar Fabric, y la política de endorsement del canal es el límite de autorización a nivel de red. Revisar si hace falta un chequeo de identidad *dentro* del chaincode si en un sprint futuro distintas identidades de Fabric llegan a representar roles distintos on-chain (hoy no es el caso: el backend siempre invoca con la misma identidad Admin de Org1). | Hallazgo del `code-reviewer` de T1: evita que quede como una omisión implícita sin documentar. |
| D7 | Nombre del chaincode desplegado: **`contracts`** (reemplaza a `basic`). Canal: se mantiene `contratoschannel` (ya existe, sin motivo para cambiarlo). Topología (2 organizaciones, política de endorsement `OR('Org1MSP.peer','Org2MSP.peer')`, ciclo de vida gestionado por el peer: no *chaincode‑as‑a‑service*): **sin cambios**, ya decidido en Sprint 0 (D1/D2 de `claude_docs/tasks/plan.md`). Las preguntas abiertas #1 y #4 de ese plan quedan resueltas por esto: se reutiliza lo que ya funciona, no hay motivo técnico para tocarlo en un MVP de tesis. | Evita repetir una decisión ya tomada y ya probada en producción de facto (Sprint 0 P8). |
| D8 | `backend/src/fabric/gateway.ts` gana `submitTransaction(fcn, ...args)` (invoke real, endosado y ordenado) junto al `queryChaincode()` que ya existe: misma conexión, mismo `contract`, sin nada nuevo que cablear (ya lo anticipaba `backend/README.md`). | Es la pieza que faltaba para poder escribir al ledger; T5 de Sprint 1 ya dejó todo lo demás listo. |
| D9 | El PDF nunca se guarda en disco: `multer.memoryStorage()` (nueva dependencia, es *la* librería estándar de Express para `multipart/form-data`, nada la reemplaza con "unas pocas líneas") lo mantiene en memoria el tiempo justo para validarlo y hashearlo; se descarta apenas termina la request. | RNF‑04 ya prohíbe guardarlo en Mongo/blockchain; no persistirlo ni transitoriamente en disco es la interpretación más estricta y la más simple (sin necesidad de limpiar archivos temporales). |
| D10 | Validación de formato PDF por **firma de archivo** (`%PDF-` al inicio del buffer), no solo por el `Content-Type` que manda el cliente. Tamaño con el `limits.fileSize` de `multer` (20 MB, RF‑11/RNF‑24). Un solo archivo por request (`upload.single(...)`, RF‑10). | El `Content-Type` lo controla quien sube el archivo: confiar solo en eso deja pasar cualquier archivo renombrado a `.pdf`. Barato de chequear (los primeros 5 bytes), cierra un hueco real de RNF‑23. |
| D11 | `documentId` se genera con `crypto.randomUUID()` (mismo patrón que el `jti` de sesión en Sprint 1), no un contador tipo `"D001"`. | Sin coordinación de secuencia, sin colisiones: es la clave primaria tanto en Mongo como en el chaincode. |
| D12 | `POST /documents` requiere `requireAuth("Empleado")`: **primer uso real** de la variante con lista de roles del middleware de Sprint 1 (hasta ahora ningún endpoint de `identity` la necesitó). | RF‑08: "El Empleado carga documentos...", ningún otro rol registra documentos. |
| D13 | Si `submitTransaction` falla (Fabric no disponible, endoso rechazado), la request completa falla (RF‑16/HU‑007‑CA‑02: "no muestra un mensaje de éxito al Empleado"), el documento **no** se guarda en Mongo tampoco, para no dejar un registro sin respaldo en el ledger (consistencia Mongo↔ledger, RNF‑13). | Falla el request entero si cualquiera de las dos escrituras falla; no hay escritura parcial silenciosa. |

## Grafo de dependencias

```
T1 (chaincode: contrato + tests unitarios, sin red)
 └── T2 (deploy del chaincode real a la red de Sprint 0)
       └── T3 (backend: submitTransaction + wiring mínimo de prueba)
             └── T4 (POST /documents: validación + hash + registro real)
                   ├── T5 (docker/up.sh usa el chaincode real, retira el de ejemplo)
                   └── T6 (frontend: CargarDocumentoPage real)
T1..T6 ──> T7 (documentación + trazabilidad SPEC)
```

Orden de construcción: **T1 → T2 → (checkpoint: chaincode operativo) → T3 → T4 →
(checkpoint: backend↔ledger real) → T5 → T6 → (checkpoint: HU‑005…007 de punta a punta) →
T7 → (checkpoint DoD)**.

## Rebanado vertical

- **T1** el contrato compila y sus tests unitarios pasan sin necesitar la red arriba
  (`go build ./...`, `go test ./...`, `go vet ./...`).
- **T2** una transacción real (`peer chaincode invoke`) registra un documento de prueba y
  una query recupera su huella: el chaincode funciona en la red real, no solo en tests.
- **T3** el backend invoca `RegisterDocument` de verdad a través del Gateway (mismo
  riesgo que T5 de Sprint 1, pero para escritura en vez de lectura).
- **T4** un PDF real sube, se valida, se hashea, se registra en el ledger y en Mongo: el
  flujo de negocio completo de HU‑005…007 funciona de punta a punta por `curl`.
- **T5** `docker/up.sh` despliega el chaincode real desde un checkout limpio.
- **T6** el Empleado puede cargar un documento real desde el navegador.
- **T7** trazabilidad y documentación al día.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Escribir chaincode Go es terreno nuevo en este repo (a diferencia de TS en `backend/`, `frontend/`). | Alto | D1‑D4: seguir el ejemplo ya dado en `SPEC.md` casi literal, y las convenciones ya probadas de `asset-transfer-basic` (mismo `go.mod`, mismos mocks), no inventar un estilo nuevo. |
| `submitTransaction` (escritura real, con endoso + orderer) es más complejo que el `evaluateTransaction` de solo lectura que ya probó T5 de Sprint 1: nuevos modos de falla (endoso rechazado, timeout del orderer). | Medio‑Alto | T3 lo prueba aislado (una invocación mínima) antes de que T4 dependa de él; se replica el mismo patrón de manejo de errores ya usado en `queryChaincode` (mensaje claro, no 500 crudo). |
| `network.sh deployCC` puede necesitar `go mod vendor` para empaquetar un módulo Go con dependencias no vendorizadas (a diferencia de `asset-transfer-basic`, que sí trae `vendor/`). | Medio | Verificarlo en vivo en T2; si hace falta, `go mod vendor` es un paso más en el script de deploy, ya se ejecutó como prerequisito documentado desde `docker/README.md` (T7 de Sprint 0). |
| Multipart file upload (`multer`) es una dependencia nueva en `backend/`. | Bajo | Es la librería estándar de Express para esto (mantenida por el equipo de Express); memoria únicamente, límite de tamaño explícito: no hay superficie nueva de la que preocuparse más allá de eso. |
| El Decreto/CA‑02 de HU‑007 (falla de blockchain no debe mostrar éxito) es fácil de romper por accidente si se guarda en Mongo antes de confirmar el `txID`. | Medio | D13 explícito + test dedicado: `submitTransaction` falla → ni Mongo ni una respuesta de éxito. |

## Lista de tareas

Ver `claude_docs/tasks/todo-sprint2-documents-ledger.md`. Índice:

| # | Título | Alcance | Depende de | RF/RNF |
|---|---|---|---|---|
| T1 | Chaincode: contrato `RegisterDocument` + tests unitarios | M | N/A | RF‑14, 16 |
| T2 | Deploy del chaincode real a la red | M | T1 | RF‑16 |
| N/A | **Checkpoint: chaincode operativo** | | | |
| T3 | Backend: `submitTransaction` en el Gateway + prueba mínima | M | T2 | RF‑16 |
| T4 | Backend: `POST /documents` (validación + hash + registro) | M | T3 | RF‑08…17 |
| N/A | **Checkpoint: backend↔ledger real** | | | |
| T5 | `docker/up.sh` usa el chaincode real | S | T4 | N/A |
| T6 | Frontend: `CargarDocumentoPage` real | M | T4 | HU‑005 |
| N/A | **Checkpoint: HU‑005…007 de punta a punta** | | | |
| T7 | Documentación y trazabilidad SPEC | S | T1‑T6 | N/A |
| N/A | **Checkpoint: HU‑005…007 terminadas (DoD)** | | | |

## Definición de Terminado (HU‑005…007): SPEC §10.2

1. Revisión por pares + merge a `main` (PR aprobado).
2. Casos del PPS de HU‑005…007 (6 escenarios Gherkin CA‑01/CA‑02) en PASS.
3. SRS/trazabilidad: marcar RF‑08…17 y RNF‑04, 05, 09, 11, 13, 23, 24 como implementados.
4. Desplegado y verificado en entorno de prueba (Docker Compose, `docker/up.sh`).
5. Aceptación registrada por dirección/codirección del proyecto.
