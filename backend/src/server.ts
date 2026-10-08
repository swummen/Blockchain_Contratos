import express, { ErrorRequestHandler } from "express";
import { authConfig } from "./config/auth";
import { env } from "./config/env";
import { connectFabric } from "./fabric/gateway";
import { connectMongo } from "./repositories/mongoClient";
import { ensureIndexes as ensureOtpIndexes } from "./repositories/otpRepository";
import { ensureIndexes as ensureSessionIndexes } from "./repositories/sessionRepository";
import { authRouter } from "./routes/auth";
import { documentsRouter } from "./routes/documents";
import { eventsRouter } from "./routes/events";
import { fabricRouter } from "./routes/fabric";
import { healthRouter } from "./routes/health";
import { usersRouter } from "./routes/users";

export function createApp() {
  const app = express();
  // El frontend (T6) corre en otro puerto/origen para el navegador (nginx en
  // FRONTEND_PORT vs. este backend en BACKEND_PORT), así que sin esto el
  // fetch a /health y /fabric/ping se bloquea por CORS aunque el backend
  // responda bien. "*" es aceptable porque son endpoints de diagnóstico sin
  // datos sensibles ni sesión — pero se acota a esas dos rutas a propósito
  // (no app.use global) para que un endpoint de negocio agregado en
  // Sprint 2+ NO herede el wildcard en silencio.
  app.use(["/health", "/fabric"], (_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
  // /auth (Sprint 1, identity) es el primer endpoint de negocio real
  // (credenciales, sesión): el origen se restringe a FRONTEND_ORIGIN, no "*"
  // (decisión D8 del plan). El navegador manda un preflight OPTIONS antes de
  // un POST con body JSON — sin responderlo, el POST real nunca sale.
  app.use("/auth", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", authConfig.frontendOrigin);
    // GET (T4: /auth/me) + Authorization (T4: rutas protegidas mandan el JWT
    // ahí, no en el body) — sin esto, el navegador ni siquiera intenta el
    // request real después del preflight.
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  // /documents (Sprint 2, T4): mismo criterio D8 que /auth — CORS acotado a
  // FRONTEND_ORIGIN, no el wildcard de /health/fabric. El body va como
  // multipart/form-data (no JSON), pero el header Authorization igual
  // dispara el preflight.
  app.use("/documents", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", authConfig.frontendOrigin);
    // GET agregado recién en Sprint 4 (hallazgo real durante T4: Sprint 3 ya
    // había agregado GET /documents/:id, pero esto nunca se actualizó desde
    // que se escribió en Sprint 2 con solo POST). El valor estaba mal, pero
    // nunca llegó a bloquear nada en la práctica — GET (como HEAD y POST) es
    // un "CORS-safelisted method" (spec de Fetch): el chequeo de método del
    // preflight pasa igual aunque Allow-Methods no lo liste, así que ningún
    // navegador real lo rechazó nunca por esto (confirmado leyendo la spec,
    // no con curl — curl no aplica ninguna política de CORS, solo muestra
    // los headers de la respuesta). Documentado y corregido igual porque el
    // riesgo real es distinto: un método que NO está en esa lista exenta
    // (PUT/DELETE/PATCH) que se agregue más adelante sin actualizar esto SÍ
    // quedaría bloqueado por cualquier navegador, sin excepción.
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  // /events (Sprint 4, T4): mismo criterio D8, pero sin body — solo GET con
  // el header Authorization, que ya dispara el preflight por sí solo aunque
  // el método en sí sea "simple".
  app.use("/events", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", authConfig.frontendOrigin);
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  // /users (Sprint 4, T5): mismo criterio D8 — GET/POST/PUT, body JSON (a
  // diferencia de /documents, acá nunca se sube un archivo).
  app.use("/users", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", authConfig.frontendOrigin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(express.json());
  // express.json() rechaza un body malformado con un SyntaxError; sin este
  // handler, Express responde con su página de error HTML por defecto en
  // vez de JSON, inconsistente con el resto de la API.
  const handleJsonParseError: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
      res.status(400).json({ message: "JSON inválido." });
      return;
    }
    next(err);
  };
  app.use(handleJsonParseError);
  app.use(healthRouter);
  app.use(fabricRouter);
  app.use(authRouter);
  app.use(documentsRouter);
  app.use(eventsRouter);
  app.use(usersRouter);
  // Catch-all al final (T4: primera vez que una ruta protegida hace un
  // await a Mongo en pleno camino de la request — findSessionByJti). Sin
  // esto, una excepción ahí (Mongo caído a mitad de request) cae en la
  // página de error HTML por defecto de Express en vez de JSON, igual que
  // ya se evitó arriba para el JSON malformado.
  const handleUnexpectedError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("Error no manejado en una request:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  };
  app.use(handleUnexpectedError);
  return app;
}

async function main() {
  try {
    await connectMongo();
    // Índice TTL de otp_codes (D5 del plan): a diferencia del índice único de
    // `users` (lo asegura seedUsers.ts, que es quien escribe ahí), el propio
    // servidor escribe en otp_codes en cada login — le toca a él asegurarlo.
    await ensureOtpIndexes();
    await ensureSessionIndexes();
  } catch (err) {
    // No aborta el arranque: /health debe poder reportar "mongo: down" en
    // vez de que el proceso ni siquiera levante si Mongo tarda en estar listo.
    console.error("No se pudo conectar a MongoDB al arrancar:", err);
  }

  try {
    await connectFabric();
  } catch (err) {
    // Mismo criterio que Mongo: si el material criptográfico todavía no está
    // montado o la red no arrancó, /fabric/ping reporta 503 en vez de tumbar
    // el proceso.
    console.error("No se pudo conectar a Hyperledger Fabric al arrancar:", err);
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`backend escuchando en el puerto ${env.port}`);
  });

  // app.listen() no rechaza en un fallo de bind (puerto ocupado, sin
  // permisos, etc.) — lo reporta vía el evento "error" del http.Server.
  server.on("error", (err) => {
    console.error(`No se pudo levantar el servidor en el puerto ${env.port}:`, err);
    process.exit(1);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fallo al arrancar el backend:", err);
    process.exit(1);
  });
}
