import { Collection } from "mongodb";
import { getDb } from "./mongoClient";

export type DocumentStatus = "Pendiente" | "Verificado" | "Alterado";

// _id es el mismo documentId que ya se ancló en el chaincode (crypto.randomUUID()
// generado en documentService.ts): misma clave en Mongo y en el ledger (RNF-13).
export interface DocumentDoc {
  _id: string;
  name: string;
  responsibleUser: string;
  registeredAt: Date;
  hash: string;
  status: DocumentStatus;
}

function documentsCollection(): Collection<DocumentDoc> {
  return getDb().collection<DocumentDoc>("documents");
}

export async function insertDocument(doc: DocumentDoc): Promise<void> {
  await documentsCollection().insertOne(doc);
}

export async function findDocumentById(documentId: string): Promise<DocumentDoc | null> {
  return documentsCollection().findOne({ _id: documentId });
}

// Pedido de Sofia (ver para_sofi.md): evita que el mismo empleado registre
// dos veces el mismo archivo mientras el primero sigue "Pendiente", no hay
// ninguna razón de negocio para tener dos registros idénticos esperando
// verificación a la vez. Se filtra por responsibleUser (no es global): dos
// empleados distintos sí pueden tener, cada uno, un documento igual de
// contenido pendiente al mismo tiempo.
export async function findPendingDuplicate(
  responsibleUser: string,
  hash: string,
): Promise<DocumentDoc | null> {
  return documentsCollection().findOne({ responsibleUser, hash, status: "Pendiente" });
}

// Único lugar que cambia `status` después de la inserción inicial (RF-34:
// nunca manual, solo tras comparar huellas en verifyDocument).
export async function updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<void> {
  await documentsCollection().updateOne({ _id: documentId }, { $set: { status } });
}

// Listado mínimo (ampliación de alcance de Sprint 3 T5, pedida por Sofia):
// Mongo es el único índice de "qué se registró" que existe hoy, el
// chaincode no tiene ninguna función de listado (D6, Sprint 2) y agregarle
// una sería de verdad el alcance completo de RF-37/48 (Sprint 4), no esto.
// Ordenado por más reciente primero; límite defensivo de 100 (no hay
// paginación todavía, no hace falta para un MVP de tesis con pocos
// documentos de prueba). `responsibleUser` opcional (Sprint 4, D3): filtra a
// los documentos de un solo usuario, lo que usa el Empleado para "Mis
// documentos" (RF-18), el mismo listado que Verificador/Administrador ven
// completo.
export async function listDocuments(responsibleUser?: string): Promise<DocumentDoc[]> {
  const filter = responsibleUser ? { responsibleUser } : {};
  return documentsCollection().find(filter).sort({ registeredAt: -1 }).limit(100).toArray();
}

export interface DocumentCounts {
  total: number;
  pendiente: number;
  verificado: number;
  alterado: number;
}

// RF-41/42 (panel del Administrador): totales reales por estado, vía un
// aggregate agrupado, a propósito NO reutiliza `listDocuments` (que tiene un
// límite de 100 sin paginación, D8 de Sprint 3): un panel con totales mal
// contados por ese límite sería peor que no tener panel (D6 del plan de
// Sprint 4).
export async function countDocumentsByStatus(): Promise<DocumentCounts> {
  const results = await documentsCollection()
    .aggregate<{ _id: DocumentStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  const counts = { Pendiente: 0, Verificado: 0, Alterado: 0 };
  for (const r of results) counts[r._id] = r.count;

  return {
    total: counts.Pendiente + counts.Verificado + counts.Alterado,
    pendiente: counts.Pendiente,
    verificado: counts.Verificado,
    alterado: counts.Alterado,
  };
}
