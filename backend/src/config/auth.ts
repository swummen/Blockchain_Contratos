function parsePositiveInt(name: string, raw: string | undefined, fallback: number): number {
  const value = Number(raw ?? fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} inválido: "${raw}". Debe ser un entero positivo.`);
  }
  return value;
}

// Sin default a propósito: es un secreto, no un valor de configuración — un
// default lo dejaría firmando JWTs con la misma clave conocida en cualquier
// instalación que se olvide de setearla.
function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} es obligatoria (sin default: es un secreto). Configúrala en backend/.env.`);
  }
  return value;
}

export const authConfig = {
  // D2 del plan (claude_docs/tasks/plan-sprint1-identity.md): sin valor
  // numérico fijado en las fuentes (SRS/HU), se adoptan estos defaults.
  otpTtlMinutes: parsePositiveInt("OTP_TTL_MINUTES", process.env.OTP_TTL_MINUTES, 5),
  otpMaxAttempts: parsePositiveInt("OTP_MAX_ATTEMPTS", process.env.OTP_MAX_ATTEMPTS, 5),
  // D1 del plan: correo registrado del usuario (no necesariamente corporativo).
  smtp: {
    host: process.env.SMTP_HOST,
    port: parsePositiveInt("SMTP_PORT", process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM ?? "no-reply@contratos.local",
  },
  // D8 del plan: /auth es el primer endpoint de negocio real, su CORS no
  // hereda el wildcard "*" que usan /health y /fabric (diagnóstico).
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  // D4 del plan: JWT de vida corta + registro de sesión en Mongo (T3), para
  // poder invalidarlo de verdad en el logout (T4). Un solo valor en minutos
  // (no un string tipo "60m") a propósito: authService.ts lo usa tanto para
  // el `expiresIn` del JWT como para el `expiresAt` del documento de sesión
  // — de una sola fuente, para que nunca queden desincronizados.
  jwtSecret: requireSecret("JWT_SECRET"),
  jwtExpiresMinutes: parsePositiveInt("JWT_EXPIRES_MINUTES", process.env.JWT_EXPIRES_MINUTES, 60),
};
