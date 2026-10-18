## Portada
| Matriz de Arquitectura de Infraestructura |
| --- |
| TrazaDoc: MVP de verificación de integridad y trazabilidad documental en contratos laborales con blockchain permisionada (Hyperledger Fabric) |
| NaN |
| Objetivo específico: OE2, Diseñar la arquitectura del sistema (UX/UI, software e infraestructura sobre Hyperledger Fabric desplegada en Docker). |
| KPI asociado: artefactos de diseño aprobados por el tutor (4 de 4 dominios). Este documento cubre el dominio de infraestructura. |
| Autoras: Laura Sofia Diaz Suarez · Sofia Ortiz Daza, Universidad Católica de Colombia |
| Versión: 1.0 · Fecha: 2026-10-15 · Entorno descrito: Docker local (Docker Desktop + Docker Compose) |
| Fuente: configuración real del repositorio (docker/compose.app.yml, docker/network-up.sh, docker/deploy-cc.sh, test-network de fabric-samples 2.5.16) verificada con el stack en ejecución. |
| NaN |
| Hojas: |
| 1. Componentes: cada nodo/servicio: tecnología, versión, función, puertos, persistencia, seguridad, dependencias y requisitos que cumple. |
| 2. Red Fabric: topología blockchain: organizaciones, canal, consenso, políticas, chaincode. |
| 3. Puertos: mapa de puertos expuestos en el host. |
| 4. Configuración: variables de entorno y secretos. |
| 5. Despliegue: procedimiento reproducible paso a paso. |
| 6. Trazabilidad RNF: qué componente cumple cada requisito no funcional de infraestructura. |
| 7. Observaciones: decisiones de diseño y diferencias entre lo documentado y lo implementado. |
| 8. Aprobación: registro de revisión del tutor (KPI OE2). |

