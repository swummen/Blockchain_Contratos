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
import { findUserNamesByIds, Role } from "../repositories/userRepository";

export type RegisterDocumentResult =
  | { ok: true; documentId: string }
  | { ok: false; status: number; message: string };

export interface DocumentSummary {
  documentId: string;
  name: string;
  responsibleUser: string;
  // Cae al userId si el usuario ya no existe.
  responsibleName: string;
  registeredAt: string;
  // Completo solo para el Verificador; enmascarado para el resto (RF-27).
  hash: string;
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

// Se valida la firma del archivo y no el Content-Type: ese header lo decide el
// cliente y dejaría pasar cualquier archivo renombrado a ".pdf".
const PDF_MAGIC = Buffer.from("%PDF-");

export function isPdfSignature(buffer: Buffer): boolean {
  return buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
}

// Solo para el log: el motivo real de un rechazo del chaincode viene en
// `.details[0].message`, no en `.message`. Nunca se envía al cliente.
function describeFabricError(err: unknown): string {
  const details = (err as { details?: Array<{ message?: string }> })?.details;
  const detailMessage = details?.[0]?.message;
  const baseMessage = err instanceof Error ? err.message : String(err);
  return detailMessage ? `${baseMessage} (${detailMessage})` : baseMessage;
}

// gRPC 14 (UNAVAILABLE) y 4 (DEADLINE_EXCEEDED): el peer no responde, casi
// siempre porque la red Fabric está apagada (por ejemplo, tras reiniciar el PC).
const LEDGER_UNAVAILABLE =
  "La red blockchain no está disponible en este momento. Intenta de nuevo en unos minutos.";

function ledgerErrorMessage(err: unknown, fallback: string): string {
  const code = (err as { code?: number })?.code;
  return code === 14 || code === 4 ? LEDGER_UNAVAILABLE : fallback;
}

// Exige `.details`, que solo existe cuando respondió el peer: así una caída de
// red o un timeout nunca se confunde con un 404 de "documento inexistente".
function isDocumentNotFoundError(err: unknown): boolean {
  const details = (err as { details?: Array<{ message?: string }> })?.details;
  const detailMessage = details?.[0]?.message;
  return typeof detailMessage === "string" && /document .+ not found/.test(detailMessage);
}

// Registra la huella en el ledger y después los metadatos en MongoDB (RNF-13).
export async function registerDocument(
  file: UploadedFile,
  userId: string,
): Promise<RegisterDocumentResult> {
  if (!isPdfSignature(file.buffer)) {
    return { ok: false, status: 400, message: "El archivo no es un PDF válido." };
  }

  const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

  // No se permiten dos registros Pendiente del mismo archivo del mismo usuario.
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
    // Si el ledger falla no se guarda nada en Mongo (HU-007 CA-02).
    console.error("No se pudo registrar el documento en la blockchain:", describeFabricError(err));
    return {
      ok: false,
      status: 502,
      message: ledgerErrorMessage(err, "No se pudo registrar el documento en la blockchain. Intenta de nuevo."),
    };
  }

