import { Collection } from "mongodb";
import { CURRENT_POLICY_VERSION } from "../config/policy";
import { getDb } from "./mongoClient";

export type Role = "Empleado" | "Verificador" | "Administrador";
export const VALID_ROLES: Role[] = ["Empleado", "Verificador", "Administrador"];
export type UserStatus = "Activo" | "Inactivo";

// _id es el userId que usa el frontend (string, no ObjectId).
export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  // RF-054. Si faltan se interpretan como 0 intentos y sin bloqueo.
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  // RF-055: cada aceptación de la política (usuario = este documento, fecha y
  // hora, versión). Se acumulan para conservar la evidencia de versiones anteriores.
  policyAcceptances?: PolicyAcceptance[];
}

export interface PolicyAcceptance {
  version: string;
  acceptedAt: Date;
}

export function hasAcceptedCurrentPolicy(user: UserDoc): boolean {
  return (user.policyAcceptances ?? []).some((a) => a.version === CURRENT_POLICY_VERSION);
}

function usersCollection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>("users");
}

// Correo único. Idempotente: lo llaman server.ts al arrancar y seedUsers.ts.
export async function ensureIndexes(): Promise<void> {
  await usersCollection().createIndex({ email: 1 }, { unique: true });
}

// Exportada para que los servicios respondan el correo igual que se guarda.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return usersCollection().findOne({ email: normalizeEmail(email) });
}

export async function findUserById(userId: string): Promise<UserDoc | null> {
  return usersCollection().findOne({ _id: userId });
}

// userId → nombre en una sola consulta. Los ids que no son usuarios (por
// ejemplo el del smoke test) no aparecen en el mapa.
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

// Upsert por _id: el seed se puede correr varias veces sin duplicar.
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

// Devuelve el total ya incrementado, en una sola operación atómica.
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

export async function resetFailedLogin(userId: string): Promise<void> {
  await usersCollection().updateOne(
    { _id: userId },
    { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: "" } },
  );
}

// Sin paginación: los usuarios de un sistema interno son pocos.
export async function listUsers(): Promise<UserDoc[]> {
  return usersCollection().find().sort({ _id: 1 }).toArray();
}

// A diferencia de insertUserIfMissing, un correo duplicado lanza error.
export async function insertUser(user: UserDoc): Promise<void> {
  await usersCollection().insertOne({ ...user, email: normalizeEmail(user.email) });
}

export async function updateUser(
  userId: string,
  input: { name: string; email: string; role: Role },
): Promise<void> {
  await usersCollection().updateOne(
    { _id: userId },
    { $set: { ...input, email: normalizeEmail(input.email) } },
  );
}

export async function recordPolicyAcceptance(
  userId: string,
  acceptance: PolicyAcceptance,
): Promise<void> {
  await usersCollection().updateOne({ _id: userId }, { $push: { policyAcceptances: acceptance } });
}

// RF-47: baja lógica; el usuario y su trazabilidad se conservan.
export async function deactivateUser(userId: string): Promise<void> {
  await usersCollection().updateOne({ _id: userId }, { $set: { status: "Inactivo" } });
}

// Usuario sin passwordHash. Mismas claves que frontend/src/types/domain.ts.
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

// Usuario de la propia sesión (OTP, /auth/me). RF-055: si policyAccepted es
// false, el frontend muestra la política antes del panel.
export interface SessionUser extends PublicUser {
  policyAccepted: boolean;
}

export function toSessionUser(user: UserDoc): SessionUser {
  return { ...toPublicUser(user), policyAccepted: hasAcceptedCurrentPolicy(user) };
}
