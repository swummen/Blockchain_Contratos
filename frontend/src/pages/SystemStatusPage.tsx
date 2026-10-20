import * as React from "react"
import { getHealth, type HealthStatus } from "@/lib/api"

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthStatus }
  | { kind: "error"; message: string }

/** Diagnóstico de infraestructura, fuera del flujo de login (HU-021). */
export default function SystemStatusPage() {
  const [state, setState] = React.useState<LoadState>({ kind: "loading" })

  React.useEffect(() => {
    let cancelled = false
    getHealth()
      .then((data) => {
        if (!cancelled) setState({ kind: "ok", data })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ kind: "error", message: err instanceof Error ? err.message : String(err) })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Estado del sistema</h1>

      {state.kind === "loading" && <p className="text-muted-foreground">Consultando backend...</p>}

      {state.kind === "ok" && (
        <ul className="space-y-1">
          <li>
            Backend:{" "}
            <span className={state.data.status === "ok" ? "text-green-600" : "text-red-600"}>
              {state.data.status}
            </span>
          </li>
          <li>
            Mongo:{" "}
            <span className={state.data.mongo === "connected" ? "text-green-600" : "text-red-600"}>
              {state.data.mongo}
            </span>
          </li>
        </ul>
      )}

      {state.kind === "error" && (
        <p className="text-red-600">No se pudo conectar al backend: {state.message}</p>
      )}
    </main>
  )
}
