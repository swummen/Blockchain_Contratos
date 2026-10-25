# Despliegue en Azure: TrazaDoc

Guía para publicar el sistema en una máquina virtual Linux de Azure, con HTTPS y
una dirección pública. Para instalarlo en un PC de desarrollo usa
[INSTALACION.md](INSTALACION.md).

Tiempo estimado: 45 minutos la primera vez.

## Cómo queda montado

```
Navegador ──HTTPS 443──> Caddy (certificado Let's Encrypt)
                           └──> nginx del frontend (página + /api)
                                  └── /api/* ──> backend ──> MongoDB
                                                     └────> red Fabric (peers, orderer)
```

- Desde internet solo se llega a Caddy, por los puertos 80 y 443.
- Backend, MongoDB y Fabric escuchan solo dentro de la VM (127.0.0.1).
- El nginx del frontend limita los intentos de inicio de sesión por IP, añade las
  cabeceras de seguridad y bloquea las rutas de diagnóstico.

## 1. Crear la máquina virtual

En el portal de Azure: **Máquinas virtuales → Crear**.

| Campo | Valor |
|---|---|
| Imagen | Ubuntu Server 24.04 LTS (x64) |
| Tamaño | **Standard_B2ms** (2 vCPU, 8 GB). Con 4 GB (B2s) Fabric y MongoDB quedan justos |
| Autenticación | Clave pública SSH; usuario `azureuser` |
| Disco | 30 GB o más, SSD estándar |
| Puertos de entrada públicos | SSH (22) por ahora; se ajustan en el paso 2 |

Al terminar, en el recurso **Dirección IP pública** de la VM:

1. **Configuración → Asignación: Estática** (para que la IP no cambie al reiniciar).
2. **Etiqueta de nombre DNS:** por ejemplo `trazadoc-tesis`. La dirección queda como
   `trazadoc-tesis.<region>.cloudapp.azure.com`. Anótala: es tu `PUBLIC_DOMAIN`.

## 2. Abrir solo los puertos necesarios (NSG)

En la VM: **Redes → Configuración de red → Grupo de seguridad de red**. Reglas de entrada:

| Prioridad | Puerto | Origen | Para qué |
|---|---|---|---|
| 300 | 22 | **Mi dirección IP** | SSH, solo desde tu conexión |
| 310 | 80 | Cualquiera | Caddy pide el certificado y redirige a HTTPS |
| 320 | 443 | Cualquiera | La aplicación |

No abras ningún otro puerto (7050, 7051, 7054, 8080, 27017...). Si cambias de red
(otra casa, la universidad), actualiza el origen de la regla 300.

## 3. Instalar los programas en la VM

Conéctate: `ssh azureuser@trazadoc-tesis.<region>.cloudapp.azure.com`.

```bash
sudo apt-get update && sudo apt-get install -y git jq curl netcat-openbsd

# Docker (script oficial) y permiso para usarlo sin sudo
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"

# Go 1.25 (lo usa deploy-cc.sh para empaquetar el chaincode)
curl -fsSLO https://go.dev/dl/go1.25.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.25.0.linux-amd64.tar.gz && rm go1.25.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
```

**Cierra la sesión SSH y vuelve a entrar** (para que valgan el grupo `docker` y el PATH).
Comprueba:

```bash
docker run --rm hello-world && go version && jq --version && id -u
```

`id -u` debe responder `1000`. El backend corre como el usuario 1000 dentro de su
contenedor y lee la llave privada de Fabric que crean los scripts: si los scripts los
corre otro usuario o `sudo`, el backend no puede leerla y todas las operaciones del
ledger fallan con 502. **Nunca ejecutes los scripts de `docker/` con `sudo`.**

## 4. Descargar y configurar

```bash
git clone <URL-del-repositorio> Blockchain_Contratos
cd Blockchain_Contratos
cp docker/.env.example docker/.env
openssl rand -hex 32   # copia el resultado para JWT_SECRET
openssl rand -hex 24   # copia el resultado para MONGO_ROOT_PASSWORD
nano docker/.env
```

Valores que hay que cambiar en `docker/.env`:

| Variable | Valor |
|---|---|
| `JWT_SECRET` | El primer valor de `openssl` |
| `MONGO_ROOT_PASSWORD` | El segundo valor. **Antes del primer arranque**: MongoDB fija la clave al crear su volumen |
| `PUBLIC_DOMAIN` | `trazadoc-tesis.<region>.cloudapp.azure.com` (sin `https://`) |
| `SMTP_HOST` | `smtp-relay.sendinblue.com` |
| `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Los mismos de Brevo que en tu PC ([INSTALACION.md §5.1](INSTALACION.md)) |
| `SEED_EMAIL` | `contratosblockchain@gmail.com` |
| `VITE_API_URL` | Déjalo en `/api` |

Si `PUBLIC_DOMAIN` tiene valor y `JWT_SECRET` o `MONGO_ROOT_PASSWORD` siguen con el
valor de ejemplo, `up.sh` se detiene sin publicar nada.

Comprueba que la VM puede enviar correo (Azure bloquea el puerto 25, no el 587):

```bash
nc -vz smtp-relay.sendinblue.com 587   # debe decir "succeeded"
```

## 5. Levantar todo

```bash
bash docker/up.sh
```

Tarda entre 5 y 10 minutos la primera vez (descarga las imágenes de Fabric). Al final
debe listar estos contenedores en estado `Up`: `caddy`, `frontend`, `backend`, `mongo`,
`orderer.example.com`, `peer0.org1.example.com`, `peer0.org2.example.com`, `ca_org1`,
`ca_org2`, `ca_orderer` y el del chaincode.

## 6. Comprobar

1. Abre `https://trazadoc-tesis.<region>.cloudapp.azure.com`. El candado debe aparecer
   sin avisos. Si sale un error de certificado, espera un minuto: Caddy lo está pidiendo
   (`docker logs caddy` muestra el avance).
