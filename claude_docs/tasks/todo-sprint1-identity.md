# TODO — Sprint 1 · módulo `identity` · HU‑001…004

Plan: `claude_docs/tasks/plan-sprint1-identity.md` (**aprobado 2026‑09‑19**, D1/D2 confirmados).
Fuente de verdad: `claude_docs/SPEC.md`.
Estado: **T1 completo y verificado. Arrancando T2.**
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## Fase 1 — Backend: login y sesión

### T1: Modelo de usuarios en Mongo + seed

**Descripción:** Colección `users` en MongoDB (contraseña con hash+salt vía `bcryptjs`,
rol, correo, estado) y script de seed que seguirá siendo la única fuente de usuarios de
prueba hasta que HU‑018 (Sprint 4) le dé al Administrador el CRUD real. Es la base de todo
el sprint — sin usuarios reales no hay con qué loguearse.

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
  patrón de mock de `mongoClient` que ya usa `health.test.ts`) — 14/14 tests del backend en
  verde.
- [x] Build: `npm run build` sin errores de `tsc`. `npm run lint` (oxlint) también en 0
  warnings/errores.
- [x] Ronda de `code-reviewer`: encontró que faltaba el índice único de `email` sobre la
  colección `users` (ya modelado como `<<unique>>` en `docs/uml/03-diagrama-mer.puml:8` pero
  no aplicado en Mongo) y que `findUserByEmail`/`insertUserIfMissing` no normalizaban
  mayúsculas/espacios del email — con datos de seed en minúscula pasaba desapercibido, pero
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

### T2: Login paso 1 — credenciales + envío de OTP

**Descripción:** `POST /auth/login` valida usuario+contraseña, genera un código OTP de 6
dígitos, lo guarda hasheado en la colección `otp_codes` (con TTL) y lo envía al correo
registrado del usuario (`nodemailer`, con fallback a consola en dev si no hay SMTP
configurado — decisión D6 del plan; canal confirmado en D1, correo registrado no
necesariamente corporativo por ahora).

**Criterios de aceptación:**
- [ ] `POST /auth/login` con credenciales válidas responde `200` con un identificador de
  intento (no el JWT todavía) y dispara el envío del OTP.
- [ ] Credenciales inválidas (usuario no existe o contraseña incorrecta) responden con el
  mismo mensaje genérico sin indicar cuál dato falló (RF‑002 CA‑02, ya citado en
  `claude_docs/SPEC.md:321`).
- [ ] El código OTP se guarda **hasheado** (no en texto plano) en `otp_codes`, con índice
  TTL sobre `expiresAt` (D5 del plan).
- [ ] `backend/src/services/emailService.ts` envía el correo si `SMTP_*` está seteado;
  si no, loguea el código a consola con una advertencia explícita de "fallback de
  desarrollo" (nunca en silencio).
- [ ] `backend/.env.example` documenta `SMTP_HOST/PORT/USER/PASSWORD/FROM` y `OTP_TTL_MINUTES`.

**Verificación:**
- [ ] Manual: `curl -X POST localhost:8080/auth/login` con credenciales del seed → `200` +
  código visible en el log (sin SMTP configurado en dev).
- [ ] Manual: credenciales inválidas → mismo mensaje de error genérico en ambos casos
  (usuario inexistente vs. contraseña incorrecta) — confirmar que no se puede distinguir
  cuál falló por el texto de la respuesta.
- [ ] Tests: Jest con `emailService` mockeado (mismo patrón que `fabric.test.ts` mockeando
  el gateway) — casos: credenciales válidas, usuario inexistente, contraseña incorrecta.
- [ ] Build: `npm run build`.

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
el logout (T4). **Slice de mayor riesgo del sprint** — primera vez que el backend emite y
valida una sesión real. Expiración/reintentos ya confirmados en D2 (5 min / 5 intentos).

**Criterios de aceptación:**
- [ ] `POST /auth/verify-otp` con el código correcto y vigente responde `200` con un JWT
  (payload: `sub`, `role`, `jti`, `exp`) y crea el documento de sesión en Mongo.
- [ ] Código incorrecto incrementa el contador de intentos; al llegar al máximo (D2, a
  confirmar) el intento de login completo se invalida y hay que volver a `POST /auth/login`.
- [ ] Código vencido (TTL de Mongo ya lo limpió, o `expiresAt` ya pasó) responde con un
  error claro, no un 500.
- [ ] Rol seleccionado en el login (paso 1) que no coincide con el rol real del usuario:
  se deniega el acceso con mensaje de error (HU‑002 CA‑02).
- [ ] `JWT_SECRET`/`JWT_EXPIRES_IN` en `backend/.env.example`; sin `JWT_SECRET` seteado el
  backend falla al arrancar con un mensaje claro (no un JWT firmado con un secreto vacío).

**Verificación:**
- [ ] Manual: flujo completo `login` → `verify-otp` con el código real del log → `200` con
  JWT; decodificar el JWT (jwt.io o similar) y confirmar que el payload trae `role` y `jti`.
- [ ] Manual: código incorrecto repetido hasta el máximo de intentos → el sistema exige
  loguearse de nuevo.
