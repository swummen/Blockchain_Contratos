#!/usr/bin/env bash
# TRZ-03 (OE4, RNF-13): compara documento por documento la huella y el estado
# guardados en MongoDB con los del ledger de Fabric.
# Uso, desde la raíz del repositorio y con el stack arriba (local o en la VM):
#   bash docs/evidencias/scripts/consistencia-ledger-mongo.sh
# Escribe docs/evidencias/consistencia-ledger-mongo.md. Solo lee: no crea ni cambia nada.
set -euo pipefail
REPO="$(pwd)"
TN="$REPO/docker/fabric-samples/test-network"
export PATH="$TN/../bin:$PATH" FABRIC_CFG_PATH="$TN/../config" CORE_PEER_TLS_ENABLED=true \
  CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_ADDRESS=localhost:7051 \
  CORE_PEER_TLS_ROOTCERT_FILE="$TN/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem" \
  CORE_PEER_MSPCONFIGPATH="$TN/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"

MONGO_USER=$(grep -E '^MONGO_ROOT_USER=' docker/.env | cut -d= -f2- || true)
MONGO_PW=$(grep -E '^MONGO_ROOT_PASSWORD=' docker/.env | cut -d= -f2- || true)
DOCS=$(docker exec mongo mongosh -u "${MONGO_USER:-root}" -p "${MONGO_PW:-changeme}" --authenticationDatabase admin contratos --quiet \
  --eval 'db.documents.find({}, {hash: 1, status: 1, name: 1}).sort({registeredAt: 1}).forEach(d => print([d._id, d.hash, d.status, d.name].join("\t")))')

OUT="$REPO/docs/evidencias/consistencia-ledger-mongo.md"
total=0; ok=0; rows=""
while IFS=$'\t' read -r id hash status name; do
  [ -z "$id" ] && continue
  total=$((total + 1))
  ledger=$(peer chaincode query -C contratoschannel -n contracts -c "{\"Args\":[\"GetDocument\",\"$id\"]}" 2>/dev/null || echo '{}')
  lhash=$(echo "$ledger" | jq -r '.Sha256Hex // "no está en el ledger"')
  lstatus=$(echo "$ledger" | jq -r '.Status // "-"')
  if [ "$lhash" = "$hash" ] && [ "$lstatus" = "$status" ]; then r=PASS; ok=$((ok + 1)); else r=FAIL; fi
  rows+="| $name | \`${id:0:8}…\` | \`${hash:0:12}…\` | \`${lhash:0:12}…\` | $status | $lstatus | $r |"$'\n'
done <<< "$DOCS"

{
  echo "# Consistencia entre el ledger y la base de datos (TRZ-03 · RNF-13)"
  echo
  echo "| | |"
  echo "|---|---|"
  echo "| **Resultado** | $([ "$ok" -eq "$total" ] && echo '**CUMPLE**' || echo '**NO CUMPLE**'): $ok de $total documentos con la misma huella y el mismo estado |"
  echo "| Fecha | $(date '+%d/%m/%Y %H:%M') |"
  echo "| Entorno | $(hostname) |"
  echo
  echo "Por cada documento de MongoDB (colección \`documents\`) se consulta \`GetDocument\` en el chaincode"
  echo "y se comparan la huella SHA-256 y el estado. Huellas y identificadores abreviados."
  echo
  echo "| Documento | ID | Huella en MongoDB | Huella en el ledger | Estado en MongoDB | Estado en el ledger | Resultado |"
  echo "|---|---|---|---|---|---|---|"
  printf '%s' "$rows"
} > "$OUT"
echo "TRZ-03: $ok de $total documentos consistentes. Informe: docs/evidencias/consistencia-ledger-mongo.md"
