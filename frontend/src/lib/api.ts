import type { Role, TraceAction, TraceResult, User } from "@/types/domain"

// Único punto de contacto con el backend: el frontend nunca habla con Fabric
// ni con MongoDB (RNF-20).
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

// Los errores del backend traen { message } listo para mostrar: se propaga tal cual.
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
      // Sin plazo, un servidor que nunca responde dejaría el botón bloqueado.
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    // Error de red o de CORS: el mensaje del navegador viene en inglés.
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

// RF-055: registra la aceptación de la política de datos de esta versión.
export async function acceptPolicy(token: string, version: string): Promise<{ user: User }> {
  return postAuthJson("/auth/accept-policy", { version }, token)
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

// multipart/form-data. El campo "document" debe coincidir con
// upload.single("document") en backend/src/routes/documents.ts.
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
      // Más largo: el backend espera la confirmación del bloque en Fabric.
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

// Hash y estado leídos del ledger; 404 si no existe.
export async function getDocument(token: string, documentId: string): Promise<DocumentLookup> {
  return getAuthJson(`/documents/${encodeURIComponent(documentId)}`, token)
}

export interface DocumentSummary {
  documentId: string
  name: string
  responsibleUser: string
  /** Cae al userId si el usuario no existe. */
  responsibleName: string
  registeredAt: string
  /** Completo solo para el Verificador; el backend lo enmascara para el resto. */
  hash: string
  status: "Pendiente" | "Verificado" | "Alterado"
}

// Para el Empleado, solo sus documentos. La autoridad sobre el hash sigue
// siendo getDocument() (el ledger).
export async function listDocuments(token: string): Promise<DocumentSummary[]> {
  return getAuthJson("/documents", token)
}

export interface DocumentEvent {
  documentId: string
  action: TraceAction
  user: string
  /** Cae al userId si no es un usuario registrado. */
  userName: string
  txId: string
  timestamp: string
  result?: TraceResult
}

// Ya viene en orden cronológico. Un Empleado recibe 403 si no es el dueño.
export async function getDocumentEvents(
  token: string,
  documentId: string
): Promise<DocumentEvent[]> {
  return getAuthJson(`/documents/${encodeURIComponent(documentId)}/events`, token)
}

// Trazabilidad general: los 200 eventos más recientes, del más antiguo al más nuevo.
export async function getAllEvents(token: string): Promise<DocumentEvent[]> {
  return getAuthJson("/events", token)
}

export interface DocumentsSummary {
  total: number
  pendiente: number
  verificado: number
  alterado: number
}

// Totales por estado de todos los documentos (no solo los 100 del listado).
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
      // Más largo: el backend espera la confirmación del bloque en Fabric.
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

// Gestión de usuarios (solo Administrador).
export async function listUsers(token: string): Promise<User[]> {
  return getAuthJson("/users", token)
}

// Devuelve la contraseña temporal para que el Administrador la comunique.
export async function createUser(
  token: string,
  input: UserInput
): Promise<{ user: User; temporaryPassword: string }> {
  return postAuthJson("/users", input, token)
}

// Si cambia el rol, el backend cierra las sesiones de ese usuario.
export async function updateUser(
  token: string,
  userId: string,
  input: UserInput
): Promise<{ user: User }> {
  return sendAuthJson("PUT", `/users/${encodeURIComponent(userId)}`, input, token)
}

// Baja lógica (no hay reactivación); cierra también sus sesiones.
export async function deactivateUser(token: string, userId: string): Promise<void> {
  await postAuthJson(`/users/${encodeURIComponent(userId)}/deactivate`, undefined, token)
}
