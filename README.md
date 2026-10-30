# TrazaDoc: integridad y trazabilidad de contratos laborales con blockchain

TrazaDoc es un sistema web que permite comprobar si un contrato laboral en PDF fue modificado después de registrarse. Al cargar un contrato, el sistema calcula su **huella digital SHA-256** y la guarda en una red **blockchain permisionada (Hyperledger Fabric)**, donde nadie puede cambiarla. Más adelante, un verificador compara cualquier copia del contrato contra esa huella: si se alteró algo, aunque sea un solo carácter o los metadatos del archivo, el sistema lo detecta. Cada carga y cada verificación quedan en un historial con su usuario, su fecha y su identificador de transacción.

**El PDF nunca se guarda**, ni en la blockchain ni en la base de datos: solo su huella y unos datos mínimos. Así se protegen los datos personales del trabajador, como exige la Ley 1581 de 2012.

Trabajo de grado de Laura Sofia Diaz Suarez y Sofia Ortiz Daza, programa de Ingeniería de Sistemas y Computación, Universidad Católica de Colombia, 2026.

## Contenido

- [Resultados](#resultados)
- [Cómo funciona](#cómo-funciona)
- [Instalación rápida](#instalación-rápida)
- [Usuarios de prueba](#usuarios-de-prueba)
- [Uso diario](#uso-diario)
- [Qué puede hacer cada rol](#qué-puede-hacer-cada-rol)
- [Arquitectura](#arquitectura)
- [Seguridad](#seguridad)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Pruebas](#pruebas)
- [Documentación](#documentación)

## Resultados

El sistema se evaluó con un plan de pruebas de 62 casos, ejecutado sobre un despliegue en Microsoft Azure con HTTPS.

| Indicador | Meta | Resultado |
|---|---|---|
| Detección de alteraciones en 20 documentos de prueba | 100 % | **100 %** (20 de 20), sin falsos positivos |
| Casos de prueba funcionales aprobados | ≥ 90 % | **100 %** (51 de 51) |
| Tiempo de verificación, percentil 95 | ≤ 3.000 ms | **2.059 ms** en local y 2.125 ms en Azure |
| Requerimientos cumplidos | | 82 de 85 (los 55 funcionales y 27 de 30 no funcionales) |

Los 20 documentos de prueba son 12 contratos laborales y 8 acuerdos de confidencialidad con datos ficticios. Cada uno tiene una copia alterada en el texto, la firma, los metadatos, un solo carácter o con una página agregada. Los informes completos están en [`docs/evidencias/`](docs/evidencias/) y en [`docs/Objetivo 4/`](docs/Objetivo%204/).

## Cómo funciona

- **Registrar:** el Empleado carga su contrato en PDF. El backend calcula la huella SHA-256 y la registra en la blockchain, firmada por las dos organizaciones de la red. El documento queda en estado *Pendiente*.
- **Verificar:** el Verificador elige el contrato y carga la copia que quiere comprobar. El backend calcula la huella de esa copia y la compara con la registrada: si coinciden, el resultado es *Integridad confirmada* (estado *Verificado*); si no, *Integridad comprometida* (estado *Alterado*). El resultado también queda en la blockchain.
- **Consultar:** cualquier rol puede ver el historial de acciones de los documentos a los que tiene acceso, con el identificador de cada transacción.

El sistema dice **si** un documento cambió, pero no **qué** cambió, y no reemplaza la firma electrónica: genera evidencia de integridad, como la que reconoce la Ley 527 de 1999.

## Instalación rápida

La guía completa, con capturas y solución de problemas, está en [`INSTALACION.md`](INSTALACION.md) y en la [Guía de instalación en Word](docs/Objetivo%204/Guia%20de%20Instalacion%20-%20TrazaDoc.docx). Necesita Windows 10 u 11, 8 GB de RAM (16 GB recomendados) y 20 GB libres.

Primero se instalan los programas, una sola vez, en **PowerShell como administrador**. Al terminar hay que reiniciar el computador:

```powershell
winget install -e --id Docker.DockerDesktop
winget install -e --id Git.Git
winget install -e --id GoLang.Go
winget install -e --id jqlang.jq
```

Después se descarga y configura el proyecto en **Git Bash**, en una carpeta que no esté dentro de OneDrive:

```bash
mkdir -p /c/proyectos && cd /c/proyectos
git clone https://github.com/swummen/Blockchain_Contratos.git
cd Blockchain_Contratos
cp docker/.env.example docker/.env
```

En `docker/.env` se completan los datos del correo que envía el código de verificación (Brevo) y `SEED_EMAIL`, el buzón de los usuarios de prueba ([INSTALACION.md, sección 5](INSTALACION.md#5-configurar-una-sola-vez)). Si se deja `SMTP_HOST` vacío, el código se lee en la consola con `docker logs backend`.

Por último, con Docker Desktop abierto:

```bash
bash docker/up.sh
```

La primera vez tarda entre 10 y 20 minutos; las siguientes, unos 2. Cuando aparezca **`Todo arriba`**, el sistema está en <http://localhost:5173>.

## Usuarios de prueba

`up.sh` crea un usuario por rol (y un segundo empleado). La contraseña de todos es **`Contratos123!`** y el código de verificación llega al buzón de `SEED_EMAIL` (la primera vez puede llegar a spam). Con `SEED_EMAIL=contratosblockchain@gmail.com`:

| Rol | Nombre | Correo |
|---|---|---|
| Empleado | María López | `contratosblockchain+empleado@gmail.com` |
| Empleado | Carlos Ruiz | `contratosblockchain+empleado2@gmail.com` |
| Verificador | Pedro Gómez | `contratosblockchain+verificador@gmail.com` |
| Administrador | Laura Diaz | `contratosblockchain+admin@gmail.com` |

En el primer ingreso cada usuario debe aceptar la política de tratamiento de datos.

## Uso diario

Comandos en Git Bash, desde la carpeta del proyecto:

| Para | Comando | ¿Se pierden datos? |
|---|---|---|
| Encender por primera vez o desde cero | `bash docker/up.sh` | No |
| Apagar | `bash docker/stop.sh` | No |
| Encender de nuevo | `bash docker/start.sh` | No |
| Comprobar que todo funciona | `bash docker/smoke-test.sh` | No |
| Borrar todo y empezar limpio | `bash docker/down.sh` y luego `bash docker/up.sh` | Sí |

Después de reiniciar el computador basta con abrir Docker Desktop: los contenedores arrancan solos. Si algo falla, ver [INSTALACION.md, sección 10](INSTALACION.md#10-problemas-frecuentes-y-soluciones).

## Qué puede hacer cada rol

| Rol | Funciones |
|---|---|
| **Empleado** | Cargar contratos en PDF (hasta 20 MB), ver sus documentos con su estado (*Pendiente*, *Verificado* o *Alterado*) y el historial de cada uno |
| **Verificador** | Elegir un contrato (primero la persona y luego el contrato), cargar la copia a comparar y ver el resultado; consultar todos los documentos y el historial general. Es el único rol que ve la huella completa |
| **Administrador** | Ver el panel con los totales por estado, crear, editar y desactivar usuarios, y consultar todos los documentos y el historial |

El uso detallado de cada pantalla está en el [Manual de Usuario y Operación](docs/Objetivo%204/Manual_Usuario_Operacion_TrazaDoc.docx).

## Arquitectura

```
Navegador ──> Frontend (React, servido por nginx) ──/api──> Backend (Node.js + Express)
                                                              │                  │
                                                           MongoDB        Hyperledger Fabric
                                                (usuarios y datos     (contrato inteligente en Go:
                                                 mínimos, nunca PDF)   huellas, estados e historial)
```

- El frontend **solo** habla con el backend; nunca con la blockchain ni con la base de datos.
- Al registrar o verificar, el backend escribe **primero en la blockchain** y después en MongoDB, para que la base de datos nunca tenga un documento sin su evidencia en el ledger.
- La red Fabric tiene 2 organizaciones (un peer cada una), 1 orderer con consenso Raft, 3 autoridades certificadoras y el canal `contratoschannel`. La política de endoso exige la firma de ambas organizaciones.
- El contrato inteligente (`contracts`) está escrito solo en Go y tiene 5 funciones: `RegisterDocument`, `GetDocument`, `RecordVerification`, `GetDocumentEvents` y `GetAllEvents`.
- Todo corre en contenedores Docker. En un servidor, `caddy` agrega HTTPS con un certificado de Let's Encrypt ([`DESPLIEGUE-AZURE.md`](DESPLIEGUE-AZURE.md)).

Las diferencias entre el diseño inicial y lo implementado, con su motivo, están en el [registro de cambios](docs/Objetivo%203/registro-cambios-diseno.md).

## Seguridad

- Inicio de sesión con contraseña y un **código de 6 dígitos enviado al correo**, que vence en 5 minutos.
- Acceso por rol: cada usuario solo ve las pantallas y los datos de su rol.
- Bloqueo de la cuenta por 15 minutos después de 5 contraseñas incorrectas, y registro de cada intento fallido (sin la contraseña), que se borra a los 90 días.
- Cierre de la sesión tras 15 minutos sin actividad.
- Aceptación obligatoria de la política de tratamiento de datos antes de usar el sistema.
- Contraseñas guardadas como huella con sal (bcrypt).
- En el servidor: HTTPS, cabeceras de seguridad, límite de intentos de inicio de sesión por IP y puertos internos cerrados.

## Estructura del repositorio

| Carpeta o archivo | Contenido |
|---|---|
| [`frontend/`](frontend/README.md) | Aplicación web (React 19, Vite y Tailwind), una sección por rol |
| [`backend/`](backend/README.md) | API REST (Node.js, Express y TypeScript) que conecta la aplicación con MongoDB y Fabric |
| [`chaincode/`](chaincode/README.md) | Contrato inteligente en Go |
| [`docker/`](docker/README.md) | Scripts para levantar la red Fabric, la base de datos y la aplicación |
| [`tests/e2e/`](tests/e2e/e2e.sh) | Prueba de punta a punta de la API: 47 casos de los tres roles |
| [`tests/integrity/`](tests/integrity/README.md) | Prueba de detección de alteraciones con los 20 documentos |
| [`tests/perf/`](tests/perf/README.md) | Medición del tiempo de verificación |
| [`docs/`](docs/README.md) | Entregables del trabajo de grado, organizados por objetivo |
| [`INSTALACION.md`](INSTALACION.md) | Guía técnica de instalación, uso y solución de problemas |
| [`DESPLIEGUE-AZURE.md`](DESPLIEGUE-AZURE.md) | Publicación en una máquina virtual de Azure con HTTPS |
| [`claude_docs/`](claude_docs/SPEC.md) | Especificación técnica (`SPEC.md`) y planes de cada sprint |

## Pruebas

| Qué se prueba | Comando | Resultado esperado |
|---|---|---|
| Sistema completo encendido | `bash docker/smoke-test.sh` | `PASS` |
| Backend | `cd backend && npm install && npm test` | 163 pruebas aprobadas |
| Contrato inteligente | `cd chaincode && go test ./...` | 34 pruebas aprobadas |
| Frontend | `cd frontend && npm install && npm run build && npm run lint` | Sin errores |
| API de punta a punta | `bash tests/e2e/e2e.sh` (con `SMTP_HOST` vacío) | 47 casos aprobados |
| Detección de alteraciones | ver [`tests/integrity/README.md`](tests/integrity/README.md) | 20 de 20 detectadas |
| Tiempo de verificación | ver [`tests/perf/README.md`](tests/perf/README.md) | Percentil 95 ≤ 3.000 ms |

Las pruebas del backend, el frontend y las de `tests/` necesitan **Node.js 22 o superior** (`winget install -e --id OpenJS.NodeJS.LTS`).

## Documentación

El índice completo está en [`docs/README.md`](docs/README.md). Los documentos principales:

| Documento | Dónde |
|---|---|
| Requerimientos (SRS), backlog, matriz normativa y benchmarking | [`docs/Objetivo 1/`](docs/Objetivo%201/) |
| Arquitectura: matrices ASR e infraestructura, UML, wireframes y prototipo | [`docs/Objetivo 2/`](docs/Objetivo%202/) |
| Registro de sprints, cambios respecto al diseño y matriz HU, RF y código | [`docs/Objetivo 3/`](docs/Objetivo%203/) |
| Plan de pruebas, resultados, matriz de cumplimiento y manuales | [`docs/Objetivo 4/`](docs/Objetivo%204/) |
| API (OpenAPI, importable en Postman) | [`docs/api/`](docs/api/README.md) |
| Evidencias de las pruebas | [`docs/evidencias/`](docs/evidencias/) |
| Especificación técnica y decisiones | [`claude_docs/SPEC.md`](claude_docs/SPEC.md) |
