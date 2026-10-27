import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { authConfig } from "../config/auth";
import { env } from "../config/env";
import { CURRENT_POLICY_VERSION } from "../config/policy";
import { FailedLoginReason, recordFailedLoginAttempt } from "../repositories/loginAttemptRepository";
import {
  deleteOtp,
  findOtpByUserId,
  incrementOtpAttempts,
  upsertOtp,
} from "../repositories/otpRepository";
import {
  createSession,
  deleteSession,
  markSessionPolicyAccepted,
} from "../repositories/sessionRepository";
import {
  findUserByEmail,
  findUserById,
  hasAcceptedCurrentPolicy,
  lockUser,
  normalizeEmail,
  SessionUser,
  recordPolicyAcceptance,
  registerFailedLogin,
  resetFailedLogin,
  toSessionUser,
  updatePasswordHash,
} from "../repositories/userRepository";
import { sendOtpEmail } from "./emailService";

export type LoginResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export type VerifyOtpResult =
  | { ok: true; token: string; user: SessionUser }
  | { ok: false; status: number; message: string };

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export type AcceptPolicyResult =
  | { ok: true; user: SessionUser }
  | { ok: false; status: number; message: string };

const MIN_PASSWORD_LENGTH = 8;

// Si el usuario no existe se compara igual contra este hash, para que el tiempo
// de respuesta no revele qué correos están registrados. Usa el mismo costo que
// los hashes reales: con otro costo, el tiempo volvería a delatarlo.
const DUMMY_HASH = bcrypt.hashSync(
  "no-existe-ningun-usuario-con-este-hash",
  env.bcryptRounds,
);

function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// HU-022 CA-03: un fallo al registrar no debe cambiar la respuesta del inicio de sesión.
function logFailedAttempt(email: string, reason: FailedLoginReason): void {
  recordFailedLoginAttempt(normalizeEmail(email), reason).catch((err) => {
    console.error("No se pudo registrar el intento fallido de inicio de sesión:", err);
  });
}

// RF-054: durante el bloqueo se avisa explícitamente, a diferencia del 401 genérico.
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
    logFailedAttempt(email, "cuenta_bloqueada");
    return { ok: false, status: 423, message: lockedMessage(user.lockedUntil) };
  }

  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // Mismo mensaje para usuario inexistente, contraseña incorrecta o cuenta
  // inactiva: no se revela cuál dato falló (RF-002 CA-02).
  if (!user || !passwordOk || user.status === "Inactivo") {
    logFailedAttempt(
      email,
      !user ? "usuario_inexistente" : !passwordOk ? "contrasena_incorrecta" : "usuario_inactivo",
    );
    // Solo se cuentan intentos de cuentas que existen.
    if (user) {
      const attempts = await registerFailedLogin(user._id);
      if (attempts >= authConfig.maxLoginAttempts) {
        await lockUser(user._id, new Date(Date.now() + authConfig.loginLockoutMinutes * 60_000));
      }
    }
    return { ok: false, status: 401, message: "Credenciales inválidas." };
  }

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

// Una sola respuesta para todos los casos que no deben distinguirse desde afuera.
const CODE_INVALID_OR_EXPIRED: VerifyOtpResult = {
  ok: false,
  status: 400,
  message: "Código inválido o vencido.",
};

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const user = await findUserByEmail(email);
  // Cubre que desactiven al usuario entre el login y la validación del código.
  if (!user || user.status === "Inactivo") {
    return CODE_INVALID_OR_EXPIRED;
  }

  const otp = await findOtpByUserId(user._id);
  if (!otp) {
    return CODE_INVALID_OR_EXPIRED;
  }

  // Agotados los intentos se descarta el código: hay que iniciar sesión de nuevo.
  if (otp.attempts >= authConfig.otpMaxAttempts) {
    await deleteOtp(user._id);
    return {
      ok: false,
      status: 400,
      message: "Demasiados intentos. Vuelve a iniciar sesión para recibir un código nuevo.",
    };
  }

  // El índice TTL borra con hasta ~60 s de retraso: se revisa la fecha igual.
  if (otp.expiresAt.getTime() <= Date.now()) {
    await deleteOtp(user._id);
    return CODE_INVALID_OR_EXPIRED;
  }

  const codeOk = await bcrypt.compare(code, otp.codeHash);
  if (!codeOk) {
    await incrementOtpAttempts(user._id);
    return { ok: false, status: 400, message: "Código incorrecto." };
  }

  // El código es de un solo uso.
  await deleteOtp(user._id);

  const jti = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + authConfig.jwtExpiresMinutes * 60_000);

  await createSession({
    _id: jti,
    userId: user._id,
    role: user.role,
    expiresAt,
    lastSeenAt: now,
    policyAccepted: hasAcceptedCurrentPolicy(user),
  });

  const token = jwt.sign({ role: user.role }, authConfig.jwtSecret, {
    subject: user._id,
    jwtid: jti,
    expiresIn: authConfig.jwtExpiresMinutes * 60,
  });

  return { ok: true, token, user: toSessionUser(user) };
}

// Borra la sesión en Mongo: el mismo JWT deja de servir aunque no haya vencido.
export async function logout(jti: string): Promise<void> {
  await deleteSession(jti);
}

export async function getSessionUserById(userId: string): Promise<SessionUser | null> {
  const user = await findUserById(userId);
  return user ? toSessionUser(user) : null;
}

// RF-055: registra usuario, fecha y hora y versión, y habilita la sesión actual.
// La versión la manda el frontend: si no es la vigente, el usuario aceptó un
// texto viejo y debe ver el nuevo.
export async function acceptPolicy(
  userId: string,
  jti: string,
  version: string,
): Promise<AcceptPolicyResult> {
  if (version !== CURRENT_POLICY_VERSION) {
    return {
      ok: false,
      status: 409,
      message: "La política de datos cambió. Recarga la página para ver la versión vigente.",
    };
  }

  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 401, message: "Sesión inválida o vencida." };
  }

  // Aceptar dos veces la misma versión no duplica el registro.
  if (!hasAcceptedCurrentPolicy(user)) {
    const acceptance = { version, acceptedAt: new Date() };
    await recordPolicyAcceptance(userId, acceptance);
    user.policyAcceptances = [...(user.policyAcceptances ?? []), acceptance];
  }
  await markSessionPolicyAccepted(jti);

  return { ok: true, user: toSessionUser(user) };
}

// RF-52/53: userId debe venir del JWT validado, nunca del body de la petición.
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
