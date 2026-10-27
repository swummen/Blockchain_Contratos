import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
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
  deleteSessionsByUserId: jest.fn(),
  touchSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/repositories/documentRepository", () => ({
  insertDocument: jest.fn(),
  findDocumentById: jest.fn(),
  updateDocumentStatus: jest.fn(),
  listDocuments: jest.fn(),
  countDocumentsByStatus: jest.fn(),
}));

jest.mock("../src/repositories/userRepository", () => {
  const actual = jest.requireActual("../src/repositories/userRepository");
  return {
    ...actual,
    listUsers: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    insertUser: jest.fn(),
    updateUser: jest.fn(),
    deactivateUser: jest.fn(),
  };
});

import { deleteSessionsByUserId, findSessionByJti } from "../src/repositories/sessionRepository";
import {
  deactivateUser,
  findUserByEmail,
  findUserById,
  insertUser,
  listUsers,
  updateUser,
} from "../src/repositories/userRepository";
import { createApp } from "../src/server";

const activeSession = {
  _id: "jti-1",
  userId: "U099",
  role: "Administrador" as const,
  expiresAt: new Date(Date.now() + 60_000),
  lastSeenAt: new Date(),
  policyAccepted: true,
};

function token(role = "Administrador") {
  return jwt.sign({ role }, authConfig.jwtSecret, {
    subject: "U099",
    jwtid: "jti-1",
    expiresIn: 3600,
  });
}

function authHeader(role = "Administrador") {
  return `Bearer ${token(role)}`;
}

function seedUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: "U001",
    name: "Maria Lopez",
    email: "m.lopez@empresa.com",
    passwordHash: "hash",
    role: "Empleado" as const,
    status: "Activo" as const,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (findSessionByJti as jest.Mock).mockResolvedValue(activeSession);
});

describe("GET /users", () => {
  it("Administrador: 200, nunca expone passwordHash", async () => {
    (listUsers as jest.Mock).mockResolvedValue([seedUser()]);

    const res = await request(createApp()).get("/users").set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { userId: "U001", name: "Maria Lopez", email: "m.lopez@empresa.com", role: "Empleado", status: "Activo" },
    ]);
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("Empleado: 403", async () => {
    const res = await request(createApp()).get("/users").set("Authorization", authHeader("Empleado"));

    expect(res.status).toBe(403);
    expect(listUsers).not.toHaveBeenCalled();
  });

  it("sin JWT: 401", async () => {
    const res = await request(createApp()).get("/users");

    expect(res.status).toBe(401);
    expect(listUsers).not.toHaveBeenCalled();
  });
});

describe("POST /users", () => {
  const input = { name: "Carlos Ruiz", email: "c.ruiz@empresa.com", role: "Empleado" };

  it("Administrador: 201, password temporal hasheada, status Activo", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (insertUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp()).post("/users").set("Authorization", authHeader()).send(input);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: "Carlos Ruiz", email: "c.ruiz@empresa.com", role: "Empleado", status: "Activo" });
    expect(res.body.user.userId).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
    // Se devuelve la contraseña temporal, nunca su hash.
    expect(res.body.temporaryPassword).toBe("Contratos123!");

    const inserted = (insertUser as jest.Mock).mock.calls[0][0];
    expect(inserted.passwordHash).not.toBe("Contratos123!");
    expect(inserted.passwordHash.length).toBeGreaterThan(10);
  });

  it("correo con mayusculas: la respuesta muestra la misma forma normalizada que se persiste", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (insertUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp())
      .post("/users")
      .set("Authorization", authHeader())
      .send({ ...input, email: "Carlos.Ruiz@Empresa.COM" });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("carlos.ruiz@empresa.com");
    const inserted = (insertUser as jest.Mock).mock.calls[0][0];
    expect(inserted.email).toBe("carlos.ruiz@empresa.com");
  });

  it("correo duplicado (pre-chequeo): 409", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(seedUser());

    const res = await request(createApp()).post("/users").set("Authorization", authHeader()).send(input);

    expect(res.status).toBe(409);
    expect(insertUser).not.toHaveBeenCalled();
  });

  it("correo duplicado (carrera, choca el indice unico): 409", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    const duplicateKeyError = new MongoServerError({ message: "E11000 duplicate key", code: 11000 });
    (insertUser as jest.Mock).mockRejectedValue(duplicateKeyError);

    const res = await request(createApp()).post("/users").set("Authorization", authHeader()).send(input);

    expect(res.status).toBe(409);
  });

  it("falta un campo: 400", async () => {
    const res = await request(createApp())
      .post("/users")
      .set("Authorization", authHeader())
      .send({ name: "Carlos Ruiz", email: "c.ruiz@empresa.com" });

    expect(res.status).toBe(400);
    expect(findUserByEmail).not.toHaveBeenCalled();
  });

  it("role invalido: 400", async () => {
    const res = await request(createApp())
      .post("/users")
      .set("Authorization", authHeader())
      .send({ ...input, role: "SuperAdmin" });

    expect(res.status).toBe(400);
  });

  it("Empleado: 403", async () => {
    const res = await request(createApp()).post("/users").set("Authorization", authHeader("Empleado")).send(input);

    expect(res.status).toBe(403);
    expect(insertUser).not.toHaveBeenCalled();
  });

  it("sin JWT: 401", async () => {
    const res = await request(createApp()).post("/users").send(input);

    expect(res.status).toBe(401);
  });
});

