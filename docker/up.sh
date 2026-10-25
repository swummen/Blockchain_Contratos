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

env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- | tr -d ''; }
PUBLIC_DOMAIN="$(env_value PUBLIC_DOMAIN)"
APP_SERVICES="mongo backend frontend"
if [ -n "$PUBLIC_DOMAIN" ]; then
  # Vacío también cuenta: compose cae en el valor de desarrollo.
  jwt="$(env_value JWT_SECRET)"; mongo_pw="$(env_value MONGO_ROOT_PASSWORD)"
  if [ -z "$jwt" ] || [ "$jwt" = "contratos-dev-secret-cambiar-en-produccion" ] ||
     [ -z "$mongo_pw" ] || [ "$mongo_pw" = "changeme" ]; then
    echo "PUBLIC_DOMAIN tiene valor pero JWT_SECRET o MONGO_ROOT_PASSWORD siguen con el valor de ejemplo." >&2
    echo "Genéralos con 'openssl rand -hex 32' en docker/.env (DESPLIEGUE-AZURE.md, paso 4)." >&2
    exit 1
  fi
  APP_SERVICES="$APP_SERVICES caddy"
fi

echo "==> [1/4] Red Fabric + canal contratoschannel..."
bash network-up.sh

echo
echo "==> [2/4] Chaincode real del proyecto (contracts)..."
bash deploy-cc.sh

echo
echo "==> [3/4] Mongo + backend + frontend${PUBLIC_DOMAIN:+ + Caddy (https://$PUBLIC_DOMAIN)}..."
# --build: evita dejar corriendo una imagen con código viejo.
docker compose --env-file .env -f compose.app.yml up -d --build $APP_SERVICES

echo
echo "==> [4/4] Usuarios de prueba (idempotente: no toca los que ya existen)..."
docker exec backend node dist/scripts/seedUsers.js

echo
echo "==> Todo arriba:"
docker ps --format 'table {{.Names}}\t{{.Status}}'
