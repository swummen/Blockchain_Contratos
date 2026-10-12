import crypto from "node:crypto";
import { queryChaincode, submitChaincodeTransaction } from "../fabric/gateway";
import {
  countDocumentsByStatus,
  DocumentCounts,
  DocumentStatus,
  findDocumentById,
  findPendingDuplicate,
  insertDocument,
  listDocuments as listDocumentsFromMongo,
  updateDocumentStatus,
} from "../repositories/documentRepository";
import { Role } from "../repositories/userRepository";

export type RegisterDocumentResult =
  | { ok: true; documentId: string }
  | { ok: false; status: number; message: string };

export interface DocumentSummary {
  documentId: string;
  name: string;
  responsibleUser: string;
  registeredAt: string;
  status: DocumentStatus;
}

export interface DocumentView {
  documentId: string;
  name?: string;
  responsibleUser?: string;
  registeredAt?: string;
  hash: string;
  status: DocumentStatus;
}

export type GetDocumentResult =
  | { ok: true; document: DocumentView }
  | { ok: false; status: number; message: string };

export interface VerificationResult {
  status: DocumentStatus;
  matches: boolean;
  registeredHash: string;
  computedHash: string;
}

export type VerifyDocumentResult =
  | { ok: true; result: VerificationResult }
  | { ok: false; status: number; message: string };

interface UploadedFile {
  originalname: string;
  buffer: Buffer;
}

// Firma de archivo (RNF-23), no el Content-Type que manda el cliente — ese
// header lo controla quien sube el archivo, así que confiar solo en él deja
// pasar cualquier archivo renombrado a ".pdf".
const PDF_MAGIC = Buffer.from("%PDF-");

export function isPdfSignature(buffer: Buffer): boolean {
  return buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
}

// Best-effort para el log del servidor: el mensaje real de un rechazo del
// chaincode (ej. "document ... already registered") no viaja en `.message`
// del error del SDK, vive en `.details[0].message` (GatewayError.details —
// ver el hallazgo de T3 en claude_docs/tasks/todo-sprint2-documents-ledger.md).
// Nunca se expone al cliente tal cual — /documents es un endpoint de
// negocio real, no el diagnóstico de /fabric/ping.
function describeFabricError(err: unknown): string {
  const details = (err as { details?: Array<{ message?: string }> })?.details;
  const detailMessage = details?.[0]?.message;
  const baseMessage = err instanceof Error ? err.message : String(err);
  return detailMessage ? `${baseMessage} (${detailMessage})` : baseMessage;
}

// A diferencia de describeFabricError (solo para loguear), esto decide un
// status HTTP — así que exige que `.details` venga poblado antes de mirar el
// texto: eso solo pasa cuando el error vino de una respuesta real del peer
// (grpc-status-details-bin), nunca de una falla de transporte/config
// (peer caído, nombre de canal/chaincode mal configurado, timeout) — esas
// nunca traen `.details`, así que nunca podrían disfrazarse de un 404 de
// negocio con este chequeo.
function isDocumentNotFoundError(err: unknown): boolean {
  const details = (err as { details?: Array<{ message?: string }> })?.details;
  const detailMessage = details?.[0]?.message;
  return typeof detailMessage === "string" && /document .+ not found/.test(detailMessage);
}

