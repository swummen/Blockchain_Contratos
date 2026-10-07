# chaincode/

Chaincode real del proyecto (`contracts`), Go + `fabric-contract-api-go/v2`. Es la lógica
on-chain de `claude_docs/SPEC.md` (módulo `ledger`): ancla la huella SHA‑256 de un
documento y sus eventos de trazabilidad en Hyperledger Fabric. **Nunca recibe ni guarda el
PDF** (RNF‑04) — solo la huella que el backend ya calculó off-chain.

## Qué hace (`contract/smartcontract.go`)

- `ContractsContract` — el contrato (`contractapi.Contract`), una sola función de negocio
  por ahora: `RegisterDocument(ctx, documentID, sha256Hex, user) (*Event, error)`.
- `RegisterDocument`: valida que `documentID`/`user` no estén vacíos y que `sha256Hex`
  tenga formato hex de 64 caracteres (SHA‑256); rechaza un `documentID` ya registrado;
  usa `ctx.GetStub().GetTxTimestamp()` para el timestamp (nunca `time.Now()` — todo peer
  endosante tiene que llegar al mismo resultado determinista para la misma transacción);
  devuelve el `Event` con el `TxID` real de Fabric (RF‑16).
- No valida identidad/MSPID dentro del chaincode — es deliberado: el backend ya gatekeepea
  con JWT + OTP + RBAC antes de llamar a Fabric (decisión D6b,
  `claude_docs/tasks/plan-sprint2-documents-ledger.md`).
- Sin ninguna función de **lectura** propia todavía (D6 del mismo plan: las consultas de
  trazabilidad/estado son Sprint 3/4). `backend/src/routes/fabric.ts` usa la query de
  sistema `org.hyperledger.fabric:GetMetadata` (la expone cualquier chaincode de
  `contractapi` automáticamente) para su diagnóstico, no una función de este contrato.

### Modelo de datos (world state)

| Tipo | Clave | Campos | Notas |
|---|---|---|---|
| `Document` | `documentID` | `DocumentID`, `Sha256Hex`, `Status` | Un registro por documento; `Status` siempre `"Pendiente"` al crearse — el chaincode no tiene todavía ninguna función que lo cambie (Sprint 3/4, módulo `verification`). |
| `Event` | clave compuesta `CreateCompositeKey("event", [documentID, TxID])` | `Action`, `DocumentID`, `Result` (opcional), `Timestamp`, `TxID`, `User` | Nunca se sobreescribe — cada acción es un evento nuevo, lo que permite reconstruir el historial completo con `GetStateByPartialCompositeKey("event", [documentID])` cuando exista esa consulta. `Action` hoy siempre `"registro"`; `"verificacion"` llega con el módulo `verification`. |

`Event.Result` lleva `metadata:",optional"` (no alcanza con `json:",omitempty"`):
`contractapi` genera el JSON Schema de la respuesta por reflection y marca todo campo
exportado como obligatorio salvo que lleve esa etiqueta — sin ella, cualquier
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
empaqueta (corre `go mod vendor` internamente — por eso `chaincode/vendor/` nunca se
versiona, `.gitignore`), instala, aprueba y comete `contracts` en `contratoschannel`, y
termina con una prueba real de extremo a extremo (`RegisterDocument` exitoso + un segundo
intento con el mismo `documentID` rechazado). Ya integrado en `bash docker/up.sh`
(orquestación de todo el stack). Detalle completo, puertos y los bugs de Windows/Git Bash
ya corregidos: `docker/README.md`.

## Tests unitarios (`contract/smartcontract_test.go`)

Mocks `counterfeiter` copiados de `asset-transfer-basic` (`ChaincodeStub`,
`TransactionContext`, `StateQueryIterator`) — sin red, sin Docker. Casos: registro
exitoso (confirma las dos escrituras de `PutState` y la clave compuesta del evento),
documento ya existente, hash con formato inválido, `documentID`/`user` vacíos, y fallos
inyectados de `GetState`, `PutState` (documento y evento, por separado),
`GetTxTimestamp` y `CreateCompositeKey`.

## Qué no hace todavía

Ninguna función de **lectura** (listar documentos, historial de eventos, estado) — es
Sprint 3/4 (módulos `verification`/`administration`, ver el mapa de capacidades de
`claude_docs/SPEC.md` §3). Tampoco ninguna función que cambie `Status` — llega con la
verificación de integridad.
