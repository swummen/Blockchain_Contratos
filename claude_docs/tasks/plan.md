# Plan de implementación: Sprint 0, módulo `infra` (HU‑021)

> Fuente de verdad: `claude_docs/SPEC.md` (**aprobado 2026‑09‑06**).
> Plan **aprobado 2026‑09‑06**. Implementación aún **no iniciada**.
> Módulo: `infra` · Épica: EP‑05 · HU: **HU‑021** · Puntos: 13 · RNF: 19, 20, 21, 22.

## Resumen

Entregar un **entorno reproducible de una sola orden** donde el MVP pueda ejecutarse y
validarse: red Hyperledger Fabric permisionada + MongoDB + esqueletos de `backend` y
`frontend` en contenedores, todos en la misma red Docker. Al cierre del sprint,
`docker/up.sh` levanta todos los componentes y el `backend` puede invocar un chaincode a
través del Fabric Gateway: retirando temprano el riesgo de integración con Fabric, tal
como exige el enfoque de Prototipado Evolutivo (SPEC §10).

No se implementa lógica de negocio: el chaincode real es Sprint 2, la autenticación real es
Sprint 1. Sprint 0 fija las convenciones de `backend/`, `docker/` y el pipeline de Fabric.

## Decisiones de arquitectura

| # | Decisión | Razón |
|---|---|---|
| D1 | **Reutilizar `fabric-samples/test-network`** (2 orgs peer + 1 orderer + 3 Fabric CA) sin modificar la topología; script propio la orquesta. | Rung 5 de "lo perezoso": es la herramienta canónica y probada para red local. Recortar a 1 org es fiddly y frágil. La simplificación a organización única queda como pregunta abierta / mejora posterior. |
| D2 | Canal único **`contratoschannel`**. Política de endorsement por defecto `OR('Org1MSP.peer','Org2MSP.peer')` (basta una org). | Evita la firma multi‑org en cada transacción del `ledger` (Sprint 2) manteniendo la red estándar. |
| D3 | Estado del peer con **LevelDB (goleveldb)**, no CouchDB. | La trazabilidad usa `GetHistoryForKey` y rangos de clave compuesta, que LevelDB soporta. `ponytail:` subir a CouchDB solo si aparece necesidad de rich queries. |
| D4 | `fabric-samples/` **no se versiona**; `docker/network-up.sh` lo descarga con versión fijada (Fabric 2.5.x, CA 1.5.x) si falta. | Reproducibilidad (RNF‑21) sin meter cientos de MB en git. |
| D5 | Fabric CA activado (`-ca`). | El módulo `identity` (Sprint 1) necesita inscribir identidades/wallets con el SDK; cryptogen no lo permite. |
| D6 | `backend` en **TypeScript** + Express, Node 20 LTS. | Coincide con el frontend; los tipos ayudan en la integración con el Fabric SDK. *(Confirmar en revisión; si se prefiere JS plano, se ajusta antes de la Tarea 4.)* |
| D7 | Servicios de app (`mongo`, `backend`, `frontend`) en un compose aparte (`docker/compose.app.yml`) unido a la red Docker de la test‑network (`fabric_test`). | Separa el ciclo de vida de la red Fabric del de la app; permite reiniciar la app sin rebajar la red. |
| D8 | `frontend` se sirve como estático (build de Vite tras `nginx:alpine`). La SPA solo conoce `VITE_API_URL` (el `backend`). | RNF‑20 / HU‑021 CA‑02: ninguna llamada del frontend va directo a Fabric o Mongo. |
| D9 | Como prueba de pipeline se despliega el chaincode de ejemplo **asset‑transfer‑basic (Go)**; se elimina cuando entre el chaincode real en Sprint 2. | Retira el riesgo SDK↔Fabric antes de escribir código propio. |

## Grafo de dependencias

```
T1 (red Fabric + canal)
 ├── T2 (deploy chaincode de ejemplo)
 │     └── T5 (backend ↔ Fabric Gateway: /fabric/ping)
 ├── T5
 └── T7 (orquestación)
T3 (MongoDB + red Docker)
 └── T4 (backend walking skeleton: /health + Mongo)
       ├── T5
       └── T6 (frontend: página de estado → /health)
T1..T6 ──> T7 (up.sh / down.sh + docs) ──> T8 (smoke test HU‑021)
```

Orden de construcción: **T1 → T2 → (checkpoint) → T3 → T4 → T5 → T6 → (checkpoint) → T7 → T8 → (checkpoint DoD)**.

## Rebanado vertical

