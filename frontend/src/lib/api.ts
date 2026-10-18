import type { Role, TraceAction, TraceResult, User } from "@/types/domain"

// Único punto de contacto con el backend (RNF-20): el frontend nunca le
// habla a Fabric ni a Mongo directamente, siempre a través de esta URL.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

export interface HealthStatus {
  status: string
  mongo: string
}

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/health`)
  if (!res.ok) {
    throw new Error(`El backend respondió ${res.status}`)
  }
  return res.json()
}

// El backend siempre responde { message } en error, se propaga tal cual, ya
// son mensajes pensados para mostrarse. Compartido por los helpers de abajo
// (JSON y multipart) para no repetir el mismo parseo 4 veces.
async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message ?? `El backend respondió ${res.status}`)
  }
  return data as T
}

async function postAuthJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  return sendAuthJson("POST", path, body, token)
}

async function sendAuthJson<T>(
  method: "POST" | "PUT",
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      // Sin esto, un servidor que acepta la conexión pero nunca responde
      // deja la promesa colgada para siempre, el botón de submit (o el
      // logout) quedaría deshabilitado sin salida. AbortSignal.timeout es
      // nativo, sin librería nueva.
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    // fetch() rechaza (sin llegar a res.ok) si el backend no responde, hay
    // un problema de red o de CORS, el mensaje nativo del navegador viene
    // en inglés ("Failed to fetch"), así que se normaliza acá.
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.")
  }
  return parseJsonResponse<T>(res)
}

async function getAuthJson<T>(path: string, token: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.")
  }
  return parseJsonResponse<T>(res)
}

export async function login(email: string, password: string): Promise<void> {
  await postAuthJson("/auth/login", { email, password })
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<{ token: string; user: User }> {
  return postAuthJson("/auth/verify-otp", { email, code })
}

export async function logout(token: string): Promise<void> {
  await postAuthJson("/auth/logout", undefined, token)
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await postAuthJson("/auth/change-password", { currentPassword, newPassword }, token)
}

export interface UploadDocumentResult {
  documentId: string
}

// multipart/form-data, no JSON, no puede pasar por postAuthJson (fija
// Content-Type: application/json). El campo se llama "document" porque así
// lo espera `upload.single("document")` en backend/src/routes/documents.ts.
export async function uploadDocument(
  token: string,
  file: File
): Promise<UploadDocumentResult> {
  const formData = new FormData()
  formData.append("document", file)

  let res: Response
  try {
    res = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      // Más largo que el de postAuthJson: además del round-trip HTTP, el
      // backend espera un commit real de la red blockchain antes de
      // responder (ver COMMIT_TIMEOUT_MS en el gateway del backend).
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.")
  }
  return parseJsonResponse<UploadDocumentResult>(res)
}

export interface DocumentLookup {
  documentId: string
  name?: string
  responsibleUser?: string
  registeredAt?: string
  hash: string
  status: "Pendiente" | "Verificado" | "Alterado"
}

// RF-25/26 (HU-010/011): consulta puntual por identificador exacto, 404 si
// no existe (HU-010-CA-02). Es la fuente real de hash/status (el ledger es
// la autoridad); `listDocuments` de abajo es solo para elegir cuál consultar.
export async function getDocument(token: string, documentId: string): Promise<DocumentLookup> {
  return getAuthJson(`/documents/${encodeURIComponent(documentId)}`, token)
}

export interface DocumentSummary {
  documentId: string
  name: string
  responsibleUser: string
  /** Nombre legible del responsable (cae al userId si el usuario no existe). */
  responsibleName: string
  registeredAt: string
  /** Completo para Verificador/Administrador, ya enmascarado por el backend para el Empleado. */
  hash: string
  status: "Pendiente" | "Verificado" | "Alterado"
}

// Listado (Sprint 3 T5, ampliado en Sprint 4): para el Empleado, solo sus
// documentos. El hash es la copia de Mongo: antes de verificar, la fuente
// real sigue siendo getDocument() (el ledger).
export async function listDocuments(token: string): Promise<DocumentSummary[]> {
  return getAuthJson("/documents", token)
}

export interface DocumentEvent {
  documentId: string
  action: TraceAction
  user: string
  /** Nombre legible de `user` (cae al userId si no es un usuario registrado). */
  userName: string
  txId: string
  timestamp: string
  result?: TraceResult
}

// RF-21/22 (HU-009): trazabilidad de un documento, ya ordenada
// cronológicamente por el backend. Un Empleado solo puede pedir la de sus
// propios documentos (403 si no).
export async function getDocumentEvents(
  token: string,
  documentId: string
): Promise<DocumentEvent[]> {
  return getAuthJson(`/documents/${encodeURIComponent(documentId)}/events`, token)
}

// RF-39/40/50/51 (HU-016/020): trazabilidad general, solo Verificador y
// Administrador. Ya ordenada cronológicamente (más antiguo primero) y acotada
// a los 200 eventos más recientes por el backend.
export async function getAllEvents(token: string): Promise<DocumentEvent[]> {
  return getAuthJson("/events", token)
}

export interface DocumentsSummary {
  total: number
  pendiente: number
  verificado: number
  alterado: number
}

// RF-41/42 (HU-017): totales reales por estado, solo Administrador. Contados
// en Mongo con un aggregate: nunca limitados a los 100 de listDocuments.
export async function getDocumentsSummary(token: string): Promise<DocumentsSummary> {
  return getAuthJson("/documents/summary", token)
}

export interface VerifyDocumentResult {
  status: "Verificado" | "Alterado"
  matches: boolean
  registeredHash: string
  computedHash: string
}

export async function verifyDocument(
  token: string,
  documentId: string,
  file: File
): Promise<VerifyDocumentResult> {
  const formData = new FormData()
  formData.append("document", file)

  let res: Response
  try {
    res = await fetch(`${API_URL}/documents/${encodeURIComponent(documentId)}/verifications`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      // Mismo motivo que uploadDocument: el backend espera el commit real de
      // RecordVerification en la blockchain antes de responder.
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.")
  }
  return parseJsonResponse<VerifyDocumentResult>(res)
}

export interface UserInput {
  name: string
  email: string
  role: Role
}

// RF-43…47 (HU-018): gestión de usuarios, solo Administrador.
export async function listUsers(token: string): Promise<User[]> {
  return getAuthJson("/users", token)
}

// D7b: el usuario nuevo entra con una contraseña temporal fija que el
// backend devuelve para que el Administrador se la comunique.
export async function createUser(
  token: string,
  input: UserInput
): Promise<{ user: User; temporaryPassword: string }> {
  return postAuthJson("/users", input, token)
}

// Si cambia el rol, el backend cierra las sesiones abiertas de ese usuario
// (el rol viaja en el JWT), tendrá que volver a iniciar sesión.
export async function updateUser(
  token: string,
  userId: string,
  input: UserInput
): Promise<{ user: User }> {
  return sendAuthJson("PUT", `/users/${encodeURIComponent(userId)}`, input, token)
}

// RF-47: baja lógica, sin reactivación. Corta también sus sesiones abiertas.
export async function deactivateUser(token: string, userId: string): Promise<void> {
  await postAuthJson(`/users/${encodeURIComponent(userId)}/deactivate`, undefined, token)
}
