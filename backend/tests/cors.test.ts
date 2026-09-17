import request from "supertest";
import { createApp } from "../src/server";

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn().mockResolvedValue(true),
}));

jest.mock("../src/fabric/gateway", () => ({
  connectFabric: jest.fn(),
  queryChaincode: jest.fn().mockResolvedValue("[]"),
}));

describe("CORS (T6)", () => {
  it("agrega Access-Control-Allow-Origin en /health", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("agrega Access-Control-Allow-Origin en /fabric/ping", async () => {
    const res = await request(createApp()).get("/fabric/ping");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("no agrega el header en rutas fuera de /health y /fabric (acotado a propósito)", async () => {
    const res = await request(createApp()).get("/no-existe");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
