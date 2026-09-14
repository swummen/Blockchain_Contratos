import express from "express";
import { env } from "./config/env";
import { connectMongo } from "./repositories/mongoClient";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();
  app.use(healthRouter);
  return app;
}

async function main() {
  try {
    await connectMongo();
  } catch (err) {
    // No aborta el arranque: /health debe poder reportar "mongo: down" en
    // vez de que el proceso ni siquiera levante si Mongo tarda en estar listo.
    console.error("No se pudo conectar a MongoDB al arrancar:", err);
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
