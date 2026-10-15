# Plan de trabajo — lo que falta del MVP (orden de prioridad)

> Fuente de verdad: `claude_docs/SPEC.md`. Estado de partida (2026‑10‑14): Sprints 0‑3
> cerrados; Sprint 4 con T1‑T9 hechas (falta T10 + confirmación en navegador).
> No hay commit automático — solo mensajes redactados.

Criterio de orden: **(1)** cerrar lo que está a medias antes de abrir algo nuevo,
**(2)** requisitos Must sin construir, **(3)** evidencia de la Fase 4 (OE4) que la tesis
exige medir, **(4)** entregables documentales, **(5)** deuda técnica opcional.

---

## P0 — Cerrar Sprint 4 (empezar aquí)

| # | Tarea | Quién | Verificar |
|---|---|---|---|
| 0.1 ✅ | Probar en navegador las pantallas de Sprint 4 (3 roles), la selección persona → contrato, el cierre por inactividad (15 min) y el bloqueo tras 5 intentos (15 min). | Sofia | Checklist de `todo-sprint4-administration.md` (checkpoint "de punta a punta") |
| 0.2 ✅ | **T10** de Sprint 4: `backend/README.md` (fila `GET /documents` desactualizada, endpoints `/events`, `/documents/summary`, `/users/*`), `chaincode/README.md`, §3 del SPEC con el cierre de Sprint 4. | Claude | Ciclo `down.sh` → `up.sh` + `smoke-test.sh` en PASS |
| 0.3 | **Sincronizar el SPEC con el backlog fuente**: hoy son **55 RF / 24 HU** (el SPEC dice 53 / 21). Agregar RF‑054, RF‑055, HU‑022, HU‑023, HU‑024 y sus Gherkin; marcar RF‑054 como implementado; cerrar preguntas abiertas #3 (2 orgs) y #4 (UML y prototipos ya existen). | Claude | Conteo RF/HU del SPEC = backlog |
| 0.4 ✅ | Limpieza: borrar `AppDataContext.tsx` (sin consumidores) y su provider en `main.tsx`. | Claude | `npm run build` + `npm run lint` |
| 0.5 | Commit(s) de cierre de Sprint 4 + PR (DoD 1). | Sofia | PR abierto |

---

## P1 — Requisitos que faltan construir

### 1.1 Códigos de verificación (OTP) por un proveedor de correo externo ("vendor")

**Situación actual.** `backend/src/services/emailService.ts` ya usa `nodemailer` por SMTP;
si `SMTP_HOST` está vacío, el código se imprime en los logs del backend (modo
desarrollo). **Además, `docker/compose.app.yml` no le pasa ninguna variable `SMTP_*` al
contenedor `backend`**, así que dentro de Docker el correo nunca puede salir, aunque se
configure.

**Origen:** indicación del tutor (2026‑10‑14): usar, por ahora, un proveedor de correo
externo ("vendor") para las pruebas de verificación por correo. El tutor no fijó cuál.

**Decisión (tomada 2026‑10‑14): Brevo (SMTP relay)** — no requiere código nuevo ni dependencias
(nodemailer ya habla SMTP) y no exige un dominio propio.

| Proveedor | Plan gratis | ¿Sirve sin dominio propio? | Nota |
|---|---|---|---|
| **Brevo** (recomendado) | 300 correos/día, permanente | **Sí** — basta verificar un remitente (p. ej. un Gmail) | `smtp-relay.brevo.com:587`, usuario = login SMTP de Brevo, clave = *SMTP key* |
| Resend | 3.000/mes (100/día) | **No** — sin dominio verificado solo envía al correo del dueño de la cuenta | Mejor API, pero obliga a comprar/verificar un dominio |
| Mailgun | 100/día | No (sandbox limitado a destinatarios autorizados) | — |
| SendGrid | Sin plan gratis (prueba de 60 días) | — | Descartado |

**Tareas:**

- [x] **1.1.a — Cuenta y remitente (Sofia, fuera del repo).** Crear cuenta en Brevo,
  verificar el remitente (el correo que aparecerá en "De:"), generar una *SMTP key* en
  *SMTP & API*. Anotar: login SMTP, SMTP key, correo remitente.
- [x] **1.1.b — Pasar las variables al contenedor.** `docker/compose.app.yml`, servicio
  `backend`: agregar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
  leídas de `docker/.env` (vacías por defecto → se conserva el modo consola). Documentarlas
  comentadas en `docker/.env.example` y `backend/.env.example` con los valores de Brevo
  (sin la clave real; `.env` ya está en `.gitignore`).
- [x] **1.1.c — Soporte de puerto 465.** En `emailService.ts`, `secure: port === 465`
  (una línea). El 587 (STARTTLS) ya funciona tal cual.
- [x] **1.1.d — Correo en español y claro (RNF‑18).** Asunto "TrazaDoc — Código de
  verificación", texto con el código, vigencia (5 min) y "si no fuiste tú, ignora este
  correo". Versión HTML simple opcional.
- [x] **1.1.e — Errores.** Si el proveedor rechaza el envío, ya responde `502` "no se pudo
  enviar el correo" (Sprint 1). Confirmar que nunca se loguea el código cuando SMTP sí
  está configurado (solo en modo desarrollo).
