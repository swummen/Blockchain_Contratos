function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? 8080);
  if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
    throw new Error(
      `PORT inválido: "${raw}". Debe ser un entero entre 1 y 65535.`,
    );
  }
  return port;
}

function parseBcryptRounds(raw: string | undefined): number {
  const rounds = Number(raw ?? 10);
  if (!Number.isInteger(rounds) || rounds < 4 || rounds > 15) {
    throw new Error(
      `BCRYPT_ROUNDS inválido: "${raw}". Debe ser un entero entre 4 y 15.`,
    );
  }
  return rounds;
}

export const env = {
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017",
  bcryptRounds: parseBcryptRounds(process.env.BCRYPT_ROUNDS),
};
