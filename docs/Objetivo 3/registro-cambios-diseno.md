# Registro de cambios respecto al diseño inicial: TrazaDoc

Cambios entre lo diseñado en la Fase 2 (OE2) y lo implementado en los Sprints 0‑4 (OE3).
Cada cambio indica su motivo, los requisitos o diagramas afectados y dónde está la evidencia.
Los diagramas de `docs/uml/` ya reflejan el estado implementado.

- **Actualizado:** 2026‑10‑18.
- **Convención de motivo:** lo marcado *(por confirmar)* no tiene motivo documentado en el repositorio y debe completarlo el equipo antes de la entrega.

## Arquitectura e infraestructura

| # | Tema | Diseño inicial | Implementado | Motivo | Afecta | Evidencia |
|---|---|---|---|---|---|---|
| C‑01 | Base de estado del peer | CouchDB | LevelDB | Sin consultas enriquecidas; la trazabilidad usa claves compuestas. | UML 01, 02, 03; RNF‑020 | `docs/Matriz_Infraestructura.xlsx` |
| C‑02 | Topología de la red | 1 organización, 1 peer, 1 CA | 2 organizaciones, 2 peers, 1 orderer (Raft), 3 CA | Se usó la red de prueba oficial de Fabric (`test-network`) *(motivo de fondo por confirmar)*. | UML 02; RNF‑020, RNF‑021 | `docs/evidencias/integracion-fabric.md` (endoso Org1MSP + Org2MSP) |
| C‑03 | Política de endoso | No definida | MAJORITY: firman ambas organizaciones | Consecuencia de C‑02. | UML 01, 02; RNF‑005 | Matriz de infraestructura, OBS‑01 |
| C‑04 | Conexión backend ↔ Fabric | SDK hacia peer y orderer | Fabric Gateway: una conexión al peer, que reenvía al orderer | Menos configuración que el SDK anterior. | UML 01, 02 | Registro de sprints, Sprint 0 |
| C‑05 | Funciones del chaincode | `RegistrarHuella`, `ConsultarHuella`, `ActualizarEstado`, `RegistrarEvento`, `ConsultarTrazabilidad` | `RegisterDocument`, `GetDocument`, `RecordVerification`, `GetDocumentEvents`, `GetAllEvents` | Registro y verificación escriben estado y evento en una sola transacción. | UML 01, 05, 06; RF‑016, RF‑034, RF‑035 | `chaincode/contract/smartcontract_test.go` |
| C‑06 | Correo del código OTP | Servidor SMTP corporativo | Brevo (SMTP relay) | Indicación del tutor. | UML 02, 04; RF‑003 | Registro de sprints, "Después de Sprint 4" |
| C‑07 | Entorno de despliegue | VM de Azure | Docker local; Azure pendiente con el mismo esquema | *(por confirmar)* | UML 02; RNF‑019 | `docker/up.sh`, `docker/smoke-test.sh` |

## Funcionalidad y reglas de negocio

| # | Tema | Diseño inicial | Implementado | Motivo | Afecta | Evidencia |
|---|---|---|---|---|---|---|
| C‑08 | Rol en el login | El usuario elegía su rol | El rol se toma de la cuenta | Evita que un usuario declare un rol que no le corresponde. | RF‑001, RF‑005, RF‑006; UML 00, 04 | Matriz de trazabilidad, RF‑001 |
| C‑09 | Reenvío del código OTP | Endpoint de reenvío, 3 intentos | Sin reenvío, 5 intentos; agotados, se vuelve a iniciar sesión | *(por confirmar)* | RF‑004; UML 04 | `auth.otp.test.ts` |
| C‑10 | Selección del documento a verificar | Ingresar el identificador | Dos pasos: persona → contrato | Un identificador de 36 caracteres no es práctico y dos contratos con el mismo nombre eran indistinguibles. | RF‑024; UML 06 | Registro de sprints, Sprints 3 y 4 |
| C‑11 | Visibilidad de la huella completa | Verificador y Administrador | Solo el Verificador | Decisión tras la prueba manual (2026‑10‑15). | RF‑027, RF‑049; UML 06, 07 | `integracion-fabric.md`, paso 6 |
| C‑12 | Eventos de gestión de usuarios | Se registraban en el ledger | No: el ledger solo guarda eventos de documentos | Los usuarios viven en MongoDB. | RF‑051; UML 03, 07 | Matriz de trazabilidad, HU‑020 |
| C‑13 | Aceptación de la política de datos | Diseñada | Pendiente de implementar | Falta el texto de la política. | RF‑055 (HU‑023) | Matriz de trazabilidad, RF‑055 |
| C‑14 | Registro de intentos fallidos | Registrar cada intento | Bloqueo a los 5 intentos implementado; falta registrar cada intento | Implementación parcial. | RF‑054 (HU‑022, CA‑03) | Matriz de trazabilidad, RF‑054 |

## Resumen

14 cambios: 7 de arquitectura e infraestructura y 7 de funcionalidad. Ninguno elimina un
requisito del SRS v2.0; C‑13 y C‑14 son alcance pendiente.
