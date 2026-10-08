# SPEC.md — Fuente única de verdad

> **MVP de un sistema web para la verificación de integridad y trazabilidad documental
> en contratos laborales mediante blockchain permisionada (Hyperledger Fabric).**
>
> Equipo: Laura Sofia Diaz Suarez · Sofia Ortiz Daza — Universidad Católica de Colombia.
> Versión del documento base: SRS v2.0 (2026‑08‑31). Este archivo consolida `docs/md/*`.

Este documento es la **fuente de verdad** para alcance, diseño y planeación. Si el código
contradice este archivo, gana este archivo o se corrige aquí de forma explícita (con nota
de cambio). Los planes de desarrollo (`claude_docs/tasks/plan.md`, `claude_docs/tasks/todo.md`) y cada PR deben
trazar a un **id de módulo** y a los **RF/RNF/HU** de este documento.

Convenciones de trazabilidad de origen:

| Fuente | Archivo |
|---|---|
| Requerimientos | `docs/md/Requerimientos funcionales y no funcionales.md` |
| Backlog, HU, Gherkin, DoD | `docs/md/Requisitos_Historias_Usuario_ (backlog incluido).md` |
| Actores / universo de KPI | `docs/md/Matriz_Actores_Stakeholders.md` |
| Trazabilidad normativa | `docs/md/Matriz_Normativa.md` |
| Objetivos, KPIs, metodología, stack | `docs/md/Trabajo de grado final.md` |
| Referencia operativa de Fabric | `claude_docs/ops_guide/`, `claude_docs/tutorials/` |

---

## 1. Objetivo

**Objetivo general.** Desarrollar un MVP de un sistema web basado en blockchain
permisionada para la verificación de integridad y trazabilidad documental en contratos
laborales.

**Objetivos específicos (OE).**

| OE | Descripción | Fase metodológica |
|---|---|---|
| OE1 | Identificar requerimientos funcionales, no funcionales y normativos del MVP. | Fase 1 — Análisis |
| OE2 | Diseñar la arquitectura (UX/UI, software, infraestructura sobre Fabric en Docker). | Fase 2 — Diseño |
| OE3 | Desarrollar el MVP integrado con una red Hyperledger Fabric en Docker (registro, verificación, consulta, trazabilidad de hashes en el ledger). | Fase 3 — Desarrollo |
| OE4 | Evaluar el MVP con un Plan de Pruebas de Software (funcional, detección de alteraciones, rendimiento). | Fase 4 — Evaluación |

**Qué es "éxito" (medible).** Ver §12 (KPIs). En síntesis: ≥90 % de casos de prueba
funcionales PASS, P95 de verificación ≤ 3000 ms, y 100 % de detección sobre 20 documentos
alterados.

### 1.1 Usuarios / actores

| # | Actor | Rol frente al sistema | RF | RNF |
|---|---|---|---|---|
| 1 | Todos los usuarios autenticados | Transversal a los 3 roles | RF‑01…07, RF‑52, RF‑53 | RNF‑01, 02, 03, 07 |
| 2 | Empleado (firmante) | Carga y consulta de sus documentos | RF‑08…22 | (normativo) |
| 3 | Verificador | Auditoría de integridad documental | RF‑23…40 | (normativo) |
| 4 | Administrador | Gobierno del sistema y de los usuarios | RF‑41…51 | (normativo) |
| 5 | Actor normativo | No opera; impone restricciones de diseño (Ley 527/1999, Decreto 2364/2012, Ley 1581/2012, ISO/IEC 27001:2022 Anexo A) | — | RNF‑01…30 |

Universo de medición de KPI‑1.1: **53 RF + 30 RNF = 83 requerimientos**.

### 1.2 Alcance y límites

**Dentro del alcance:** 3 roles; carga individual de PDF ≤ 20 MB; huella SHA‑256; registro
de huella y eventos en Hyperledger Fabric; verificación por recomputo y comparación de
hash; trazabilidad desde el ledger con `txID`; panel administrativo y ciclo de vida de
usuarios (baja lógica); despliegue con Docker Compose.

**Fuera del alcance (declarado en el anteproyecto, numerales 2.6.1 / 2.6.2):**

- Firma electrónica / digital avanzada con PKI de validez jurídica plena (Ley 527 Art. 7,
  Decreto 2364/2012). El sistema **complementa**, no reemplaza, la firma.
- Cargas masivas o por lotes; pruebas de carga a escala empresarial.
- Formatos distintos a PDF.
- Almacenamiento del contenido del contrato en la blockchain (solo huella + eventos).
- Implementación o certificación de un SGSI ISO/IEC 27001 completo; auditorías de
  cumplimiento normativo. La norma se usa **solo como criterio de diseño** (RNF‑30).
- Prevención de fuga, reenvío externo, impresión o exfiltración previa al registro.

---

## 2. Stack tecnológico

Conflictos entre documentos resueltos aquí (decisión de proyecto, 2026‑09‑06):

| Capa | Tecnología | Versión | Nota / conflicto resuelto |
|---|---|---|---|
| Frontend | React + Vite + TypeScript | React 19, Vite 8 | Ya andamiado en `frontend/`. El trabajo de grado decía "React v18+"; se usa 19. |
| UI | Tailwind CSS v4 + shadcn/ui (`radix-nova`), Radix UI, lucide | Tailwind 4 | Sin archivo de config Tailwind (plugin `@tailwindcss/vite`). |
| Lint frontend | oxlint | 1.x | **No** ESLint. |
| Backend | Node.js + Express | Node 20 LTS | Gateway único hacia Fabric (RNF‑20). |
| Autenticación | **JWT de sesión + OTP de un solo uso por correo corporativo (2FA)** | — | SRS exige 2FA por correo (RF‑03/04); Tabla 2 del trabajo de grado menciona JWT. Se usan **ambos**: JWT para la sesión, OTP por correo como segundo factor. Contraseñas con hash + salt (RNF‑01). |
| Blockchain | Hyperledger Fabric | **2.5** | Red permisionada en Docker. |
| Chaincode | **Go (Golang)** | Go 1.22+ | Decisión fija. La fase 3 del trabajo de grado decía "Node.js/Go"; se usa Go. |
| Persistencia off‑chain | MongoDB | 7.x | Metadatos y estado operativo. Consistencia con el ledger: RNF‑13. |
| Infraestructura | Docker + Docker Compose | — | RNF‑21. |
| SDK de integración | Fabric Gateway (Node) | alineado a Fabric 2.5 | Solo el backend lo usa. |

Idioma: **identificadores y código en inglés; documentación, textos de usuario y
comunicación en español.**

---

## 3. Mapa de capacidades (módulos)

Un requisito bundle de 5 capacidades independientemente verificables (las 5 épicas del
backlog). Se especifican y construyen por id, en orden de dependencia.

