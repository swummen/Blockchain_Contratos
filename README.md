# TrazaDoc: Verificación de integridad de contratos laborales con blockchain

TrazaDoc guarda la **huella digital (SHA‑256)** de cada contrato laboral en PDF en una
blockchain permisionada (**Hyperledger Fabric**). Después, cualquier Verificador puede
comprobar si un contrato **fue alterado**, aunque sea en una sola letra, y consultar el
**historial completo**: quién registró o verificó cada documento, cuándo y con qué
identificador de transacción.

**El PDF nunca se guarda**, ni en la blockchain ni en la base de datos: solo su huella.

Trabajo de grado: Laura Sofia Diaz Suarez · Sofia Ortiz Daza, Universidad Católica de
Colombia.

---

## 🚀 Cómo ponerlo a funcionar

> **Guía completa paso a paso: [INSTALACION.md](INSTALACION.md)**, qué programas
> instalar, cómo configurarlo, encenderlo, apagarlo y qué hacer si algo falla.

**1. Instala los programas** (una sola vez, en PowerShell como administrador, y luego
reinicia el computador):

```powershell
winget install -e --id Docker.DockerDesktop
winget install -e --id Git.Git
winget install -e --id GoLang.Go
winget install -e --id jqlang.jq
```

**2. Descarga y configura** (en **Git Bash**, fuera de OneDrive):

```bash
cd /c/proyectos
git clone https://github.com/swummen/Blockchain_Contratos.git
cd Blockchain_Contratos
cp docker/.env.example docker/.env     # completar el correo (Brevo) y SEED_EMAIL, ver INSTALACION.md §5
```

**3. Enciende todo** (con Docker Desktop abierto):

```bash
bash docker/up.sh
```

La primera vez tarda 10‑20 minutos; las siguientes, unos 2. Cuando diga
**`Todo arriba`**, abre **<http://localhost:5173>**.

### Usuarios de prueba

Contraseña de todos: **`Contratos123!`** · El código de verificación llega a
`contratosblockchain@gmail.com` (revisa spam la primera vez).

| Rol | Correo |
|---|---|
| Empleado | `contratosblockchain+empleado@gmail.com` |
| Verificador | `contratosblockchain+verificador@gmail.com` |
| Administrador | `contratosblockchain+admin@gmail.com` |

### Comandos del día a día (en Git Bash, carpeta del proyecto)

| Quiero… | Comando |
|---|---|
| Encender por primera vez / desde cero | `bash docker/up.sh` |
| Apagar sin perder datos | `bash docker/stop.sh` |
| Encender de nuevo (o tras reiniciar el PC) | `bash docker/start.sh` |
| Borrar todo y empezar limpio | `bash docker/down.sh` y luego `bash docker/up.sh` |
| Comprobar que todo funciona | `bash docker/smoke-test.sh` |

¿Algo falló? → [INSTALACION.md §10, Problemas frecuentes](INSTALACION.md#10-problemas-frecuentes-y-soluciones).

---

## Qué hace cada rol

| Rol | Puede |
|---|---|
| **Empleado** | Subir su contrato en PDF (máx. 20 MB), ver sus documentos con su estado (*Pendiente, Verificado, Alterado*) y su historial. |
| **Verificador** | Elegir un contrato (primero la persona, luego el contrato), subir el PDF a comparar y obtener *Integridad confirmada* o *comprometida*; ver todos los documentos y el historial general. Es el único que ve la huella completa. |
| **Administrador** | Panel con totales por estado, gestión de usuarios (crear, editar, desactivar), consulta de documentos y del historial. |

Seguridad: contraseña + **código de 6 dígitos por correo** (enviado por Brevo), acceso por
rol, bloqueo de 15 minutos tras 5 intentos fallidos y cierre de sesión tras 15 minutos de
inactividad.

## Cómo funciona por dentro

```
 Navegador ──> Aplicación web (React) ──HTTP──> Backend (Node.js + Express)
                                                   │                    │
                                              MongoDB            Hyperledger Fabric
                                    (usuarios, nombres,      (contrato inteligente en Go:
                                     fechas; nunca el PDF)    huellas, estados e historial)
```

- La aplicación web **solo** habla con el backend; nunca directamente con la blockchain
  ni con la base de datos.
- Al registrar o verificar, el backend escribe **primero en la blockchain** y después en
  MongoDB.
- Red Fabric: 2 organizaciones (un peer cada una, ambas firman cada transacción), 1
  orderer (Raft), 3 autoridades certificadoras, canal `contratoschannel`.
- El contrato inteligente (`contracts`) está escrito **solo en Go**.
- Todo corre en contenedores Docker en tu computador.

## Estructura del proyecto

| Carpeta / archivo | Qué hay |
|---|---|
| [`INSTALACION.md`](INSTALACION.md) | Guía completa de instalación, uso y solución de problemas |
| [`frontend/`](frontend/) | Aplicación web (React 19 + Vite + Tailwind), una sección por rol |
| [`backend/`](backend/README.md) | API REST (Node.js + Express + TypeScript) |
| [`chaincode/`](chaincode/README.md) | Contrato inteligente en Go (5 funciones) |
| [`docker/`](docker/README.md) | Scripts para levantar la red Fabric y la aplicación |
| [`tests/perf/`](tests/perf/README.md) | Medición de latencia de la verificación (KPI) |
| [`docs/`](docs/) | Documentación del trabajo de grado: requisitos, matrices, UML, API, evidencias |
| [`claude_docs/`](claude_docs/SPEC.md) | Especificación técnica (`SPEC.md`) y planes de cada sprint |

## Pruebas

| Qué | Comando | Resultado esperado |
|---|---|---|
| Todo el sistema | `bash docker/smoke-test.sh` | `PASS` |
| Backend | `cd backend && npm install && npm test` | 141 pruebas en verde |
| Contrato inteligente | `cd chaincode && go test ./...` | 34 pruebas en verde |
| Frontend | `cd frontend && npm install && npm run build && npm run lint` | sin errores |
| Latencia de verificación | ver [`tests/perf/README.md`](tests/perf/README.md) | P95 ≤ 3000 ms |

(Las pruebas de backend, frontend y latencia requieren **Node.js 20+**:
`winget install -e --id OpenJS.NodeJS.LTS`.)

## Documentación

| Documento | Dónde |
|---|---|
| Instalación y uso | [`INSTALACION.md`](INSTALACION.md) |
| API (OpenAPI / Swagger, importable en Postman) | [`docs/api/`](docs/api/README.md) |
| Diagramas UML y cambios respecto al diseño | [`docs/uml/`](docs/uml/README.md) |
| Matriz de infraestructura | [`docs/Matriz_Infraestructura.xlsx`](docs/Matriz_Infraestructura.xlsx) |
| Matriz de trazabilidad HU ↔ RF ↔ código | [`docs/Matriz_Trazabilidad_HU_RF_Codigo.xlsx`](docs/Matriz_Trazabilidad_HU_RF_Codigo.xlsx) |
| Registro de sprints | [`docs/registro-sprints.md`](docs/registro-sprints.md) |
| Evidencia de integración con Fabric | [`docs/evidencias/integracion-fabric.md`](docs/evidencias/integracion-fabric.md) |
| Requisitos, decisiones y alcance | [`claude_docs/SPEC.md`](claude_docs/SPEC.md) |
| Lo que falta del MVP | [`claude_docs/tasks/plan-trabajo-pendiente.md`](claude_docs/tasks/plan-trabajo-pendiente.md) |
