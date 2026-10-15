#!/usr/bin/env bash
# Vuelve a encender el sistema SIN perder datos (p. ej. después de reiniciar el
# computador). Requiere que antes se haya corrido `bash docker/up.sh` al menos una vez.
# Fabric primero y la aplicación después: el backend se conecta al peer al arrancar.
set -euo pipefail

docker info >/dev/null 2>&1 || { echo "Docker no está corriendo. Abre Docker Desktop y espera a que diga 'Engine running'." >&2; exit 1; }
docker ps -a --format '{{.Names}}' | grep -q '^orderer\.example\.com$' || {
  echo "No hay un sistema creado todavía. Usa 'bash docker/up.sh' (la primera vez o después de down.sh)." >&2
  exit 1
}

echo "==> Encendiendo la red Fabric..."
docker start ca_org1 ca_org2 ca_orderer orderer.example.com peer0.org1.example.com peer0.org2.example.com >/dev/null
sleep 5
echo "==> Encendiendo MongoDB, backend y frontend..."
docker start mongo >/dev/null
docker restart backend frontend >/dev/null 2>&1 || docker start backend frontend >/dev/null
sleep 5
docker ps --format 'table {{.Names}}\t{{.Status}}'
echo
echo "Listo: abre http://localhost:5173"
