import nodemailer, { Transporter } from "nodemailer";
import { authConfig } from "../config/auth";

let transporter: Transporter | undefined;

function getTransporter(): Transporter | undefined {
  if (!authConfig.smtp.host) return undefined;
  transporter ??= nodemailer.createTransport({
    host: authConfig.smtp.host,
    port: authConfig.smtp.port,
    // 465 = TLS implícito; 587 (default, Brevo) = STARTTLS, que nodemailer
    // negocia solo con secure: false.
    secure: authConfig.smtp.port === 465,
    auth: authConfig.smtp.user
      ? { user: authConfig.smtp.user, pass: authConfig.smtp.password }
      : undefined,
  });
  return transporter;
}

// D6 del plan: sin SMTP_HOST configurado, el código se loguea a consola en
// vez de fallar — nunca en silencio, para poder probar el flujo completo en
// desarrollo sin credenciales SMTP reales. Con SMTP configurado (proveedor
// externo, hoy Brevo) el código nunca se loguea.
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[dev] SMTP no configurado — código OTP para ${to}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: `TrazaDoc <${authConfig.smtp.from}>`,
    to,
    subject: "TrazaDoc — Código de verificación",
    text:
      `Tu código de verificación es ${code}.\n\n` +
      `Vence en ${authConfig.otpTtlMinutes} minutos. ` +
      `Si no intentaste iniciar sesión en TrazaDoc, ignora este correo.`,
  });
}
