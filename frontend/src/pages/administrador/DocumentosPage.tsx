import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { DocumentListItem } from "@/components/shared/DocumentListItem"
import { listDocuments, type DocumentSummary } from "@/lib/api"

export default function DocumentosPage() {
  const { token } = useSession()

  const [documents, setDocuments] = React.useState<DocumentSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // Todos los documentos (hasta 100); el backend envía la huella enmascarada.
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los documentos.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Documentos registrados</h1>
        <p className="text-sm text-muted-foreground">
          Huellas criptográficas SHA-256 generadas
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : documents === null ? (
        <p className="text-sm text-muted-foreground">Cargando documentos…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay documentos registrados.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((doc) => (
            <DocumentListItem
              key={doc.documentId}
              document={doc}
              canViewFullHash={false}
              showResponsible
              copyableId
            />
          ))}
        </div>
      )}
    </div>
  )
}
