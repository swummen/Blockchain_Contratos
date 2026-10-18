import { Request, Response } from "express";
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
  return { ...actual, findUserByEmail: jest.fn(), findUserById: jest.fn() };
});

import { deleteSession, findSessionByJti } from "../src/repositories/sessionRepository";
import { findUserById } from "../src/repositories/userRepository";
import { requireAuth } from "../src/middlewares/auth";
import { createApp } from "../src/server";

const SEED_USER = {
  _id: "U001",
  name: "María López",
  email: "m.lopez@empresa.com",
  passwordHash: "x",
  role: "Empleado" as const,
  status: "Activo" as const,
};

function signToken(overrides: { role?: string; sub?: string; jti?: string; expiresIn?: number } = {}) {
  const { role = "Empleado", sub = "U001", jti = "jti-1", expiresIn = 3600 } = overrides;
  return jwt.sign({ role }, authConfig.jwtSecret, { subject: sub, jwtid: jti, expiresIn });
}

function fakeRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function fakeReq(authHeader: string | undefined) {
  return { header: () => authHeader, user: undefined } as unknown as Request;
}

const activeSession = {
  _id: "jti-1",
  userId: "U001",
  role: "Empleado" as const,
  expiresAt: new Date(Date.now() + 60_000),
  lastSeenAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("requireAuth(), unidad", () => {
  it("401 sin Authorization header", async () => {
    const req = fakeReq(undefined);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("401 con un JWT con firma inválida", async () => {
    const req = fakeReq("Bearer token-invalido");
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("401 con un JWT vencido", async () => {
    const expired = signToken({ expiresIn: -1 });
    const req = fakeReq(`Bearer ${expired}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("401 con un JWT bien firmado pero sin sub/jti (payload incompleto)", async () => {
    // jwt.sign sin subject/jwtid: firma válida, pero el payload no trae lo
    // que requireAuth necesita, no debería llegar a consultar Mongo.
    const malformed = jwt.sign({ role: "Empleado" }, authConfig.jwtSecret, { expiresIn: 3600 });
    const req = fakeReq(`Bearer ${malformed}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(findSessionByJti).not.toHaveBeenCalled();
  });

  it("401 con un rol fuera del catálogo en el payload (JWT forjado con otro secreto propio, hipotético)", async () => {
    const badRole = jwt.sign({ role: "Superadmin" }, authConfig.jwtSecret, {
      subject: "U001",
      jwtid: "jti-1",
      expiresIn: 3600,
    });
    const req = fakeReq(`Bearer ${badRole}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(findSessionByJti).not.toHaveBeenCalled();
  });

  it("401 con JWT válido pero sin sesión viva (ya cerrada / nunca existió)", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(null);
    const req = fakeReq(`Bearer ${signToken()}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("deja pasar y llena req.user con JWT y sesión válidos", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
    const req = fakeReq(`Bearer ${signToken()}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      sub: "U001",
      role: "Empleado",
      jti: "jti-1",
    });
  });

  it("401 con sesión viva pero inactiva más de 15 minutos (RNF-07), y la borra", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue({
      ...activeSession,
      lastSeenAt: new Date(Date.now() - 16 * 60_000),
    });
    const req = fakeReq(`Bearer ${signToken()}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(deleteSession).toHaveBeenCalledWith("jti-1");
  });

  it("deja pasar una sesión con actividad reciente, justo debajo del límite de inactividad", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue({
      ...activeSession,
      lastSeenAt: new Date(Date.now() - 14 * 60_000),
    });
    const req = fakeReq(`Bearer ${signToken()}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth()(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("403 si el rol del JWT no está en la lista permitida", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
    const req = fakeReq(`Bearer ${signToken({ role: "Empleado" })}`);
    const res = fakeRes();
    const next = jest.fn();

    await requireAuth("Administrador")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("GET /auth/me, ruta protegida real", () => {
  it("200 con el usuario cuando el JWT y la sesión son válidos", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
    (findUserById as jest.Mock).mockResolvedValue(SEED_USER);

    const res = await request(createApp())
      .get("/auth/me")
      .set("Authorization", `Bearer ${signToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: {
        userId: "U001",
        name: "María López",
        email: "m.lopez@empresa.com",
        role: "Empleado",
        status: "Activo",
      },
    });
  });

  it("401 sin Authorization header", async () => {
    const res = await request(createApp()).get("/auth/me");

    expect(res.status).toBe(401);
  });
});
