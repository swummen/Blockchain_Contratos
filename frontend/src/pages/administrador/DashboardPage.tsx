import { useAppData } from "@/context/AppDataContext"
import { KpiCard } from "@/components/shared/KpiCard"
import { formatDateTime } from "@/lib/format"
import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const ACTION_LABEL: Record<string, string> = {
  registro: "Carga de documento",
  verificacion: "Verificación de integridad",
}

export default function DashboardPage() {
  const { documents, events } = useAppData()

  const total = documents.length
  const verificados = documents.filter((d) => d.status === "Verificado").length
  const pendientes = documents.filter((d) => d.status === "Pendiente").length
  const alterados = documents.filter((d) => d.status === "Alterado").length

  const recent = [...events]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Resumen del sistema</h1>
        <p className="text-sm text-muted-foreground">Vista general del estado documental</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total documentos" value={total} icon={FileText} />
        <KpiCard label="Verificados" value={verificados} icon={CheckCircle2} tone="success" />
        <KpiCard label="Pendientes" value={pendientes} icon={Clock} tone="warning" />
        <KpiCard label="Alterados" value={alterados} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Actividad reciente</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {recent.map((event) => (
            <li key={event.eventId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {event.documentId} — {ACTION_LABEL[event.action]}
                </p>
                <p className="text-xs text-muted-foreground">{event.user}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