- [x] **1.1.f — Tests.** Un test de `emailService` con `nodemailer` mockeado: con
  `SMTP_HOST` llama a `sendMail` con el `from`/`to` correctos; sin `SMTP_HOST` no lo llama.
- [x] **1.1.g — Prueba real.** `up.sh` con `docker/.env` configurado → login de un usuario
  sembrado cuyo `email` sea un buzón real → el OTP llega (revisar también spam) → acceso
  concedido. Para esto, cambiar el correo de un usuario de prueba desde la pantalla de
  Usuarios del Administrador (los del seed son `@empresa.com`, no existen).
- [x] **1.1.h — Documentación.** `backend/README.md` ("Probar sin SMTP real" → "Envío
  real con Brevo"), SPEC §2 (fila Autenticación: proveedor SMTP) y pregunta abierta #1
  (canal del 2FA).

Riesgos: un remitente Gmail enviado por Brevo sin DKIM propio puede caer en spam
(aceptable para el MVP; se mitiga con un dominio propio + DKIM si se llega a desplegar).
Límite de 300/día: de sobra para pruebas y demo.

### 1.2 RF‑055 / HU‑023 — Aceptación de la política de tratamiento de datos (Must, no existe nada)

- [ ] Backend: campo en el usuario (`policyAcceptance: {version, acceptedAt}`), endpoint
  `POST /auth/accept-policy`, y `requireAuth` bloquea (403) cualquier otra ruta hasta
  aceptar la versión vigente (HU‑023 CA‑03).
- [ ] Frontend: pantalla de la política tras el primer login; sin aceptar no se entra al
  panel (CA‑01/CA‑02).
- [ ] Texto de la política (Ley 1581/2012) — **lo redactan Sofia/Laura**.
- Cambia el esquema de Mongo → "Ask first" del SPEC: confirmar antes de implementar.

### 1.3 HU‑022 CA‑03 — Registrar los intentos fallidos de login

- [ ] Colección `login_attempts` (correo, fecha/hora, motivo; **nunca** la contraseña),
  escrita desde `authService.login` en cada fallo. Con índice TTL si no se necesita
  conservarla para siempre.

---

## P2 — Evidencia de la Fase 4 / OE4 (KPIs de la tesis)

| # | Tarea | KPI / RNF | Nota |
|---|---|---|---|
| 2.1 | **Benchmark de verificación**: script (k6 o autocannon) con 50 peticiones consecutivas a `POST /documents/:id/verifications` en Docker local → P95 y reporte (método, 50 mediciones, captura). **Correrlo dos veces: semanas S11 y S13.** | RNF‑10, P95 ≤ 3000 ms | Tiene fecha fija — no dejarlo para el final |
| 2.2 | **Set de 20 documentos sintéticos** (12 contratos + 8 NDA, según el benchmarking) + script de mutación + corrida que confirme 100 % de detección. | RNF‑14 | `tests/integrity/` |
| 2.3 | **Plan de Pruebas (PPS)**: un caso por escenario Gherkin (ahora ~50), ejecución y % PASS. | RNF‑28, ≥ 90 % PASS | Automatizar los críticos |
| 2.4 | Prueba de trazabilidad: historial del ledger vs. acciones realizadas. | RNF‑26/27 | Reusa `GET /events` |

---

## P3 — Entregables documentales (OBJETIVO 3 + Definición de Terminado)

- [ ] `README.md` raíz (hoy vacío): qué es, estructura, cómo levantarlo, que el chaincode es solo Go.
- [ ] Documentación de la API: colección de Postman o `openapi.yaml` + capturas.
- [ ] Guía de despliegue (prerrequisitos, `.env`, problemas conocidos de Windows) → alimenta el manual de operación.
- [ ] Registro de sprints (HU comprometidas vs. aprobadas, % por sprint — KPI ≥ 80 %).
- [ ] Matriz de trazabilidad HU ↔ RF ↔ endpoint/pantalla.
- [ ] Convertir a `docs/md/` los documentos nuevos de Laura (`Matriz_ASRS y Utility tree.xlsx`, `Prototipo alta fidelidad.pdf`, `Wireframes baja fidelidad.pdf`) y retirar los obsoletos (`Rol administrador.md`, `roles mock up.md`, referencias en `Inconsistencias_Mockup_Roles.txt` y `docs/uml/README.md`).
- [ ] Despliegue en Azure (DoD 4) — solo después de P2.1 (las mediciones son en Docker local).

---

## P4 — Deuda técnica conocida (solo si sobra tiempo)

- Idempotencia de la carga (un reintento tras timeout puede anclar el mismo archivo dos veces).
- `verifyDocument` descarta el `txID`/timestamp real de la verificación.
- Paginación/búsqueda de listados (topes de 100 documentos / 200 eventos).

---

## Por dónde empezar

1. **Hoy:** 0.1 (tú en el navegador) en paralelo con 0.2–0.4 (yo).
2. **Siguiente:** 1.1 (Brevo) — necesito que hagas 1.1.a; el resto es ~1 tarea pequeña.
3. Luego 1.2 y 1.3, y en cuanto haya fecha de S11, 2.1.