## 1. Componentes
| 1. Componentes de infraestructura | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 | Unnamed: 10 | Unnamed: 11 | Unnamed: 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Capa | Componente | Tecnología / imagen | Versión | Función en el sistema | Contenedor | Puertos (host → contenedor) | Persistencia | Seguridad | Depende de | Requisitos | Lo levanta |
| INF-01 | Presentación | Frontend web | React 19 + Vite + TypeScript, servido por nginx (nginx:alpine) | build de producción | SPA de los 3 roles (Empleado, Verificador, Administrador). Solo conoce la URL del backend (VITE\_API\_URL). | frontend | 127.0.0.1:5173 → 80 | Ninguna (estático) | No conoce ni contacta Fabric ni MongoDB. Publicado solo en localhost. | INF-02 | RNF-19, RNF-20, RNF-25 | docker/compose.app.yml (up.sh paso 3) |
| INF-02 | Aplicación / integración | Backend API | Node.js + Express + TypeScript + Fabric Gateway SDK (node:20-alpine) | Node 20 LTS | API REST: autenticación (JWT + OTP), documentos, verificación, trazabilidad, usuarios. Única puerta hacia Fabric y MongoDB. | backend | 127.0.0.1:8080 → 8080 | Ninguna propia. Monta en solo lectura el material criptográfico de Org1 en /crypto. | Usuario no-root; JWT + sesión revocable; RBAC; CORS acotado al frontend; TLS (grpcs) hacia el peer; identidad Admin de Org1 de solo lectura. | INF-03 (healthy), INF-05, INF-13 | RNF-01, 02, 03, 07, 19, 20 | docker/compose.app.yml (up.sh paso 3) |
| INF-03 | Persistencia | Base de datos off-chain | MongoDB (mongo) | 7.0.41 | Metadatos de documentos (nombre, responsable, fecha, copia de hash y estado), usuarios, sesiones y códigos OTP. Nunca el PDF. | mongo | 127.0.0.1:27017 → 27017 | Volumen contratos\_mongo\_data (/data/db) | Autenticación root; publicado solo en localhost; healthcheck cada 10 s; índices TTL para OTP y sesiones. | NaN | RNF-04, RNF-13 | docker/compose.app.yml (up.sh paso 3) |
| INF-04 | Blockchain | Orderer | hyperledger/fabric-orderer | 2.5.16 | Ordena las transacciones endosadas y corta los bloques del canal (consenso Raft, 1 nodo). | orderer.example.com | 7050 (gRPC), 7053 (admin del canal), 9443 (operaciones) | Volumen compose\_orderer.example.com | TLS mutuo; identidad emitida por INF-09. | INF-09 | RNF-05, RNF-27 | docker/network-up.sh (up.sh paso 1) |
| INF-05 | Blockchain | Peer Org1 | hyperledger/fabric-peer | 2.5.16 | Mantiene una copia del ledger y del world state (LevelDB), ejecuta el chaincode y endosa. Es el endpoint del Gateway que usa el backend. | peer0.org1.example.com | 7051 (gRPC), 9444 (operaciones) | Volumen compose\_peer0.org1.example.com | TLS; identidad emitida por INF-07. | INF-04, INF-07 | RNF-05, 20, 26, 27 | docker/network-up.sh (up.sh paso 1) |
| INF-06 | Blockchain | Peer Org2 | hyperledger/fabric-peer | 2.5.16 | Segunda copia del ledger; ejecuta y endosa el chaincode (requerido por la política MAJORITY). | peer0.org2.example.com | 9051 (gRPC), 9445 (operaciones) | Volumen compose\_peer0.org2.example.com | TLS; identidad emitida por INF-08. | INF-04, INF-08 | RNF-05, RNF-27 | docker/network-up.sh (up.sh paso 1) |
| INF-07 | Blockchain / identidad | CA Org1 | hyperledger/fabric-ca | 1.5.22 | Emite las identidades X.509 de Org1 (peer, Admin que usa el backend). | ca\_org1 | 7054, 17054 (operaciones) | Material en docker/fabric-samples/test-network/organizations (se regenera en cada ciclo down/up) | Red permisionada: solo entran identidades emitidas por una CA del canal. | NaN | RNF-03, RNF-30 | docker/network-up.sh (up.sh paso 1) |
| INF-08 | Blockchain / identidad | CA Org2 | hyperledger/fabric-ca | 1.5.22 | Emite las identidades X.509 de Org2. | ca\_org2 | 8054, 18054 (operaciones) | Igual que INF-07 | Igual que INF-07 | NaN | RNF-03, RNF-30 | docker/network-up.sh (up.sh paso 1) |
| INF-09 | Blockchain / identidad | CA Orderer | hyperledger/fabric-ca | 1.5.22 | Emite las identidades X.509 de la organización del orderer. | ca\_orderer | 9054, 19054 (operaciones) | Igual que INF-07 | Igual que INF-07 | NaN | RNF-30 | docker/network-up.sh (up.sh paso 1) |
| INF-10 | Blockchain / lógica | Chaincode contracts | Go 1.22+ con fabric-contract-api-go v2.2.0 | 1.0 (secuencia 1) | Registra huellas SHA-256 y eventos; consulta documentos y trazabilidad (5 funciones). Lo lanza cada peer en su propio contenedor. | dev-peer0.org1…contracts\_1.0, dev-peer0.org2…contracts\_1.0 | : (solo lo invoca el peer) | World state del canal (en el ledger de cada peer) | Nunca recibe el PDF; timestamps deterministas de la transacción; la identidad del usuario la valida el backend. | INF-05, INF-06, INF-11 | RNF-04, 05, 11, 26, 27 | docker/deploy-cc.sh (up.sh paso 2) |
| INF-11 | Blockchain (lógico) | Canal contratoschannel | Canal de aplicación de Fabric | NaN | Ledger compartido entre Org1 y Org2 donde vive el chaincode contracts. | NaN | NaN | Ledger en INF-05 e INF-06 | Políticas de lectura/escritura/endoso por organización (ver hoja 2). | INF-04, INF-05, INF-06 | RNF-05, RNF-27 | docker/network-up.sh (up.sh paso 1) |
| INF-12 | Red | Red Docker fabric\_test | Red bridge de Docker | NaN | Une todos los contenedores; resuelven por nombre DNS (p. ej. peer0.org1.example.com, mongo). | NaN | NaN | NaN | Tráfico interno entre contenedores; el backend nunca usa localhost para llegar al peer. | NaN | RNF-19, RNF-21 | docker/network-up.sh (la crea); compose.app.yml la usa como externa |
| INF-13 | Servicio externo | Correo transaccional | Brevo SMTP relay (smtp-relay.sendinblue.com) | Plan gratuito (300 correos/día) | Envía el código de verificación (OTP) del segundo factor al correo del usuario. | : (servicio en la nube) | Saliente 587 (STARTTLS) | NaN | Clave SMTP por persona en docker/.env (no versionado); remitente verificado contratosblockchain@gmail.com. | NaN | RNF-02 | Variables SMTP\_\* en docker/.env |