| id de módulo | Responsabilidad | Épica | RF | RNF | Depende de |
|---|---|---|---|---|---|
| `infra` | Red Fabric (orderer, peers, CAs, 1 canal), MongoDB, contenedores, `docker-compose`. Entorno reproducible. | EP‑05 | — | RNF‑19, 20, 21, 22 | — |
| `identity` | Selección de rol, login (credenciales + OTP por correo), sesión JWT, RBAC, cierre de sesión, cambio de contraseña, ciclo de vida de usuarios (crear/editar/desactivar). | EP‑01, EP‑04 (RF‑43…47) | RF‑01…07, RF‑43…47, RF‑52, RF‑53 | RNF‑01, 02, 03, 07, 08 | `infra` |
| `ledger` | Chaincode Go + integración backend↔Fabric: registrar huella y eventos, retornar `txID`, leer trazabilidad desde el ledger. El chaincode nunca recibe el PDF. | transversal a EP‑02/03/04 | RF‑16, 22, 35, 40, 51 | RNF‑04, 05, 13, 26, 27 | `infra` |
| `documents` | Carga y validación de PDF (formato, tamaño, individual), registro de metadatos, huella SHA‑256, consulta de "mis documentos" y estado (Pendiente/Verificado/Alterado). | EP‑02 | RF‑08…21 | RNF‑09, 11, 23, 24 | `identity`, `ledger` |
| `verification` | Selección de documento, consulta de huella registrada (con control de visibilidad), carga y validación del documento a comparar, recomputo SHA‑256, comparación, resultado, actualización de estado, registro de la verificación, "nueva verificación", consultas generales. | EP‑03 | RF‑23…40 | RNF‑08, 10, 14, 15, 17 | `documents`, `ledger` |
| `administration` | Panel general + resumen documental (totales por estado), consulta administrativa de documentos y de trazabilidad. | EP‑04 | RF‑41, 42, 48…51 | RNF‑04, 08, 26, 27 | `documents`, `verification`, `ledger` |

**Dirección de dependencias (sin ciclos):**

```
infra ──┬──> identity ──> documents ──> verification ──> administration
        └──> ledger ─────────^──────────────^────────────────^
```

**Orden de construcción (alineado a sprints del backlog):**

| Sprint | Módulos | HU |
|---|---|---|
| Sprint 0 | `infra` | HU‑021 |
| Sprint 1 | `identity` | HU‑001…004 |
| Sprint 2 | `documents`, `ledger` | HU‑005…007 |
| Sprint 3 | `verification` | HU‑010…014 |
| Sprint 4 | `administration` + consultas restantes | HU‑008, 009, 015…020 |

**Estado de implementación (actualizado 2026‑10‑07):** `infra` (Sprint 0) completo —
RNF‑19, 20, 21, 22, evidencia en `claude_docs/tasks/sprint-0-resultados.md`. `identity`
(Sprint 1) completo — **RF‑01…07, RF‑52, RF‑53 y RNF‑01, 02, 03, 07 implementados y
verificados** (login con OTP, sesión JWT con invalidación real, RBAC, cambio de
contraseña; detalle en `claude_docs/tasks/todo-sprint1-identity.md`). La porción de
`identity` que corresponde a RF‑43…47 (ciclo de vida de usuarios) no se tocó todavía —
llega con HU‑018 en Sprint 4, como ya fija la tabla de arriba.

`documents` + `ledger` (Sprint 2) completos para la mitad de **carga** del módulo —
**RF‑08…17 y RNF‑04, 05, 13, 23, 24 implementados y verificados** (chaincode Go real con
`RegisterDocument`, `POST /documents` con validación de PDF por firma real + tamaño,
huella SHA‑256, escritura real al ledger seguida de Mongo, nunca al revés — D13/RNF‑13 —,
`CargarDocumentoPage` del frontend conectada; detalle en
`claude_docs/tasks/todo-sprint2-documents-ledger.md`). **RNF‑09 y RNF‑11 solo parciales,
no completos:** RNF‑09 ("tiempo de respuesta adecuado en consulta **y verificación**") no
tiene nada que medir todavía — Sprint 2 no construyó ninguna consulta. RNF‑11
("generación **y comparación** de huellas SHA‑256") solo tiene la generación; la
comparación es del módulo `verification` (Sprint 3). RF‑18…22 (la
porción de consulta de "mis documentos"/trazabilidad del Empleado, dentro de la misma
épica) no se tocaron todavía — el chaincode no expone ninguna función de lectura (decisión
D6 del plan de Sprint 2); llegan con Sprint 3/4 junto con `verification`/`administration`,
que dependen de esa misma lectura.

Cada módulo se especifica en su propio `claude_docs/SPEC-<id>.md` **solo si** su diseño
necesita más detalle del que cabe aquí. El mapa de arriba es el índice de lo que existe.

---

## 4. Arquitectura

Cuatro capas (RNF‑19), flujo de una sola dirección (RNF‑20):

```
frontend (React)  ──HTTP/REST──>  backend (Node + Express + Fabric Gateway)
                                        │
                        ┌───────────────┼────────────────┐
                        ▼                                ▼
                  MongoDB (metadatos,             Hyperledger Fabric
                  estado, usuarios)               (chaincode Go: huellas + eventos, txID)
```

- El **frontend nunca** habla con Fabric ni con MongoDB directamente (RNF‑20; verificado
  en HU‑021 CA‑02).
- **Persistencia híbrida (RNF‑04):** el PDF no se almacena ni en MongoDB ni en el ledger.
  El ledger guarda solo la huella SHA‑256 y los eventos de trazabilidad. MongoDB guarda
  metadatos, estado y usuarios.
- **Consistencia (RNF‑13):** para cada documento, `documentId`, huella y eventos deben
  coincidir entre MongoDB y el ledger.

### 4.1 Modelo de dominio (world state + off‑chain)

**Documento**

| Campo | Dónde vive | Notas |
|---|---|---|
| `documentId` | MongoDB + ledger | identificador único generado al registrar (RF‑13) |
| `name`, `responsibleUser`, `registeredAt` | MongoDB | metadatos mínimos (RF‑13, RF‑19) |
| `hash` (SHA‑256) | ledger (autoridad) + copia en MongoDB | generado sobre el contenido binario completo (RF‑14) |
| `status` | ledger (autoridad) + copia en MongoDB | `Pendiente` \| `Verificado` \| `Alterado` (RF‑20); solo lo cambia RF‑34, nunca manual (nota de cambio, Sprint 3 T3: la fila original solo decía "MongoDB" — correcto hasta Sprint 2, donde nada lo mutaba todavía; `RecordVerification` del chaincode (Sprint 3 T1) ya lo actualiza on-chain, igual que `hash`, así que el ledger es la autoridad real para ambos) |

**Evento de trazabilidad (en el ledger)**

`{ documentId, action, user, txID, timestamp, result? }` — orden cronológico inmutable
(RNF‑27). `action` ∈ `registro` \| `verificacion`. `result` ∈ `confirmada` \|
`comprometida` (solo en verificación). `txID` lo retorna Fabric por transacción (RF‑16).

**Usuario**

`{ userId, name, role, email, status }` — `role` ∈ `Empleado` \| `Verificador` \|
`Administrador`; `status` ∈ `Activo` \| `Inactivo`. Desactivación = baja lógica; nunca
borrado físico, nunca afecta trazabilidad histórica (RF‑47).

---

## 5. Comandos

### frontend/ (ejecutar dentro de `frontend/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo Vite |
| `npm run build` | `tsc -b` (typecheck) + `vite build` |
| `npm run lint` | oxlint |
| `npm run preview` | sirve el build de producción |

