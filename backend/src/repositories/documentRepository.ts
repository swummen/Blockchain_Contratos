import { Collection } from "mongodb";
import { getDb } from "./mongoClient";

export type DocumentStatus = "Pendiente" | "Verificado" | "Alterado";

// _id es el mismo documentId que ya se ancló en el chaincode (crypto.randomUUID()
// generado en documentService.ts) — misma clave en Mongo y en el ledger (RNF-13).
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
