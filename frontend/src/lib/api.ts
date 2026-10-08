import type { Role, User } from "@/types/domain"

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

// El backend siempre responde { message } en error — se propaga tal cual, ya
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
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      // Sin esto, un servidor que acepta la conexión pero nunca responde
      // deja la promesa colgada para siempre — el botón de submit (o el
      // logout) quedaría deshabilitado sin salida. AbortSignal.timeout es
      // nativo, sin librería nueva.
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    // fetch() rechaza (sin llegar a res.ok) si el backend no responde, hay
    // un problema de red o de CORS — el mensaje nativo del navegador viene
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

export async function login(email: string, password: string, role: Role): Promise<void> {
  await postAuthJson("/auth/login", { email, password, role })
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

// multipart/form-data, no JSON — no puede pasar por postAuthJson (fija
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

// RF-25/26 (HU-010/011): no hay todavía ningún listado de documentos (Sprint
// 4), así que esto se busca por el identificador exacto, no se elige de una
// lista — 404 si no existe (HU-010-CA-02).
export async function getDocument(token: string, documentId: string): Promise<DocumentLookup> {
  return getAuthJson(`/documents/${encodeURIComponent(documentId)}`, token)
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