### backend/ (ejecutar dentro de `backend/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo (`tsx watch`) |
| `npm run build` | `tsc -p tsconfig.json` |
| `npm start` | corre el build (`dist/server.js`) |
| `npm run seed` | siembra usuarios de prueba (`identity`, uno por rol — ver `backend/README.md`) |
| `npm test` | Jest (`npx jest <archivo>` para un test único) |
| `npm run lint` | oxlint (mismo linter que `frontend/`, no ESLint) |

### docker/ (ejecutar desde la raíz del repo)

| Comando | Qué hace |
|---|---|
| `bash docker/up.sh` | todo el stack en un solo comando (T7 de Sprint 0, actualizado en T5 de Sprint 2): red Fabric → chaincode real del proyecto (`contracts`) → Mongo/backend/frontend. Crea `docker/.env` si falta. |
| `bash docker/down.sh` | inversa de `up.sh`: baja todo, volúmenes incluidos |
| `bash docker/network-up.sh` | solo la red Fabric + canal `contratoschannel` (T1) |
| `bash docker/network-down.sh` | solo baja la red Fabric |
| `bash docker/deploy-cc.sh` | despliega el chaincode real del proyecto (`chaincode/`, `contracts`): empaqueta/instala/aprueba/comete + una prueba de extremo a extremo (Sprint 2, T2). Reemplaza a `deploy-sample-cc.sh` (retirado, Sprint 0 decisión D9). |
| `cp docker/.env.example docker/.env` | prerrequisito único antes de los comandos sueltos de Mongo/backend/frontend (T3) — `up.sh` ya lo hace solo |
| `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo backend frontend` | Mongo + backend + frontend (T3/T4/T6), unidos a la red `fabric_test` |
| `docker compose -f docker/compose.app.yml down` | baja Mongo/backend/frontend (agregar `-v` para borrar también el volumen de Mongo) |

Detalle de cada comando de `docker/`, puertos y los bugs de Windows/Git Bash ya
corregidos: `docker/README.md`.

### chaincode/

Real desde Sprint 2 (módulo `ledger`, T1): `go build ./...`, `go test ./...`,
`go test -run <TestName> ./...` (test único), `go vet ./...`, `gofmt -l .`. Detalle del
contrato (qué valida, modelo de datos, cómo desplegarlo con `docker/deploy-cc.sh`):
`chaincode/README.md`.

---

## 6. Estructura del proyecto

```
chaincode/     → Chaincode en Go (Hyperledger Fabric). Lógica on‑chain y modelo de world state.
backend/       → Servicio Node.js + Express. Gateway hacia Fabric (Fabric Gateway SDK),
                 API REST, identidad/wallets, auth (JWT + OTP), acceso a MongoDB.
  src/
  tests/       → pruebas unitarias e integración (Jest)
frontend/      → SPA React 19 + Vite + TS. Solo habla con backend/.
  src/components/ui/  → primitivas shadcn/ui
  src/lib/utils.ts    → helper cn()
  src/pages|features/  → por rol (Empleado / Verificador / Administrador)
docker/        → docker-compose + config de la red Fabric (orderer, peers, CAs) + MongoDB.
docs/          → Documentación del trabajo de grado (fuentes .docx/.xlsx/.pdf + conversión en docs/md/).
claude_docs/   → Este SPEC.md + mirror local de la documentación de Hyperledger Fabric.
  tasks/       → plan.md y todo.md de la iteración vigente (versionado).
```

Alias de import en frontend: `@/` → `frontend/src/`.

---

## 7. Estilo de código

- **Inglés** en identificadores, nombres de archivo, mensajes de commit técnicos, comentarios de código.
- **Español** en textos de UI, mensajes de error para el usuario (RNF‑18), documentación.
- Frontend: componentes funcionales, hooks; primitivas de `src/components/ui/`; `cn()` para clases.
- Backend: capas separadas — `routes/ → controllers/ → services/ → repositories|fabric/`. La lógica de Fabric no se filtra a los controllers.
- Chaincode: un contrato (`contract`), funciones cortas, sin dependencias externas de red; validar todo argumento; nunca registrar el PDF.

Ejemplo (chaincode Go — forma esperada):

```go
// RegisterDocument anchors a document's SHA-256 fingerprint and a "registro" event.
// It never receives or stores the PDF itself (RF-16 RN-01, RNF-04).
func (c *ContractsContract) RegisterDocument(ctx contractapi.TransactionContextInterface,
	documentID string, sha256Hex string, user string) (*Event, error) {

	if err := validateHash(sha256Hex); err != nil {
		return nil, fmt.Errorf("invalid fingerprint: %w", err)
	}
	if exists, _ := c.documentExists(ctx, documentID); exists {
		return nil, fmt.Errorf("document %s already registered", documentID)
	}

	txID := ctx.GetStub().GetTxID()
	evt := Event{DocumentID: documentID, Action: "registro", User: user, TxID: txID}
	// timestamp desde el stub, nunca desde time.Now() (determinismo)
	ts, _ := ctx.GetStub().GetTxTimestamp()
	evt.Timestamp = ts.AsTime().UTC().Format(time.RFC3339)

	return &evt, c.putEvent(ctx, documentID, sha256Hex, evt)
}
```

Mensaje de error de UI (español, con causa y acción — RNF‑18):

```
"El archivo supera el límite de 20 MB. Cargue un PDF de 20 MB o menos."
```

---

## 8. Estrategia de pruebas

Regida por el **Plan de Pruebas de Software (PPS)** — Fase 4 / OE4.

| Nivel | Herramienta | Dónde | Cubre |
|---|---|---|---|
| Unitarias | Jest (backend), `go test` (chaincode), Vitest opcional (frontend) | junto al código / `tests/` | reglas de negocio (RN‑xx), validaciones, hashing |
| Integración | Jest + red Fabric de prueba en Docker | `backend/tests/` | flujo backend ↔ Fabric ↔ MongoDB, `txID`, consistencia RNF‑13 |
| Funcional caja negra | casos del PPS derivados de los **escenarios Gherkin** (§14) | manual + automatizado | cada HU: 1 caso por escenario CA‑xx |
| Integridad (mutación documental) | script de mutación de PDF + suite de verificación | `tests/integrity/` | RNF‑14: alterar los 20 documentos sintéticos y confirmar detección 100 % |
| Trazabilidad / inmutabilidad | consulta al ledger vs. acciones registradas | `tests/integrity/` | RNF‑26, RNF‑27, no‑repudio |
| Rendimiento | k6 / autocannon sobre el endpoint de verificación | `tests/perf/` | RNF‑10: P95 ≤ 3000 ms en 50 peticiones consecutivas, Docker local |

**Metas de cobertura (del proyecto, no de líneas):**

- ≥ 90 % de casos de prueba funcionales con resultado PASS en la suite final (RNF‑28, KPI OE4).
- 100 % de detección de alteraciones sobre los 20 documentos definidos (RNF‑14, KPI OE4).
- Los casos de prueba más críticos se automatizan para ejecución repetible.

**Regla:** una HU no es verificable sin sus escenarios Gherkin registrados. Cada tarea de
un plan lleva su comando de verificación.

---

## 9. Límites (Always / Ask first / Never)

**Always (siempre):**

