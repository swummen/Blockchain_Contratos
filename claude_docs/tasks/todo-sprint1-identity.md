# TODO: Sprint 1 · módulo `identity` · HU‑001…004

Plan: `claude_docs/tasks/plan-sprint1-identity.md` (**aprobado 2026‑09‑19**, D1/D2 confirmados).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1-T8 completos y verificados (incluye un ciclo `down.sh`→`up.sh` desde cero +
`npm run seed` + smoke test de punta a punta en T8). Sprint 1 (`identity`) terminado en lo
técnico. Sigue pendiente que Sofia confirme en navegador real el cambio de contraseña y el
logout con el chequeo de ruta protegida (checkpoint de T7, no bloqueante para el resto),
y los dos puntos de DoD fuera del alcance de este repo (PR/aceptación de dirección).**
No hacer `git commit` automático: solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1: Backend: login y sesión

### T1: Modelo de usuarios en Mongo + seed

**Descripción:** Colección `users` en MongoDB (contraseña con hash+salt vía `bcryptjs`,
rol, correo, estado) y script de seed que seguirá siendo la única fuente de usuarios de
prueba hasta que HU‑018 (Sprint 4) le dé al Administrador el CRUD real. Es la base de todo
el sprint: sin usuarios reales no hay con qué loguearse.

**Criterios de aceptación:**
- [x] `backend/src/repositories/userRepository.ts` expone `findUserByEmail`, `findUserById`,
  `countUsers`, `insertUserIfMissing`, `updatePasswordHash`, tipado contra `UserDoc` (`_id`,
  `name`, `email`, `passwordHash`, `role`, `status`); nada fuera del repositorio construye
  la query de Mongo directamente.
- [x] `backend/src/scripts/seedUsers.ts` (corrido con `npm run seed`) inserta 1 usuario por
  rol (Empleado/Verificador/Administrador) si la colección está vacía; es idempotente
  (upsert por `_id` con `$setOnInsert`, no duplica si se corre dos veces).
- [x] Contraseñas de seed hasheadas con `bcryptjs` (nunca texto plano en Mongo).
- [x] `backend/.env.example` documenta `BCRYPT_ROUNDS` (default 10 si no está seteada).

**Verificación:**
- [x] Manual: `npm run seed` contra Mongo real (stack de `docker/up.sh` arriba, conectando
  desde el host a `127.0.0.1:27017`) → `docker exec mongo mongosh ...` confirma 3 usuarios
  con `passwordHash` en formato `$2a$10$...` (bcrypt), no texto plano. Corrido dos veces
  seguidas: sigue habiendo exactamente 3 (idempotencia confirmada, no duplica).
- [x] Tests: `backend/tests/userRepository.test.ts` (7 casos tras la ronda de review, mismo
  patrón de mock de `mongoClient` que ya usa `health.test.ts`), 14/14 tests del backend en
  verde.
- [x] Build: `npm run build` sin errores de `tsc`. `npm run lint` (oxlint) también en 0
  warnings/errores.
- [x] Ronda de `code-reviewer`: encontró que faltaba el índice único de `email` sobre la
  colección `users` (ya modelado como `<<unique>>` en `docs/uml/03-diagrama-mer.puml:8` pero
  no aplicado en Mongo) y que `findUserByEmail`/`insertUserIfMissing` no normalizaban
  mayúsculas/espacios del email, con datos de seed en minúscula pasaba desapercibido, pero
  el login de T2 va a alimentar esta misma función con lo que el usuario tipee. Corregido:
  `ensureIndexes()` (nuevo, llamado desde `seedUsers.ts`) crea el índice único; `email` se
  normaliza (`trim().toLowerCase()`) antes de buscar e insertar. También se alineó
  `isMongoHealthy` para usar `getDb()` en vez de `client.db()` sin argumento (dos handles de
  DB distintos conviviendo en el mismo archivo, hallazgo opcional). Re-verificado en vivo:
  se borró la colección real, se corrió `npm run seed` de nuevo (recrea el índice), y un
  `insertOne` manual con un email duplicado fue rechazado por Mongo (`E11000 duplicate key
  error ... index: email_1`); `/health` del backend ya corriendo (imagen sin cambios, T1 no
  toca ninguna ruta HTTP) siguió respondiendo `200 connected` tras la manipulación directa de
  la colección.

**Dependencias:** ninguna (Mongo ya existe desde Sprint 0, T3).

**Archivos:** `backend/src/repositories/userRepository.ts`, `backend/src/scripts/seedUsers.ts`,
`backend/package.json` (script `seed`, dependencia `bcryptjs`), `backend/.env.example`.

**Alcance:** M.

---

### T2: Login paso 1, credenciales + envío de OTP

**Descripción:** `POST /auth/login` valida usuario+contraseña, genera un código OTP de 6
dígitos, lo guarda hasheado en la colección `otp_codes` (con TTL) y lo envía al correo
registrado del usuario (`nodemailer`, con fallback a consola en dev si no hay SMTP
configurado, decisión D6 del plan; canal confirmado en D1, correo registrado no
necesariamente corporativo por ahora).

