import { formatDateTime } from "@/lib/format"
import type { TraceEvent } from "@/types/domain"

const ACTION_LABEL: Record<TraceEvent["action"], string> = {
  registro: "Carga de documento",
  verificacion: "Verificación de integridad",
}

// Los eventos reales del ledger no traen eventId (el mock sí) — el txId ya
// es único por evento (una transacción escribe un solo evento).
type TimelineEvent = Omit<TraceEvent, "eventId">

interface TraceabilityTimelineProps {
  events: TimelineEvent[]
  /** documentId → nombre legible; si falta, se muestra el identificador. */
  documentNames?: Record<string, string>
}

export function TraceabilityTimeline({ events, documentNames }: TraceabilityTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay acciones registradas.
      </p>
    )
  }

  return (
    <ol className="space-y-5 border-l border-border pl-5">
      {events.map((event) => (
        <li key={event.txId} className="relative">
          <span className="absolute top-1.5 -left-[1.45rem] size-2.5 rounded-full border-2 border-background bg-primary" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {ACTION_LABEL[event.action]}
                {event.result === "comprometida" && (
                  <span className="ml-2 text-xs font-normal text-destructive">
                    (Alterado)
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)} · TX: {event.txId}
              </p>
            </div>
            <span className="max-w-[45%] shrink-0 truncate text-xs font-medium text-muted-foreground">
              {documentNames?.[event.documentId] ?? event.documentId}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
