import { Router } from "express";
import { queryChaincode } from "../fabric/gateway";

export const fabricRouter = Router();

fabricRouter.get("/fabric/ping", async (_req, res) => {
  try {
    // GetMetadata la expone cualquier chaincode de contractapi: prueba la
    // conexión sin depender de una función de negocio.
    const raw = await queryChaincode("org.hyperledger.fabric:GetMetadata");
    res.status(200).json({ status: "ok", result: JSON.parse(raw) });
  } catch (err) {
    // Se expone el error real porque es un diagnóstico publicado solo en
    // 127.0.0.1. No copiar este patrón en rutas de negocio.
    res.status(503).json({ status: "error", message: (err as Error).message });
  }
});
