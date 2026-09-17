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
