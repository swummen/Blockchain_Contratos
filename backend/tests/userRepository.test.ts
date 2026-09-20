const updateOne = jest.fn();
const findOne = jest.fn();
const countDocuments = jest.fn();
const createIndex = jest.fn();
const collection = jest.fn(() => ({ updateOne, findOne, countDocuments, createIndex }));

jest.mock("../src/repositories/mongoClient", () => ({
  getDb: jest.fn(() => ({ collection })),
}));

import {
  countUsers,
  ensureIndexes,
  findUserByEmail,
  findUserById,
  insertUserIfMissing,
  updatePasswordHash,
} from "../src/repositories/userRepository";

const SEED_USER = {
  _id: "U001",
  name: "María López",
  email: "m.lopez@empresa.com",
  passwordHash: "hash",
  role: "Empleado" as const,
  status: "Activo" as const,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("userRepository", () => {
  it("busca por email", async () => {
    findOne.mockResolvedValue(SEED_USER);

    const user = await findUserByEmail(SEED_USER.email);

    expect(collection).toHaveBeenCalledWith("users");
    expect(findOne).toHaveBeenCalledWith({ email: SEED_USER.email });
    expect(user).toEqual(SEED_USER);
  });

  it("normaliza mayúsculas/espacios del email antes de buscar", async () => {
    findOne.mockResolvedValue(SEED_USER);

    await findUserByEmail("  M.Lopez@Empresa.com  ");

    expect(findOne).toHaveBeenCalledWith({ email: "m.lopez@empresa.com" });
  });

  it("busca por id", async () => {
    findOne.mockResolvedValue(SEED_USER);

    await findUserById("U001");

    expect(findOne).toHaveBeenCalledWith({ _id: "U001" });
  });

  it("inserta con upsert por _id (idempotente)", async () => {
    await insertUserIfMissing(SEED_USER);

    expect(updateOne).toHaveBeenCalledWith(
      { _id: "U001" },
      { $setOnInsert: SEED_USER },
      { upsert: true },
    );
  });

  it("actualiza solo el passwordHash", async () => {
    await updatePasswordHash("U001", "nuevo-hash");

    expect(updateOne).toHaveBeenCalledWith(
      { _id: "U001" },
      { $set: { passwordHash: "nuevo-hash" } },
    );
  });

  it("cuenta usuarios", async () => {
    countDocuments.mockResolvedValue(3);

    const count = await countUsers();

    expect(count).toBe(3);
  });

  it("crea el índice único de email", async () => {
    await ensureIndexes();

    expect(createIndex).toHaveBeenCalledWith({ email: 1 }, { unique: true });
  });
});
