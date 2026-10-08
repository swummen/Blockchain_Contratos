import crypto from "node:crypto";
import { queryChaincode, submitChaincodeTransaction } from "../fabric/gateway";
import { DocumentStatus, findDocumentById, insertDocument } from "../repositories/documentRepository";
import { Role } from "../repositories/userRepository";

export type RegisterDocumentResult =
  | { ok: true; documentId: string }
  | { ok: false; status: number; message: string };

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

export async function getDocument(documentId: string, role: Role): Promise<GetDocumentResult> {
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

  const ledgerDoc = JSON.parse(raw) as { Sha256Hex: string; Status: DocumentStatus };
  const metadata = await findDocumentById(documentId);
  // El ledger es la autoridad para hash/status (SPEC.md §4.1); si Mongo no
  // tiene el resto de los metadatos (inconsistencia real, ya logueada en
  // registerDocument si ocurrió ahí), igual se responde con lo que el ledger
  // sí tiene en vez de un 404 falso — el documento SÍ existe.
  const hash = ROLES_WITH_FULL_HASH.includes(role) ? ledgerDoc.Sha256Hex : maskHash(ledgerDoc.Sha256Hex);

  return {
    ok: true,
    document: {
      documentId,
      name: metadata?.name,
      responsibleUser: metadata?.responsibleUser,
      registeredAt: metadata?.registeredAt.toISOString(),
      hash,
      status: ledgerDoc.Status,
    },
  };
}
