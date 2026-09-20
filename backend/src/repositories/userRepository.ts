import { Collection } from "mongodb";
import { getDb } from "./mongoClient";

export type Role = "Empleado" | "Verificador" | "Administrador";
export const VALID_ROLES: Role[] = ["Empleado", "Verificador", "Administrador"];
export type UserStatus = "Activo" | "Inactivo";

// _id es el mismo userId legible (p. ej. "U001") que ya usa el frontend
// (frontend/src/types/domain.ts) — no un ObjectId — para no tener que
// traducir entre dos formatos de id distintos al cablear T6.
export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
}

function usersCollection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>("users");
}

// docs/uml/03-diagrama-mer.puml modela correo como <<unique>>: la colección
// no lo era hasta ahora (solo _id lo es de por sí). Se llama una vez desde
// seedUsers.ts; createIndex es idempotente si el índice ya existe.
export async function ensureIndexes(): Promise<void> {
  await usersCollection().createIndex({ email: 1 }, { unique: true });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return usersCollection().findOne({ email: normalizeEmail(email) });
}

export async function findUserById(userId: string): Promise<UserDoc | null> {
  return usersCollection().findOne({ _id: userId });
}

export async function countUsers(): Promise<number> {
  return usersCollection().countDocuments();
}

// upsert por _id: permite que el seed (T1) sea idempotente sin tener que
// consultar primero si el usuario ya existe.
export async function insertUserIfMissing(user: UserDoc): Promise<void> {
  await usersCollection().updateOne(
    { _id: user._id },
    { $setOnInsert: { ...user, email: normalizeEmail(user.email) } },
    { upsert: true },
  );
}

export async function updatePasswordHash(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await usersCollection().updateOne({ _id: userId }, { $set: { passwordHash } });
}

// Forma pública del usuario (sin passwordHash), con las mismas claves que ya
// usa frontend/src/types/domain.ts — la respuesta de /auth/verify-otp (T3)
// no necesita traducir nada para que el frontend la consuma en T6.
export interface PublicUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}
