# Plan de implementación: Sprint 4 — módulo `administration` + consultas restantes
# (HU‑008, 009, 015…020)

> Fuente de verdad: `claude_docs/SPEC.md` (mapa de capacidades §3, modelo de dominio §4.1,
> RF‑18…22/37…51 §13, RNF relevantes §14, HU‑008/009/015…020 §15, Gherkin §16).
> Plan propuesto **2026‑10‑08**. Sprint 0‑3 ya cerrados y mergeados a `main`.

## Resumen

Este sprint no abre un módulo nuevo — cierra el **alcance de lectura que los tres
sprints anteriores dejaron pendiente a propósito** (D6 de Sprint 2, "Alcance exacto" de
Sprint 3): cada módulo construyó su escritura real, pero ninguno construyó todavía su
consulta/listado completo. Sprint 4 junta esas piezas sueltas (RF‑18…22 de `documents`,
RF‑37…40 de `verification`) con el módulo `administration` en sí (panel, resumen,
gestión de usuarios, consulta administrativa) — por eso el mapa de capacidades (§3) lo
agrupa como "`administration` + consultas restantes", no un módulo aislado.

**Alcance exacto:**
- RF‑18…22 (HU‑008/009): el Empleado ve **sus propios** documentos y su propia
  trazabilidad — nunca la de otro Empleado (HU‑009‑CA‑02).
- RF‑37…40 (HU‑015/016): el Verificador ve **todos** los documentos y **toda** la
  trazabilidad — ya tiene un listado mínimo de documentos (D8 de Sprint 3); este sprint
  completa el campo de huella según permisos (ya resuelto, RF‑27) y agrega la
  trazabilidad general, que no existe en ninguna forma todavía.
- RF‑41…51 (HU‑017/018/019/020): panel del Administrador, gestión de usuarios (crear,
  editar, desactivar — RF‑43…47, la porción de `identity` que quedó pendiente desde
  Sprint 1), y las mismas consultas de documentos/trazabilidad que el Verificador pero
  con el mismo o mayor nivel de detalle (HU‑020‑CA‑02).

## Decisiones de arquitectura

| # | Decisión | Razón |
|---|---|---|
| D1 | El chaincode gana dos funciones de lectura nuevas: `GetDocumentEvents(ctx, documentID) ([]*Event, error)` (eventos de **un** documento, vía `GetStateByPartialCompositeKey("event", []string{documentID})`) y `GetAllEvents(ctx) ([]*Event, error)` (eventos de **todos** los documentos, mismo método pero sin atributos — `GetStateByPartialCompositeKey("event", []string{})`). Ninguna de las dos recibe el PDF ni compara nada — son lectura pura del world state. | RF‑21/22 (trazabilidad de un documento) y RF‑39/40/50/51 (trazabilidad general) necesitan leer eventos — algo que el chaincode no expone todavía (Sprint 2/3 lo dejaron pendiente a propósito, D6/D6 respectivamente). Dos funciones, no una con un parámetro opcional: son dos formas de iterar genuinamente distintas (clave compuesta completa vs. parcial), más claro como dos nombres que como un `documentID` que a veces significa "todos". |
| D2 | El orden cronológico que pide el Gherkin (HU‑016‑CA‑01, "en orden cronológico") se resuelve en el **backend**, no en el chaincode: se ordena por `Timestamp` después de traer los eventos. La clave compuesta `(documentID, TxID)` agrupa por documento, no por tiempo global entre documentos distintos — no alcanza para un orden cronológico real entre documentos. | LevelDB (D3 de Sprint 0) itera por rango de clave, no por valor — pedirle "orden cronológico global" al chaincode exigiría una clave distinta (por timestamp) solo para este caso, una complejidad nueva para un typeo que un `.sort()` en Node ya resuelve gratis sobre un volumen de datos de MVP de tesis. |
| D3 | `GET /documents` (ya existe desde D8 de Sprint 3, hoy `Verificador`/`Administrador` únicamente) se abre también a `Empleado` — mismo endpoint, comportamiento distinto por rol: un Empleado recibe solo los documentos donde `responsibleUser === req.user.sub` (filtro de Mongo, no un endpoint nuevo). | Mismo patrón que ya usa `GET /documents/:id` (el hash se enmascara por rol, no hay dos rutas). RF‑18 ("el Empleado consulta los documentos que **él** registró") es el mismo listado que RF‑37/48, solo acotado — duplicar la ruta sería repetir la paginación/forma de respuesta por nada. |
| D4 | `GET /documents/:id/events` (nuevo): trazabilidad de **un** documento. Cualquier rol autenticado puede llamarlo, pero si es `Empleado` y no es el `responsibleUser` del documento, `403` (RF‑21/HU‑009‑CA‑02 — "deniega el acceso"). Verificador/Administrador no tienen esa restricción (ya consultan hash de cualquiera, RF‑27). | Mismo criterio de "un endpoint, filtro por rol" que D3, aplicado a trazabilidad en vez de listado. |
| D5 | `GET /events` (nuevo): trazabilidad **general**, todos los documentos. Solo `Verificador`/`Administrador` (RF‑39/40, RF‑50/51 — ningún RF de Empleado pide ver eventos ajenos). Mismo nivel de detalle para los dos roles (HU‑020‑CA‑02 ya lo exige explícitamente) — una sola respuesta, no una versión "recortada" para Verificador. | Evita construir dos formas de la misma trazabilidad general cuando el propio Gherkin dice que tienen que verse igual. |
| D6 | `GET /documents/summary` (nuevo, solo `Administrador`): totales por estado (`registrados`, `verificados`, `pendientes`, `alterados` — RF‑42) vía un `aggregate`/`countDocuments` de Mongo agrupado por `status`, **no** reutilizando el límite de 100 de `GET /documents` (D8) — un panel con totales mal contados por un límite arbitrario sería peor que no tener panel. | RF‑41/42 son "Should", no "Must" — alcance chico a propósito (un panel, no un dashboard con gráficos). |
| D7 | Gestión de usuarios (RF‑43…47, la porción de `identity` nunca tocada desde Sprint 1): `userRepository.ts` gana `listUsers`, `insertUser` (creación real, distinta de `insertUserIfMissing` que solo sirve para el seed idempotente), `updateUser` (nombre/correo/rol). `deactivateUser` casi existe (`updatePasswordHash` ya muestra el patrón) — falta exponerla. Rutas nuevas: `GET /users`, `POST /users`, `PUT /users/:id`, `POST /users/:id/deactivate` — todas `requireAuth("Administrador")`. | Es la única porción de `identity` que quedó pendiente desde el plan de Sprint 1 (su propio AC ya avisaba: "deja de ser necesario cuando HU‑018 le dé al Administrador el alta real"). |
| D7b | Un usuario nuevo se crea con una **contraseña temporal fija y conocida** (mismo valor de desarrollo que ya usa el seed, `Contratos123!` — documentado, nunca un secreto real) — no hay ningún flujo de invitación/reseteo por correo. El usuario ya puede cambiarla con `POST /auth/change-password` (Sprint 1) después de su primer login. | Un flujo de invitación real (token de un solo uso, correo con link, expiración) es trabajo real de producción que ningún RF de este backlog pide — RF‑45 solo dice "Registrar nuevos usuarios". Construirlo sería resolver un problema que el propio SRS no plantea (sobre-ingeniería para un MVP de tesis). |
| D8 | No hay **reactivación** de un usuario desactivado. RF‑47 solo pide la baja lógica; ningún RF de este backlog pide el camino inverso. | YAGNI — no construir lo que nadie pidió. Si se necesita más adelante, es un `PATCH` de una línea sobre `updateUser`. |

