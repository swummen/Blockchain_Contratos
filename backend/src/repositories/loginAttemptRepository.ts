import { Collection } from "mongodb";
import { getDb } from "./mongoClient";

export type FailedLoginReason =
  | "usuario_inexistente"
  | "contrasena_incorrecta"
  | "usuario_inactivo"
  | "cuenta_bloqueada";

// HU-022 CA-03 / RNF-06. Nunca guarda la contraseña ingresada.
export interface LoginAttemptDoc {
  email: string;
  reason: FailedLoginReason;
  attemptedAt: Date;
}

// Ley 1581 (minimización): los registros se borran solos a los 90 días.
const RETENTION_SECONDS = 90 * 24 * 60 * 60;

function attemptsCollection(): Collection<LoginAttemptDoc> {
  return getDb().collection<LoginAttemptDoc>("login_attempts");
}

export async function ensureIndexes(): Promise<void> {
  await attemptsCollection().createIndex({ attemptedAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });
}

export async function recordFailedLoginAttempt(email: string, reason: FailedLoginReason): Promise<void> {
  await attemptsCollection().insertOne({ email, reason, attemptedAt: new Date() });
}
