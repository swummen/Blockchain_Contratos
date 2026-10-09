import crypto from "node:crypto";
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
  findDocumentById: jest.fn(),
  findPendingDuplicate: jest.fn(),
  updateDocumentStatus: jest.fn(),
  listDocuments: jest.fn(),
  countDocumentsByStatus: jest.fn(),
}));

import { queryChaincode, submitChaincodeTransaction } from "../src/fabric/gateway";
import {
  countDocumentsByStatus,
  findDocumentById,
  findPendingDuplicate,
  insertDocument,
  listDocuments,
  updateDocumentStatus,
} from "../src/repositories/documentRepository";
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
  (findPendingDuplicate as jest.Mock).mockResolvedValue(null);
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

  it("ya existe un documento igual pendiente del mismo empleado: 409, no llega a la blockchain", async () => {
    (findPendingDuplicate as jest.Mock).mockResolvedValue({
      _id: "doc-ya-pendiente",
      status: "Pendiente",
    });

    const res = await request(createApp())
      .post("/documents")
      .set("Authorization", `Bearer ${token()}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("doc-ya-pendiente");
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
    expect(insertDocument).not.toHaveBeenCalled();
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

const FULL_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MASKED_HASH = `e3b0c442${"•".repeat(20)}7852b855`;

describe("GET /documents/:id", () => {
  const registeredAt = new Date("2026-10-01T10:00:00.000Z");

  beforeEach(() => {
    (queryChaincode as jest.Mock).mockResolvedValue(
      JSON.stringify({ DocumentID: "doc1", Sha256Hex: FULL_HASH, Status: "Pendiente" }),
    );
    (findDocumentById as jest.Mock).mockResolvedValue({
      _id: "doc1",
      name: "contrato.pdf",
      responsibleUser: "U001",
      registeredAt,
      hash: FULL_HASH,
      status: "Pendiente",
    });
  });

  it("Verificador: 200 con el hash completo", async () => {
    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      documentId: "doc1",
      name: "contrato.pdf",
      responsibleUser: "U001",
      registeredAt: registeredAt.toISOString(),
      hash: FULL_HASH,
      status: "Pendiente",
    });
    expect(queryChaincode).toHaveBeenCalledWith("GetDocument", "doc1");
  });

  it("Administrador: 200 con el hash completo", async () => {
    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Administrador")}`);

    expect(res.status).toBe(200);
    expect(res.body.hash).toBe(FULL_HASH);
  });

  it("Empleado: 200 con el hash enmascarado (RF-27/RNF-08)", async () => {
    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Empleado")}`);

    expect(res.status).toBe(200);
    expect(res.body.hash).toBe(MASKED_HASH);
  });

  it("documento inexistente: 404 (HU-010-CA-02)", async () => {
    // Forma real de un GatewayError cuando el chaincode rechaza la propuesta
    // (ver gatewayerror.d.ts): el mensaje real vive en .details[0].message,
    // no en .message (ese es un texto gRPC genérico) — mismo hallazgo de T3
    // de Sprint 2.
    const chaincodeError = Object.assign(new Error("endorsement failure"), {
      details: [{ message: "document doc1 not found" }],
    });
    (queryChaincode as jest.Mock).mockRejectedValue(chaincodeError);

    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(404);
  });

  it("error de transporte/config sin .details, aunque mencione 'not found': 502, no 404", async () => {
    // Un timeout o un canal/chaincode mal configurado nunca trae .details
    // poblado (eso solo pasa con una respuesta real del peer) — este caso
    // prueba que el chequeo de 404 no se deja engañar por una coincidencia
    // de texto en un error que en realidad es de infraestructura.
    (queryChaincode as jest.Mock).mockRejectedValue(
      new Error("channel 'foo' not found: deadline exceeded"),
    );

    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(502);
  });

  it("falla la consulta al chaincode por otro motivo: 502", async () => {
    (queryChaincode as jest.Mock).mockRejectedValue(new Error("peer no disponible"));

    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(502);
  });

  it("sin JWT: 401, no llega a consultar el chaincode", async () => {
    const res = await request(createApp()).get("/documents/doc1");

    expect(res.status).toBe(401);
    expect(queryChaincode).not.toHaveBeenCalled();
  });

  it("el documento existe en el ledger pero no en Mongo: 200 igual, con metadata ausente", async () => {
    (findDocumentById as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp())
      .get("/documents/doc1")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body.hash).toBe(FULL_HASH);
    expect(res.body.name).toBeUndefined();
  });
});

