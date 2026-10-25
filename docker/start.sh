#!/usr/bin/env bash
# Enciende el sistema sin perder datos (por ejemplo, tras reiniciar el PC).
# Fabric primero: el backend se conecta al peer al arrancar.
set -euo pipefail

FABRIC_CORE="orderer.example.com peer0.org1.example.com peer0.org2.example.com"
FABRIC_CAS="ca_org1 ca_org2 ca_orderer"

docker info >/dev/null 2>&1 || { echo "Docker no está corriendo. Abre Docker Desktop y espera a que diga 'Engine running'." >&2; exit 1; }
docker ps -a --format '{{.Names}}' | grep -q '^orderer\.example\.com$' || {
  echo "No hay un sistema creado todavía. Usa 'bash docker/up.sh' (la primera vez o después de down.sh)." >&2
  exit 1
}

# Para instalaciones creadas antes de que network-up.sh lo hiciera: que Fabric
# también se encienda solo en los próximos reinicios.
docker update --restart unless-stopped $FABRIC_CORE $FABRIC_CAS >/dev/null

echo "==> Encendiendo la red Fabric..."
# Uno por uno: un puerto reservado por Windows en un contenedor no debe impedir
# que arranquen los demás.
tmp="$(mktemp -d)"
failed=""
for c in $FABRIC_CORE $FABRIC_CAS; do
  docker start "$c" >/dev/null 2>"$tmp/$c.err" || failed="$failed $c"
done
for c in $FABRIC_CORE; do
  if [[ " $failed " == *" $c "* ]]; then
    echo "No arrancó $c: $(cat "$tmp/$c.err")" >&2
    echo "Si el error dice 'ports are not available', abre PowerShell como administrador y ejecuta" >&2
    echo "'net stop winnat' y luego 'net start winnat'; después vuelve a correr este script." >&2
    rm -rf "$tmp"
    exit 1
  fi
done
for c in $FABRIC_CAS; do
  # Las CA solo se usan al crear identidades: si una falla, el sistema funciona igual.
  if [[ " $failed " == *" $c "* ]]; then
    echo "Aviso: no arrancó $c ($(head -c 120 "$tmp/$c.err")). No afecta el uso normal." >&2
  fi
done
rm -rf "$tmp"
sleep 5

echo "==> Encendiendo MongoDB, backend y frontend..."
docker start mongo >/dev/null
docker restart backend frontend >/dev/null 2>&1 || docker start backend frontend >/dev/null
# Solo existe en el servidor público.
if docker ps -a --format '{{.Names}}' | grep -q '^caddy$'; then docker start caddy >/dev/null; fi
sleep 5
docker ps --format 'table {{.Names}}\t{{.Status}}'
echo
PUBLIC_DOMAIN="$(grep -E '^PUBLIC_DOMAIN=' "$(dirname "$0")/.env" 2>/dev/null | cut -d= -f2- | tr -d '\r' || true)"
if [ -n "$PUBLIC_DOMAIN" ]; then echo "Listo: abre https://$PUBLIC_DOMAIN"; else echo "Listo: abre http://localhost:5173"; fi
