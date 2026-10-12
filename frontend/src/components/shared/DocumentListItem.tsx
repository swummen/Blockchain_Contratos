import { FileText } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { HashDisplay } from "./HashDisplay"
import { CopyButton } from "./CopyButton"
import { formatDateTime } from "@/lib/format"
import type { ContractDocument } from "@/types/domain"

// Acepta tanto el listado real (`GET /documents`: trae hash y nombre del
// responsable, no el tamaño) como el mock que todavía usan algunas pantallas
// (trae tamaño, no `responsibleName`). Lo que falte simplemente no se muestra.
type ListedDocument = Omit<ContractDocument, "hash" | "sizeLabel"> &
  Partial<Pick<ContractDocument, "hash" | "sizeLabel">> & { responsibleName?: string }

interface DocumentListItemProps {
  document: ListedDocument
  canViewFullHash: boolean
  showResponsible?: boolean
  /** Muestra el identificador completo con un botón para copiarlo. */
  copyableId?: boolean
}

export function DocumentListItem({
  document,
  canViewFullHash,
  showResponsible = false,
  copyableId = false,
}: DocumentListItemProps) {
  const details = [
    copyableId ? null : document.documentId,
    showResponsible ? (document.responsibleName ?? document.responsibleUser) : null,
    document.sizeLabel,
    formatDateTime(document.registeredAt),
  ].filter(Boolean)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{document.name}</p>
            <p className="text-xs text-muted-foreground">{details.join(" · ")}</p>
          </div>
        </div>
        <StatusBadge status={document.status} />
      </div>
      {copyableId && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Identificador del documento
          </p>
          <div className="flex items-center gap-2">
            <code className="block flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground/80">
              {document.documentId}
            </code>
            <CopyButton value={document.documentId} />
          </div>
        </div>
      )}
      {document.hash && (
        <HashDisplay
          hash={document.hash}
          canViewFull={canViewFullHash}
          className="mt-3"
        />
      )}
    </div>
  )
}
