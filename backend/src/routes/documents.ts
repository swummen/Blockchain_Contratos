import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import {
  getDocument,
  getDocumentEvents,
  getDocumentsSummary,
  listDocuments,
  registerDocument,
  verifyDocument,
} from "../services/documentService";

export const documentsRouter = Router();

// El PDF solo vive en memoria durante la petición: nunca se escribe a disco.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // RF-11/RNF-24
});

// Validación del archivo para registro y verificación. Se invoca a mano para
// responder los errores de multer como JSON y no como página HTML.
function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single("document")(req, res, (err) => {
    if (err) {
      // Se registra porque al usuario solo le llega "archivo inválido".
      console.error("Error de multer al procesar el upload:", err);
      res.status(400).json({ message: "El archivo debe ser un único PDF de hasta 20MB." });
      return;
    }
    next();
  });
}

documentsRouter.post(
  "/documents",
  requireAuth("Empleado"), // RF-08: solo el Empleado registra documentos
  handleUpload,
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "Falta el archivo del documento (campo 'document')." });
      return;
    }

    const result = await registerDocument(
      { originalname: req.file.originalname, buffer: req.file.buffer },
      req.user!.sub,
    );
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }
    res.status(201).json({ documentId: result.documentId });
  },
);

documentsRouter.get(
  "/documents",
  // Cualquier rol: el servicio limita al Empleado a sus propios documentos.
  requireAuth(),
  async (req, res) => {
    res.status(200).json(await listDocuments(req.user!.role, req.user!.sub));
  },
);

documentsRouter.get(
  // Debe registrarse antes de "/documents/:id" o Express tomaría "summary" como id.
  "/documents/summary",
  requireAuth("Administrador"), // RF-41/42: el panel es solo del Administrador.
  async (_req, res) => {
    res.status(200).json(await getDocumentsSummary());
  },
);

documentsRouter.get(
  "/documents/:id",
  requireAuth(), // RF-25/26: todos consultan; por rol solo cambia el enmascarado del hash.
  async (req, res) => {
    // :id no es comodín, así que siempre es un string (el tipo de Express 5 es más amplio).
    const result = await getDocument(req.params.id as string, req.user!.role);
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }
    res.status(200).json(result.document);
  },
);

documentsRouter.get(
  "/documents/:id/events",
  // El 403 para un Empleado que no es dueño lo decide el servicio (RF-21 CA-02).
  requireAuth(),
  async (req, res) => {
    const result = await getDocumentEvents(
      req.params.id as string,
      req.user!.role,
      req.user!.sub,
    );
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }
    res.status(200).json(result.events);
  },
);

documentsRouter.post(
  "/documents/:id/verifications",
  requireAuth("Verificador"), // RF-23: solo el Verificador verifica
  handleUpload,
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "Falta el archivo del documento a comparar (campo 'document')." });
      return;
    }

    const result = await verifyDocument(
      req.params.id as string,
      { originalname: req.file.originalname, buffer: req.file.buffer },
      req.user!.sub,
    );
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }
    res.status(200).json(result.result);
  },
);
