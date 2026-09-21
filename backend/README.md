# backend/

Gateway Node.js + Express hacia MongoDB y Hyperledger Fabric (ver `claude_docs/SPEC.md`
para el diseño completo — este archivo es un resumen práctico, no la fuente de verdad).

## Qué hay hoy

Sprint 0 (T4+T5) dejó el *walking skeleton* — Mongo y Fabric probados de punta a punta,
sin lógica de negocio. Sprint 1 (`identity`, T1-T7) ya agregó la primera lógica de negocio
real: login con OTP, sesión JWT, RBAC y cambio de contraseña — ver la sección
"`identity`" más abajo para el contrato completo.

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

`npm run seed` (`src/scripts/seedUsers.ts`) siembra 1 usuario por rol si la colección
`users` está vacía — idempotente, se puede correr las veces que haga falta. **Contraseña
de desarrollo de los tres: `Contratos123!`** (nunca usar esto en un ambiente real). Ver el
script para los emails de cada rol. Reemplaza a `frontend/src/data/users.ts` como fuente
real para el login; deja de ser necesario cuando HU‑018 (Sprint 4) le dé al Administrador
el alta real de usuarios.

### Contrato de `/auth/*`

Todas las rutas viven en `src/routes/auth.ts`; todas responden `{ message: "..." }` en
error (los mensajes ya están pensados para mostrarse tal cual en la UI).

| Ruta | Auth | Body | Respuesta 200 | Errores |
|---|---|---|---|---|
| `POST /auth/login` | no | `{email, password, role}` | `{message}` (dispara el envío del OTP) | `400` datos faltantes/`role` inválido · `401` credenciales inválidas (mismo mensaje para usuario inexistente, contraseña incorrecta o cuenta desactivada — RF‑002 CA‑02) · `502` no se pudo enviar el correo |
| `POST /auth/verify-otp` | no | `{email, code}` | `{token, user}` (`user` sin `passwordHash`, mismas claves que `frontend/src/types/domain.ts`) | `400` código inválido/vencido/incorrecto/intentos agotados · `403` el rol elegido en el login no coincide con el real (HU‑002 CA‑02) |
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

### Probar sin SMTP real

Si `SMTP_HOST` no está seteada, `src/services/emailService.ts` loguea el código OTP a
consola (`[dev] SMTP no configurado — código OTP para <email>: <código>`) en vez de
enviarlo — buscalo en `docker logs backend` (o la consola de `npm run dev`). Nunca es un
fallback silencioso.

## Qué sigue (Sprint 2: chaincode + escrituras al ledger)

Con `identity` completo, lo que viene es el chaincode real del proyecto (módulo `ledger`
de `claude_docs/SPEC.md` — `RegisterDocument`, huellas SHA-256, eventos, `txID`; RF‑16,
22, 35, 40, 51) y los endpoints de negocio del backend que lo invoquen (documentos,
verificación, administración) — esos sí van a necesitar `requireAuth(...roles)` con una
lista de roles real, a diferencia de `identity` (ninguna de sus rutas la necesitó).

Lo que ya está resuelto para cuando llegue ese momento:

- **Escribir al ledger es `submitTransaction`, no `evaluateTransaction`.** `gateway.ts`
  solo expone `queryChaincode()` (evaluate, solo lectura) porque es todo lo que T5
  necesitaba. Para registrar una huella o un evento van a necesitar un
  `submitTransaction(fcn, ...args)` — misma conexión, mismo `contract`, sin nada nuevo
  que cablear.
- El nombre del chaincode (`basic`) y el canal (`contratoschannel`) van a cambiar cuando
  exista el chaincode real — están en `src/config/fabric.ts`, no hardcodeados en
  `gateway.ts` ni en las rutas.
- **Dos bugs de Windows + Git Bash** ya aparecieron y están resueltos en los scripts de
  `docker/` (reescritura de rutas por MSYS) — si al scriptear algo similar ven errores
  raros de rutas tipo `C:\Program Files\Git\...` donde no debería haber una ruta de
  Windows, es ese problema. También afecta a `docker exec`/`docker run` con argumentos de
  ruta corridos desde Git Bash (ej. `docker exec backend touch /crypto/x` se mangló solo
  al probarlo) — el escape es `//` al inicio de la ruta (`//crypto/x`). Detalle completo
  en `docker/README.md`.
- **El frontend real ya existe** (rama `Feat/Front`, ya en `main`) y desde Sprint 1 (T6/T7)
  ya habla de verdad con este backend para todo el flujo de `identity` — login, OTP,
  sesión, logout, cambio de contraseña (`frontend/src/lib/api.ts`,
  `frontend/src/context/SessionContext.tsx`). Las pantallas de negocio
  (Empleado/Verificador/Administrador) siguen con datos hardcodeados de `src/data/*.ts` —
  conectarlas es trabajo de Sprint 2+, no algo que ya esté resuelto.

## Referencias

- `claude_docs/SPEC.md` — arquitectura, modelo de dominio, límites (Always/Ask
  first/Never), es la fuente de verdad para cualquier duda de diseño.
- `claude_docs/tasks/todo.md` — plan de tareas del sprint de infraestructura (T1-T8) y su
  estado actual.
- `claude_docs/tasks/plan-sprint1-identity.md` / `todo-sprint1-identity.md` — plan,
  decisiones (D1‑D9) y tareas del sprint de `identity` (login, OTP, sesión, RBAC), completo.
- `docker/README.md` — cómo levantar la red Fabric y Mongo, puertos, prerrequisitos.
