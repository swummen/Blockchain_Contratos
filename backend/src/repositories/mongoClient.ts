import { Db, MongoClient } from "mongodb";
import { env } from "../config/env";

// Sin esto, el driver usa su default de 30s para serverSelectionTimeoutMS y
// sin límite para socketTimeoutMS: si Mongo está lento (no caído del todo),
// /health tarda hasta 30s en responder en vez de fallar rápido, que es lo
// único que le sirve a un healthcheck.
const client = new MongoClient(env.mongoUri, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
});

export async function connectMongo(): Promise<void> {
  await client.connect();
}

// Solo la usan scripts de una sola corrida (p. ej. seedUsers.ts, T1): el
// servidor (server.ts) nunca cierra su propia conexión, vive mientras vive
// el proceso.
export async function closeMongo(): Promise<void> {
  await client.close();
}

// Nombre de base de datos fijo (no hay caso de uso hoy para más de una): las
// colecciones de identity (T1+) y las que sigan la usan a través de esto en
// vez de repetir el literal.
export function getDb(): Db {
  return client.db("contratos");
}

// Ping en vez de un flag cacheado de "conectado": refleja si Mongo responde
// ahora mismo, no si el connect() inicial tuvo éxito hace rato.
export async function isMongoHealthy(): Promise<boolean> {
  try {
    await getDb().command({ ping: 1 }, { timeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}