describe("POST /documents/:id/verifications", () => {
  const registeredHash = crypto.createHash("sha256").update(PDF_BUFFER).digest("hex");
  const differentFile = Buffer.from("%PDF-1.4\n%contenido distinto");

  beforeEach(() => {
    (queryChaincode as jest.Mock).mockResolvedValue(
      JSON.stringify({ DocumentID: "doc1", Sha256Hex: registeredHash, Status: "Pendiente" }),
    );
    (submitChaincodeTransaction as jest.Mock).mockResolvedValue(
      '{"Action":"verificacion","TxID":"tx-verif-1"}',
    );
  });

  it("huellas coinciden: 200, Verificado, registra en el ledger y actualiza Mongo", async () => {
    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "Verificado",
      matches: true,
      registeredHash,
      computedHash: registeredHash,
    });
    expect(submitChaincodeTransaction).toHaveBeenCalledWith(
      "RecordVerification",
      "doc1",
      "confirmada",
      "U001",
    );
    expect(updateDocumentStatus).toHaveBeenCalledWith("doc1", "Verificado");
  });

  it("huellas distintas: 200, Alterado (HU-013-CA-02)", async () => {
    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", differentFile, "otro.pdf");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Alterado");
    expect(res.body.matches).toBe(false);
    expect(res.body.registeredHash).toBe(registeredHash);
    expect(res.body.computedHash).not.toBe(registeredHash);
    expect(submitChaincodeTransaction).toHaveBeenCalledWith(
      "RecordVerification",
      "doc1",
      "comprometida",
      "U001",
    );
    expect(updateDocumentStatus).toHaveBeenCalledWith("doc1", "Alterado");
  });

  it("archivo que no es un PDF de verdad: 400, no consulta el ledger", async () => {
    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", NOT_PDF_BUFFER, "falso.pdf");

    expect(res.status).toBe(400);
    expect(queryChaincode).not.toHaveBeenCalled();
  });

  it("documento inexistente: 404, no llama a RecordVerification", async () => {
    const chaincodeError = Object.assign(new Error("endorsement failure"), {
      details: [{ message: "document doc1 not found" }],
    });
    (queryChaincode as jest.Mock).mockRejectedValue(chaincodeError);

    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(404);
    expect(submitChaincodeTransaction).not.toHaveBeenCalled();
  });

  it("rol distinto de Verificador: 403", async () => {
    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Empleado")}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(403);
    expect(queryChaincode).not.toHaveBeenCalled();
  });

  it("falla RecordVerification en la blockchain: 502, nunca actualiza Mongo (ningún éxito a medias)", async () => {
    (submitChaincodeTransaction as jest.Mock).mockRejectedValue(new Error("orderer no disponible"));

    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(502);
    expect(updateDocumentStatus).not.toHaveBeenCalled();
  });

  it("el ledger registra la verificación pero Mongo falla después: 500 (inconsistencia, no 200 falso)", async () => {
    (updateDocumentStatus as jest.Mock).mockRejectedValue(new Error("Mongo caído"));

    const res = await request(createApp())
      .post("/documents/doc1/verifications")
      .set("Authorization", `Bearer ${token("Verificador")}`)
      .attach("document", PDF_BUFFER, "contrato.pdf");

    expect(res.status).toBe(500);
  });
});

