# Modelado UML — OE2 (Diseño de Arquitectura y Modelado del Sistema)

Diagramas en formato PlantUML (`.puml`), un diagrama por archivo. **Actualizados el
2026‑10‑15 para reflejar lo implementado** (Sprints 0‑4): nombres de módulos, endpoints,
funciones del chaincode, topología de la red y modelo de datos salen del código real, no
de una propuesta previa.

Fuentes:

- `docs/md/Trabajo de grado final.md` — Fase 2 (OE2) exige "Diagramas UML (Componentes,
  Secuencia y Despliegue)".
- `docs/md/Requerimientos funcionales y no funcionales.md` — RF‑001 a RF‑055 y RNF‑001 a
  RNF‑030, citados en cada paso de las secuencias.
- `docs/md/Matriz_Actores_Stakeholders.md` — los 3 roles operativos.
- El código: `backend/src/`, `chaincode/contract/`, `frontend/src/`, `docker/`.
- `docs/Matriz_Infraestructura.xlsx` — mismos datos de infraestructura que el diagrama
  de despliegue.

## Contenido

| Archivo | Diagrama | Qué muestra |
| --- | --- | --- |
| `00-diagrama-casos-de-uso.puml` | Casos de uso | Los 3 roles, sus casos de uso y los sistemas externos (Fabric, Brevo). |
| `01-diagrama-componentes.puml` | Componentes | Capas y módulos reales: páginas del frontend, `routes/` → `middlewares/` → `services/` → `repositories/` y `fabric/gateway.ts`, chaincode con sus 5 funciones. |
| `02-diagrama-despliegue.puml` | Despliegue | Contenedores Docker con imágenes, versiones, puertos y volúmenes; red Fabric de 2 organizaciones; Brevo. |
| `03-diagrama-mer.puml` | Modelo de datos | Colecciones de MongoDB (`users`, `documents`, `sessions`, `otp_codes`) y world state del ledger (`Document`, `Event`). |
| `04-secuencia-autenticacion.puml` | Secuencia: autenticación | Login, bloqueo por intentos, código por correo (Brevo), sesión, inactividad, logout, cambio de contraseña. |
| `05-secuencia-rol-empleado.puml` | Secuencia: Empleado | Carga y registro en el ledger, mis documentos, mi trazabilidad. |
| `06-secuencia-rol-verificador.puml` | Secuencia: Verificador | Selección en dos pasos, consulta de huella, verificación, documentos, trazabilidad general. |
| `07-secuencia-rol-administrador.puml` | Secuencia: Administrador | Panel, gestión de usuarios, documentos y trazabilidad. |

## Cómo visualizarlos

1. **VS Code:** extensión "PlantUML" (jebbs.plantuml), abrir el `.puml` y `Alt+D`.
2. **Sin instalar nada:** pegar el contenido en https://www.plantuml.com/plantuml/uml/
3. **Línea de comandos (genera PNG):** con Java instalado y `plantuml.jar` descargado de
   https://github.com/plantuml/plantuml/releases:
   `java -jar plantuml.jar -charset UTF-8 -Playout=smetana -tpng docs/uml/*.puml`
   (`-Playout=smetana` evita tener que instalar Graphviz).

## Cambios respecto al diseño inicial (registro para OE2)

| Tema | Diseño inicial | Implementado |
| --- | --- | --- |
| Base de estado del peer | CouchDB | LevelDB (sin consultas enriquecidas; la trazabilidad usa claves compuestas). |
| Topología | 1 organización, 1 peer, 1 CA | 2 organizaciones, 2 peers, 1 orderer (Raft), 3 CA (test-network de Fabric). |
| Política de endoso | — | MAJORITY: firman ambas organizaciones (ver OBS‑01 de la matriz de infraestructura). |
| Conexión backend ↔ Fabric | SDK hacia peer y orderer | Fabric Gateway: una sola conexión al peer; el peer reenvía al orderer. |
| Funciones del chaincode | RegistrarHuella, ConsultarHuella, ActualizarEstado, RegistrarEvento, ConsultarTrazabilidad | `RegisterDocument` (huella + evento en una transacción), `GetDocument`, `RecordVerification` (estado + evento en una transacción), `GetDocumentEvents`, `GetAllEvents`. |
| Eventos de gestión de usuarios | Se registraban en el ledger | No: el ledger solo guarda eventos de documentos; usuarios viven en MongoDB. |
| Selección de rol en el login | El usuario elegía su rol | El rol se toma de la cuenta. |
| Selección del documento a verificar | Ingresar el identificador | Dos pasos: persona → contrato (el identificador queda interno). |
| Huella completa | Verificador y Administrador | Solo el Verificador (RF‑27, 2026‑10‑15). |
| Reenvío del código OTP | Endpoint de reenvío, 3 intentos | Sin reenvío: 5 intentos; agotados, se vuelve a iniciar sesión. |
| Proveedor de correo | Servidor SMTP corporativo | Brevo (SMTP relay), por indicación del tutor. |
| Despliegue | VM de Azure | Docker local; Azure pendiente con el mismo esquema. |
| Aceptación de política de datos (RF‑055) | Diseñada | Pendiente de implementar (se mantiene en los diagramas, marcada como pendiente). |

## Notas

- El modelo de datos separa lo que vive en MongoDB de lo que vive en el ledger: el ledger
  es la autoridad de huella, estado y trazabilidad; MongoDB guarda una copia para listar y
  se escribe siempre después del ledger (RNF‑013).
- Las secuencias de Empleado, Verificador y Administrador asumen que el login
  (`04-secuencia-autenticacion.puml`) ya ocurrió; todas sus rutas pasan por `requireAuth`.
