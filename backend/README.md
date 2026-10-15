# backend/

Gateway Node.js + Express hacia MongoDB y Hyperledger Fabric (ver `claude_docs/SPEC.md`
para el diseño completo — este archivo es un resumen práctico, no la fuente de verdad).

## Qué hay hoy

Sprint 0 (T4+T5) dejó el *walking skeleton* — Mongo y Fabric probados de punta a punta,
sin lógica de negocio. Sprint 1 (`identity`, T1-T7) agregó la primera lógica de negocio
real: login con OTP, sesión JWT, RBAC y cambio de contraseña. Sprint 2 (`documents` +
`ledger`, T1-T6) agregó la primera escritura real al ledger: el Empleado carga un PDF,
se valida, se registra su huella SHA‑256 en el chaincode real y se guarda en Mongo.
Sprint 3 (`verification`, T1-T6) agregó la primera función de **lectura** del chaincode
y la comparación real de huellas: el Verificador consulta un documento registrado, sube
un PDF a comparar, y el sistema determina y registra si la integridad está confirmada o
comprometida. Sprint 4 (`administration`, T1-T10) agregó las consultas: listado de
documentos acotado por rol, trazabilidad por documento y general (leída del ledger),
panel de totales y gestión de usuarios — ver las secciones "`identity`", "`documents`",
"`verification`" y "`administration`" más abajo para el contrato completo de cada una.

- Express + TypeScript, compilado con `tsc` (CommonJS, no ESM — evita fricción con Jest).
- `GET /health` — hace un `ping` real a Mongo en cada request (no un flag cacheado de
  "conectado"), responde `200 {status:"ok", mongo:"connected"}` o `503 {status:"error",
  mongo:"down"}`.
- `GET /fabric/ping` — consulta `org.hyperledger.fabric:GetMetadata` (query de sistema
  que expone cualquier chaincode de `contractapi` automáticamente, no una función de
  negocio) en el canal `contratoschannel` vía Fabric Gateway real (TLS, identidad desde
  archivo, sin `localhost`). Responde `200 {status:"ok", result:{...}}` o
  `503 {status:"error", message:"..."}` si Fabric no está disponible. Usá cualquiera de
  las dos rutas como plantilla para otros endpoints de estado.
- Estructura por capas (`claude_docs/SPEC.md` §7): `routes/ → controllers/ → services/ →
  repositories|fabric/`. `identity` (Sprint 1) ya usa `services/authService.ts` +
  `middlewares/auth.ts` + `repositories/{user,otp,session}Repository.ts`; `/health` y
  `/fabric/ping` (Sprint 0) siguen sin un service propio porque no tienen lógica que lo
  justifique. `controllers/` todavía no existe — las rutas de `identity` son lo bastante
  finas (validan forma del body, llaman al service, mapean el resultado a status HTTP) que
  no hizo falta esa capa intermedia; créenla si una ruta empieza a acumular lógica propia.
- Testing: **Jest** (no Vitest — así lo fija `SPEC.md` §8) + `supertest`. `src/server.ts`
  separa `createApp()` de `main()` (guardado con `if (require.main === module)`) para
  poder testear con `supertest` sin levantar un listener real ni necesitar Mongo/Fabric —
  ver `tests/health.test.ts` y `tests/fabric.test.ts` para el patrón (mockean
  `repositories/mongoClient` y `fabric/gateway` respectivamente). Ambos tests mockean
  también el módulo del otro, porque `server.ts` importa los dos: si no lo hacés, Jest
  intenta cargar `@hyperledger/fabric-gateway` de verdad y falla (una de sus
  dependencias, `@noble/curves`, se distribuye en ESM puro y Jest no la transforma
  dentro de `node_modules` por defecto).
- Lint: **oxlint**, el mismo que ya usa `frontend/`. No se agregó ESLint.
- `Dockerfile` multi-stage, corre como usuario no-root (`node`, uid 1000 — ya viene en
  `node:20-alpine`). Node 20 LTS fijo en el contenedor aunque el host tenga otra versión.
