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
  // RF-54: contador de intentos fallidos consecutivos de login y, si llegó
  // al tope, hasta cuándo queda bloqueada la cuenta. Ausentes en usuarios
  // sembrados antes de este cambio — se tratan como "0 intentos, sin
  // bloqueo" (ver helpers de abajo), no hace falta migrar nada a mano.
  failedLoginAttempts?: number;
  lockedUntil?: Date;
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

// Exportado (Sprint 4 T5, hallazgo de review): los servicios que construyen
// el objeto a devolver en la respuesta HTTP necesitan la misma normalización
// que ya se aplica acá adentro al escribir — si no, un correo con mayúsculas
// queda guardado en minúsculas pero la respuesta sigue mostrando lo que
// escribió el admin, inconsistente con lo que de verdad persiste.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return usersCollection().findOne({ email: normalizeEmail(email) });
}

export async function findUserById(userId: string): Promise<UserDoc | null> {
  return usersCollection().findOne({ _id: userId });
}

// Listados de documentos y trazabilidad (Sprint 4, limitación de T7): el
// ledger y `documents` solo guardan el userId ("U001") — esto lo traduce al
// nombre para mostrar, en una sola consulta por listado. Ids que no existen
// como usuario (p. ej. "smoke-test-user" del smoke test) quedan fuera del
// mapa; el caller decide qué mostrar en ese caso.
export async function findUserNamesByIds(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return new Map();
  const users = await usersCollection()
    .find({ _id: { $in: unique } }, { projection: { name: 1 } })
    .toArray();
  return new Map(users.map((u) => [u._id, u.name]));
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

// RF-54 RN-03: cada intento fallido se cuenta; devuelve el total ya
// incrementado para que authService decida si llegó al tope y hay que
// bloquear. findOneAndUpdate (no updateOne+findOne) para no tener que leer
// dos veces ni dejar una ventana entre incrementar y conocer el valor.
export async function registerFailedLogin(userId: string): Promise<number> {
  const result = await usersCollection().findOneAndUpdate(
    { _id: userId },
    { $inc: { failedLoginAttempts: 1 } },
    { returnDocument: "after" },
  );
  return result?.failedLoginAttempts ?? 0;
}

export async function lockUser(userId: string, until: Date): Promise<void> {
  await usersCollection().updateOne({ _id: userId }, { $set: { lockedUntil: until } });
}

// RN-01 de RF-54: el contador se reinicia tras una autenticación exitosa.
export async function resetFailedLogin(userId: string): Promise<void> {
  await usersCollection().updateOne(
    { _id: userId },
    { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: "" } },
  );
}

// RF-43/44 (Sprint 4 T5): sin límite ni paginación — mismo criterio que
// aceptaría `listDocuments` si el volumen fuera chico, y acá lo es de verdad
// (usuarios de un sistema interno, no documentos que se acumulan con cada
// operación de negocio).
export async function listUsers(): Promise<UserDoc[]> {
  return usersCollection().find().sort({ _id: 1 }).toArray();
}

// RF-45: alta real (a diferencia de `insertUserIfMissing`, que es solo para
// el seed idempotente de Sprint 1 — acá un correo duplicado tiene que fallar
// de verdad, no quedar silenciosamente ignorado).
export async function insertUser(user: UserDoc): Promise<void> {
  await usersCollection().insertOne({ ...user, email: normalizeEmail(user.email) });
}

// RF-46.
export async function updateUser(
  userId: string,
  input: { name: string; email: string; role: Role },
): Promise<void> {
  await usersCollection().updateOne(
    { _id: userId },
    { $set: { ...input, email: normalizeEmail(input.email) } },
  );
}

// RF-47: baja lógica — nunca borra el usuario ni su trazabilidad histórica
// (los documentos que ya registró siguen con su `responsibleUser` intacto).
export async function deactivateUser(userId: string): Promise<void> {
  await usersCollection().updateOne({ _id: userId }, { $set: { status: "Inactivo" } });
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
