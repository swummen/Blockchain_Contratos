#!/usr/bin/env bash
# Levanta la test-network de Fabric con Fabric CA y crea el canal contratoschannel.
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

# ps -a: una corrida interrumpida deja contenedores detenidos que también estorban.
if docker ps -a --format '{{.Names}}' | grep -q '^orderer\.example\.com$'; then
  echo "Ya hay contenedores de una corrida anterior. Corre 'bash docker/network-down.sh' antes de volver a levantarla." >&2
  exit 1
fi

# Git Bash convierte /var/run/docker.sock en una ruta de Windows si viaja en una
# variable; se escribe fijo en el YAML, que Docker lee sin esa conversión.
for f in fabric-samples/test-network/compose/docker/docker-compose-test-net.yaml \
         fabric-samples/test-network/compose/docker/docker-compose-bft-test-net.yaml; do
  if [ -f "$f" ] && grep -q '\${DOCKER_SOCK}' "$f"; then
    sed -i 's#\${DOCKER_SOCK}#/var/run/docker.sock#g' "$f"
  fi
done

# Smart App Control de Windows puede bloquear configtxlator.exe ("Permission
# denied"). En ese caso se usa un reemplazo que corre la misma versión en Docker,
# montando fabric-samples en la misma ruta para que valgan las rutas /c/...
if [ -f fabric-samples/bin/configtxlator.exe ] && ! fabric-samples/bin/configtxlator.exe version >/dev/null 2>&1; then
  echo "==> configtxlator.exe bloqueado por Windows; uso hyperledger/fabric-tools:${FABRIC_VERSION} vía Docker."
  docker image inspect "hyperledger/fabric-tools:${FABRIC_VERSION}" >/dev/null 2>&1 \
    || docker pull "hyperledger/fabric-tools:${FABRIC_VERSION}"
  SAMPLES_DIR="$(cd fabric-samples && pwd)"
  cat > fabric-samples/bin/configtxlator <<EOF
#!/usr/bin/env bash
MSYS_NO_PATHCONV=1 exec docker run --rm -i \\
  -v "$(cygpath -w "$SAMPLES_DIR"):$SAMPLES_DIR" -w "\$(pwd)" \\
  hyperledger/fabric-tools:${FABRIC_VERSION} configtxlator "\$@"
EOF
  chmod +x fabric-samples/bin/configtxlator
fi

# network.sh necesita los binarios y la configuración descargados arriba.
export PATH="${SCRIPT_DIR}/fabric-samples/bin:${PATH}"
export FABRIC_CFG_PATH="${SCRIPT_DIR}/fabric-samples/config"

cd fabric-samples/test-network
./network.sh up createChannel -ca -c "${CHANNEL_NAME}" -s goleveldb

# La test-network crea sus contenedores sin política de reinicio: tras reiniciar
# el PC, Docker encendía solo la aplicación y la trazabilidad fallaba.
docker update --restart unless-stopped \
  orderer.example.com peer0.org1.example.com peer0.org2.example.com \
  ca_org1 ca_org2 ca_orderer >/dev/null

echo
echo "==> Canal '${CHANNEL_NAME}' creado. Contenedores activos:"
docker ps --format 'table {{.Names}}\t{{.Status}}'
