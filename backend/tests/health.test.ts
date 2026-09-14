import request from "supertest";
import { createApp } from "../src/server";

jest.mock("../src/repositories/mongoClient", () => ({
  connectMongo: jest.fn(),
  isMongoHealthy: jest.fn(),
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