  try {
    await insertDocument({
      _id: documentId,
      // El nombre lo manda el cliente: se recorta para no inflar el documento.
      name: file.originalname.slice(0, 255),
      responsibleUser: userId,
      registeredAt: new Date(),
      hash,
      status: "Pendiente",
    });
  } catch (err) {
    // El ledger ya es inmutable y no se puede revertir: se registra la
    // inconsistencia para reconciliarla a mano.
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

// Lee de Mongo (el chaincode no lista documentos). El Empleado solo ve los
// suyos. El hash de Mongo es confiable: nunca cambia después del registro.
export async function listDocuments(role: Role, userId: string): Promise<DocumentSummary[]> {
  const docs = await listDocumentsFromMongo(role === "Empleado" ? userId : undefined);
  const names = await findUserNamesByIds(docs.map((doc) => doc.responsibleUser));
  const canViewFullHash = ROLES_WITH_FULL_HASH.includes(role);
  return docs.map((doc) => ({
    documentId: doc._id,
    name: doc.name,
    responsibleUser: doc.responsibleUser,
    responsibleName: names.get(doc.responsibleUser) ?? doc.responsibleUser,
    registeredAt: doc.registeredAt.toISOString(),
    hash: canViewFullHash ? doc.hash : maskHash(doc.hash),
    status: doc.status,
  }));
}

// RF-27: se enmascara en el servidor, no solo en la UI, porque la API se puede
// llamar directamente. Mismo algoritmo que frontend/src/lib/mask-hash.ts.
const ROLES_WITH_FULL_HASH: Role[] = ["Verificador"];

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

// Consulta un documento en el ledger: 404 si no existe, 502 si falla Fabric.
async function queryLedgerDocument(documentId: string): Promise<LedgerDocumentResult> {
  let raw: string;
  try {
    raw = await queryChaincode("GetDocument", documentId);
  } catch (err) {
    if (isDocumentNotFoundError(err)) {
      return { ok: false, status: 404, message: "El documento no está registrado." };
    }
    console.error("No se pudo consultar el documento en la blockchain:", describeFabricError(err));
    return { ok: false, status: 502, message: ledgerErrorMessage(err, "No se pudo consultar el documento. Intenta de nuevo.") };
  }
  return { ok: true, doc: JSON.parse(raw) as LedgerDocument };
}

export async function getDocument(documentId: string, role: Role, userId: string): Promise<GetDocumentResult> {
  const ledgerResult = await queryLedgerDocument(documentId);
  if (!ledgerResult.ok) return ledgerResult;

  // Hash y estado salen del ledger, que es la autoridad. Si Mongo no tiene los
  // metadatos, se responde igual: el documento sí existe.
  const metadata = await findDocumentById(documentId);
  // Un Empleado solo consulta lo suyo (RNF-08). Sin metadatos no hay dueño
  // conocido, así que también se niega.
  if (role === "Empleado" && metadata?.responsibleUser !== userId) {
    return { ok: false, status: 403, message: "No tienes permiso para esta acción." };
  }
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

// Compara la huella del PDF cargado con la registrada y anota el resultado en
// el ledger antes de actualizar Mongo.
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

  const computedHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const matches = computedHash === ledgerResult.doc.Sha256Hex;
  // RF-34: el estado solo lo decide la comparación, nunca una acción manual.
  const result = matches ? "confirmada" : "comprometida";
  const newStatus: DocumentStatus = matches ? "Verificado" : "Alterado";

  try {
    // Espera la confirmación del bloque. Reintentar es seguro pero deja dos
    // eventos de verificación (re-verificar está permitido, HU-014 CA-02).
    await submitChaincodeTransaction("RecordVerification", documentId, result, userId);
  } catch (err) {
    console.error("No se pudo registrar la verificación en la blockchain:", describeFabricError(err));
    return {
      ok: false,
      status: 502,
      message: ledgerErrorMessage(err, "No se pudo registrar la verificación en la blockchain. Intenta de nuevo."),
    };
  }

  try {
    await updateDocumentStatus(documentId, newStatus);
  } catch (err) {
    // Igual que en el registro: el ledger ya quedó escrito y no se revierte.
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
      // Completos: la ruta solo la usa el Verificador.
      registeredHash: ledgerResult.doc.Sha256Hex,
      computedHash,
    },
  };
}

export interface EventView {
  documentId: string;
  action: string;
  user: string;
  // Cae al userId si no es un usuario registrado.
  userName: string;
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

// El ledger solo guarda el userId: los nombres se resuelven en una consulta.
async function toEventViews(events: LedgerEvent[]): Promise<EventView[]> {
  const names = await findUserNamesByIds(events.map((evt) => evt.User));
  return events.map((evt) => ({
    documentId: evt.DocumentID,
    action: evt.Action,
    user: evt.User,
    userName: names.get(evt.User) ?? evt.User,
    txId: evt.TxID,
    timestamp: evt.Timestamp,
    result: evt.Result,
  }));
}

// El ledger no devuelve los eventos en orden. El timestamp es RFC3339 en UTC
// con formato fijo, así que comparar como texto ya ordena cronológicamente.
function sortByTimestamp(events: EventView[]): EventView[] {
  return [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export type GetDocumentEventsResult =
  | { ok: true; events: EventView[] }
  | { ok: false; status: number; message: string };

// Trazabilidad de un documento (RF-21/22). Un Empleado solo ve la de los suyos.
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
    return { ok: false, status: 502, message: ledgerErrorMessage(err, "No se pudo consultar la trazabilidad. Intenta de nuevo.") };
  }

  const events = sortByTimestamp(await toEventViews(JSON.parse(raw) as LedgerEvent[]));

  if (role === "Empleado") {
    // El dueño se toma del evento "registro" del ledger, no de Mongo, para que
    // una desincronización no bloquee al dueño real. Sin evento, se niega.
    const registro = events.find((evt) => evt.action === "registro");
    if (registro?.user !== userId) {
      return { ok: false, status: 403, message: "No tienes permiso para esta acción." };
    }
  }

  return { ok: true, events };
}

export type GetAllEventsResult =
  | { ok: true; events: EventView[] }
  | { ok: false; status: number; message: string };

// Los eventos del ledger solo crecen (re-verificar no tiene límite): tope fijo.
const MAX_EVENTS = 200;

// Trazabilidad general (RF-39/40, RF-50/51): mismo detalle para Verificador y
// Administrador.
export async function getAllEvents(): Promise<GetAllEventsResult> {
  let raw: string;
  try {
    raw = await queryChaincode("GetAllEvents");
  } catch (err) {
    console.error("No se pudo consultar la trazabilidad general en la blockchain:", describeFabricError(err));
    return { ok: false, status: 502, message: ledgerErrorMessage(err, "No se pudo consultar la trazabilidad. Intenta de nuevo.") };
  }

  // Se ordena antes de recortar para quedarse con los más recientes, y se
  // recorta antes de resolver nombres para no consultar usuarios de más.
  const events = (JSON.parse(raw) as LedgerEvent[])
    .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
    .slice(-MAX_EVENTS);
  return { ok: true, events: await toEventViews(events) };
}

// Totales por estado para el panel del Administrador (RF-41/42).
export async function getDocumentsSummary(): Promise<DocumentCounts> {
  return countDocumentsByStatus();
}
