#!/usr/bin/env bash
# Levanta la test-network de Hyperledger Fabric (fabric-samples) con Fabric CA
# y crea/une el canal contratoschannel. Ver decisiones D1-D5 en claude_docs/tasks/plan.md.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FABRIC_VERSION="2.5.16"
CA_VERSION="1.5.22"
CHANNEL_NAME="contratoschannel"

command -v docker >/dev/null 2>&1 || { echo "Docker no está instalado o no está en el PATH." >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker no está corriendo. Arrancá Docker Desktop primero." >&2; exit 1; }

cd "$SCRIPT_DIR"

if [ ! -d fabric-samples/test-network ]; then
  echo "==> fabric-samples no está presente. Descargando binarios + imágenes Docker" \
       "(versión fijada: Fabric ${FABRIC_VERSION} / CA ${CA_VERSION}) y clonando el repo..."
  curl -fsSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
  chmod +x install-fabric.sh
  ./install-fabric.sh -f "${FABRIC_VERSION}" -c "${CA_VERSION}" docker samples binary
  rm -f install-fabric.sh
fi

# docker ps -a (no solo ps): una corrida anterior interrumpida a medias deja
# contenedores creados pero no "Up", y ese estado también debe bloquear un
# nuevo "up" en vez de chocar con contenedores/volúmenes existentes.
if docker ps -a --format '{{.Names}}' | grep -q '^orderer\.example\.com$'; then
  echo "Ya hay contenedores de una corrida anterior. Corre 'bash docker/network-down.sh' antes de volver a levantarla." >&2
  exit 1
fi

# Git Bash (MSYS) reescribe valores tipo /var/run/docker.sock pasados como
# argumento/variable de entorno a un binario nativo de Windows (docker.exe) en
# rutas de Windows (p.ej. C:\Program Files\Git\var\...), lo que rompe el
# bind-mount ${DOCKER_SOCK} que network.sh arma para los peers. Como ese valor
# vive en el YAML del compose (no en argv), lo fijamos aquí en el archivo en
# vez de tocar la variable de entorno: docker-compose lee el YAML directo del
# disco, sin pasar por la conversión de rutas de MSYS.
for f in fabric-samples/test-network/compose/docker/docker-compose-test-net.yaml \
         fabric-samples/test-network/compose/docker/docker-compose-bft-test-net.yaml; do
  if [ -f "$f" ] && grep -q '\${DOCKER_SOCK}' "$f"; then
    sed -i 's#\${DOCKER_SOCK}#/var/run/docker.sock#g' "$f"
  fi
done

# El peer CLI que usa network.sh (checkPrereqs) necesita los binarios y config
# descargados por install-fabric.sh -f/-c en el paso anterior.
export PATH="${SCRIPT_DIR}/fabric-samples/bin:${PATH}"
export FABRIC_CFG_PATH="${SCRIPT_DIR}/fabric-samples/config"

cd fabric-samples/test-network
./network.sh up createChannel -ca -c "${CHANNEL_NAME}" -s goleveldb

echo
echo "==> Canal '${CHANNEL_NAME}' creado. Contenedores activos:"
docker ps --format 'table {{.Names}}\t{{.Status}}'
