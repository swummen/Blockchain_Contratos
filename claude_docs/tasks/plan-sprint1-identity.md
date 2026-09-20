# Plan de implementación: Sprint 1 — módulo `identity` (HU‑001…004)

> Fuente de verdad: `claude_docs/SPEC.md` (capacidad `identity`, línea 108; roadmap de sprints,
> línea 125‑129; RF‑01…07, RF‑52, RF‑53; RNF‑01, 02, 03, 07; HU‑001…004, CA Gherkin
> HU‑001…004 en la sección 16).
> Plan **aprobado 2026‑09‑19** (D1/D2 confirmados con Sofia, ver más abajo).
> Módulo: `identity` · Épica: EP‑01 · HU: **HU‑001, HU‑002, HU‑003, HU‑004** · Puntos: 3+5+1+2=11.
>
> **Nota de alcance:** el módulo `identity` del mapa de capacidades también incluye
> RF‑43…47 (alta/edición/baja de usuarios), pero esa historia (**HU‑018**) está agendada
> para **Sprint 4** junto a `administration`. Este sprint NO construye gestión de usuarios;
> solo consume una tabla de usuarios ya sembrada (ver D9) para poder loguearse.

## Resumen

Reemplazar el login/2FA/RBAC/logout/cambio-de-contraseña 100% mockeado del frontend
(`SessionContext.tsx`, OTP fijo `"123456"`, sin validar contraseña, sin persistencia) por
un flujo real: `backend` con usuarios en MongoDB (hash+salt), OTP por correo corporativo,
sesión JWT con invalidación real en el logout, y middleware RBAC — cableado al frontend
existente sin tocar su UI/routing (`LoginPage`, `OtpPage`, `ProtectedRoute`, `AppRoutes` ya
están bien armados, solo hay que dejar de leer `data/users.ts` como fuente de verdad).

No se toca `documents`/`ledger` (Sprint 2) ni la gestión de usuarios del Administrador
(Sprint 4, HU‑018) — este sprint es puramente el candado de acceso.

## Decisiones de arquitectura

