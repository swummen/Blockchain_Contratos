#!/usr/bin/env bash
# Apaga el sistema sin borrar datos. Se enciende de nuevo con start.sh.
set -euo pipefail

echo "==> Apagando la aplicación y la red Fabric (los datos se conservan)..."
docker stop frontend backend mongo >/dev/null 2>&1 || true
docker stop peer0.org1.example.com peer0.org2.example.com orderer.example.com ca_org1 ca_org2 ca_orderer >/dev/null 2>&1 || true
docker ps -a --format '{{.Names}}' | grep -E '^dev-peer0\.org[12]\.example\.com-contracts' | xargs -r docker stop >/dev/null 2>&1 || true
echo "Apagado. Para encender de nuevo: bash docker/start.sh"
