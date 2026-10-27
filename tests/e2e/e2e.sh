#!/usr/bin/env bash
# Prueba funcional de punta a punta contra la API real: 47 casos de los 3 roles.
# Lee el código OTP de `docker logs backend`, así que el backend debe correr con
# SMTP_HOST vacío. Contra el backend directo y no por /api: el límite de nginx
# para el login cortaría la prueba. Usa los usuarios que siembra up.sh con
# SEED_EMAIL=contratosblockchain@gmail.com. Uso: bash tests/e2e/e2e.sh
set -uo pipefail
B="${API_URL:-http://127.0.0.1:8080}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"
PASS=0; FAIL=0
check() { # check "descripción" esperado obtenido
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf "  OK    %-70s %s\n" "$1" "$3"
  else FAIL=$((FAIL+1)); printf "  FALLA %-70s esperado=%s obtenido=%s\n" "$1" "$2" "$3"; fi
}
code() { curl -s -o $WORK/body.json -w "%{http_code}" "$@"; }
jqb() { jq -r "$1" $WORK/body.json | tr -d '\r'; }
login() { # $1 correo, $2 clave → JWT
  curl -s -o /dev/null -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"password\":\"$2\"}" $B/auth/login
  sleep 1
  local c; c=$(docker logs backend 2>&1 | grep "código OTP para $1:" | tail -1 | sed 's/.*: //' | tr -d '\r')
  local r t; r=$(curl -s -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"code\":\"$c\"}" $B/auth/verify-otp)
  t=$(echo "$r" | jq -r .token | tr -d '\r')
  # Cuentas de prueba del ensayo local: se acepta la política vigente (RF-055).
  if [ "$(echo "$r" | jq -r .policyAccepted | tr -d '\r')" = "false" ]; then
    curl -s -o /dev/null -X POST -H "Authorization: Bearer $t" -H 'Content-Type: application/json' \
      -d "{\"version\":\"$(echo "$r" | jq -r .policyVersion | tr -d '\r')\"}" $B/auth/policy/accept
  fi
  echo "$t"
}
H() { echo "Authorization: Bearer $1"; }

printf '%%PDF-1.4\n%% contrato e2e original\n%%%%EOF\n' > orig.pdf
printf '%%PDF-1.4\n%% contrato e2e alterado\n%%%%EOF\n' > alt.pdf
echo "no soy un pdf" > falso.pdf

E1=contratosblockchain+empleado@gmail.com; E2=contratosblockchain+empleado2@gmail.com
VE=contratosblockchain+verificador@gmail.com; AD=contratosblockchain+admin@gmail.com; PW='Contratos123!'

echo "== Autenticación"
check "login con clave incorrecta" 401 "$(code -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$E1\",\"password\":\"mala\"}" $B/auth/login)"
check "login correcto (envía código)" 200 "$(code -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$E1\",\"password\":\"$PW\"}" $B/auth/login)"
check "código incorrecto" 400 "$(code -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$E1\",\"code\":\"000000\"}" $B/auth/verify-otp)"
T1=$(login $E1 "$PW"); T2=$(login $E2 "$PW"); TV=$(login $VE "$PW"); TA=$(login $AD "$PW")
check "sesiones de los 4 usuarios" 4 "$(for t in $T1 $T2 $TV $TA; do [ ${#t} -gt 50 ] && echo x; done | wc -l | tr -d ' ')"
check "GET /auth/me (Empleado)" "Empleado" "$(code -H "$(H $T1)" $B/auth/me >/dev/null; jqb .user.role)"
check "sin token: 401" 401 "$(code $B/documents)"

echo "== Empleado"
check "subir PDF" 201 "$(code -H "$(H $T1)" -F "document=@orig.pdf;type=application/pdf" $B/documents)"; DOC=$(jqb .documentId)
check "subir el mismo PDF pendiente: 409" 409 "$(code -H "$(H $T1)" -F "document=@orig.pdf;type=application/pdf" $B/documents)"
check "subir archivo que no es PDF: 400" 400 "$(code -H "$(H $T1)" -F "document=@falso.pdf;type=application/pdf" $B/documents)"
check "mis documentos incluyen el recién subido" 1 "$(code -H "$(H $T1)" $B/documents >/dev/null; jqb '[.[] | select(.documentId=="'$DOC'")] | length')"
check "mis documentos: huella enmascarada" true "$(jqb 'all(.[]; .hash | contains("•"))')"
check "mi trazabilidad del documento" 200 "$(code -H "$(H $T1)" $B/documents/$DOC/events)"
check "evento registro con TxID" registro "$(jqb '.[0].action')"
check "trazabilidad general: 403" 403 "$(code -H "$(H $T1)" $B/events)"
check "otro Empleado ve trazabilidad ajena: 403" 403 "$(code -H "$(H $T2)" $B/documents/$DOC/events)"
check "otro Empleado no ve el documento en su lista" 0 "$(code -H "$(H $T2)" $B/documents >/dev/null; jqb 'length')"

