import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/server";

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn(),
  getDb: jest.fn(),
}));

jest.mock("../src/fabric/gateway", () => ({
  connectFabric: jest.fn(),
  queryChaincode: jest.fn(),
}));

jest.mock("../src/repositories/otpRepository", () => ({
  ensureIndexes: jest.fn(),
  upsertOtp: jest.fn(),
  findOtpByUserId: jest.fn(),
  incrementOtpAttempts: jest.fn(),
  deleteOtp: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return {
    ...actual,
    findUserByEmail: jest.fn(),
    registerFailedLogin: jest.fn(),
    resetFailedLogin: jest.fn(),
    lockUser: jest.fn(),
  };
});

jest.mock("../src/repositories/loginAttemptRepository", () => ({
  ensureIndexes: jest.fn(),
  recordFailedLoginAttempt: jest.fn(),
}));

jest.mock("../src/services/emailService", () => ({
  sendOtpEmail: jest.fn(),
}));

import { recordFailedLoginAttempt } from "../src/repositories/loginAttemptRepository";
import { upsertOtp } from "../src/repositories/otpRepository";
import {
  findUserByEmail,
  lockUser,
  registerFailedLogin,
  resetFailedLogin,
} from "../src/repositories/userRepository";
import { sendOtpEmail } from "../src/services/emailService";

const PASSWORD = "Contratos123!";
// Costo bajo (no env.bcryptRounds real) solo para que los tests corran rápido.
let passwordHash: string;

const VALID_BODY = {
  email: "m.lopez@empresa.com",
  password: PASSWORD,
};

const SEED_USER = {
  _id: "U001",
  name: "María López",
  email: VALID_BODY.email,
  role: "Empleado" as const,
  status: "Activo" as const,
};

beforeAll(async () => {
  passwordHash = await bcrypt.hash(PASSWORD, 4);
});

beforeEach(() => {
  jest.clearAllMocks();
  (registerFailedLogin as jest.Mock).mockResolvedValue(1);
});

describe("POST /auth/login: registro de intentos fallidos (HU-022 CA-03, RNF-06)", () => {
  it.each([
    ["usuario inexistente", null, "wrong", "usuario_inexistente"],
    ["contraseña incorrecta", "activo", "clave-erronea", "contrasena_incorrecta"],
    ["usuario inactivo", "inactivo", PASSWORD, "usuario_inactivo"],
    ["cuenta bloqueada", "bloqueado", PASSWORD, "cuenta_bloqueada"],
  ])("%s: registra correo, fecha y motivo, nunca la contraseña", async (_caso, kind, password, reason) => {
    const user =
      kind === null
        ? null
        : {
            ...SEED_USER,
            passwordHash,
            status: kind === "inactivo" ? "Inactivo" : "Activo",
            lockedUntil: kind === "bloqueado" ? new Date(Date.now() + 60_000) : undefined,
          };
    (findUserByEmail as jest.Mock).mockResolvedValue(user);

    await request(createApp()).post("/auth/login").send({ email: " M.Lopez@Empresa.com ", password });

    expect(recordFailedLoginAttempt).toHaveBeenCalledTimes(1);
    expect(recordFailedLoginAttempt).toHaveBeenCalledWith("m.lopez@empresa.com", reason);
    expect(JSON.stringify((recordFailedLoginAttempt as jest.Mock).mock.calls)).not.toContain(password);
  });

  it("inicio de sesión correcto: no registra un intento fallido", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, passwordHash });

    await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(recordFailedLoginAttempt).not.toHaveBeenCalled();
  });

  it("si falla el registro del intento, el inicio de sesión responde igual", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (recordFailedLoginAttempt as jest.Mock).mockRejectedValue(new Error("mongo caído"));

    const res = await request(createApp()).post("/auth/login").send({ email: VALID_BODY.email, password: "x" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Credenciales inválidas." });
  });
});

describe("POST /auth/login", () => {
  it("credenciales válidas: guarda el OTP, envía el correo y responde 200", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, passwordHash });

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(200);
    expect(upsertOtp).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "U001", attempts: 0 }),
    );
    expect(sendOtpEmail).toHaveBeenCalledWith(
      VALID_BODY.email,
      expect.stringMatching(/^\d{6}$/),
    );
    expect(resetFailedLogin).toHaveBeenCalledWith("U001");
  });

  it("usuario inexistente: 401 genérico, no revela cuál dato falló", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Credenciales inválidas." });
    expect(upsertOtp).not.toHaveBeenCalled();
    // Un correo inexistente no tiene contador de intentos.
    expect(registerFailedLogin).not.toHaveBeenCalled();
  });

  it("contraseña incorrecta: el mismo 401 genérico que un usuario inexistente", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, passwordHash });

    const res = await request(createApp())
      .post("/auth/login")
      .send({ ...VALID_BODY, password: "otra-cosa" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Credenciales inválidas." });
    expect(registerFailedLogin).toHaveBeenCalledWith("U001");
  });

  it("5to intento fallido: bloquea la cuenta 15 minutos (RF-54)", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, passwordHash });
    (registerFailedLogin as jest.Mock).mockResolvedValue(5);

    const res = await request(createApp())
      .post("/auth/login")
      .send({ ...VALID_BODY, password: "otra-cosa" });

    expect(res.status).toBe(401);
    expect(lockUser).toHaveBeenCalledWith("U001", expect.any(Date));
  });

  it("cuenta bloqueada: 423, ni siquiera compara la contraseña ni cuenta el intento", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      ...SEED_USER,
      passwordHash,
      lockedUntil: new Date(Date.now() + 10 * 60_000),
    });

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(423);
    expect(res.body.message).toMatch(/bloqueada/i);
    expect(registerFailedLogin).not.toHaveBeenCalled();
    expect(upsertOtp).not.toHaveBeenCalled();
  });

  it("bloqueo ya vencido: se procesa el login normalmente", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      ...SEED_USER,
      passwordHash,
      lockedUntil: new Date(Date.now() - 1000),
    });

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(200);
  });

  it("usuario desactivado: el mismo 401 genérico, no se envía OTP", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      ...SEED_USER,
      passwordHash,
      status: "Inactivo",
    });

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Credenciales inválidas." });
    expect(upsertOtp).not.toHaveBeenCalled();
    expect(sendOtpEmail).not.toHaveBeenCalled();
  });

  it("faltan campos obligatorios: 400", async () => {
    const res = await request(createApp())
      .post("/auth/login")
      .send({ email: VALID_BODY.email });

    expect(res.status).toBe(400);
    expect(findUserByEmail).not.toHaveBeenCalled();
  });

  it("falla el envío del correo: 502, no un 200 falso", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, passwordHash });
    (sendOtpEmail as jest.Mock).mockRejectedValue(new Error("smtp caído"));

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(502);
  });

  it("preflight OPTIONS responde 204 con el origen configurado", async () => {
    const res = await request(createApp()).options("/auth/login");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("body JSON malformado: 400 con mensaje JSON, no la página de error HTML de Express", async () => {
    const res = await request(createApp())
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send("{esto no es json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "JSON inválido." });
  });
});
