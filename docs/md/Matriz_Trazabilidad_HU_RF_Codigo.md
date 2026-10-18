## Portada
| Matriz de trazabilidad HU ↔ RF ↔ código |
| --- |
| TrazaDoc: MVP de verificación de integridad y trazabilidad documental (Hyperledger Fabric) |
| NaN |
| Relaciona cada historia de usuario y cada requisito funcional con el código que lo implementa (pantalla, endpoint, servicio del backend, función del chaincode, colección de MongoDB), sus pruebas automáticas y la evidencia de verificación. Prepara la matriz de cumplimiento de OE4. |
| Fuentes: backlog v2.0 (docs/md/Requisitos\_Historias\_Usuario\_ (backlog incluido).md), claude\_docs/SPEC.md y el código del repositorio. Versión 1.0 · 2026-10-15. |
| NaN |
| Resumen |
| Historias de usuario: 24, Implementadas 22 · Parciales 1 · No implementadas 1 |
| Requisitos funcionales: 55, Implementados 53 · Parciales 1 · No implementados 1 (96 % implementado) |
| Pruebas automáticas: backend 141 (Jest, 14 archivos en backend/tests/) · chaincode 34 (go test, chaincode/contract/smartcontract\_test.go) · entorno: docker/smoke-test.sh |
| Evidencia de integración con Fabric: docs/evidencias/integracion-fabric.md |
| NaN |
| Hojas |
| 1. HU ↔ RF ↔ código: una fila por historia (24). |
| 2. RF ↔ implementación: una fila por requisito funcional (55). |
| Colores del estado: verde = implementado · amarillo = parcial · rojo = no implementado. |

