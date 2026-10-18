# Plan de implementación: Sprint 3, módulo `verification` (HU‑010…014)

> Fuente de verdad: `claude_docs/SPEC.md` (mapa de capacidades §3, modelo de dominio §4.1,
> RF‑23…40 §13, RNF relevantes §14, HU‑010…014 §15, Gherkin §16).
> Plan propuesto **2026‑10‑07**. Sprint 0‑2 ya cerrados y mergeados a `main`
> (`feat/blockchain` puesto al día con `main` por fast-forward antes de arrancar este plan).

## Resumen

El Verificador selecciona un documento ya registrado, consulta su huella SHA‑256 (con
control de visibilidad: el hash completo solo lo ve Verificador/Administrador, RF‑27),
carga el PDF a comparar, el sistema recalcula su huella y la compara contra la registrada,
determina el resultado (coincide → `Verificado`; difiere → `Alterado`, nunca manual: 
RF‑34) y registra el evento de verificación en el ledger con su `txID`.

**Alcance exacto** (igual criterio que Sprint 2 con `documents`): el mapa de capacidades
de §3 describe `verification` con un alcance más ancho que las HU de este sprint, 
"consultas generales" (RF‑37…40, consulta de documentos registrados / trazabilidad
general del Verificador) **no** está en HU‑010…014, queda para Sprint 4 junto con
`administration` (mismo patrón que RF‑18…22 quedó fuera de Sprint 2). Este sprint es
exactamente HU‑010 a HU‑014: seleccionar **un** documento ya elegido/conocido, verificarlo,
ver el resultado.

## Decisiones de arquitectura

