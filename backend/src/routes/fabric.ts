import { Router } from "express";
import { queryChaincode } from "../fabric/gateway";

export const fabricRouter = Router();

fabricRouter.get("/fabric/ping", async (_req, res) => {
  try {
    const raw = await queryChaincode("GetAllAssets");
    res.status(200).json({ status: "ok", result: JSON.parse(raw) });
  } catch (err) {
    // A diferencia de /health (que solo dice "down"), acá sí se expone el
    // mensaje real: es un endpoint de diagnóstico de infraestructura en un
    // puerto que solo se publica en 127.0.0.1, no una ruta de negocio. Antes
    // de copiar este patrón a un endpoint real (Sprint 2+), reconsiderar si
    // conviene sanitizar como /health.
    res.status(503).json({ status: "error", message: (err as Error).message });
  }
});
