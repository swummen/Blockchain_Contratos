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
async function postAuthJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
