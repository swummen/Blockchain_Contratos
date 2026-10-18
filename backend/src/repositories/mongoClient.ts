import { Db, MongoClient } from "mongodb";
import { env } from "../config/env";

// Plazos cortos: con los valores por defecto (30 s o sin límite), /health
// tardaría demasiado en reportar un Mongo lento.
const client = new MongoClient(env.mongoUri, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
});

export async function connectMongo(): Promise<void> {
  await client.connect();
}

// Para scripts de una sola corrida; el servidor mantiene la conexión abierta.
export async function closeMongo(): Promise<void> {
  await client.close();
}

export function getDb(): Db {
  return client.db("contratos");
}

// Hace ping en cada llamada: refleja el estado actual, no el de la conexión inicial.
export async function isMongoHealthy(): Promise<boolean> {
  try {
    await getDb().command({ ping: 1 }, { timeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}
