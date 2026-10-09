import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth";
import { deleteSession, findSessionByJti, touchSession } from "../repositories/sessionRepository";
import { Role, VALID_ROLES } from "../repositories/userRepository";

// Augmenta el Request de Express en vez de un tipo aparte (AuthenticatedRequest):
// así las rutas protegidas usan req.user directo, sin castear.
declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: Role; jti: string };
    }
  }
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}

// requireAuth() sin argumentos: solo exige sesión válida, cualquier rol.
// requireAuth("Administrador", ...): además exige que el rol del JWT esté en
// la lista (RF-05/RNF-03) — un único middleware parametrizable en vez de dos
// separados (autenticación + autorización), ya que acá siempre van juntos.
export function requireAuth(...allowedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "No autenticado." });
      return;
    }

    let payload: jwt.JwtPayload;
    try {
      // algorithms fijo (no confiar en el "alg" del header del token): sin
      // esto, un JWT no seguiría siendo inválido solo por firma incorrecta,
      // sino que además el algoritmo a usar quedaría a discreción del token.
      payload = jwt.verify(token, authConfig.jwtSecret, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;
    } catch {
      res.status(401).json({ message: "Sesión inválida o vencida." });
      return;
    }

    const { sub, role, jti } = payload;
    if (
      typeof sub !== "string" ||
      typeof jti !== "string" ||
      typeof role !== "string" ||
      !VALID_ROLES.includes(role as Role)
    ) {
      res.status(401).json({ message: "Sesión inválida o vencida." });
      return;
    }

    // Firma+expiración ya validadas por jwt.verify; falta confirmar que la
    // sesión sigue viva en Mongo (D4: es lo que permite invalidarla de
    // verdad en el logout, algo que un JWT stateless no puede hacer solo).
    const session = await findSessionByJti(jti);
    if (!session) {
      res.status(401).json({ message: "Sesión inválida o vencida." });
      return;
    }

    // RNF-07: 15 minutos sin ningún request autenticado cierran la sesión,
    // aparte del tope absoluto de expiresAt (D4). Se borra el documento acá
    // mismo (no solo se rechaza el request) para que no quede "viva" en
    // Mongo esperando a que la limpie el índice TTL de expiresAt, que puede
    // tardar hasta jwtExpiresMinutes más en llegar.
    const inactiveMs = Date.now() - session.lastSeenAt.getTime();
    if (inactiveMs > authConfig.sessionInactivityMinutes * 60_000) {
      await deleteSession(jti);
      res.status(401).json({ message: "Sesión inválida o vencida." });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role as Role)) {
      res.status(403).json({ message: "No tenés permiso para esta acción." });
      return;
    }

    // No se espera a que termine (best-effort): es solo la marca de
    // actividad para la próxima verificación de inactividad, no algo que el
    // request actual tenga que esperar para responder.
    void touchSession(jti);

    req.user = { sub, role: role as Role, jti };
    next();
  };
}
