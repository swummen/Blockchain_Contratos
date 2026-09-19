import nodemailer, { Transporter } from "nodemailer";
import { authConfig } from "../config/auth";

let transporter: Transporter | undefined;

function getTransporter(): Transporter | undefined {
  if (!authConfig.smtp.host) return undefined;
  transporter ??= nodemailer.createTransport({
    host: authConfig.smtp.host,
    port: authConfig.smtp.port,
    auth: authConfig.smtp.user
      ? { user: authConfig.smtp.user, pass: authConfig.smtp.password }
      : undefined,
  });
  return transporter;
}

// D6 del plan: sin SMTP_HOST configurado, el código se loguea a consola en
// vez de fallar — nunca en silencio, para poder probar el flujo completo en
// desarrollo sin credenciales SMTP reales.
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[dev] SMTP no configurado — código OTP para ${to}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: authConfig.smtp.from,
    to,
    subject: "Código de verificación — Contratos",
    text: `Tu código de verificación es ${code}. Vence en ${authConfig.otpTtlMinutes} minutos.`,
  });
}
