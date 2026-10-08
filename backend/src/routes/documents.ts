import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import { getDocument, registerDocument, verifyDocument } from "../services/documentService";

export const documentsRouter = Router();

// memoryStorage (D9): el PDF nunca se escribe a disco, ni transitoriamente —
// se mantiene en memoria el tiempo justo para validarlo y hashearlo, y se
// descarta apenas termina la request (RNF-04 ya prohíbe guardarlo en
// Mongo/blockchain; esto va un paso más allá por simplicidad, no hace falta
// limpiar archivos temporales).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // RF-11/RNF-24
});

// Usado por POST /documents (RF-08) y POST /documents/:id/verifications
// (RF-28/29) — mismas reglas de validación de archivo en los dos.
// upload.single(...) invocado a mano (no como middleware de array) para
// poder mapear sus errores (tamaño excedido, más de un archivo) a la misma
// forma {message} que ya usa el resto de la API, en vez de dejar pasar la
// página de error HTML por defecto de Express.
function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single("document")(req, res, (err) => {
    if (err) {
      // Sin este log, un error real de multer (no del usuario — ej. un caso
      // raro que no sea LIMIT_FILE_SIZE) desaparece sin rastro: el usuario
      // solo ve "archivo inválido" y no hay nada que mirar en el servidor
      // para diagnosticarlo.
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
  "/documents/:id",
  requireAuth(), // RF-25/26: cualquier rol autenticado puede consultar; lo que varía por rol es el enmascarado del hash (D5 del plan de Sprint 3), no el acceso.
  async (req, res) => {
    // :id es un segmento fijo (no un wildcard), así que Express siempre lo
    // resuelve a un solo string — el tipo más ancho (string | string[]) de
    // Express 5 es por los wildcards (ej. :id*), que no aplican acá.
    const result = await getDocument(req.params.id as string, req.user!.role);
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }
    res.status(200).json(result.document);
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
      req.params.id as string, // mismo motivo que GET /documents/:id: no es un wildcard.
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
