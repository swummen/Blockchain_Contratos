// emailService: con SMTP configurado envía por el proveedor (Brevo) y nunca
// loguea el código; sin SMTP_HOST cae al log de desarrollo. También cubre el
// mapeo de SEED_EMAIL del seed (buzon+alias@dominio).
const sendMail = jest.fn().mockResolvedValue({});
const createTransport = jest.fn(() => ({ sendMail }));
jest.mock("nodemailer", () => ({ __esModule: true, default: { createTransport } }));

const smtp = {
  host: undefined as string | undefined,
  port: 587,
  user: "login@smtp-brevo.com",
  password: "key",
  from: "contratosblockchain@gmail.com",
};
jest.mock("../src/config/auth", () => ({ authConfig: { otpTtlMinutes: 5, smtp } }));

import { seedEmail } from "../src/scripts/seedUsers";

function loadService() {
  let mod!: typeof import("../src/services/emailService");
  jest.isolateModules(() => {
    mod = require("../src/services/emailService");
  });
  return mod;
}

describe("sendOtpEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    smtp.host = undefined;
    smtp.port = 587;
  });

  it("sin SMTP_HOST loguea el código y no envía", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await loadService().sendOtpEmail("a@b.com", "123456");
    expect(createTransport).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("123456"));
    warn.mockRestore();
  });

  it("con SMTP envía por el proveedor (587 → STARTTLS) sin loguear el código", async () => {
    smtp.host = "smtp-relay.brevo.com";
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await loadService().sendOtpEmail("x+empleado@gmail.com", "654321");
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp-relay.brevo.com", port: 587, secure: false }),
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "TrazaDoc <contratosblockchain@gmail.com>",
        to: "x+empleado@gmail.com",
        text: expect.stringContaining("654321"),
      }),
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("puerto 465 usa TLS implícito", async () => {
    smtp.host = "smtp.example.com";
    smtp.port = 465;
    await loadService().sendOtpEmail("a@b.com", "111111");
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ secure: true }));
  });
});

describe("seedEmail", () => {
  it("arma buzon+alias@dominio con SEED_EMAIL", () => {
    expect(seedEmail("U003", "p.gomez@empresa.com", "contratosblockchain@gmail.com")).toBe(
      "contratosblockchain+verificador@gmail.com",
    );
  });

  it("sin SEED_EMAIL (o mal formado) conserva el correo ficticio", () => {
    expect(seedEmail("U001", "m.lopez@empresa.com", "")).toBe("m.lopez@empresa.com");
    expect(seedEmail("U001", "m.lopez@empresa.com", "sin-arroba")).toBe("m.lopez@empresa.com");
  });
});
