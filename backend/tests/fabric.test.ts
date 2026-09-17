import request from "supertest";
import { createApp } from "../src/server";

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn(),
}));

jest.mock("../src/fabric/gateway", () => ({
  connectFabric: jest.fn(),
  queryChaincode: jest.fn(),
}));

import { queryChaincode } from "../src/fabric/gateway";

describe("GET /fabric/ping", () => {
  it("responde 200 con el resultado del chaincode", async () => {
    (queryChaincode as jest.Mock).mockResolvedValue(
      '[{"ID":"asset1","Owner":"Tomoko"}]',
    );

    const res = await request(createApp()).get("/fabric/ping");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      result: [{ ID: "asset1", Owner: "Tomoko" }],
    });
  });

  it("responde 503 cuando Fabric no está disponible", async () => {
    (queryChaincode as jest.Mock).mockRejectedValue(
      new Error("Fabric Gateway no está conectado"),
    );

    const res = await request(createApp()).get("/fabric/ping");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: "error",
      message: "Fabric Gateway no está conectado",
    });
  });
});
