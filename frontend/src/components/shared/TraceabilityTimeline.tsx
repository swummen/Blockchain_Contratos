import { formatDateTime } from "@/lib/format"
import type { TraceEvent } from "@/types/domain"

const ACTION_LABEL: Record<TraceEvent["action"], string> = {
  registro: "Carga de documento",
  verificacion: "Verificación de integridad",
}

export function TraceabilityTimeline({ events }: { events: TraceEvent[] }) {
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
        <li key={event.eventId} className="relative">
          <span className="absolute top-1.5 -left-[1.45rem] size-2.5 rounded-full border-2 border-background bg-primary" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {ACTION_LABEL[event.action]}
                {event.result === "comprometida" && (
                  <span className="ml-2 text-xs font-normal text-destructive">
                    (Alterado)
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)} · TX: {event.txId}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {event.documentId}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
