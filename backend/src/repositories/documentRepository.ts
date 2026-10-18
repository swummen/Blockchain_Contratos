import { Collection } from "mongodb";
import { getDb } from "./mongoClient";

export type DocumentStatus = "Pendiente" | "Verificado" | "Alterado";

// _id es el mismo documentId del ledger (RNF-13).
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

// Mismo archivo del mismo usuario todavía Pendiente. Es por usuario: dos
// empleados sí pueden tener pendiente un archivo idéntico.
export async function findPendingDuplicate(
  responsibleUser: string,
  hash: string,
): Promise<DocumentDoc | null> {
  return documentsCollection().findOne({ responsibleUser, hash, status: "Pendiente" });
}

// Único lugar que cambia el estado (RF-34): solo lo llama verifyDocument.
export async function updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<void> {
  await documentsCollection().updateOne({ _id: documentId }, { $set: { status } });
}

// Los 100 más recientes (sin paginación). Con responsibleUser, solo los de ese usuario.
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

// Totales por estado sobre todos los documentos (no usa el tope de listDocuments).
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
