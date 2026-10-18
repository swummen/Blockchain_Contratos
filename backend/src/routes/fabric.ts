import { Router } from "express";
import { queryChaincode } from "../fabric/gateway";

export const fabricRouter = Router();

fabricRouter.get("/fabric/ping", async (_req, res) => {
  try {
    // GetMetadata es una query de sistema que expone cualquier chaincode de
    // contractapi automáticamente (nombre del contrato, funciones): no una
    // función de negocio del contrato en sí. Hasta Sprint 2 esto llamaba a
    // "GetAllAssets" del chaincode de ejemplo (asset-transfer-basic); el
    // chaincode real (`contracts`) no tiene ninguna función pública de
    // solo-lectura todavía (D6 de Sprint 2: las consultas son Sprint 3/4),
    // así que no hay ninguna función de negocio real para "pinguear" sin
    // agregar una solo para este diagnóstico.
    const raw = await queryChaincode("org.hyperledger.fabric:GetMetadata");
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
