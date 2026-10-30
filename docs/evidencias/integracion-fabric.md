# Evidencia de integración con Hyperledger Fabric

Entregable recomendado de OBJETIVO 3: demostrar la conexión real entre la aplicación y la
red blockchain (**transacción de registro, consulta y TxID**) que era el riesgo
principal señalado en la propuesta.

- **Fecha:** 2026‑10‑15, 01:05 (UTC‑5).
- **Entorno:** Docker local (Windows + Docker Desktop), levantado con `bash docker/up.sh`.
  Hyperledger Fabric 2.5.16, Fabric CA 1.5.22, canal `contratoschannel`, chaincode
  `contracts` v1.0 (Go), 2 organizaciones (Org1MSP, Org2MSP), MongoDB 7.0.41.
- **Cómo se hizo:** todas las operaciones de negocio pasaron por la **API real del
  backend** (`http://localhost:8080`), con sesiones reales de los 3 roles (login + código
  OTP). Después se consultó el ledger **directamente** con el CLI de Fabric, sin pasar por
  el backend, para contrastar. Única diferencia con el uso normal: durante la prueba el
  backend corrió sin SMTP, para leer el código OTP en sus logs en vez del correo; al
  terminar se restauró el envío por Brevo.
- **Documento de prueba:** un PDF sintético (`contrato-evidencia.pdf`) y una copia
  alterada en **un solo carácter** (`contrato-evidencia-alterado.pdf`).
- **Reproducir:** [`scripts/evidencia-fabric.sh`](scripts/evidencia-fabric.sh) (instrucciones
  en su encabezado) y [`scripts/bloques-fabric.sh`](scripts/bloques-fabric.sh).

## Resumen

| # | Operación | Vía | Resultado | Transacción en Fabric |
|---|---|---|---|---|
| 1 | Registro del contrato (Empleado) | `POST /documents` | `201`, `documentId 6c9fc532-…134e`, estado **Pendiente** | Bloque **9** · `RegisterDocument` · TxID `7bd0a04d…5380` · VALID |
| 2 | Consulta de la huella (Verificador) | `GET /documents/{id}` | `200`, huella `21399cfc…0a28` leída del ledger = SHA‑256 calculado localmente |: (consulta, no genera bloque) |
| 3 | Verificación con el mismo PDF | `POST /documents/{id}/verifications` | `200`, **Verificado**, `matches: true` | Bloque **10** · `RecordVerification` · TxID `cbfa6ab9…ec1f` · VALID |
| 4 | Verificación con el PDF alterado (1 carácter) | `POST /documents/{id}/verifications` | `200`, **Alterado**, `matches: false`, huellas distintas | Bloque **11** · `RecordVerification` · TxID `2c8345bd…eb71` · VALID |
| 5 | Trazabilidad (Empleado dueño) | `GET /documents/{id}/events` | 3 eventos en orden cronológico con sus TxID | N/A |
| 6 | Vista del Administrador | `GET /documents` | Huella **enmascarada** (`21399cfc••••e94d0a28`), estado Alterado | N/A |
| 7 | Contraste directo en el ledger | CLI: `GetDocument`, `GetDocumentEvents` | Misma huella, estado **Alterado** y los mismos 3 TxID que devolvió la API | N/A |
| 8 | Bloques del canal | CLI: `peer channel fetch` + `configtxlator` | Cada TxID está en su bloque, **endosado por Org1MSP + Org2MSP**, código de validación 0 (VALID) | Bloques 9, 10, 11 |

## Qué demuestra

- **Integración real de punta a punta:** API del backend (la misma que usa el frontend) →
  Fabric Gateway → peers → orderer → bloques. La altura del canal subió de 9 a 12: un bloque por cada escritura
  (registro y dos verificaciones). Las consultas no generan bloques.
- **TxID de Fabric en la trazabilidad (RF‑016, RF‑022, RNF‑027):** los TxID que muestra la
  aplicación son los mismos que están en los bloques del ledger.
- **Detección de alteraciones (RF‑031/032):** cambiar un solo carácter del PDF cambió por
  completo su SHA‑256, y el sistema marcó el documento como **Alterado**.