- Traza cada PR/plan a un id de módulo (§3) y a los RF/RNF/HU implementados; actualiza este SPEC.md si el diseño cambia.
- Valida formato y tamaño del PDF **antes** de registrar o hashear (RF‑12, RF‑29).
- Genera y compara huellas SHA‑256 automáticamente, sin intervención manual (RNF‑11).
- Pasa toda comunicación con Fabric por el backend (RNF‑20).
- Guarda contraseñas con hash + salt (RNF‑01); mensajes de auth que no revelan qué dato falló (RF‑002 CA‑02).
- Registra eventos con `txID`, usuario, acción y marca temporal (RNF‑06, RNF‑27).
- Corre lint y las pruebas asociadas antes de dar una HU por terminada (DoD §13).
- Español en todo texto visible al usuario.

**Ask first (consultar antes):**

- Cambiar el modelo de datos (world state del chaincode, esquema MongoDB) o el esquema de un canal.
- Agregar dependencias nuevas (frontend, backend o chaincode).
- Cambiar la topología de la red Fabric (organizaciones, peers, orderers, política de endorsement).
- Cambiar CI o los comandos de build/test.
- Tocar algo marcado "Fuera del alcance" (§1.2) o desviarse de un RF "Must".
- Cambiar umbrales de KPI o de RNF (P95, 20 MB, 90 %, etc.).

**Never (nunca):**

- Almacenar el contenido del PDF en la blockchain o en MongoDB en claro (RNF‑04).
- Permitir que el frontend llame directamente a Fabric o a MongoDB.
- Modificar el estado de un documento de forma manual (solo RF‑34 lo cambia).
- Borrar físicamente un usuario o su trazabilidad histórica (RF‑47: baja lógica).
- Exponer la huella completa a un rol no autorizado (RF‑27, RNF‑08).
- `git commit` automático — solo dejar el mensaje redactado (norma del equipo).
- Eliminar o saltar pruebas para llegar a verde sin aprobación.
- Abrir un `.docx/.xlsx/.pdf` con Read; usar siempre `docs/md/<nombre>.md`.

---

## 10. Metodología y ciclo de vida del software

**Enfoque mixto:** investigación aplicada (fundamentación técnico‑normativa) + un ciclo de
vida de software para construir el MVP.

**SDLC: Prototipado Evolutivo.** Elegido por ser un equipo de 2 personas. Permite:
validar temprano la parte más compleja (integración con Fabric), refinar UX/UI y chaincode
de forma continua, y priorizar las funcionalidades críticas (registro de hash y consulta
de integridad).

### 10.1 Fases ↔ objetivos ↔ entregables

| Fase | OE | Actividades clave | Entregables |
|---|---|---|---|
| **1. Análisis, benchmarking y requerimientos** | OE1 | Análisis normativo (Ley 527, Ley 1581, ISO 27001 Anexo A); benchmarking vs. soluciones comerciales; levantamiento de HU priorizadas. | Matriz de trazabilidad normativa, cuadro de benchmarking, backlog del MVP. **(hecho — ver `docs/md/`)** |
| **2. Diseño de arquitectura y modelado** | OE2 | Diseño de capas; topología Fabric (orgs, peers, orderers, canales) en Docker; UX/UI baja y alta fidelidad; especificación del chaincode. | Diagramas UML (componentes, secuencia, despliegue), diseños de interfaz, spec del chaincode. |
| **3. Desarrollo e integración del MVP** | OE3 | Infra con Docker Compose; chaincode Go (registro/consulta de hashes); frontend + backend + integración con Fabric SDK. | Código fuente del MVP, script de despliegue de la red, API de integración. **(fase vigente)** |
| **4. Evaluación: integridad y rendimiento** | OE4 | Diseño del PPS; pruebas funcionales caja negra; mutación documental; trazabilidad/inmutabilidad; rendimiento (latencia de escritura y de verificación). | Documento del PPS, informe de resultados y defectos, matriz de cumplimiento, manual de usuario y operación. |

### 10.2 Definición de Terminado (DoD)

Una historia de usuario se da por terminada **solo si** cumple los 5 criterios (cada uno es
columna en la hoja `Historias_Usuario`):

| # | Criterio | Evidencia |
|---|---|---|
| 1 | Revisión por pares superada e integrada a la rama principal (GitHub). | Enlace al PR aprobado. |
| 2 | Casos del PPS asociados a la historia ejecutados con resultado PASS. | Reporte de ejecución de la suite. |
| 3 | RF y RNF del SRS actualizados según lo implementado. | Identificadores RF/RNF referenciados en la trazabilidad. |
| 4 | Historia desplegada y verificada en el entorno de prueba (Docker Compose / VM de Azure). | Versión de la imagen + fecha de despliegue. |
| 5 | Aceptación registrada por el director o la codirectora. | Acta de la sesión de revisión. |

### 10.3 Cómo se crea un plan de desarrollo (procedimiento)

Al abrir `claude_docs/tasks/plan.md` para un sprint / módulo:

1. **Selecciona el módulo** por su id del mapa (§3) y confirma que sus dependencias ya están construidas.
2. **Lista las HU del sprint** (§13) y, por cada una, sus RF, RNF y escenarios Gherkin (§14).
3. **Descompón en tareas** de ≤ 5 archivos cada una, ordenadas por dependencia (no por importancia). Formato:
   ```
   - [ ] Tarea: <descripción>
     - Módulo: <id>   HU: HU-0xx   RF/RNF: RF-0xx, RNF-0xx
     - Aceptación: <escenario Gherkin CA-0x, en términos observables>
     - Verificar: <comando de prueba / build / check manual>
     - Archivos: <lista>
   ```
4. **Cierre de HU:** aplica los 5 criterios de DoD (§10.2). Sin los 5, la HU sigue abierta.
5. **Registra el impacto en KPI:** indica qué KPI mueve la HU (p. ej. HU‑013 → P95 de verificación; suite → % PASS).
6. **Sincroniza los documentos:** si cambió el diseño, actualiza este SPEC.md (con nota de cambio) y la trazabilidad RF/RNF **antes** de cerrar.
7. Guarda el plan en `claude_docs/tasks/plan.md` y la lista de tareas en `claude_docs/tasks/todo.md`.

---

## 11. Criterios de éxito

- **Funcional:** ≥ 90 % de casos de prueba funcionales PASS en la suite final (RNF‑28).
- **Integridad:** 100 % de las alteraciones detectadas sobre los 20 documentos sintéticos (RNF‑14).
- **Rendimiento:** P95 de latencia del endpoint de verificación ≤ 3000 ms en 50 peticiones consecutivas sobre Docker local (RNF‑10).
- **Trazabilidad:** el historial recuperado del ledger coincide cronológicamente con las acciones realizadas, con `txID` por evento (RNF‑26, RNF‑27).
- **Cobertura de requerimientos:** ≥ 90 % de los requerimientos formalizados en el SRS al cierre de S4 (KPI OE1).
- **Cobertura normativa:** ≥ 90 % de las disposiciones de Ley 527/1999, Decreto 2364/2012 y Ley 1581/2012 mapeadas (KPI OE1; hoy 13/13 aplicables = 100 %).
- **Aislamiento de capas:** ninguna llamada del frontend va directo a Fabric (HU‑021 CA‑02).

---

## 12. KPIs

