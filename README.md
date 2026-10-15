# TrazaDoc — Verificación de integridad de contratos laborales con blockchain

MVP de un sistema web que registra la **huella SHA‑256** de contratos laborales en PDF en
una blockchain permisionada (**Hyperledger Fabric 2.5**) y permite, después, comprobar si
un documento fue alterado y consultar la trazabilidad completa de quién hizo qué y cuándo.

Trabajo de grado — Laura Sofia Diaz Suarez · Sofia Ortiz Daza, Universidad Católica de
Colombia.

## Qué hace

| Rol | Puede |
|---|---|
| **Empleado** | Subir su contrato en PDF (≤ 20 MB), ver sus documentos, su estado y su trazabilidad. |
| **Verificador** | Elegir un documento registrado, subir el PDF a comparar y obtener *Integridad confirmada* o *comprometida*; ver todos los documentos y la trazabilidad general. |
| **Administrador** | Panel con totales por estado, gestión de usuarios (crear, editar, desactivar), consulta de documentos y trazabilidad. |

Acceso con correo + contraseña + **código de verificación por correo** (2FA, enviado por
Brevo), sesión JWT, control de acceso por rol, bloqueo tras 5 intentos fallidos y cierre
por inactividad.

**El PDF nunca se guarda**, ni en la blockchain ni en la base de datos: solo su huella.

## Arquitectura

```
frontend (React)  ──HTTP──>  backend (Node.js + Express + Fabric Gateway)
                                   │                       │
                              MongoDB                Hyperledger Fabric
                     (metadatos, usuarios,     (chaincode en Go: huellas,
                      sesiones)                 estados y eventos con TxID)
```

- El frontend **solo** habla con el backend; nunca con Fabric ni con MongoDB.
- Toda escritura va primero a la blockchain y solo después a MongoDB.
- Red Fabric: 2 organizaciones (1 peer cada una), 1 orderer, 3 Fabric CA, canal
  `contratoschannel`, base de estado LevelDB.
- El chaincode (`contracts`) está escrito **únicamente en Go**.

## Estructura

| Carpeta | Contenido |
|---|---|
| [`chaincode/`](chaincode/README.md) | Smart contract en Go: `RegisterDocument`, `GetDocument`, `RecordVerification`, `GetDocumentEvents`, `GetAllEvents`. |
| [`backend/`](backend/README.md) | API REST (Express + TypeScript): autenticación, documentos, verificación, trazabilidad, usuarios. Especificación OpenAPI en [`docs/api/`](docs/api/README.md). |
| [`frontend/`](frontend/) | SPA React 19 + Vite + Tailwind + shadcn/ui, una sección por rol. |
| [`docker/`](docker/README.md) | Scripts para levantar la red Fabric, desplegar el chaincode y correr Mongo/backend/frontend en contenedores. |
| [`docs/`](docs/) | Documentación del trabajo de grado (SRS, backlog, matrices, UML, prototipos); conversión a texto en `docs/md/`. |
| [`claude_docs/`](claude_docs/SPEC.md) | `SPEC.md` (fuente de verdad de alcance y diseño) y los planes de cada sprint en `tasks/`. |

## Cómo levantarlo

**Requisitos:** Docker Desktop corriendo, Git Bash (o WSL2), Go 1.22+, `jq`, Node.js 20.
La primera vez se descargan ~2‑3 GB de imágenes de Hyperledger Fabric.

```bash
# 1. Configuración (una sola vez)
cp docker/.env.example docker/.env      # datos SMTP de Brevo (opcional, ver abajo)
cp backend/.env.example backend/.env    # para el seed (ajustar MONGO_URI a localhost)

# 2. Todo el stack: red Fabric + chaincode + Mongo + backend + frontend
bash docker/up.sh

# 3. Usuarios de prueba (uno por rol)
cd backend && npm install && npm run seed

# 4. Comprobar que todo responde
bash docker/smoke-test.sh
```

- Aplicación: <http://localhost:5173> · API: <http://localhost:8080>
- Contraseña de los usuarios de prueba: `Contratos123!`
- **Código de verificación:** con los datos SMTP de Brevo en `docker/.env` llega por
  correo (con `SEED_EMAIL` en `backend/.env`, todos los usuarios de prueba reciben en un
  mismo buzón). Sin SMTP, el código aparece en `docker logs backend`.
- Para bajar todo (borra los datos): `bash docker/down.sh`.

Puertos, problemas conocidos en Windows y detalle de cada script:
[`docker/README.md`](docker/README.md).

## Pruebas

| Componente | Comando | Herramienta |
|---|---|---|
| backend | `cd backend && npm test` | Jest + supertest |
| chaincode | `cd chaincode && go test ./...` | `go test` (mocks, sin red) |
| frontend | `cd frontend && npm run build && npm run lint` | `tsc` + oxlint |
| entorno completo | `bash docker/smoke-test.sh` | Bash (HU‑021) |
| latencia de verificación | `node tests/perf/latencia-verificacion.mjs --document <id> --file <pdf>` | Node.js ([guía](tests/perf/README.md), KPI P95 ≤ 3 s) |

## Documentación

- Alcance, requisitos (RF/RNF/HU), arquitectura y decisiones: [`claude_docs/SPEC.md`](claude_docs/SPEC.md).
- Plan y resultado de cada sprint: [`claude_docs/tasks/`](claude_docs/tasks/).
- Lo que falta del MVP: [`claude_docs/tasks/plan-trabajo-pendiente.md`](claude_docs/tasks/plan-trabajo-pendiente.md).
- API (OpenAPI / Swagger, importable en Postman): [`docs/api/`](docs/api/README.md).
- Diagramas UML: [`docs/uml/`](docs/uml/README.md).
