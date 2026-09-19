# docker/

Infraestructura del MVP: red Hyperledger Fabric (test-network de `fabric-samples`) +
MongoDB + contenedores de `backend`/`frontend`. Fuente de verdad: `claude_docs/SPEC.md`
(arquitectura) y `claude_docs/tasks/plan.md` (decisiones D1‑D9 del módulo `infra`).

## Prerrequisitos

- Docker Desktop con el motor corriendo (`docker ps` debe responder) + Docker Compose v2.
- Git Bash o WSL2 para correr los scripts `.sh` — **nunca PowerShell/cmd.exe** directamente.
  Windows con `core.autocrlf=true` reescribiría los `.sh` con CRLF si no fuera por
  `.gitattributes` (`*.sh eol=lf`) en la raíz del repo.
- Go 1.22+ — ya lo necesita el chaincode de ejemplo (T2/T7, `go mod vendor` al empaquetarlo);
  el módulo `ledger` real de Sprint 2 lo va a seguir usando.
- `jq` (lo usan internamente los scripts de `fabric-samples`, a partir de T2).
- Conexión a internet la primera vez: `network-up.sh` descarga binarios + imágenes Docker
  de Hyperledger Fabric (~2‑3 GB) si `docker/fabric-samples/` no existe todavía.
- `docker/.env` — copiarlo de `docker/.env.example` antes de levantar Mongo:
  `cp docker/.env.example docker/.env` (y ajustar si querés). Es un paso único; `docker/.env`
  nunca se versiona.

## Puertos usados por la red (verificar que estén libres)

| Puerto | Servicio |
|---|---|
| 7050 | orderer.example.com |
| 7051 | peer0.org1.example.com |
| 9051 | peer0.org2.example.com |
| 7054 | ca_org1 |
| 8054 | ca_org2 |
| 9054 | ca_orderer |
| 27017 | mongo |
| 8080 | backend (`BACKEND_PORT` en `docker/.env`) |
| 5173 | frontend (`FRONTEND_PORT` en `docker/.env`) |

## Comandos

**Para levantar todo de una sola vez (T7):** `bash docker/up.sh` encadena
`network-up.sh` + `deploy-sample-cc.sh` + el `compose up` de la última fila.
`bash docker/down.sh` es la inversa: `compose down -v` + `network-down.sh` (no exactamente
las mismas dos filas de "Comandos" — `down.sh` siempre borra el volumen de Mongo, la fila
suelta de `compose down` no). Las filas de abajo son para levantar/bajar piezas sueltas.

| Comando | Qué hace |
|---|---|
| `bash docker/up.sh` | Orquesta todo el stack: red Fabric → chaincode de ejemplo → Mongo/backend/frontend. Crea `docker/.env` desde `.env.example` si no existe. Verifica `go` y `jq` en el `PATH` antes de arrancar. A diferencia de la fila de `compose up` de abajo, usa `--build` siempre — reconstruye las imágenes de `backend`/`frontend` aunque ya existan, para no quedarse con una imagen vieja mientras el proyecto sigue en desarrollo activo. Seguro de correr desde un checkout limpio. |
| `bash docker/down.sh` | Inversa de `up.sh`: baja Mongo/backend/frontend (con `-v`, borra también el volumen de Mongo) y la red Fabric. Deja el checkout listo para volver a `up.sh`. |
| `bash docker/network-up.sh` | 1ª vez: descarga `fabric-samples` + binarios + imágenes Docker fijadas en Fabric 2.5.16 / CA 1.5.22. Luego levanta la test-network con Fabric CA (`-ca`) y crea/une el canal `contratoschannel` con LevelDB como state DB (decisión D3). |
| `bash docker/network-down.sh` | Baja la red: elimina contenedores, volúmenes y material criptográfico. Deja el entorno limpio para volver a `network-up.sh`. |
| `bash docker/deploy-sample-cc.sh` | Despliega el chaincode de ejemplo `asset-transfer-basic` en `contratoschannel` (prueba de pipeline; requiere la red arriba). Idempotente. |
| `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo backend frontend` | Levanta Mongo (imagen fijada `7.0.41`, con auth activada), el `backend` (Express+TS, T4/T5: `/health` + `/fabric/ping` reales, espera a que Mongo esté `healthy`) y el `frontend` (T6: build de Vite servido por `nginx:alpine`, `VITE_API_URL` horneado en el bundle en tiempo de build — un cambio ahí requiere `docker compose build frontend`, no alcanza con reiniciar el contenedor), todos unidos a la red `fabric_test` que crea `network-up.sh`. `backend` monta `fabric-samples/test-network/organizations` en `/crypto` (solo lectura) para leer la identidad de Fabric — requiere que `network-up.sh` haya corrido antes, si no `/fabric/ping` responde `503`. Se puede omitir cualquier servicio de la lista para levantar solo los otros. |
| `docker compose -f docker/compose.app.yml down` | Baja **todos** los servicios que comparten este compose file (`mongo`, `backend`, `frontend`). El volumen de Mongo (`contratos_mongo_data`) sobrevive; agregar `-v` para borrarlo también. |

## Notas

- `fabric-samples/` no se versiona (ver `docker/.gitignore`); se descarga con versión
  fijada cada vez que no existe localmente — nunca se usa `latest`.
