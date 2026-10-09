import * as React from "react"
import { FileText, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useSession } from "@/context/SessionContext"
import { listDocuments, type DocumentSummary } from "@/lib/api"
import { formatDateTime } from "@/lib/format"

// RF-018 (Sprint 4 T6): antes esta pantalla mostraba el mock de
// AppDataContext. Pedido de Sofia (ver para_sofi.md, sección 3 — "el
// problema del ID del documento"): el empleado solo veía su documentId una
// vez, en la pantalla de éxito de la carga; si no lo copiaba ahí, no había
// forma de recuperarlo. Conectada al backend real (GET /documents, ya
// acotado por rol del lado del servidor), el empleado puede volver a ver y
// copiar el id de cualquier documento suyo en cualquier momento.
function CopyIdButton({ documentId }: { documentId: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(documentId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Sin permiso de clipboard o navegador sin la API — el id ya está
      // visible y seleccionable a mano.
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="size-3.5" />
      {copied ? "Copiado" : "Copiar ID"}
    </Button>
  )
}

function DocumentCard({ doc }: { doc: DocumentSummary }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{doc.name}</p>
            <p className="text-xs text-muted-foreground">
              Registrado el {formatDateTime(doc.registeredAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={doc.status} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="block flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground/80">
          {doc.documentId}
        </code>
        <CopyIdButton documentId={doc.documentId} />
      </div>
    </div>
  )
}

export default function MisDocumentosPage() {
  const { token } = useSession()

  const [documents, setDocuments] = React.useState<DocumentSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

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

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!error && documents === null && (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      )}

      {documents !== null && documents.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no has cargado ningún documento.
        </p>
      )}

      {documents !== null && documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.documentId} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