describe("PUT /users/:id", () => {
  const input = { name: "Maria Lopez Actualizada", email: "m.lopez@empresa.com", role: "Verificador" };

  it("Administrador: 200", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (findUserByEmail as jest.Mock).mockResolvedValue(seedUser());
    (updateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp()).put("/users/U001").set("Authorization", authHeader()).send(input);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ userId: "U001", name: "Maria Lopez Actualizada", role: "Verificador" });
  });

  it("usuario inexistente: 404", async () => {
    (findUserById as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp()).put("/users/U999").set("Authorization", authHeader()).send(input);

    expect(res.status).toBe(404);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("correo duplicado de otro usuario: 409", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (findUserByEmail as jest.Mock).mockResolvedValue(seedUser({ _id: "U002" }));

    const res = await request(createApp())
      .put("/users/U001")
      .set("Authorization", authHeader())
      .send({ ...input, email: "c.ruiz@empresa.com" });

    expect(res.status).toBe(409);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("cambio de rol: corta las sesiones abiertas del usuario (el rol viaja en el JWT)", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser()); // rol actual: Empleado
    (findUserByEmail as jest.Mock).mockResolvedValue(seedUser());
    (updateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp()).put("/users/U001").set("Authorization", authHeader()).send(input); // -> Verificador

    expect(res.status).toBe(200);
    expect(deleteSessionsByUserId).toHaveBeenCalledWith("U001");
  });

  it("mismo rol (solo cambia nombre/correo): no corta sesiones", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (findUserByEmail as jest.Mock).mockResolvedValue(seedUser());
    (updateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp())
      .put("/users/U001")
      .set("Authorization", authHeader())
      .send({ ...input, role: "Empleado" });

    expect(res.status).toBe(200);
    expect(deleteSessionsByUserId).not.toHaveBeenCalled();
  });

  it("Administrador quitándose su propio rol: 400, no toca nada", async () => {
    const res = await request(createApp())
      .put("/users/U099") // token() firma sub="U099"
      .set("Authorization", authHeader())
      .send({ name: "Admin", email: "admin@empresa.com", role: "Empleado" });

    expect(res.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("Administrador editando su propio nombre (sin cambiar rol): 200", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser({ _id: "U099", role: "Administrador" }));
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (updateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp())
      .put("/users/U099")
      .set("Authorization", authHeader())
      .send({ name: "Admin Nuevo", email: "admin@empresa.com", role: "Administrador" });

    expect(res.status).toBe(200);
    expect(deleteSessionsByUserId).not.toHaveBeenCalled();
  });

  it("mismo correo que ya tenia (no es duplicado contra si mismo): 200", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (findUserByEmail as jest.Mock).mockResolvedValue(seedUser());
    (updateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp()).put("/users/U001").set("Authorization", authHeader()).send(input);

    expect(res.status).toBe(200);
  });

  it("correo con mayusculas: la respuesta y lo persistido quedan normalizados igual", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (updateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp())
      .put("/users/U001")
      .set("Authorization", authHeader())
      .send({ ...input, email: "Maria.Lopez@Empresa.COM" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("maria.lopez@empresa.com");
    const persisted = (updateUser as jest.Mock).mock.calls[0][1];
    expect(persisted.email).toBe("maria.lopez@empresa.com");
  });

  it("body invalido: 400", async () => {
    const res = await request(createApp()).put("/users/U001").set("Authorization", authHeader()).send({ name: "" });

    expect(res.status).toBe(400);
    expect(findUserById).not.toHaveBeenCalled();
  });

  it("Empleado: 403", async () => {
    const res = await request(createApp()).put("/users/U001").set("Authorization", authHeader("Empleado")).send(input);

    expect(res.status).toBe(403);
  });

  it("sin JWT: 401", async () => {
    const res = await request(createApp()).put("/users/U001").send(input);

    expect(res.status).toBe(401);
  });
});

describe("POST /users/:id/deactivate", () => {
  it("Administrador: 204", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (deactivateUser as jest.Mock).mockResolvedValue(undefined);

    const res = await request(createApp()).post("/users/U001/deactivate").set("Authorization", authHeader());

    expect(res.status).toBe(204);
    expect(deactivateUser).toHaveBeenCalledWith("U001");
  });

  it("revoca las sesiones ya abiertas del usuario desactivado", async () => {
    (findUserById as jest.Mock).mockResolvedValue(seedUser());
    (deactivateUser as jest.Mock).mockResolvedValue(undefined);

    await request(createApp()).post("/users/U001/deactivate").set("Authorization", authHeader());

    expect(deleteSessionsByUserId).toHaveBeenCalledWith("U001");
  });

  it("Administrador intenta desactivarse a si mismo: 400", async () => {
    const res = await request(createApp()).post("/users/U099/deactivate").set("Authorization", authHeader());

    expect(res.status).toBe(400);
    expect(deactivateUser).not.toHaveBeenCalled();
  });

  it("usuario inexistente: 404", async () => {
    (findUserById as jest.Mock).mockResolvedValue(null);

    const res = await request(createApp()).post("/users/U999/deactivate").set("Authorization", authHeader());

    expect(res.status).toBe(404);
    expect(deactivateUser).not.toHaveBeenCalled();
  });

  it("Empleado: 403", async () => {
    const res = await request(createApp()).post("/users/U001/deactivate").set("Authorization", authHeader("Empleado"));

    expect(res.status).toBe(403);
  });

  it("sin JWT: 401", async () => {
    const res = await request(createApp()).post("/users/U001/deactivate");

    expect(res.status).toBe(401);
  });
});