- Ya está enchufado a `docker/compose.app.yml` (servicios `mongo` + `backend`,
  `depends_on: mongo: condition: service_healthy`, red `fabric_test`, y un volumen
  **de solo lectura** con el material criptográfico de Fabric montado en `/crypto`).

Comandos (correr dentro de `backend/`): `npm run dev`, `npm run build`, `npm test`,
`npm run lint`, `npm run seed` (`identity`, usuarios de prueba). Detalle completo en
`claude_docs/SPEC.md` §5.

### Cómo funciona la conexión a Fabric (`src/fabric/gateway.ts`)

- **Nunca `localhost`, siempre nombres DNS de contenedor.** El default de
  `src/config/fabric.ts` ya apunta a `peer0.org1.example.com:7051` (la red `fabric_test`
  resuelve ese nombre). `localhost` desde dentro del contenedor del backend es el
  contenedor mismo, no el host.
- **Solo se dialoga con el peer, nunca con el orderer directamente.** A diferencia del
  SDK viejo (`fabric-network`), la Fabric Gateway API abre una única conexión gRPC a un
  peer; ese peer resuelve el endorsement y reenvía al orderer por su cuenta cuando hace
  falta (`submitTransaction`). `GetMetadata` además es una `evaluateTransaction` (query
  de solo lectura), que ni siquiera pasa por el orderer. No hace falta cablear
  `orderer.example.com` en el cliente.
- **TLS siempre activo** (`grpcs://` vía `grpc.credentials.createSsl`) — nunca
  desactivarlo, ni para debug.
- **La identidad se lee de archivo en cada arranque** (no se cachea entre reinicios):
  certificado en `.../users/Admin@org1.example.com/msp/signcerts/cert.pem`, llave
  privada en `.../msp/keystore/`, montados de solo lectura desde
  `docker/fabric-samples/test-network/organizations/` (lo genera `network-up.sh`, T1 —
  se regenera entero en cada ciclo `down`→`up`, ninguna identidad sobrevive). Si el
  volumen no está montado o la red no generó las credenciales todavía, `connectFabric()`
  falla al arrancar y `/fabric/ping` responde `503` con un mensaje claro — no tumba el
  proceso (mismo criterio que Mongo).
- **El chaincode real del proyecto (`contracts`, Sprint 2) ya reemplazó al de ejemplo
  (`basic`).** Todavía no expone ninguna función de lectura propia (D6: las consultas de
  negocio son Sprint 3/4), por eso `/fabric/ping` usa la query de sistema `GetMetadata`
  en vez de una función del contrato — sirve igual para probar que la conexión funciona.

## `identity` (Sprint 1, T1-T7 — completo)

Login con credenciales + OTP por correo (2FA), sesión JWT con invalidación real en el
logout, RBAC, cambio de contraseña. Decisiones de diseño completas en
`claude_docs/tasks/plan-sprint1-identity.md` (D1‑D9); estado tarea por tarea en
`claude_docs/tasks/todo-sprint1-identity.md`.

### Seed de usuarios

`npm run seed` (`src/scripts/seedUsers.ts`) siembra los usuarios de prueba si la colección
`users` está vacía — idempotente, se puede correr las veces que haga falta. **Contraseña
de desarrollo de los cuatro: `Contratos123!`** (nunca usar esto en un ambiente real). Ver el
script para los emails de cada rol. Reemplaza a `frontend/src/data/users.ts` como fuente
real para el login; deja de ser necesario cuando HU‑018 (Sprint 4) le dé al Administrador
el alta real de usuarios.

### Contrato de `/auth/*`

Todas las rutas viven en `src/routes/auth.ts`; todas responden `{ message: "..." }` en
error (los mensajes ya están pensados para mostrarse tal cual en la UI).