| OE | KPI | Meta / valor esperado |
|---|---|---|
| OE1 | Cobertura de requerimientos documentados en el SRS | ≥ 90 % formalizados al cierre de S4 (~36 de 40) |
| OE1 | Cobertura de disposiciones normativas mapeadas al SRS | ≥ 90 % (Ley 527/1999, Decreto 2364/2012, Ley 1581/2012; ~15 artículos) |
| OE2 | Artefactos de diseño aprobados por el tutor | 4 de 4 dominios aprobados antes del desarrollo (S7) |
| OE2 | Tasa de observaciones críticas en revisión de diseño | ≤ 10 % por sesión (máx. 2 de ~20 componentes) |
| OE3 | P95 de latencia del endpoint de verificación | P95 ≤ 3000 ms en 50 peticiones consecutivas sobre Docker local (S11 y S13) |
| OE3 | % de historias de usuario aprobadas por sprint | ≥ 80 % de las HU comprometidas (~4 de 5) |
| OE4 | Tasa de detección de alteraciones documentales | 100 % de los 20 documentos alterados detectados como no íntegros |
| OE4 | % de casos de prueba funcionales con resultado PASS | ≥ 90 % en la suite final (~45 de 50; 5 módulos × 10 casos) |
| OE4 | % de ejecución del PPS completado en plazo | ≥ 85 % de actividades cerradas al cierre de S15 (~17 de 20) |

---

## 13. Requerimientos funcionales (53)

> Texto completo y detallado (precondiciones, flujo, RN, criterios): `docs/md/Requerimientos funcionales y no funcionales.md`
> y `docs/md/Requisitos_Historias_Usuario_ (backlog incluido).md` (hoja `Ficha_RF`).

### Autenticación y acceso

| ID | Título | Enunciado (resumen) | Prioridad |
|---|---|---|---|
| RF‑01 | Selección de rol | Seleccionar el rol (Empleado / Verificador / Administrador) antes de autenticarse. | Must |
| RF‑02 | Autenticación mediante credenciales | Solicitar usuario y contraseña corporativos como primer factor. | Must |
| RF‑03 | Autenticación de segundo factor | Enviar un token de verificación al correo corporativo registrado. | Must |
| RF‑04 | Validación del token | Validar el token de segundo factor antes de conceder acceso. | Must |
| RF‑05 | Control de acceso por rol | Conceder acceso solo si credenciales, token y rol seleccionado son válidos y corresponden al usuario. | Must |
| RF‑06 | Redirección según rol | Mostrar el panel y las funcionalidades del rol tras autenticarse. | Should |
| RF‑07 | Cierre de sesión | Cerrar la sesión de forma segura; una sesión cerrada no se reutiliza. | Must |

### Rol Empleado

| ID | Título | Enunciado (resumen) | Prioridad |
|---|---|---|---|
| RF‑08 | Carga de documentos | El Empleado carga documentos contractuales en PDF para su registro. | Must |
| RF‑09 | Restricción de formato | Aceptar exclusivamente archivos PDF. | Must |
| RF‑10 | Restricción de carga individual | Un único documento por operación; sin cargas por lotes. | Must |
| RF‑11 | Restricción de tamaño | Aceptar solo PDF ≤ 20 MB. | Must |
| RF‑12 | Validación previa de documentos | Validar formato y tamaño antes de iniciar el registro. | Must |
| RF‑13 | Registro del documento | Registrar metadatos: identificador, nombre, usuario responsable, fecha de registro. | Must |
| RF‑14 | Generación de huella criptográfica | Generar automáticamente la huella SHA‑256 del contenido del documento. | Must |
| RF‑15 | Registro de la huella criptográfica | Registrar la huella como evidencia de integridad, asociada al identificador. | Must |
| RF‑16 | Registro en blockchain | Registrar en Hyperledger Fabric la huella y los eventos, sin almacenar el PDF; obtener `txID`. | Must |
| RF‑17 | Confirmación de registro | Informar al Empleado del registro correcto, con el identificador del documento. | Should |
| RF‑18 | Consulta de documentos | El Empleado consulta los documentos que él registró. | Must |
| RF‑19 | Información del documento | Mostrar como mínimo nombre, identificador, fecha de registro y estado. | Must |
| RF‑20 | Estado del documento | Mostrar uno de: Pendiente, Verificado o Alterado. | Must |
| RF‑21 | Consulta de trazabilidad | El Empleado consulta el historial de acciones de sus documentos. | Must |
| RF‑22 | Información de trazabilidad | Mostrar documento, acción, usuario responsable, `txID`, fecha y hora. | Must |

### Rol Verificador

| ID | Título | Enunciado (resumen) | Prioridad |
|---|---|---|---|
| RF‑23 | Acceso al módulo de verificación | El Verificador accede al módulo de verificación de integridad. | Must |
| RF‑24 | Selección del documento registrado | Seleccionar un documento previamente registrado para verificar (nota de cambio, Sprint 3 T5: la ficha detallada del RF describe también un listado visible de documentos como alternativa — eso depende de una consulta que todavía no existe, RF‑37…40, Sprint 4; hasta entonces la selección es ingresando el identificador directo, que de todas formas ya exige RF‑25 un renglón más abajo). | Must |
| RF‑25 | Validación de existencia | Consultar por identificador si el documento está registrado. | Must |
| RF‑26 | Consulta de huella registrada | Mostrar la huella criptográfica registrada del documento. | Must |
| RF‑27 | Restricción de visualización del hash | La huella completa es visible solo para Verificador y Administrador. | Must |
| RF‑28 | Carga del documento a verificar | Cargar el PDF que se comparará con la versión registrada. | Must |
| RF‑29 | Validación del documento de comparación | Verificar formato PDF y tamaño ≤ 20 MB del documento de comparación. | Must |
| RF‑30 | Generación de hash del documento de comparación | Generar por SHA‑256 la huella del documento cargado para verificación. | Must |
| RF‑31 | Comparación de huellas | Comparar la huella registrada con la generada del documento cargado. | Must |
| RF‑32 | Resultado de la verificación | Determinar y mostrar si la integridad es confirmada o comprometida. | Must |
| RF‑33 | Visualización de evidencia | Mostrar la huella original y la obtenida como evidencia del resultado. | Should |
| RF‑34 | Actualización del estado | Actualizar el estado a Verificado (coinciden) o Alterado (difieren); nunca manual. | Must |
| RF‑35 | Registro de la verificación | Registrar en la trazabilidad la verificación: usuario, fecha y hora, `txID`, resultado. | Must |
| RF‑36 | Nueva verificación | Ofrecer "Nueva verificación" para iniciar otro proceso. | Must |
| RF‑37 | Consulta de documentos registrados | El Verificador consulta todos los documentos registrados. | Must |
| RF‑38 | Vista de documentos del verificador | Mostrar nombre, identificador, usuario responsable, fecha, estado y huella (según permisos). | Must |
| RF‑39 | Consulta de trazabilidad general | El Verificador consulta el historial completo de acciones sobre los documentos. | Must |
| RF‑40 | Información de trazabilidad general | Mostrar Documento, Acción, Usuario, `txID`, Fecha y Resultado. | Must |

### Rol Administrador

