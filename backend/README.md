# backend/

Gateway Node.js + Express hacia MongoDB y Hyperledger Fabric (ver `claude_docs/SPEC.md`
para el diseño completo — este archivo es un resumen práctico, no la fuente de verdad).

## Qué hay hoy (T4 — walking skeleton)

Sin lógica de negocio todavía. Solo fija convenciones y prueba que el contenedor prende y
conecta a Mongo:

- Express + TypeScript, compilado con `tsc` (CommonJS, no ESM — evita fricción con Jest).
- `GET /health` — hace un `ping` real a Mongo en cada request (no un flag cacheado de
  "conectado"), responde `200 {status:"ok", mongo:"connected"}` o `503 {status:"error",
  mongo:"down"}`. Usalo como plantilla para cualquier otro endpoint de estado.
- Estructura por capas (`claude_docs/SPEC.md` §7): `routes/ → controllers/ → services/ →
  repositories|fabric/`. Hoy solo existen `routes/`, `repositories/`, `config/`;
  `services/` y `fabric/` están vacías con `.gitkeep` — `controllers/` ni existe todavía.
  Créenlas cuando agreguen la primera lógica real.
- Testing: **Jest** (no Vitest — así lo fija `SPEC.md` §8) + `supertest`. `src/server.ts`
  separa `createApp()` de `main()` (guardado con `if (require.main === module)`)
  justamente para poder testear con `supertest` sin levantar un listener real ni
  necesitar Mongo — ver `tests/health.test.ts` para el patrón (mockea
  `repositories/mongoClient`).
- Lint: **oxlint**, el mismo que ya usa `frontend/`. No se agregó ESLint.
- `Dockerfile` multi-stage, corre como usuario no-root (`node`, uid 1000 — ya viene en
  `node:20-alpine`). Node 20 LTS fijo en el contenedor aunque el host tenga otra versión.
- Ya está enchufado a `docker/compose.app.yml` (servicio `backend`, `depends_on: mongo:
  condition: service_healthy`, en la red `fabric_test`).

Comandos (correr dentro de `backend/`): `npm run dev`, `npm run build`, `npm test`,
`npm run lint`. Detalle completo en `claude_docs/SPEC.md` §5.

## Qué sigue (conectar el backend real a Fabric)

Esto es lo que en el plan original se llamaba T5 — cablear el SDK de Fabric Gateway al
backend. Es la parte de mayor riesgo técnico de todo el proyecto (integración
backend↔blockchain desde un contenedor en Windows), así que va acá lo que ya sabemos para
que no haya que redescubrirlo:

- **Nunca `localhost`, siempre nombres DNS de contenedor.** El `backend` corre en la
  misma red Docker (`fabric_test`) que los nodos de Fabric, así que los alcanza por
  nombre de servicio: `peer0.org1.example.com:7051`, `peer0.org2.example.com:9051`,
  `orderer.example.com:7050`. `localhost` desde dentro del contenedor del backend es el
  contenedor mismo, no el host.
- **TLS siempre activo** (`grpcs://`) — nunca desactivarlo, ni para debug.
- **El paquete es `@hyperledger/fabric-gateway`** (el SDK moderno basado en gRPC, no el
  `fabric-network` viejo basado en `Channel`/`Contract`). Necesita una `Identity` +
  `Signer` construidos a partir de un certificado y una llave privada.
- **Dónde vive esa identidad:** en `docker/fabric-samples/test-network/organizations/`,
  generado por `docker/network-up.sh`. Para Org1, por ejemplo:
  - Certificado + llave del admin: `organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/`
  - Certificado TLS del peer (para verificar la conexión): `organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt`

  Ese directorio **no se versiona** y se regenera entero en cada `network-up.sh` — ninguna
  identidad sobrevive a un ciclo `network-down.sh` → `network-up.sh`. El backend va a
  necesitar ese directorio montado como volumen en `docker/compose.app.yml` (hoy no lo
  está) para poder leer la identidad en tiempo de ejecución.
- **Para probar la conexión sin esperar al chaincode real:** ya hay un chaincode de
  ejemplo desplegado y funcional en el canal `contratoschannel` (`basic`,
  `asset-transfer-basic`, desplegado por `docker/deploy-sample-cc.sh`). Sirve para
  validar que el SDK realmente conecta y puede invocar/consultar antes de que exista el
  contrato real (Sprint 2, RF‑16/22/35/40/51 en `claude_docs/SPEC.md`).
- **Dos bugs de Windows + Git Bash** ya aparecieron y están resueltos en los scripts de
  `docker/` (reescritura de rutas por MSYS) — si al scriptear algo similar ven errores
  raros de rutas tipo `C:\Program Files\Git\...` donde no debería haber una ruta de
  Windows, es ese problema. Detalle completo en `docker/README.md`.

## Referencias

- `claude_docs/SPEC.md` — arquitectura, modelo de dominio, límites (Always/Ask
  first/Never), es la fuente de verdad para cualquier duda de diseño.
- `claude_docs/tasks/todo.md` — plan de tareas del sprint de infraestructura (T1-T8) y su
  estado actual.
- `docker/README.md` — cómo levantar la red Fabric y Mongo, puertos, prerrequisitos.