| Ruta | Auth | Body | Respuesta 200 | Errores |
|---|---|---|---|---|
| `POST /auth/login` | no | `{email, password}` | `{message}` (dispara el envío del OTP) | `400` datos faltantes · `401` credenciales inválidas (mismo mensaje para usuario inexistente, contraseña incorrecta o cuenta desactivada — RF‑002 CA‑02) · `423` cuenta bloqueada temporalmente por intentos fallidos (RF‑54) · `502` no se pudo enviar el correo |
| `POST /auth/verify-otp` | no | `{email, code}` | `{token, user}` (`user` sin `passwordHash`, mismas claves que `frontend/src/types/domain.ts`; el rol viene de la cuenta, ya no se selecciona en el login) | `400` código inválido/vencido/incorrecto/intentos agotados |
| `GET /auth/me` | sí | — | `{user}` | `401` sin sesión válida |
| `POST /auth/logout` | sí | — | `204` | `401` sin sesión válida |
| `POST /auth/change-password` | sí | `{currentPassword, newPassword}` | `{message}` | `400` actual incorrecta/nueva inválida · `401` sin sesión válida |

"Auth: sí" = header `Authorization: Bearer <token>`, validado por
`middlewares/auth.ts#requireAuth()` (o `requireAuth(...roles)` para acotar por rol — no
usado todavía, ningún endpoint de Sprint 1 lo necesita).

### Cómo funciona la sesión

- El JWT (`jsonwebtoken`, HS256 fijo) trae `sub` (userId), `role`, `jti` — vía las
  opciones `subject`/`jwtid` de la librería, nunca escritos a mano en el payload.
- Cada verificación de OTP exitosa crea además un documento en la colección `sessions`
  (`_id` = `jti`). `requireAuth()` exige firma+expiración del JWT **y** que ese documento
  siga existiendo — es lo que permite invalidar una sesión de verdad en el logout (un JWT
  puramente stateless no se puede revocar antes de su expiración).
- `otp_codes` y `sessions` tienen índices TTL de Mongo sobre `expiresAt`: se limpian
  solos, sin cron.
- `JWT_SECRET` no tiene default (es un secreto) — el backend falla al arrancar si falta.
  `docker/compose.app.yml` sí trae un default de desarrollo (mismo criterio que
  `MONGO_ROOT_PASSWORD=changeme`), nunca usar eso fuera de local/Docker.
- RNF‑07: además del vencimiento absoluto de `expiresAt` (`JWT_EXPIRES_MINUTES`,
  default 60), la sesión se cierra tras `SESSION_INACTIVITY_MINUTES` (default 15) sin
  ningún request autenticado — `requireAuth()` compara contra `lastSeenAt` en cada
  request y lo refresca si la sesión sigue viva.
- RF‑54: `MAX_LOGIN_ATTEMPTS` (default 5) intentos fallidos consecutivos bloquean la
  cuenta por `LOGIN_LOCKOUT_MINUTES` (default 15) — `POST /auth/login` responde `423`
  mientras dure el bloqueo, sin comparar la contraseña. El contador vive en el propio
  usuario (`failedLoginAttempts`/`lockedUntil`) y se reinicia con un login exitoso.

### Envío real del OTP (Brevo) y modo sin SMTP

Por indicación del tutor, el OTP sale por un proveedor de correo externo: **Brevo**
(SMTP relay, plan gratis de 300 correos/día, remitente verificado
`contratosblockchain@gmail.com`). Se configura con `SMTP_*` en `docker/.env` (ver
`docker/.env.example`; `compose.app.yml` se las pasa al contenedor). Usar
`SMTP_HOST=smtp-relay.sendinblue.com`: con `smtp-relay.brevo.com` el relay que responde
desde Colombia presenta un certificado de `*.sendinblue.com` y TLS falla. Cada persona
del equipo usa su propia *SMTP key* (Brevo → ⚙️ → SMTP & API), nunca versionada.

Para que los códigos lleguen a un buzón real, `npm run seed` lee `SEED_EMAIL` de
`backend/.env`: con `SEED_EMAIL=contratosblockchain@gmail.com` siembra
`contratosblockchain+empleado@`, `+empleado2@`, `+verificador@` y `+admin@gmail.com` —
todos llegan al mismo buzón (subaddressing de Gmail).

