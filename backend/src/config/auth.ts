function parsePositiveInt(name: string, raw: string | undefined, fallback: number): number {
  const value = Number(raw ?? fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} inválido: "${raw}". Debe ser un entero positivo.`);
  }
  return value;
}

// Sin valor por defecto: un secreto conocido firmaría los JWT de cualquier

function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} es obligatoria (sin default: es un secreto). Configúrala en backend/.env.`);
  }
  return value;
}

export const authConfig = {
  // El SRS no fija estos valores: 5 minutos y 5 intentos.
  otpTtlMinutes: parsePositiveInt("OTP_TTL_MINUTES", process.env.OTP_TTL_MINUTES, 5),
  otpMaxAttempts: parsePositiveInt("OTP_MAX_ATTEMPTS", process.env.OTP_MAX_ATTEMPTS, 5),
  // El código se envía al correo registrado del usuario.
  smtp: {
    host: process.env.SMTP_HOST,
    port: parsePositiveInt("SMTP_PORT", process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM ?? "no-reply@contratos.local",
  },
  // Único origen permitido por CORS en las rutas de negocio.
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  // jwtExpiresMinutes vence a la vez el JWT y la sesión en Mongo: una sola fuente.
  jwtSecret: requireSecret("JWT_SECRET"),
  jwtExpiresMinutes: parsePositiveInt("JWT_EXPIRES_MINUTES", process.env.JWT_EXPIRES_MINUTES, 60),
  // RNF-07: se aplica el primero que se cumpla, inactividad o vencimiento absoluto.
  sessionInactivityMinutes: parsePositiveInt(
    "SESSION_INACTIVITY_MINUTES",
    process.env.SESSION_INACTIVITY_MINUTES,
    15,
  ),
  // RF-054: bloqueo temporal tras intentos fallidos consecutivos.
  maxLoginAttempts: parsePositiveInt("MAX_LOGIN_ATTEMPTS", process.env.MAX_LOGIN_ATTEMPTS, 5),
  loginLockoutMinutes: parsePositiveInt(
    "LOGIN_LOCKOUT_MINUTES",
    process.env.LOGIN_LOCKOUT_MINUTES,
    15,
  ),
};
