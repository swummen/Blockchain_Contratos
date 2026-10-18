// Crea los usuarios de prueba (idempotente). La contraseña es de desarrollo,
// no un secreto. Uso: npm run seed, o lo corre docker/up.sh dentro del contenedor.
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { closeMongo, connectMongo } from "../repositories/mongoClient";
import {
  ensureIndexes,
  insertUserIfMissing,
  UserDoc,
} from "../repositories/userRepository";

const DEV_PASSWORD = "Contratos123!";

// Dos Empleados para poder probar que uno no ve la trazabilidad del otro (RF-21 CA-02).
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

// Con SEED_EMAIL=buzon@gmail.com cada usuario recibe buzon+<alias>@gmail.com:
// correos distintos para el índice único que llegan al mismo buzón real.
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
