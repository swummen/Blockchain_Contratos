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
  // CORS por ruta, nunca global, para que ninguna ruta de negocio herede "*".
  // "*" solo en los diagnósticos: no exponen datos ni usan sesión.
  app.use(["/health", "/fabric"], (_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
  // Rutas de negocio: solo el origen del frontend. Responder el preflight
  // OPTIONS es obligatorio: sin él el navegador nunca envía la petición real.
  app.use("/auth", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", authConfig.frontendOrigin);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use("/documents", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", authConfig.frontendOrigin);
    // Al agregar PUT, PATCH o DELETE hay que listarlos aquí: el navegador
    // bloquea cualquier método distinto de GET, HEAD o POST si no aparece.
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
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
  // JSON malformado: responder JSON y no la página de error HTML de Express.
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
  // Cualquier error no controlado (por ejemplo, Mongo caído) responde 500 en JSON.
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
    // Índices TTL: MongoDB borra solos los códigos y las sesiones vencidas.
    await ensureOtpIndexes();
    await ensureSessionIndexes();
  } catch (err) {
    // No se aborta: /health reporta "mongo: down" en vez de tumbar el proceso.
    console.error("No se pudo conectar a MongoDB al arrancar:", err);
  }

  try {
    await connectFabric();
  } catch (err) {
    // No se aborta: la conexión se reintenta en la primera consulta.
    console.error("No se pudo conectar a Hyperledger Fabric al arrancar:", err);
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`backend escuchando en el puerto ${env.port}`);
  });

  // listen() no lanza si el puerto está ocupado: el fallo llega por "error".
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