| # | Decisión | Razón |
|---|---|---|
| D1 | **Canal de 2FA: correo registrado del usuario** (SMTP vía `nodemailer`), **no necesariamente corporativo** por ahora — es el valor de `email` que ya tiene cada usuario en el seed (D9), para poder probar el flujo con cualquier bandeja real durante el desarrollo. Resuelve la pregunta abierta #1 de `SPEC.md` (línea 692) **para este sprint**; queda pendiente evaluar más adelante si se exige que sea el correo corporativo exclusivamente (nota ya presente en el propio `Requisitos_Historias_Usuario...md`, RF‑003: "validación pendiente... sobre el canal exclusivo de token por correo"). | Decisión explícita de Sofia (2026‑09‑19): "por ahora al correo registrado para hacer pruebas, más adelante se mira la posibilidad de usar el correo corporativo exclusivamente". El servicio de OTP queda desacoplado del canal de envío, así que restringir a dominio corporativo después es un cambio de validación, no de arquitectura. |
| D2 | **Expiración y reintentos del OTP** (resuelve la pregunta abierta #2, línea 693): código de 6 dígitos, expira a los **5 minutos**, máximo **5 intentos** de validación por código. Agotados los intentos o vencido el tiempo, hay que volver a enviar credenciales (nuevo login) para recibir un código nuevo — eso *es* el "bloqueo temporal del proceso" que pide RN‑02 de `RF-004` (`docs/md/Requisitos_Historias_Usuario_MVP_Blockchain_Contratos_2.md:291`): no hay una re-validación infinita del mismo código, hay que reiniciar el login. | Se revisaron `docs/md/Requisitos_Historias_Usuario_MVP_Blockchain_Contratos_2.md` y `docs/md/Trabajo de grado final.md`: ninguno fija un número — solo las reglas cualitativas RN‑01 ("tiempo de expiración definido, un solo uso") y RN‑02 ("número máximo de intentos antes de bloquear temporalmente el proceso"), más CA‑01 de RF‑003 que exige enviar el token en menos de un minuto (tiempo de *envío*, no de expiración). Ante la ausencia de un valor fijado, se adoptan 5 min / 5 intentos como default razonable para un sistema interno — confirmado con Sofia (2026‑09‑19: "adaptalo a lo que creas mejor"). |
| D3 | Hash de contraseñas con **`bcryptjs`** (implementación pura en JS, sin `node-gyp`) en vez de `bcrypt` nativo. | Evita fricción de compilación nativa en Alpine/Windows — mismo tipo de dolor que ya mordió con otras dependencias nativas en este proyecto. Costo configurable por `BCRYPT_ROUNDS` (env), default 10. |
| D4 | Sesión con **JWT de vida corta** (`JWT_EXPIRES_IN`, default 60 min) + **registro de sesión activa en Mongo** (colección `sessions`, indexada por `jti`) para poder invalidarla de verdad en el logout. | Un JWT puramente stateless no se puede invalidar antes de su expiración — y RF‑07/HU‑003‑CA‑02 exige exactamente eso ("una sesión cerrada no se reutiliza"). El middleware RBAC valida firma+expiración del JWT **y** que el `jti` siga existiendo en Mongo; `logout` borra el documento. |
| D5 | Colección **`otp_codes`** separada de `users` (no embebida), con **índice TTL de Mongo** sobre `expiresAt`. | Mongo limpia solo los códigos vencidos (función nativa de la DB, rung 4 de la escalera) en vez de necesitar un cron de limpieza a mano. |
| D6 | Envío de correo con `nodemailer` vía SMTP configurado por env (`SMTP_HOST/PORT/USER/PASSWORD/FROM`). Si esas variables no están seteadas, el servicio **loguea el OTP a consola** en vez de fallar (con una advertencia explícita de que es un fallback de desarrollo, nunca silencioso). | Permite probar el flujo completo en desarrollo sin depender de credenciales SMTP reales desde el día uno, sin esconder que es un atajo temporal. |
| D7 | El JWT viaja en el header `Authorization: Bearer <token>` (no cookies); el frontend lo guarda **en memoria** (estado de `SessionContext`), no en `localStorage`. | Evita la complejidad de CORS con credenciales/cookies cross-site. Guardarlo solo en memoria evita dejarlo expuesto a un XSS entre recargas; se pierde la sesión al recargar la página — aceptable, no hay RF que pida "recordarme". |
| D8 | CORS de `/auth` restringido a un origen explícito (`FRONTEND_ORIGIN`, nueva env var — ej. `http://localhost:5173`), **no** el wildcard `*` que usan `/health`/`/fabric`. | `/auth` es el primer endpoint de negocio real (credenciales, sesión); el comentario ya dejado en `backend/src/server.ts` (T6, Sprint 0) anticipaba exactamente este momento. |
| D9 | Usuarios de prueba sembrados por script (`backend/src/scripts/seedUsers.ts`, `npm run seed`): 1 usuario por rol, contraseña de desarrollo documentada en `backend/README.md` (nunca como secreto real en el repo). | Sin esto no hay con qué loguearse — HU‑018 (alta real de usuarios por el Administrador) es recién Sprint 4. Este seed se descarta/reemplaza cuando llegue esa historia. |

## Preguntas confirmadas (2026‑09‑19)

| # | Pregunta | Resolución |
|---|---|---|
| 1 | ¿El 2FA es solo por correo corporativo (D1), o hay que dejar la puerta abierta a SMS/app ya en este sprint? | Correo **registrado** del usuario (no necesariamente corporativo) por ahora, para poder probar; se evalúa exclusividad corporativa más adelante. |
| 2 | ¿Se aceptan los valores por defecto de D2 (5 min de expiración, 5 intentos), o Sofia tiene otros del SRS/PPS que no estén en `SPEC.md`? | Sin valor numérico en las fuentes (revisado `Requisitos_...md` y `Trabajo de grado final.md`) — se adoptan 5 min / 5 intentos. |
| 3 | ¿Hay credenciales SMTP reales para probar el envío, o se arranca con el fallback de consola de D6 todo el sprint? | Pendiente — no bloquea; se usa el fallback de consola hasta que haya credenciales. |

## Grafo de dependencias

```
T1 (modelo de usuarios + seed)
 └── T2 (login paso 1: credenciales + envío de OTP)
       └── T3 (verificación de OTP + emisión de sesión/JWT)
             ├── T4 (middleware RBAC + logout)
             │     └── T5 (cambio de contraseña)
             └── T6 (frontend: login/OTP reales)
                   └── T7 (frontend: logout + cambio de contraseña reales)
T4, T5, T7 ──> T8 (documentación + cierre)
```

Orden de construcción: **T1 → T2 → T3 → (checkpoint: login completo por curl) → T4 → T5 →
(checkpoint: backend completo con tests) → T6 → T7 → (checkpoint: frontend conectado en
navegador) → T8 → (checkpoint DoD)**.

## Rebanado vertical

- **T1** hay usuarios reales en Mongo con contraseña hasheada (verificable con `mongosh`).
- **T2** `POST /auth/login` con credenciales válidas dispara un OTP (verificable en el log de consola en dev, o en la bandeja real si hay SMTP).
- **T3** `POST /auth/verify-otp` con el código correcto devuelve un JWT válido — *slice de mayor riesgo del sprint: primera vez que el backend emite y valida sesión real*.
- **T4** una ruta protegida de prueba responde 401 sin JWT/con JWT de una sesión ya cerrada, y 200 con uno válido; `POST /auth/logout` la invalida de verdad.
- **T5** `POST /auth/change-password` cambia el hash en Mongo, valida la contraseña actual.
- **T6** el login/OTP del navegador hablan con el backend real (ya no con `data/users.ts`).
- **T7** logout y cambio de contraseña reales desde la UI existente.
- **T8** una sola orden (`docker/up.sh` + seed) deja todo probado de punta a punta; documentación y trazabilidad SPEC actualizadas.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sin SMTP real disponible durante el desarrollo, no se puede probar el envío de correo de punta a punta. | Medio | D6: fallback de consola en dev, documentado explícitamente; se prueba con SMTP real antes de dar el sprint por cerrado si Sofia consigue credenciales. |
| Decisión D4 (sesión en Mongo + JWT) agrega una escritura/lectura extra por request protegido. | Bajo | Es una consulta indexada por `jti` (clave primaria de facto); impacto de latencia despreciable a esta escala; no hay RNF de rendimiento sobre `identity`. |
| `bcryptjs` es más lento que `bcrypt` nativo en cómputo puro. | Bajo | Irrelevante al volumen de usuarios de un sistema interno; evita el dolor de compilación nativa, que ya costó tiempo en otras libs de este proyecto. |
| CORS mal configurado en `/auth` (D8) bloquea el login real desde el navegador, igual que pasó con `/health`/`/fabric` en Sprint 0 (T6). | Medio | Mismo patrón ya resuelto: middleware scoped, mensaje de error explícito, se prueba con `curl` y en navegador antes de cerrar T2/T6. |
| Los valores de D1/D2 son decisiones de negocio, no técnicas — construir sobre un supuesto equivocado obliga a rehacer T2/T3. | Alto | No se empieza T2 sin la confirmación de Sofia (ver "Preguntas a confirmar"); T1 no depende de ninguna de las dos y puede arrancar ya. |

## Lista de tareas

Ver `claude_docs/tasks/todo-sprint1-identity.md`. Índice:

| # | Título | Alcance | Depende de | RF/RNF |
|---|---|---|---|---|
| T1 | Modelo de usuarios en Mongo + seed | M | — | RF‑01, RF‑02 |
| T2 | Login paso 1: credenciales + envío de OTP | M | T1 | RF‑02, RF‑03 / RNF‑01, 02 |
| T3 | Verificación de OTP + sesión JWT | M | T2 | RF‑04, RF‑05, RF‑06 / RNF‑02, 03 |
| — | **Checkpoint: login completo (backend)** | | | |
| T4 | Middleware RBAC + logout | M | T3 | RF‑05, RF‑07 / RNF‑03, 07 |
| T5 | Cambio de contraseña | S | T4 | RF‑52, RF‑53 / RNF‑01 |
| — | **Checkpoint: backend de `identity` completo** | | | |
| T6 | Frontend: login/OTP reales | M | T3 | HU‑001, HU‑002 |
| T7 | Frontend: logout + cambio de contraseña reales | S | T4, T5, T6 | HU‑003, HU‑004 |
| — | **Checkpoint: frontend conectado (navegador)** | | | |
| T8 | Documentación, env vars y trazabilidad SPEC | S | T1‑T7 | — |
| — | **Checkpoint: HU‑001…004 terminadas (DoD)** | | | |

## Definición de Terminado (HU‑001…004) — SPEC §10.2

1. Revisión por pares + merge a `main` (PR aprobado).
2. Casos del PPS de HU‑001…004 (8 escenarios Gherkin CA‑01/CA‑02) en PASS.
3. SRS/trazabilidad: marcar RF‑01…07, RF‑52, RF‑53 y RNF‑01, 02, 03, 07 como implementados.
4. Desplegado y verificado en entorno de prueba (Docker Compose, `docker/up.sh` + seed).
5. Aceptación de dirección/codirección registrada.
