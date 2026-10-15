# API de integración — TrazaDoc

Documentación de la API REST del backend (entregable "API de integración funcional" de
OE3). La especificación está en [`openapi.yaml`](openapi.yaml) (OpenAPI 3.0.3): 18
endpoints con sus parámetros, respuestas, roles permitidos, mensajes de error reales y el
requisito (RF/RNF) que cumple cada uno. Validada con Redocly CLI y contrastada contra el
backend en ejecución.

| Grupo | Endpoints |
|---|---|
| Diagnóstico | `GET /health`, `GET /fabric/ping` |
| Autenticación | `POST /auth/login`, `POST /auth/verify-otp`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/change-password` |
| Documentos | `POST /documents`, `GET /documents`, `GET /documents/summary`, `GET /documents/{id}`, `POST /documents/{id}/verifications` |
| Trazabilidad | `GET /documents/{id}/events`, `GET /events` |
| Usuarios | `GET /users`, `POST /users`, `PUT /users/{id}`, `POST /users/{id}/deactivate` |

## Verla como página (Swagger)

- **Sin instalar nada:** abrir https://editor.swagger.io → *File* → *Import file* →
  `docs/api/openapi.yaml`. A la derecha queda la documentación navegable.
- **VS Code:** extensión "OpenAPI (Swagger) Editor" (42Crunch) y abrir el archivo.
- **Validarla de nuevo** (si se cambia): `npx @redocly/cli lint docs/api/openapi.yaml`.

## Probarla en Postman

1. Levantar el stack: `bash docker/up.sh` y `cd backend && npm run seed`.
2. Postman → **Import** → elegir `docs/api/openapi.yaml` → *Postman Collection*. Se crea
   la colección "TrazaDoc API" con las 18 peticiones agrupadas por etiqueta y la variable
   `baseUrl = http://localhost:8080`.
3. Iniciar sesión:
   - `POST /auth/login` con `{"email": "contratosblockchain+empleado@gmail.com", "password": "Contratos123!"}`.
   - Leer el código en `contratosblockchain@gmail.com`.
   - `POST /auth/verify-otp` con `{"email": "...", "code": "<código>"}` → copiar el `token`.
4. En la colección → pestaña **Authorization** → *Bearer Token* → pegar el token. Todas
   las peticiones lo heredan.
5. Para subir un PDF (`POST /documents`, `POST /documents/{id}/verifications`): pestaña
   **Body** → *form-data* → clave `document`, tipo **File** → elegir el PDF.

Cada rol necesita su propio token (repetir el paso 3 con `+verificador@` o `+admin@`).

## Capturas sugeridas como evidencia (OBJETIVO 3)

| # | Petición | Rol | Qué debe verse |
|---|---|---|---|
| 1 | `GET /health` y `GET /fabric/ping` | — | `200`: backend, MongoDB y chaincode respondiendo. |
| 2 | `POST /auth/login` → `POST /auth/verify-otp` | Empleado | Código recibido por correo y `token` devuelto. |
| 3 | `POST /documents` | Empleado | `201` con el `documentId`. |
| 4 | `GET /documents/{id}/events` | Empleado | Evento `registro` con su `txId` de Fabric. |
| 5 | `GET /documents/{id}` | Verificador | Huella completa leída del ledger. |
| 6 | `POST /documents/{id}/verifications` (mismo PDF) | Verificador | `status: Verificado`, `matches: true`. |
| 7 | `POST /documents/{id}/verifications` (PDF distinto) | Verificador | `status: Alterado`, `matches: false` y ambas huellas. |
| 8 | `GET /events` | Verificador | Registro y verificaciones con sus `txId`, en orden. |
| 9 | `GET /documents` | Administrador | Mismo documento con la huella **enmascarada** (RF-027). |
| 10 | `GET /events` | Empleado | `403`: el Empleado no ve la trazabilidad general (RBAC). |
| 11 | `POST /documents` sin token | — | `401 No autenticado.` (RNF-020: nada entra sin pasar por el backend). |