- **El estado lo cambia solo el chaincode (RF‑034):** el ledger, consultado directamente,
  tiene el mismo estado final (Alterado) que muestra la aplicación.
- **Consistencia MongoDB ↔ ledger (RNF‑013):** misma huella y mismo estado en las dos.
- **Inmutabilidad (RNF‑005):** el evento de registro se conserva; cada verificación es un
  evento nuevo, y cada bloque guarda el hash del bloque anterior.
- **Red permisionada con 2 organizaciones:** cada transacción tiene las firmas de ambas
  organizaciones, como exige la política de endoso MAJORITY (ver OBS‑01 de
  `docs/Objetivo 2/Matriz_Infraestructura.xlsx`).
- **Control de visibilidad (RF‑027):** el Verificador ve la huella completa; el
  Administrador, enmascarada.

## Salida completa

```text
### 0. Estado inicial
Fecha: 2026-10-15 01:05:21 -0500
GET /health → {"status":"ok","mongo":"connected"}
GET /fabric/ping → {"status":"ok","contrato":["ContractsContract","org.hyperledger.fabric"]}
Altura del canal contratoschannel (bloques): 9
SHA-256 local del PDF original:  21399cfcb87f641d464f83e516f72ee2babfb9b97f63673249b899dfe94d0a28
SHA-256 local del PDF alterado:  d9ca2830a63e487cdfe19e61e76b449a2736895c67f627ada9bd6a26b4f4f8ba
Sesiones abiertas: Empleado, Verificador, Administrador (JWT obtenidos tras el código OTP)

### 1. Registro (Empleado): POST /documents
{"documentId":"6c9fc532-ece0-4890-822b-a27b5313134e"}
HTTP 201
Altura del canal: 9 → 10 (nuevo bloque con la transacción RegisterDocument)

### 2. Consulta (Verificador): GET /documents/6c9fc532-ece0-4890-822b-a27b5313134e
{"documentId":"6c9fc532-ece0-4890-822b-a27b5313134e","name":"contrato-evidencia.pdf","responsibleUser":"U001","registeredAt":"2026-10-15T06:05:28.674Z","hash":"21399cfcb87f641d464f83e516f72ee2babfb9b97f63673249b899dfe94d0a28","status":"Pendiente"}
HTTP 200

### 3. Verificación con el MISMO archivo (Verificador): POST /documents/6c9fc532-ece0-4890-822b-a27b5313134e/verifications
{"status":"Verificado","matches":true,"registeredHash":"21399cfcb87f641d464f83e516f72ee2babfb9b97f63673249b899dfe94d0a28","computedHash":"21399cfcb87f641d464f83e516f72ee2babfb9b97f63673249b899dfe94d0a28"}
HTTP 200
Altura del canal: 10 → 11

### 4. Verificación con el archivo ALTERADO (Verificador)
{"status":"Alterado","matches":false,"registeredHash":"21399cfcb87f641d464f83e516f72ee2babfb9b97f63673249b899dfe94d0a28","computedHash":"d9ca2830a63e487cdfe19e61e76b449a2736895c67f627ada9bd6a26b4f4f8ba"}
HTTP 200
Altura del canal: 11 → 12

### 5. Trazabilidad del documento (Empleado dueño): GET /documents/6c9fc532-ece0-4890-822b-a27b5313134e/events
[
  {
    "documentId": "6c9fc532-ece0-4890-822b-a27b5313134e",
    "action": "registro",
    "user": "U001",
    "userName": "María López",
    "txId": "7bd0a04df73dffd665e3ce3b941f153f444f90480790d0596b8f61a6f8d25380",
    "timestamp": "2026-10-15T06:05:26Z"
  },
  {
    "documentId": "6c9fc532-ece0-4890-822b-a27b5313134e",
    "action": "verificacion",
    "user": "U003",
    "userName": "Pedro Gómez",
    "txId": "cbfa6ab94d12fcc339cfba6472a1f24bcaf0bc8a316a22b59fd438d85256ec1f",
    "timestamp": "2026-10-15T06:05:28Z",
    "result": "confirmada"
  },
  {
    "documentId": "6c9fc532-ece0-4890-822b-a27b5313134e",
    "action": "verificacion",
    "user": "U003",
    "userName": "Pedro Gómez",
    "txId": "2c8345bd609668886c926c4a3e12816bdb294d3b9763214a4669fccc338ceb71",
    "timestamp": "2026-10-15T06:05:31Z",
    "result": "comprometida"
  }
]

### 6. Misma consulta, vista del Administrador: GET /documents (huella enmascarada)
{
  "documentId": "6c9fc532-ece0-4890-822b-a27b5313134e",
  "name": "contrato-evidencia.pdf",
  "responsibleUser": "U001",
  "responsibleName": "María López",
  "registeredAt": "2026-10-15T06:05:28.674Z",
  "hash": "21399cfc••••••••••••••••••••e94d0a28",
  "status": "Alterado"
}

### 7. Contraste DIRECTO en el ledger (CLI de Fabric, sin pasar por el backend)
$ peer chaincode query -C contratoschannel -n contracts -c {"Args":["GetDocument","6c9fc532-ece0-4890-822b-a27b5313134e"]}
{
  "DocumentID": "6c9fc532-ece0-4890-822b-a27b5313134e",
  "Sha256Hex": "21399cfcb87f641d464f83e516f72ee2babfb9b97f63673249b899dfe94d0a28",
  "Status": "Alterado"
}
$ peer chaincode query -C contratoschannel -n contracts -c {"Args":["GetDocumentEvents","6c9fc532-ece0-4890-822b-a27b5313134e"]}
[
  {
    "Action": "verificacion",
    "DocumentID": "6c9fc532-ece0-4890-822b-a27b5313134e",
    "Result": "comprometida",
    "Timestamp": "2026-10-15T06:05:31Z",
    "TxID": "2c8345bd609668886c926c4a3e12816bdb294d3b9763214a4669fccc338ceb71",
    "User": "U003"
  },
  {
    "Action": "registro",
    "DocumentID": "6c9fc532-ece0-4890-822b-a27b5313134e",
    "Timestamp": "2026-10-15T06:05:26Z",
    "TxID": "7bd0a04df73dffd665e3ce3b941f153f444f90480790d0596b8f61a6f8d25380",
    "User": "U001"
  },
  {
    "Action": "verificacion",
    "DocumentID": "6c9fc532-ece0-4890-822b-a27b5313134e",
    "Result": "confirmada",
    "Timestamp": "2026-10-15T06:05:28Z",
    "TxID": "cbfa6ab94d12fcc339cfba6472a1f24bcaf0bc8a316a22b59fd438d85256ec1f",
    "User": "U003"
  }
]

### 8. Bloques del canal que contienen esas transacciones (peer channel fetch desde peer0.org1 + configtxlator)
Bloque nº 9 · TxID 7bd0a04df73dffd665e3ce3b941f153f444f90480790d0596b8f61a6f8d25380
    chaincode=contracts · función=RegisterDocument · endosado por: Org1MSP+Org2MSP · código de validación=0 (0 = VALID) · hash del bloque anterior=b453dfb23228faf1…
Bloque nº 10 · TxID cbfa6ab94d12fcc339cfba6472a1f24bcaf0bc8a316a22b59fd438d85256ec1f
    chaincode=contracts · función=RecordVerification · endosado por: Org1MSP+Org2MSP · código de validación=0 (0 = VALID) · hash del bloque anterior=c460cf052c96f62a…
Bloque nº 11 · TxID 2c8345bd609668886c926c4a3e12816bdb294d3b9763214a4669fccc338ceb71
    chaincode=contracts · función=RecordVerification · endosado por: Org1MSP+Org2MSP · código de validación=0 (0 = VALID) · hash del bloque anterior=e5179f0798c841cc…
```

> El documento de prueba (`contrato-evidencia.pdf`, de María López) queda registrado en el
> entorno hasta el próximo `bash docker/down.sh`, que lo borra junto con la red.
