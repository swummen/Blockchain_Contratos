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

// El backend (backend/src/routes/auth.ts) siempre responde { message } en
// error — se propaga tal cual, ya son mensajes pensados para mostrarse.
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
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message ?? `El backend respondió ${res.status}`)
  }
  return data as T
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
      // Más largo que el de postAuthJson: además del round-trip HTTP, este
      // endpoint espera el commit real del bloque en Fabric antes de
      // responder (backend/src/fabric/gateway.ts, COMMIT_TIMEOUT_MS=15s).
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message ?? `El backend respondió ${res.status}`)
  }
  return data as UploadDocumentResult
}
