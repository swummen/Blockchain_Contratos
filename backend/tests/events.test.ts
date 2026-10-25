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
}));

jest.mock("../src/repositories/documentRepository", () => ({
  insertDocument: jest.fn(),
  findDocumentById: jest.fn(),
  updateDocumentStatus: jest.fn(),
  listDocuments: jest.fn(),
  countDocumentsByStatus: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => ({
  ...jest.requireActual("../src/repositories/userRepository"),
  findUserNamesByIds: jest.fn(),
}));

import { queryChaincode } from "../src/fabric/gateway";
import { findSessionByJti } from "../src/repositories/sessionRepository";
import { findUserNamesByIds } from "../src/repositories/userRepository";
import { createApp } from "../src/server";

const activeSession = {
  _id: "jti-1",
  userId: "U001",
  role: "Empleado" as const,
  expiresAt: new Date(Date.now() + 60_000),
  lastSeenAt: new Date(),
};

function token(role = "Verificador") {
  return jwt.sign({ role }, authConfig.jwtSecret, {
    subject: "U001",
    jwtid: "jti-1",
    expiresIn: 3600,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
  (findUserNamesByIds as jest.Mock).mockResolvedValue(new Map([["U001", "María López"]]));
});

describe("GET /events", () => {
  it("Verificador: 200, eventos de varios documentos ordenados por fecha", async () => {
    (queryChaincode as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { Action: "registro", DocumentID: "doc2", Timestamp: "2026-10-02T00:00:00Z", TxID: "tx2", User: "U001" },
        { Action: "registro", DocumentID: "doc1", Timestamp: "2026-10-01T00:00:00Z", TxID: "tx1", User: "U001" },
      ]),
    );

    const res = await request(createApp()).get("/events").set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { documentId: "doc1", action: "registro", user: "U001", userName: "María López", txId: "tx1", timestamp: "2026-10-01T00:00:00Z" },
      { documentId: "doc2", action: "registro", user: "U001", userName: "María López", txId: "tx2", timestamp: "2026-10-02T00:00:00Z" },
    ]);
    expect(queryChaincode).toHaveBeenCalledWith("GetAllEvents");
  });

  it("usuario del evento que no existe en Mongo (p. ej. el smoke test): userName cae al userId", async () => {
    (queryChaincode as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { Action: "registro", DocumentID: "doc9", Timestamp: "2026-10-01T00:00:00Z", TxID: "tx9", User: "smoke-test-user" },
      ]),
    );

    const res = await request(createApp()).get("/events").set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body[0].userName).toBe("smoke-test-user");
  });

  it("Administrador: 200, mismo nivel de detalle que el Verificador (HU-020-CA-02)", async () => {
    (queryChaincode as jest.Mock).mockResolvedValue("[]");

    const res = await request(createApp()).get("/events").set("Authorization", `Bearer ${token("Administrador")}`);

    expect(res.status).toBe(200);
  });

  it("Empleado: 403", async () => {
    const res = await request(createApp()).get("/events").set("Authorization", `Bearer ${token("Empleado")}`);

    expect(res.status).toBe(403);
    expect(queryChaincode).not.toHaveBeenCalled();
  });

  it("falla la consulta al chaincode: 502", async () => {
    (queryChaincode as jest.Mock).mockRejectedValue(new Error("peer no disponible"));

    const res = await request(createApp()).get("/events").set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ message: "No se pudo consultar la trazabilidad. Intenta de nuevo." });
  });

  it.each([
    [14, "UNAVAILABLE"],
    [4, "DEADLINE_EXCEEDED"],
  ])("la red Fabric no responde (gRPC %i %s): 502 con mensaje claro", async (code, name) => {
    (queryChaincode as jest.Mock).mockRejectedValue(
      Object.assign(new Error(`${code} ${name}: peer apagado`), { code }),
    );

    const res = await request(createApp()).get("/events").set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({
      message: "La red blockchain no está disponible en este momento. Intenta de nuevo en unos minutos.",
    });
  });

  it("sin JWT: 401, no llega a consultar el chaincode", async () => {
    const res = await request(createApp()).get("/events");

    expect(res.status).toBe(401);
    expect(queryChaincode).not.toHaveBeenCalled();
  });
});
