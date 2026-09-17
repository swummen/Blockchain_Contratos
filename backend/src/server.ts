import express from "express";
import { env } from "./config/env";
import { connectFabric } from "./fabric/gateway";
import { connectMongo } from "./repositories/mongoClient";
import { fabricRouter } from "./routes/fabric";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();
  // El frontend (T6) corre en otro puerto/origen para el navegador (nginx en
  // FRONTEND_PORT vs. este backend en BACKEND_PORT), así que sin esto el
  // fetch a /health y /fabric/ping se bloquea por CORS aunque el backend
  // responda bien. "*" es aceptable porque son endpoints de diagnóstico sin
  // datos sensibles ni sesión — pero se acota a esas dos rutas a propósito
  // (no app.use global) para que un endpoint de negocio agregado en
  // Sprint 2+ NO herede el wildcard en silencio; ese sí va a necesitar
  // restringir el origen a la URL real del frontend.
  app.use(["/health", "/fabric"], (_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
  app.use(healthRouter);
  app.use(fabricRouter);
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
