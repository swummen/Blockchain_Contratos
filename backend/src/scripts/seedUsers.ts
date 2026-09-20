// Siembra los usuarios de prueba de Sprint 1 (identity, T1): uno por rol, con
// contraseña de desarrollo hasheada. Reemplaza a frontend/src/data/users.ts
// como fuente real para el login hasta que HU-018 (Sprint 4) le dé al
// Administrador el alta real de usuarios — ver claude_docs/tasks/plan-sprint1-identity.md
// (D9). Contraseña de desarrollo documentada en backend/README.md, nunca acá
// como secreto real.
//
// Uso: npm run seed (requiere Mongo arriba y MONGO_URI configurado, ver .env.example).
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { closeMongo, connectMongo } from "../repositories/mongoClient";
import {
  ensureIndexes,
  insertUserIfMissing,
  UserDoc,
} from "../repositories/userRepository";

const DEV_PASSWORD = "Contratos123!";

// Un usuario por rol alcanza para probar el login de Sprint 1; no se siembran
// todos los mocks de frontend/src/data/users.ts (deliberadamente se omiten
// U002/U004, ambos Empleado como U001).
const SEED_USERS: Array<Omit<UserDoc, "passwordHash">> = [
  {
    _id: "U001",
    name: "María López",
    email: "m.lopez@empresa.com",
    role: "Empleado",
    status: "Activo",
  },
  {
    _id: "U003",
    name: "Pedro Gómez",
    email: "p.gomez@empresa.com",
    role: "Verificador",
    status: "Activo",
  },
  {
    _id: "U005",
    name: "Laura Diaz",
    email: "admin@empresa.com",
    role: "Administrador",
    status: "Activo",
  },
];

async function main() {
  await connectMongo();
  await ensureIndexes();

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, env.bcryptRounds);
  for (const user of SEED_USERS) {
    await insertUserIfMissing({ ...user, passwordHash });
    console.log(`Usuario listo: ${user.email} (${user.role})`);
  }

  console.log(`\nContraseña de desarrollo para los 3: "${DEV_PASSWORD}" (ver backend/README.md)`);
  await closeMongo();
}

main().catch((err) => {
  console.error("Fallo al sembrar usuarios:", err);
  process.exit(1);
});
