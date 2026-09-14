import { MongoClient } from "mongodb";
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

// Ping en vez de un flag cacheado de "conectado": refleja si Mongo responde
// ahora mismo, no si el connect() inicial tuvo éxito hace rato.
export async function isMongoHealthy(): Promise<boolean> {
  try {
    await client.db().command({ ping: 1 }, { timeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}