## Grafo de dependencias

```
T1 (chaincode: GetDocumentEvents + GetAllEvents + tests, sin red)
 └── T2 (deploy del chaincode actualizado)
       ├── T3 (backend: GET /documents role-aware + GET /documents/:id/events)
       ├── T4 (backend: GET /events + GET /documents/summary)
       └── T5 (backend: gestión de usuarios — sin dependencia real del chaincode,
             podría ir en paralelo con T3/T4)
             ├── T6 (frontend: Empleado — MisDocumentosPage + MiTrazabilidadPage)
             ├── T7 (frontend: Verificador — DocumentosPage + TrazabilidadGlobalPage)
             ├── T8 (frontend: Administrador — DashboardPage + DocumentosPage + TrazabilidadPage)
             └── T9 (frontend: Administrador — UsuariosPage, CRUD real)
T1..T9 ──> T10 (documentación + trazabilidad SPEC)
```

Orden sugerido (secuencial, mismo ritmo que los sprints anteriores): **T1 → T2 →
(checkpoint: chaincode operativo) → T3 → T4 → T5 → (checkpoint: backend↔ledger real) →
T6 → T7 → T8 → T9 → (checkpoint: HU‑008/009/015…020 de punta a punta) → T10 →
(checkpoint DoD)**.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| `GetAllEvents` crece sin límite con el tiempo (nunca hay paginación todavía) — mismo riesgo que ya aceptó D8 de Sprint 3 para `GET /documents`, pero acá el volumen crece más rápido (2 eventos por documento como mínimo). | Bajo para un MVP de tesis | Mismo criterio que D8: límite defensivo documentado (ej. los 200 eventos más recientes), sin paginación real — upgrade real es RF‑39/40 con filtros, no planteado por ningún RF actual. |
| La trazabilidad general (`GET /events`) puede tardar más que una consulta simple — itera *todos* los eventos del ledger, no uno. | Medio | Mismo patrón de timeout ya usado en `queryChaincode` (`EVALUATE_TIMEOUT_MS`); medir en vivo contra la red real antes de asumir que alcanza. |
| Crear un usuario con una contraseña temporal fija es un hueco de seguridad real si este backend llegara a producción. | Bajo (MVP de tesis, nunca producción real) | D7b lo documenta explícitamente como simplificación deliberada con su upgrade path nombrado (flujo de invitación/reseteo), no un descuido. |

## Próximo paso

Desglose tarea por tarea en `claude_docs/tasks/todo-sprint4-administration.md`. Esperar
confirmación de Sofia antes de arrancar T1.