describe("GET /documents", () => {
  it("200 con el resumen de los documentos (sin el hash)", async () => {
    (listDocuments as jest.Mock).mockResolvedValue([
      {
        _id: "doc2",
        name: "b.pdf",
        responsibleUser: "U001",
        registeredAt: new Date("2026-10-02T00:00:00.000Z"),
        hash: "deadbeef",
        status: "Pendiente",
      },
      {
        _id: "doc1",
        name: "a.pdf",
        responsibleUser: "U001",
        registeredAt: new Date("2026-10-01T00:00:00.000Z"),
        hash: "cafef00d",
        status: "Verificado",
      },
    ]);

    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        documentId: "doc2",
        name: "b.pdf",
        responsibleUser: "U001",
        registeredAt: "2026-10-02T00:00:00.000Z",
        status: "Pendiente",
      },
      {
        documentId: "doc1",
        name: "a.pdf",
        responsibleUser: "U001",
        registeredAt: "2026-10-01T00:00:00.000Z",
        status: "Verificado",
      },
    ]);
    // El hash nunca viaja en el listado — ni completo ni enmascarado, no
    // hace falta para elegir un documento (se pide recién al consultarlo).
    expect(res.body[0].hash).toBeUndefined();
  });

  it("Administrador: 200 (mismo acceso que Verificador)", async () => {
    (listDocuments as jest.Mock).mockResolvedValue([]);

    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer ${token("Administrador")}`);

    expect(res.status).toBe(200);
  });

  it("sin documentos: 200 con un arreglo vacío", async () => {
    (listDocuments as jest.Mock).mockResolvedValue([]);

    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("Empleado: 200, acotado a sus propios documentos (RF-18, Sprint 4 D3)", async () => {
    (listDocuments as jest.Mock).mockResolvedValue([]);

    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer ${token("Empleado")}`);

    expect(res.status).toBe(200);
    // token() firma siempre sub="U001" — confirma que el filtro llega con
    // el id del usuario autenticado, no sin filtro como para los otros roles.
    expect(listDocuments).toHaveBeenCalledWith("U001");
  });

  it("Verificador: sin filtro (ve todos los documentos, no solo los de un usuario)", async () => {
    (listDocuments as jest.Mock).mockResolvedValue([]);

    await request(createApp()).get("/documents").set("Authorization", `Bearer ${token("Verificador")}`);

    expect(listDocuments).toHaveBeenCalledWith(undefined);
  });

  it("sin JWT: 401, no llega a consultar Mongo", async () => {
    const res = await request(createApp()).get("/documents");

    expect(res.status).toBe(401);
    expect(listDocuments).not.toHaveBeenCalled();
  });
});

