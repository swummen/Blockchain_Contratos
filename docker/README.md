# docker/

Infraestructura del MVP: red Hyperledger Fabric (test-network de `fabric-samples`) +
MongoDB + contenedores de `backend`/`frontend`. Fuente de verdad: `claude_docs/SPEC.md`
(arquitectura) y `claude_docs/tasks/plan.md` (decisiones D1‑D9 del módulo `infra`).

## Prerrequisitos

- Docker Desktop con el motor corriendo (`docker ps` debe responder) + Docker Compose v2.
- Git Bash o WSL2 para correr los scripts `.sh` — **nunca PowerShell/cmd.exe** directamente.
  Windows con `core.autocrlf=true` reescribiría los `.sh` con CRLF si no fuera por
  `.gitattributes` (`*.sh eol=lf`) en la raíz del repo.
- Go 1.22+ (para compilar/testear el chaincode, Sprint 2).
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

## Comandos

| Comando | Qué hace |
|---|---|
| `bash docker/network-up.sh` | 1ª vez: descarga `fabric-samples` + binarios + imágenes Docker fijadas en Fabric 2.5.16 / CA 1.5.22. Luego levanta la test-network con Fabric CA (`-ca`) y crea/une el canal `contratoschannel` con LevelDB como state DB (decisión D3). |
| `bash docker/network-down.sh` | Baja la red: elimina contenedores, volúmenes y material criptográfico. Deja el entorno limpio para volver a `network-up.sh`. |
| `bash docker/deploy-sample-cc.sh` | Despliega el chaincode de ejemplo `asset-transfer-basic` en `contratoschannel` (prueba de pipeline; requiere la red arriba). Idempotente. |
| `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo backend` | Levanta Mongo (imagen fijada `7.0.41`, con auth activada) y el `backend` (esqueleto Express+TS de T4, espera a que Mongo esté `healthy` antes de arrancar), ambos unidos a la red `fabric_test` que crea `network-up.sh`. Se puede omitir `backend` para levantar solo Mongo. |
| `docker compose -f docker/compose.app.yml down` | Baja **ambos** servicios (`mongo` y `backend`, comparten este compose file). El volumen de Mongo (`contratos_mongo_data`) sobrevive; agregar `-v` para borrarlo también. |

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
