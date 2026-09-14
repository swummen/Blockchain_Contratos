function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? 8080);
  if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
    throw new Error(
      `PORT inválido: "${raw}". Debe ser un entero entre 1 y 65535.`,
    );
  }
  return port;
}

export const env = {
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017",
};
