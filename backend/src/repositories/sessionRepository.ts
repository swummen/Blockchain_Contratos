import { Collection } from "mongodb";
import { getDb } from "./mongoClient";
import { Role } from "./userRepository";

// _id es el jti del JWT: el middleware de T4 valida firma+expiración del
// token Y que su jti siga existiendo acá — es lo que permite invalidar una
// sesión de verdad en el logout (D4 del plan), algo que un JWT puramente
// stateless no puede hacer.
export interface SessionDoc {
  _id: string;
  userId: string;
  // Informativo (auditoría/listado de sesiones). El claim `role` del JWT ya
  // firmado es la fuente autoritativa para el middleware RBAC de T4 — no
  // releer este campo para decidir acceso, un cambio de rol post-login lo
  // dejaría desincronizado del token que el cliente sigue usando.
  role: Role;
  // Tope absoluto (D4 del plan): vence a los jwtExpiresMinutes del login,
  // sin importar actividad. RNF-07 (15 min de inactividad) es un tope
  // *distinto* y más corto — ver lastSeenAt.
  expiresAt: Date;
  // RNF-07: se actualiza en cada request autenticado (requireAuth) para
  // medir inactividad, independiente de expiresAt.
  lastSeenAt: Date;
}

function sessionsCollection(): Collection<SessionDoc> {
  return getDb().collection<SessionDoc>("sessions");
}

// TTL sobre expiresAt (mismo patrón que otp_codes, D5): una sesión vencida
// desaparece sola, sin depender de que alguien llame a logout.
export async function ensureIndexes(): Promise<void> {
  await sessionsCollection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function createSession(session: SessionDoc): Promise<void> {
  await sessionsCollection().insertOne(session);
}

export async function findSessionByJti(jti: string): Promise<SessionDoc | null> {
  return sessionsCollection().findOne({ _id: jti });
}

// RNF-07: refresca la marca de actividad en cada request autenticado — es
// lo que hace que la sesión venza por inactividad y no solo por el tope
// absoluto de expiresAt.
export async function touchSession(jti: string): Promise<void> {
  await sessionsCollection().updateOne({ _id: jti }, { $set: { lastSeenAt: new Date() } });
}

export async function deleteSession(jti: string): Promise<void> {
  await sessionsCollection().deleteOne({ _id: jti });
}

// Sprint 4 T5 (hallazgo de review): sin esto, desactivar a un usuario no le
// revoca las sesiones ya abiertas — requireAuth solo valida que el jti exista
// acá, nunca relee `status`, así que seguiría con acceso hasta que su JWT
// expire por su cuenta (hasta jwtExpiresMinutes).
export async function deleteSessionsByUserId(userId: string): Promise<void> {
  await sessionsCollection().deleteMany({ userId });
}
