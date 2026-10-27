import request from "supertest";
import { createApp } from "../src/server";

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn(),
}));

// Se simula gateway: una dependencia de fabric-gateway es ESM puro y Jest no
// la puede cargar.
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

describe("Caché de las respuestas de la API (DEF-01)", () => {
  it("toda respuesta lleva Cache-Control: no-store, para que el navegador no muestre datos viejos", async () => {
    (isMongoHealthy as jest.Mock).mockResolvedValue(true);

    const ok = await request(createApp()).get("/health");
    const sinSesion = await request(createApp()).get("/documents");

    expect(ok.headers["cache-control"]).toBe("no-store");
    expect(sinSesion.status).toBe(401);
    expect(sinSesion.headers["cache-control"]).toBe("no-store");
  });
});