export async function registerDocument(
  file: UploadedFile,
  userId: string,
): Promise<RegisterDocumentResult> {
  if (!isPdfSignature(file.buffer)) {
    return { ok: false, status: 400, message: "El archivo no es un PDF válido." };
  }

  // RF-14/RNF-11: automática, determinista — el mismo contenido siempre da
  // el mismo hash (HU-006-CA-02).
  const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

  // Pedido de Sofia: no tiene sentido tener dos registros "Pendiente" del
  // mismo archivo esperando verificación a la vez — solo se puede volver a
  // subirlo una vez que el anterior ya se verificó (o salió "Alterado").
  const duplicate = await findPendingDuplicate(userId, hash);
  if (duplicate) {
    return {
      ok: false,
      status: 409,
      message:
        `Ya tienes este documento registrado y pendiente de verificación (ID: ${duplicate._id}). ` +
        "Solo puedes volver a subirlo una vez que se verifique.",
    };
  }

  const documentId = crypto.randomUUID();

  try {
    await submitChaincodeTransaction("RegisterDocument", documentId, hash, userId);
  } catch (err) {
    // HU-007-CA-02: si el registro en la blockchain falla, nunca se guarda
    // nada en Mongo ni se muestra un mensaje de éxito al Empleado.
    console.error("No se pudo registrar el documento en la blockchain:", describeFabricError(err));
    return {
      ok: false,
      status: 502,
      message: "No se pudo registrar el documento en la blockchain. Intenta de nuevo.",
    };
  }

  try {
    await insertDocument({
      _id: documentId,
      // Recortado: es el nombre de archivo que manda el cliente, sin
      // sanitizar más allá de esto — Sprint 4 (consulta/listado) es quien
      // decide cómo mostrarlo con seguridad, acá solo se evita que un nombre
      // absurdamente largo infle el documento en Mongo sin necesidad.
      name: file.originalname.slice(0, 255),
      responsibleUser: userId,
      registeredAt: new Date(),
      hash,
      status: "Pendiente",
    });
  } catch (err) {
    // Caso raro y sin una forma limpia de revertir (RNF-05: lo ya anclado en
    // el ledger es inmutable, no hay "deshacer"): el documento queda
    // registrado on-chain pero sin metadata en Mongo. Se loguea bien fuerte
    // para poder reconciliar a mano — no se intenta un rollback automático
    // (agregar un saga/outbox acá sería sobre-construir para un caso límite
    // de un MVP de tesis).
    console.error(
      `INCONSISTENCIA Mongo↔ledger: documentId=${documentId} quedó anclado en la blockchain pero no se pudo guardar en Mongo:`,
      err,
    );
    return {
      ok: false,
      status: 500,
      message: "No se pudo completar el registro del documento. Contacta a soporte.",
    };
  }

  return { ok: true, documentId };
}

// Ampliación de alcance de Sprint 3 T5 (pedida por Sofia): sin esto, elegir
// un documento para verificar exigía que alguien le pasara el documentId a
// mano al Verificador — nada que lo liste todavía (eso es RF-37/48, Sprint
// 4). Lee directo de Mongo (nunca del chaincode: no es una fuente de verdad
// de cuáles existen, D6) — el `status` que muestra puede estar un instante
// desactualizado frente al ledger si algo falló a mitad de camino en
// verifyDocument, pero `GetDocument` (al elegir un documento puntual) sigue
// siendo la fuente real para hash/status antes de verificar nada.
//
// Acotado por rol desde Sprint 4 (D3): un Empleado solo ve los documentos
// donde él es `responsibleUser` (RF-18, "Mis documentos") — mismo endpoint
// que `GET /documents/:id` usa para el hash: el comportamiento varía por
// rol, no la ruta.
export async function listDocuments(role: Role, userId: string): Promise<DocumentSummary[]> {
  const docs = await listDocumentsFromMongo(role === "Empleado" ? userId : undefined);
  return docs.map((doc) => ({
    documentId: doc._id,
    name: doc.name,
    responsibleUser: doc.responsibleUser,
    registeredAt: doc.registeredAt.toISOString(),
    status: doc.status,
  }));
}

// RF-27/RNF-08: el hash completo solo lo ve Verificador/Administrador. Mismo
// algoritmo que `frontend/src/lib/mask-hash.ts` (primeros/últimos 8
// caracteres visibles) — se enmascara server-side, no solo en la UI, porque
// este es un endpoint de negocio real que un cliente arbitrario puede llamar.
const ROLES_WITH_FULL_HASH: Role[] = ["Verificador", "Administrador"];

export function maskHash(hash: string): string {
  if (hash.length <= 20) return hash;
  const head = hash.slice(0, 8);
  const tail = hash.slice(-8);
  const dotCount = Math.min(hash.length - 16, 20);
  return `${head}${"•".repeat(dotCount)}${tail}`;
}

interface LedgerDocument {
  Sha256Hex: string;
  Status: DocumentStatus;
}

type LedgerDocumentResult =
  | { ok: true; doc: LedgerDocument }
  | { ok: false; status: number; message: string };

// Compartido por getDocument (T3) y verifyDocument (T4) — ambos necesitan la
// misma consulta al ledger y la misma clasificación 404 (chaincode, documento
// inexistente) vs. 502 (transporte/config) de isDocumentNotFoundError.
async function queryLedgerDocument(documentId: string): Promise<LedgerDocumentResult> {
  let raw: string;
  try {
    raw = await queryChaincode("GetDocument", documentId);
  } catch (err) {
    if (isDocumentNotFoundError(err)) {
      return { ok: false, status: 404, message: "El documento no está registrado." };
    }
    console.error("No se pudo consultar el documento en la blockchain:", describeFabricError(err));
    return { ok: false, status: 502, message: "No se pudo consultar el documento. Intenta de nuevo." };
  }
  return { ok: true, doc: JSON.parse(raw) as LedgerDocument };
}

