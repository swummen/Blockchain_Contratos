#!/usr/bin/env bash
# Orquesta todo el stack en una sola orden (T7): red Fabric -> chaincode de
# ejemplo -> Mongo/backend/frontend. Pensado para correr desde un checkout
# limpio. Cada paso ya es idempotente/con guardas propias (network-up.sh,
# deploy-sample-cc.sh); acá solo se encadenan en el orden correcto.
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

echo "==> [1/3] Red Fabric + canal contratoschannel..."
bash network-up.sh

echo
echo "==> [2/3] Chaincode de ejemplo (prueba de pipeline)..."
bash deploy-sample-cc.sh

echo
echo "==> [3/3] Mongo + backend + frontend..."
# --build a propósito (no solo "up -d" como en el comando suelto que documenta
# docker/README.md): el proyecto sigue en desarrollo activo, así que up.sh
# siempre reconstruye backend/frontend en vez de arriesgarse a dejar una
# imagen vieja corriendo con código que ya cambió.
docker compose --env-file .env -f compose.app.yml up -d --build mongo backend frontend

echo
echo "==> Todo arriba:"
docker ps --format 'table {{.Names}}\t{{.Status}}'
