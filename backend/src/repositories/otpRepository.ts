import { Collection } from "mongodb";
import { getDb } from "./mongoClient";
import { Role } from "./userRepository";

// _id es el userId (un solo OTP activo por usuario a la vez): un login nuevo
// reemplaza cualquier código pendiente anterior en vez de acumular varios.
export interface OtpDoc {
  _id: string;
  codeHash: string;
  attempts: number;
  // Rol seleccionado en el paso 1 (login): se valida contra el rol real del
  // usuario en la verificación (T3, HU-002 CA-02) sin que el cliente tenga
  // que reenviarlo.
  selectedRole: Role;
  expiresAt: Date;
}

function otpCollection(): Collection<OtpDoc> {
  return getDb().collection<OtpDoc>("otp_codes");
}

// Índice TTL (D5 del plan): Mongo borra el documento solo al llegar
// expiresAt, sin necesidad de un cron de limpieza a mano.
export async function ensureIndexes(): Promise<void> {
  await otpCollection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

// replaceOne (no updateOne+$set) a propósito: reemplaza el documento entero,
// así que reintentar el login reinicia también el contador de intentos.
export async function upsertOtp(otp: OtpDoc): Promise<void> {
  await otpCollection().replaceOne({ _id: otp._id }, otp, { upsert: true });
}

export async function findOtpByUserId(userId: string): Promise<OtpDoc | null> {
  return otpCollection().findOne({ _id: userId });
}

export async function incrementOtpAttempts(userId: string): Promise<void> {
  await otpCollection().updateOne({ _id: userId }, { $inc: { attempts: 1 } });
}

export async function deleteOtp(userId: string): Promise<void> {
  await otpCollection().deleteOne({ _id: userId });
}
