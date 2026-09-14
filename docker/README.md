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

## Puertos usados por la red (verificar que estén libres)

| Puerto | Servicio |
|---|---|
| 7050 | orderer.example.com |
| 7051 | peer0.org1.example.com |
| 9051 | peer0.org2.example.com |
| 7054 | ca_org1 |
| 8054 | ca_org2 |
| 9054 | ca_orderer |
| 27017 | mongo (llega en la Fase 2 de este módulo, T3) |

## Comandos

| Comando | Qué hace |
|---|---|
| `bash docker/network-up.sh` | 1ª vez: descarga `fabric-samples` + binarios + imágenes Docker fijadas en Fabric 2.5.16 / CA 1.5.22. Luego levanta la test-network con Fabric CA (`-ca`) y crea/une el canal `contratoschannel` con LevelDB como state DB (decisión D3). |
| `bash docker/network-down.sh` | Baja la red: elimina contenedores, volúmenes y material criptográfico. Deja el entorno limpio para volver a `network-up.sh`. |

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