**Criterios de aceptación:**
- [x] `POST /auth/login` con credenciales válidas responde `200` (mensaje genérico, sin
  JWT todavía: llega en T3) y dispara el envío del OTP. No se usó un identificador de
  intento aparte: el registro en `otp_codes` queda keyed por `userId` (un OTP activo a la
  vez), y T3/`OtpPage` ya conocen el email por el estado `pendingEmail` que el frontend
  mock ya mantiene, no hace falta inventar un campo nuevo para eso.
- [x] Credenciales inválidas (usuario no existe o contraseña incorrecta) responden con el
  mismo mensaje genérico sin indicar cuál dato falló (RF‑002 CA‑02, ya citado en
  `claude_docs/SPEC.md:321`); además se compara contra un hash dummy cuando el usuario no
  existe para que el tiempo de respuesta no delate si el email está registrado.
- [x] El código OTP se guarda **hasheado** (bcrypt) en `otp_codes`, con índice TTL sobre
  `expiresAt` (D5 del plan).
- [x] `backend/src/services/emailService.ts` envía el correo si `SMTP_HOST` está seteado;
  si no, loguea el código a consola con una advertencia explícita `[dev]` (nunca en
  silencio).
- [x] `backend/.env.example` documenta `SMTP_HOST/PORT/USER/PASSWORD/FROM`,
  `OTP_TTL_MINUTES`, `OTP_MAX_ATTEMPTS` y `FRONTEND_ORIGIN`.
- [x] **Nota de cambio (no estaba en el AC original):** `/auth` necesitó su propio CORS
  (D8 del plan) acotado a `FRONTEND_ORIGIN`, distinto del wildcard `*` de `/health`/`/fabric`
incluye manejo del preflight `OPTIONS` (el navegador lo manda antes de un POST con
  body JSON). También se agregó `express.json()` + un handler de JSON malformado (ninguna
  ruta anterior necesitaba parsear body).

**Verificación:**
- [x] Manual contra el stack real (`docker compose ... up -d --build backend`):
  `curl -X POST localhost:8080/auth/login` con credenciales del seed → `200` + código
  visible en el log del contenedor (`[dev] SMTP no configurado, código OTP para
  m.lopez@empresa.com: 282901`, sin SMTP configurado). `docker exec mongo mongosh`
  confirma el documento en `otp_codes` con `codeHash` en formato bcrypt (no el código en
  texto plano) y el índice TTL (`expireAfterSeconds: 0`) creado.
  Créditos inválidos (usuario inexistente vs. contraseña incorrecta) devolvieron **la
  misma respuesta byte a byte** (mismo `Content-Length`/`ETag`): confirma que no se puede
  distinguir cuál dato falló. Role fuera del catálogo → `400`. Preflight `OPTIONS` → `204`
  con el header `Access-Control-Allow-Origin` correcto. `/health` y `/fabric/ping`
  siguieron respondiendo bien tras cablear el router nuevo (sin regresión).
- [x] Tests: `backend/tests/auth.login.test.ts` (9 casos tras la ronda de review,
  mockeando `userRepository`, `otpRepository` y `emailService` en su frontera, mismo
  patrón que `fabric.test.ts` mockeando el gateway), 23/23 tests del backend en verde.