export async function getDocument(documentId: string, role: Role): Promise<GetDocumentResult> {
  const ledgerResult = await queryLedgerDocument(documentId);
  if (!ledgerResult.ok) return ledgerResult;

  const metadata = await findDocumentById(documentId);
  // El ledger es la autoridad para hash/status (SPEC.md §4.1); si Mongo no
  // tiene el resto de los metadatos (inconsistencia real, ya logueada en
  // registerDocument si ocurrió ahí), igual se responde con lo que el ledger
  // sí tiene en vez de un 404 falso — el documento SÍ existe.
  const hash = ROLES_WITH_FULL_HASH.includes(role)
    ? ledgerResult.doc.Sha256Hex
    : maskHash(ledgerResult.doc.Sha256Hex);

  return {
    ok: true,
    document: {
      documentId,
      name: metadata?.name,
      responsibleUser: metadata?.responsibleUser,
      registeredAt: metadata?.registeredAt.toISOString(),
      hash,
      status: ledgerResult.doc.Status,
    },
  };
}

export async function verifyDocument(
  documentId: string,
  file: UploadedFile,
  userId: string,
): Promise<VerifyDocumentResult> {
  if (!isPdfSignature(file.buffer)) {
    return { ok: false, status: 400, message: "El archivo no es un PDF válido." };
  }

  const ledgerResult = await queryLedgerDocument(documentId);
  if (!ledgerResult.ok) return ledgerResult;

  // RF-30/RNF-10: mismo algoritmo determinista que registerDocument.
  const computedHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const matches = computedHash === ledgerResult.doc.Sha256Hex;
  // RF-34: nunca manual — el resultado de comparar los hashes es lo único
  // que decide el estado nuevo.
  const result = matches ? "confirmada" : "comprometida";
  const newStatus: DocumentStatus = matches ? "Verificado" : "Alterado";

  try {
    // submitChaincodeTransaction espera el commit real (nunca "éxito" solo a
    // nivel de endoso) — si esto resuelve, el evento ya quedó anclado. Un
    // reintento del cliente justo si el proceso se cae entre esta línea y el
    // updateDocumentStatus de abajo es seguro (RecordVerification no tiene
    // ningún guard de "ya verificado", HU-014-CA-02 lo permite a propósito),
    // pero deja dos eventos reales de verificación en el ledger para lo que
    // el humano percibe como una sola acción — consecuencia ya aceptada en
    // D13 de Sprint 2 (sin saga/outbox para un MVP de tesis), no un bug.
    await submitChaincodeTransaction("RecordVerification", documentId, result, userId);
  } catch (err) {
    // Mismo criterio que registerDocument (D13 de Sprint 2): si el ledger no
    // registra la verificación, nunca se actualiza Mongo ni se muestra éxito.
    console.error("No se pudo registrar la verificación en la blockchain:", describeFabricError(err));
    return {
      ok: false,
      status: 502,
      message: "No se pudo registrar la verificación en la blockchain. Intenta de nuevo.",
    };
  }

  try {
    await updateDocumentStatus(documentId, newStatus);
  } catch (err) {
    // Misma inconsistencia posible que registerDocument: la verificación ya
    // quedó anclada e inmutable en el ledger (RNF-05), pero Mongo no se pudo
    // actualizar. Se loguea para reconciliar a mano, no se revierte nada.
    console.error(
      `INCONSISTENCIA Mongo↔ledger: documentId=${documentId} quedó verificado en la blockchain pero no se pudo actualizar en Mongo:`,
      err,
    );
    return {
      ok: false,
      status: 500,
      message: "No se pudo completar la verificación. Contacta a soporte.",
    };
  }

  return {
    ok: true,
    result: {
      status: newStatus,
      matches,
      // Hash completo en los dos: quien llega hasta acá ya es Verificador
      // (requireAuth("Verificador") en la ruta) — no hay nada que enmascarar.
      registeredHash: ledgerResult.doc.Sha256Hex,
      computedHash,
    },
  };
}

export interface EventView {
  documentId: string;
  action: string;
  user: string;
  txId: string;
  timestamp: string;
  result?: string;
}

interface LedgerEvent {
  Action: string;
  DocumentID: string;
  Result?: string;
  Timestamp: string;
  TxID: string;
  User: string;
}

function toEventView(evt: LedgerEvent): EventView {
  return {
    documentId: evt.DocumentID,
    action: evt.Action,
    user: evt.User,
    txId: evt.TxID,
    timestamp: evt.Timestamp,
    result: evt.Result,
  };
}