| ID | Título | Enunciado (resumen) | Prioridad |
|---|---|---|---|
| RF‑41 | Panel general | Panel con información consolidada del estado de los documentos. | Should |
| RF‑42 | Resumen documental | Totales: registrados, verificados, pendientes y alterados. | Should |
| RF‑43 | Consulta de usuarios | El Administrador consulta los usuarios registrados. | Must |
| RF‑44 | Información de usuarios | Mostrar identificador, nombre, rol, correo y estado (Activo / Inactivo). | Must |
| RF‑45 | Creación de usuarios | Registrar nuevos usuarios. | Must |
| RF‑46 | Edición de usuarios | Modificar nombre, correo y rol. | Must |
| RF‑47 | Desactivación de usuarios | Baja lógica sin eliminar información ni trazabilidad histórica. | Must |
| RF‑48 | Consulta administrativa de documentos | El Administrador consulta los documentos registrados. | Must |
| RF‑49 | Vista administrativa de documentos | Mostrar nombre, identificador, usuario responsable, fecha, estado y huella (con restricciones de privacidad). | Must |
| RF‑50 | Consulta de trazabilidad administrativa | El Administrador consulta el registro histórico de acciones. | Must |
| RF‑51 | Registro administrativo de trazabilidad | Tabla con identificador del documento, acción, usuario responsable, `txID`, fecha y hora, y resultado. | Must |

### Gestión de credenciales

| ID | Título | Enunciado (resumen) | Prioridad |
|---|---|---|---|
| RF‑52 | Cambio de contraseña | Un usuario autenticado cambia su contraseña. | Should |
| RF‑53 | Validación de cambio de contraseña | Solicitar contraseña actual y nueva; validar que lo hace el usuario autenticado. | Should |

---

## 14. Requerimientos no funcionales (30)

### Seguridad

| ID | Enunciado (resumen) |
|---|---|
| RNF‑01 | Contraseñas con hashing seguro + salt; nunca en texto plano. |
| RNF‑02 | Autenticación con credenciales + segundo factor por token. |
| RNF‑03 | Control de acceso basado en roles (RBAC). |
| RNF‑04 | No almacenar el contenido de los contratos en la blockchain; solo huellas y eventos. |
| RNF‑05 | Las huellas registradas en la blockchain se conservan inmutables. |
| RNF‑06 | Registrar operaciones relevantes: usuario, acción, fecha, hora y resultado. |
| RNF‑07 | Gestión segura de sesiones; bloquear acceso a lo protegido tras cerrar sesión. |
| RNF‑08 | Limitar la exposición de información documental y de huellas según el rol. |

### Rendimiento

| ID | Enunciado (resumen) |
|---|---|
| RNF‑09 | Tiempo de respuesta adecuado en consulta y verificación para interacción fluida. |
| RNF‑10 | Verificación de integridad: P95 ≤ 3000 ms en 50 peticiones consecutivas. |
| RNF‑11 | Generación y comparación de huellas SHA‑256 automática, sin intervención manual. |

### Disponibilidad y confiabilidad

| ID | Enunciado (resumen) |
|---|---|
| RNF‑12 | Disponible durante el periodo de pruebas y validación del MVP. |
| RNF‑13 | Consistencia entre MongoDB y Hyperledger Fabric (documentos, identificadores, eventos). |
| RNF‑14 | Detectar el 100 % de las alteraciones sobre los 20 documentos de validación. |

### Usabilidad

| ID | Enunciado (resumen) |
|---|---|
| RNF‑15 | Interfaz clara e intuitiva; sin requerir conocimientos de blockchain o criptografía. |
| RNF‑16 | Estructura visual y de navegación consistente entre módulos. |
| RNF‑17 | Informar el resultado de las operaciones (cargas, errores, verificación, cambios de estado). |
| RNF‑18 | Mensajes de error claros: causa y, si es posible, acción para resolver. |

### Mantenibilidad y arquitectura

| ID | Enunciado (resumen) |
|---|---|
| RNF‑19 | Arquitectura modular: presentación, lógica, integración con blockchain y persistencia separadas. |
| RNF‑20 | El frontend no interactúa directamente con Fabric; toda comunicación pasa por el backend. |
| RNF‑21 | Componentes ejecutables mediante Docker y Docker Compose. |
| RNF‑22 | Arquitectura extensible: nuevos módulos sin reescribir los existentes. |

### Compatibilidad y restricciones

| ID | Enunciado (resumen) |
|---|---|
| RNF‑23 | Compatible exclusivamente con documentos PDF. |
| RNF‑24 | Soportar documentos de hasta 20 MB por archivo. |
| RNF‑25 | Accesible desde navegadores web modernos. |

### Auditoría y evaluación

| ID | Enunciado (resumen) |
|---|---|
| RNF‑26 | Reconstruir cronológicamente las acciones sobre cada documento desde la trazabilidad. |
| RNF‑27 | Los eventos en la blockchain conservan orden cronológico e identificador de transacción. |
| RNF‑28 | Alcanzar ≥ 90 % de casos de prueba funcionales aprobados (PASS) en la suite final. |
| RNF‑29 | Evaluar rendimiento y confiabilidad en condiciones controladas, con documentos sintéticos. |
| RNF‑30 | Diseño alineado con controles de seguridad de referencia (Anexo A de ISO/IEC 27001:2022). |

---

## 15. Historias de usuario (21)

> Detalle narrativo, INVEST y DoD: hoja `Historias_Usuario` de
> `docs/md/Requisitos_Historias_Usuario_ (backlog incluido).md`.

| HU | Épica | Título | RF | RNF | MoSCoW | Pts | Sprint |
|---|---|---|---|---|---|---|---|
| HU‑001 | EP‑01 | Selección de rol e inicio con credenciales corporativas | RF‑001, RF‑002 | RNF‑02 | Must | 3 | 1 |
| HU‑002 | EP‑01 | Autenticación de doble factor y acceso por rol | RF‑003, RF‑004, RF‑005, RF‑006 | RNF‑02, RNF‑03 | Must | 5 | 1 |
| HU‑003 | EP‑01 | Cierre de sesión seguro | RF‑007 | RNF‑07 | Must | 1 | 1 |
| HU‑004 | EP‑01 | Cambio de contraseña | RF‑052, RF‑053 | RNF‑01 | Should | 2 | 1 |
| HU‑005 | EP‑02 | Carga y validación de documentos contractuales | RF‑008…012 | RNF‑23, RNF‑24 | Must | 5 | 2 |
| HU‑006 | EP‑02 | Registro de metadatos y generación de huella criptográfica | RF‑013, RF‑014, RF‑015 | RNF‑11, RNF‑13 | Must | 8 | 2 |
| HU‑007 | EP‑02 | Registro de la huella en la red blockchain | RF‑016, RF‑017 | RNF‑04, RNF‑05, RNF‑20 | Must | 8 | 2 |
| HU‑008 | EP‑02 | Consulta de mis documentos y su estado | RF‑018, RF‑019, RF‑020 | RNF‑09 | Must | 3 | 4 |
| HU‑009 | EP‑02 | Consulta de trazabilidad de mis documentos | RF‑021, RF‑022 | RNF‑06, RNF‑26, RNF‑27 | Must | 5 | 4 |
| HU‑010 | EP‑03 | Selección del documento a verificar | RF‑023, RF‑024, RF‑025 | — | Must | 3 | 3 |
| HU‑011 | EP‑03 | Consulta de la huella registrada con control de visibilidad | RF‑026, RF‑027 | RNF‑08 | Must | 3 | 3 |
| HU‑012 | EP‑03 | Carga del documento a comparar | RF‑028, RF‑029 | RNF‑23, RNF‑24 | Must | 3 | 3 |
| HU‑013 | EP‑03 | Comparación de huellas y resultado de la verificación | RF‑030…033 | RNF‑10, RNF‑14 | Must | 8 | 3 |
| HU‑014 | EP‑03 | Actualización de estado y registro de la verificación | RF‑034, RF‑035, RF‑036 | RNF‑05, RNF‑27 | Must | 5 | 3 |
| HU‑015 | EP‑03 | Consulta general de documentos registrados | RF‑037, RF‑038 | RNF‑08 | Must | 3 | 4 |
| HU‑016 | EP‑03 | Consulta general de trazabilidad | RF‑039, RF‑040 | RNF‑26, RNF‑27 | Must | 5 | 4 |
| HU‑017 | EP‑04 | Panel general con resumen documental | RF‑041, RF‑042 | — | Should | 3 | 4 |
| HU‑018 | EP‑04 | Gestión del ciclo de vida de usuarios | RF‑043…047 | RNF‑03 | Must | 8 | 4 |
| HU‑019 | EP‑04 | Consulta administrativa de documentos | RF‑048, RF‑049 | RNF‑04, RNF‑08 | Must | 3 | 4 |
| HU‑020 | EP‑04 | Consulta administrativa de trazabilidad | RF‑050, RF‑051 | RNF‑26, RNF‑27 | Must | 5 | 4 |
| HU‑021 | EP‑05 | Despliegue de la red blockchain y del entorno con Docker | — | RNF‑19, 20, 21, 22 | Must | 13 | 0 |

