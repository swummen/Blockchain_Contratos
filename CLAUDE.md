# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This repository is a **scaffold only**. Every directory currently contains just a placeholder `README.md`; there is no source code, no `package.json`, no `go.mod`, and no build/test tooling yet. When adding code, you are establishing the conventions — there is no existing pattern to match.

## Intended architecture

The project is a blockchain-backed contract management system ("Contratos") built on Hyperledger Fabric. Planned components, one per top-level directory:

- **`chaincode/`** — Smart contracts in Go, running as Hyperledger Fabric chaincode. This holds the on-chain contract logic and world-state data model.
- **`backend/`** — Node.js service. Expected to be the gateway between the frontend and the Fabric network (via the Fabric SDK), exposing a REST/API layer and handling identity/wallet management.
- **`frontend/`** — React single-page app. User-facing UI for creating and tracking contracts; talks only to `backend/`, never directly to the chain.
- **`docker/`** — Docker Compose files and infrastructure config to stand up the local Fabric network (orderer, peers, CAs) plus backend/frontend containers.
- **`docs/`** — Project documentation in Spanish: SRS, meeting minutes (actas), Hyperledger guide, functional requirements (RF), non-functional requirements (RNF), annexes.

Data/control flow when built: `frontend (React)` → `backend (Node + Fabric SDK)` → `Fabric network` → `chaincode (Go)`.

## Conventions

- Project working language is **Spanish** (directory docs, commit messages, requirements). Match it in docs and user-facing strings; code identifiers may be English.
- `.gitignore` is Node-oriented and already ignores `.env` / `.env.*` (except `.env.example`) and `node_modules/`. Add `.env.example` files when introducing configuration.

## Commands

None defined yet. When scaffolding a component, add its build/lint/test commands to this section (e.g. `backend/` and `frontend/` npm scripts, `chaincode/` `go test ./...`, `docker/` compose up).

## NORMAS QUE LE PUSE 

**Idioma:** identificadores y código en inglés; documentación, textos del jugador y
comunicación con el usuario en español.

**Al final de cada implementación** Mencionar al inicio mi nombre "Sofia"

**Leer un documento fuente:** usar la conversión ya hecha en `docs/md/<mismo nombre>.md` —
se lee con Read y se busca con Grep, que es lo que hace viable citar un RF sin releer el
documento entero. Regenerarla solo si el `.docx` cambió:

```bash
PYTHONIOENCODING=utf-8 markitdown "docs/<archivo>.docx" > "docs/md/<archivo>.md"
```

**Nunca** abrir un `.docx` con Read ni descomprimiendo el zip. markitdown ya está en el `PATH`;
sin `PYTHONIOENCODING=utf-8` los acentos salen como mojibake. El shell por defecto de este
proyecto es PowerShell, donde ese prefijo no es sintaxis válida: correrlo con la herramienta
Bash, o `$env:PYTHONIOENCODING='utf-8'` antes de invocar markitdown.

`SPEC.md` es la fuente de verdad para cualquier duda de alcance o diseño; este archivo no la
repite. Si algo del código contradice a `SPEC.md`, gana `SPEC.md` o se corrige el documento
explícitamente.


**Mensajes de commit** No hacer commit automaticamente, unicamente dejar el mensaje