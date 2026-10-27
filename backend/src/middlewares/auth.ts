import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth";
import { deleteSession, findSessionByJti, touchSession } from "../repositories/sessionRepository";
import { Role, VALID_ROLES } from "../repositories/userRepository";

// Agrega req.user al Request de Express.
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

// Sin argumentos exige solo una sesión válida; con roles, además que el rol del
// JWT esté en la lista (RNF-03). En ambos casos exige la política de datos
// aceptada (RF-055 CA-03).
export function requireAuth(...allowedRoles: Role[]) {
  return authenticate(allowedRoles, true);
}

// Sesión válida aunque falte aceptar la política: solo para las rutas que la
// pantalla de la política necesita (quién soy, aceptar y cerrar sesión).
export function requireSession() {
  return authenticate([], false);
}

function authenticate(allowedRoles: Role[], requirePolicy: boolean) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "No autenticado." });
      return;
    }

    let payload: jwt.JwtPayload;
    try {
      // Algoritmo fijo: nunca confiar en el "alg" que declara el propio token.
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

    // Además de la firma, la sesión debe seguir existiendo (logout la borra).
    const session = await findSessionByJti(jti);
    if (!session) {
      res.status(401).json({ message: "Sesión inválida o vencida." });
      return;
    }

    // RNF-07: cierre por inactividad. Se borra ya, sin esperar al índice TTL.
    const inactiveMs = Date.now() - session.lastSeenAt.getTime();
    if (inactiveMs > authConfig.sessionInactivityMinutes * 60_000) {
      await deleteSession(jti);
      res.status(401).json({ message: "Sesión inválida o vencida." });
      return;
    }

    // Solo false bloquea: las sesiones creadas antes de RF-055 no traen el campo
    // y vencen solas (jwtExpiresMinutes).
    if (requirePolicy && session.policyAccepted === false) {
      res.status(403).json({
        code: "POLICY_NOT_ACCEPTED",
        message: "Debes aceptar la política de tratamiento de datos para continuar.",
      });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role as Role)) {
      res.status(403).json({ message: "No tienes permiso para esta acción." });
      return;
    }

    // Sin await: la marca de actividad no debe demorar la respuesta. El catch
    // es obligatorio: un rechazo sin manejar termina el proceso de Node.
    touchSession(jti).catch((err) => {
      console.error("No se pudo actualizar la actividad de la sesión:", err);
    });

    req.user = { sub, role: role as Role, jti };
    next();
  };
}
