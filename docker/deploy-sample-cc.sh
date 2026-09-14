#!/usr/bin/env bash
# Despliega el chaincode de ejemplo asset-transfer-basic (Go) en contratoschannel:
# package -> install -> approve -> commit -> InitLedger -> query. Es una prueba
# de extremo a extremo del ciclo de vida de chaincode en Fabric, no el contrato
# real del proyecto (ese llega en Sprint 2, módulo `ledger`). Ver T2 en
# claude_docs/tasks/todo.md.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHANNEL_NAME="contratoschannel"
CC_NAME="basic"
CC_SRC_PATH="../asset-transfer-basic/chaincode-go"
CC_SRC_LANGUAGE="go"

command -v docker >/dev/null 2>&1 || { echo "Docker no está instalado o no está en el PATH." >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker no está corriendo. Arrancá Docker Desktop primero." >&2; exit 1; }

if ! docker ps --format '{{.Names}}' | grep -q '^orderer\.example\.com$'; then
  echo "La red no está arriba. Corre 'bash docker/network-up.sh' primero." >&2
  exit 1
fi

export PATH="${SCRIPT_DIR}/fabric-samples/bin:${PATH}"
export FABRIC_CFG_PATH="${SCRIPT_DIR}/fabric-samples/config"

cd "${SCRIPT_DIR}/fabric-samples/test-network"

# Identidad de Org1 solo para el chequeo de idempotencia (querycommitted).
# network.sh arma sus propias variables internamente para deployCC/cc.
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

if peer lifecycle chaincode querycommitted -C "${CHANNEL_NAME}" -n "${CC_NAME}" >/dev/null 2>&1; then
  echo "El chaincode '${CC_NAME}' ya está desplegado en '${CHANNEL_NAME}'; no se vuelve a inicializar el ledger."
else
  echo "==> Empaquetando, instalando, aprobando y confirmando '${CC_NAME}' en '${CHANNEL_NAME}'..."
  ./network.sh deployCC -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -ccp "${CC_SRC_PATH}" -ccl "${CC_SRC_LANGUAGE}"

  echo "==> Inicializando el ledger (InitLedger)..."
  ./network.sh cc invoke -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -ccic '{"Args":["InitLedger"]}'
fi

echo
echo "==> Consultando GetAllAssets:"
./network.sh cc query -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -cciq '{"Args":["GetAllAssets"]}'
