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

// Contraseña temporal fija para usuarios nuevos (no hay invitación por correo);
// el usuario la cambia con POST /auth/change-password.
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

// Se devuelve la contraseña temporal para que el Administrador la comunique.
export type CreateUserResult =
  | { ok: true; user: PublicUser; temporaryPassword: string }
  | { ok: false; status: number; message: string };

const DUPLICATE_EMAIL_RESULT = {
  ok: false as const,
  status: 409,
  message: "Ya existe un usuario con ese correo.",
};

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  // Chequeo previo para dar un mensaje claro; la garantía real ante dos altas
  // simultáneas es el índice único de email (ver el catch).
  if (await findUserByEmail(input.email)) {
    return DUPLICATE_EMAIL_RESULT;
  }

  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, env.bcryptRounds);
  // El formato "U00N" es solo de los usuarios de prueba.
  const user: UserDoc = {
    _id: crypto.randomUUID(),
    name: input.name,
    // Normalizado aquí para que la respuesta muestre lo mismo que se guarda.
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

  return { ok: true, user: toPublicUser(user), temporaryPassword: TEMP_PASSWORD };
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

  const normalizedInput = { ...input, email: normalizeEmail(input.email) };

  try {
    await updateUserInMongo(userId, normalizedInput);
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return DUPLICATE_EMAIL_RESULT;
    }
    throw err;
  }

  // El rol va firmado en el JWT y requireAuth no lo relee: si cambia, se
  // cierran sus sesiones para que el próximo login lleve el rol nuevo.
  if (input.role !== user.role) {
    await deleteSessionsByUserId(userId);
  }

  return { ok: true, user: toPublicUser({ ...user, ...normalizedInput }) };
}

export type DeactivateUserResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

// RF-47: baja lógica. No existe la reactivación.
export async function deactivateUser(userId: string): Promise<DeactivateUserResult> {
  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 404, message: "El usuario no existe." };
  }

  await deactivateUserInMongo(userId);
  // requireAuth no relee el estado: se cierran sus sesiones para cortar el acceso ya.
  await deleteSessionsByUserId(userId);
  return { ok: true };
}
