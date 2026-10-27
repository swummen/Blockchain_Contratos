# Plan de trabajo: lo que falta del MVP (orden de prioridad)

> Fuente de verdad: `claude_docs/SPEC.md`. Actualizado **2026‑10‑14**, después del cierre
> de Sprint 4 (T10) y del envío del OTP por Brevo.
> No hay commit automático: solo mensajes redactados.

## Dónde estamos

- **Hecho:** Sprints 0‑4 cerrados. Los 53 RF del SPEC están implementados; las pantallas
  de los 3 roles usan el backend real; el OTP llega por correo real (Brevo,
  `contratosblockchain@gmail.com`); bloqueo por intentos (RF‑054) y cierre por
  inactividad (RNF‑07) funcionando.
- **Falta:** sincronizar el SPEC con el backlog (55 RF / 24 HU), dos requisitos nuevos
  sin construir (RF‑055 y el registro de intentos fallidos), **toda la Fase 4 (OE4)**
  y los entregables documentales.

Criterio de orden: **(0)** revisiones rápidas y de seguridad, **(1)** que el SPEC diga la
verdad, **(2)** requisitos Must sin construir, **(3)** evidencia de la Fase 4 que la tesis
exige medir (con fechas fijas), **(4)** entregables, **(5)** deuda técnica opcional.

---

## P0: Por revisar (rápido, antes de seguir)

| # | Qué revisar | Quién | Por qué |
|---|---|---|---|
| R1 | **Cambiar la SMTP key de Brevo** (la actual quedó escrita en el chat): generar una nueva, borrar `sofias-local` y actualizar `docker/.env`. | Sofia | Seguridad: la clave se expuso. |
| R2 | **Configurar a Laura**: su propia SMTP key (`laura-local`) + sus `docker/.env` y `backend/.env` (no viajan con el repo). Guía paso a paso en `para_sofi.md` §7. Confirmar que a ella también le llega el OTP. | Sofia + Laura | Que no dependa de un solo computador. |
| R3 ✅ | **Correr `bash docker/smoke-test.sh`** con el stack arriba: no se corrió en el cierre de T10 (Docker estaba apagado). | Claude | Evidencia de no regresión de HU‑021. |
| R4 ✅ | **Corregir el voseo en textos de usuario** (5 mensajes: "No podés…", "No tenés permiso…", "ingresá…", "¿No lo encontrás?") → tuteo, como el resto de la app. Están en `backend/src/routes/users.ts`, `middlewares/auth.ts`, `services/documentService.ts` y `VerificarIntegridadPage.tsx`. | Claude | Consistencia del español de la UI (RNF‑16/18). |
| R5 ✅ | **Root `README.md` está vacío** (el commit "completo readme contratos" actualizó los otros README, no el de la raíz). | Claude | Entregable explícito de OBJETIVO 3. |
| R6 | **Confirmar las fechas reales de S11 y S13** en el cronograma (Tabla 5 del trabajo de grado: es una imagen, no se puede leer desde `docs/md/`). | Sofia | El benchmark de RNF‑10 (2.1) tiene que correrse en esas dos semanas. |
| R7 ✅ | **Limpiar datos de prueba antes de cualquier demo**: quedan `CONTRATO FALSO.pdf` (c.ruiz) y el usuario `Prueba T9 Editada`. `bash docker/down.sh && bash docker/up.sh && npm run seed` deja todo limpio. | Sofia | Una demo con datos de prueba sueltos se ve desordenada. |
| R8 | **Correos en spam**: si los OTP siguen cayendo en spam, marcar "No es spam" en `contratosblockchain@gmail.com`. Recordar que la SMTP key vence en 1 año **o tras 90 días sin uso**. | Sofia | Que la demo no falle por el correo. |
| R10 | **Sesión vencida en el frontend**: tras 15 min de inactividad el backend cierra la sesión y responde `401`, pero el frontend solo muestra "Sesión inválida o vencida." y no lleva al login (HU‑022 CA‑04 pide "exige autenticarse nuevamente"). Arreglo chico: ante un `401`, limpiar la sesión y redirigir al inicio. | Claude | Hallado al actualizar el UML. |
| R9 | **DoD pendiente en todos los sprints**: PR revisado (criterio 1) y aceptación del director/codirectora (criterio 5). Llevar el acta. | Sofia + Laura | Sin esto ninguna HU cuenta como "terminada" para el KPI de HU aprobadas. |

---

## P1: Que el SPEC diga la verdad

