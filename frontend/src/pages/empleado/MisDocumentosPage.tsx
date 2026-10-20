import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { DocumentListItem } from "@/components/shared/DocumentListItem"
import { listDocuments, type DocumentSummary } from "@/lib/api"

// RF-18: el Empleado puede ver y copiar en cualquier momento el identificador de sus documentos.
export default function MisDocumentosPage() {
  const { token } = useSession()

  const [documents, setDocuments] = React.useState<DocumentSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // El backend ya devuelve solo los documentos del Empleado.
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar tus documentos.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Mis documentos</h1>
        <p className="text-sm text-muted-foreground">
          Documentos que has cargado al sistema
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : documents === null ? (
        <p className="text-sm text-muted-foreground">Cargando documentos…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no has cargado ningún documento.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentListItem
              key={doc.documentId}
              document={doc}
              canViewFullHash={false}
              copyableId
            />
          ))}
        </div>
      )}
    </div>
  )
}
