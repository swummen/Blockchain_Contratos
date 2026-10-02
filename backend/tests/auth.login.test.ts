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
  return { ...actual, findUserByEmail: jest.fn() };
});

jest.mock("../src/services/emailService", () => ({
  sendOtpEmail: jest.fn(),
}));

import { upsertOtp } from "../src/repositories/otpRepository";
import { findUserByEmail } from "../src/repositories/userRepository";
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
  });

  it("usuario inexistente: 401 genérico, no revela cuál dato falló", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp()).post("/auth/login").send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Credenciales inválidas." });
    expect(upsertOtp).not.toHaveBeenCalled();
  });

  it("contraseña incorrecta: el mismo 401 genérico que un usuario inexistente", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, passwordHash });

    const res = await request(createApp())
      .post("/auth/login")
      .send({ ...VALID_BODY, password: "otra-cosa" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Credenciales inválidas." });
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
