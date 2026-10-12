import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { TraceabilityTable } from "@/components/shared/TraceabilityTable"
import { getAllEvents, listDocuments, type DocumentEvent } from "@/lib/api"

export default function TrazabilidadPage() {
  const { token } = useSession()

  const [events, setEvents] = React.useState<DocumentEvent[] | null>(null)
  const [documentNames, setDocumentNames] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // RF-50/51 (HU-020): mismo GET /events y mismo nivel de detalle que el
    // Verificador (HU-020-CA-02). El listado solo aporta nombres legibles.
    getAllEvents(token)
      .then((all) => {
        if (!cancelled) setEvents([...all].reverse())
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la trazabilidad.")
        }
      })
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) {
          setDocumentNames(Object.fromEntries(docs.map((d) => [d.documentId, d.name])))
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Historial de trazabilidad</h1>
        <p className="text-sm text-muted-foreground">
          Registro de todas las acciones por documento · RF-22 / RF-40 / RF-51
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : events === null ? (
        <p className="text-sm text-muted-foreground">Cargando trazabilidad…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay acciones registradas.</p>
      ) : (
        <TraceabilityTable events={events} documentNames={documentNames} />
      )}
    </div>
  )
}