- El material criptográfico (`organizations/`) se regenera en cada `network-up.sh` tras un
  `network-down.sh`: ninguna identidad ni wallet sobrevive a un ciclo down/up.
- Topología: 2 organizaciones (Org1, Org2) + 1 orderer + 3 Fabric CA — se reutiliza la
  test-network estándar de Fabric sin recortarla a una sola organización (decisión D1).
- Si `network-up.sh` falla con "Peer binary and configuration files not found", revisa que
  la descarga de binarios (`install-fabric.sh ... binary`) haya terminado sin errores.
- **Bug de Windows/Git Bash #1 (ya corregido en el script):** MSYS reescribe valores tipo
  `/var/run/docker.sock` a rutas de Windows (`C:\Program Files\Git\var\...`) cuando se pasan
  como variable de entorno a un binario nativo (`docker.exe`), lo que rompe el bind-mount
  `${DOCKER_SOCK}` que `network.sh` arma para los peers ("mkdir ...: Acceso denegado").
  `network-up.sh` lo evita parcheando el YAML del compose con la ruta literal, en vez de
  tocar la variable de entorno.
- **Bug de Windows/Git Bash #2 (ya corregido en el script):** por el mismo motivo, el paso
  de `network.sh down` que borra `organizations/` vía un contenedor busybox falla con
  `can't cd to /data`. No es fatal (contenedores/volúmenes sí bajan bien), pero deja
  material criptográfico viejo en disco. `network-down.sh` tolera ese fallo puntual y fuerza
  la limpieza con `rm -rf` directo desde el host.
- **`docker/.env` no se detecta solo:** `docker compose` busca el `.env` en el directorio
  desde donde corrés el comando, no al lado del archivo que le pasás con `-f`. Como todo se
  corre desde la raíz del repo, hay que pasar `--env-file docker/.env` explícito (ya está en
  el comando de arriba) — y ese flag **falla duro** (`couldn't find env file`) si
  `docker/.env` no existe todavía. Por eso `cp docker/.env.example docker/.env` es un
  prerrequisito, no un paso opcional.
- **Bug de Windows/Git Bash #3 (mismo problema, otro comando):** `docker exec`/`docker run`
  con una ruta absoluta tipo `/crypto/...` como argumento también la sufre — MSYS la
  reescribe a una ruta de Windows antes de que Docker la vea. Ejemplo real:
  `docker exec backend touch /crypto/x` falló con
  `No such file or directory: C:/Program Files/Git/crypto/x`, no por permisos. El escape
  es duplicar la barra inicial: `docker exec backend touch //crypto/x`.
- **CORS (T6):** el frontend (`localhost:5173`) y el backend (`localhost:8080`) son
  orígenes distintos para el navegador. `backend/src/server.ts` manda
  `Access-Control-Allow-Origin: *`, acotado a `/health` y `/fabric` (no global) — sin eso,
  `fetch` desde `SystemStatusPage` se bloquea aunque el backend responda `200`. Es
  aceptable con `*` porque son endpoints de diagnóstico sin datos sensibles; se acotó a
  propósito para que un endpoint de negocio futuro (Sprint 2+) no herede el wildcard en
  silencio.
- **Si `curl localhost:8080/...` devuelve una respuesta vieja o de otra corrida:**
  probablemente un proceso nativo de Windows (un `npm run dev` / `tsx watch` que no murió
  bien) sigue escuchando en `127.0.0.1:8080`, más específico que el `0.0.0.0:8080` real de
  Docker — el SO le manda el tráfico a ese proceso viejo, no al contenedor. Antes de matar
  cualquier PID en el puerto 8080, identificalo con
  `Get-CimInstance Win32_Process -Filter "ProcessId = <pid>"` (PowerShell): si el nombre es
  `com.docker.backend.exe`, **no lo mates** (es Docker Desktop; matarlo tumba el motor
  entero). Si es `node.exe` con una ruta del proyecto en el `CommandLine`, es seguro
  matarlo.
- **`docker ps -a` con contenedores de nombre random tipo `nifty_sammet` (`Created`,
  nunca `Up`):** son intentos de build del chaincode (`deploy-sample-cc.sh`, T2) — el
  builder externo de Fabric crea uno por cada paquete/instalación. No son parte de
  ningún servicio de este proyecto y `docker/down.sh` no los toca a propósito (un
  `docker container prune -f` los limpiaría, pero afecta contenedores detenidos de
  **cualquier** proyecto en la máquina, no solo este — hacerlo a mano, bajo tu propio
  criterio, nunca automatizado en un script del repo).
- **`up.sh` no "resume" una corrida a medias.** Si `network-up.sh` quedó a medio camino
  (por ejemplo, se interrumpió `up.sh` en el paso 1), el guard existente de
  `network-up.sh` (detecta contenedores de una corrida anterior) hace que `up.sh` aborte
  entero pidiendo correr `network-down.sh` primero — no intenta seguir desde donde quedó,
  y tampoco te avisa si el paso de la app (mongo/backend/frontend) también necesita
  atención. Es el único caso no-idempotente de todo el flujo de un solo comando: ante
  cualquier duda sobre el estado, `bash docker/down.sh && bash docker/up.sh` siempre
  funciona.
