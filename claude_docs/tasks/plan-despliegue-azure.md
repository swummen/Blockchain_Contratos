# Plan: despliegue en Azure (VM Linux + Docker Compose)

Origen: revisión /ship (code-reviewer, security-auditor, test-engineer) del 2026-10-25.
Veredicto inicial: NO-GO por configuración, no por lógica. Módulo `infra` (HU-021,
RNF-20/21) y `identity` (RNF-05/07, RF-054).

Decisión de arquitectura: el navegador solo habla con un origen. El nginx del
frontend reenvía `/api/*` al backend (mismo origen: sin CORS, sin URL pública fija
en el bundle) y un Caddy opcional (perfil `publico`) pone HTTPS con Let's Encrypt
delante del frontend. En el PC local no cambia nada: Caddy solo se enciende si
`PUBLIC_DOMAIN` tiene valor.

## Bloqueantes

| # | Tarea | Archivo | Verificación |
|---|---|---|---|
| B1 | nginx reenvía `/api/` al backend, 20 MB de subida, bloquea `/api/fabric` | `frontend/nginx.conf` | e2e por `http://localhost:5173/api` |
| B2 | `VITE_API_URL=/api` por defecto en Docker; `FRONTEND_ORIGIN` configurable | `docker/compose.app.yml`, `.env.example` | build + login en el navegador |
| B3 | Servicio `caddy` (perfil `publico`) con HTTPS automático para `PUBLIC_DOMAIN` | `docker/compose.app.yml`, `up.sh`, `start.sh` | `docker compose config` |
| B4 | `up.sh` se niega a publicar con `JWT_SECRET` o clave de Mongo de ejemplo | `docker/up.sh` | correr con valores de ejemplo y `PUBLIC_DOMAIN` |
| B5 | Puertos de Fabric solo en 127.0.0.1; `install-fabric.sh` fijado a `v2.5.16` | `docker/network-up.sh` | `docker ps` tras `up.sh` |
| B6 | `touchSession` con `.catch` (un fallo de Mongo no tumba el proceso) + prueba | `middlewares/auth.ts`, `tests/` | `npm test` |
| B7 | `npm audit fix` sin cambios mayores | `backend/`, `frontend/` | `npm audit --omit=dev` |
| B8 | Hash calculado antes de subir (sin HTTPS fallaba después de registrar) | `CargarDocumentoPage.tsx` | carga en el navegador |

## Recomendados

| # | Tarea | Archivo |
|---|---|---|
| R1 | Límite de peticiones por IP (login/OTP y general), respuesta 429 en JSON | `frontend/nginx.conf` |
| R2 | Cabeceras: CSP, nosniff, Referrer-Policy, X-Frame-Options, HSTS; sin `x-powered-by` | `nginx.conf`, `server.ts` |
| R3 | Timeouts SMTP de 8 s (antes 2 a 10 min) | `services/emailService.ts` |
| R4 | `EVALUATE_TIMEOUT_MS` 3 s → 8 s (arranque en frío del chaincode) | `fabric/gateway.ts` |
| R5 | Índice único de correo al arrancar, no solo en el seed | `server.ts` |
| R6 | `lang="es"` | `frontend/index.html` |
| R7 | Prueba e2e de 47 casos versionada | `tests/e2e/e2e.sh` |
| R8 | Guía paso a paso de la VM (NSG, DNS, secretos, uid 1000, SMTP 587, cambio de claves) | `DESPLIEGUE-AZURE.md` |

## Riesgos aceptados (MVP de un mes, pocos usuarios)

- Subida simultánea del mismo PDF puede registrarse dos veces (falta índice único parcial).
- Desajuste Mongo↔ledger si Mongo falla tras escribir en el ledger: queda en el log
  como `INCONSISTENCIA` y se corrige a mano.
- CA de Fabric con `admin:adminpw`: mitigado porque sus puertos quedan en 127.0.0.1 y el NSG.
- Timestamps del chaincode con precisión de segundos; `GetAllEvents` sin paginación.
- Carrera en los intentos de OTP y en la reconexión del gateway (impacto bajo).
- Frontend sin pruebas automáticas; lo cubren las del backend y la e2e.
- Política de respaldo MAJORITY (OBS-01) y evento de prueba de `deploy-cc.sh` visible.

## Rollback

Disparadores: login o carga fallando más de 5 min, 502 continuos del ledger, backend
reiniciándose en bucle. Procedimiento en `DESPLIEGUE-AZURE.md` §Reversión.
