#!/usr/bin/env bash
# Levanta todo en orden: red Fabric, chaincode, Mongo/backend/frontend y
# usuarios de prueba. Cada paso tiene sus propias comprobaciones.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

command -v go >/dev/null 2>&1 || {
  echo "Go no está en el PATH (hace falta para empaquetar el chaincode). Ver docker/README.md > Prerrequisitos." >&2
  exit 1
}
command -v jq >/dev/null 2>&1 || {
  echo "jq no está en el PATH (lo usan los scripts de fabric-samples). Ver docker/README.md > Prerrequisitos." >&2
  exit 1
}

if [ ! -f .env ]; then
  echo "==> docker/.env no existe; lo creo desde .env.example (valores por defecto)."
  cp .env.example .env
fi

echo "==> [1/4] Red Fabric + canal contratoschannel..."
bash network-up.sh

echo
echo "==> [2/4] Chaincode real del proyecto (contracts)..."
bash deploy-cc.sh

echo
echo "==> [3/4] Mongo + backend + frontend..."
# --build: evita dejar corriendo una imagen con código viejo.
docker compose --env-file .env -f compose.app.yml up -d --build mongo backend frontend

echo
echo "==> [4/4] Usuarios de prueba (idempotente: no toca los que ya existen)..."
docker exec backend node dist/scripts/seedUsers.js

echo
echo "==> Todo arriba:"
docker ps --format 'table {{.Names}}\t{{.Status}}'