| # | Decisión | Razón |
|---|---|---|
| D1 | El chaincode gana su primera función de **lectura**: `GetDocument(ctx, documentID) (*Document, error)`, `evaluateTransaction`, devuelve el `Document{DocumentID, Sha256Hex, Status}` ya guardado por `RegisterDocument`, o error si no existe. | Es lo que HU‑010 (existencia) y HU‑011 (huella registrada) necesitan; no existía ninguna consulta todavía (D6 de Sprint 2 lo dejó pendiente a propósito). |
| D2 | Nueva función de **escritura**: `RecordVerification(ctx, documentID, result, user) (*Event, error)`, valida que `documentID` exista (si no, error: no se puede verificar algo no registrado) y que `result` ∈ `{"confirmada","comprometida"}` (mismos valores que ya declaraba `Event.Result` desde Sprint 2); actualiza `Document.Status` a `"Verificado"`/`"Alterado"` según corresponda (RF‑34, nunca otro camino lo cambia) y escribe un nuevo `Event{Action:"verificacion", Result, ...}` en su propia clave compuesta (nunca sobreescribe el evento de registro). | HU‑013/014: el resultado de la comparación tiene que quedar anclado con su propio `txID`, igual que el registro original, mismo patrón de trazabilidad (D5 de Sprint 2), no uno nuevo. |
| D3 | **La comparación de hashes (SHA‑256 recibido vs. registrado) ocurre en el backend, no en el chaincode.** El chaincode nunca recibe el PDF (ya establecido, RNF‑04) y comparar dos strings no necesita ejecutarse on-chain: el backend calcula el hash del archivo cargado, pide `GetDocument` para el hash registrado, compara, y le pasa a `RecordVerification` el resultado ya determinado. | Mismo criterio que Sprint 2: el chaincode ancla hechos y resultados, no recalcula lo que el backend ya puede hacer determinísticamente del lado de Node. Evita over-engineering (ninguna razón para mover lógica trivial on-chain). |
| D4 | Refactor interno en `smartcontract.go`: `putEvent(ctx, doc Document, evt Event) error` deja de construir el `Document` con `Status` hardcoded a `"Pendiente"`, ahora recibe el `Document` ya armado por quien llama. `RegisterDocument` sigue armando `Document{..., Status:"Pendiente"}`; `RecordVerification` arma `Document{..., Status: nuevoEstado}` a partir del que ya leyó con `GetDocument`. | Evita duplicar las dos escrituras (`PutState` del documento + `PutState` del evento) en dos funciones: la rama que cambia (qué `Status` lleva el documento) es justo el parámetro nuevo. Fix en el lugar que atraviesan ambos *callers*, no un copy-paste. |
| D5 | `GET /documents/:id` (backend, nuevo): consulta la huella registrada vía `queryChaincode`/`GetDocument`, **primer uso real de `evaluateTransaction` para datos de negocio** (hasta ahora solo lo usaba el diagnóstico de `/fabric/ping`). Responde el hash **enmascarado** si el rol no es Verificador/Administrador (RF‑27/RNF‑08: mismo criterio que ya tiene `HashDisplay`/`maskHash` en frontend, ahora también server-side: no alcanza con ocultarlo solo en la UI). `404` si no existe (HU‑010‑CA‑02). | RF‑25/26: "consultar por identificador si está registrado" + "mostrar la huella registrada". El enmascarado server-side es nuevo: hasta Sprint 2 el único consumidor de hashes era el propio Empleado viendo su documento recién cargado (sin necesidad de ocultarlo, es el suyo). |
| D5b | `GET /documents/:id` expone `responsibleUser` (el `userId` de quien subió el documento) a **cualquier** rol autenticado, sin enmascarar, a diferencia de `hash`, no tiene ningún gate por rol. Deliberado, no un descuido: hallazgo del `code-reviewer` de T3. | RF‑49 (vista del Administrador) ya lista "usuario responsable" como dato normal, sin ninguna nota de "restricciones de privacidad" como sí tiene `hash` en el mismo RF: y `documentId` es un `crypto.randomUUID()` no adivinable, sin vector práctico de enumeración para que un rol "pesque" documentos ajenos al azar. Revisar si esto cambia si Sprint 4 agrega una consulta general que SÍ permita enumerar documentos (ahí la minimización de la Ley 1581/2012, ya citada en el SPEC para este RF, pesaría distinto). |
| D6 | `POST /documents/:id/verifications` (backend, nuevo): recibe el PDF a comparar (mismo patrón de validación que `POST /documents`, firma `%PDF-`, 20MB, un archivo), calcula su hash, llama `GetDocument` + compara, llama `RecordVerification` con el resultado, actualiza `status` en Mongo (mismo documento, mismo criterio ledger-primero-Mongo-después que D13 de Sprint 2, si el chaincode falla, nunca se actualiza Mongo ni se muestra éxito). Requiere `requireAuth("Verificador")`. Responde `{status, matches, registeredHash (enmascarado salvo rol), computedHash}`. | HU‑012/013/014 completas en un solo endpoint: igual que Sprint 2 no separó "calcular hash" de "registrar", acá no hay necesidad real de separar "comparar" de "registrar el resultado": son el mismo evento de negocio (RF‑030…036 describen un solo flujo, no dos). |
| D7 | `frontend/src/lib/api.ts` gana `getDocument(token, documentId)` y `verifyDocument(token, documentId, file)`; `VerificarIntegridadPage` deja de usar `useAppData().verifyDocument` (el mock) para la llamada real: mismo patrón que T6 de Sprint 2 con `CargarDocumentoPage`/`uploadDocument`. Las demás pantallas mockeadas (listados del Verificador/Administrador) siguen sin tocarse: esa consulta general es Sprint 4 (D del "Alcance exacto" arriba). | Consistencia con la decisión ya tomada en Sprint 2 T6 de conectar una pantalla a la vez, no todo `AppDataContext` de golpe. |
| D8 | **Ampliación de alcance pedida por Sofia durante la verificación manual de T5**, no prevista en D7: `GET /documents` nuevo (backend), lee directo de MongoDB (nunca del chaincode, no es su fuente de verdad, D6 sigue intacto) y devuelve `{documentId, name, responsibleUser, registeredAt, status}` de los últimos 100 documentos, **nunca el hash** (ni completo ni enmascarado, no hace falta para elegir cuál consultar). `VerificarIntegridadPage` lo usa para poblar un `<Select>` como alternativa a escribir el id a mano; elegir un documento de la lista dispara la misma consulta real (`GetDocument`, autoridad real de hash/status) que ya hacía la búsqueda manual: la lista nunca es la fuente de la verdad, solo el atajo para no escribir un UUID. También se agregó en `CargarDocumentoPage` (Sprint 2 T6) un botón para copiar el `documentId` recién generado, porque sin eso no había ninguna forma de que el Empleado se lo pasara al Verificador: un hueco real que la propia Sofia encontró al intentar probar el flujo manualmente. | Sin esto, probar el flujo de verificación de punta a punta en la práctica exigía memorizar o transcribir un UUID de 36 caracteres: una fricción real que Sofia señaló durante sus propias pruebas, no una mejora especulativa. Se mantiene deliberadamente mínimo (sin paginación, sin filtros, sin buscador) para no adelantar todo RF‑37…40 de Sprint 4. |

