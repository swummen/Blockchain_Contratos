import request from "supertest";
import { createApp } from "../src/server";

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn(),
}));

// server.ts también importa ./fabric/gateway, que a su vez importa
// @hyperledger/fabric-gateway; una de sus dependencias (@noble/curves) se
// distribuye en ESM puro y Jest no la transforma dentro de node_modules por
// defecto. Mockear el módulo evita cargar esa cadena de imports del todo —
// este archivo no necesita probar Fabric, eso lo cubre tests/fabric.test.ts.
jest.mock("../src/fabric/gateway", () => ({
  connectFabric: jest.fn(),
  queryChaincode: jest.fn(),
}));

import { isMongoHealthy } from "../src/repositories/mongoClient";

describe("GET /health", () => {
  it("responde 200 con mongo conectado", async () => {
    (isMongoHealthy as jest.Mock).mockResolvedValue(true);

    const res = await request(createApp()).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", mongo: "connected" });
  });

  it("responde 503 cuando mongo no responde", async () => {
    (isMongoHealthy as jest.Mock).mockResolvedValue(false);

    const res = await request(createApp()).get("/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error", mongo: "down" });
  });
});