Si `SMTP_HOST` está vacía, `src/services/emailService.ts` loguea el código OTP a consola
(`[dev] SMTP no configurado — código OTP para <email>: <código>`) en vez de enviarlo —
buscalo en `docker logs backend` (o la consola de `npm run dev`). Nunca es un fallback
silencioso, y con SMTP configurado el código nunca se loguea.

## `documents` (Sprint 2, T1-T6 — completo)

El Empleado carga un PDF (`POST /documents`), se valida (firma real `%PDF-`, no el
`Content-Type` del cliente; tamaño ≤ 20MB; un solo archivo), se calcula su huella SHA‑256,
se registra en el chaincode real (`RegisterDocument`, vía `submitChaincodeTransaction`) y
recién si eso tuvo éxito se guarda en Mongo (`documents`). Decisiones completas en
`claude_docs/tasks/plan-sprint2-documents-ledger.md` (D1‑D13); estado tarea por tarea en
`claude_docs/tasks/todo-sprint2-documents-ledger.md`.

### Escribir al ledger: `submitChaincodeTransaction`

`src/fabric/gateway.ts` gana la contraparte de escritura de `queryChaincode()`:
`submitChaincodeTransaction(fcn, ...args)` — sí pasa por endoso + orden real (a
diferencia de `evaluateTransaction`), con sus propios deadlines
(`ENDORSE_TIMEOUT_MS`/`SUBMIT_TIMEOUT_MS` = 5s, `COMMIT_TIMEOUT_MS` = 15s, más largo porque
tiene que esperar el corte real del bloque). Nunca atrapa el error del SDK — lo deja
propagar tal cual, porque el mensaje real de un rechazo del chaincode (ej. "documento ya
registrado") no viaja en `.message` sino en `.details[0].message`
(`GatewayError.details`) — quien llama decide cuánto de eso exponer al cliente.

### Contrato de `POST /documents`

| Ruta | Auth | Body | Respuesta 201 | Errores |
|---|---|---|---|---|
| `POST /documents` | sí, solo `Empleado` (`requireAuth("Empleado")` — primer uso real de la variante con roles) | `multipart/form-data`, campo `document` (un PDF) | `{documentId}` | `400` sin archivo/más de uno/no-PDF (firma real, no `Content-Type`)/archivo > 20MB · `401` sin sesión válida · `403` rol distinto de Empleado · `409` el mismo Empleado ya tiene ese mismo archivo (mismo hash) registrado y todavía `Pendiente` — solo se puede volver a subir una vez verificado · `502` el chaincode rechazó el registro (ver RNF‑13 abajo) · `500` el ledger anotó el registro pero Mongo falló después |

### Por qué nunca hay un éxito a medias (RNF‑13, HU‑007‑CA‑02)

Mongo **nunca** se toca antes de confirmar la escritura en el ledger — si
`submitChaincodeTransaction` falla, se responde `502` y no se guarda nada. Si el ledger
tuvo éxito pero el guardado en Mongo falla después (el hash ya quedó anclado e inmutable
on-chain, RNF‑05 — no hay forma de revertirlo), se loguea como una inconsistencia real
server-side y se responde `500`, nunca un `200` falso. No hay ningún mecanismo de
compensación/saga automático para ese caso límite — queda documentado como reconciliación
manual (sobre-construirlo ahora sería resolver un problema que todavía no se presentó en
un MVP de tesis).

**Hueco conocido, sin resolver todavía:** el timeout del cliente (30s,
`frontend/src/lib/api.ts#uploadDocument`) deja poco margen sobre el peor caso del backend
(endorse + submit + commit ≈ 25s) y `documentId` no tiene ninguna clave de idempotencia
(`crypto.randomUUID()` por intento) — si el cliente corta primero, un reintento del
usuario podría anclar el mismo archivo dos veces on-chain. Queda para quien diseñe la
reconciliación/lectura de Sprint 3/4 (resolverlo de verdad requiere tocar el chaincode,
no solo el backend).

### El chaincode real ya reemplazó al de ejemplo

El nombre del chaincode (`contracts`) y el canal (`contratoschannel`) están en
`src/config/fabric.ts` (`chaincodeName`/`channelName`), no hardcodeados en `gateway.ts` ni
en las rutas. Detalle del contrato Go en sí (qué valida, modelo de datos, cómo
compilarlo/desplegarlo): `chaincode/README.md`.

**Dos bugs de Windows + Git Bash** ya aparecieron y están resueltos en los scripts de
`docker/` (reescritura de rutas por MSYS) — si al scriptear algo similar ven errores raros
de rutas tipo `C:\Program Files\Git\...` donde no debería haber una ruta de Windows, es ese
problema. También afecta a `docker exec`/`docker run` con argumentos de ruta corridos desde
Git Bash (ej. `docker exec backend touch /crypto/x` se mangló solo al probarlo) — el escape
es `//` al inicio de la ruta (`//crypto/x`). Detalle completo en `docker/README.md`.

## `verification` (Sprint 3, T1-T6 — completo)

El Verificador consulta un documento ya registrado (su huella y estado), sube un PDF a
comparar, y el sistema calcula su hash, lo compara contra el registrado, ancla el
resultado real en el ledger (`RecordVerification`, chaincode) y actualiza Mongo.
Decisiones completas en `claude_docs/tasks/plan-sprint3-verification.md` (D1‑D8); estado
tarea por tarea en `claude_docs/tasks/todo-sprint3-verification.md`.

### Primera lectura real del chaincode: `queryLedgerDocument`

`backend/src/services/documentService.ts` tiene un helper interno,
`queryLedgerDocument(documentId)`, compartido por `getDocument` y `verifyDocument`: llama
a `queryChaincode("GetDocument", documentId)` y clasifica el error — `404` solo si viene
de una respuesta real del peer (`.details` poblado, con el mensaje exacto "document ...
not found" del chaincode), `502` para cualquier otro caso (incluidos errores de
transporte/config, que nunca traen `.details` poblado — así nunca se disfrazan de un 404
de negocio).

### Contratos de `/documents*` de este sprint

| Ruta | Auth | Body | Respuesta 200 | Errores |
|---|---|---|---|---|
| `GET /documents` | sí, cualquier rol (Sprint 4, D3): `Verificador`/`Administrador` reciben los documentos de **todos** los usuarios; el `Empleado`, solo los suyos (`responsibleUser === req.user.sub`, RF‑18) | — | `[{documentId, name, responsibleUser, responsibleName, registeredAt, hash, status}, ...]` (últimos 100, sin paginación — D8, ver abajo; `hash` completo solo para `Verificador`, enmascarado para `Administrador` y `Empleado` — RF‑27, nota de cambio 2026‑10‑15; `responsibleName` cae al userId si el usuario no existe) | `401` sin sesión válida |
| `GET /documents/:id` | sí, cualquier rol (lo que varía por rol es el enmascarado del hash, no el acceso — RF‑27/RNF‑08) | — | `{documentId, name?, responsibleUser?, registeredAt?, hash, status}` (`hash` completo solo para `Verificador`, enmascarado para el resto (incluido el `Administrador`, desde 2026‑10‑15) vía `maskHash` — mismo algoritmo que `frontend/src/lib/mask-hash.ts`, copiado, no importado: son paquetes npm separados) | `401` sin sesión · `404` no existe (HU‑010‑CA‑02) · `502` falla el chaincode |
| `POST /documents/:id/verifications` | sí, solo `Verificador` (RF‑23) | `multipart/form-data`, campo `document` (el PDF a comparar) | `{status: "Verificado"\|"Alterado", matches, registeredHash, computedHash}` (hash siempre completo — quien pregunta ya es Verificador) | `400` archivo inválido · `401`/`403` · `404` el `documentId` de la URL no existe · `502` falla `RecordVerification` (nunca toca Mongo) · `500` el ledger anotó la verificación pero Mongo falló después |

### Por qué nunca hay un éxito a medias (mismo criterio D13 de Sprint 2)

`verifyDocument` valida el PDF **antes** de consultar el ledger (un archivo inválido nunca
gasta un round-trip a Fabric) y llama a `RecordVerification` **antes** de tocar Mongo — si
eso falla, `502` y Mongo queda intacto. Si el ledger tiene éxito pero `updateDocumentStatus`
falla después, se loguea como inconsistencia y se responde `500`, nunca un `200` falso
(mismo patrón que `registerDocument`).

**Hueco conocido, sin resolver todavía:** `verifyDocument` descarta el `Event` real que
devuelve `RecordVerification` (con su `Timestamp`/`TxID` determinista del ledger) — ni el
backend ni el frontend tienen hoy el momento real de la verificación para mostrar como
evidencia (RNF‑05/HU‑014), solo una aproximación del reloj del navegador. Si hace falta
ese dato como evidencia real, `verifyDocument` tiene que capturar y devolver el `Event`.

**También conocido:** un reintento del cliente justo si el proceso se cae entre el commit
real a la blockchain y el `updateDocumentStatus` de Mongo es seguro (`RecordVerification`
no tiene ningún guard de "ya verificado", cada evento tiene su propio `TxID` — permite
re-verificar a propósito, HU‑014‑CA‑02 "Nueva verificación"), pero deja dos eventos reales
de verificación para lo que el humano percibe como una sola acción. Consecuencia ya
aceptada del mismo criterio "sin saga/outbox" de D13, no un bug nuevo.

### D8: listado mínimo de documentos (ampliación de alcance, pedida por Sofia)

Probando el flujo a mano, no había ninguna forma de que el Verificador ubicara un
documento sin que alguien le pasara el `documentId` (un UUID de 36 caracteres) a mano.
`GET /documents` (arriba) se adelantó desde el alcance completo de RF‑37…40 (Sprint 4,
con filtros/búsqueda/paginación reales) para resolver justo eso — lee directo de MongoDB
(`listDocuments`, nuevo en `documentRepository.ts`), nunca del chaincode (que sigue sin
ninguna función de listado, D6 de Sprint 2 intacto). (Nota de cambio, Sprint 4: desde
el arreglo de las limitaciones de T7 incluye el hash — enmascarado para el Empleado — y
el nombre del responsable; el hash sale de la copia de Mongo, que nunca cambia después del
registro porque `RecordVerification` solo toca `Status`.) `VerificarIntegridadPage` lo usa para poblar un
selector; elegir un documento de la lista dispara la misma consulta real (`GetDocument`)
que ya hacía la búsqueda manual por id — la lista nunca es la fuente de la verdad.

## `administration` (Sprint 4, T1-T10 — completo)

Consultas de documentos y trazabilidad para los 3 roles, panel del Administrador y
gestión de usuarios (RF‑18…22, RF‑37…51, HU‑008/009/015…020). Decisiones completas en
`claude_docs/tasks/plan-sprint4-administration.md` (D1‑D8); estado tarea por tarea en
`claude_docs/tasks/todo-sprint4-administration.md`.

### Contratos nuevos

| Ruta | Auth | Body | Respuesta | Errores |
|---|---|---|---|---|
| `GET /documents/:id/events` | sí, cualquier rol; un `Empleado` solo sobre **sus** documentos (RF‑21, HU‑009‑CA‑02) | — | `200` `[{documentId, action, user, userName, txId, timestamp, result?}, ...]` en orden cronológico | `401` · `403` Empleado sobre un documento ajeno · `404` no existe · `502` falla el chaincode |
| `GET /events` | sí, `Verificador`/`Administrador` (mismo detalle para los dos, HU‑020‑CA‑02) | — | `200` mismos campos que arriba, eventos de **todos** los documentos, los 200 más recientes en orden cronológico | `401` · `403` · `502` |
| `GET /documents/summary` | sí, solo `Administrador` (RF‑41/42) | — | `200` `{total, pendiente, verificado, alterado}` (cuenta **todos** los documentos, no el tope de 100 del listado) | `401` · `403` |
| `GET /users` | sí, solo `Administrador` (RF‑43/44) | — | `200` `[{userId, name, email, role, status}, ...]` (nunca `passwordHash`) | `401` · `403` |
| `POST /users` | sí, solo `Administrador` (RF‑45) | `{name, email, role}` | `201` `{user, temporaryPassword}` — contraseña temporal fija `Contratos123!` (D7b, el usuario la cambia con `/auth/change-password`) | `400` datos inválidos · `401` · `403` · `409` correo ya registrado |
| `PUT /users/:id` | sí, solo `Administrador` (RF‑46) | `{name, email, role}` | `200` `{user}`; si cambió el rol, se cortan las sesiones abiertas de ese usuario | `400` datos inválidos / quitarse el propio rol · `401` · `403` · `404` · `409` correo ya usado |
| `POST /users/:id/deactivate` | sí, solo `Administrador` (RF‑47) | — | `204`; baja lógica (`status: "Inactivo"`, nunca se borra nada) y se cortan sus sesiones abiertas al instante | `400` desactivarse a sí mismo · `401` · `403` · `404` |

### Detalles que importan

- **Trazabilidad desde el ledger, no desde Mongo.** Los eventos salen del chaincode
  (`GetDocumentEvents`/`GetAllEvents`); el chaincode no los ordena por tiempo, el backend
  los ordena por `timestamp` (D2). El dueño de un documento para el `403` se toma del
  evento `"registro"` del ledger, no de la copia de Mongo — una desincronización de Mongo
  nunca bloquea al dueño real.
- `userName`/`responsibleName` se resuelven en Mongo con una sola consulta por respuesta;
  si el id no es un usuario registrado, se muestra el id.
- `GET /documents/summary` está registrada **antes** de `GET /documents/:id` en el router
  (si no, Express tomaría `summary` como un id) — hay un test dedicado.
- Topes defensivos sin paginación: 100 documentos en `GET /documents`, 200 eventos en
  `GET /events`. Con más de 100 documentos, el total del panel y el listado dejan de
  coincidir a simple vista (búsqueda/paginación reales: trabajo futuro).
- No hay reactivación de usuarios ni invitación por correo (D7b/D8, ningún RF las pide).
- CORS: `/documents` permite `GET, POST, OPTIONS`; `/events` y `/users` tienen su propio
  bloque acotado a `FRONTEND_ORIGIN` (ver comentario en `server.ts`).

## Referencias

- `claude_docs/SPEC.md` — arquitectura, modelo de dominio, límites (Always/Ask
  first/Never), es la fuente de verdad para cualquier duda de diseño.
- `claude_docs/tasks/todo.md` — plan de tareas del sprint de infraestructura (T1-T8) y su
  estado actual.
- `claude_docs/tasks/plan-sprint1-identity.md` / `todo-sprint1-identity.md` — plan,
  decisiones (D1‑D9) y tareas del sprint de `identity` (login, OTP, sesión, RBAC), completo.
- `claude_docs/tasks/plan-sprint2-documents-ledger.md` / `todo-sprint2-documents-ledger.md`
  — plan, decisiones (D1‑D13) y tareas del sprint de `documents`+`ledger` (carga de PDF,
  huella SHA‑256, chaincode real), completo.
- `claude_docs/tasks/plan-sprint3-verification.md` / `todo-sprint3-verification.md` —
  plan, decisiones (D1‑D8) y tareas del sprint de `verification` (consulta de huella,
  comparación real, listado mínimo de documentos), completo.
- `claude_docs/tasks/plan-sprint4-administration.md` / `todo-sprint4-administration.md` —
  plan, decisiones (D1‑D8) y tareas del sprint de `administration` (consultas, panel,
  usuarios), completo.
- `claude_docs/tasks/plan-trabajo-pendiente.md` — lo que falta del MVP, en orden de
  prioridad.
- `chaincode/README.md` — qué hace el contrato Go, modelo de datos, cómo
  compilarlo/testearlo/desplegarlo.
- `docker/README.md` — cómo levantar la red Fabric y Mongo, puertos, prerrequisitos.
