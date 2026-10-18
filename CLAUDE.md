# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Sprints 0–4 are closed: `infra`, `identity`, `documents`+`ledger`, `verification` and
`administration` are all real end to end, every screen of the 3 roles talks to the real
backend (no mocks left in `frontend/`). The OTP is sent through an external SMTP
provider (Brevo, `SMTP_*` in `docker/.env`). What is still missing, in priority order,
lives in `claude_docs/tasks/plan-trabajo-pendiente.md` (SPEC sync to 55 RF / 24 HU,
RF‑055 data-policy acceptance, Phase 4 / OE4 benchmarks and test plan, deliverables).

Source of truth for scope/design/planning is **`claude_docs/SPEC.md`**: it
consolidates every `docs/md/*` doc (53 RF, 30 RNF, 21 HU, 42 Gherkin scenarios,
the capability map of 5 modules, the SDLC/DoD/KPI section). Read it before writing
any plan; each plan and PR traces to a module id and to RF/RNF/HU there.

## Intended architecture

The project is a blockchain-backed contract management system ("Contratos") built on Hyperledger Fabric. Planned components, one per top-level directory:

- **`chaincode/`**: Smart contracts in Go, running as Hyperledger Fabric chaincode. This holds the on-chain contract logic and world-state data model.
- **`backend/`**: Node.js service. Expected to be the gateway between the frontend and the Fabric network (via the Fabric SDK), exposing a REST/API layer and handling identity/wallet management.
- **`frontend/`**: React single-page app. User-facing UI for creating and tracking contracts; talks only to `backend/`, never directly to the chain.
- **`docker/`**: Docker Compose files and infrastructure config to stand up the local Fabric network (orderer, peers, CAs) plus backend/frontend containers.
- **`docs/`**: Project documentation in Spanish: SRS, requirement/user-story
  matrices, thesis, Hyperledger-Docker guide. Sources are `.docx`/`.xlsx`/`.pdf`;
  read the pre-converted `docs/md/<same name>.md` instead (see NORMAS).
- **`claude_docs/`**: Local mirror of the Hyperledger Fabric docs (ops guides +
  the three "build the network / deploy chaincode" tutorials), converted to
  markdown. Reference material for `chaincode/` and `docker/` work: Grep it
  instead of fetching fabric.readthedocs.io.

Data/control flow when built: `frontend (React)` → `backend (Node + Fabric SDK)` → `Fabric network` → `chaincode (Go)`.

### frontend/

Vite + React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`, no config
file), shadcn/ui (`style: radix-nova`, base color neutral) with Radix + lucide
icons. Linter is **oxlint**, not ESLint. Path alias `@/` → `src/`. UI primitives
live in `src/components/ui/`; `cn()` helper in `src/lib/utils.ts`. No test runner
configured.

## Conventions

- Project working language is **Spanish** (directory docs, commit messages, requirements). Match it in docs and user-facing strings; code identifiers may be English.
- `.gitignore` is Node-oriented and already ignores `.env` / `.env.*` (except `.env.example`) and `node_modules/`. Add `.env.example` files when introducing configuration.

## Commands

`frontend/` (run from that directory):

| | |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` typecheck + `vite build` |
| `npm run lint` | oxlint |
| `npm run preview` | serve the production build |

`backend/` (run from that directory):

| | |
|---|---|
| `npm run dev` | dev server (`tsx watch`) |
| `npm run build` | `tsc -p tsconfig.json` |
| `npm start` | run the build (`dist/server.js`) |
| `npm run seed` | seed dev users from the host (`identity`, one per role; `SEED_EMAIL` in `backend/.env`). Not needed with Docker: `docker/up.sh` already seeds inside the `backend` container |
| `npm test` | Jest (`npx jest <file>` for a single test) |
| `npm run lint` | oxlint (same linter as `frontend/`, not ESLint) |

`docker/` (run from repo root): user-facing install guide: `INSTALACION.md`; see `docker/README.md` for the full list, ports, and
env-file gotcha:

| | |
|---|---|
| `bash docker/up.sh` | whole stack in one shot (T7): Fabric network + real project chaincode (`contracts`) + Mongo/backend/frontend + seed users |
| `bash docker/stop.sh` / `bash docker/start.sh` | stop / start every project container without losing data (start = after a PC reboot) |
| `bash docker/down.sh` | inverse of `up.sh`: tear down everything, volumes included |
| `bash docker/network-up.sh` | Fabric network + `contratoschannel` channel only |
| `bash docker/network-down.sh` | tear down the Fabric network only |
| `bash docker/deploy-cc.sh` | deploy the real project chaincode (`chaincode/`, `contracts`), package/install/approve/commit + an end-to-end invoke smoke test |
| `docker compose --env-file docker/.env -f docker/compose.app.yml up -d mongo backend frontend` | Mongo + backend + frontend |

`chaincode/` (Sprint 2, `ledger` module, real since T1): `go build ./...`,
`go test ./...`, `go vet ./...`, see `chaincode/README.md`.

## NORMAS QUE LE PUSE 

**Idioma:** identificadores y código en inglés; documentación, textos del jugador y
comunicación con el usuario en español.

**Al final de cada implementación** Mencionar al inicio mi nombre "Sofia"

**Leer un documento fuente:** usar la conversión ya hecha en `docs/md/<mismo nombre>.md`, 
se lee con Read y se busca con Grep, que es lo que hace viable citar un RF sin releer el
documento entero. Aplica igual a `.xlsx` y `.pdf`. Regenerarla solo si el fuente cambió:

```bash
PYTHONIOENCODING=utf-8 markitdown "docs/<archivo>.docx" > "docs/md/<archivo>.md"
```

**Nunca** abrir un `.docx`/`.xlsx`/`.pdf` con Read ni descomprimiendo el zip. markitdown ya está en el `PATH`;
sin `PYTHONIOENCODING=utf-8` los acentos salen como mojibake. El shell por defecto de este
proyecto es PowerShell, donde ese prefijo no es sintaxis válida: correrlo con la herramienta
Bash, o `$env:PYTHONIOENCODING='utf-8'` antes de invocar markitdown.

`claude_docs/SPEC.md` es la fuente de verdad para cualquier duda de alcance o diseño; este
archivo no la repite. Si algo del código contradice a `claude_docs/SPEC.md`, gana
`claude_docs/SPEC.md` o se corrige el documento explícitamente (con nota de cambio).

**Planes de desarrollo:** viven en `claude_docs/tasks/` (`plan.md` + `todo.md`), no en la
raíz. `/plan` los escribe ahí; a `/build` (y cualquier herramienta que asuma `tasks/todo.md`
por defecto) hay que pasarle la ruta `claude_docs/tasks/todo.md`.


**Mensajes de commit** No hacer commit automaticamente, unicamente dejar el mensaje