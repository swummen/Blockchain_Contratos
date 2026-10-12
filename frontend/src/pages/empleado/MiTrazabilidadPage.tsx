import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { TraceabilityTimeline } from "@/components/shared/TraceabilityTimeline"
import { getDocumentEvents, listDocuments, type DocumentEvent } from "@/lib/api"

export default function MiTrazabilidadPage() {
  const { token } = useSession()

  const [events, setEvents] = React.useState<DocumentEvent[] | null>(null)
  const [documentNames, setDocumentNames] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    // RF-21/22 (HU-009): el Empleado no tiene acceso a GET /events (solo
    // Verificador/Administrador) — su trazabilidad se arma con la de cada
    // uno de sus documentos, que el backend ya acota a los propios.
    async function load(authToken: string) {
      const documents = await listDocuments(authToken)
      const perDocument = await Promise.all(
        documents.map((doc) => getDocumentEvents(authToken, doc.documentId))
      )
      setDocumentNames(Object.fromEntries(documents.map((d) => [d.documentId, d.name])))
      // Más reciente primero, mismo orden que mostraba el mock.
      setEvents(perDocument.flat().sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
    }
    load(token).catch((err) => {
      setError(err instanceof Error ? err.message : "No se pudo cargar tu trazabilidad.")
    })
  }, [token])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Mi trazabilidad</h1>
        <p className="text-sm text-muted-foreground">
          Historial de acciones sobre tus documentos
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : events === null ? (
        <p className="text-sm text-muted-foreground">Cargando trazabilidad…</p>
      ) : (
        <TraceabilityTimeline events={events} documentNames={documentNames} />
      )}
    </div>
  )
}
