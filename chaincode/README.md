# chaincode/

Chaincode real del proyecto (`contracts`), Go + `fabric-contract-api-go/v2`. Es la lógica
on-chain de `claude_docs/SPEC.md` (módulo `ledger`): ancla la huella SHA‑256 de un
documento y sus eventos de trazabilidad en Hyperledger Fabric. **Nunca recibe ni guarda el
PDF** (RNF‑04): solo la huella que el backend ya calculó off-chain.

## Qué hace (`contract/smartcontract.go`)

- `ContractsContract`: el contrato (`contractapi.Contract`), 5 funciones de negocio:
  `RegisterDocument`, `GetDocument`, `RecordVerification` (Sprints 2‑3) y
  `GetDocumentEvents`, `GetAllEvents` (Sprint 4, lectura de trazabilidad, ver
  "Modelo de datos" abajo).
- `RegisterDocument(ctx, documentID, sha256Hex, user) (*Event, error)`: valida que
  `documentID`/`user` no estén vacíos y que `sha256Hex` tenga formato hex de 64
  caracteres (SHA‑256); rechaza un `documentID` ya registrado; usa
  `ctx.GetStub().GetTxTimestamp()` para el timestamp (nunca `time.Now()`, todo peer
  endosante tiene que llegar al mismo resultado determinista para la misma transacción);
  devuelve el `Event` con el `TxID` real de Fabric (RF‑16).
- `GetDocument(ctx, documentID) (*Document, error)` (Sprint 3, T1): primera función de
  **lectura** (`evaluateTransaction`): devuelve el `Document` ya anclado, o error si
  `documentID` nunca se registró. La usa el backend para confirmar existencia (RF‑25) y
  consultar la huella registrada (RF‑26).
- `RecordVerification(ctx, documentID, result, user) (*Event, error)` (Sprint 3, T1):
  valida `result` ∈ `{"confirmada","comprometida"}` (el backend ya hizo la comparación de
  hashes, este contrato nunca recibe ni compara los dos hashes, ni el PDF, RNF‑04);
  falla si el documento no existe; actualiza `Document.Status` a `"Verificado"`/
  `"Alterado"` según corresponda (RF‑34, nunca otro camino lo cambia) y escribe un nuevo
  `Event{Action:"verificacion", Result, ...}` sin tocar el evento de `"registro"`
  original. Permite re-verificar el mismo documento sin restricción (HU‑014‑CA‑02,
  "Nueva verificación"): cada verificación es un evento más, no un reemplazo.
- No valida identidad/MSPID dentro del chaincode: es deliberado: el backend ya gatekeepea
  con JWT + OTP + RBAC antes de llamar a Fabric (decisión D6b,
  `claude_docs/tasks/plan-sprint2-documents-ledger.md`).
- No tiene ninguna función que **liste documentos**: el listado (`GET /documents` del
  backend) lee de MongoDB, nunca del chaincode, ver `backend/README.md`. Los **eventos**
  sí se leen del ledger (`GetDocumentEvents`/`GetAllEvents`, Sprint 4).
  `backend/src/routes/fabric.ts` usa la query de sistema
  `org.hyperledger.fabric:GetMetadata` (la expone cualquier chaincode de `contractapi`
  automáticamente) para su diagnóstico, no una función de este contrato.

### Modelo de datos (world state)

| Tipo | Clave | Campos | Notas |
|---|---|---|---|
| `Document` | `documentID` | `DocumentID`, `Sha256Hex`, `Status` | Un registro por documento. `Status` empieza en `"Pendiente"` al registrarse y pasa a `"Verificado"`/`"Alterado"` solo vía `RecordVerification` (Sprint 3): ningún otro camino lo cambia. |
| `Event` | clave compuesta `CreateCompositeKey("event", [documentID, TxID])` | `Action`, `DocumentID`, `Result` (opcional), `Timestamp`, `TxID`, `User` | Nunca se sobreescribe: cada acción es un evento nuevo. `Action` ∈ `"registro"` \| `"verificacion"` (Sprint 3); `Result` solo viene poblado en los eventos de `"verificacion"`. |

