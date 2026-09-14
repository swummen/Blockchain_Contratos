#!/usr/bin/env bash
# Baja la test-network de Hyperledger Fabric: elimina contenedores, volúmenes y
# material criptográfico. Deja el entorno limpio para volver a network-up.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$SCRIPT_DIR/fabric-samples/test-network" ]; then
  echo "No hay red desplegada (fabric-samples/test-network no existe). Nada que bajar."
  exit 0
fi

export PATH="${SCRIPT_DIR}/fabric-samples/bin:${PATH}"
export FABRIC_CFG_PATH="${SCRIPT_DIR}/fabric-samples/config"

cd "$SCRIPT_DIR/fabric-samples/test-network"

# network.sh down limpia contenedores/volúmenes/red bien, pero su paso final
# borra el material criptográfico con un contenedor busybox
# (`docker run -v "$(pwd):/data" ...`) que en Git Bash (MSYS) sufre el mismo
# problema de reescritura de rutas que el bind-mount de DOCKER_SOCK: la ruta
# del host no llega intacta y el "cd /data" falla dentro del contenedor. Se
# tolera ese fallo puntual (no es el teardown de contenedores, que si importa
# y se verifica abajo) y la limpieza de organizations/ se fuerza desde el
# host, sin pasar por Docker.
./network.sh down || true

if docker ps -a --format '{{.Names}}' | grep -q '^orderer\.example\.com$'; then
  echo "network.sh down no terminó de bajar los contenedores. Revisa 'docker ps -a' y Docker Desktop." >&2
  exit 1
fi

rm -rf organizations/peerOrganizations organizations/ordererOrganizations \
       organizations/fabric-ca/org1/msp organizations/fabric-ca/org1/tls-cert.pem \
       organizations/fabric-ca/org1/ca-cert.pem organizations/fabric-ca/org1/IssuerPublicKey \
       organizations/fabric-ca/org1/IssuerRevocationPublicKey organizations/fabric-ca/org1/fabric-ca-server.db \
       organizations/fabric-ca/org2/msp organizations/fabric-ca/org2/tls-cert.pem \
       organizations/fabric-ca/org2/ca-cert.pem organizations/fabric-ca/org2/IssuerPublicKey \
       organizations/fabric-ca/org2/IssuerRevocationPublicKey organizations/fabric-ca/org2/fabric-ca-server.db \
       organizations/fabric-ca/ordererOrg/msp organizations/fabric-ca/ordererOrg/tls-cert.pem \
       organizations/fabric-ca/ordererOrg/ca-cert.pem organizations/fabric-ca/ordererOrg/IssuerPublicKey \
       organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg/fabric-ca-server.db \
       system-genesis-block channel-artifacts log.txt

echo "==> Red abajo y material criptográfico eliminado."
