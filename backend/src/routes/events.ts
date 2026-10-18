import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getAllEvents } from "../services/documentService";

export const eventsRouter = Router();

eventsRouter.get(
  "/events",
  // Misma respuesta para los dos roles (HU-020 CA-02).
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
