import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { authConfig } from "../src/config/auth";

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
  touchSession: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return {
    ...actual,
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    updatePasswordHash: jest.fn(),
  };
});

import { findSessionByJti } from "../src/repositories/sessionRepository";
import { findUserById, updatePasswordHash } from "../src/repositories/userRepository";
import { createApp } from "../src/server";

const CURRENT_PASSWORD = "Contratos123!";
const NEW_PASSWORD = "OtraClaveNueva1";

let passwordHash: string;

const activeSession = {
  _id: "jti-1",
  userId: "U001",
  role: "Empleado" as const,
  expiresAt: new Date(Date.now() + 60_000),
  lastSeenAt: new Date(),
};

function seedUser() {
  return {
    _id: "U001",
    name: "María López",
    email: "m.lopez@empresa.com",
    passwordHash,
    role: "Empleado" as const,
    status: "Activo" as const,
  };
}

function token() {
  return jwt.sign({ role: "Empleado" }, authConfig.jwtSecret, {
    subject: "U001",
    jwtid: "jti-1",
    expiresIn: 3600,
  });
}

beforeAll(async () => {
  passwordHash = await bcrypt.hash(CURRENT_PASSWORD, 4);
});

beforeEach(() => {
  jest.clearAllMocks();
  (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
});

describe("POST /auth/change-password", () => {
  it("contraseña actual correcta + nueva válida: 200, actualiza el hash", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());

    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token()}`)
      .send({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    expect(res.status).toBe(200);
    expect(updatePasswordHash).toHaveBeenCalledWith("U001", expect.any(String));
    const [, storedHash] = (updatePasswordHash as jest.Mock).mock.calls[0];
    expect(await bcrypt.compare(NEW_PASSWORD, storedHash)).toBe(true);
  });

  it("sesión válida pero el usuario ya no existe: 401, no cambia nada", async () => {
    (findUserById as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token()}`)
      .send({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Sesión inválida o vencida." });
    expect(updatePasswordHash).not.toHaveBeenCalled();
  });

  it("contraseña actual incorrecta: 400, no cambia nada", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());

    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token()}`)
      .send({ currentPassword: "esta-mal", newPassword: NEW_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "La contraseña actual es incorrecta." });
    expect(updatePasswordHash).not.toHaveBeenCalled();
  });

  it("nueva contraseña igual a la actual: 400, no cambia nada", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());

    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token()}`)
      .send({ currentPassword: CURRENT_PASSWORD, newPassword: CURRENT_PASSWORD });

    expect(res.status).toBe(400);
    expect(updatePasswordHash).not.toHaveBeenCalled();
  });

  it("nueva contraseña demasiado corta: 400, no cambia nada", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());

    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token()}`)
      .send({ currentPassword: CURRENT_PASSWORD, newPassword: "corta" });

    expect(res.status).toBe(400);
    expect(updatePasswordHash).not.toHaveBeenCalled();
  });

  it("sin sesión válida (sin JWT): 401, no llega a tocar el usuario", async () => {
    const res = await request(createApp())
      .post("/auth/change-password")
      .send({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD });

    expect(res.status).toBe(401);
    expect(findUserById).not.toHaveBeenCalled();
  });

  it("faltan campos: 400", async () => {
    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token()}`)
      .send({ currentPassword: CURRENT_PASSWORD });

    expect(res.status).toBe(400);
    expect(findUserById).not.toHaveBeenCalled();
  });
});
