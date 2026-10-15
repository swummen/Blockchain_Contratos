# Guía de instalación y despliegue — TrazaDoc

Esta guía lleva un computador **desde cero** hasta tener TrazaDoc funcionando: qué
programas instalar, cómo descargar el proyecto, cómo configurarlo, cómo encenderlo,
apagarlo y qué hacer si algo falla. No hace falta saber de blockchain ni de Docker:
basta con seguir los pasos en orden.

> **Resumen para quien tiene prisa** (si ya tienes todo instalado):
> ```bash
> git clone https://github.com/swummen/Blockchain_Contratos.git
> cd Blockchain_Contratos
> bash docker/up.sh
> ```
> Abre <http://localhost:5173> y entra con los usuarios de la [sección 7](#7-entrar-al-sistema).

Contenido:

1. [Qué vas a tener al final](#1-qué-vas-a-tener-al-final)
2. [Requisitos del computador](#2-requisitos-del-computador)
3. [Programas que hay que instalar](#3-programas-que-hay-que-instalar)
4. [Descargar el proyecto](#4-descargar-el-proyecto)
5. [Configurar (una sola vez)](#5-configurar-una-sola-vez)
6. [Levantar todo por primera vez](#6-levantar-todo-por-primera-vez)
7. [Entrar al sistema](#7-entrar-al-sistema)
8. [Uso diario: apagar, encender, reiniciar](#8-uso-diario-apagar-encender-reiniciar)
9. [Comprobar que todo funciona](#9-comprobar-que-todo-funciona)
10. [Problemas frecuentes y soluciones](#10-problemas-frecuentes-y-soluciones)
11. [Referencia: comandos, puertos y archivos](#11-referencia-comandos-puertos-y-archivos)
12. [Para desarrollar (opcional)](#12-para-desarrollar-opcional)

---

## 1. Qué vas a tener al final

Al terminar, en tu computador estarán corriendo **11 contenedores de Docker** (programas
aislados, como mini‑computadores):

| Parte | Qué es | Para qué sirve |
|---|---|---|
| **Aplicación web** (`frontend`) | La página que abres en el navegador | Donde trabajan Empleado, Verificador y Administrador |
| **Backend** (`backend`) | El servidor de la aplicación | Valida usuarios, calcula la huella SHA‑256 de los PDF y habla con la blockchain |
| **Base de datos** (`mongo`) | MongoDB | Guarda usuarios y datos de los documentos (nunca el PDF) |
| **Red blockchain** | Hyperledger Fabric: 1 orderer, 2 peers, 3 autoridades certificadoras y el contrato inteligente (uno por peer) | Guarda las huellas y el historial de cada documento de forma inmutable |

Todo queda en tu computador. Lo único que sale a internet es el correo con el código de
verificación (por Brevo).

## 2. Requisitos del computador

| Requisito | Mínimo | Recomendado |
|---|---|---|
| Sistema operativo | Windows 10/11 de 64 bits | Windows 11 (es donde se probó) |
| Memoria RAM | 8 GB | 16 GB |
| Espacio libre en disco | 20 GB | 30 GB |
| Procesador | Con **virtualización activada** (casi todos los actuales) | 4 núcleos o más |
| Internet | Necesario la **primera vez** (se descargan ~3‑4 GB) | — |

> **¿Cómo sé si la virtualización está activada?** Abre el Administrador de tareas →
> pestaña **Rendimiento** → **CPU**. Debe decir *Virtualización: Habilitado*. Si dice
> *Deshabilitado*, hay que activarla en la BIOS del computador (busca en internet "activar
> virtualización" + la marca de tu computador).

> **Linux o macOS:** los scripts son de Bash y deberían funcionar igual (los programas son
> los mismos), pero el proyecto solo se probó en Windows.

## 3. Programas que hay que instalar

| Programa | Para qué lo usa el proyecto | Versión | ¿Obligatorio? |
|---|---|---|---|
| **Docker Desktop** | Corre todos los contenedores | La más reciente | Sí |
| **Git** (incluye **Git Bash**) | Descarga el proyecto y ejecuta los scripts `.sh` | La más reciente | Sí |
| **Go** | Empaqueta el contrato inteligente (chaincode) al instalarlo en la red | 1.22 o superior | Sí |
| **jq** | Lo usan los scripts de Hyperledger Fabric | 1.6 o superior | Sí |
| **Node.js** | Solo para desarrollar, correr pruebas y medir la latencia | 20 LTS o superior | No (opcional) |
| **Visual Studio Code** | Editor para ver y modificar el código | — | No (opcional) |

### Opción A — instalar todo con un solo comando (recomendada)

1. Abre el menú Inicio, escribe **PowerShell**, clic derecho → **Ejecutar como
   administrador**.
2. Copia y pega esto, y presiona Enter (acepta las ventanas que aparezcan):

   ```powershell
   winget install -e --id Docker.DockerDesktop
   winget install -e --id Git.Git
   winget install -e --id GoLang.Go
   winget install -e --id jqlang.jq
   winget install -e --id OpenJS.NodeJS.LTS
   ```

   (La última línea es opcional: Node.js.)
3. **Reinicia el computador** cuando termine. Docker Desktop lo necesita.

### Opción B — instalar uno por uno desde sus páginas

| Programa | Descarga | Notas al instalar |
|---|---|---|
| Docker Desktop | <https://www.docker.com/products/docker-desktop/> | Deja marcada la opción **"Use WSL 2"**. Reinicia al terminar. |
| Git | <https://git-scm.com/download/win> | Acepta las opciones por defecto (incluye Git Bash). |
| Go | <https://go.dev/dl/> | Instalador `.msi` para Windows. |
| jq | <https://jqlang.org/download/> | Descarga `jq-windows-amd64.exe`, renómbralo a `jq.exe` y ponlo en una carpeta que esté en el PATH (más fácil: usar el comando `winget` de la opción A). |
| Node.js (opcional) | <https://nodejs.org/> | Versión **LTS**. |

### Primer arranque de Docker Desktop

1. Abre **Docker Desktop** desde el menú Inicio.
2. Acepta los términos. Si pide instalar o actualizar **WSL**, acepta (o abre PowerShell
   como administrador y ejecuta `wsl --install`, luego reinicia).
3. Puedes saltarte el inicio de sesión ("Skip").
4. Espera a que abajo a la izquierda diga **Engine running** (en verde).
5. Opcional pero recomendado: *Settings → General →* marca **"Start Docker Desktop when you
   sign in"**, para que Docker se abra solo al prender el computador.

### Comprobar que todo quedó instalado

Abre **Git Bash** (menú Inicio → "Git Bash") y ejecuta:

```bash
docker --version
docker compose version
git --version
go version
jq --version
node --version     # solo si instalaste Node.js
```

Cada uno debe responder con un número de versión. Si alguno dice *command not found*,
cierra Git Bash, vuelve a abrirlo (o reinicia el computador) y prueba otra vez.

## 4. Descargar el proyecto

> **Importante: no lo guardes dentro de OneDrive** (ni Escritorio/Documentos si están
> sincronizados con OneDrive). El proyecto descarga miles de archivos de Fabric y OneDrive
> intenta subirlos todos: se vuelve lento y puede bloquear archivos. Usa una carpeta como
> `C:\proyectos`.

En **Git Bash**:

```bash
mkdir -p /c/proyectos
cd /c/proyectos
git clone https://github.com/swummen/Blockchain_Contratos.git
cd Blockchain_Contratos
```

> **Siempre usa Git Bash** para los comandos de esta guía, **no PowerShell ni CMD**: los
> scripts `.sh` solo funcionan en Bash.
>
> Atajo: en el Explorador de archivos, entra a la carpeta del proyecto, clic derecho en un
> espacio vacío → **Open Git Bash here** (en Windows 11: *Mostrar más opciones* →
> *Open Git Bash here*).

## 5. Configurar (una sola vez)

La configuración vive en el archivo `docker/.env`. **No se sube a GitHub** (tiene
claves), así que cada persona lo crea en su computador:

```bash
cp docker/.env.example docker/.env
```

Ábrelo con cualquier editor (por ejemplo `code docker/.env` si tienes VS Code, o el Bloc
de notas). Solo hay que completar **dos cosas**; todo lo demás ya trae valores que
funcionan.

### 5.1 Correo para el código de verificación (Brevo)

Para iniciar sesión, el sistema envía un código de 6 dígitos al correo del usuario.

| Variable | Qué poner |
|---|---|
| `SMTP_HOST` | `smtp-relay.sendinblue.com` (**no** `smtp-relay.brevo.com`: desde Colombia ese falla con error de certificado) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | El **login SMTP** de Brevo (algo como `xxxx@smtp-brevo.com`; **no** es un correo real) |
| `SMTP_PASSWORD` | Tu **clave SMTP** de Brevo (cada persona del equipo tiene la suya) |
| `SMTP_FROM` | `contratosblockchain@gmail.com` (el remitente verificado en Brevo) |

**Dónde sacar el login y la clave:** en <https://app.brevo.com> → ⚙️ (arriba a la
derecha) → **SMTP & API** → pestaña **SMTP**. El login aparece ahí; la clave se crea con
**Generar nueva clave SMTP** (copiarla en ese momento: no se vuelve a mostrar). Si no
tienes acceso a la cuenta de Brevo, pídele a quien la administra que te genere una clave.

> **¿No tienes Brevo?** Deja `SMTP_HOST` vacío. El sistema funciona igual, pero el código
> no llega por correo: se ve en la consola con
> `docker logs backend 2>&1 | grep "código OTP"`.

### 5.2 Buzón para los usuarios de prueba

| Variable | Qué poner |
|---|---|
| `SEED_EMAIL` | `contratosblockchain@gmail.com` |

Con eso, el sistema crea 4 usuarios de prueba cuyos códigos llegan todos a ese buzón
(ver [sección 7](#7-entrar-al-sistema)). Si lo dejas vacío, los usuarios tendrán correos
ficticios `@empresa.com` y el código solo se verá en la consola.

## 6. Levantar todo por primera vez

1. Asegúrate de que **Docker Desktop** está abierto y dice **Engine running**.
2. En **Git Bash**, dentro de la carpeta del proyecto:

   ```bash
   bash docker/up.sh
   ```

3. Espera. **La primera vez tarda 10‑20 minutos** (descarga Fabric y construye todo);
   las siguientes, unos 2 minutos. Vas a ver estos 4 pasos:

   | Paso | Qué pasa |
   |---|---|
   | `[1/4] Red Fabric + canal contratoschannel` | Descarga Hyperledger Fabric (solo la primera vez), crea la red y el canal. |
   | `[2/4] Chaincode real del proyecto (contracts)` | Instala el contrato inteligente en la red y hace un registro de prueba. Debe terminar con `OK: el documento duplicado fue rechazado.` |
   | `[3/4] Mongo + backend + frontend` | Construye y arranca la aplicación. |
   | `[4/4] Usuarios de prueba` | Crea los 4 usuarios de prueba (`Usuario listo: ...`). |

4. Al final aparece **`==> Todo arriba:`** con la lista de contenedores. Abre
   **<http://localhost:5173>** en el navegador.

> Si `up.sh` se detiene con un error, busca el mensaje en la
> [sección 10](#10-problemas-frecuentes-y-soluciones).

## 7. Entrar al sistema

Abre <http://localhost:5173>. Contraseña de todos los usuarios de prueba: **`Contratos123!`**

| Rol | Correo para entrar | Qué puede hacer |
|---|---|---|
| Empleado (María López) | `contratosblockchain+empleado@gmail.com` | Subir su contrato, ver sus documentos y su historial |
| Empleado (Carlos Ruiz) | `contratosblockchain+empleado2@gmail.com` | Igual, con otros documentos |
| Verificador (Pedro Gómez) | `contratosblockchain+verificador@gmail.com` | Verificar si un contrato fue alterado, ver todos los documentos y el historial general |
| Administrador (Laura Diaz) | `contratosblockchain+admin@gmail.com` | Panel con totales, gestión de usuarios, documentos e historial |

Cómo se entra:

1. Escribe el correo y la contraseña → **Iniciar sesión**.
2. Llega un **código de 6 dígitos** a `contratosblockchain@gmail.com` (todos los correos
   `+algo` llegan a ese buzón). **La primera vez revisa la carpeta de spam** y márcalo como
   "No es spam". Puede tardar unos segundos.
3. Escribe el código (vence en **5 minutos**) → entras al panel de tu rol.

Reglas de seguridad que vas a notar:
- **5 intentos fallidos** de contraseña bloquean la cuenta **15 minutos**.
- **15 minutos sin actividad** cierran la sesión.
- Un usuario creado por el Administrador entra con la contraseña temporal que se muestra al
  crearlo y puede cambiarla desde el menú de usuario → *Cambiar contraseña*.

Prueba rápida del flujo completo: como **Empleado** sube un PDF → como **Verificador**
elige la persona, luego el contrato, y sube el **mismo** PDF (*Integridad confirmada*) →
repite con otro PDF (*Integridad comprometida*) → como **Empleado** mira *Mi
trazabilidad*.

## 8. Uso diario: apagar, encender, reiniciar

| Quiero… | Comando (en Git Bash, carpeta del proyecto) | ¿Se borran los datos? |
|---|---|---|
| **Apagar** al terminar el día | `bash docker/stop.sh` | **No** |
| **Encender** de nuevo (o después de reiniciar el computador) | `bash docker/start.sh` | **No** |
| **Empezar de cero** (borrar documentos, usuarios y blockchain) | `bash docker/down.sh` y luego `bash docker/up.sh` | **Sí, todo** |
| Ver si todo está corriendo | `docker ps` | No |

> **Después de reiniciar el computador:** abre Docker Desktop, espera *Engine running* y
> ejecuta `bash docker/start.sh`. (Docker enciende solo la aplicación, pero la red
> blockchain hay que encenderla con este comando.)
>
> **`down.sh` borra todo:** documentos, usuarios, la blockchain y sus certificados.
> Úsalo solo cuando quieras un entorno limpio (por ejemplo, antes de una demo).
> `up.sh` vuelve a crear los usuarios de prueba.

## 9. Comprobar que todo funciona

```bash
bash docker/smoke-test.sh
```

Debe terminar con **`Smoke test HU-021: PASS (CA-01 y CA-02)`**. Revisa que estén
arriba la red, el contrato inteligente, la base de datos, el backend y el frontend.

Otras comprobaciones rápidas (en el navegador):
- <http://localhost:8080/health> → `{"status":"ok","mongo":"connected"}`
- <http://localhost:8080/fabric/ping> → `{"status":"ok", ...}` (la blockchain responde)
- <http://localhost:5173/system-status> → estado del sistema en verde.

## 10. Problemas frecuentes y soluciones

| Mensaje o síntoma | Causa | Solución |
|---|---|---|
| `Docker no está corriendo. Arrancá Docker Desktop primero.` | Docker Desktop cerrado o iniciándose | Ábrelo y espera *Engine running*. |
| `Go no está en el PATH` o `jq no está en el PATH` | Falta instalarlo, o Git Bash se abrió antes de instalarlo | Instálalo ([sección 3](#3-programas-que-hay-que-instalar)), cierra y vuelve a abrir Git Bash. |
| `Ya hay contenedores de una corrida anterior` | Quedó una red de una ejecución anterior | `bash docker/down.sh` y luego `bash docker/up.sh`. |
| Ese mismo mensaje **después de volver a clonar el repo** (y `down.sh` dice "Nada que bajar") | La red vieja pertenece al clon anterior | Borrar los restos: ver "Después de re-clonar el repo" en [`docker/README.md`](docker/README.md#notas). |
| `bash: docker/up.sh: No such file or directory` | No estás en la carpeta del proyecto | `cd /c/proyectos/Blockchain_Contratos` |
| Errores raros al ejecutar desde PowerShell o CMD | Los scripts son de Bash | Usa **Git Bash**. |
| `$'\r': command not found` | El archivo se guardó con finales de línea de Windows | `git checkout -- docker/` para restaurar los scripts (el repo los fuerza a formato Linux). |
| `port is already allocated` / puerto ocupado | Otro programa usa el puerto (5173, 8080, 27017, 7050‑9054) | Cierra ese programa, o cambia `FRONTEND_PORT` / `BACKEND_PORT` / `MONGO_PORT` en `docker/.env`. |
| El código de verificación **no llega** | Spam, datos SMTP incorrectos, o `SMTP_HOST` vacío | Revisa spam. Revisa `docker/.env` (sección 5.1). El código siempre puede verse con `docker logs backend 2>&1 \| grep -i otp` cuando SMTP está vacío; si está configurado, el error real aparece en `docker logs backend`. |
| Al entrar: *"No se pudo enviar el código de verificación"* | Clave SMTP mal copiada o vencida (vence en 1 año **o a los 90 días sin uso**) | Generar una clave nueva en Brevo y ponerla en `docker/.env`; luego `bash docker/start.sh`. |
| Cambié `docker/.env` y no se nota | Los contenedores leen `.env` al crearse | `docker compose --env-file docker/.env -f docker/compose.app.yml up -d backend` (o `bash docker/down.sh && bash docker/up.sh`). |
| Al entrar: *"Cuenta bloqueada temporalmente"* | 5 contraseñas incorrectas seguidas | Esperar 15 minutos. |
| *"Sesión inválida o vencida"* | 15 minutos sin actividad, o el Administrador cambió tu rol | Vuelve a iniciar sesión. |
| La página no abre después de reiniciar el computador | La red blockchain no se enciende sola | `bash docker/start.sh`. |
| `configtxlator.exe` bloqueado / *Permission denied* (Windows Smart App Control) | Windows bloquea un binario sin firma de Fabric | No hay que hacer nada: `up.sh` lo detecta y usa la versión en Docker. |
| Todo muy lento, o Docker se cierra | Poca memoria para Docker | Cierra programas pesados; en Docker Desktop → *Settings → Resources*, asigna al menos 4 GB. |

Si nada de esto lo resuelve: `bash docker/down.sh && bash docker/up.sh` deja todo como
recién instalado.

## 11. Referencia: comandos, puertos y archivos

**Comandos** (en Git Bash, desde la carpeta del proyecto):

| Comando | Qué hace |
|---|---|
| `bash docker/up.sh` | Crea y levanta todo: red Fabric, contrato inteligente, base de datos, backend, frontend y usuarios de prueba |
| `bash docker/stop.sh` | Apaga todo sin borrar datos |
| `bash docker/start.sh` | Enciende todo de nuevo (sin borrar datos) |
| `bash docker/down.sh` | Borra todo (datos incluidos) |
| `bash docker/smoke-test.sh` | Comprueba que todo funciona |
| `docker ps` | Lista los contenedores corriendo |
| `docker logs backend` | Muestra los mensajes del backend (errores, códigos OTP si no hay SMTP) |

**Puertos** que usa el sistema en tu computador:

| Puerto | Servicio |
|---|---|
| 5173 | Aplicación web |
| 8080 | Backend (API) |
| 27017 | MongoDB |
| 7050, 7053, 9443 | Orderer de Fabric |
| 7051, 9444 | Peer de la Organización 1 |
| 9051, 9445 | Peer de la Organización 2 |
| 7054, 8054, 9054 (+17054, 18054, 19054) | Autoridades certificadoras |

**Archivos de configuración:**

| Archivo | Qué contiene | ¿Se sube a GitHub? |
|---|---|---|
| `docker/.env` | Puertos, claves de MongoDB y JWT, correo (Brevo), `SEED_EMAIL` | **No** (cada persona crea el suyo desde `docker/.env.example`) |
| `docker/compose.app.yml` | Definición de MongoDB, backend y frontend | Sí |
| `docker/fabric-samples/` | Hyperledger Fabric descargado por `up.sh` (versión fijada 2.5.16 / CA 1.5.22) | **No** (se descarga solo) |

**¿Dónde está la configuración del canal?** El archivo `configtx.yaml` (organizaciones,
políticas, orderer Raft) **no está en el repositorio**: viene dentro de `fabric-samples`,
que `up.sh` descarga en la versión fijada. Queda en
`docker/fabric-samples/test-network/configtx/configtx.yaml`. El proyecto lo usa sin
modificar (red de prueba oficial de Fabric con 2 organizaciones); el canal se crea con el
nombre `contratoschannel` y base de estado LevelDB. Detalle en
[`docs/Matriz_Infraestructura.xlsx`](docs/Matriz_Infraestructura.xlsx) (hoja "Red
Fabric").

Más detalle técnico de Docker y Fabric (decisiones, errores de Windows ya corregidos):
[`docker/README.md`](docker/README.md).

## 12. Para desarrollar (opcional)

Solo si vas a modificar el código. Requiere **Node.js 20+**.

| Qué | Comandos (desde la carpeta indicada) |
|---|---|
| Backend: instalar y probar | `cd backend` → `npm install` → `npm test` (141 pruebas) → `npm run lint` → `npm run build` |
| Backend fuera de Docker | `cp backend/.env.example backend/.env`, cambiar `MONGO_URI` a `localhost` (ver comentarios del archivo) → `npm run dev` |
| Frontend: instalar y probar | `cd frontend` → `npm install` → `npm run build` → `npm run lint` |
| Frontend en modo desarrollo | `npm run dev` (abre en <http://localhost:5173>; detén antes el contenedor `frontend` con `docker stop frontend`) |
| Chaincode (Go) | `cd chaincode` → `go test ./...` (34 pruebas) → `go vet ./...` |
| Aplicar cambios del backend o frontend al sistema en Docker | `docker compose --env-file docker/.env -f docker/compose.app.yml up -d --build backend frontend` |
| Medir la latencia de verificación (KPI) | Ver [`tests/perf/README.md`](tests/perf/README.md) |
| Documentación de la API | [`docs/api/`](docs/api/README.md) (OpenAPI, importable en Postman) |

Las decisiones de diseño, requisitos y planes de cada sprint están en
[`claude_docs/SPEC.md`](claude_docs/SPEC.md) y [`claude_docs/tasks/`](claude_docs/tasks/).
