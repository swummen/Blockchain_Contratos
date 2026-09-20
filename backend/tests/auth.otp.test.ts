import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

jest.mock("../src/repositories/sessionRepository", () => ({
  ensureIndexes: jest.fn(),
  createSession: jest.fn(),
  findSessionByJti: jest.fn(),
  deleteSession: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return { ...actual, findUserByEmail: jest.fn() };
});

import {
  deleteOtp,
  findOtpByUserId,
  incrementOtpAttempts,
} from "../src/repositories/otpRepository";
import { createSession } from "../src/repositories/sessionRepository";
import { findUserByEmail } from "../src/repositories/userRepository";

const EMAIL = "m.lopez@empresa.com";
const CODE = "482913";

const SEED_USER = {
  _id: "U001",
  name: "María López",
  email: EMAIL,
  passwordHash: "hash-no-usado-en-este-test",
  role: "Empleado" as const,
  status: "Activo" as const,
};

let codeHash: string;

beforeAll(async () => {
  codeHash = await bcrypt.hash(CODE, 4);
});

beforeEach(() => {
  jest.clearAllMocks();
});

function otpDoc(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: SEED_USER._id,
    codeHash,
    attempts: 0,
    selectedRole: "Empleado",
    expiresAt: new Date(Date.now() + 5 * 60_000),
    ...overrides,
  };
}

describe("POST /auth/verify-otp", () => {
  it("código correcto y vigente: 200 con JWT (sub/role/jti/exp) y crea la sesión", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(SEED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue(otpDoc());

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: CODE });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      userId: "U001",
      name: "María López",
      email: EMAIL,
      role: "Empleado",
      status: "Activo",
    });

    const decoded = jwt.decode(res.body.token) as Record<string, unknown>;
    expect(decoded.sub).toBe("U001");
    expect(decoded.role).toBe("Empleado");
    expect(typeof decoded.jti).toBe("string");
    expect(typeof decoded.exp).toBe("number");

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ _id: decoded.jti, userId: "U001", role: "Empleado" }),
    );
    expect(deleteOtp).toHaveBeenCalledWith("U001");
  });

  it("código incorrecto: 400, incrementa intentos, no crea sesión", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(SEED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue(otpDoc());

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: "000000" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Código incorrecto." });
    expect(incrementOtpAttempts).toHaveBeenCalledWith("U001");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("código vencido: 400 genérico, borra el OTP", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(SEED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue(
      otpDoc({ expiresAt: new Date(Date.now() - 1000) }),
    );

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: CODE });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Código inválido o vencido." });
    expect(deleteOtp).toHaveBeenCalledWith("U001");
  });

  it("usuario inexistente: 400 genérico, ni siquiera busca el OTP", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: "no-existe@empresa.com", code: CODE });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Código inválido o vencido." });
    expect(findOtpByUserId).not.toHaveBeenCalled();
  });

  it("usuario desactivado entre el login y la verificación: 400 genérico, no emite sesión", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ ...SEED_USER, status: "Inactivo" });
    (findOtpByUserId as jest.Mock).mockResolvedValue(otpDoc());

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: CODE });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Código inválido o vencido." });
    expect(createSession).not.toHaveBeenCalled();
  });

  it("no hay OTP pendiente (nunca se pidió, o el TTL ya lo limpió): 400 genérico", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(SEED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: CODE });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Código inválido o vencido." });
  });

  it("máximo de intentos agotado: 400, exige loguearse de nuevo, borra el OTP", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(SEED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue(otpDoc({ attempts: 5 }));

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: CODE });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/vuelve a iniciar sesión/i);
    expect(deleteOtp).toHaveBeenCalledWith("U001");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("rol seleccionado no coincide con el rol real del usuario: 403 (HU-002 CA-02)", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(SEED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue(otpDoc({ selectedRole: "Administrador" }));

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: EMAIL, code: CODE });

    expect(res.status).toBe(403);
    expect(deleteOtp).toHaveBeenCalledWith("U001");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("faltan campos: 400", async () => {
    const res = await request(createApp()).post("/auth/verify-otp").send({ email: EMAIL });

    expect(res.status).toBe(400);
    expect(findUserByEmail).not.toHaveBeenCalled();
  });
});
