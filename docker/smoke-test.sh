#!/usr/bin/env bash
# Smoke test de HU-021 (T8): asevera los dos escenarios Gherkin CA-01/CA-02 y
# deja evidencia para el PPS. Requiere el stack completo arriba (docker/up.sh).
# No usa "set -e": queremos acumular todos los fallos en un solo reporte en
# vez de cortar en el primer chequeo que falle.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

command -v docker >/dev/null 2>&1 || { echo "FALLO: docker no está en el PATH." >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "FALLO: el motor de Docker no responde (¿Docker Desktop corriendo?)." >&2; exit 1; }

BACKEND_PORT="${BACKEND_PORT:-8080}"
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

fail=0

echo "==> CA-01: servicios arriba (orderer, 2 peers, mongo, backend, frontend)"
for svc in orderer.example.com peer0.org1.example.com peer0.org2.example.com mongo backend frontend; do
  status="$(docker ps --filter "name=^${svc}\$" --format '{{.Status}}')"
  if [ -z "$status" ]; then
    echo "FALLO: '${svc}' no está corriendo (docker ps no lo muestra)." >&2
    fail=1
  else
    echo "OK: ${svc} -> ${status}"
  fi
done

echo
echo "==> CA-01: el chaincode responde en contratoschannel (GET /fabric/ping)"
if ping_output="$(curl -fsS --connect-timeout 5 --max-time 15 "http://127.0.0.1:${BACKEND_PORT}/fabric/ping" 2>&1)" \
   && echo "${ping_output}" | grep -q '"ID"'; then
  echo "OK: /fabric/ping devolvió activos del ledger."
else
  echo "FALLO: GET /fabric/ping no devolvió datos del ledger. Salida: ${ping_output}" >&2
  fail=1
fi

echo
echo "==> CA-02: frontend/src no referencia infraestructura directamente"
grep_output="$(grep -rIE "7051|9051|7050|27017|:5984|fabric|mongodb://" ../frontend/src 2>&1)"
rc=$?
if [ "${rc}" -eq 0 ]; then
  echo "FALLO: frontend/src referencia infraestructura directamente:" >&2
  echo "${grep_output}" >&2
  fail=1
elif [ "${rc}" -eq 1 ]; then
  echo "OK: frontend/src no referencia Fabric/Mongo directamente (solo VITE_API_URL)."
else
  echo "FALLO: grep no pudo revisar frontend/src (rc=${rc}): ${grep_output}" >&2
  fail=1
fi

echo
if [ "${fail}" -ne 0 ]; then
  echo "==> Smoke test HU-021: FALLÓ. Ver mensajes arriba." >&2
  exit 1
fi

echo "==> Smoke test HU-021: PASS (CA-01 y CA-02)."
