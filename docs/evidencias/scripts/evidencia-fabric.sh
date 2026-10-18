#!/usr/bin/env bash
# Evidencia de integración backend ↔ Hyperledger Fabric (OBJETIVO 3).
# Uso (desde Git Bash, con el stack arriba y el backend SIN SMTP para leer el OTP en sus logs):
#   SMTP_HOST= docker compose --env-file docker/.env -f docker/compose.app.yml up -d backend
#   bash docs/evidencias/scripts/evidencia-fabric.sh "$PWD" "$(mktemp -d)"
#   docker compose --env-file docker/.env -f docker/compose.app.yml up -d backend   # restaura Brevo
# Requiere jq y los binarios de docker/fabric-samples/bin. Crea un documento de prueba real.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cygpath -u "$1")"; W="$(cygpath -u "$2")"; B=http://127.0.0.1:8080
cd "$W"

# --- PDFs de prueba: original y alterado (cambia 1 carácter del texto) ---
printf '%%PDF-1.4\n%% Contrato laboral de prueba - TrazaDoc - evidencia de integracion\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%%%EOF\n' > contrato-evidencia.pdf
sed 's/integracion/integracioN/' contrato-evidencia.pdf > contrato-evidencia-alterado.pdf

# --- CLI de Fabric con la identidad Admin de Org1 (consulta directa al ledger) ---
TN="$REPO/docker/fabric-samples/test-network"
export PATH="$TN/../bin:$PATH" FABRIC_CFG_PATH="$TN/../config" CORE_PEER_TLS_ENABLED=true \
  CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_ADDRESS=localhost:7051 \
  CORE_PEER_TLS_ROOTCERT_FILE="$TN/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem" \
  CORE_PEER_MSPCONFIGPATH="$TN/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
height() { peer channel getinfo -c contratoschannel 2>/dev/null | sed 's/^Blockchain info: //' | jq -r .height; }

login() { # $1 = correo → imprime el JWT
  curl -s -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"password\":\"Contratos123!\"}" $B/auth/login >/dev/null
  sleep 1
  local code; code=$(docker logs backend 2>&1 | grep "código OTP para $1:" | tail -1 | sed 's/.*: //')
  curl -s -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"code\":\"$code\"}" $B/auth/verify-otp | jq -r .token
}

step() { echo; echo "### $*"; }

step "0. Estado inicial"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "GET /health → $(curl -s $B/health)"
echo "GET /fabric/ping → $(curl -s $B/fabric/ping | jq -c '{status, contrato: .result.contracts | keys}')"
H0=$(height); echo "Altura del canal contratoschannel (bloques): $H0"
echo "SHA-256 local del PDF original:  $(sha256sum contrato-evidencia.pdf | cut -d' ' -f1)"
echo "SHA-256 local del PDF alterado:  $(sha256sum contrato-evidencia-alterado.pdf | cut -d' ' -f1)"

EMP=$(login contratosblockchain+empleado@gmail.com)
VER=$(login contratosblockchain+verificador@gmail.com)
ADM=$(login contratosblockchain+admin@gmail.com)
echo "Sesiones abiertas: Empleado, Verificador, Administrador (JWT obtenidos tras el código OTP)"

step "1. Registro (Empleado): POST /documents"
R=$(curl -s -w '\nHTTP %{http_code}' -H "Authorization: Bearer $EMP" -F "document=@contrato-evidencia.pdf;type=application/pdf" $B/documents)
echo "$R"; DOC=$(echo "$R" | head -1 | jq -r .documentId)
H1=$(height); echo "Altura del canal: $H0 → $H1 (nuevo bloque con la transacción RegisterDocument)"

step "2. Consulta (Verificador): GET /documents/$DOC"
curl -s -w '\nHTTP %{http_code}\n' -H "Authorization: Bearer $VER" $B/documents/$DOC

step "3. Verificación con el MISMO archivo (Verificador): POST /documents/$DOC/verifications"
curl -s -w '\nHTTP %{http_code}\n' -H "Authorization: Bearer $VER" -F "document=@contrato-evidencia.pdf;type=application/pdf" $B/documents/$DOC/verifications
H2=$(height); echo "Altura del canal: $H1 → $H2"

step "4. Verificación con el archivo ALTERADO (Verificador)"
curl -s -w '\nHTTP %{http_code}\n' -H "Authorization: Bearer $VER" -F "document=@contrato-evidencia-alterado.pdf;type=application/pdf" $B/documents/$DOC/verifications
H3=$(height); echo "Altura del canal: $H2 → $H3"

step "5. Trazabilidad del documento (Empleado dueño): GET /documents/$DOC/events"
curl -s -H "Authorization: Bearer $EMP" $B/documents/$DOC/events | jq .

step "6. Misma consulta, vista del Administrador: GET /documents (huella enmascarada)"
curl -s -H "Authorization: Bearer $ADM" $B/documents | jq --arg d "$DOC" '.[] | select(.documentId==$d)'

step "7. Contraste DIRECTO en el ledger (CLI de Fabric, sin pasar por el backend)"
echo '$ peer chaincode query -C contratoschannel -n contracts -c {"Args":["GetDocument","'$DOC'"]}'
peer chaincode query -C contratoschannel -n contracts -c "{\"Args\":[\"GetDocument\",\"$DOC\"]}" | jq .
echo '$ peer chaincode query -C contratoschannel -n contracts -c {"Args":["GetDocumentEvents","'$DOC'"]}'
peer chaincode query -C contratoschannel -n contracts -c "{\"Args\":[\"GetDocumentEvents\",\"$DOC\"]}" | jq .

step "8. Bloques que contienen esas transacciones (leídos del peer0.org1 dentro de fabric-tools)"
ORGS="$REPO/docker/fabric-samples/test-network/organizations"
MSYS_NO_PATHCONV=1 docker run --rm --network fabric_test   -v "$(cygpath -w "$SCRIPT_DIR"):/w" -v "$(cygpath -w "$ORGS"):/orgs:ro"   -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_LOCALMSPID=Org1MSP -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051   -e CORE_PEER_TLS_ROOTCERT_FILE=/orgs/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem   -e CORE_PEER_MSPCONFIGPATH=/orgs/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp   hyperledger/fabric-tools:2.5.16 bash /w/bloques-fabric.sh $(seq "$H0" $((H3 - 1)))
