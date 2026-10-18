# Registro de sprints: TrazaDoc

Plan y registro del desarrollo del MVP con **Prototipado Evolutivo** (OE3): objetivo,
historias comprometidas, resultado, cumplimiento de la Definición de Terminado y lecciones
de cada sprint. Es la base del KPI de OE3 **"≥ 80 % de las historias de usuario
comprometidas aprobadas al cierre de cada sprint"**.

- **Equipo:** Laura Sofia Diaz Suarez · Sofia Ortiz Daza.
- **Fuentes:** historial de commits de GitHub (fechas), `claude_docs/SPEC.md` (HU, puntos,
  módulos) y el plan + lista de tareas de cada sprint en `claude_docs/tasks/` (detalle,
  decisiones y verificaciones).
- **Actualizado:** 2026‑10‑15.

## Resumen y KPI

| Sprint | Fechas | Módulo | HU comprometidas | Puntos | Terminadas (criterios técnicos 2‑4 del DoD) | Aprobadas por el tutor (criterio 5) |
|---|---|---|---|---|---|---|
| 0 | 06‑sep → 19‑sep | `infra` | HU‑021 | 13 | 1 de 1 (100 %) | Pendiente |
| 1 | 19‑sep → 20‑sep | `identity` | HU‑001, 002, 003, 004 | 11 | 4 de 4 (100 %) | Pendiente |
| 2 | 20‑sep → 21‑sep | `documents` + `ledger` | HU‑005, 006, 007 | 21 | 3 de 3 (100 %) | Pendiente |
| 3 | 07‑oct → 08‑oct | `verification` | HU‑010, 011, 012, 013, 014 | 22 | 5 de 5 (100 %) | Pendiente |
| 4 | 08‑oct → 14‑oct | `administration` + consultas | HU‑008, 009, 015, 016, 017, 018, 019, 020 | 35 | 8 de 8 (100 %) | Pendiente |
| **Total** | | | **21 HU** | **102** | **21 de 21 (100 %)** | **0 de 21 registradas** |

**Cómo leer el KPI.** La Definición de Terminado (SPEC §10.2) tiene 5 criterios. Los
criterios técnicos (**2** (casos de prueba en PASS), **3** (RF/RNF actualizados) y
**4** (desplegado y verificado en Docker Compose)) se cumplieron en todas las HU
comprometidas: el **100 % en cada sprint, por encima de la meta del 80 %**. El KPI
formal exige además **el criterio 5 (aceptación del director o la codirectora)**, que
todavía no se ha registrado en ningún sprint, y el **criterio 1** (revisión por pares e
integración a `main`), cumplido con pull requests solo en parte (ver cada sprint). **El
porcentaje oficial se completa cuando el tutor registre su aprobación** en la última
columna.

**Historias agregadas al backlog después de la planeación** (RF‑054/055, versión 2.0 del
backlog):

| HU | Estado |
|---|---|
| HU‑022 Protección ante intentos fallidos | Parcial: bloqueo tras 5 intentos (CA‑01, CA‑02) y cierre por inactividad (CA‑04) hechos; falta registrar cada intento fallido (CA‑03). |
| HU‑023 Aceptación de la política de tratamiento de datos | No iniciada (falta el texto de la política). |
| HU‑024 Edición y desactivación de usuarios | Hecha dentro de HU‑018 (Sprint 4): el cambio de rol aplica desde el siguiente ingreso. |

**Velocidad:** 13 → 11 → 21 → 22 → 35 puntos. Sprints 1 y 2 fueron cortos porque se
apoyaron en la infraestructura de Sprint 0; Sprint 4 fue el más grande porque reunió todas
las consultas que los sprints anteriores dejaron a propósito para el final.

---

## Sprint 0: Infraestructura (`infra`)

- **Objetivo:** entorno reproducible de una sola orden con la red Hyperledger Fabric,
  MongoDB, backend y frontend en contenedores, y retirar temprano el mayor riesgo del
  proyecto: la integración con Fabric.
- **HU:** HU‑021 Despliegue de la red blockchain y del entorno con Docker (13 pts). RNF‑19,
  20, 21, 22.
