import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { authConfig } from "../config/auth";
import { env } from "../config/env";
import {
  deleteOtp,
  findOtpByUserId,
  incrementOtpAttempts,
  upsertOtp,
} from "../repositories/otpRepository";
import { createSession, deleteSession } from "../repositories/sessionRepository";
import {
  findUserByEmail,
  findUserById,
  lockUser,
  PublicUser,
  registerFailedLogin,
  resetFailedLogin,
  toPublicUser,
  updatePasswordHash,
} from "../repositories/userRepository";
import { sendOtpEmail } from "./emailService";

export type LoginResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export type VerifyOtpResult =
  | { ok: true; token: string; user: PublicUser }
  | { ok: false; status: number; message: string };

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

const MIN_PASSWORD_LENGTH = 8;

// Hash fijo contra el que comparar cuando el usuario no existe: sin esto,
// bcrypt.compare no corre y la respuesta vuelve más rápido que cuando sí
// corre (usuario existe, contraseña incorrecta), una diferencia de tiempo
// medible que le confirmaría a un atacante si un email está registrado.
// Con el mismo costo que env.bcryptRounds (no un literal aparte): bcrypt.compare
// tarda según el costo embebido en el hash contra el que compara, así que un
// literal fijo reabriría el mismo canal de tiempo en cuanto BCRYPT_ROUNDS
// cambie del default.
const DUMMY_HASH = bcrypt.hashSync(
  "no-existe-ningun-usuario-con-este-hash",
  env.bcryptRounds,
);

function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// RF-54 RN-02: durante el bloqueo no se aceptan intentos aunque las
// credenciales sean correctas, por eso el mensaje es distinto al 401
// genérico de abajo (acá sí es intencional avisarle al usuario del
// bloqueo, tal como pide la ficha de RF-54).
function lockedMessage(lockedUntil: Date): string {
  const minutesLeft = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60_000));
  return `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto(s).`;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const user = await findUserByEmail(email);

  if (user?.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return { ok: false, status: 423, message: lockedMessage(user.lockedUntil) };
  }

  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // RF-002 CA-02: mismo mensaje genérico sin importar cuál dato falló
  // (usuario inexistente, contraseña incorrecta, o usuario desactivado, 
  // RF-47/HU-018: la baja lógica no debe distinguirse de un login inválido).
  if (!user || !passwordOk || user.status === "Inactivo") {
    // RF-54: solo cuenta para el bloqueo si la cuenta existe de verdad (RN:
    // "el usuario tiene una cuenta registrada"), un email inexistente no
    // tiene ningún contador que incrementar.
    if (user) {
      const attempts = await registerFailedLogin(user._id);
      if (attempts >= authConfig.maxLoginAttempts) {
        await lockUser(user._id, new Date(Date.now() + authConfig.loginLockoutMinutes * 60_000));
      }
    }
    return { ok: false, status: 401, message: "Credenciales inválidas." };
  }

  // RN-01 de RF-54: una autenticación exitosa reinicia el contador.
  await resetFailedLogin(user._id);

  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, env.bcryptRounds);
  const expiresAt = new Date(Date.now() + authConfig.otpTtlMinutes * 60_000);

  await upsertOtp({
    _id: user._id,
    codeHash,
    attempts: 0,
    expiresAt,
  });

  try {
    await sendOtpEmail(user.email, code);
  } catch (err) {
    console.error("No se pudo enviar el correo de OTP:", err);
    return {
      ok: false,
      status: 502,
      message: "No se pudo enviar el código de verificación. Intenta de nuevo.",
    };
  }

  return { ok: true };
}

// Mismo mensaje/status para "usuario inexistente" y "no hay OTP pendiente"
// (código ya vencido y limpiado por el TTL de Mongo, o nunca se pidió): no
// hay que poder distinguir por qué desde afuera.
const CODE_INVALID_OR_EXPIRED: VerifyOtpResult = {
  ok: false,
  status: 400,
  message: "Código inválido o vencido.",
};

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const user = await findUserByEmail(email);
  // Mismo chequeo que login() (RF-47): si desactivaron al usuario entre el
  // paso 1 y este paso 2, no debería terminar de emitirle una sesión válida.
  if (!user || user.status === "Inactivo") {
    return CODE_INVALID_OR_EXPIRED;
  }

  const otp = await findOtpByUserId(user._id);
  if (!otp) {
    return CODE_INVALID_OR_EXPIRED;
  }

  // RN-02 (docs/md/Requisitos_...md:291): agotados los intentos, se bloquea
  // el proceso, acá eso significa exigir un login nuevo, no solo permitir
  // reintentar contra el mismo código indefinidamente.
  if (otp.attempts >= authConfig.otpMaxAttempts) {
    await deleteOtp(user._id);
    return {
      ok: false,
      status: 400,
      message: "Demasiados intentos. Vuelve a iniciar sesión para recibir un código nuevo.",
    };
  }

  // Defensa en profundidad: el índice TTL de Mongo no borra el documento en
  // el instante exacto en que expira (corre en segundo plano, ~cada 60s), así
  // que igual hay que chequear expiresAt acá.
  if (otp.expiresAt.getTime() <= Date.now()) {
    await deleteOtp(user._id);
    return CODE_INVALID_OR_EXPIRED;
  }

  const codeOk = await bcrypt.compare(code, otp.codeHash);
  if (!codeOk) {
    await incrementOtpAttempts(user._id);
    return { ok: false, status: 400, message: "Código incorrecto." };
  }

  // RN-01: un token solo se usa una vez, se consume el código apenas se
  // confirma que es correcto.
  await deleteOtp(user._id);

  const jti = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + authConfig.jwtExpiresMinutes * 60_000);

  await createSession({ _id: jti, userId: user._id, role: user.role, expiresAt, lastSeenAt: now });

  const token = jwt.sign({ role: user.role }, authConfig.jwtSecret, {
    subject: user._id,
    jwtid: jti,
    expiresIn: authConfig.jwtExpiresMinutes * 60,
  });

  return { ok: true, token, user: toPublicUser(user) };
}

// Invalidación real (D4): borra el documento de sesión, no solo un gesto del
// lado del cliente, cualquier request posterior con el mismo JWT falla en
// requireAuth() porque su jti ya no existe en Mongo.
export async function logout(jti: string): Promise<void> {
  await deleteSession(jti);
}

export async function getPublicUserById(userId: string): Promise<PublicUser | null> {
  const user = await findUserById(userId);
  return user ? toPublicUser(user) : null;
}

// RF-52/53: requiere la contraseña actual y valida que sea el usuario
// autenticado el que actúa, el caller pasa userId desde req.user.sub (el
// JWT ya validado por requireAuth()), nunca un id que venga del body.
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 401, message: "Sesión inválida o vencida." };
  }

  const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!currentOk) {
    return { ok: false, status: 400, message: "La contraseña actual es incorrecta." };
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (newPassword === currentPassword) {
    return {
      ok: false,
      status: 400,
      message: "La nueva contraseña debe ser diferente a la actual.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, env.bcryptRounds);
  await updatePasswordHash(userId, passwordHash);

  return { ok: true };
}
