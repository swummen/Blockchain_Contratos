// Siembra los usuarios de prueba de Sprint 1 (identity, T1): uno por rol, con
// contraseña de desarrollo hasheada. Reemplaza a frontend/src/data/users.ts
// como fuente real para el login hasta que HU-018 (Sprint 4) le dé al
// Administrador el alta real de usuarios: ver claude_docs/tasks/plan-sprint1-identity.md
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

// Un usuario por rol alcanzaba para probar el login de Sprint 1; Sprint 4
// (T3) agrega un segundo Empleado (mismo usuario que ya tenía mockeado
// frontend/src/data/users.ts como U002), sin esto, el chequeo de "un
// Empleado no puede ver la trazabilidad de otro" (RF-21-CA-02) no se podía
// probar en vivo, solo con mocks. U004 (Verificador en el mock) sigue sin
// sembrarse: no hace falta un segundo usuario de ese rol para nada que
// el backend necesite probar hoy.
const SEED_USERS: Array<Omit<UserDoc, "passwordHash">> = [
  {
    _id: "U001",
    name: "María López",
    email: "m.lopez@empresa.com",
    role: "Empleado",
    status: "Activo",
  },
  {
    _id: "U002",
    name: "Carlos Ruiz",
    email: "c.ruiz@empresa.com",
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

// Con SEED_EMAIL=buzon@gmail.com, cada usuario sembrado recibe
// buzon+<alias>@gmail.com: direcciones distintas para el índice único, pero
// todas llegan al mismo buzón real (subaddressing de Gmail), así el OTP
// enviado por el proveedor SMTP se puede leer de verdad. Sin SEED_EMAIL se
// conservan los correos ficticios @empresa.com.
const SEED_ALIASES: Record<string, string> = {
  U001: "empleado",
  U002: "empleado2",
  U003: "verificador",
  U005: "admin",
};

export function seedEmail(userId: string, fallback: string, base = process.env.SEED_EMAIL): string {
  const [local, domain] = (base ?? "").trim().split("@");
  if (!local || !domain) return fallback;
  return `${local}+${SEED_ALIASES[userId]}@${domain}`;
}

async function main() {
  await connectMongo();
  await ensureIndexes();

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, env.bcryptRounds);
  for (const user of SEED_USERS) {
    const email = seedEmail(user._id, user.email);
    await insertUserIfMissing({ ...user, email, passwordHash });
    console.log(`Usuario listo: ${email} (${user.role})`);
  }

  console.log(`\nContraseña de desarrollo para los ${SEED_USERS.length}: "${DEV_PASSWORD}" (ver backend/README.md)`);
  await closeMongo();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fallo al sembrar usuarios:", err);
    process.exit(1);
  });
}