- [x] Build: `npm run build` sin errores. `npm run lint` (oxlint) en 0 warnings/errores.
- [x] Ronda de `code-reviewer`: encontró dos huecos reales. (1) `DUMMY_HASH` (mitigación de
  timing attack) estaba hasheado con un costo bcrypt literal (`10`) en vez de
  `env.bcryptRounds`: si `BCRYPT_ROUNDS` cambiara del default, `bcrypt.compare` volvería a
  tardar distinto según exista o no el usuario, reabriendo el canal de tiempo que esa línea
  existe para cerrar. (2) `login()` nunca leía `user.status`: un usuario dado de baja
  lógica (RF‑47) igual pasaba el login y recibía un OTP. Corregido: `DUMMY_HASH` ahora usa
  `env.bcryptRounds`; se agregó `|| user.status === "Inactivo"` al mismo chequeo que ya
  devuelve el 401 genérico (no un mensaje distinto: no hay que poder distinguir "usuario
  desactivado" de "contraseña incorrecta" desde afuera). También se agregó un test para el
  body JSON malformado (hallazgo Required de cobertura: la lógica nueva de `server.ts` no
  tenía ningún test) y se alineó la validación de `SMTP_PORT` con el mismo `parsePositiveInt`
  que ya usan `OTP_TTL_MINUTES`/`OTP_MAX_ATTEMPTS` (hallazgo opcional, barato). Re-verificado
  en vivo: se puso `U001` en `Inactivo` directamente en Mongo, el login devolvió el mismo
  401 byte a byte que los demás casos (mismo `Content-Length`/`ETag`) sin enviar OTP, se
  restauró el estado, y un login normal siguió funcionando después.

**Dependencias:** T1.

**Archivos:** `backend/src/routes/auth.ts`, `backend/src/services/authService.ts`,
`backend/src/services/emailService.ts`, `backend/src/repositories/otpRepository.ts`,
`backend/src/config/auth.ts`, `backend/tests/auth.login.test.ts`.

**Alcance:** M.

---

### T3: Verificación de OTP + sesión JWT

**Descripción:** `POST /auth/verify-otp` valida el código, confirma que el rol
seleccionado coincide con el del usuario, y si todo es correcto emite un JWT + crea el
registro de sesión en Mongo (`sessions`, D4 del plan) que permite invalidarlo de verdad en
el logout (T4). **Slice de mayor riesgo del sprint**: primera vez que el backend emite y
valida una sesión real. Expiración/reintentos ya confirmados en D2 (5 min / 5 intentos).

**Criterios de aceptación:**
- [x] `POST /auth/verify-otp` con el código correcto y vigente responde `200` con un JWT
  (payload: `sub`, `role`, `jti`, `exp`, `sub`/`jti` vía las opciones `subject`/`jwtid` de
  `jsonwebtoken`, no puestos a mano en el payload) y crea el documento de sesión en Mongo.
  También devuelve el usuario público (`userId`, `name`, `email`, `role`, `status`, sin
  `passwordHash`) para que T6 no tenga que hacer una llamada aparte.
- [x] Código incorrecto incrementa el contador de intentos; al llegar al máximo (D2: 5) el
  intento de login completo se invalida (se borra el OTP) y hay que volver a
  `POST /auth/login`.
- [x] Código vencido (TTL de Mongo ya lo limpió, o `expiresAt` ya pasó pero el TTL de Mongo
  todavía no corrió su barrido en segundo plano) responde con un error claro (400), no 500.
- [x] Rol seleccionado en el login (paso 1, guardado en el propio OTP) que no coincide con
  el rol real del usuario: se deniega el acceso con `403` (HU‑002 CA‑02); el OTP se
  consume igual (RN‑01: un código es de un solo uso, un rol equivocado no lo vuelve
  reutilizable).
- [x] `JWT_SECRET`/`JWT_EXPIRES_MINUTES` en `backend/.env.example`; sin `JWT_SECRET`
  seteado el backend falla al arrancar con un mensaje claro (verificado). Un solo valor en
  minutos (no un string tipo `"60m"`) alimenta tanto el `expiresIn` del JWT como el
  `expiresAt` del documento de sesión, para que nunca queden desincronizados.

**Verificación:**
- [x] Manual contra el stack real (rebuild del backend): flujo completo `login` →
  `verify-otp` con el código real del log (`621217`) → `200` con JWT; decodificado
  (`jwt.decode`) confirma `sub: "U001"`, `role: "Empleado"`, `jti` (uuid), `exp` (número).
  `docker exec mongo mongosh` confirmó que `otp_codes` quedó vacío (se consumió) y
  `sessions` tiene el documento con el mismo `jti` y su índice TTL.
- [x] Manual: 5 códigos incorrectos seguidos → `"Código incorrecto."` cada vez; el 6°
  intento → `"Demasiados intentos. Vuelve a iniciar sesión..."` (bloqueo real, no solo
  un mensaje: se confirmó que el OTP se había borrado).
- [x] Manual: `node -e "require('./dist/config/auth')"` sin `JWT_SECRET` en el entorno →
  falla con `Error: JWT_SECRET es obligatoria (sin default: es un secreto)...`.
- [x] Tests: `backend/tests/auth.otp.test.ts` (9 casos tras la ronda de review: código
  correcto, incorrecto, vencido, usuario inexistente, usuario desactivado, sin OTP
  pendiente, máximo de intentos, rol no coincide, campos faltantes), 32/32 tests del
  backend en verde.
- [x] Build: `npm run build` sin errores. `npm run lint` (oxlint) en 0 warnings/errores.
- [x] Ronda de `code-reviewer`: encontró que `verifyOtp` no repetía el chequeo de
  `user.status === "Inactivo"` que sí tiene `login()`, ventana real: un usuario pide OTP
  estando activo, un administrador lo desactiva (RF‑47) antes de que complete el paso 2, y
  igual se le emitía una sesión JWT válida. Corregido: mismo chequeo, mismo mensaje
  genérico. También se agregó el test que faltaba para "usuario inexistente" en
  `verify-otp` (rama de anti-enumeración sin cobertura directa). Re-verificado en vivo:
  se desactivó `U001` justo después del login (antes de verificar el OTP real del log) →
  `verify-otp` respondió el mismo 400 genérico y no se creó ninguna sesión nueva; se
  restauró el estado y un login/verify normal siguió funcionando después.

**Dependencias:** T2.

**Archivos:** `backend/src/routes/auth.ts` (ruta nueva), `backend/src/services/authService.ts`
(ampliado), `backend/src/repositories/sessionRepository.ts`, `backend/src/repositories/userRepository.ts`
(`toPublicUser`/`PublicUser`, ampliado), `backend/src/config/auth.ts` (ampliado, JWT),
`backend/src/server.ts` (asegura el índice de `sessions` al arrancar),
`backend/tests/auth.otp.test.ts`, `backend/tests/jest.setup.ts` (nuevo, `JWT_SECRET` de
test, ver Nota de cambio), `backend/jest.config.js` (`setupFiles`), `docker/compose.app.yml`
y `docker/.env.example` (`JWT_SECRET`/`JWT_EXPIRES_MINUTES`, con el mismo criterio de
default de desarrollo que `MONGO_ROOT_PASSWORD`).

**Nota de cambio (no estaba en el AC original):** `JWT_SECRET` sin default rompe cualquier
test que importe `src/server.ts` (toda la cadena de imports llega a `config/auth.ts`) antes
de correr un solo test. Se agregó `backend/tests/jest.setup.ts` (vía `setupFiles` de Jest)
que fija un `JWT_SECRET` de prueba, nunca usado fuera del proceso de test.

**Alcance:** M.

---

### ✅ Checkpoint: login completo (backend)
- [x] `login` → `verify-otp` de punta a punta por `curl`, JWT válido.
- [x] Casos de error (credenciales, OTP, rol) cubiertos por tests (32/32).
- [x] Revisado por `code-reviewer` (T2 y T3, cada uno con su propia ronda de fixes
  aplicados y reverificados en vivo).

---

## Fase 2: Sesión, RBAC, logout, cambio de contraseña

### T4: Middleware RBAC + logout

**Descripción:** Middleware que valida el JWT (firma + expiración) y que la sesión
(`jti`) siga viva en Mongo, exponiendo `req.user` a las rutas protegidas; se aplica a una
ruta de prueba para demostrarlo. `POST /auth/logout` borra el documento de sesión: 
invalidación real, no solo "olvidar el token del lado del cliente".

**Criterios de aceptación:**
- [x] `backend/src/middlewares/auth.ts` exporta `requireAuth(...allowedRoles)`: responde
  `401` sin JWT, con JWT inválido/expirado (verificación con `algorithms: ["HS256"]` fijo,
  no confía en el `alg` del header del token), o con JWT válido pero sin sesión viva en
  Mongo (ya cerrada). Un único middleware parametrizable (no dos separados) porque acá
  autenticación y autorización siempre van juntas.
- [x] Variante con roles: `requireAuth("Administrador", ...)` responde `403` si el rol del
  JWT no está en la lista (RF‑05, RNF‑03); `requireAuth()` sin argumentos exige solo sesión
  válida, cualquier rol.
- [x] `POST /auth/logout` (requiere JWT válido) borra la sesión de Mongo; una llamada
  posterior a una ruta protegida con el mismo JWT ya usado responde `401` (HU‑003 CA‑02).
- [x] Ruta de prueba protegida: **no** se reutilizó `/fabric/ping` (rompería el
  `/system-status` público de Sprint 0, que lo llama sin JWT), se agregó `GET /auth/me`
  en su lugar, una ruta real y útil (no un descarte): T6 la puede usar para confirmar la
  identidad de la sesión activa.

**Verificación:**
- [x] Manual contra el stack real (rebuild del backend): `curl /auth/me` sin JWT → `401`;
  login+verify-otp real → JWT; `/auth/me` con ese JWT → `200` con el usuario; `logout` →
  `204`; `/auth/me` con el mismo JWT de nuevo → `401` ("Sesión inválida o vencida", el
  mensaje específico que solo aparece cuando la sesión ya no existe en Mongo, no un 401
  genérico de "faltaba el header"). `/health` y `/fabric/ping` sin regresión.
- [x] Tests: `backend/tests/auth.middleware.test.ts` (9 casos tras la ronda de review, 7
  unitarios contra `requireAuth()` con req/res simulados, 2 de integración contra
  `GET /auth/me` real) + `backend/tests/auth.logout.test.ts` (3 casos, incluyendo el ciclo
  completo logout→reutilización del mismo JWT→401), 45/45 tests del backend en verde.
- [x] Build: `npm run build` sin errores. `npm run lint` (oxlint) en 0 warnings/errores.
- [x] Ronda de `code-reviewer` (verdict: APPROVE con 2 Required menores): (1) el payload
  del JWT validaba que `role` fuera un string pero no que estuviera en el catálogo
  (`Empleado|Verificador|Administrador`): se movió `VALID_ROLES` de `routes/auth.ts` a
  `userRepository.ts` (junto a `Role`) y ahora `requireAuth` también valida contra ella; (2)
  faltaba un test que ejercitara un JWT bien firmado pero con el payload incompleto o con
  un rol fuera de catálogo: agregados. También se aplicó el hallazgo Optional de un
  `ErrorRequestHandler` catch-all al final de `createApp()` (T4 es la primera vez que una
  ruta protegida hace un `await` a Mongo en pleno camino de la request (
  `findSessionByJti`) y sin un handler propio, una excepción ahí caía en la página HTML
  de error por defecto de Express). Ese catch-all expuso de inmediato un bug real de
  *test* (no de producción): `auth.login.test.ts` mockeaba `userRepository` reemplazando
  el módulo entero sin `VALID_ROLES`, así que el `import` nuevo de `routes/auth.ts` recibía
  `undefined` y tiraba, los tests pasaban a 500 en vez de sus códigos esperados. Corregido
  alineando ese mock al mismo patrón `jest.requireActual` + override que ya usan
  `auth.otp.test.ts`/`auth.middleware.test.ts`. Re-verificado todo en vivo tras el rebuild
  del backend: `/auth/me` con JWT válido, login con rol inválido (sigue `400`, no `500`),
  y el ciclo logout→reuso→`401`.

**Dependencias:** T3.

**Archivos:** `backend/src/middlewares/auth.ts` (nuevo), `backend/src/routes/auth.ts`
(rutas `logout`/`me`), `backend/src/services/authService.ts` (`logout`,
`getPublicUserById`), `backend/src/server.ts` (CORS de `/auth`: agrega `GET` y el header
`Authorization`), `backend/tests/auth.middleware.test.ts`, `backend/tests/auth.logout.test.ts`.

**Alcance:** M.

---

### T5: Cambio de contraseña

**Descripción:** `POST /auth/change-password` (requiere sesión válida) valida la
contraseña actual, hashea la nueva con `bcryptjs` y la guarda.

**Criterios de aceptación:**
- [x] Requiere JWT válido (`requireAuth()` de T4); usa `req.user.sub` (del JWT ya validado,
  nunca un id del body) para saber sobre qué usuario actuar.
- [x] Contraseña actual incorrecta: `400` con mensaje claro, no cambia nada.
- [x] Contraseña actual correcta + nueva válida: actualiza el hash en Mongo. Validaciones
  adicionales no pedidas explícitamente por el AC pero razonables (RNF‑01, hashing seguro
  no implica "cualquier valor sirve"): mínimo 8 caracteres, y debe ser distinta a la
  actual (mismo criterio que ya tenía el mock del frontend en `SessionContext.tsx`).

**Verificación:**
- [x] Manual contra el stack real (rebuild del backend): login con la contraseña vieja
  tras el cambio → `"Credenciales inválidas."`; con la nueva → login normal. Se restauró
  la contraseña de desarrollo documentada (`Contratos123!`) al final para no romper
  pruebas manuales futuras de la sesión.
- [x] Tests: `backend/tests/auth.changePassword.test.ts` (7 casos tras la ronda de review:
  contraseña correcta+nueva válida (decodifica el hash guardado con `bcrypt.compare` para
  confirmar que es exactamente la nueva contraseña, no solo que se llamó a la función),
  sesión válida pero usuario ya no existe, actual incorrecta, nueva igual a la actual,
  nueva demasiado corta, sin sesión válida, campos faltantes), 52/52 tests del backend en
  verde.
- [x] Build: `npm run build` sin errores. `npm run lint` (oxlint) en 0 warnings/errores.
- [x] Ronda de `code-reviewer` (verdict: APPROVE): confirmó los tres puntos de seguridad
  consultados (orden de validaciones correcto, se chequea `currentPassword` antes que las
  reglas de `newPassword`; el hash dummy de `login()` no aplica acá porque `userId` viene
  de un JWT ya firmado con sesión viva, no de un input público enumerable; `requireAuth()`
  garantiza que `req.user` siempre está seteado antes de llegar al handler, revisado
  línea por línea). Único hallazgo Required: faltaba el test de la rama "usuario ya no
  existe" (`findUserById` → `null` → 401) en `authService.changePassword`, agregado.
  Notas para el backlog (no bloqueantes, ninguna requiere acción en este sprint): no hay
  límite de intentos sobre `currentPassword` (a diferencia del OTP), y cambiar la
  contraseña no invalida las demás sesiones activas del usuario (decisión ya tomada y
  documentada en T4, requeriría un índice por `userId` en `sessions` que hoy no existe).

**Dependencias:** T4.

**Archivos:** `backend/src/routes/auth.ts` (ruta nueva), `backend/src/services/authService.ts`
(ampliado), `backend/tests/auth.changePassword.test.ts`.

**Alcance:** S.

---

### ✅ Checkpoint: backend de `identity` completo
- [x] `npm test` (52/52) y `npm run build` pasan completos.
- [x] Revisado por `code-reviewer` (T2‑T5, una ronda por tarea, todos los hallazgos Required
  aplicados y reverificados en vivo contra el stack Docker real: RBAC, invalidación de
  sesión, hashing/timing, CORS de `/auth` acotado a `FRONTEND_ORIGIN`).

---

## Fase 3 (Frontend conectado al backend real

### T6: Frontend) login/OTP reales

**Descripción:** `SessionContext.login`/`verifyOtp` dejan de leer `data/users.ts` y de
comparar contra el OTP fijo `"123456"`; llaman a `POST /auth/login` y `POST /auth/verify-otp`
del backend real, guardan el JWT en memoria (D7 del plan) y lo usan en las llamadas
subsiguientes. `LoginPage`/`OtpPage` no cambian de UI, solo la fuente de datos.

**Nota descubierta en T2, resuelta con Sofia antes de arrancar T6:** `POST /auth/login`
requiere un campo `role` (RF‑01: seleccionar el rol *antes* de autenticarse; RF‑05/HU‑002‑
CA‑02: se valida contra el rol real del usuario en la verificación del OTP). El
`LoginPage`/`SessionContext.login(email, password)` de `Feat/Front` no tenían ningún
selector de rol. Decisión (2026‑09‑19): el selector de rol **se agrega** a `LoginPage`
(fiel a RF‑01/HU‑001‑CA‑01), quién puede *ser* cada rol lo define exclusivamente el
Administrador al crear/editar usuarios (RF‑45/46, HU‑018, Sprint 4); el selector del login
solo declara qué rol está intentando usar el que se loguea, y el backend lo valida contra
el rol real de la cuenta (HU‑002‑CA‑02, ya implementado en T3). Se agrega con `Tabs` de
`components/ui/` (ya instalado, sin dependencia nueva), 3 pestañas Empleado/Verificador/
Administrador, arriba del formulario de credenciales existente: no una pantalla/ruta
aparte.

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `login(email, password, role)` y `verifyOtp(email, code)`
mismo contrato que ya expone el backend real (T2/T3: sin `attemptId`, `verify-otp` solo
  necesita `email`+`code` porque el backend guarda el OTP y el rol elegido keyed por
  usuario), con manejo de error mapeado a los mensajes que ya muestra `LoginPage`/`OtpPage`.
- [ ] `LoginPage` gana un selector de rol (`Tabs` de `components/ui/`, 3 pestañas) arriba
  del formulario de credenciales existente; `SessionContext.login` pasa a recibir
  `(email, password, role)`.
- [ ] `SessionContext` guarda el JWT y el usuario real devuelto por el backend (ya no del
  array mock); `data/users.ts` deja de ser fuente de verdad para auth (puede seguir
  existiendo para otras pantallas mock ajenas a este sprint).
- [ ] Credenciales inválidas / OTP inválido / rol que no coincide muestran el mismo tipo de
  error que ya maneja la UI (no un cambio de diseño, solo de origen del dato).
- [x] `npm run build` y `npm run lint` (oxlint) pasan (los 4 warnings preexistentes de
  "only-export-components" en archivos de contexto, incluido `SessionContext.tsx`, ya
  estaban antes de este cambio: mismo patrón que `AppDataContext.tsx`, no es una
  regresión de T6).
- [x] `grep -rE "7051|9051|7050|27017|:5984|fabric|mongodb://" frontend/src` sigue sin
  encontrar nada (mismo chequeo de T6/T8 de Sprint 0, el frontend sigue sin hablar
  directo con infraestructura).

**Verificación:**
- [x] Mecánico (sin navegador disponible en este entorno, igual que en T6 de Sprint 0):
  rebuild real del contenedor `frontend`; `curl` confirma que `/` y `/system-status` siguen
  sirviendo `200` (sin romper el diagnóstico de Sprint 0); simulé el preflight `OPTIONS`
  exacto que mandaría el navegador desde `http://localhost:5173` contra
  `POST /auth/login` → `204` con los headers CORS correctos.
- [x] Confirmado por Sofia en navegador real (2026‑09‑19): probó los 3 roles del seed
  (Empleado, Verificador, Administrador) con el selector de rol + credenciales + OTP real
los tres entran al panel correspondiente sin problemas.
- [x] Ronda de `code-reviewer`: encontró que una falla de red (backend caído, CORS
  bloqueado, `VITE_API_URL` mal configurada) hacía que `fetch()` rechazara *antes* de que
  `postAuthJson` armara su propio error, el mensaje que terminaba mostrando la UI era el
  nativo del navegador, en inglés ("Failed to fetch"), violando la norma del proyecto de
  comunicarse con el usuario en español. Corregido: `postAuthJson` ahora atrapa
  específicamente el `fetch()` y lo normaliza a un mensaje en español. También se aplicó
  el hallazgo Optional de una guarda barata en `verifyOtp` (`SessionContext.tsx`) contra
  un `200` con body inesperado sin `token`/`user`, que habría dejado la UI en un estado
  "autenticado" sin usuario y sin poder volver atrás. Re-verificado: `npm run build`/`lint`
  limpios, rebuild del contenedor `frontend`, `/` y `/system-status` siguen en `200`.

**Dependencias:** T3.

**Archivos:** `frontend/src/lib/api.ts`, `frontend/src/context/SessionContext.tsx`,
`frontend/src/pages/LoginPage.tsx` (selector de rol + submit async),
`frontend/src/pages/OtpPage.tsx` (verify async + estado de envío).

**Alcance:** M.

---

### T7: Frontend, logout + cambio de contraseña reales

**Descripción:** `SessionContext.logout`/`changePassword` llaman a `POST /auth/logout` y
`POST /auth/change-password` reales en vez de solo resetear el estado local.

**Criterios de aceptación:**
- [x] `logout` llama al backend (`POST /auth/logout`, invalida la sesión de verdad en
  Mongo) antes de limpiar el estado local; si la llamada falla (backend caído, token ya
  vencido), el `catch` la absorbe y **siempre** limpia el estado local igual: no dejar al
  usuario "atrapado" esperando algo que puede fallar.
- [x] `ChangePasswordDialog` llama al backend real (`POST /auth/change-password`); error
  de contraseña actual incorrecta se muestra en la UI existente sin cambiar su diseño
  (mismo `<p className="text-destructive">` de siempre, ahora con el mensaje real del
  backend en vez del mock).
- [x] `ProtectedRoute`: **alcance aclarado**: ya redirige a `/` cuando `stage` no es
  `"authenticated"` (lógica preexistente, sin cambios). Recargar tras un logout ya
  funciona por diseño (D7: el JWT vive solo en memoria, una recarga siempre resetea a
  `anonymous`, sin código nuevo que agregar). El caso "dejando expirar el JWT sin recargar
  la página" no se pudo verificar de punta a punta: Sprint 1 no tiene ninguna pantalla de
  negocio real conectada al backend todavía (Empleado/Verificador/Administrador siguen con
  datos mock de `Feat/Front`, ver nota de T6/Sprint 0), no hay ninguna llamada autenticada
  real disparándose desde esas rutas hoy que pueda toparse con un 401 mientras la SPA
  sigue montada. Un interceptor global de 401 (para forzar logout ante cualquier llamada
  autenticada que falle) queda como trabajo natural de Sprint 2, cuando existan esas
  llamadas reales: no se inventa acá sin nada real que lo ejercite.

**Verificación:**
- [x] Manual contra el stack real (rebuild de `frontend`, requests simulados con la forma
  exacta que manda el navegador: mismos headers/Content-Type/ausencia de body que usan
  `api.logout`/`api.changePassword`): login+verify-otp real → JWT; `POST /auth/logout` con
  ese JWT → `204`; `GET /auth/me` con el mismo JWT después → `401` (invalidación real,
  igual que T4). `POST /auth/change-password` real → `200`; login con la contraseña vieja
  falla, con la nueva funciona; se restauró la contraseña de desarrollo al final.
- [x] Preflight `OPTIONS` real desde `http://localhost:5173` contra `/auth/logout` y
  `/auth/change-password` (con el header `Authorization` en `Access-Control-Request-
  Headers`) → `204` con los headers CORS correctos en ambos.
- [x] `npm run build`/`npm run lint` del frontend limpios (mismos 4 warnings preexistentes
  de "only-export-components", ninguno nuevo).
- [x] Ronda de `code-reviewer` (verdict: APPROVE, sin Required): confirmó que el
  `try/catch` de `logout()` garantiza `setState(initialState)` en todos los casos donde la
  promesa de `fetch` se resuelve o rechaza, y que la decisión de no construir un
  interceptor global de 401 es razonable para el alcance actual (solo 2 endpoints usan
  `requireAuth()` hoy, y ninguna pantalla de negocio real depende de eso todavía). Se
  aplicaron los 2 hallazgos Optional, ambos baratos: (1) `postAuthJson` no tenía timeout, 
  un servidor que acepta la conexión pero nunca responde dejaba la promesa colgada para
  siempre (botón deshabilitado sin salida); se agregó `signal: AbortSignal.timeout(10_000)`
  (nativo, sin librería nueva). (2) `ChangePasswordDialog` podía reabrirse mientras una
  request seguía en vuelo, mostrando el resultado de la request vieja en el diálogo
  "nuevo"; se agregó una guarda en `onOpenChange` que ignora el cierre mientras
  `isSubmitting` es `true`. Re-verificado: build/lint limpios, rebuild del contenedor
  `frontend`, ciclo completo login→logout→`/auth/me` (401) repetido con éxito.

**Dependencias:** T4, T5, T6.

**Archivos:** `frontend/src/lib/api.ts` (`logout`, `changePassword`, `postAuthJson` ahora
acepta un `token` opcional para el header `Authorization`), `frontend/src/context/SessionContext.tsx`
(`logout`/`changePassword` ahora async y reales), `frontend/src/components/shared/ChangePasswordDialog.tsx`
(submit async + estado de envío), `frontend/src/components/shared/UserMenu.tsx` (el botón
de logout ahora espera la promesa antes de navegar, cambio menor no listado originalmente,
necesario porque `logout()` dejó de ser síncrono).

**Alcance:** S.

---

### ✅ Checkpoint: frontend conectado (navegador)
- [ ] Flujo completo probado en navegador real por Sofia: login, OTP, panel por rol,
  cambio de contraseña, logout, y que una ruta protegida rechaza el acceso tras el logout.
- [ ] `npm run build`/`lint` de frontend y backend pasan.

---

## Fase 4: Documentación y cierre

### T8: Documentación, env vars y trazabilidad SPEC

**Descripción:** Dejar todo documentado igual que se hizo al cerrar cada tarea de Sprint 0:
env vars nuevas, comandos nuevos si aplica, y la trazabilidad de RF/RNF en `SPEC.md`.

**Criterios de aceptación:**
- [x] `docker/.env.example`/`backend/.env.example` documentan todas las env vars nuevas
  (`JWT_SECRET`, `JWT_EXPIRES_MINUTES`: no `JWT_EXPIRES_IN`, ver nota de cambio; `SMTP_*`,
  `OTP_TTL_MINUTES`, `OTP_MAX_ATTEMPTS`, `BCRYPT_ROUNDS`, `FRONTEND_ORIGIN`); ya se habían
  ido documentando tarea por tarea (T1‑T3), confirmado ahora que están todas juntas.
  `frontend/.env.example` no necesitó nada nuevo: `identity` no le agregó ninguna env var
  al frontend, solo llamadas nuevas a la misma `VITE_API_URL` de siempre.
- [x] `backend/README.md` reescrito: contrato completo de `/auth/*` (tabla ruta/auth/body/
  respuesta/errores), cómo funciona la sesión (JWT+`sessions`+TTL), cómo correr el seed,
  cómo probar sin SMTP real. También se corrigieron dos afirmaciones que habían quedado
  obsoletas ("sin lógica de negocio todavía" y "el frontend no llama a ningún backend": 
  ambas falsas después de T1‑T7).
- [x] `claude_docs/SPEC.md`: nota de estado de implementación agregada junto al mapa de
  capacidades (§3) marcando RF‑01…07, RF‑52, RF‑53 y RNF‑01, 02, 03, 07 como implementados;
  la fila del Decreto 2364/2012 Art. 6 (§17) pasó de "Cubierto parcialmente" a
  "Implementado"; las preguntas abiertas #1 y #2 (§18) resueltas con las decisiones D1/D2,
  con nota de cambio explicando que D1 relaja (no contradice) RF‑003. Fecha de "Última
  actualización" del documento avanzada con el detalle del cambio.
- [x] `CLAUDE.md`: **corrección respecto al AC original**, `npm run seed` en realidad NO
  estaba en la tabla de comandos de `backend/` todavía (el AC asumía que sí); se agregó
  ahí y en la tabla equivalente de `claude_docs/SPEC.md` §5. Ningún comando nuevo de nivel
  raíz.

**Verificación:**
- [x] Manual: `bash docker/down.sh` (ciclo completo, no solo los servicios de la app) +
  `bash docker/up.sh` desde cero (red Fabric + chaincode de ejemplo + Mongo/backend/
  frontend, todo reconstruido) + `npm run seed` + smoke test real: `login` → OTP del log
  → `verify-otp` → JWT → `/auth/me` → `logout` → `/auth/me` de nuevo (`401`, confirma
  invalidación). `/health` y `/fabric/ping` (Sprint 0) sin regresión; `/` y
  `/system-status` del frontend en `200`. `npm run build`/`test` (52/52)/`lint` del
  backend, todos en verde en esta misma corrida final.
- [x] Ronda de `code-reviewer` (verdict: APPROVE, sin Required) enfocada en exactitud de
  la documentación, no estilo: releyó `routes/auth.ts`/`authService.ts`/`config/auth.ts`
  completos y confirmó que la tabla de contrato de `/auth/*`, la nota de "Estado de
  implementación" de `SPEC.md` §3, y la resolución de las preguntas abiertas #1/#2 (§18)
  coinciden exactamente con el código y con las decisiones D1/D2 del plan, nada
  documentado que el código no haga, nada implementado que quedara sin documentar. Único
  hallazgo (barato, aplicado): la lista corta de comandos al inicio de
  `backend/README.md` no mencionaba `npm run seed` aunque ya estaba en las tablas de
  `CLAUDE.md`/`SPEC.md` §5, agregada ahí también.

**Dependencias:** T1‑T7.

**Archivos:** `backend/README.md`, `claude_docs/SPEC.md`, `CLAUDE.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑001…004 terminadas (DoD, SPEC §10.2)
- [x] Los 8 escenarios Gherkin de HU‑001…004 (CA‑01/CA‑02 cada una) en PASS: cubiertos por
  los tests de T2‑T5 (52/52) y por la verificación manual de punta a punta de T8.
- [x] RF‑01…07, RF‑52, RF‑53 y RNF‑01, 02, 03, 07 marcados como implementados en
  `claude_docs/SPEC.md`.
- [x] Entorno verificado en Docker Compose: ciclo `down.sh`→`up.sh` desde cero en T8.
- [ ] PR abierto y revisado; mensaje de commit redactado (sin commit automático): pendiente
  de Sofia (ya mergeado `feat/blockchain` → `main` para Sprint 0; Sprint 1 queda por
  mergear).
- [ ] Aceptación de dirección/codirección registrada: fuera del alcance de este repo.
