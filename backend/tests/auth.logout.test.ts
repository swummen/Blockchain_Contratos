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
  touchSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return { ...actual, findUserByEmail: jest.fn(), findUserById: jest.fn() };
});

import { deleteSession, findSessionByJti } from "../src/repositories/sessionRepository";
import { createApp } from "../src/server";

const activeSession = {
  _id: "jti-1",
  userId: "U001",
  role: "Empleado" as const,
  expiresAt: new Date(Date.now() + 60_000),
  lastSeenAt: new Date(),
};

function signToken(jti = "jti-1") {
  return jwt.sign({ role: "Empleado" }, authConfig.jwtSecret, {
    subject: "U001",
    jwtid: jti,
    expiresIn: 3600,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /auth/logout", () => {
  it("con sesión válida: borra la sesión y responde 204", async () => {
    (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
    const token = signToken();

    const res = await request(createApp())
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(deleteSession).toHaveBeenCalledWith("jti-1");
  });

  it("sin JWT: 401, no borra nada", async () => {
    const res = await request(createApp()).post("/auth/logout");

    expect(res.status).toBe(401);
    expect(deleteSession).not.toHaveBeenCalled();
  });

  it("el mismo JWT ya no sirve para una ruta protegida después del logout (HU-003 CA-02)", async () => {
    const token = signToken();

    // La sesión existe antes del logout y ya no después.
    (findSessionByJti as jest.Mock)
      .mockResolvedValueOnce(activeSession)
      .mockResolvedValueOnce(null);

    const logoutRes = await request(createApp())
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(logoutRes.status).toBe(204);

    const meRes = await request(createApp())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(401);
  });
});
