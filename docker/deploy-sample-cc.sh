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
  echo "El chaincode '${CC_NAME}' ya está desplegado en '${CHANNEL_NAME}'."
else
  echo "==> Empaquetando, instalando, aprobando y confirmando '${CC_NAME}' en '${CHANNEL_NAME}'..."
  ./network.sh deployCC -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -ccp "${CC_SRC_PATH}" -ccl "${CC_SRC_LANGUAGE}"
fi

# InitLedger de asset-transfer-basic solo hace PutState por cada uno de los 6
# activos de ejemplo, sin comprobar si ya existen (verificado en
# fabric-samples/asset-transfer-basic/chaincode-go/chaincode/smartcontract.go
# y confirmado en la práctica: invocarlo dos veces no falla, solo reescribe
# los mismos valores). Por eso se llama siempre, sin intentar detectar si el
# ledger ya estaba inicializado: esa detección terminó siendo la parte
# frágil (sujeta al mismo desfase de sincronización de la query de abajo),
# mientras que llamar dos veces es inofensivo.
echo "==> Inicializando el ledger (InitLedger)..."
./network.sh cc invoke -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -ccic '{"Args":["InitLedger"]}'

echo
echo "==> Consultando GetAllAssets:"

# peer chaincode invoke reporta éxito (status 200) apenas el peer endosante
# confirma la transacción, pero el world state puede tardar un instante más
# en reflejar el bloque. Una query inmediata después de InitLedger puede
# llegar antes de ese commit y devolver una lista vacía aunque todo haya ido
# bien (comprobado: la misma query, corrida unos segundos después, sí trae
# los 6 activos). Se reintenta en vez de asumir que ya está listo.
attempt=1
max_attempts=5
while true; do
  # La asignación va dentro del "if" (no como línea suelta) para que un
  # fallo real de network.sh cc query (red caída, TLS, etc.) no aborte el
  # script por set -e antes de llegar al mensaje de error de abajo.
  if query_output="$(./network.sh cc query -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -ccqc '{"Args":["GetAllAssets"]}' 2>&1)" \
     && echo "${query_output}" | grep -q '"ID"'; then
    break
  fi
  if [ "${attempt}" -ge "${max_attempts}" ]; then
    echo "${query_output}"
    echo "GetAllAssets no devolvió activos tras ${max_attempts} intentos." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 2
done

echo "${query_output}"
