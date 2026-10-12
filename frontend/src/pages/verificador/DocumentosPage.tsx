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
    // RF-37/38 (HU-015): para el Verificador, GET /documents no se acota por
    // dueño — trae todos (hasta 100), con la huella completa (RF-27) y el
    // nombre del responsable.
    listDocuments(token)
      .then(setDocuments)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los documentos.")
      })
  }, [token])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Todos los documentos</h1>
        <p className="text-sm text-muted-foreground">
          Vista de solo lectura de documentos registrados
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : documents === null ? (
        <p className="text-sm text-muted-foreground">Cargando documentos…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay documentos registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentListItem
              key={doc.documentId}
              document={doc}
              canViewFullHash
              showResponsible
              copyableId
            />
          ))}
        </div>
      )}
    </div>
  )
}