## 2. Red Fabric
| 2. Topología de la red Hyperledger Fabric | Unnamed: 1 | Unnamed: 2 |
| --- | --- | --- |
| NaN | NaN | NaN |
| Aspecto | Valor implementado | Detalle / justificación |
| Versión de Fabric / Fabric CA | 2.5.16 / 1.5.22 | Versiones fijadas en docker/network-up.sh; nunca se usa 'latest' al descargar (las imágenes locales llevan además la etiqueta latest, que apunta a 2.5.16). |
| Base de la red | test-network de fabric-samples, con Fabric CA (-ca) | Herramienta canónica de Fabric para redes locales; Fabric CA (en vez de cryptogen) para emitir identidades (decisiones D1 y D5 de Sprint 0). |
| Organizaciones | Org1MSP, Org2MSP (peers) + OrdererOrg | Topología estándar de la test-network, sin recortar a una sola organización (D1). |
| Peers | peer0.org1.example.com, peer0.org2.example.com | 1 peer por organización; cada uno con su copia del ledger. |
| Orderer / consenso | 1 orderer, etcdraft (Raft) | BatchTimeout 2 s, MaxMessageCount 10 (valores por defecto de configtx.yaml). |
| Canal | contratoschannel | Canal único del proyecto (D2). |
| Base de estado (state DB) | LevelDB (goleveldb) | La trazabilidad usa claves compuestas y rangos, que LevelDB soporta; no se necesitan consultas enriquecidas de CouchDB (D3). |
| Chaincode | contracts v1.0, secuencia 1, Go | Ciclo de vida gestionado por el peer (package → install → approve → commit); aprobado por Org1MSP y Org2MSP. |
| Política de endoso del chaincode | /Channel/Application/Endorsement = MAJORITY Endorsement | Con 2 organizaciones, MAJORITY exige la firma de AMBAS. El Fabric Gateway del backend recolecta las dos firmas automáticamente. Ver hoja 7, observación OBS-01. |
| Políticas del canal | Readers/Writers/Admins por organización; LifecycleEndorsement = MAJORITY | Valores por defecto de configtx.yaml de la test-network. |
| Material criptográfico | docker/fabric-samples/test-network/organizations/ | Se regenera completo en cada ciclo network-down → network-up: ninguna identidad sobrevive. No se versiona. |
| Acceso desde la aplicación | Backend → peer0.org1.example.com:7051 vía Fabric Gateway (grpcs/TLS) | Una sola conexión al peer; el peer reenvía al orderer. El frontend nunca accede a la red (RNF-20). |