## 1. HU-RF-Código
| 1. Historias de usuario → requisitos → código | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 | Unnamed: 10 | Unnamed: 11 | Unnamed: 12 | Unnamed: 13 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| HU | Título | Épica | Sprint | RF | RNF | Pantalla (frontend) | Endpoint(s) | Backend (servicio / función) | Chaincode | MongoDB | Pruebas automáticas | Evidencia de verificación | Estado |
| HU-001 | Inicio de sesión con credenciales corporativas | EP-01 | 1 | RF-01, RF-02 | RNF-02 | LoginPage ( / ) | POST /auth/login | authService.login | NaN | users | auth.login.test.ts | Prueba manual con correo real (Brevo) | Implementado (con cambio: el rol se toma de la cuenta, no se elige, RF-01) |
| HU-002 | Autenticación de doble factor y acceso por rol | EP-01 | 1 | RF-03, RF-04, RF-05, RF-06 | RNF-02, RNF-03 | OtpPage ( /verificacion ), ProtectedRoute | POST /auth/verify-otp | authService.verifyOtp, emailService.sendOtpEmail (Brevo), middlewares/auth requireAuth (RBAC) | NaN | otp\_codes, sessions | auth.otp.test.ts, auth.middleware.test.ts, emailService.test.ts | Código recibido por correo real | Implementado |
| HU-003 | Cierre de sesión seguro | EP-01 | 1 | RF-07 | RNF-07 | UserMenu → LoggedOutPage ( /sesion-cerrada ) | POST /auth/logout | authService.logout, requireAuth | NaN | sessions | auth.logout.test.ts, auth.middleware.test.ts | Prueba en navegador | Implementado |
| HU-004 | Cambio de contraseña | EP-01 | 1 | RF-52, RF-53 | RNF-01 | ChangePasswordDialog (menú de usuario) | POST /auth/change-password | authService.changePassword (bcrypt + sal) | NaN | users | auth.changePassword.test.ts | Prueba en navegador | Implementado |
| HU-005 | Carga y validación de documentos contractuales | EP-02 | 2 | RF-08, RF-09, RF-10, RF-11, RF-12 | RNF-23, RNF-24 | CargarDocumentoPage ( /empleado/cargar ), FileDropzone | POST /documents (multipart) | documentService.registerDocument, isPdfSignature; multer (≤ 20 MB, un archivo) | NaN | NaN | documents.test.ts (POST /documents) | Prueba en navegador | Implementado |
| HU-006 | Registro de metadatos y huella criptográfica | EP-02 | 2 | RF-13, RF-14, RF-15 | RNF-11, RNF-13 | CargarDocumentoPage | POST /documents | documentService.registerDocument (SHA-256, documentId UUID, bloqueo de duplicado pendiente) | RegisterDocument | documents | documents.test.ts; smartcontract\_test.go | docs/evidencias/integracion-fabric.md (paso 1) | Implementado |
| HU-007 | Registro de la huella en la red blockchain | EP-02 | 2 | RF-16, RF-17 | RNF-04, RNF-05, RNF-20 | CargarDocumentoPage (confirmación + identificador copiable) | POST /documents | documentService.registerDocument → fabric/gateway submitChaincodeTransaction (ledger antes que MongoDB) | RegisterDocument | documents | documents.test.ts; gateway.test.ts; smartcontract\_test.go | integracion-fabric.md: bloque 9, TxID VALID | Implementado |
| HU-008 | Consulta de mis documentos y su estado | EP-02 | 4 | RF-18, RF-19, RF-20 | RNF-09 | MisDocumentosPage ( /empleado/documentos ) | GET /documents | documentService.listDocuments (filtro por dueño, huella enmascarada) | NaN | documents | documents.test.ts (GET /documents) | Prueba en navegador | Implementado |
| HU-009 | Consulta de trazabilidad de mis documentos | EP-02 | 4 | RF-21, RF-22 | RNF-06, RNF-26, RNF-27 | MiTrazabilidadPage ( /empleado/trazabilidad ) | GET /documents/{id}/events | documentService.getDocumentEvents (dueño leído del ledger → 403 si es ajeno) | GetDocument, GetDocumentEvents | users (nombres) | documents.test.ts (GET /documents/:id/events); smartcontract\_test.go | integracion-fabric.md (paso 5) | Implementado |
| HU-010 | Selección del documento a verificar | EP-03 | 3 | RF-23, RF-24, RF-25 | NaN | VerificarIntegridadPage ( /verificador/verificar ): persona → contrato | GET /documents, GET /documents/{id} | documentService.listDocuments, getDocument | GetDocument | documents | documents.test.ts | Prueba E2E con documentos homónimos | Implementado (RF-24 con nota de cambio: selección en dos pasos) |
| HU-011 | Consulta de la huella registrada con control de visibilidad | EP-03 | 3 | RF-26, RF-27 | RNF-08 | VerificarIntegridadPage (HashDisplay) | GET /documents/{id} | documentService.getDocument + maskHash (solo el Verificador ve la huella completa) | GetDocument | documents | documents.test.ts (GET /documents/:id) | integracion-fabric.md (pasos 2 y 6) | Implementado |
| HU-012 | Carga del documento a comparar | EP-03 | 3 | RF-28, RF-29 | RNF-23, RNF-24 | VerificarIntegridadPage (FileDropzone) | POST /documents/{id}/verifications | documentService.verifyDocument (misma validación de PDF) | NaN | NaN | documents.test.ts (POST /documents/:id/verifications) | Prueba en navegador | Implementado |
| HU-013 | Comparación de huellas y resultado de la verificación | EP-03 | 3 | RF-30, RF-31, RF-32, RF-33 | RNF-10, RNF-14 | VerificarIntegridadPage (HashCompareResult) | POST /documents/{id}/verifications | documentService.verifyDocument (SHA-256 + comparación) | GetDocument | NaN | documents.test.ts | integracion-fabric.md (pasos 3 y 4) | Implementado (RNF-10 y RNF-14 sin medición formal todavía, Fase 4) |
| HU-014 | Actualización de estado y registro de la verificación | EP-03 | 3 | RF-34, RF-35, RF-36 | RNF-05, RNF-27 | VerificarIntegridadPage ("Nueva verificación") | POST /documents/{id}/verifications | documentService.verifyDocument (ledger antes que MongoDB) | RecordVerification | documents (estado) | documents.test.ts; smartcontract\_test.go | integracion-fabric.md: bloques 10 y 11 | Implementado |
| HU-015 | Consulta general de documentos registrados | EP-03 | 4 | RF-37, RF-38 | RNF-08 | DocumentosPage ( /verificador/documentos ) | GET /documents | documentService.listDocuments (todos, máx. 100) | NaN | documents, users | documents.test.ts (GET /documents) | Prueba en navegador | Implementado (sin búsqueda ni paginación; tope de 100) |
| HU-016 | Consulta general de trazabilidad | EP-03 | 4 | RF-39, RF-40 | RNF-26, RNF-27 | TrazabilidadGlobalPage ( /verificador/trazabilidad ) | GET /events | documentService.getAllEvents (orden cronológico, 200 más recientes) | GetAllEvents | users (nombres) | events.test.ts; smartcontract\_test.go | Prueba en navegador | Implementado |
| HU-017 | Panel general con resumen documental | EP-04 | 4 | RF-41, RF-42 | NaN | DashboardPage ( /administrador/dashboard ) | GET /documents/summary, GET /events | documentService.getDocumentsSummary (aggregate por estado), getAllEvents | GetAllEvents | documents | documents.test.ts (GET /documents/summary) | Prueba en navegador | Implementado |
| HU-018 | Gestión del ciclo de vida de usuarios | EP-04 | 4 | RF-43, RF-44, RF-45, RF-46, RF-47 | RNF-03 | UsuariosPage ( /administrador/usuarios ) | GET /users, POST /users, PUT /users/{id}, POST /users/{id}/deactivate | userService.listUsers, createUser, updateUser, deactivateUser (corta sesiones) | NaN | users, sessions | users.test.ts, userRepository.test.ts | Prueba en navegador | Implementado |
| HU-019 | Consulta administrativa de documentos | EP-04 | 4 | RF-48, RF-49 | RNF-04, RNF-08 | DocumentosPage ( /administrador/documentos ) | GET /documents | documentService.listDocuments (huella enmascarada para el Administrador) | NaN | documents, users | documents.test.ts (GET /documents) | integracion-fabric.md (paso 6) | Implementado |
| HU-020 | Consulta administrativa de trazabilidad | EP-04 | 4 | RF-50, RF-51 | RNF-26, RNF-27 | TrazabilidadPage ( /administrador/trazabilidad ) | GET /events | documentService.getAllEvents (mismo detalle que el Verificador) | GetAllEvents | users (nombres) | events.test.ts | Prueba en navegador | Implementado |
| HU-021 | Despliegue de la red blockchain y del entorno con Docker | EP-05 | 0 | NaN | RNF-19, RNF-20, RNF-21, RNF-22 | SystemStatusPage ( /system-status ) | GET /health, GET /fabric/ping | docker/up.sh, network-up.sh, deploy-cc.sh, compose.app.yml | (despliegue de contracts) | NaN | health.test.ts, fabric.test.ts, cors.test.ts; docker/smoke-test.sh | claude\_docs/tasks/sprint-0-resultados.md; smoke test PASS | Implementado |
| HU-022 | Protección ante intentos fallidos de acceso | EP-01 | Fuera de plan | RF-054 | RNF-06, RNF-07 | LoginPage | POST /auth/login (423), toda ruta protegida (401 por inactividad) | authService.login (failedLoginAttempts, lockedUntil), requireAuth (lastSeenAt) | NaN | users, sessions | auth.login.test.ts, auth.middleware.test.ts | Prueba en navegador | Parcial (falta CA-03: registrar cada intento fallido) |
| HU-023 | Aceptación de la política de tratamiento de datos | EP-01 | Fuera de plan | RF-055 | RNF-30 | NaN | NaN | NaN | NaN | NaN | NaN | NaN | No implementado (falta el texto de la política) |
| HU-024 | Edición y desactivación de usuarios | EP-04 | 4 (dentro de HU-018) | RF-46, RF-47 | RNF-03, RNF-06 | UsuariosPage | PUT /users/{id}, POST /users/{id}/deactivate | userService.updateUser (corta sesiones si cambia el rol), deactivateUser | NaN | users, sessions | users.test.ts | Prueba en navegador | Implementado |