- [ ] Tests: Jest — código correcto, código incorrecto, código vencido, rol no coincide,
  máximo de intentos agotado.
- [ ] Build: `npm run build`.

**Dependencias:** T2.

**Archivos:** `backend/src/routes/auth.ts` (ruta nueva), `backend/src/services/authService.ts`
(ampliado), `backend/src/repositories/sessionRepository.ts`, `backend/tests/auth.otp.test.ts`.

**Alcance:** M.

---

### ✅ Checkpoint: login completo (backend)
- [ ] `login` → `verify-otp` de punta a punta por `curl`, JWT válido.
- [ ] Casos de error (credenciales, OTP, rol) cubiertos por tests.
- [ ] Revisado por `code-reviewer` (foco: manejo de secretos, mensajes que no filtran
  información, timing-safe compare del hash del OTP si aplica).

---

## Fase 2 — Sesión, RBAC, logout, cambio de contraseña

### T4: Middleware RBAC + logout

**Descripción:** Middleware que valida el JWT (firma + expiración) y que la sesión
(`jti`) siga viva en Mongo, exponiendo `req.user` a las rutas protegidas; se aplica a una
ruta de prueba para demostrarlo. `POST /auth/logout` borra el documento de sesión —
invalidación real, no solo "olvidar el token del lado del cliente".

**Criterios de aceptación:**
- [ ] `backend/src/middlewares/auth.ts` exporta un middleware que responde `401` sin JWT,
  con JWT inválido/expirado, o con JWT válido pero sin sesión viva en Mongo (ya cerrada).
- [ ] Variante con roles: el middleware acepta una lista de roles permitidos y responde
  `403` si el rol del JWT no está en la lista (RF‑05, RNF‑03).
- [ ] `POST /auth/logout` (requiere JWT válido) borra la sesión de Mongo; una llamada
  posterior a una ruta protegida con el mismo JWT ya usado responde `401` (HU‑003 CA‑02).
- [ ] Se agrega una ruta de prueba protegida (o se reutiliza `/fabric/ping` acotándolo a un
  rol) para demostrar el middleware en un caso real, no solo en un test aislado.

**Verificación:**
- [ ] Manual: `curl` a la ruta protegida sin JWT → `401`; con JWT → `200`; `logout`; mismo
  JWT de nuevo → `401`.
- [ ] Tests: Jest — sin JWT, JWT inválido, JWT expirado, rol no permitido, logout +
  reutilización del mismo JWT.
- [ ] Build: `npm run build`.

**Dependencias:** T3.

**Archivos:** `backend/src/middlewares/auth.ts`, `backend/src/routes/auth.ts` (ruta
`logout`), `backend/tests/auth.middleware.test.ts`, `backend/tests/auth.logout.test.ts`.

**Alcance:** M.

---

### T5: Cambio de contraseña

**Descripción:** `POST /auth/change-password` (requiere sesión válida) valida la
contraseña actual, hashea la nueva con `bcryptjs` y la guarda.

**Criterios de aceptación:**
- [ ] Requiere JWT válido (pasa por el middleware de T4); usa `req.user.sub` para saber
  sobre qué usuario actuar (no se puede cambiar la contraseña de otro usuario pasando su id).
- [ ] Contraseña actual incorrecta: `400`/`401` con mensaje claro, no cambia nada.
- [ ] Contraseña actual correcta + nueva válida: actualiza el hash en Mongo.

**Verificación:**
- [ ] Manual: login con la contraseña vieja falla tras el cambio; funciona con la nueva.
- [ ] Tests: Jest — contraseña actual correcta, incorrecta, sin sesión válida.
- [ ] Build: `npm run build`.

**Dependencias:** T4.

**Archivos:** `backend/src/routes/auth.ts` (ruta nueva), `backend/src/services/authService.ts`
(ampliado), `backend/tests/auth.changePassword.test.ts`.

**Alcance:** S.

---

### ✅ Checkpoint: backend de `identity` completo
- [ ] `npm test` y `npm run build` pasan completos.
- [ ] Revisado por `code-reviewer` (foco: RBAC, invalidación de sesión, hashing, CORS de
  `/auth` acotado a `FRONTEND_ORIGIN` — no heredar el wildcard de `/health`/`/fabric`).

---

## Fase 3 — Frontend conectado al backend real

### T6: Frontend — login/OTP reales

**Descripción:** `SessionContext.login`/`verifyOtp` dejan de leer `data/users.ts` y de
comparar contra el OTP fijo `"123456"`; llaman a `POST /auth/login` y `POST /auth/verify-otp`
del backend real, guardan el JWT en memoria (D7 del plan) y lo usan en las llamadas
subsiguientes. `LoginPage`/`OtpPage` no cambian de UI, solo la fuente de datos.

**Criterios de aceptación:**
- [ ] `frontend/src/lib/api.ts` gana `login(email, password)` y `verifyOtp(attemptId, code)`
  (o el contrato que defina T2/T3), con manejo de error mapeado a los mensajes que ya
  muestra `LoginPage`/`OtpPage`.
