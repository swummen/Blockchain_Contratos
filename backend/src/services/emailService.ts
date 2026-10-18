import nodemailer, { Transporter } from "nodemailer";
import { authConfig } from "../config/auth";

let transporter: Transporter | undefined;

function getTransporter(): Transporter | undefined {
  if (!authConfig.smtp.host) return undefined;
  transporter ??= nodemailer.createTransport({
    host: authConfig.smtp.host,
    port: authConfig.smtp.port,
    // 465 usa TLS directo; 587 (Brevo) negocia STARTTLS con secure: false.
    secure: authConfig.smtp.port === 465,
    auth: authConfig.smtp.user
      ? { user: authConfig.smtp.user, pass: authConfig.smtp.password }
      : undefined,
  });
  return transporter;
}

// Sin SMTP_HOST el código se imprime en consola (modo desarrollo). Con SMTP
// configurado nunca se imprime.
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[dev] SMTP no configurado, código OTP para ${to}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: `TrazaDoc <${authConfig.smtp.from}>`,
    to,
    subject: "TrazaDoc: Código de verificación",
    text:
      `Tu código de verificación es ${code}.\n\n` +
      `Vence en ${authConfig.otpTtlMinutes} minutos. ` +
      `Si no intentaste iniciar sesión en TrazaDoc, ignora este correo.`,
  });
}
