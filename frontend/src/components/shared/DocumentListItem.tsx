import { FileText } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { HashDisplay } from "./HashDisplay"
import { formatDateTime } from "@/lib/format"
import type { ContractDocument } from "@/types/domain"

interface DocumentListItemProps {
  document: ContractDocument
  canViewFullHash: boolean
  showResponsible?: boolean
}

export function DocumentListItem({
  document,
  canViewFullHash,
  showResponsible = false,
}: DocumentListItemProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{document.name}</p>
            <p className="text-xs text-muted-foreground">
              {document.documentId}
              {showResponsible ? ` · ${document.responsibleUser}` : ""} ·{" "}
              {document.sizeLabel} · {formatDateTime(document.registeredAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <HashDisplay
        hash={document.hash}
        canViewFull={canViewFullHash}
        className="mt-3"
      />
    </div>
  )
}