Épicas: **EP‑01** Autenticación y control de acceso · **EP‑02** Registro y gestión
documental (Empleado) · **EP‑03** Verificación de integridad documental (Verificador) ·
**EP‑04** Administración del sistema · **EP‑05** Infraestructura y despliegue.

---

## 16. Escenarios de aceptación (Gherkin, 42)

Formato: **Dado** / **Cuando** / **Entonces**. Un caso del PPS por escenario.

| HU | CA | Tipo | Dado | Cuando | Entonces |
|---|---|---|---|---|---|
| HU‑001 | CA‑01 | Principal | el usuario está en la pantalla de inicio sin sesión activa | selecciona su rol e ingresa credenciales válidas | el sistema solicita el token de segundo factor |
| HU‑001 | CA‑02 | Excepción | el usuario ingresa credenciales inválidas | envía el formulario de autenticación | el sistema muestra un error sin indicar cuál dato es incorrecto |
| HU‑002 | CA‑01 | Principal | el usuario recibió un token vigente en su correo corporativo | lo ingresa correctamente | el sistema valida su rol y lo redirige al panel correspondiente |
| HU‑002 | CA‑02 | Excepción | el rol seleccionado no coincide con el rol asignado al usuario | el sistema valida el acceso | lo deniega y muestra un mensaje de error |
| HU‑003 | CA‑01 | Principal | el usuario tiene una sesión activa | selecciona Cerrar sesión | el sistema invalida el token de sesión y lo redirige a la selección de rol |
| HU‑003 | CA‑02 | Alterno | el usuario cerró sesión | intenta acceder de nuevo a una funcionalidad protegida sin autenticarse | el sistema lo redirige al inicio de sesión |
| HU‑004 | CA‑01 | Principal | el usuario ingresa su contraseña actual correcta y una nueva contraseña válida | confirma el cambio | el sistema actualiza la contraseña almacenada como hash con sal |
| HU‑004 | CA‑02 | Excepción | la contraseña actual ingresada es incorrecta | se envía el formulario de cambio | el sistema rechaza el cambio e informa el error |
| HU‑005 | CA‑01 | Principal | el Empleado selecciona un archivo PDF de 10 MB | lo carga en el formulario de registro | el sistema valida formato y tamaño y continúa con el registro |
| HU‑005 | CA‑02 | Excepción | el Empleado selecciona un DOCX o un PDF de 25 MB | intenta cargarlo | el sistema lo rechaza e informa el motivo |
| HU‑006 | CA‑01 | Principal | un documento que superó las validaciones de carga | el sistema lo registra | genera sus metadatos y calcula su huella SHA‑256 de forma automática |
| HU‑006 | CA‑02 | Alterno | un documento ya registrado | se genera su huella nuevamente sobre el mismo contenido | el resultado es exactamente el mismo hash |
| HU‑007 | CA‑01 | Principal | la huella del documento fue generada | el backend la envía al chaincode | la red Hyperledger Fabric la registra y retorna un `txID` válido |
| HU‑007 | CA‑02 | Excepción | el registro en la red blockchain falla | el sistema procesa la respuesta | no muestra un mensaje de éxito al Empleado |
| HU‑008 | CA‑01 | Principal | un Empleado con documentos registrados | consulta Mis documentos | ve únicamente los documentos que él cargó con su estado actual |
| HU‑008 | CA‑02 | Alterno | un documento sin verificaciones previas | se consulta su estado | su estado es Pendiente |
| HU‑009 | CA‑01 | Principal | un documento con eventos registrados | el Empleado consulta su trazabilidad | ve el historial completo en orden cronológico con documento, acción, usuario, `txID`, fecha y hora |
| HU‑009 | CA‑02 | Excepción | un documento que no pertenece al Empleado autenticado | intenta consultar su trazabilidad | el sistema le deniega el acceso |
| HU‑010 | CA‑01 | Principal | un documento previamente registrado | el Verificador lo selecciona | el sistema confirma su existencia y continúa el flujo de verificación |
| HU‑010 | CA‑02 | Excepción | un identificador de documento que no existe | se consulta | el sistema informa que el documento no está registrado |
| HU‑011 | CA‑01 | Principal | un documento existente | el Verificador consulta su huella | el sistema muestra el hash SHA‑256 registrado |
| HU‑011 | CA‑02 | Excepción | un usuario con rol Empleado | intenta ver la huella completa de un documento ajeno | el sistema le deniega el acceso |
| HU‑012 | CA‑01 | Principal | un archivo PDF válido cargado por el Verificador | se envía | el sistema inicia su validación de formato y tamaño |
| HU‑012 | CA‑02 | Excepción | un archivo de 30 MB | se valida | el sistema lo rechaza e informa el límite permitido |
| HU‑013 | CA‑01 | Principal | dos huellas idénticas entre el documento registrado y el cargado | se comparan | el sistema muestra Integridad confirmada |
| HU‑013 | CA‑02 | Alterno | dos huellas distintas | se comparan | el sistema muestra Integridad comprometida y presenta ambas huellas como evidencia |
| HU‑014 | CA‑01 | Principal | un resultado de verificación con huellas coincidentes | se procesa | el estado del documento cambia a Verificado y el evento queda registrado en el ledger con su `txID` |
| HU‑014 | CA‑02 | Alterno | el Verificador concluyó una verificación | selecciona Nueva verificación | el sistema muestra el formulario vacío de selección de documento |
| HU‑015 | CA‑01 | Principal | el Verificador accede al listado de documentos | lo consulta | ve todos los documentos registrados con sus seis campos mínimos |
| HU‑015 | CA‑02 | Excepción | un documento cuya huella no está autorizada para el rol consultante | se lista | el campo de huella se muestra restringido |
| HU‑016 | CA‑01 | Principal | el Verificador accede a la trazabilidad general | la consulta | ve los eventos de todos los documentos registrados en orden cronológico |
| HU‑016 | CA‑02 | Alterno | el conjunto de eventos del ledger | se listan | se muestran los seis campos definidos (Documento, Acción, Usuario, `txID`, Fecha, Resultado) |
| HU‑017 | CA‑01 | Principal | el Administrador inicia sesión | accede al panel general | ve el resumen documental consolidado con los cuatro totales definidos |
| HU‑017 | CA‑02 | Alterno | un conjunto de documentos con distintos estados | se calcula el resumen | la suma de los totales por estado coincide con el total general |
| HU‑018 | CA‑01 | Principal | el Administrador diligencia el formulario de creación con un correo no registrado | confirma la creación | el sistema crea el usuario en estado Activo con uno de los tres roles predefinidos |
| HU‑018 | CA‑02 | Excepción | un usuario activo con documentos previamente registrados | el Administrador lo desactiva | conserva su historial de trazabilidad y ya no puede iniciar sesión |
| HU‑019 | CA‑01 | Principal | el Administrador accede al listado de documentos | lo consulta | ve todos los documentos con sus seis campos mínimos, sin exponer el contenido del archivo |
| HU‑019 | CA‑02 | Alterno | un documento registrado | se lista para el Administrador | se muestran los mismos campos mínimos definidos para el rol Verificador |
| HU‑020 | CA‑01 | Principal | el Administrador accede a la trazabilidad | la consulta | ve los eventos de todos los documentos registrados con `txID` y Resultado |
| HU‑020 | CA‑02 | Alterno | el nivel de detalle mostrado al Verificador en RF‑040 | se compara con el panel del Administrador | el Administrador ve un nivel de detalle igual o mayor |
| HU‑021 | CA‑01 | Principal | el archivo `docker-compose.yml` del proyecto | se ejecuta en el entorno de pruebas | todos los componentes (frontend, backend, chaincode, red Hyperledger Fabric, MongoDB) arrancan como contenedores |
| HU‑021 | CA‑02 | Alterno | el frontend necesita interactuar con la red blockchain | se revisa el código fuente | ninguna llamada del frontend se dirige directamente a los nodos de Hyperledger Fabric |