## 3. Puertos
| 3. Mapa de puertos en el host | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 |
| --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN |
| Puerto | Servicio | Protocolo | Publicado en | Uso |
| 5173 | frontend | HTTP | 127.0.0.1 (solo local) | Aplicación web (navegador). |
| 8080 | backend | HTTP | 127.0.0.1 (solo local) | API REST que consume el frontend. |
| 27017 | mongo | MongoDB wire | 127.0.0.1 (solo local) | Acceso de desarrollo (npm run seed, MongoDB Compass). |
| 7050 | orderer.example.com | gRPC + TLS | 0.0.0.0 (todas las interfaces) | Recepción de transacciones para ordenar. |
| 7053 | orderer.example.com | HTTPS | 0.0.0.0 | API de administración de canales (osnadmin). |
| 9443 | orderer.example.com | HTTP | 0.0.0.0 | Servicio de operaciones (salud y métricas). |
| 7051 | peer0.org1.example.com | gRPC + TLS | 0.0.0.0 | Endpoint del peer de Org1 / Fabric Gateway. |
| 9444 | peer0.org1.example.com | HTTP | 0.0.0.0 | Servicio de operaciones del peer de Org1. |
| 9051 | peer0.org2.example.com | gRPC + TLS | 0.0.0.0 | Endpoint del peer de Org2. |
| 9445 | peer0.org2.example.com | HTTP | 0.0.0.0 | Servicio de operaciones del peer de Org2. |
| 7054 | ca\_org1 | HTTPS | 0.0.0.0 | Emisión de identidades de Org1. |
| 8054 | ca\_org2 | HTTPS | 0.0.0.0 | Emisión de identidades de Org2. |
| 9054 | ca\_orderer | HTTPS | 0.0.0.0 | Emisión de identidades del orderer. |
| 17054 / 18054 / 19054 | ca\_org1 / ca\_org2 / ca\_orderer | HTTP | 0.0.0.0 | Servicio de operaciones de cada CA. |
| 587 | Brevo (externo) | SMTP + STARTTLS | Saliente | Envío del correo con el código OTP. |

## 4. Configuración
| 4. Variables de entorno | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 |
| --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN |
| Variable | Archivo | Valor por defecto | ¿Secreto? | Descripción |
| MONGO\_ROOT\_USER / MONGO\_ROOT\_PASSWORD | docker/.env | root / changeme | Sí (en un ambiente real) | Credenciales de MongoDB; compose arma MONGO\_URI del backend a partir de ellas. |
| MONGO\_PORT | docker/.env | 27017 | No | Puerto publicado de MongoDB en el host. |
| BACKEND\_PORT | docker/.env | 8080 | No | Puerto publicado del backend en el host. |
| JWT\_SECRET | docker/.env | valor de desarrollo documentado | Sí | Clave de firma de los JWT de sesión; el backend no arranca sin ella. |
| JWT\_EXPIRES\_MINUTES | docker/.env | 60 | No | Vida máxima de una sesión. |
| FRONTEND\_PORT | docker/.env | 5173 | No | Puerto publicado del frontend; también define el origen permitido por CORS. |
| VITE\_API\_URL | docker/.env | http://localhost:8080 | No | URL del backend que se compila dentro del frontend (cambiarla exige reconstruir la imagen). |
| SMTP\_HOST / SMTP\_PORT | docker/.env | vacío / 587 | No | Servidor de correo (smtp-relay.sendinblue.com). Vacío = el OTP se imprime en los logs del backend (modo desarrollo). |
| SMTP\_USER / SMTP\_PASSWORD | docker/.env | vacío | Sí | Login y clave SMTP de Brevo (una clave por persona). |
| SMTP\_FROM | docker/.env | no-reply@contratos.local | No | Remitente verificado en Brevo (contratosblockchain@gmail.com). |
| SEED\_EMAIL | backend/.env | vacío | No | Buzón real para los usuarios de prueba del seed (buzon+rol@dominio). |
| OTP\_TTL\_MINUTES / OTP\_MAX\_ATTEMPTS | valores por defecto del backend | 5 / 5 | No | Vigencia e intentos del código OTP. |
| SESSION\_INACTIVITY\_MINUTES | valores por defecto del backend | 15 | No | Cierre de sesión por inactividad (RNF-07). |
| MAX\_LOGIN\_ATTEMPTS / LOGIN\_LOCKOUT\_MINUTES | valores por defecto del backend | 5 / 15 | No | Bloqueo temporal tras intentos fallidos (RF-054). |
| FABRIC\_PEER\_ENDPOINT / FABRIC\_CRYPTO\_PATH | valores por defecto del backend | peer0.org1.example.com:7051 / /crypto/... | No | Conexión del Gateway al peer y ruta de la identidad montada. |