describe("GET /documents/:id/events", () => {
  const ledgerEventsUnordered = [
    { Action: "verificacion", DocumentID: "doc1", Result: "confirmada", Timestamp: "2026-10-02T00:00:00Z", TxID: "tx2", User: "U003" },
    { Action: "registro", DocumentID: "doc1", Timestamp: "2026-10-01T00:00:00Z", TxID: "tx1", User: "U001" },
  ];

  beforeEach(() => {
    (queryChaincode as jest.Mock).mockImplementation((fcn: string) => {
      if (fcn === "GetDocument") {
        return Promise.resolve(JSON.stringify({ Sha256Hex: FULL_HASH, Status: "Verificado" }));
      }
      if (fcn === "GetDocumentEvents") {
        return Promise.resolve(JSON.stringify(ledgerEventsUnordered));
      }
      throw new Error(`unexpected fcn in test: ${fcn}`);
    });
  });

  it("Verificador: 200, eventos ordenados por fecha (no por el orden que devuelve el ledger)", async () => {
    const res = await request(createApp())
      .get("/documents/doc1/events")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { documentId: "doc1", action: "registro", user: "U001", txId: "tx1", timestamp: "2026-10-01T00:00:00Z" },
      {
        documentId: "doc1",
        action: "verificacion",
        user: "U003",
        txId: "tx2",
        timestamp: "2026-10-02T00:00:00Z",
        result: "confirmada",
      },
    ]);
    expect(queryChaincode).toHaveBeenCalledWith("GetDocumentEvents", "doc1");
  });

  it("Empleado dueño del documento: 200", async () => {
    const res = await request(createApp())
      .get("/documents/doc1/events")
      .set("Authorization", `Bearer ${token("Empleado")}`); // token() firma sub="U001", igual que responsibleUser del mock

    expect(res.status).toBe(200);
  });

  it("Empleado que NO es el dueño: 403 (el dueño es el User del evento 'registro' del propio ledger, no Mongo)", async () => {
    (queryChaincode as jest.Mock).mockImplementation((fcn: string) => {
      if (fcn === "GetDocument") {
        return Promise.resolve(JSON.stringify({ Sha256Hex: FULL_HASH, Status: "Verificado" }));
      }
      if (fcn === "GetDocumentEvents") {
        return Promise.resolve(
          JSON.stringify([{ Action: "registro", DocumentID: "doc1", Timestamp: "2026-10-01T00:00:00Z", TxID: "tx1", User: "otro-usuario" }]),
        );
      }
      throw new Error(`unexpected fcn in test: ${fcn}`);
    });

    const res = await request(createApp())
      .get("/documents/doc1/events")
      .set("Authorization", `Bearer ${token("Empleado")}`);

    expect(res.status).toBe(403);
  });

  it("Empleado, sin evento 'registro' en la respuesta (no debería pasar en la práctica): 403 fail closed", async () => {
    (queryChaincode as jest.Mock).mockImplementation((fcn: string) => {
      if (fcn === "GetDocument") {
        return Promise.resolve(JSON.stringify({ Sha256Hex: FULL_HASH, Status: "Verificado" }));
      }
      if (fcn === "GetDocumentEvents") {
        return Promise.resolve(JSON.stringify([]));
      }
      throw new Error(`unexpected fcn in test: ${fcn}`);
    });

    const res = await request(createApp())
      .get("/documents/doc1/events")
      .set("Authorization", `Bearer ${token("Empleado")}`);

    expect(res.status).toBe(403);
  });

  it("documento inexistente: 404", async () => {
    (queryChaincode as jest.Mock).mockImplementation(() =>
      Promise.reject(Object.assign(new Error("endorsement failure"), {
        details: [{ message: "document doc1 not found" }],
      })),
    );

    const res = await request(createApp())
      .get("/documents/doc1/events")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(404);
  });

  it("falla la consulta de eventos por otro motivo: 502", async () => {
    (queryChaincode as jest.Mock).mockImplementation((fcn: string) => {
      if (fcn === "GetDocument") {
        return Promise.resolve(JSON.stringify({ Sha256Hex: FULL_HASH, Status: "Verificado" }));
      }
      return Promise.reject(new Error("peer no disponible"));
    });

    const res = await request(createApp())
      .get("/documents/doc1/events")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(502);
  });

  it("sin JWT: 401", async () => {
    const res = await request(createApp()).get("/documents/doc1/events");

    expect(res.status).toBe(401);
    expect(queryChaincode).not.toHaveBeenCalled();
  });
});

describe("GET /documents/summary", () => {
  it("Administrador: 200 con los totales reales", async () => {
    (countDocumentsByStatus as jest.Mock).mockResolvedValue({
      total: 5,
      pendiente: 2,
      verificado: 2,
      alterado: 1,
    });

    const res = await request(createApp())
      .get("/documents/summary")
      .set("Authorization", `Bearer ${token("Administrador")}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 5, pendiente: 2, verificado: 2, alterado: 1 });
  });

  it("Verificador: 403, el panel es solo del Administrador", async () => {
    const res = await request(createApp())
      .get("/documents/summary")
      .set("Authorization", `Bearer ${token("Verificador")}`);

    expect(res.status).toBe(403);
    expect(countDocumentsByStatus).not.toHaveBeenCalled();
  });

  it("Empleado: 403", async () => {
    const res = await request(createApp())
      .get("/documents/summary")
      .set("Authorization", `Bearer ${token("Empleado")}`);

    expect(res.status).toBe(403);
    expect(countDocumentsByStatus).not.toHaveBeenCalled();
  });

  it("sin JWT: 401", async () => {
    const res = await request(createApp()).get("/documents/summary");

    expect(res.status).toBe(401);
  });

  it("no lo confunde con GET /documents/:id (la ruta /summary va antes en el router)", async () => {
    (countDocumentsByStatus as jest.Mock).mockResolvedValue({
      total: 0,
      pendiente: 0,
      verificado: 0,
      alterado: 0,
    });

    const res = await request(createApp())
      .get("/documents/summary")
      .set("Authorization", `Bearer ${token("Administrador")}`);

    // Si ":id" se hubiera comido "summary", esto habría intentado consultar
    // el chaincode (GetDocument) en vez de Mongo.
    expect(queryChaincode).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