2. Inicia sesión con cada rol (usuarios en [INSTALACION.md §7](INSTALACION.md)). El
   código llega al buzón de `contratosblockchain@gmail.com`.
3. Como Empleado, sube un PDF; como Verificador, verifícalo; como Administrador, mira
   el panel y la trazabilidad.
4. Desde tu PC, comprueba que lo interno **no** responde (deben fallar por tiempo de espera):
   ```bash
   curl -m 5 http://trazadoc-tesis.<region>.cloudapp.azure.com:8080/health
   curl -m 5 http://trazadoc-tesis.<region>.cloudapp.azure.com:7054
   ```
5. En la VM, prueba de punta a punta del ledger: `bash docker/smoke-test.sh`.

## 7. Antes de mostrarlo: cambiar las contraseñas

Los usuarios sembrados usan la contraseña de ejemplo que está en el repositorio
(`Contratos123!`). Entra con cada uno y cámbiala desde el menú de usuario →
**Cambiar contraseña**. Guarda las nuevas en un lugar seguro y compártelas solo con
quien deba probar.

## 8. Operación diaria

| Qué | Comando (en la VM, desde `Blockchain_Contratos`) |
|---|---|
| Reinicio de la VM | Nada: todos los contenedores vuelven solos |
| Encender tras un apagado manual | `bash docker/start.sh` |
| Apagar sin perder datos | `bash docker/stop.sh` |
| Ver errores del backend | `docker logs --tail 100 backend` |
| Ver el certificado HTTPS | `docker logs caddy` |
| Estado de todo | `docker ps` |

Si la VM se detiene desde el portal de Azure (para ahorrar), al encenderla todo arranca
solo. La primera consulta puede tardar unos segundos mientras arranca el chaincode.

## 9. Publicar un cambio de código

```bash
docker exec mongo mongodump -u root -p "<MONGO_ROOT_PASSWORD>" --authenticationDatabase admin --archive > respaldo-$(date +%F).archive
git pull
docker compose --env-file docker/.env -f docker/compose.app.yml up -d --build backend frontend
```

Si el cambio toca el chaincode, después corre `bash docker/deploy-cc.sh`.

## 10. Reversión

**Cuándo:** el login o la carga fallan más de 5 minutos, el backend se reinicia en
bucle (`docker ps` muestra `Restarting`) o hay errores 502 continuos.

1. Vuelve a la versión anterior y reconstruye la aplicación:
   ```bash
   git log --oneline -5            # identifica el commit anterior
   git checkout <commit-anterior>
   docker compose --env-file docker/.env -f docker/compose.app.yml up -d --build backend frontend
   ```
   MongoDB y la red Fabric no se tocan: los datos se conservan. Toma unos 10 minutos.
2. Si se dañaron los datos de MongoDB, restaura el respaldo del paso 9:
   ```bash
   docker exec -i mongo mongorestore -u root -p "<MONGO_ROOT_PASSWORD>" --authenticationDatabase admin --drop --archive < respaldo-AAAA-MM-DD.archive
   ```
3. Último recurso, si la red Fabric quedó inservible: `bash docker/down.sh && bash docker/up.sh`.
   **Borra todos los datos** (ledger y MongoDB) y deja el sistema como recién instalado.

## 11. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `up.sh` dice que `JWT_SECRET` o `MONGO_ROOT_PASSWORD` siguen con el valor de ejemplo | Paso 4: genera los valores con `openssl` |
| El navegador avisa que el certificado no es válido | Caddy no pudo pedirlo: revisa que el puerto 80 esté abierto en el NSG y que `PUBLIC_DOMAIN` sea exactamente la etiqueta DNS de la IP. `docker logs caddy` |
| "La red blockchain no está disponible" en todas las pantallas | `docker logs backend`. Si dice `EACCES` sobre una llave: los scripts se corrieron con `sudo` u otro usuario (paso 3). Arreglo: `bash docker/down.sh` y `bash docker/up.sh` con `azureuser` |
| El código de verificación no llega | `nc -vz smtp-relay.sendinblue.com 587` y `docker logs backend`; revisa `SMTP_*` y que `SMTP_FROM` sea un remitente verificado en Brevo |
| "Demasiados intentos. Espera un minuto" | Límite por IP del login (10 por minuto). Espera un minuto |
| "Cuenta bloqueada" | 5 contraseñas incorrectas seguidas (RF-054): espera 15 minutos |
| MongoDB no arranca o el backend dice `Authentication failed` | Se cambió `MONGO_ROOT_PASSWORD` después del primer arranque. Vuelve a poner la clave original en `docker/.env` |
