#!/usr/bin/env bash
# Despliega el chaincode contracts en contratoschannel (empaquetar, instalar,
# aprobar y confirmar) y prueba un registro y el rechazo de un duplicado.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHANNEL_NAME="contratoschannel"
CC_NAME="contracts"
CC_SRC_PATH="../../../chaincode"
CC_SRC_LANGUAGE="go"

command -v docker >/dev/null 2>&1 || { echo "Docker no está instalado o no está en el PATH." >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker no está corriendo. Arrancá Docker Desktop primero." >&2; exit 1; }
command -v go >/dev/null 2>&1 || { echo "Go no está en el PATH (packageCC.sh corre 'go mod vendor' al empaquetar)." >&2; exit 1; }

if ! docker ps --format '{{.Names}}' | grep -q '^orderer\.example\.com$'; then
  echo "La red no está arriba. Corre 'bash docker/network-up.sh' primero." >&2
  exit 1
fi

export PATH="${SCRIPT_DIR}/fabric-samples/bin:${PATH}"
export FABRIC_CFG_PATH="${SCRIPT_DIR}/fabric-samples/config"

cd "${SCRIPT_DIR}/fabric-samples/test-network"

# Identidad de Org1 para las consultas e invocaciones de este script.
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

if peer lifecycle chaincode querycommitted -C "${CHANNEL_NAME}" -n "${CC_NAME}" >/dev/null 2>&1; then
  echo "El chaincode '${CC_NAME}' ya está desplegado en '${CHANNEL_NAME}'."
else
  echo "==> Empaquetando (vendoring de Go incluido), instalando, aprobando y confirmando '${CC_NAME}' en '${CHANNEL_NAME}'..."
  ./network.sh deployCC -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" -ccp "${CC_SRC_PATH}" -ccl "${CC_SRC_LANGUAGE}"
fi

echo
echo "==> Invocando RegisterDocument con un documento de prueba..."
# ponytail: cada corrida deja un documento de prueba en el ledger; moverlo al
# else de arriba si molesta en corridas repetidas.
SMOKE_DOC_ID="smoke-test-$(date +%s)-$$"
SMOKE_HASH="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
./network.sh cc invoke -c "${CHANNEL_NAME}" -ccn "${CC_NAME}" \
  -ccic "{\"Args\":[\"RegisterDocument\",\"${SMOKE_DOC_ID}\",\"${SMOKE_HASH}\",\"smoke-test-user\"]}"

# El invoke responde antes de que se corte el bloque (BatchTimeout de 2 s): sin
# esta espera, el duplicado llega antes y no se rechaza.
sleep 3

echo
echo "==> Confirmando que un documentID ya registrado se rechaza (no se puede alterar lo ya anclado)..."
# peer chaincode invoke directo: network.sh aborta ante cualquier fallo, y aquí
# el fallo es el resultado esperado.
ORDERER_CA="${PWD}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem"
PEER0_ORG1_CA="${PWD}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem"

# Reintentos por si el bloque del registro todavía no está confirmado.
attempt=1
max_attempts=5
while true; do
  if duplicate_output="$(peer chaincode invoke \
    -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile "${ORDERER_CA}" \
    -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
    --peerAddresses localhost:7051 --tlsRootCertFiles "${PEER0_ORG1_CA}" \
    -c "{\"Args\":[\"RegisterDocument\",\"${SMOKE_DOC_ID}\",\"${SMOKE_HASH}\",\"smoke-test-user\"]}" 2>&1)"; then
    # Un duplicado aceptado es el error que se busca detectar: no se reintenta.
    echo "Falló: la invocación duplicada tuvo éxito (no fue rechazada)." >&2
    echo "${duplicate_output}" >&2
    exit 1
  fi

  if echo "${duplicate_output}" | grep -qi "already registered"; then
    break
  fi
  if [ "${attempt}" -ge "${max_attempts}" ]; then
    echo "Falló: la segunda invocación con el mismo documentID nunca fue rechazada tras ${max_attempts} intentos." >&2
    echo "${duplicate_output}" >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 2
done
echo "OK: el documento duplicado fue rechazado."
