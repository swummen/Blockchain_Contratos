import { Collection } from "mongodb";
import { getDb } from "./mongoClient";
import { Role } from "./userRepository";

// _id es el jti del JWT. Que la sesión exista aquí es lo que permite
// invalidar un token antes de que venza.
export interface SessionDoc {
  _id: string;
  userId: string;
  // Solo informativo: el control de acceso usa el rol firmado en el JWT.
  role: Role;
  // Vencimiento absoluto, sin importar la actividad.
  expiresAt: Date;
  // Última actividad, para cerrar por inactividad (RNF-07).
  lastSeenAt: Date;
}

function sessionsCollection(): Collection<SessionDoc> {
  return getDb().collection<SessionDoc>("sessions");
}

// TTL: MongoDB borra solas las sesiones vencidas.
export async function ensureIndexes(): Promise<void> {
  await sessionsCollection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function createSession(session: SessionDoc): Promise<void> {
  await sessionsCollection().insertOne(session);
}

export async function findSessionByJti(jti: string): Promise<SessionDoc | null> {
  return sessionsCollection().findOne({ _id: jti });
}

export async function touchSession(jti: string): Promise<void> {
  await sessionsCollection().updateOne({ _id: jti }, { $set: { lastSeenAt: new Date() } });
}

export async function deleteSession(jti: string): Promise<void> {
  await sessionsCollection().deleteOne({ _id: jti });
}

// Cierra todas las sesiones de un usuario (al desactivarlo o cambiarle el rol).
export async function deleteSessionsByUserId(userId: string): Promise<void> {
  await sessionsCollection().deleteMany({ userId });
}
