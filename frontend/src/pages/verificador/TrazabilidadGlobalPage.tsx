import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { TraceabilityTable } from "@/components/shared/TraceabilityTable"
import { getAllEvents, listDocuments, type DocumentEvent } from "@/lib/api"

export default function TrazabilidadGlobalPage() {
  const { token } = useSession()

  const [events, setEvents] = React.useState<DocumentEvent[] | null>(null)
  const [documentNames, setDocumentNames] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    // Trazabilidad de todos los documentos; el listado solo aporta los nombres
    // y, si falla, se muestra el identificador.
    getAllEvents(token)
      .then((all) => setEvents([...all].reverse()))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "No se pudo cargar la trazabilidad.")
      })
    listDocuments(token)
      .then((docs) =>
        setDocumentNames(Object.fromEntries(docs.map((d) => [d.documentId, d.name])))
      )
      .catch(() => {})
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Trazabilidad global</h1>
        <p className="text-sm text-muted-foreground">
          Historial completo de acciones sobre todos los documentos
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : events === null ? (
        <p className="text-sm text-muted-foreground">Cargando trazabilidad…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay acciones registradas.
        </p>
      ) : (
        <TraceabilityTable events={events} documentNames={documentNames} />
      )}
    </div>
  )
}
