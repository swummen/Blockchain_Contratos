import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { authConfig } from "../src/config/auth";
import { CURRENT_POLICY_VERSION } from "../src/config/policy";

// RF-055 / HU-023: aceptación de la política de tratamiento de datos.

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
  touchSession: jest.fn().mockResolvedValue(undefined),
  markSessionPolicyAccepted: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return {
    ...actual,
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    recordPolicyAcceptance: jest.fn(),
  };
});

import { findOtpByUserId } from "../src/repositories/otpRepository";
import {
  createSession,
  deleteSession,
  findSessionByJti,
  markSessionPolicyAccepted,
} from "../src/repositories/sessionRepository";
import {
  findUserByEmail,
  findUserById,
  recordPolicyAcceptance,
} from "../src/repositories/userRepository";
import { requireAuth, requireSession } from "../src/middlewares/auth";
import { createApp } from "../src/server";

const SEED_USER = {
  _id: "U001",
  name: "María López",
  email: "m.lopez@empresa.com",
  passwordHash: "x",
  role: "Empleado" as const,
  status: "Activo" as const,
};

const ACCEPTED_USER = {
  ...SEED_USER,
  policyAcceptances: [{ version: CURRENT_POLICY_VERSION, acceptedAt: new Date("2026-10-01") }],
};

const pendingSession = {
  _id: "jti-1",
  userId: "U001",
  role: "Empleado" as const,
  expiresAt: new Date(Date.now() + 60_000),
  lastSeenAt: new Date(),
  policyAccepted: false,
};

function signToken() {
  return jwt.sign({ role: "Empleado" }, authConfig.jwtSecret, {
    subject: "U001",
    jwtid: "jti-1",
    expiresIn: 3600,
  });
}

function fakeRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function fakeReq() {
  return { header: () => `Bearer ${signToken()}`, user: undefined } as unknown as Request;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("verify-otp guarda en la sesión si la política vigente está aceptada", () => {
  it("usuario que ya aceptó la versión vigente: policyAccepted true", async () => {
    const code = "123456";
    (findUserByEmail as jest.Mock).mockResolvedValue(ACCEPTED_USER);
    (findOtpByUserId as jest.Mock).mockResolvedValue({
      _id: "U001",
      codeHash: await bcrypt.hash(code, 4),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: SEED_USER.email, code });

    expect(res.status).toBe(200);
    expect(res.body.user.policyAccepted).toBe(true);
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ policyAccepted: true }));
  });

  it("aceptación de una versión anterior no cuenta", async () => {
    const code = "123456";
    (findUserByEmail as jest.Mock).mockResolvedValue({
      ...SEED_USER,
      policyAcceptances: [{ version: "0.9", acceptedAt: new Date("2026-01-01") }],
    });
    (findOtpByUserId as jest.Mock).mockResolvedValue({
      _id: "U001",
      codeHash: await bcrypt.hash(code, 4),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await request(createApp())
      .post("/auth/verify-otp")
      .send({ email: SEED_USER.email, code });

    expect(res.body.user.policyAccepted).toBe(false);
  });
});

describe("CA-03: sin aceptar la política no se accede a nada más", () => {
  it("requireAuth responde 403 POLICY_NOT_ACCEPTED", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(pendingSession);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(fakeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "POLICY_NOT_ACCEPTED" }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("requireSession sí deja pasar (pantalla de la política)", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(pendingSession);
    const next = jest.fn();

    await requireSession()(fakeReq(), fakeRes(), next);

    expect(next).toHaveBeenCalled();
  });

  it("una ruta real protegida (cambiar contraseña) responde 403", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(pendingSession);

    const res = await request(createApp())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ currentPassword: "a", newPassword: "b" });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("POLICY_NOT_ACCEPTED");
  });

  it("GET /auth/me y POST /auth/logout siguen disponibles", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(pendingSession);
    (findUserById as jest.Mock).mockResolvedValue(SEED_USER);
    const app = createApp();

    const me = await request(app).get("/auth/me").set("Authorization", `Bearer ${signToken()}`);
    expect(me.status).toBe(200);
    expect(me.body.user.policyAccepted).toBe(false);

    const out = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${signToken()}`);
    expect(out.status).toBe(204);
    expect(deleteSession).toHaveBeenCalledWith("jti-1");
  });
});

describe("POST /auth/accept-policy", () => {
  beforeEach(() => {
    (findSessionByJti as jest.Mock).mockResolvedValue(pendingSession);
  });

  it("CA-02: registra usuario, fecha y hora y versión, y habilita la sesión", async () => {
    (findUserById as jest.Mock).mockResolvedValue({ ...SEED_USER });

    const res = await request(createApp())
      .post("/auth/accept-policy")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ version: CURRENT_POLICY_VERSION });

    expect(res.status).toBe(200);
    expect(res.body.user.policyAccepted).toBe(true);
    expect(recordPolicyAcceptance).toHaveBeenCalledWith("U001", {
      version: CURRENT_POLICY_VERSION,
      acceptedAt: expect.any(Date),
    });
    expect(markSessionPolicyAccepted).toHaveBeenCalledWith("jti-1");
  });

  it("si ya estaba aceptada no duplica el registro", async () => {
    (findUserById as jest.Mock).mockResolvedValue(ACCEPTED_USER);

    const res = await request(createApp())
      .post("/auth/accept-policy")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ version: CURRENT_POLICY_VERSION });

    expect(res.status).toBe(200);
    expect(recordPolicyAcceptance).not.toHaveBeenCalled();
    expect(markSessionPolicyAccepted).toHaveBeenCalledWith("jti-1");
  });

  it("409 si la versión aceptada no es la vigente", async () => {
    const res = await request(createApp())
      .post("/auth/accept-policy")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ version: "0.9" });

    expect(res.status).toBe(409);
    expect(recordPolicyAcceptance).not.toHaveBeenCalled();
    expect(markSessionPolicyAccepted).not.toHaveBeenCalled();
  });

  it("400 sin versión", async () => {
    const res = await request(createApp())
      .post("/auth/accept-policy")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("401 sin sesión", async () => {
    const res = await request(createApp())
      .post("/auth/accept-policy")
      .send({ version: CURRENT_POLICY_VERSION });

    expect(res.status).toBe(401);
  });
});
