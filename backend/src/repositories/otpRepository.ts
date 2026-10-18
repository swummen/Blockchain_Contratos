import { Collection } from "mongodb";
import { getDb } from "./mongoClient";

// _id es el userId: un solo código activo por usuario.
export interface OtpDoc {
  _id: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
}

function otpCollection(): Collection<OtpDoc> {
  return getDb().collection<OtpDoc>("otp_codes");
}

// TTL: MongoDB borra solos los códigos vencidos.
export async function ensureIndexes(): Promise<void> {
  await otpCollection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

// replaceOne reemplaza todo el documento: un login nuevo reinicia los intentos.
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
