import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { MongoServerError } from "mongodb";
import { env } from "../config/env";
import {
  deactivateUser as deactivateUserInMongo,
  findUserByEmail,
  findUserById,
  insertUser,
  listUsers as listUsersFromMongo,
  normalizeEmail,
  PublicUser,
  Role,
  toPublicUser,
  updateUser as updateUserInMongo,
  UserDoc,
} from "../repositories/userRepository";
import { deleteSessionsByUserId } from "../repositories/sessionRepository";

// D7b del plan de Sprint 4: un usuario nuevo se crea con esta contraseña
// temporal fija y conocida (misma que ya usa `seedUsers.ts`) — nunca un
// secreto real, documentado en backend/README.md. No hay flujo de invitación
// por correo (token de un solo uso, expiración): es trabajo real de
// producción que ningún RF de este backlog pide (RF-45 solo dice "Registrar
// nuevos usuarios"). El usuario ya puede cambiarla con POST /auth/change-password
// (Sprint 1) después de su primer login.
const TEMP_PASSWORD = "Contratos123!";

export async function listUsers(): Promise<PublicUser[]> {
  const users = await listUsersFromMongo();
  return users.map(toPublicUser);
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
}

export type CreateUserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; status: number; message: string };

const DUPLICATE_EMAIL_RESULT = {
  ok: false as const,
  status: 409,
  message: "Ya existe un usuario con ese correo.",
};

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  // Chequeo rápido para el caso común (mensaje claro, sin gastar un insert
  // que se sabe de antemano que va a fallar); el índice único de `email`
  // (ensureIndexes, Sprint 1) sigue siendo la garantía real contra una
  // carrera entre dos altas simultáneas con el mismo correo — ver el catch
  // de abajo.
  if (await findUserByEmail(input.email)) {
    return DUPLICATE_EMAIL_RESULT;
  }

  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, env.bcryptRounds);
  // crypto.randomUUID() (mismo criterio que documentId, D11 de Sprint 2): sin
  // coordinación de secuencia, sin colisiones — el formato "U00N" del seed de
  // Sprint 1 era solo para los 4 usuarios de prueba, nunca una convención que
  // el resto del sistema dependa de mantener.
  const user: UserDoc = {
    _id: crypto.randomUUID(),
    name: input.name,
    // Normalizado acá (hallazgo de review), no solo adentro de insertUser:
    // sin esto, la respuesta HTTP mostraba el email tal cual lo tipeó el
    // admin (p. ej. "Foo@Bar.COM") mientras Mongo ya guardaba la versión en
    // minúsculas — inconsistente con lo que de verdad quedó persistido.
    email: normalizeEmail(input.email),
    passwordHash,
    role: input.role,
    status: "Activo",
  };

  try {
    await insertUser(user);
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return DUPLICATE_EMAIL_RESULT;
    }
    throw err;
  }

  return { ok: true, user: toPublicUser(user) };
}

export interface UpdateUserInput {
  name: string;
  email: string;
  role: Role;
}

export type UpdateUserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; status: number; message: string };

export async function updateUser(userId: string, input: UpdateUserInput): Promise<UpdateUserResult> {
  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 404, message: "El usuario no existe." };
  }

  const existing = await findUserByEmail(input.email);
  if (existing && existing._id !== userId) {
    return DUPLICATE_EMAIL_RESULT;
  }

  // Mismo hallazgo de review que createUser: normalizado acá para que la
  // respuesta coincida con lo que updateUserInMongo termina persistiendo.
  const normalizedInput = { ...input, email: normalizeEmail(input.email) };

  try {
    await updateUserInMongo(userId, normalizedInput);
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return DUPLICATE_EMAIL_RESULT;
    }
    throw err;
  }

  return { ok: true, user: toPublicUser({ ...user, ...normalizedInput }) };
}

export type DeactivateUserResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

// RF-47: baja lógica. No hay reactivación (D8 del plan — ningún RF la pide).
export async function deactivateUser(userId: string): Promise<DeactivateUserResult> {
  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 404, message: "El usuario no existe." };
  }

  await deactivateUserInMongo(userId);
  // Hallazgo de review: sin esto, una sesión ya abierta de este usuario
  // seguía con acceso completo hasta que su JWT expirara por su cuenta
  // (requireAuth solo valida que el jti exista, nunca relee `status`).
  await deleteSessionsByUserId(userId);
  return { ok: true };
}
