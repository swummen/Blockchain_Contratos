import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { KpiCard } from "@/components/shared/KpiCard"
import {
  getAllEvents,
  getDocumentsSummary,
  listDocuments,
  type DocumentEvent,
  type DocumentsSummary,
} from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const ACTION_LABEL: Record<string, string> = {
  registro: "Carga de documento",
  verificacion: "Verificación de integridad",
}

const RECENT_LIMIT = 6

export default function DashboardPage() {
  const { token } = useSession()

  const [summary, setSummary] = React.useState<DocumentsSummary | null>(null)
  const [summaryError, setSummaryError] = React.useState<string | null>(null)
  const [recent, setRecent] = React.useState<DocumentEvent[] | null>(null)
  const [recentError, setRecentError] = React.useState<string | null>(null)
  const [documentNames, setDocumentNames] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // Totales y actividad se cargan por separado: si una falla, la otra se muestra.
    getDocumentsSummary(token)
      .then((s) => {
        if (!cancelled) setSummary(s)
      })
      .catch((err) => {
        if (!cancelled) {
          setSummaryError(err instanceof Error ? err.message : "No se pudieron cargar los totales.")
        }
      })

    // GET /events ya viene ordenado de más antiguo a más reciente.
    getAllEvents(token)
      .then((events) => {
        if (!cancelled) setRecent(events.slice(-RECENT_LIMIT).reverse())
      })
      .catch((err) => {
        if (!cancelled) {
          setRecentError(err instanceof Error ? err.message : "No se pudo cargar la actividad reciente.")
        }
      })

    // Solo para mostrar nombres de archivo; si falla se muestra el identificador.
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) {
          setDocumentNames(Object.fromEntries(docs.map((d) => [d.documentId, d.name])))
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Resumen del sistema</h1>
        <p className="text-sm text-muted-foreground">Vista general del estado documental</p>
      </div>

      {summaryError ? (
        <p className="text-sm text-destructive">{summaryError}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total documentos" value={summary?.total ?? "..."} icon={FileText} />
          <KpiCard
            label="Verificados"
            value={summary?.verificado ?? "..."}
            icon={CheckCircle2}
            tone="success"
          />
          <KpiCard label="Pendientes" value={summary?.pendiente ?? "..."} icon={Clock} tone="warning" />
          <KpiCard
            label="Alterados"
            value={summary?.alterado ?? "..."}
            icon={AlertTriangle}
            tone="destructive"
          />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Actividad reciente</h2>
        {recentError ? (
          <p className="text-sm text-destructive">{recentError}</p>
        ) : recent === null ? (
          <p className="text-sm text-muted-foreground">Cargando actividad…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay acciones registradas.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {recent.map((event) => (
              <li key={event.txId} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {documentNames[event.documentId] ?? event.documentId} ·{" "}
                    {ACTION_LABEL[event.action]}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.userName}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(event.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