// El ledger no garantiza ningún orden entre TxID (son hashes, no un contador
// — ni siquiera dentro de UN documento el orden de iteración coincide con el
// cronológico, D2 del plan de Sprint 4) — Timestamp es un string RFC3339 en
// UTC siempre con el mismo formato (`ts.AsTime().UTC().Format(time.RFC3339)`
// en el chaincode), así que la comparación lexicográfica ya alcanza, sin
// parsear a `Date`.
function sortByTimestamp(events: EventView[]): EventView[] {
  return [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export type GetDocumentEventsResult =
  | { ok: true; events: EventView[] }
  | { ok: false; status: number; message: string };

// RF-21/22 (HU-009): trazabilidad de un documento. Un Empleado solo puede
// verla si es el dueño (RF-21-CA-02, "el sistema le deniega el acceso") —
// Verificador/Administrador, sin esa restricción (mismo criterio que ya usan
// para el hash completo, RF-27).
export async function getDocumentEvents(
  documentId: string,
  role: Role,
  userId: string,
): Promise<GetDocumentEventsResult> {
  const ledgerResult = await queryLedgerDocument(documentId);
  if (!ledgerResult.ok) return ledgerResult;

  let raw: string;
  try {
    raw = await queryChaincode("GetDocumentEvents", documentId);
  } catch (err) {
    console.error("No se pudo consultar la trazabilidad en la blockchain:", describeFabricError(err));
    return { ok: false, status: 502, message: "No se pudo consultar la trazabilidad. Intenta de nuevo." };
  }

  const events = sortByTimestamp((JSON.parse(raw) as LedgerEvent[]).map(toEventView));

  if (role === "Empleado") {
    // El dueño es el `User` del evento "registro" — del propio ledger, no de
    // Mongo (hallazgo del review de T3: así nunca puede quedar desincronizado
    // con la fuente real, a diferencia de consultar `findDocumentById`).
    // Fail closed si por algún motivo no hay evento de registro (no debería
    // pasar — RegisterDocument siempre lo planta primero).
    const registro = events.find((evt) => evt.action === "registro");
    if (registro?.user !== userId) {
      return { ok: false, status: 403, message: "No tenés permiso para esta acción." };
    }
  }

  return { ok: true, events };
}

export type GetAllEventsResult =
  | { ok: true; events: EventView[] }
  | { ok: false; status: number; message: string };

// Límite defensivo (hallazgo del review de T4): a diferencia de `documents`
// en Mongo (una población real, aunque creciente), el ledger es estrictamente
// de solo-anexado — cada documento deja como mínimo 1 evento y HU-014-CA-02
// permite re-verificar sin límite, así que esto crece para siempre, no solo
// mientras el proyecto esté vivo sino en cada reuso del mismo entorno de
// pruebas. `listDocuments` (D8, Sprint 3) ya tiene el mismo tipo de límite
// por la misma razón — acá, no reusarlo habría sido la única consulta de
// esta capa sin ninguna postura escrita sobre su propio crecimiento.
const MAX_EVENTS = 200;

// RF-39/40 (Verificador) y RF-50/51 (Administrador), HU-016/020: trazabilidad
// general, todos los documentos, mismo nivel de detalle para los dos roles
// (D5 del plan — una sola respuesta, no una "recortada" para Verificador).
// Sin chequeo de propiedad: a diferencia de getDocumentEvents, nadie acá
// consulta solo lo suyo.
export async function getAllEvents(): Promise<GetAllEventsResult> {
  let raw: string;
  try {
    raw = await queryChaincode("GetAllEvents");
  } catch (err) {
    console.error("No se pudo consultar la trazabilidad general en la blockchain:", describeFabricError(err));
    return { ok: false, status: 502, message: "No se pudo consultar la trazabilidad. Intenta de nuevo." };
  }

  const events = (JSON.parse(raw) as LedgerEvent[]).map(toEventView);
  // .slice(-N) después de ordenar ascendente: se queda con los N más
  // recientes, no los N primeros que trajo el ledger (sin orden garantizado).
  return { ok: true, events: sortByTimestamp(events).slice(-MAX_EVENTS) };
}

// RF-41/42 (HU-017): panel del Administrador. Puro paso a través del
// repositorio — no hay ninguna lógica de negocio propia que justifique más
// que esto (D6 del plan: "Should", no "Must", alcance chico a propósito).
export async function getDocumentsSummary(): Promise<DocumentCounts> {
  return countDocumentsByStatus();
}
