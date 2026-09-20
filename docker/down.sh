#!/usr/bin/env bash
# Inversa de up.sh (T7): baja app + red + volúmenes, deja el checkout listo
# para volver a correr up.sh desde cero. A diferencia del "docker compose
# down" suelto que documenta docker/README.md (que preserva el volumen de
# Mongo para uso iterativo), acá se borra todo a propósito -v.
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
