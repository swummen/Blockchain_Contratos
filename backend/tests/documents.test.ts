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
}));

jest.mock("../src/repositories/documentRepository", () => ({
  insertDocument: jest.fn(),
}));

import { submitChaincodeTransaction } from "../src/fabric/gateway";
import { insertDocument } from "../src/repositories/documentRepository";
import { findSessionByJti } from "../src/repositories/sessionRepository";
import { createApp } from "../src/server";

const activeSession = {
  _id: "jti-1",
  userId: "U001",
  role: "Empleado" as const,
  expiresAt: new Date(Date.now() + 60_000),
};

function token(role = "Empleado") {
  return jwt.sign({ role }, authConfig.jwtSecret, {
    subject: "U001",
    jwtid: "jti-1",
    expiresIn: 3600,
  });
}

const PDF_BUFFER = Buffer.from("%PDF-1.4\n%some pdf content");
const NOT_PDF_BUFFER = Buffer.from("esto no es un pdf");

beforeEach(() => {
  jest.clearAllMocks();
  (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
});

describe("POST /documents", () => {
  it("PDF válido: 201 con documentId, registra en el ledger y en Mongo", async () => {
    (submitChaincodeTransaction as jest.Mock).mockResolvedValue(
      '{"Action":"registro","TxID":"tx1"}',
    );

    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(201);
    expect(res.body.documentId).toEqual(expect.any(String));

    expect(submitChaincodeTransaction).toHaveBeenCalledWith(
      "RegisterDocument",
      res.body.documentId,
      expect.stringMatching(/^[a-f0-9]{64}$/),
      "U001",
    );
    expect(insertDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: res.body.documentId,
        name: "contrato.pdf",
        responsibleUser: "U001",
        status: "Pendiente",
      }),
    );
  });

  it("mismo contenido siempre da el mismo hash (HU-006-CA-02)", async () => {
    (submitChaincodeTransaction as jest.Mock).mockResolvedValue("{}");

    await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", PDF_BUFFER, "a.pdf");
    await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", PDF_BUFFER, "b.pdf");

    // Args: (fcn, documentId, hash, user) — el hash es el tercer argumento.
    const [, , hash1] = (submitChaincodeTransaction as jest.Mock).mock.calls[0];
    const [, , hash2] = (submitChaincodeTransaction as jest.Mock).mock.calls[1];
    expect(hash1).toBe(hash2);
  });

  it("sin JWT: 401, no llega a validar el archivo", async () => {
    const res = await request(createApp())
      .post("/documents")
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(401);
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
  });

  it("rol distinto de Empleado: 403", async () => {
    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(403);
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
  });

  it("sin archivo adjunto: 400", async () => {
    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`);

    expect(res.status).toBe(400);
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
  });

  it("archivo que no es un PDF de verdad (firma inválida): 400, no registra nada", async () => {
    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", NOT_PDF_BUFFER, "falso.pdf");

    expect(res.status).toBe(400);
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
  });

  it("archivo más grande que el límite: 400", async () => {
    const tooBig = Buffer.concat([PDF_BUFFER, Buffer.alloc(20 * 1024 * 1024)]);

    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", tooBig, "grande.pdf");

    expect(res.status).toBe(400);
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
  }, 15000);

  it("falla el registro en la blockchain: 502, nunca guarda en Mongo ni responde éxito (HU-007-CA-02)", async () => {
    (submitChaincodeTransaction as jest.Mock).mockRejectedValue(new Error("orderer no disponible"));

    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(502);
    expect(insertDocument).not.toHaveBeenCalled();
  });

  it("el registro en el ledger tiene éxito pero Mongo falla después: 500 (inconsistencia registrada, no 200 falso)", async () => {
    (submitChaincodeTransaction as jest.Mock).mockResolvedValue("{}");
    (insertDocument as jest.Mock).mockRejectedValue(new Error("Mongo caído"));

    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(500);
  });
});
