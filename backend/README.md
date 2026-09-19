# backend/

Gateway Node.js + Express hacia MongoDB y Hyperledger Fabric (ver `claude_docs/SPEC.md`
para el diseño completo — este archivo es un resumen práctico, no la fuente de verdad).

## Qué hay hoy (T4 + T5 — walking skeleton, sin lógica de negocio real)

Sin lógica de negocio (documentos, verificación, auth) todavía, pero ya prueba de punta a
punta las dos integraciones externas que necesita el proyecto: Mongo y Fabric.

- Express + TypeScript, compilado con `tsc` (CommonJS, no ESM — evita fricción con Jest).
- `GET /health` — hace un `ping` real a Mongo en cada request (no un flag cacheado de
  "conectado"), responde `200 {status:"ok", mongo:"connected"}` o `503 {status:"error",
  mongo:"down"}`.
- `GET /fabric/ping` — consulta `GetAllAssets` del chaincode de ejemplo (`basic`) en el
  canal `contratoschannel` vía Fabric Gateway real (TLS, identidad desde archivo, sin
  `localhost`). Responde `200 {status:"ok", result:[...]}` o `503 {status:"error",
  message:"..."}` si Fabric no está disponible. Usá cualquiera de las dos rutas como
  plantilla para otros endpoints de estado.
- Estructura por capas (`claude_docs/SPEC.md` §7): `routes/ → controllers/ → services/ →
  repositories|fabric/`. Hoy existen `routes/`, `repositories/` (Mongo), `fabric/`
  (Fabric Gateway) y `config/`; `services/` sigue vacía con `.gitkeep` —
  `controllers/` ni existe todavía. Créenlas cuando agreguen la primera lógica de negocio
  real (ninguna de las dos rutas actuales tiene lógica que justifique un service).
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
`npm run lint`. Detalle completo en `claude_docs/SPEC.md` §5.

### Cómo funciona la conexión a Fabric (`src/fabric/gateway.ts`)

- **Nunca `localhost`, siempre nombres DNS de contenedor.** El default de
  `src/config/fabric.ts` ya apunta a `peer0.org1.example.com:7051` (la red `fabric_test`
  resuelve ese nombre). `localhost` desde dentro del contenedor del backend es el
  contenedor mismo, no el host.
- **Solo se dialoga con el peer, nunca con el orderer directamente.** A diferencia del
  SDK viejo (`fabric-network`), la Fabric Gateway API abre una única conexión gRPC a un
  peer; ese peer resuelve el endorsement y reenvía al orderer por su cuenta cuando hace
  falta (`submitTransaction`). `GetAllAssets` además es una `evaluateTransaction` (query
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
- **El chaincode de ejemplo (`basic`) sigue siendo el único disponible.** Sirve para
  probar que la conexión funciona; no tiene nada que ver con el negocio.

## Sprint 1 — `identity` (en progreso, ver `claude_docs/tasks/todo-sprint1-identity.md`)

**T1 (modelo de usuarios + seed) hecho.** `src/repositories/userRepository.ts` maneja la
colección `users` de Mongo (contraseña con hash `bcryptjs`, nunca en texto plano; `_id` es
el mismo `userId` legible que ya usa el frontend, ej. `"U001"`). `npm run seed`
(`src/scripts/seedUsers.ts`) siembra 1 usuario por rol si la colección está vacía —
idempotente, se puede correr las veces que haga falta.

**Contraseña de desarrollo de los usuarios sembrados: `Contratos123!`** (los tres,
Empleado/Verificador/Administrador — ver el script para los emails). Es solo para probar
en local/Docker; nunca configurar esto en un ambiente real. Reemplaza a
`frontend/src/data/users.ts` como fuente real para el login; deja de ser necesario cuando
HU‑018 (Sprint 4) le dé al Administrador el alta real de usuarios.

Falta T2 en adelante: login con OTP por correo, sesión JWT, RBAC, logout, cambio de
contraseña — ver el plan y el todo de Sprint 1 para el detalle y las decisiones (D1‑D9).

## Qué sigue (el negocio real: chaincode + escrituras al ledger)

Lo que viene ahora es más grande que T5: el chaincode real del proyecto (Sprint 2, módulo
`ledger` de `claude_docs/SPEC.md` — `RegisterDocument`, huellas SHA-256, eventos,
`txID`; RF‑16, 22, 35, 40, 51) y la lógica de negocio en el backend que lo invoque
(auth con JWT+OTP para `identity`, endpoints de documentos/verificación/administración).

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
- **El frontend real ya existe** (rama `Feat/Front`, ya en `main`) pero es un prototipo
  visual: usa datos hardcodeados en `src/data/*.ts` y no llama a ningún backend (`grep`
  de `fetch|axios|VITE_API_URL` en `frontend/src` no encuentra nada). Conectarlo es
  trabajo pendiente, no algo que ya esté resuelto.

## Referencias

- `claude_docs/SPEC.md` — arquitectura, modelo de dominio, límites (Always/Ask
  first/Never), es la fuente de verdad para cualquier duda de diseño.
- `claude_docs/tasks/todo.md` — plan de tareas del sprint de infraestructura (T1-T8) y su
  estado actual.
- `claude_docs/tasks/plan-sprint1-identity.md` / `todo-sprint1-identity.md` — plan y tareas
  del sprint de `identity` (login, OTP, sesión, RBAC) en curso.
- `docker/README.md` — cómo levantar la red Fabric y Mongo, puertos, prerrequisitos.