## 5. Despliegue
| 5. Procedimiento de despliegue (Docker local) | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| NaN | NaN | NaN | NaN |
| Paso | Comando (desde la raíz del repo, en Git Bash) | Qué hace | Verificación |
| 0 | Requisitos: Docker Desktop, Git Bash o WSL2, Go 1.22+, jq, Node.js 20 | Herramientas del host. La primera vez se descargan ~2-3 GB de imágenes de Fabric. | docker ps responde |
| 1 | cp docker/.env.example docker/.env · cp backend/.env.example backend/.env | Configuración local (no versionada). Completar SMTP\_\* y SEED\_EMAIL. | NaN |
| 2 | bash docker/up.sh | Orquesta los pasos 2a-2c en una sola orden. | Mensaje 'Todo arriba' |
| 2a | (dentro de up.sh) docker/network-up.sh | Descarga fabric-samples con versión fijada, levanta orderer + 2 peers + 3 CA y crea/une el canal contratoschannel con LevelDB. | 6 contenedores Fabric en Up |
| 2b | (dentro de up.sh) docker/deploy-cc.sh | Empaqueta, instala, aprueba y confirma el chaincode contracts; prueba un registro y el rechazo de un duplicado. | 'OK: el documento duplicado fue rechazado' |
| 2c | (dentro de up.sh) docker compose ... up -d --build mongo backend frontend | Construye y levanta MongoDB, backend y frontend en la red fabric\_test. | mongo healthy; backend y frontend Up |
| 3 | cd backend && npm install && npm run seed | Siembra un usuario de prueba por rol. | 4 usuarios listos |
| 4 | bash docker/smoke-test.sh | Verifica HU-021: servicios arriba, chaincode respondiendo y frontend sin acceso directo a la infraestructura. | PASS (CA-01 y CA-02) |
| 5 | bash docker/down.sh | Baja todo y borra los volúmenes (entorno limpio). | Ningún contenedor del proyecto en docker ps |

## 6. Trazabilidad RNF
| 6. Requisitos no funcionales de infraestructura → componentes | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 |
| --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN |
| RNF | Enunciado (resumen) | Componentes | Cómo se cumple | Evidencia |
| RNF-19 | Arquitectura modular por capas | INF-01, INF-02, INF-03, INF-05/06 | Presentación, aplicación/integración, blockchain y persistencia en contenedores separados. | docker/compose.app.yml; test-network |
| RNF-20 | El frontend no interactúa con Fabric | INF-01, INF-02 | El frontend solo conoce VITE\_API\_URL; el backend es la única puerta (Fabric Gateway). | smoke-test.sh CA-02 |
| RNF-21 | Ejecutable con Docker y Docker Compose | Todos | Una sola orden (up.sh) levanta todo; versiones fijadas. | smoke-test.sh CA-01; claude\_docs/tasks/sprint-0-resultados.md |
| RNF-22 | Arquitectura extensible | INF-02, INF-10 | Backend por capas (routes → services → repositories/fabric); el chaincode creció de 3 a 5 funciones sin rediseñar la red. | Historial de Sprints 2-4 |
| RNF-04 | No almacenar el contrato en la blockchain | INF-10, INF-03 | El ledger guarda solo huella y eventos; MongoDB solo metadatos. | chaincode/README.md |
| RNF-05 / RNF-27 | Huellas inmutables; eventos con orden y txID | INF-04, INF-05, INF-06, INF-10, INF-11 | Ledger replicado en 2 peers; eventos solo de anexado con TxID y timestamp de la transacción. | GET /events |
| RNF-13 | Consistencia MongoDB ↔ Fabric | INF-02, INF-03, INF-10 | Se escribe primero en el ledger y luego en MongoDB; nunca al revés. | backend/README.md (RNF-13) |
| RNF-02 | Segundo factor por token | INF-02, INF-13 | OTP enviado por correo mediante Brevo. | Prueba manual 2026-10-14/15 |
| RNF-12 | Disponibilidad durante las pruebas | Todos | restart: unless-stopped en mongo/backend/frontend; healthcheck de MongoDB; /health del backend. | Pendiente de medición formal (Fase 4) |
| RNF-30 | Alineación con ISO/IEC 27001 Anexo A | INF-02, INF-07/08/09 | Control de acceso (A.8.2/A.5.15), criptografía (A.8.24: TLS, SHA-256, X.509), mínimo privilegio (crypto montado en solo lectura). | Criterio de diseño, no certificación |