echo "== Verificador"
check "listado completo" 200 "$(code -H "$(H $TV)" $B/documents)"
check "listado: huella completa" 64 "$(jqb '.[] | select(.documentId=="'$DOC'") | .hash | length')"
check "consultar documento" 200 "$(code -H "$(H $TV)" $B/documents/$DOC)"
check "documento inexistente: 404" 404 "$(code -H "$(H $TV)" $B/documents/00000000-0000-0000-0000-000000000000)"
check "verificar con el mismo PDF" Verificado "$(code -H "$(H $TV)" -F "document=@orig.pdf;type=application/pdf" $B/documents/$DOC/verifications >/dev/null; jqb .status)"
check "verificar con PDF alterado" Alterado "$(code -H "$(H $TV)" -F "document=@alt.pdf;type=application/pdf" $B/documents/$DOC/verifications >/dev/null; jqb .status)"
check "trazabilidad general" 200 "$(code -H "$(H $TV)" $B/events)"
check "eventos del documento (registro + 2 verificaciones)" 3 "$(jqb '[.[] | select(.documentId=="'$DOC'")] | length')"
check "Verificador no sube documentos: 403" 403 "$(code -H "$(H $TV)" -F "document=@orig.pdf;type=application/pdf" $B/documents)"
check "panel solo Administrador: 403" 403 "$(code -H "$(H $TV)" $B/documents/summary)"
check "Empleado no verifica: 403" 403 "$(code -H "$(H $T1)" -F "document=@orig.pdf;type=application/pdf" $B/documents/$DOC/verifications)"

echo "== Administrador"
check "panel de totales" 200 "$(code -H "$(H $TA)" $B/documents/summary)"
check "panel: total = suma de estados" true "$(jqb '.total == (.pendiente + .verificado + .alterado)')"
check "listado: huella enmascarada" true "$(code -H "$(H $TA)" $B/documents >/dev/null; jqb '.[] | select(.documentId=="'$DOC'") | .hash | contains("•")')"
check "trazabilidad general" 200 "$(code -H "$(H $TA)" $B/events)"
check "listar usuarios" 200 "$(code -H "$(H $TA)" $B/users)"
check "sin passwordHash en la respuesta" false "$(jqb 'any(.[]; has("passwordHash"))')"
NEW=contratosblockchain+e2e$RANDOM@gmail.com
check "crear usuario" 201 "$(code -X POST -H "$(H $TA)" -H 'Content-Type: application/json' -d "{\"name\":\"Prueba E2E\",\"email\":\"$NEW\",\"role\":\"Empleado\"}" $B/users)"; NID=$(jqb .user.userId); TMP=$(jqb .temporaryPassword)
check "correo duplicado: 409" 409 "$(code -X POST -H "$(H $TA)" -H 'Content-Type: application/json' -d "{\"name\":\"X\",\"email\":\"$NEW\",\"role\":\"Empleado\"}" $B/users)"
TN=$(login $NEW "$TMP")
check "usuario nuevo inicia sesión con la clave temporal" 200 "$(code -H "$(H $TN)" $B/auth/me)"
check "cambiar rol del usuario" 200 "$(code -X PUT -H "$(H $TA)" -H 'Content-Type: application/json' -d "{\"name\":\"Prueba E2E\",\"email\":\"$NEW\",\"role\":\"Verificador\"}" $B/users/$NID)"
check "su sesión abierta se corta al cambiar el rol" 401 "$(code -H "$(H $TN)" $B/auth/me)"
check "Administrador no puede desactivarse a sí mismo" 400 "$(code -X POST -H "$(H $TA)" $B/users/$(curl -s -H "$(H $TA)" $B/auth/me | jq -r .user.userId | tr -d '\r')/deactivate)"
for i in 1 2 3 4 5; do curl -s -o /dev/null -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$NEW\",\"password\":\"mala\"}" $B/auth/login; done
check "5 intentos fallidos bloquean la cuenta: 423" 423 "$(code -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$NEW\",\"password\":\"$TMP\"}" $B/auth/login)"
check "desactivar usuario" 204 "$(code -X POST -H "$(H $TA)" $B/users/$NID/deactivate)"
check "usuario desactivado figura Inactivo" Inactivo "$(code -H "$(H $TA)" $B/users >/dev/null; jqb '.[] | select(.userId=="'$NID'") | .status')"

echo "== Cambio de contraseña y cierre de sesión"
check "cambiar contraseña con la actual incorrecta: 400" 400 "$(code -X POST -H "$(H $T2)" -H 'Content-Type: application/json' -d '{"currentPassword":"mala","newPassword":"OtraClave123"}' $B/auth/change-password)"
check "cambiar contraseña" 200 "$(code -X POST -H "$(H $T2)" -H 'Content-Type: application/json' -d "{\"currentPassword\":\"$PW\",\"newPassword\":\"OtraClave123\"}" $B/auth/change-password)"
check "devolverla a la original" 200 "$(code -X POST -H "$(H $T2)" -H 'Content-Type: application/json' -d "{\"currentPassword\":\"OtraClave123\",\"newPassword\":\"$PW\"}" $B/auth/change-password)"
check "cerrar sesión" 204 "$(code -X POST -H "$(H $T2)" $B/auth/logout)"
check "el token cerrado ya no sirve" 401 "$(code -H "$(H $T2)" $B/documents)"

echo; echo "RESULTADO: $PASS OK, $FAIL fallas"
[ "$FAIL" -eq 0 ]
