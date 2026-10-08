import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getAllEvents } from "../services/documentService";

export const eventsRouter = Router();

eventsRouter.get(
  "/events",
  // RF-39/40 (Verificador), RF-50/51 (Administrador) — HU-020-CA-02 exige el
  // mismo nivel de detalle para los dos, así que es una sola ruta, no dos.
  requireAuth("Verificador", "Administrador"),
  async (_req, res) => {
    const result = await getAllEvents();
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }
    res.status(200).json(result.events);
  },
);
