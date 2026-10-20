#!/usr/bin/env bash
# Inverso de up.sh: borra la aplicación, la red y los volúmenes (todos los datos).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> [1/2] Bajando mongo/backend/frontend (con volúmenes)..."
docker compose -f compose.app.yml down -v

echo
echo "==> [2/2] Bajando la red Fabric..."
bash network-down.sh

echo
echo "==> Todo abajo:"
docker ps -a --format 'table {{.Names}}\t{{.Status}}'