## Grafo de dependencias

```
T1 (chaincode: GetDocument + RecordVerification + tests unitarios, sin red)
 └── T2 (deploy del chaincode actualizado (upgrade de versión, prueba en vivo)
       └── T3 (backend: GET /documents/:id) consulta + enmascarado de hash)
             └── T4 (backend: POST /documents/:id/verifications, comparación + registro)
                   └── T5 (frontend: VerificarIntegridadPage real)
T1..T5 ──> T6 (documentación + trazabilidad SPEC)
```

Orden: **T1 → T2 → (checkpoint: chaincode operativo) → T3 → T4 →
(checkpoint: backend↔ledger real) → T5 → (checkpoint: HU‑010…014 de punta a punta) →
T6 → (checkpoint DoD)**.

## Rebanado vertical

- **T1** las dos funciones nuevas compilan y sus tests unitarios pasan sin red
  (`go build ./...`, `go test ./...`, `go vet ./...`).
- **T2** una invocación real recupera un documento existente y registra una verificación
  real con `txID`: funciona contra la red, no solo en tests.
- **T3** `curl` contra `/documents/:id` devuelve el hash enmascarado para un rol sin
  permiso y completo para Verificador/Administrador.
- **T4** el flujo completo de punta a punta por `curl`: cargar documento (ya existe desde
  Sprint 2) → verificarlo con un PDF idéntico → `Verificado`; con uno distinto →
  `Alterado`, ambos casos con evento real en el ledger.
- **T5** el Verificador puede hacerlo desde el navegador.
- **T6** trazabilidad y documentación al día.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Primera vez que el backend expone datos sensibles (`hash` completo) condicionados por rol: hasta ahora el enmascarado era solo cosmético en frontend (`HashDisplay`). | Medio | D5: el enmascarado se mueve al backend (server-side), el frontend sigue mostrando lo que reciba, no hay ningún camino donde el cliente reciba el hash completo y decida no mostrarlo. |
| `RecordVerification` actualiza un `Document` que ya existe (`PutState` sobre la misma clave): primera escritura de **actualización** del chaincode (Sprint 2 solo creaba, nunca modificaba). | Bajo‑Medio | D1/D2: `GetDocument` lee el estado actual antes de decidir, mismo criterio de "leer antes de escribir" que ya usa `documentExists` en `RegisterDocument`; sin concurrencia nueva que introducir (Fabric ya serializa escrituras por bloque). |
| Enmascarar el hash en el backend puede inconsistir con lo que el Empleado ya ve hoy sin enmascarar en la tarjeta de éxito de `POST /documents` (T6 de Sprint 2). | Bajo | Ese hash lo calcula y muestra el *propio* frontend tras una carga exitosa (nunca pasa por este nuevo endpoint de consulta): no hay superposición real; se deja anotado por si alguien lo nota raro en una demo. |

## Próximo paso

Empezar T1 (chaincode) ya mismo; el detalle tarea por tarea vive en
`claude_docs/tasks/todo-sprint3-verification.md`.