- **Resultado:** red Fabric 2.5.16 (2 organizaciones, orderer Raft, 3 CA, canal
  `contratoschannel`, LevelDB); MongoDB 7; backend Express + TypeScript conectado a Fabric
  con Fabric Gateway (`/fabric/ping`); frontend en nginx; `docker/up.sh` / `down.sh`;
  smoke test de HU‑021 en **PASS** (CA‑01 y CA‑02). En paralelo, Laura construyó el
  prototipo navegable del frontend (rama `Feat/Front`, PR #3).
- **DoD:** 2 ✅ smoke test · 3 ✅ RNF‑19…22 · 4 ✅ Docker Compose · 1 ⏳ integrado a
  `main` sin PR propio (solo el frontend de Laura entró por PR #3) · 5 ⏳ pendiente.
- **Lecciones:**
  - Windows + Git Bash reescribe rutas tipo `/var/run/...` a rutas de Windows: rompió el
    montaje del socket de Docker y la limpieza de la red. Se corrigió en los scripts y se
    documentó; la regla quedó: probar siempre en el sistema real del equipo.
  - Fabric Gateway solo dialoga con un peer (el peer reenvía al orderer): menos
    configuración que el SDK antiguo.
  - La revisión de código encontró un falso PASS en el smoke test (un error de `grep` se
    contaba como éxito). Lección: forzar el camino de fallo, no solo ver que "pasa".
  - Integrar trabajo paralelo exige no pisarlo: la página de estado se agregó como ruta
    aparte para no reemplazar el frontend de `Feat/Front`.

## Sprint 1: Identidad (`identity`)

- **Objetivo:** acceso seguro con credenciales, segundo factor por correo, sesión y
  control por rol.
- **HU:** HU‑001 (3), HU‑002 (5), HU‑003 (1), HU‑004 (2). RF‑01…07, RF‑52/53;
  RNF‑01, 02, 03, 07.
- **Resultado:** login + código OTP de 6 dígitos (5 min, 5 intentos), contraseñas con
  bcrypt + sal, JWT con sesión registrada en MongoDB (logout real), RBAC por ruta, cambio
  de contraseña; usuarios de prueba por script.
- **DoD:** 2 ✅ pruebas automáticas + flujo de punta a punta · 3 ✅ · 4 ✅ ·
  1 ⏳ integrado a `main` sin PR · 5 ⏳.
- **Lecciones:**
  - Un JWT "sin estado" no se puede revocar antes de vencer: para que el logout cierre la
    sesión de verdad se guardó cada sesión en MongoDB.
  - El backlog no fijaba vigencia ni intentos del código: se decidió explícitamente
    (5 min, 5 intentos) y se anotó en el SPEC en vez de improvisar.
  - Mismo mensaje para todo fallo de login, y mismo tiempo de respuesta, para no revelar
    si un correo existe.

## Sprint 2: Documentos y ledger (`documents` + `ledger`)

- **Objetivo:** primer chaincode real y primera escritura en la blockchain: el Empleado
  carga un PDF y su huella queda anclada.
- **HU:** HU‑005 (5), HU‑006 (8), HU‑007 (8). RF‑08…17; RNF‑04, 05, 13, 23, 24.
- **Resultado:** chaincode Go `contracts` con `RegisterDocument`; `POST /documents` con
  validación real del PDF (firma `%PDF-`, ≤ 20 MB), huella SHA‑256 y registro en el
  ledger antes que en MongoDB; pantalla de carga conectada.
- **DoD:** 2 ✅ · 3 ✅ · 4 ✅ · 1 ⏳ excepción de PR documentada · 5 ⏳.
- **Lecciones:**
  - El primer registro real falló ("Result is required"): la librería del chaincode
    marca todo campo como obligatorio salvo que se declare opcional. Solo apareció contra
    la red real, no en las pruebas unitarias.
  - Orden de escritura: primero el ledger (inmutable), después MongoDB. Si MongoDB falla,
    se responde error y nunca un "éxito" falso (HU‑007 CA‑02).
  - El motivo real de un rechazo del chaincode viene en un campo distinto del mensaje
    del SDK: hay que leerlo ahí para dar mensajes útiles.

## Sprint 3: Verificación (`verification`)

- **Objetivo:** que el Verificador compare un PDF contra la huella registrada y el
  resultado quede en la blockchain.
- **HU:** HU‑010 (3), HU‑011 (3), HU‑012 (3), HU‑013 (8), HU‑014 (5). RF‑23…36;
  RNF‑05, 08, 23, 24, 27.
- **Resultado:** chaincode con `GetDocument` y `RecordVerification` (cambia el estado a
  Verificado o Alterado y agrega el evento); consulta de huella enmascarada por rol;
  comparación real de huellas; listado mínimo para elegir el documento (ampliación
  pedida durante la prueba manual). Confirmado en navegador.
- **DoD:** 2 ✅ · 3 ✅ · 4 ✅ · 1 ⏳ · 5 ⏳.
- **Lecciones:**
  - Probando a mano con un solo peer, las transacciones "respondían bien" pero no se
    guardaban: la política del canal exige la firma de las dos organizaciones. Hay que
    esperar la confirmación del bloque, no solo la respuesta del peer.
  - Pedir un UUID de 36 caracteres al usuario no es práctico: la prueba con usuarios
    reales cambió el alcance (listado para elegir).
  - Distinguir "no existe" (404) de "falló la red" (502) evita disfrazar una caída de
    Fabric como un documento inexistente.
  - La revisión encontró que la pantalla mostraba la fecha de registro como si fuera la
    de la verificación.

## Sprint 4: Administración y consultas (`administration`)

- **Objetivo:** cerrar todas las consultas pendientes (documentos y trazabilidad para los
  3 roles), el panel del Administrador y la gestión de usuarios; conectar todas las
  pantallas al backend real.
- **HU:** HU‑008 (3), HU‑009 (5), HU‑015 (3), HU‑016 (5), HU‑017 (3), HU‑018 (8),
  HU‑019 (3), HU‑020 (5). RF‑18…22, RF‑37…51; RNF‑03, 06, 08, 09, 26, 27.
- **Resultado:** chaincode con `GetDocumentEvents` y `GetAllEvents`; trazabilidad leída
  del ledger; listados por rol; panel con totales; alta, edición y baja lógica de
  usuarios; ninguna pantalla con datos de prueba. Integrada la rama de Laura (login sin
  selección de rol, pantalla de sesión cerrada, bloqueo por intentos, cierre por
  inactividad, no re-subir un documento pendiente). Selección del documento en dos pasos
  (persona → contrato). Probado por Sofia en navegador.
- **DoD:** 2 ✅ · 3 ✅ · 4 ✅ · 1 ⏳ · 5 ⏳.
- **Lecciones:**
  - Desactivar o cambiar el rol de un usuario debe cortar sus sesiones abiertas al
    instante; si no, conserva el acceso viejo hasta que el token venza.
  - El dueño de un documento se toma del ledger, no de la copia en MongoDB: una
    desincronización no puede bloquear al dueño real.
  - Toda consulta que crece sin fin (eventos) necesita un tope.
  - Dos contratos con el mismo nombre de archivo eran indistinguibles: elegir primero la
    persona resolvió la ambigüedad.
  - Una explicación técnica equivocada (sobre CORS) estuvo a punto de quedar documentada:
    la revisión de código también sirve para corregir la documentación.

## Después de Sprint 4 (14‑oct → 15‑oct)

Ajustes tras la prueba manual y entregables de OE2/OE3:

- Código de verificación enviado por un proveedor de correo real (**Brevo**), por
  indicación del tutor.
- La huella completa la ve solo el Verificador (RF‑27, decisión tras la prueba manual).
- Textos de usuario unificados en tuteo; README principal.
- Matriz de infraestructura, diagramas UML actualizados a lo implementado,
  documentación de la API (OpenAPI) y evidencia de integración con Fabric.

## Pendiente para cerrar el KPI

1. Registrar la **aceptación del tutor** (criterio 5) de cada sprint: completar la última
   columna del resumen con la fecha de la sesión de revisión.
2. Abrir los **pull requests** de revisión que faltan (criterio 1), o dejar documentada la
   excepción por sprint.