## 7. Observaciones
| 7. Decisiones y diferencias entre lo documentado y lo implementado | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 |
| --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN |
| ID | Tema | Documentado | Implementado | Impacto / acción sugerida |
| OBS-01 | Política de endoso | Plan de Sprint 0 (D2) y Sprint 2 (D7): OR('Org1MSP.peer','Org2MSP.peer'), basta una organización. | Política por defecto del canal: MAJORITY Endorsement → con 2 organizaciones firman AMBAS. | Funciona (el Gateway pide las dos firmas). Decidir: corregir la documentación a MAJORITY, o desplegar el chaincode con --signature-policy OR(...) si se quiere que baste una. |
| OBS-02 | Base de estado | OBJETIVO 3 menciona CouchDB en el script de red. | LevelDB (goleveldb). | Decisión D3 de Sprint 0: no se usan consultas enriquecidas. Anotarlo en el registro de cambios respecto al diseño. |
| OBS-03 | Topología en el benchmarking | benchmarking\_mvp\_gcp: 'Red local: 1 org, 1 peer, 1 orderer, 1 CA'. | 2 organizaciones, 2 peers, 1 orderer, 3 CA. | Actualizar el cuadro de benchmarking o explicar el cambio (D1 de Sprint 0). |
| OBS-04 | Exposición de puertos de Fabric | NaN | Los puertos de la red Fabric se publican en 0.0.0.0 (todas las interfaces); los de la aplicación solo en 127.0.0.1. | Aceptable en local. Para Azure, restringir con reglas de red (NSG) o publicar solo en localhost. |
| OBS-05 | Entorno de despliegue | Trabajo de grado: Docker local + VM de Azure (Azure Student) para pruebas. | Solo Docker local. | Pendiente: despliegue en Azure (criterio 4 de la Definición de Terminado). Las mediciones de rendimiento S11/S13 son en Docker local. |
| OBS-06 | Material criptográfico | NaN | Se regenera en cada ciclo down/up; no hay respaldo de identidades. | Correcto para el MVP (entorno desechable). En producción se requeriría gestión de identidades persistente. |
| OBS-07 | Proveedor de correo | SRS: OTP por correo corporativo. | Brevo con remitente Gmail verificado, por indicación del tutor. | Puede caer en spam sin dominio propio + DKIM; aceptable para el MVP. |

## 8. Aprobación
| 8. Registro de revisión y aprobación (KPI OE2) | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 |
| --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN |
| Revisor | Rol | Fecha de revisión | Estado | Observaciones | Firma / acta |
| NaN | Director | NaN | Pendiente | NaN | NaN |
| NaN | Codirectora | NaN | Pendiente | NaN | NaN |