`GetDocumentEvents(ctx, documentID)` (Sprint 4, T1) recupera el historial completo de
**un** documento vía `GetStateByPartialCompositeKey("event", [documentID])`.
`GetAllEvents(ctx)` recupera el de **todos** los documentos con la misma clave
compuesta pero sin ningún atributo (`GetStateByPartialCompositeKey("event", [])`: 
exactamente `[]string{}`, no `[""]`: un string vacío *dentro* del slice busca
`documentID == ""`, que nunca existe, no "todos"). Ninguna de las dos garantiza orden
cronológico: la clave agrupa por `(documentID, TxID)`, no por `Timestamp` entre
documentos distintos; el orden cronológico que pide el Gherkin de HU‑016 lo resuelve el
backend, ordenando después de traer los eventos (D2 del plan de Sprint 4). Tampoco
verifican que el documento exista: esa validación la hace el backend con `GetDocument`
antes de llamar a esto (un `documentID` con un typo da una lista vacía, no un error; es
intencional, no un descuido: ver D1 del plan de Sprint 4).

`Event.Result` lleva `metadata:",optional"` (no alcanza con `json:",omitempty"`):
`contractapi` genera el JSON Schema de la respuesta por reflection y marca todo campo
exportado como obligatorio salvo que lleve esa etiqueta, sin ella, cualquier
`RegisterDocument` real fallaba con `"value did not match schema: Result is required"`,
porque en un registro normal todavía no hay resultado de verificación.

## Comandos (ejecutar dentro de `chaincode/`)

| Comando | Qué hace |
|---|---|
| `go build ./...` | compila el módulo |
| `go vet ./...` | análisis estático |
| `go test ./...` | tests unitarios (mocks `counterfeiter` en `contract/mocks/`, sin red) |
| `go test -run <TestName> ./...` | un test único |
| `gofmt -l .` | lista archivos mal formateados (debería no imprimir nada) |

Dependencias fijadas a las mismas versiones que
`docker/fabric-samples/asset-transfer-basic/chaincode-go/go.mod`
(`fabric-contract-api-go/v2 v2.2.0`, `fabric-chaincode-go/v2 v2.0.0`,
`fabric-protos-go-apiv2 v0.3.4`).

## Desplegarlo

`bash docker/deploy-cc.sh` (requiere la red Fabric arriba, `docker/network-up.sh`):
empaqueta (corre `go mod vendor` internamente, por eso `chaincode/vendor/` nunca se
versiona, `.gitignore`), instala, aprueba y comete `contracts` en `contratoschannel`, y
termina con una prueba real de extremo a extremo (`RegisterDocument` exitoso + un segundo
intento con el mismo `documentID` rechazado). Ya integrado en `bash docker/up.sh`
(orquestación de todo el stack). Detalle completo, puertos y los bugs de Windows/Git Bash
ya corregidos: `docker/README.md`.

## Tests unitarios (`contract/smartcontract_test.go`)

34 tests, mocks `counterfeiter` copiados de `asset-transfer-basic` (`ChaincodeStub`,
`TransactionContext`, `StateQueryIterator`): sin red, sin Docker.
- `RegisterDocument`: registro exitoso (confirma las dos escrituras de `PutState` y la
  clave compuesta del evento), documento ya existente, hash con formato inválido,
  `documentID`/`user` vacíos, y fallos inyectados de `GetState`, `PutState` (documento y
  evento, por separado), `GetTxTimestamp` y `CreateCompositeKey`.
- `GetDocument`: éxito, documento no encontrado, `documentID` vacío, fallo de `GetState`,
  fallo de unmarshal.
- `RecordVerification`: éxito con `"confirmada"` (confirma `Status→"Verificado"`) y con
  `"comprometida"` (`Status→"Alterado"`), documento no encontrado, `result` inválido (sin
  siquiera leer el estado), `documentID`/`user` vacíos, y los mismos 5 fallos inyectados
  que ya cubre `RegisterDocument`.
- `GetDocumentEvents`/`GetAllEvents` (Sprint 4): éxito con 2 y con 0 eventos, eventos de
  2 documentos distintos (confirma la clave parcial vacía `[]string{}`), `documentID`
  vacío, fallo de la query, fallo de `iterator.Next()` a mitad de camino (el iterador se
  cierra igual, nunca se devuelve una lista parcial) y fallo de unmarshal.

## Qué no hace

Ninguna función que **liste documentos** (distinto de sus eventos): el listado vive en
MongoDB, vía el backend (D8 del plan de Sprint 3; ver `backend/README.md`).