Cada tarea deja el sistema en un estado ejecutable y verificable por sí misma:

- **T1** red arriba y canal creado (verificable con `docker ps` + logs "channel joined").
- **T2** una transacción real se confirma en el canal (query devuelve datos).
- **T3** MongoDB sano y alcanzable.
- **T4** el `backend` responde y está conectado a Mongo.
- **T5** el `backend` lee del ledger a través del Gateway: *slice de mayor riesgo, va temprano*.
- **T6** el `frontend` muestra el estado del `backend` y no habla con nada más.
- **T7** una sola orden reproduce todo.
- **T8** HU‑021 CA‑01 y CA‑02 verificados y registrados para el PPS.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Windows + scripts bash de `fabric-samples` (CRLF, `bad interpreter`). | Alto | `.gitattributes` con `*.sh eol=lf`; ejecutar en Git Bash o WSL2; documentarlo en `docker/README.md`. |
| Descarga de `fabric-samples` flaky o con drift de versión. | Medio | Versión fijada en `network-up.sh` (`-f 2.5.x -c 1.5.x`), caché local, `docker/.gitignore`. |
| El `backend` en contenedor no resuelve los peers (la test‑network usa `localhost:7051` en su env). | Alto | T5 usa un connection profile con nombres DNS de contenedor (`peer0.org1.example.com:7051`) y `grpcs://` + TLS override; se une a la red `fabric_test`. |
| Conflictos de puertos en Windows (7050/7051/9051/7054/27017/8080). | Medio | Lista de puertos y cómo cambiarlos en `docker/README.md`; puertos de app parametrizados por `.env`. |
| Despliegue posterior en VM de Azure (criterio 4 de DoD). | Medio | Todo con rutas relativas; sin dependencias del host salvo Docker + Git Bash; probar `up.sh` desde checkout limpio. |
| Material criptográfico regenerado en cada `network down` invalida wallets del `backend`. | Medio | T5 carga la identidad Admin de Org1 desde `fabric-samples/organizations/...` en el arranque, no la cachea; documentar que `down` = entorno nuevo. |

## Preguntas abiertas

| # | Pregunta | Bloquea |
|---|---|---|
| 1 | ¿Se acepta la topología de 2 organizaciones de la test‑network, o se quiere una sola organización (empresa única)? | No bloquea Sprint 0 (D1); afecta el diseño de `ledger` en Sprint 2. |
| 2 | ¿`backend` en TypeScript (D6, recomendado) o JavaScript plano? | Tarea 4 en adelante. Confirmar en revisión. |
| 3 | ¿Nombre definitivo del canal? Se usa `contratoschannel`. | Cosmético; cambiar antes de T1 si aplica. |
| 4 | ¿Chaincode gestionado por el peer o *chaincode‑as‑a‑service* para Sprint 2? | No bloquea Sprint 0. |

## Lista de tareas

Ver `claude_docs/tasks/todo.md`. Índice:

| # | Título | Alcance | Depende de |
|---|---|---|---|
| T1 | Levantar red Fabric + canal `contratoschannel` | M | N/A |
| T2 | Desplegar chaincode de ejemplo como prueba de pipeline | S | T1 |
| N/A | **Checkpoint: red Fabric operativa** | | |
| T3 | Servicio MongoDB + red Docker de la app | S | N/A |
| T4 | Esqueleto del `backend` (`/health` + conexión a Mongo) | M | T3 |
| T5 | `backend` ↔ Fabric Gateway (`/fabric/ping`) | M | T1, T2, T4 |
| T6 | `frontend` en contenedor + página de estado del sistema | M | T4 |
| N/A | **Checkpoint: esqueleto de app conectado a Fabric + Mongo** | | |
| T7 | Orquestación de una sola orden (`up.sh` / `down.sh`) + documentación | M | T1‑T6 |
| T8 | Verificación de HU‑021 (smoke test CA‑01 / CA‑02) | S | T7 |
| N/A | **Checkpoint: HU‑021 terminada (DoD)** | | |

## Definición de Terminado (HU‑021): SPEC §10.2

1. Revisión por pares + merge a `main` (PR aprobado).
2. Casos del PPS de HU‑021 (CA‑01, CA‑02) en PASS: cubierto por T8.
3. SRS/trazabilidad: marcar RNF‑19, 20, 21, 22 como implementados; sin RF.
4. Desplegado y verificado en entorno de prueba (Docker Compose): cubierto por T7/T8.
5. Aceptación registrada por dirección/codirección del proyecto.
