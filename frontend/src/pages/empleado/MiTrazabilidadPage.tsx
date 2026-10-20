import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { TraceabilityTimeline } from "@/components/shared/TraceabilityTimeline"
import { getDocumentEvents, listDocuments, type DocumentEvent } from "@/lib/api"

export default function MiTrazabilidadPage() {
  const { token } = useSession()

  const [events, setEvents] = React.useState<DocumentEvent[] | null>(null)
  const [documentNames, setDocumentNames] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<string | null>(null)
  const [partialWarning, setPartialWarning] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    // El Empleado no tiene GET /events: se arma con la trazabilidad de cada documento suyo.
    async function load(authToken: string) {
      const documents = await listDocuments(authToken)
      // allSettled: si falla un documento, se muestran igual los demás.
      const results = await Promise.allSettled(
        documents.map((doc) => getDocumentEvents(authToken, doc.documentId))
      )
      const failed = results.filter((r) => r.status === "rejected")
      if (documents.length > 0 && failed.length === documents.length) {
        throw failed[0].reason
      }
      if (failed.length > 0) {
        setPartialWarning(
          `No se pudo cargar la trazabilidad de ${failed.length} de tus ${documents.length} documentos. Intenta de nuevo más tarde.`
        )
      }
      setDocumentNames(Object.fromEntries(documents.map((d) => [d.documentId, d.name])))
      const loaded = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      // Más reciente primero.
      setEvents(loaded.sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
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
        <>
          {partialWarning && <p className="text-sm text-destructive">{partialWarning}</p>}
          <TraceabilityTimeline events={events} documentNames={documentNames} />
        </>
      )}
    </div>
  )
}