- [ ] `SessionContext` guarda el JWT y el usuario real devuelto por el backend (ya no del
  array mock); `data/users.ts` deja de ser fuente de verdad para auth (puede seguir
  existiendo para otras pantallas mock ajenas a este sprint).
- [ ] Credenciales inválidas / OTP inválido muestran el mismo tipo de error que ya
  maneja la UI (no un cambio de diseño, solo de origen del dato).
- [ ] `npm run build` y `npm run lint` (oxlint) pasan.
- [ ] `grep -rE "7051|9051|7050|27017|:5984|fabric|mongodb://" frontend/src` sigue sin
  encontrar nada (mismo chequeo de T6/T8 de Sprint 0 — el frontend sigue sin hablar
  directo con infraestructura).

**Verificación:**
- [ ] Manual en navegador: login con un usuario del seed → pide OTP → código real (del log
  en dev, o del correo si hay SMTP) → entra al panel del rol correspondiente.
- [ ] Manual: credenciales o rol equivocados muestran error sin colgar la UI.

**Dependencias:** T3.

**Archivos:** `frontend/src/lib/api.ts`, `frontend/src/context/SessionContext.tsx`,
`frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/OtpPage.tsx` (ajustes mínimos de
wiring, no de UI).

**Alcance:** M.

---

### T7: Frontend — logout + cambio de contraseña reales

**Descripción:** `SessionContext.logout`/`changePassword` llaman a `POST /auth/logout` y
`POST /auth/change-password` reales en vez de solo resetear el estado local.

**Criterios de aceptación:**
- [ ] `logout` llama al backend antes de limpiar el estado local; si la llamada falla,
  igual limpia la sesión del lado del cliente (no dejar al usuario "atrapado").
- [ ] `ChangePasswordDialog` llama al backend real; error de contraseña actual incorrecta
  se muestra en la UI existente sin cambiar su diseño.
- [ ] `ProtectedRoute` redirige a `/` si el JWT ya no es válido (probar recargando tras un
  logout, o dejando expirar el JWT si el tiempo de expiración de dev es corto).

**Verificación:**
- [ ] Manual en navegador: logout → intentar volver a una ruta protegida con el botón
  "atrás" del navegador → redirige al login (HU‑003 CA‑02).
- [ ] Manual: cambio de contraseña exitoso y fallido, ambos con feedback visible.

**Dependencias:** T4, T5, T6.

**Archivos:** `frontend/src/context/SessionContext.tsx`, `frontend/src/components/shared/ChangePasswordDialog.tsx`.

**Alcance:** S.

---

### ✅ Checkpoint: frontend conectado (navegador)
- [ ] Flujo completo probado en navegador real por Sofia: login, OTP, panel por rol,
  cambio de contraseña, logout, y que una ruta protegida rechaza el acceso tras el logout.
- [ ] `npm run build`/`lint` de frontend y backend pasan.

---

## Fase 4 — Documentación y cierre

### T8: Documentación, env vars y trazabilidad SPEC

**Descripción:** Dejar todo documentado igual que se hizo al cerrar cada tarea de Sprint 0:
env vars nuevas, comandos nuevos si aplica, y la trazabilidad de RF/RNF en `SPEC.md`.

**Criterios de aceptación:**
- [ ] `docker/.env.example`/`backend/.env.example`/`frontend/.env.example` documentan
  todas las env vars nuevas (`JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_*`, `OTP_TTL_MINUTES`,
  `BCRYPT_ROUNDS`, `FRONTEND_ORIGIN`).
- [ ] `backend/README.md` documenta el flujo de auth para quien retome el proyecto
  (contrato de `/auth/*`, cómo correr el seed, cómo probar sin SMTP real).
- [ ] `claude_docs/SPEC.md`: marcar RF‑01…07, RF‑52, RF‑53 y RNF‑01, 02, 03, 07 como
  implementados en la sección de trazabilidad; resolver las preguntas abiertas #1 y #2
  (líneas 692‑693) con lo que finalmente se haya confirmado (D1/D2), con nota de cambio.
- [ ] `CLAUDE.md` (si aplica): ningún comando nuevo de nivel raíz, solo `npm run seed` ya
  cubierto por la tabla de comandos existente de `backend/`.

**Verificación:**
- [ ] Manual: `docker/up.sh` desde cero + `npm run seed` + smoke manual del flujo completo.

**Dependencias:** T1‑T7.

**Archivos:** `docker/.env.example`, `backend/.env.example`, `frontend/.env.example`,
`backend/README.md`, `claude_docs/SPEC.md`.

**Alcance:** S.

---

### ✅ Checkpoint: HU‑001…004 terminadas (DoD — SPEC §10.2)
- [ ] Los 8 escenarios Gherkin de HU‑001…004 (CA‑01/CA‑02 cada una) en PASS.
- [ ] RF‑01…07, RF‑52, RF‑53 y RNF‑01, 02, 03, 07 marcados como implementados.
- [ ] Entorno verificado en Docker Compose.
- [ ] PR abierto y revisado; mensaje de commit redactado (sin commit automático).
- [ ] Aceptación de dirección/codirección registrada.