## 2. RF-Implementación
| 2. Requisitos funcionales → implementación | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 |
| --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN |
| RF | Título | HU | Implementado en (endpoint · servicio · pantalla · chaincode) | Estado | Nota |
| RF-001 | Selección de rol | HU-001 | POST /auth/login · authService.login · LoginPage | Implementado | Cambio de diseño: el rol no se elige; se toma de la cuenta (el acceso sigue siendo por rol). |
| RF-002 | Autenticación mediante credenciales | HU-001 | POST /auth/login · authService.login (bcrypt) · LoginPage | Implementado | NaN |
| RF-003 | Autenticación de segundo factor | HU-002 | POST /auth/login · authService.login → emailService.sendOtpEmail (Brevo) · LoginPage | Implementado | NaN |
| RF-004 | Validación del token | HU-002 | POST /auth/verify-otp · authService.verifyOtp (5 min, 5 intentos) · OtpPage | Implementado | NaN |
| RF-005 | Control de acceso por rol | HU-002 | POST /auth/verify-otp + middlewares/auth requireAuth (JWT + sesión + rol) · ProtectedRoute | Implementado | NaN |
| RF-006 | Redirección según rol | HU-002 | POST /auth/verify-otp (devuelve el rol) · OtpPage → panel del rol (AppRoutes) | Implementado | NaN |
| RF-007 | Cierre de sesión | HU-003 | POST /auth/logout · authService.logout (borra la sesión) · UserMenu → LoggedOutPage | Implementado | NaN |
| RF-008 | Carga de documentos | HU-005 | POST /documents (multipart) · documentService.registerDocument, isPdfSignature; multer · CargarDocumentoPage | Implementado | NaN |
| RF-009 | Restricción de formato | HU-005 | POST /documents (multipart) · documentService.registerDocument, isPdfSignature; multer · CargarDocumentoPage | Implementado | NaN |
| RF-010 | Restricción de carga individual | HU-005 | POST /documents (multipart) · documentService.registerDocument, isPdfSignature; multer · CargarDocumentoPage | Implementado | NaN |
| RF-011 | Restricción de tamaño | HU-005 | POST /documents (multipart) · documentService.registerDocument, isPdfSignature; multer · CargarDocumentoPage | Implementado | NaN |
| RF-012 | Validación previa de documentos | HU-005 | POST /documents (multipart) · documentService.registerDocument, isPdfSignature; multer · CargarDocumentoPage | Implementado | NaN |
| RF-013 | Registro del documento | HU-006 | POST /documents · documentService.registerDocument · CargarDocumentoPage · chaincode RegisterDocument | Implementado | NaN |
| RF-014 | Generación de huella criptográfica | HU-006 | POST /documents · documentService.registerDocument · CargarDocumentoPage · chaincode RegisterDocument | Implementado | NaN |
| RF-015 | Registro de la huella criptográfica | HU-006 | POST /documents · documentService.registerDocument · CargarDocumentoPage · chaincode RegisterDocument | Implementado | NaN |
| RF-016 | Registro en blockchain | HU-007 | POST /documents · documentService.registerDocument → fabric/gateway submitChaincodeTransaction · CargarDocumentoPage · chaincode RegisterDocument | Implementado | NaN |
| RF-017 | Confirmación de registro | HU-007 | POST /documents · documentService.registerDocument → fabric/gateway submitChaincodeTransaction · CargarDocumentoPage · chaincode RegisterDocument | Implementado | NaN |
| RF-018 | Consulta de documentos | HU-008 | GET /documents · documentService.listDocuments · MisDocumentosPage | Implementado | NaN |
| RF-019 | Información del documento | HU-008 | GET /documents · documentService.listDocuments · MisDocumentosPage | Implementado | NaN |
| RF-020 | Estado del documento | HU-008 | GET /documents · documentService.listDocuments · MisDocumentosPage | Implementado | NaN |
| RF-021 | Consulta de trazabilidad | HU-009 | GET /documents/{id}/events · documentService.getDocumentEvents · MiTrazabilidadPage · chaincode GetDocument, GetDocumentEvents | Implementado | NaN |
| RF-022 | Información de trazabilidad | HU-009 | GET /documents/{id}/events · documentService.getDocumentEvents · MiTrazabilidadPage · chaincode GetDocument, GetDocumentEvents | Implementado | NaN |
| RF-023 | Acceso al módulo de verificación | HU-010 | requireAuth("Verificador") en POST /documents/{id}/verifications · VerificarIntegridadPage ( /verificador/verificar ) | Implementado | NaN |
| RF-024 | Selección del documento registrado | HU-010 | GET /documents, GET /documents/{id} · documentService.listDocuments, getDocument · VerificarIntegridadPage · chaincode GetDocument | Implementado | Selección en dos pasos: persona → contrato (nota de cambio en el SPEC). |
| RF-025 | Validación de existencia | HU-010 | GET /documents/{id} · documentService.getDocument (404 si no existe) · chaincode GetDocument | Implementado | NaN |
| RF-026 | Consulta de huella registrada | HU-011 | GET /documents/{id} · documentService.getDocument · VerificarIntegridadPage (HashDisplay) · chaincode GetDocument | Implementado | NaN |
| RF-027 | Restricción de visualización del hash | HU-011 | documentService.maskHash en GET /documents y GET /documents/{id} · HashDisplay | Implementado | Solo el Verificador ve la huella completa (nota de cambio 2026-10-15). |
| RF-028 | Carga del documento a verificar | HU-012 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage | Implementado | NaN |
| RF-029 | Validación del documento de comparación | HU-012 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage | Implementado | NaN |
| RF-030 | Generación de hash del documento de comparación | HU-013 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode GetDocument | Implementado | NaN |
| RF-031 | Comparación de huellas | HU-013 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode GetDocument | Implementado | NaN |
| RF-032 | Resultado de la verificación | HU-013 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode GetDocument | Implementado | NaN |
| RF-033 | Visualización de evidencia | HU-013 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode GetDocument | Implementado | NaN |
| RF-034 | Actualización del estado | HU-014 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode RecordVerification | Implementado | NaN |
| RF-035 | Registro de la verificación | HU-014 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode RecordVerification | Implementado | NaN |
| RF-036 | Nueva verificación | HU-014 | POST /documents/{id}/verifications · documentService.verifyDocument · VerificarIntegridadPage · chaincode RecordVerification | Implementado | NaN |
| RF-037 | Consulta de documentos registrados | HU-015 | GET /documents · documentService.listDocuments · DocumentosPage | Implementado | Sin búsqueda ni paginación; tope de 100 documentos. |
| RF-038 | Vista de documentos del verificador | HU-015 | GET /documents · documentService.listDocuments · DocumentosPage | Implementado | NaN |
| RF-039 | Consulta de trazabilidad general | HU-016 | GET /events · documentService.getAllEvents · TrazabilidadGlobalPage · chaincode GetAllEvents | Implementado | NaN |
| RF-040 | Información de trazabilidad general | HU-016 | GET /events · documentService.getAllEvents · TrazabilidadGlobalPage · chaincode GetAllEvents | Implementado | NaN |
| RF-041 | Panel general | HU-017 | GET /documents/summary · documentService.getDocumentsSummary · DashboardPage | Implementado | NaN |
| RF-042 | Resumen documental | HU-017 | GET /documents/summary (aggregate por estado) · DashboardPage (KpiCard) | Implementado | NaN |
| RF-043 | Consulta de usuarios | HU-018 | GET /users · userService.listUsers · UsuariosPage | Implementado | NaN |
| RF-044 | Información de usuarios | HU-018 | GET /users (id, nombre, correo, rol, estado; sin contraseña) · UsuariosPage | Implementado | NaN |
| RF-045 | Creación de usuarios | HU-018 | POST /users · userService.createUser (contraseña temporal) · UsuariosPage | Implementado | NaN |
| RF-046 | Edición de usuarios | HU-018, HU-024 | PUT /users/{id} · userService.updateUser (corta sesiones si cambia el rol) · UsuariosPage | Implementado | NaN |
| RF-047 | Desactivación de usuarios | HU-018, HU-024 | POST /users/{id}/deactivate · userService.deactivateUser (baja lógica + corta sesiones) · UsuariosPage | Implementado | NaN |
| RF-048 | Consulta administrativa de documentos | HU-019 | GET /documents · documentService.listDocuments · DocumentosPage | Implementado | NaN |
| RF-049 | Vista administrativa de documentos | HU-019 | GET /documents · documentService.listDocuments · DocumentosPage | Implementado | NaN |
| RF-050 | Consulta de trazabilidad administrativa | HU-020 | GET /events · documentService.getAllEvents · TrazabilidadPage · chaincode GetAllEvents | Implementado | NaN |
| RF-051 | Registro administrativo de trazabilidad | HU-020 | GET /events · documentService.getAllEvents · TrazabilidadPage · chaincode GetAllEvents | Implementado | NaN |
| RF-052 | Cambio de contraseña | HU-004 | POST /auth/change-password · authService.changePassword · ChangePasswordDialog | Implementado | NaN |
| RF-053 | Validación de cambio de contraseña | HU-004 | POST /auth/change-password (valida la contraseña actual, ≥ 8 caracteres, distinta) · ChangePasswordDialog | Implementado | NaN |
| RF-054 | Bloqueo por intentos fallidos | HU-022 | authService.login · POST /auth/login (423) · LoginPage | Parcial | Bloqueo de 15 min tras 5 intentos; falta registrar cada intento (HU-022 CA-03). |
| RF-055 | Aceptación de la política de tratamiento de datos | HU-023 | NaN | No implementado | NaN |
