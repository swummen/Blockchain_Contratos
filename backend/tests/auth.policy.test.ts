import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { authConfig } from "../src/config/auth";
import { createApp } from "../src/server";

// HU-023 / RF-055: aceptación de la política de tratamiento de datos (Ley 1581).

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn(),
  getDb: jest.fn(),
}));

jest.mock("../src/fabric/gateway", () => ({
  connectFabric: jest.fn(),
  queryChaincode: jest.fn(),
  submitChaincodeTransaction: jest.fn(),
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
  touchSession: jest.fn().mockResolvedValue(undefined),
  markPolicyAccepted: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return { ...actual, findUserByEmail: jest.fn(), findUserById: jest.fn(), recordPolicyAcceptance: jest.fn() };
});

jest.mock("../src/repositories/documentRepository", () => ({
  listDocuments: jest.fn().mockResolvedValue([]),
}));

import { findOtpByUserId } from "../src/repositories/otpRepository";
import { createSession, findSessionByJti, markPolicyAccepted } from "../src/repositories/sessionRepository";
import { findUserByEmail, findUserById, recordPolicyAcceptance } from "../src/repositories/userRepository";

const EMAIL = "m.lopez@empresa.com";
const CODE = "482913";
const SEED_USER = {
  _id: "U001",
  name: "María López",
  email: EMAIL,
  passwordHash: "x",
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

function session(policyAccepted: boolean) {
  return {
    _id: "jti-1",
    userId: "U001",
    role: "Empleado" as const,
    expiresAt: new Date(Date.now() + 60_000),
    lastSeenAt: new Date(),
    policyAccepted,
  };
}

function token() {
  return jwt.sign({ role: "Empleado" }, authConfig.jwtSecret, { subject: "U001", jwtid: "jti-1", expiresIn: 3600 });
}

async function verify(user: object) {
  (findUserByEmail as jest.Mock).mockResolvedValue(user);
  (findOtpByUserId as jest.Mock).mockResolvedValue({
    _id: "U001",
    codeHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60_000),
  });
  return request(createApp()).post("/auth/verify-otp").send({ email: EMAIL, code: CODE });
}

describe("POST /auth/verify-otp: estado de la política", () => {
  it("primer ingreso (sin aceptación): policyAccepted false en la respuesta y en la sesión", async () => {
    const res = await verify(SEED_USER);

    expect(res.status).toBe(200);
    expect(res.body.policyAccepted).toBe(false);
    expect(res.body.policyVersion).toBe(authConfig.policyVersion);
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ policyAccepted: false }));
  });

  it("ya aceptó la versión vigente: policyAccepted true", async () => {
    const res = await verify({
      ...SEED_USER,
      policyAcceptance: { version: authConfig.policyVersion, acceptedAt: new Date("2026-10-01T10:00:00Z") },
    });

    expect(res.body.policyAccepted).toBe(true);
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ policyAccepted: true }));
  });

  it("aceptó una versión anterior: debe aceptar de nuevo", async () => {
    const res = await verify({ ...SEED_USER, policyAcceptance: { version: "0.9", acceptedAt: new Date() } });

    expect(res.body.policyAccepted).toBe(false);
  });
});

describe("Acceso sin aceptar la política (HU-023 CA-01 y CA-03)", () => {
  it("las rutas de negocio responden 403 con el código POLICY_REQUIRED", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(session(false));

    const res = await request(createApp()).get("/documents").set("Authorization", `Bearer ${token()}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      code: "POLICY_REQUIRED",
      message: "Debes aceptar la política de tratamiento de datos para continuar.",
    });
  });

  it("/auth/me sí responde, e indica que falta aceptar", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(session(false));
    (findUserById as jest.Mock).mockResolvedValue(SEED_USER);

    const res = await request(createApp()).get("/auth/me").set("Authorization", `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.policyAccepted).toBe(false);
  });

  it("con la política aceptada, las rutas de negocio responden normalmente", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(session(true));

    const res = await request(createApp()).get("/documents").set("Authorization", `Bearer ${token()}`);

    expect(res.status).toBe(200);
  });
});

describe("POST /auth/policy/accept (HU-023 CA-02)", () => {
  beforeEach(() => {
    (findSessionByJti as jest.Mock).mockResolvedValue(session(false));
  });

  it("registra usuario, fecha y versión, y habilita la sesión", async () => {
    const res = await request(createApp())
      .post("/auth/policy/accept")
      .set("Authorization", `Bearer ${token()}`)
      .send({ version: authConfig.policyVersion });

    expect(res.status).toBe(200);
    expect(res.body.policyAccepted).toBe(true);
    expect(res.body.version).toBe(authConfig.policyVersion);
    expect(recordPolicyAcceptance).toHaveBeenCalledWith("U001", authConfig.policyVersion, expect.any(Date));
    expect(markPolicyAccepted).toHaveBeenCalledWith("jti-1");
  });

  it("una versión distinta de la vigente: 400 y no registra nada", async () => {
    const res = await request(createApp())
      .post("/auth/policy/accept")
      .set("Authorization", `Bearer ${token()}`)
      .send({ version: "0.1" });

    expect(res.status).toBe(400);
    expect(recordPolicyAcceptance).not.toHaveBeenCalled();
    expect(markPolicyAccepted).not.toHaveBeenCalled();
  });

  it("sin sesión: 401", async () => {
    const res = await request(createApp()).post("/auth/policy/accept").send({ version: authConfig.policyVersion });

    expect(res.status).toBe(401);
  });
});
