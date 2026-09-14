import { Router } from "express";
import { isMongoHealthy } from "../repositories/mongoClient";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const mongoOk = await isMongoHealthy();
  if (mongoOk) {
    res.status(200).json({ status: "ok", mongo: "connected" });
  } else {
    res.status(503).json({ status: "error", mongo: "down" });
  }
});