---

## 17. Trazabilidad normativa (resumen)

KPI‑1.2: cobertura ≥ 90 % de las disposiciones de Ley 527/1999, Decreto 2364/2012 y
Ley 1581/2012. Estado: **13/13 disposiciones aplicables al MVP cubiertas (100 %)**;
4 artículos sobre firma electrónica quedan **fuera de alcance** (declarado).

| Norma | Disposición clave | RF/RNF | Cómo cumple el sistema |
|---|---|---|---|
| Ley 527/1999 Art. 8–9 | Original e integridad de un mensaje de datos | RF‑14, 15, 16, 30, 31, 32, 34; RNF‑05, 14 | Huella SHA‑256 al registrar, anclada en Fabric; comparación automática de hashes detecta alteración. |
| Ley 527/1999 Art. 6, 12 | Escrito y conservación (accesible para consulta posterior) | RF‑18, 19, 37, 48; RNF‑12 | Módulos de consulta mantienen disponible el historial durante el MVP. |
| Ley 527/1999 Art. 10–11 | Admisibilidad y valoración probatoria | RF‑21, 22, 35; RNF‑26, 27 | Historial de trazabilidad con acción, usuario, `txID`, fecha desde el ledger. |
| Decreto 2364/2012 Art. 6 | Custodia de credenciales del firmante | RF‑02, 03, 04, 52, 53; RNF‑01, 02, 07 | Credenciales + OTP por correo + gestión segura de contraseñas. **Implementado (Sprint 1, `identity`)**: hash+salt (bcrypt), OTP por correo con expiración/reintentos, sesión JWT invalidable, cambio de contraseña autenticado. |
| Ley 1581/2012 Art. 4 lit. g) | Principio de seguridad | RNF‑01, 03, 05, 07 | Hash + salt, RBAC, sesiones seguras, inmutabilidad de la evidencia. |
| Ley 1581/2012 Art. 4 lit. h) / Art. 3 | Confidencialidad y minimización de datos | RF‑13, 27; RNF‑04, 08 | No se almacena el contenido del contrato; solo huella y metadatos mínimos; huella visible solo a roles autorizados. |
| Ley 527/1999 Art. 7 · Decreto 2364/2012 Art. 2, 3, 5 | Firma electrónica | — | **Fuera de alcance** (numerales 2.6.1 / 2.6.2 del anteproyecto). |
| ISO/IEC 27001:2022 Anexo A (A.8.24, A.8.11) | Criptografía, control de acceso | RNF‑30 | Solo como criterio de diseño; no se implementa ni certifica el SGSI. |

---

## 18. Preguntas abiertas

| # | Tema | Estado |
|---|---|---|
| 1 | Canal exclusivo del segundo factor (correo corporativo) frente a SMS / app autenticadora. | **Resuelto para Sprint 1 (2026‑09‑19, decisión D1 de `claude_docs/tasks/plan-sprint1-identity.md`):** por ahora el OTP va al correo *registrado* del usuario, no necesariamente corporativo — permite probar el flujo completo durante el desarrollo. Queda pendiente evaluar más adelante si se exige que sea exclusivamente el correo corporativo (nota de cambio: esto relaja, no contradice, RF‑003 — el canal sigue siendo "correo", solo se pospuso la restricción de dominio). |
| 2 | Número máximo de intentos de token y tiempo de expiración exactos. | **Resuelto para Sprint 1 (2026‑09‑19, decisión D2 del mismo plan):** 6 dígitos, expira a los 5 minutos, máximo 5 intentos — agotados, hay que volver a iniciar sesión para un código nuevo (eso es el "bloqueo temporal del proceso" de RN‑02). Sin valor fijado en `docs/md/Requisitos_Historias_Usuario_ (backlog incluido).md`/`Trabajo de grado final.md` (se revisaron ambos), se adoptó este default. |
| 3 | Topología concreta de Fabric: ¿1 o 2 organizaciones? Política de endorsement. | Por definir en Fase 2 / módulo `infra`. |
| 4 | Diagramas UML (componentes, secuencia, despliegue) y prototipos UX/UI. | Entregable de Fase 2 (OE2), aún no producidos. |
| 5 | Estados de aprobación del tutor en la Matriz de Actores (KPI‑1.1). | "Pendiente de aprobación" — actualizar tras revisión. |
| 6 | Definición del set de 20 documentos sintéticos y del script de mutación. | Entregable del PPS (Fase 4). |

---

*Última actualización: 2026‑09‑20 (T8, Sprint 1 `identity`: trazabilidad de RF‑01…07/52/53
y RNF‑01/02/03/07 marcada como implementada; preguntas abiertas #1 y #2 de la sección 18
resueltas con las decisiones D1/D2 del plan de Sprint 1). Anterior: 2026‑09‑06. Al cambiar
alcance o diseño, edita este archivo primero y deja nota de cambio; luego implementa.*