| # | Tarea | Quién | Verificar |
|---|---|---|---|
| 1.1 | **Sincronizar el SPEC con el backlog fuente**: 55 RF / 24 HU (el SPEC dice 53 / 21). Agregar RF‑054, RF‑055, HU‑022, HU‑023, HU‑024 con sus Gherkin (~9 escenarios nuevos); marcar RF‑054 y HU‑024 como implementados; HU‑022 parcial (falta CA‑03). | Claude | Conteo RF/HU/Gherkin del SPEC = backlog |
| 1.2 | **Cerrar preguntas abiertas del SPEC §18**: #3 (topología: 2 orgs, endorsement OR, ya decidido en Sprint 0), #4 (UML en `docs/uml/` y prototipos en `docs/` ya existen). Revisar #1 (¿el OTP debe ir solo a correo corporativo?) con el tutor. | Claude (+ tutor para #1) | §18 sin preguntas ya resueltas |
| 1.3 | **Nombre del producto**: la app ya dice "TrazaDoc", el SPEC no lo nombra (hallazgo #4 de `Inconsistencias_Mockup_Roles.txt`). Anotarlo en el SPEC. | Claude | N/A |

---

### 1.4 OE2: Artefactos de diseño y aprobación del tutor (KPI: 4 de 4 dominios)

- [x] Matriz de infraestructura: `docs/Matriz_Infraestructura.xlsx` (+ `docs/md/`),
  generada desde la configuración real y verificada con el stack corriendo.
- [x] Diagramas UML actualizados a lo implementado (`docs/uml/`, 8 diagramas + README
  con el registro de cambios respecto al diseño inicial); los 8 renderizan con PlantUML.
- [ ] Decidir la observación OBS-01 de la matriz: la política de endoso real es
  **MAJORITY** (firman las 2 organizaciones), no `OR` como dicen D2 (Sprint 0) y D7
  (Sprint 2). Opciones: corregir la documentación, o redesplegar con `OR` ("Ask first":
  cambia la topología).
- [ ] Revisión y aprobación del tutor de los 4 dominios (UX/UI, software, infraestructura,
  chaincode/red): hoja "8. Aprobación" de la matriz. **Lo hacen Sofia y Laura.**

---

## P2 (Requisitos que faltan construir

### 2.1 RF‑055 / HU‑023) Aceptación de la política de tratamiento de datos (Must, no existe nada)

- [ ] **Texto de la política** (Ley 1581/2012) con un número de versión: **lo redactan
  Sofia/Laura**. Bloquea el resto.
- [ ] Backend: guardar en el usuario `policyAcceptance: {version, acceptedAt}`; endpoint
  `POST /auth/accept-policy`; `requireAuth` responde `403` en cualquier otra ruta hasta
  aceptar la versión vigente (CA‑03).
- [ ] Frontend: pantalla de la política tras el primer login; sin aceptar no se entra al
  panel (CA‑01/CA‑02).
- [ ] Tests + prueba en navegador.
- Cambia el esquema de Mongo → "Ask first" del SPEC: confirmar el diseño antes.

### 2.2 HU‑022 CA‑03: Registrar los intentos fallidos de login

- [ ] Colección `login_attempts` (correo ingresado, fecha/hora, motivo; **nunca** la
  contraseña), escrita desde `authService.login` en cada fallo. Hoy solo existe el
  contador del bloqueo.
- [ ] Decidir si el Administrador lo ve en pantalla (ningún RF lo pide: por defecto no).

---

## P3: Fase 4 / OE4: evidencia que la tesis tiene que medir

| # | Tarea | KPI / RNF | Nota |
|---|---|---|---|
| 3.1 | **Benchmark de verificación**: script listo (`tests/perf/latencia-verificacion.mjs`, guía en `tests/perf/README.md`); corrida de prueba 2026‑10‑15: P95 = 2040 ms → PASS. **Falta la corrida oficial en S11 y en S13** (ver R6) con un PDF realista. | RNF‑10, P95 ≤ 3000 ms | La latencia ≈ `BatchTimeout: 2s` del orderer. |
| 3.2 | **Set de 20 documentos sintéticos** (12 contratos + 8 NDA) en `docs/documentos-prueba/` + generador y prueba en `tests/integrity/`. Ensayo local 2026‑10‑25: 20/20 detectadas, 0 falsos positivos, trazabilidad 20/20. **Falta la corrida oficial contra Azure** (ver `tests/integrity/README.md`). | RNF‑14, 100 % | `tests/integrity/` |
| 3.3 | **Plan de Pruebas de Software (PPS)**: documento listo (2026‑10‑25) en `docs/Plan de Pruebas de Software - TrazaDoc.docx` con 51 casos funcionales + 11 de integridad/trazabilidad/rendimiento y registro inicial de defectos DEF‑01…05. **Falta: aprobación del director y la ejecución (ciclo 2 en Azure).** | RNF‑28, ≥ 90 % PASS | Base de la matriz de cumplimiento |
| 3.4 | Prueba de trazabilidad/inmutabilidad: historial del ledger vs. acciones realizadas. | RNF‑26/27 | Reusa `GET /events` |
| 3.5 | Prueba de consistencia Mongo ↔ ledger (documentId, hash, estado). | RNF‑13 | Script de comparación |

---

## P4: Entregables documentales (OBJETIVO 3 + DoD)

- [ ] `README.md` raíz (R5): qué es, estructura, cómo levantarlo, que el chaincode es solo Go.
- [x] Documentación de la API: `docs/api/openapi.yaml` (19 endpoints, validada con Redocly y contrastada con el backend real) + guía de Postman en `docs/api/README.md`.
- [ ] Capturas de las llamadas funcionando (lista sugerida de 11 en `docs/api/README.md`): **Sofia/Laura**.
- [x] Evidencia de integración con Fabric: `docs/evidencias/integracion-fabric.md` (registro, consulta, 2 verificaciones, TxID contrastados en los bloques 9‑11) + scripts para reproducirla.
- [x] Guía de instalación y despliegue: `INSTALACION.md` (requisitos, programas con `winget`, configuración, `up.sh`/`stop.sh`/`start.sh`/`down.sh`, usuarios, problemas frecuentes, origen de `configtx.yaml`). README principal simplificado. `up.sh` ahora siembra los usuarios (ya no hace falta Node para usar el sistema). Probado: ciclo completo desde cero + apagar/encender sin perder datos, smoke test PASS.
- [x] Registro de sprints: `docs/registro-sprints.md` (HU comprometidas, % terminado por sprint, DoD y lecciones). Falta que el tutor registre su aprobación (criterio 5) para el % oficial.
- [x] Matriz de trazabilidad HU ↔ RF ↔ código: `docs/Matriz_Trazabilidad_HU_RF_Codigo.xlsx` (+ `docs/md/`): 24 HU y 55 RF con pantalla, endpoint, servicio, chaincode, MongoDB, pruebas y evidencia.
- [ ] Registro de cambios respecto al diseño (OE2): p. ej. login sin selector de rol, selección en dos pasos, Brevo, CouchDB → LevelDB (OBJETIVO 3 pedía CouchDB en el script de red).
- [ ] Actualizar los diagramas UML de `docs/uml/` a lo implementado (sus nombres de servicios eran una propuesta previa al código; su README cita un `SRS_v2_Requerimientos (2).md` que no existe).
- [ ] Convertir a `docs/md/` los documentos nuevos de Laura (`Matriz_ASRS y Utility tree.xlsx`, `Prototipo alta fidelidad.pdf`, `Wireframes baja fidelidad.pdf`), retirar los obsoletos (`Rol administrador.md`, `roles mock up.md`) y comparar el prototipo de alta fidelidad con las pantallas actuales.
- [ ] Despliegue en Azure (DoD 4): después de 3.1.
- [ ] Manual de usuario.

---

## P5: Deuda técnica conocida (solo si sobra tiempo)

- Idempotencia de la carga (un reintento tras timeout puede anclar el mismo archivo dos veces).
- `verifyDocument` descarta el `txID`/timestamp real de la verificación (la evidencia usa la hora del navegador).
- Paginación/búsqueda de listados (topes de 100 documentos / 200 eventos).
- Sin reactivación de usuarios ni invitación por correo (decisiones D7b/D8, ningún RF las pide).

---

## Por dónde empezar

1. **Ya mismo (Sofia):** R1 (cambiar la clave), R6 (fechas de S11/S13) y empezar el
   texto de la política de datos (bloquea 2.1).
2. **Ya mismo (Claude):** R3–R5 y P1 (SPEC al día).
3. **Siguiente:** 2.2 (chico) mientras llega el texto de la política; luego 2.1.
4. **En paralelo, según las fechas de R6:** 3.1 → 3.2 → 3.3.
5. **Al final:** P4, con lo medido en P3.

## Historial

- **Cambio 2026‑10‑15 (prueba manual de Sofia):** la huella completa solo la ve el
  Verificador; el Administrador la recibe enmascarada (RF‑27, nota de cambio en el SPEC).
  OTP por Brevo confirmado en uso real (llega con algo de demora).
- **Cerrado 2026‑10‑15:** R3 (smoke test PASS tras reinicio desde cero), R4 (8 textos
  con voseo → tuteo), R5 (README raíz), R7 (entorno reiniciado: sin datos de prueba,
  usuarios sembrados con `SEED_EMAIL`); guía de configuración de Laura en
  `para_sofi.md` §7; nota en `docker/README.md` sobre restos de red tras re-clonar.
- **Cerrado 2026‑10‑14:** cierre de Sprint 4 (T10 + limpieza del mock); OTP por
  proveedor externo (Brevo, por indicación del tutor), `SMTP_*` en Docker, puerto 465,
  correo en español, `SEED_EMAIL`, tests, host `smtp-relay.sendinblue.com` (el de
  `brevo.com` falla TLS desde Colombia).
